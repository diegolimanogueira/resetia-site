-- Mini CRM, e-mails e dicas por IA do RESET AI Score (28/10).
--   leads: responsável, próximo contato e quando o relatório foi enviado por e-mail.
--   atividades: linha do tempo do lead (notas, ligações, WhatsApp, e-mails, mudanças de status), só para admins.
--   emails: registro de cada e-mail enviado pela função ai-score (relatório ao lead, e-mail da Reset pelo admin).
--   dicas: dicas de evolução geradas por IA por avaliação (cache), lidas e escritas só pela função (service role)
--          e lidas por admins.
--   lead_liberado(): o link do e-mail do relatório abre o relatório completo em outro aparelho, só com o par
--          (lead, avaliação) certo, que só existe no e-mail.

alter table public.leads
  add column responsavel text check (length(responsavel) <= 200),
  add column proximo_contato date,
  add column relatorio_enviado_em timestamptz;

grant update (responsavel, proximo_contato) on public.leads to authenticated;

-- Atividades ---------------------------------------------------------------------------------------------------

create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  criado_em timestamptz not null default now(),
  autor text not null default 'sistema' check (length(autor) <= 200),
  tipo text not null check (tipo in ('nota', 'ligacao', 'whatsapp', 'email', 'reuniao', 'status', 'sistema')),
  texto text not null check (length(texto) between 1 and 4000)
);

create index atividades_lead on public.atividades (lead_id, criado_em desc);

-- Autor e data do servidor: o e-mail de quem está logado; a função (service role, sem usuário) informa o autor.
create function public.atividade_ao_inserir() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.criado_em := now();
  new.autor := coalesce((select email from auth.users where id = (select auth.uid())), nullif(new.autor, ''), 'sistema');
  return new;
end $$;

create trigger atividades_ao_inserir before insert on public.atividades
  for each row execute function public.atividade_ao_inserir();

-- E-mails enviados -----------------------------------------------------------------------------------------------

create table public.emails (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('relatorio', 'reset')),
  assunto text not null check (length(assunto) <= 300),
  status text not null check (status in ('enviado', 'falhou', 'nao-configurado')),
  erro text check (length(erro) <= 1000),
  autor text not null default 'sistema' check (length(autor) <= 200)
);

create index emails_lead on public.emails (lead_id, criado_em desc);

-- Dicas por IA (cache por avaliação) ----------------------------------------------------------------------------

create table public.dicas (
  avaliacao_id uuid primary key references public.avaliacoes (id) on delete cascade,
  criado_em timestamptz not null default now(),
  -- 'gerando' é a trava enquanto a função escreve (evita gerar duas vezes a mesma avaliação).
  fonte text not null check (fonte in ('gerando', 'ia', 'biblioteca')),
  modelo text check (length(modelo) <= 100),
  conteudo jsonb check (conteudo is null or (jsonb_typeof(conteudo) = 'object' and length(conteudo::text) <= 20000))
);

-- Permissões ---------------------------------------------------------------------------------------------------

revoke all on public.atividades, public.emails, public.dicas from anon, authenticated;
grant select, insert on public.atividades to authenticated;
grant select on public.emails, public.dicas to authenticated;
revoke execute on function public.atividade_ao_inserir() from public, anon, authenticated;

alter table public.atividades enable row level security;
alter table public.emails enable row level security;
alter table public.dicas enable row level security;

create policy "admin le atividades" on public.atividades for select to authenticated using ((select public.eh_admin()));
create policy "admin registra atividade" on public.atividades for insert to authenticated
  with check ((select public.eh_admin()));
create policy "admin le emails" on public.emails for select to authenticated using ((select public.eh_admin()));
create policy "admin le dicas" on public.dicas for select to authenticated using ((select public.eh_admin()));

-- Link do e-mail do relatório ---------------------------------------------------------------------------------

create function public.lead_liberado(p_lead uuid, p_avaliacao uuid) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object('nome', nome, 'empresa', empresa)
  from public.leads
  where id = p_lead and avaliacao_id = p_avaliacao and empresa is not null;
$$;

revoke execute on function public.lead_liberado(uuid, uuid) from public;
grant execute on function public.lead_liberado(uuid, uuid) to anon, authenticated;
