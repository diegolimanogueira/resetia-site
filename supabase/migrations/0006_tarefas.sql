-- 0006 · Tarefas do servidor (envio do relatório, dicas) com estado persistente, e limites atômicos.
--
-- Depois que o servidor aceita o contato, o envio do e-mail e a geração das dicas não dependem mais de o visitante
-- voltar: cada uma é uma tarefa com estado, tentativas e espera crescente, processada na hora e, se falhar, por um
-- agendador (docs/deploy.md). ADITIVA. Reversão: as tabelas novas podem ficar vazias; `emails` mantém os estados antigos.

create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('email-relatorio', 'dicas')),
  lead_id uuid not null references public.leads (id) on delete cascade,
  -- Idempotência: o mesmo pedido repetido (reenvio da fila do navegador, nova tentativa) não cria uma segunda tarefa.
  chave text not null unique check (char_length(chave) <= 120),
  -- aceito: o provedor de e-mail aceitou a mensagem (não quer dizer que chegou à caixa de entrada).
  status text not null default 'pendente'
    check (status in ('pendente', 'processando', 'aceito', 'concluida', 'nova-tentativa', 'falhou', 'nao-configurado', 'limite', 'cancelada')),
  tentativas integer not null default 0 check (tentativas >= 0),
  max_tentativas integer not null default 5 check (max_tentativas between 1 and 20),
  tentar_em timestamptz not null default now(),
  -- Trava de processamento: quem pega a tarefa a reserva por alguns minutos; se o processo morrer, ela volta à fila.
  travada_ate timestamptz,
  provedor_id text check (provedor_id is null or char_length(provedor_id) <= 200),
  ultimo_erro text check (ultimo_erro is null or char_length(ultimo_erro) <= 500),
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

create index tarefas_a_fazer on public.tarefas (tentar_em) where status in ('pendente', 'nova-tentativa', 'processando');
create index tarefas_lead on public.tarefas (lead_id);

-- Pega até `p_max` tarefas vencidas e as reserva (várias instâncias da função ao mesmo tempo não pegam a mesma).
create function public.pegar_tarefas(p_max integer default 5) returns setof public.tarefas
language plpgsql security definer set search_path = '' as $$
begin
  -- Reserva vencida sem tentativas sobrando: falhou de vez.
  update public.tarefas
  set status = 'falhou', ultimo_erro = coalesce(ultimo_erro, 'sem resposta do processamento'), travada_ate = null, atualizada_em = now()
  where status = 'processando' and travada_ate < now() and tentativas >= max_tentativas;

  return query
  with alvo as (
    select id from public.tarefas
    where (status in ('pendente', 'nova-tentativa') and tentar_em <= now())
       or (status = 'processando' and travada_ate < now())
    order by tentar_em
    limit greatest(1, least(p_max, 20))
    for update skip locked
  )
  update public.tarefas t
  set status = 'processando', tentativas = t.tentativas + 1, travada_ate = now() + interval '3 minutes', atualizada_em = now()
  from alvo
  where t.id = alvo.id
  returning t.*;
end $$;

-- Registra o resultado de uma tentativa. 'nova-tentativa' vira 'falhou' quando as tentativas acabaram; a espera
-- até a próxima é `p_em` (o chamador usa espera crescente).
create function public.concluir_tarefa(
  p_id uuid,
  p_status text,
  p_provedor_id text default null,
  p_erro text default null,
  p_em interval default interval '1 minute'
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  t public.tarefas;
  final text := p_status;
begin
  if p_status not in ('aceito', 'concluida', 'nova-tentativa', 'falhou', 'nao-configurado', 'limite', 'cancelada') then
    raise exception 'estado de tarefa inválido: %', p_status;
  end if;
  select * into t from public.tarefas where id = p_id for update;
  if not found then
    return null;
  end if;
  if p_status = 'nova-tentativa' and t.tentativas >= t.max_tentativas then
    final := 'falhou';
  end if;
  update public.tarefas set
    status = final,
    provedor_id = coalesce(p_provedor_id, provedor_id),
    ultimo_erro = left(p_erro, 500),
    tentar_em = case when final = 'nova-tentativa' then now() + p_em else tentar_em end,
    travada_ate = null,
    atualizada_em = now()
  where id = p_id;
  return final;
end $$;

-- Limites por janela de tempo, atômicos: proteção contra repetição e abuso das ações públicas da função.
create table public.limites (
  chave text not null,
  janela timestamptz not null,
  n integer not null default 0,
  primary key (chave, janela)
);

-- Conta mais um uso da `chave` na janela atual e diz se ainda está dentro do máximo.
create function public.consumir_limite(p_chave text, p_janela_segundos integer, p_maximo integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  inicio timestamptz := to_timestamp(floor(extract(epoch from now()) / p_janela_segundos) * p_janela_segundos);
  atual integer;
begin
  insert into public.limites (chave, janela, n) values (left(p_chave, 120), inicio, 1)
  on conflict (chave, janela) do update set n = public.limites.n + 1
  returning n into atual;
  return atual <= p_maximo;
end $$;

create function public.limpar_expirados() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  apagados integer;
begin
  delete from public.limites where janela < now() - interval '2 days';
  get diagnostics apagados = row_count;
  return apagados;
end $$;

-- E-mails: provedor e estados reais ---------------------------------------------------------------------------------
-- 'aceito' = o provedor aceitou a mensagem. 'enviado' continua válido só para linhas antigas (mesmo significado, dito
-- com menos cuidado). Não há confirmação de entrega: ela exigiria um webhook do provedor, que não está configurado.

alter table public.emails
  add column tarefa_id uuid references public.tarefas (id) on delete set null,
  add column provedor_id text check (provedor_id is null or char_length(provedor_id) <= 200);

alter table public.emails drop constraint if exists emails_status_check;
alter table public.emails add constraint emails_status_check
  check (status in ('enviado', 'aceito', 'falhou', 'nao-configurado'));

-- Permissões: tudo só da função (service_role); o admin lê as tarefas para ver o que está pendente ou falhou.

revoke all on public.tarefas, public.limites from anon, authenticated;
grant select on public.tarefas to authenticated;
alter table public.tarefas enable row level security;
alter table public.limites enable row level security;
create policy "admin le tarefas" on public.tarefas for select to authenticated using ((select public.eh_admin()));

revoke execute on function
  public.pegar_tarefas(integer),
  public.concluir_tarefa(uuid, text, text, text, interval),
  public.consumir_limite(text, integer, integer),
  public.limpar_expirados()
from public, anon, authenticated;
