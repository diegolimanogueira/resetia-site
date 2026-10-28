-- RESET AI Score: avaliações (anônimas), leads e o mini CRM do /admin.
--
-- Modelo de segurança: o site é estático e fala com o banco só pelo navegador, com a chave anônima (pública).
--   anon          → só INSERT em avaliacoes e leads (nada de SELECT, UPDATE ou DELETE).
--   authenticated → SELECT nas duas e UPDATE de status, notas e pediu_contato em leads, e só se estiver em
--                   public.admins. Cadastro e login anônimo ficam DESLIGADOS no painel (Auth → Sign In / Providers).
-- Os ids nascem no navegador (o anônimo não lê o que grava), então reenviar é idempotente.
-- Aplicar: SQL Editor do Supabase (ou `supabase db push`). Depois, cadastrar o admin (ver o fim do arquivo).

-- Avaliações -------------------------------------------------------------------------------------------------

create table public.avaliacoes (
  id uuid primary key,
  criada_em timestamptz not null default now(),
  escopo text not null check (escopo in ('empresa', 'marketing', 'vendas', 'customer-success')),
  papel text not null check (papel in ('ceo', 'diretor', 'gestor', 'coordenador', 'especialista', 'outro')),
  porte text not null check (porte in ('ate-10', '11-49', '50-199', '200-499', '500-mais')),
  segmento text not null
    check (segmento in ('tecnologia', 'industria', 'servicos-b2b', 'varejo', 'saude', 'educacao', 'outros')),
  -- { centrais: [0..4 | null] x12, areas: { marketing?: [...] x4, ... } }
  respostas jsonb not null check (jsonb_typeof(respostas) = 'object' and length(respostas::text) <= 2000),
  desafios text[] not null check (
    cardinality(desafios) between 1 and 2
    and desafios <@ array['comecar', 'pouco-uso', 'capacitar', 'repetitivas', 'agentes', 'custo-ferramentas',
                          'governanca', 'medir']::text[]
  ),
  horizonte text not null check (horizonte in ('imediato', '3-meses', '6-meses', 'explorando')),
  indice smallint check (indice between 0 and 100),
  nivel text check (nivel in ('inicial', 'explorando', 'desenvolvimento', 'estruturada', 'avancada')),
  parcial boolean not null,
  dimensoes jsonb not null check (jsonb_typeof(dimensoes) = 'object' and length(dimensoes::text) <= 1000),
  areas jsonb not null default '{}' check (jsonb_typeof(areas) = 'object' and length(areas::text) <= 500),
  -- As respostas codificadas (o hash do resultado): o admin recalcula tudo a partir daqui.
  codigo text not null check (length(codigo) <= 400),
  versao text not null check (versao in ('1')),
  origem jsonb not null default '{}' check (jsonb_typeof(origem) = 'object' and length(origem::text) <= 1500),
  ambiente text not null default 'producao' check (ambiente in ('producao', 'staging', 'dev')),
  check ((parcial and indice is null and nivel is null) or (not parcial and indice is not null and nivel is not null))
);

create index avaliacoes_criada_em on public.avaliacoes (criada_em desc);

-- Leads --------------------------------------------------------------------------------------------------------

create table public.leads (
  id uuid primary key,
  avaliacao_id uuid not null references public.avaliacoes (id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  nome text not null check (length(nome) between 2 and 120),
  email text not null check (length(email) <= 200 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  email_pessoal boolean not null default false,
  empresa text not null check (length(empresa) between 1 and 160),
  whatsapp text check (whatsapp ~ '^55[0-9]{10,11}$'),
  pediu_contato boolean not null default false,
  consentimento_marketing boolean not null default false,
  status text not null default 'novo'
    check (status in ('novo', 'contatado', 'qualificado', 'oportunidade', 'cliente', 'descartado')),
  notas text check (length(notas) <= 4000),
  ambiente text not null default 'producao' check (ambiente in ('producao', 'staging', 'dev'))
);

create index leads_avaliacao on public.leads (avaliacao_id);
create index leads_criado_em on public.leads (criado_em desc);

-- Datas e campos de CRM sempre do servidor: o anônimo não escolhe criado_em, status nem notas.

create function public.avaliacao_ao_inserir() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.criada_em := now();
  return new;
end $$;

create trigger avaliacoes_ao_inserir before insert on public.avaliacoes
  for each row execute function public.avaliacao_ao_inserir();

create function public.lead_ao_gravar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_em := now();
    new.status := 'novo';
    new.notas := null;
  end if;
  new.atualizado_em := now();
  return new;
end $$;

create trigger leads_ao_gravar before insert or update on public.leads
  for each row execute function public.lead_ao_gravar();

-- Admins -------------------------------------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

create function public.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- Permissões ---------------------------------------------------------------------------------------------------

revoke all on public.avaliacoes, public.leads, public.admins from anon, authenticated;
grant insert on public.avaliacoes, public.leads to anon;
grant select on public.avaliacoes, public.leads to authenticated;
grant update (status, notas, pediu_contato) on public.leads to authenticated;

revoke execute on function public.eh_admin() from public, anon;
grant execute on function public.eh_admin() to authenticated;
revoke execute on function public.avaliacao_ao_inserir(), public.lead_ao_gravar() from public, anon, authenticated;

alter table public.avaliacoes enable row level security;
alter table public.leads enable row level security;
alter table public.admins enable row level security; -- sem políticas: ninguém lê pela API

create policy "anon insere avaliacao" on public.avaliacoes for insert to anon with check (ambiente is not null);
create policy "anon insere lead" on public.leads for insert to anon with check (status = 'novo');
create policy "admin le avaliacoes" on public.avaliacoes for select to authenticated using ((select public.eh_admin()));
create policy "admin le leads" on public.leads for select to authenticated using ((select public.eh_admin()));
create policy "admin atualiza leads" on public.leads for update to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));

-- Keep-alive -----------------------------------------------------------------------------------------------------
-- O plano gratuito pausa o projeto após 7 dias sem atividade. O workflow .github/workflows/keepalive.yml chama
-- esta função a cada dois dias com a chave anônima. Ela toca a tabela de verdade e não devolve dado nenhum.

create function public.ping() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select true from public.avaliacoes limit 1), true);
$$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- Admin (rodar uma vez, depois de criar o usuário em Authentication → Users → Add user):
-- insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL';
