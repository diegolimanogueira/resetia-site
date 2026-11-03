-- 0009 · Tokens de acesso: o link do relatório e a página de preferências deixam de depender do id do lead.
--
-- Antes, o link do e-mail levava `&lead=<id>` e `lead_liberado(lead, avaliação)` abria o nome e a empresa para quem
-- tivesse o par de ids, para sempre. Agora cada e-mail leva um token aleatório de finalidade restrita: só o hash dele
-- fica no banco, ele expira e pode ser revogado. O token de leitura lê (nome, empresa e a avaliação a que pertence) e
-- não altera nada; o de preferências só serve à página de preferências de contato (Fase 5). ADITIVA.
-- Reversão: as funções novas podem ficar sem uso; `lead_liberado` volta ao corpo de 0004 se for preciso.

create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  finalidade text not null check (finalidade in ('ler-relatorio', 'preferencias')),
  -- sha256 hexadecimal do token; o token em si nunca é gravado (nem aqui, nem em log).
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  revogado_em timestamptz,
  revogado_por uuid,
  usos integer not null default 0 check (usos >= 0),
  ultimo_uso_em timestamptz,
  check (expira_em > criado_em)
);

create index tokens_lead on public.tokens (lead_id, finalidade);

-- Só a função (service_role) cria tokens. Vários tokens do mesmo lead convivem: a nova tentativa de envio de um e-mail
-- gera outro token, e o do e-mail que o provedor já aceitou continua valendo até expirar ou ser revogado.
create function public.criar_token(p_lead uuid, p_finalidade text, p_hash text, p_dias integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_dias is null or p_dias < 1 or p_dias > 400 then
    raise exception 'validade inválida' using errcode = '22023';
  end if;
  insert into public.tokens (lead_id, finalidade, token_hash, expira_em)
  values (p_lead, p_finalidade, p_hash, now() + make_interval(days => p_dias));
end $$;

-- O navegador manda o token cru; o banco calcula o hash. Quem não tem um token válido, de leitura, não revogado e
-- dentro do prazo, recebe nulo (sem dizer qual dessas condições falhou). Não altera o lead.
create function public.ler_relatorio(p_token text) returns json
language plpgsql security definer set search_path = '' as $$
declare
  t public.tokens;
  l public.leads;
begin
  if p_token is null or char_length(p_token) not between 20 and 200 then
    return null;
  end if;
  select * into t from public.tokens
  where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
    and finalidade = 'ler-relatorio'
    and revogado_em is null
    and expira_em > now()
  for update;
  if not found then
    return null;
  end if;
  select * into l from public.leads where id = t.lead_id;
  if not found then
    return null;
  end if;
  update public.tokens set usos = usos + 1, ultimo_uso_em = now() where id = t.id;
  return json_build_object('nome', l.nome, 'empresa', l.empresa, 'avaliacao', l.avaliacao_id);
end $$;

-- Revogação pelo admin: todos os tokens do lead (ou só de uma finalidade). Devolve quantos foram revogados.
create function public.revogar_tokens(p_lead uuid, p_finalidade text default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n integer;
begin
  if not public.eh_admin() then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  update public.tokens set revogado_em = now(), revogado_por = auth.uid()
  where lead_id = p_lead and revogado_em is null and (p_finalidade is null or finalidade = p_finalidade);
  get diagnostics n = row_count;
  return n;
end $$;

-- Links antigos (`&lead=` no e-mail) seguem abrindo só para o que já existia: leads criados pelo navegador, sem chave,
-- há menos de 180 dias. Os leads novos não são alcançáveis por aqui: o id deles não autoriza nada.
create or replace function public.lead_liberado(p_lead uuid, p_avaliacao uuid) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object('nome', nome, 'empresa', empresa)
  from public.leads
  where id = p_lead and avaliacao_id = p_avaliacao and empresa is not null
    and chave_hash is null and canal = 'legado' and criado_em > now() - interval '180 days';
$$;

revoke all on public.tokens from anon, authenticated;
alter table public.tokens enable row level security;

revoke execute on function public.criar_token(uuid, text, text, integer) from public, anon, authenticated;
revoke execute on function public.ler_relatorio(text) from public;
grant execute on function public.ler_relatorio(text) to anon, authenticated;
revoke execute on function public.revogar_tokens(uuid, text) from public, anon;
grant execute on function public.revogar_tokens(uuid, text) to authenticated;
