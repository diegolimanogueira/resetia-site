-- Materiais para baixar (25/11): as iscas dos posts, uma por palavra-chave, publicadas pelo /admin.
--   materiais: a palavra-chave (o endereço /materiais/?palavra), título, descrição, o PDF no Storage e contadores.
--   anon          → lê só os publicados, e só as colunas da página (nada de contadores nem de rascunhos).
--   admin         → cria, edita, publica, despublica e exclui (public.admins, como no resto do /admin).
--   registrar_material(): soma um acesso ou um download; é o único jeito de o anônimo mexer nos contadores.
--   Storage: bucket público "materiais", só PDF, até 20 MB; só admin envia, troca e apaga.
--            O arquivo de um rascunho só é alcançável por quem conhece o caminho, que leva um UUID.

create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  palavra text not null unique check (palavra ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(palavra) between 2 and 40),
  titulo text not null check (length(titulo) between 2 and 120),
  descricao text check (length(descricao) <= 600),
  -- Caminho dentro do bucket: "<uuid>/<palavra>.pdf".
  arquivo text not null check (arquivo ~ '^[a-z0-9-]+/[a-z0-9-]+\.pdf$' and length(arquivo) <= 120),
  tamanho integer check (tamanho between 1 and 20971520),
  publicado boolean not null default false,
  acessos integer not null default 0,
  downloads integer not null default 0
);

create index materiais_criado_em on public.materiais (criado_em desc);

-- A data de alteração é do servidor e só anda quando o admin edita (os contadores não contam como edição).
create function public.material_ao_editar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create trigger materiais_ao_editar
  before update of palavra, titulo, descricao, arquivo, tamanho, publicado on public.materiais
  for each row execute function public.material_ao_editar();

-- Contadores -----------------------------------------------------------------------------------------------------

create function public.registrar_material(p_palavra text, p_evento text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_evento = 'acesso' then
    update public.materiais set acessos = acessos + 1 where palavra = p_palavra and publicado;
  elsif p_evento = 'download' then
    update public.materiais set downloads = downloads + 1 where palavra = p_palavra and publicado;
  else
    return false;
  end if;
  return found;
end $$;

-- Permissões ---------------------------------------------------------------------------------------------------

revoke all on public.materiais from anon, authenticated;
grant select (palavra, titulo, descricao, arquivo, tamanho, publicado) on public.materiais to anon;
grant select, delete on public.materiais to authenticated;
grant insert (palavra, titulo, descricao, arquivo, tamanho, publicado) on public.materiais to authenticated;
grant update (palavra, titulo, descricao, arquivo, tamanho, publicado) on public.materiais to authenticated;

revoke execute on function public.material_ao_editar() from public, anon, authenticated;
revoke execute on function public.registrar_material(text, text) from public;
grant execute on function public.registrar_material(text, text) to anon, authenticated;

alter table public.materiais enable row level security;

create policy "anon le material publicado" on public.materiais for select to anon using (publicado);
create policy "admin le materiais" on public.materiais for select to authenticated using ((select public.eh_admin()));
create policy "admin cria material" on public.materiais for insert to authenticated
  with check ((select public.eh_admin()));
create policy "admin edita material" on public.materiais for update to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "admin exclui material" on public.materiais for delete to authenticated
  using ((select public.eh_admin()));

-- Arquivos -------------------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materiais', 'materiais', true, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "admin le arquivos de materiais" on storage.objects for select to authenticated
  using (bucket_id = 'materiais' and (select public.eh_admin()));
create policy "admin envia arquivo de material" on storage.objects for insert to authenticated
  with check (bucket_id = 'materiais' and (select public.eh_admin()));
create policy "admin troca arquivo de material" on storage.objects for update to authenticated
  using (bucket_id = 'materiais' and (select public.eh_admin()))
  with check (bucket_id = 'materiais' and (select public.eh_admin()));
create policy "admin apaga arquivo de material" on storage.objects for delete to authenticated
  using (bucket_id = 'materiais' and (select public.eh_admin()));
