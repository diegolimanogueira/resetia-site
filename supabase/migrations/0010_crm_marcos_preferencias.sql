-- 0010 · Funil comercial com marcos reais, tempo até a primeira resposta, contatos permitidos e preferências.
--
-- O funil do painel só tinha status. Aqui entram os registros mínimos para distinguir etapas reais (reunião, proposta,
-- desfecho), o momento da primeira resposta da equipe a quem pediu conversa e o que a equipe pode usar para contatar
-- cada pessoa (WhatsApp e ligação só com a escolha registrada). Valor de negócio nunca é deduzido de status: só entra
-- se a equipe informar, e fica fora do CSV. ADITIVA. Reversão: tabelas, colunas e funções novas podem ficar sem uso.

-- Primeira resposta da equipe ---------------------------------------------------------------------------------------

alter table public.leads add column primeira_resposta_em timestamptz;

-- Só conta contato humano da equipe (ligação, WhatsApp, e-mail, reunião, registrado por um admin); o que o sistema
-- registra sozinho (envio do relatório, status) não é resposta.
create function public.primeira_resposta() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.tipo in ('ligacao', 'whatsapp', 'email', 'reuniao') and new.autor <> 'sistema' then
    update public.leads set primeira_resposta_em = new.criado_em
    where id = new.lead_id and primeira_resposta_em is null;
  end if;
  return new;
end $$;

create trigger atividades_primeira_resposta after insert on public.atividades
  for each row execute function public.primeira_resposta();

-- Histórico real: a primeira atividade humana que já existe. Nada é inventado para quem não teve nenhuma.
update public.leads l set primeira_resposta_em = (
  select min(a.criado_em) from public.atividades a
  where a.lead_id = l.id and a.tipo in ('ligacao', 'whatsapp', 'email', 'reuniao') and a.autor <> 'sistema'
);

-- O momento do pedido de conversa vale também para o caminho antigo (completar_lead só liga pediu_contato).
create function public.lead_pedido_conversa() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.pediu_contato and new.pedido_conversa_em is null then
    new.pedido_conversa_em := now();
  end if;
  return new;
end $$;

create trigger leads_pedido_conversa before insert or update on public.leads
  for each row execute function public.lead_pedido_conversa();

-- Marcos do funil ---------------------------------------------------------------------------------------------------

create table public.marcos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  tipo text not null check (tipo in ('reuniao-agendada', 'reuniao-realizada', 'proposta-enviada', 'ganho', 'perdido', 'sem-resposta')),
  ocorrido_em date not null default current_date,
  -- Informado pela equipe, nunca calculado. Só admin lê; o CSV não leva por padrão.
  valor_informado numeric(14, 2) check (valor_informado is null or valor_informado >= 0),
  observacao text check (observacao is null or char_length(observacao) <= 500),
  criado_por uuid default auth.uid(),
  criado_em timestamptz not null default now()
);

create index marcos_lead on public.marcos (lead_id, ocorrido_em desc);

revoke all on public.marcos from anon, authenticated;
grant select, insert, delete on public.marcos to authenticated;
alter table public.marcos enable row level security;
create policy "admin le marcos" on public.marcos for select to authenticated using ((select public.eh_admin()));
create policy "admin registra marco" on public.marcos for insert to authenticated
  with check ((select public.eh_admin()) and criado_por = (select auth.uid()));
create policy "admin corrige marco" on public.marcos for delete to authenticated using ((select public.eh_admin()));

-- Contatos permitidos -----------------------------------------------------------------------------------------------
-- O painel pergunta aqui o que pode fazer com cada lead. O número de telefone só volta quando a pessoa escolheu ser
-- contatada por WhatsApp ou por ligação (e ele existe); sem a escolha, volta nulo.

