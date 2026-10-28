-- Teste de segurança da migração do RESET AI Score num Postgres local (sem Supabase).
-- Rodar com: npm run test:banco (sobe um cluster temporário; precisa de initdb/pg_ctl/psql no PATH).
-- Simula o que o Supabase já traz: os papéis da API (anon, authenticated) com tudo concedido por padrão
-- nas tabelas novas, auth.users e auth.uid() lendo o sub do JWT. Saída esperada nos comentários "esperado".
\set ON_ERROR_STOP 1
\set VERBOSITY terse
create role anon nologin;
create role authenticated nologin;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
create schema auth;
grant usage on schema auth to anon, authenticated;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant execute on function auth.uid() to anon, authenticated;

\i supabase/migrations/0001_ai_score.sql
\i supabase/migrations/0002_cadastro_fechado.sql
\i supabase/migrations/0003_captura_em_duas_etapas.sql
\i supabase/migrations/0004_crm_email_dicas.sql

\set ON_ERROR_STOP 0
\set VERBOSITY terse
\echo '--- cadastro sem permissao (esperado: Cadastro fechado)'
insert into auth.users values ('33333333-3333-4333-8333-333333333333', 'intruso@x.com');
\echo '--- cadastro pela Reset, com a permissao da sessao'
begin;
select set_config('resetia.permitir_cadastro', 'sim', true);
insert into auth.users values ('11111111-1111-4111-8111-111111111111', 'admin@resetia.com.br'), ('22222222-2222-4222-8222-222222222222', 'outro@x.com');
insert into public.admins (user_id) select id from auth.users where email = 'admin@resetia.com.br';
commit;
select count(*) as usuarios from auth.users;

\echo '--- anon: insere avaliacao (com criada_em forjado) e lead (com status forjado)'
set role anon;
insert into public.avaliacoes (id, criada_em, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, areas, codigo, versao, origem, ambiente)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2000-01-01', 'empresa', 'ceo', '50-199', 'tecnologia', '{"centrais":[3,3,2,2,2,1,2,2,1,1,2,1],"areas":{}}', array['comecar'], '3-meses', 46, 'desenvolvimento', false, '{"estrategia":75}', '{}', 'v=1&e=empresa', '1', '{"utm_source":"linkedin"}', 'producao');
insert into public.leads (id, avaliacao_id, nome, email, email_pessoal, empresa, whatsapp, pediu_contato, consentimento_marketing, status, notas, ambiente)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Maria Teste', 'maria@empresa.com.br', false, 'Empresa', '5585999990000', true, false, 'cliente', 'hack', 'producao');
\echo '--- anon: etapa 1 (lead sem empresa) e etapa 2 pela funcao completar_lead'
insert into public.leads (id, avaliacao_id, nome, email) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Etapa Um', 'etapa@empresa.com.br');
select public.completar_lead('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Empresa Etapa', '5511999990000', true, false) as completou;
select public.completar_lead(gen_random_uuid(), 'Ninguem') as id_inexistente;
\echo '--- anon: completar_lead nao muda nome nem status e nao apaga (esperado: whatsapp mantido)'
select public.completar_lead('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '', '', false, false) as segunda_vez;
\echo '--- anon: reenviar a mesma avaliacao (esperado: 23505 duplicate key)'
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 46, 'desenvolvimento', false, '{}', 'x', '1');
\echo '--- anon: lead de avaliacao inexistente (esperado: 23503 FK)'
insert into public.leads (id, avaliacao_id, nome, email, empresa) values (gen_random_uuid(), gen_random_uuid(), 'Fulano', 'f@x.com', 'X');
\echo '--- anon: dados invalidos (esperado: check violation x4)'
insert into public.leads (id, avaliacao_id, nome, email, empresa) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'sem-arroba', 'X');
insert into public.leads (id, avaliacao_id, nome, email, empresa, whatsapp) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'X', '123');
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao)
values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar','medir','agentes'], '3-meses', 46, 'desenvolvimento', false, '{}', 'x', '1');
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao)
values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 46, null, false, '{}', 'x', '1');
\echo '--- anon: ler, alterar, apagar (esperado: permission denied x4)'
select count(*) from public.avaliacoes;
select count(*) from public.leads;
update public.leads set status = 'cliente';
delete from public.avaliacoes;
\echo '--- anon: ping (esperado: t)'
select public.ping();
\echo '--- anon: eh_admin (esperado: permission denied)'
select public.eh_admin();
reset role;

\echo '--- trigger: datas e status do servidor (esperado: criada_em hoje, status novo, notas vazio)'
select criada_em::date = current_date as criada_hoje from public.avaliacoes;
select status, notas is null as sem_notas from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select nome, empresa, whatsapp, pediu_contato, status from public.leads where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

\echo '--- authenticated sem ser admin: nada visivel, update sem efeito'
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select count(*) as avaliacoes_visiveis from public.avaliacoes;
select count(*) as leads_visiveis from public.leads;
update public.leads set status = 'cliente';
select count(*) as admins_visiveis from public.admins;

\echo '--- admin: le tudo, atualiza status/notas, nao altera nome'
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select count(*) as avaliacoes_visiveis from public.avaliacoes;
select l.nome, a.indice from public.leads l join public.avaliacoes a on a.id = l.avaliacao_id order by l.nome;
update public.leads set status = 'contatado', notas = 'Ligar quinta' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
update public.leads set nome = 'Outro';
update public.leads set status = 'inventado';
select status, notas, atualizado_em > criado_em as atualizado from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
\echo '--- admin: insert pela API (esperado: permission denied)'
insert into public.leads (id, avaliacao_id, nome, email, empresa) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'X');
reset role;

\echo '--- crm: anon nao le nem escreve atividades, emails e dicas (esperado: permission denied x4)'
set role anon;
select count(*) from public.atividades;
insert into public.atividades (lead_id, tipo, texto) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'nota', 'x');
select count(*) from public.dicas;
select count(*) from public.emails;
\echo '--- crm: link do e-mail so com o par certo e relatorio completo (esperado: json, nulo, nulo)'
select public.lead_liberado('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') as liberado;
select public.lead_liberado('cccccccc-cccc-4ccc-8ccc-cccccccccccc', gen_random_uuid()) is null as par_errado;
reset role;
\echo '--- crm: admin registra atividade com autor do servidor e atualiza responsavel e proximo contato'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.atividades (lead_id, tipo, texto, autor) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'ligacao', 'Ligou e pediu proposta', 'forjado@x.com');
select autor, tipo from public.atividades;
update public.leads set responsavel = 'admin@resetia.com.br', proximo_contato = date '2026-11-05' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select responsavel, proximo_contato from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
\echo '--- crm: logado sem ser admin nao registra atividade (esperado: violates row-level security)'
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
insert into public.atividades (lead_id, tipo, texto) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'nota', 'x');
reset role;

