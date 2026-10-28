-- Cadastro fechado pelo banco: nenhum usuário novo no Auth sem a permissão explícita da sessão.
-- O painel tem o mesmo interruptor (Authentication → Sign In / Providers → Allow new users to sign up); este
-- gatilho vale mesmo se ele estiver ligado. Um usuário de fora não leria nada (só quem está em public.admins lê),
-- mas assim nem a conta existe. Para cadastrar outro admin, ver docs/deploy.md.

create function public.bloquear_cadastro() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(current_setting('resetia.permitir_cadastro', true), '') <> 'sim' then
    raise exception 'Cadastro fechado: o admin do RESET AI Score só aceita usuários criados pela Reset.';
  end if;
  return new;
end $$;

revoke execute on function public.bloquear_cadastro() from public, anon, authenticated;

create trigger bloquear_cadastro before insert on auth.users
  for each row execute function public.bloquear_cadastro();

-- Função de evento do "RLS automático" do Supabase, quando existe: roda sozinha a cada DDL e não precisa
-- ser chamável pela API.
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