create function public.contatos_permitidos()
returns table (lead_id uuid, email boolean, whatsapp boolean, ligacao boolean, telefone text, tem_numero boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.eh_admin() then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  return query
  select
    l.id,
    public.elegivel(l.id, 'contato-analise', 'email'),
    public.elegivel(l.id, 'contato-analise', 'whatsapp'),
    public.elegivel(l.id, 'contato-analise', 'ligacao'),
    case when public.elegivel(l.id, 'contato-analise', 'whatsapp') or public.elegivel(l.id, 'contato-analise', 'ligacao')
      then l.whatsapp end,
    l.whatsapp is not null
  from public.leads l;
end $$;

-- Reprocessar tarefa -----------------------------------------------------------------------------------------------
-- Falha definitiva, limite ou envio não configurado voltam para a fila, com as tentativas zeradas. Tarefa cancelada
-- (por falta de consentimento) não volta: reprocessar não pode criar um envio que a pessoa não pediu.

create function public.reprocessar_tarefa(p_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  n integer;
begin
  if not public.eh_admin() then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  update public.tarefas
  set status = 'pendente', tentativas = 0, tentar_em = now(), travada_ate = null, ultimo_erro = null, atualizada_em = now()
  where id = p_id and status in ('falhou', 'limite', 'nao-configurado', 'nova-tentativa');
  get diagnostics n = row_count;
  return n = 1;
end $$;

-- Preferências pelo link protegido ----------------------------------------------------------------------------------
-- Só a função (service_role) chama. O token de preferências lê as escolhas da pessoa e registra novas, sempre como
-- evento (nada é apagado), com a fonte 'preferencias' e a versão do texto. A pessoa pode conceder ou revogar as
-- próprias escolhas; a equipe só revoga. WhatsApp e ligação exigem número informado.

create function public.preferencias_do_token(p_token_hash text, p_eventos jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  t public.tokens;
  e jsonb;
  tem_numero boolean;
begin
  select * into t from public.tokens
  where token_hash = p_token_hash and finalidade = 'preferencias' and revogado_em is null and expira_em > now();
  if not found then
    return jsonb_build_object('status', 'invalido');
  end if;
  select whatsapp is not null into tem_numero from public.leads where id = t.lead_id;

  if p_eventos is not null then
    if jsonb_typeof(p_eventos) <> 'array' or jsonb_array_length(p_eventos) > 12 then
      return jsonb_build_object('status', 'campos');
    end if;
    for e in select * from jsonb_array_elements(p_eventos) loop
      if (e ->> 'canal') in ('whatsapp', 'ligacao') and (e ->> 'concedido')::boolean and not coalesce(tem_numero, false) then
        return jsonb_build_object('status', 'sem-numero');
      end if;
      insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
      values (t.lead_id, e ->> 'finalidade', e ->> 'canal', (e ->> 'concedido')::boolean, 'preferencias',
              e ->> 'texto_versao', (e ->> 'evento_id')::uuid)
      on conflict (evento_id) do nothing;
    end loop;
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'tem_numero', coalesce(tem_numero, false),
    'escolhas', (
      select coalesce(jsonb_agg(jsonb_build_object('finalidade', f, 'canal', c, 'concedido', coalesce((
        select x.concedido from public.consentimentos x
        where x.lead_id = t.lead_id and x.finalidade = f and x.canal = c order by x.criado_em desc, x.id desc limit 1), false))), '[]'::jsonb)
      from (values ('relatorio-email', 'email'), ('conteudo-email', 'email'), ('contato-analise', 'email'),
                   ('contato-analise', 'whatsapp'), ('contato-analise', 'ligacao')) as v (f, c)
    )
  );
end $$;

revoke execute on function
  public.primeira_resposta(), public.lead_pedido_conversa(), public.preferencias_do_token(text, jsonb)
from public, anon, authenticated;
revoke execute on function public.contatos_permitidos(), public.reprocessar_tarefa(uuid) from public, anon;
grant execute on function public.contatos_permitidos(), public.reprocessar_tarefa(uuid) to authenticated;
