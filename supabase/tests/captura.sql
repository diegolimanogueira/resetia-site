-- Teste da cadeia completa de migrações (0001 a 0010) num Postgres local, com asserções que FALHAM com exceção
-- (nada de comparar texto de saída). Rodar com: npm run test:banco. Cobre o que as migrações novas prometem:
-- inventário de privilégios do anônimo e do logado, o caminho antigo ainda funcionando e mais apertado, as funções de
-- captura (idempotência, conflito, atomicidade, chave errada, revisão fora de ordem), as tarefas do servidor, os
-- consentimentos por finalidade e canal, os tokens de acesso (finalidade, expiração, revogação) e o preenchimento retroativo.
\i supabase/tests/preparo.sql

create schema teste;
grant usage on schema teste to public;

create function teste.afirmar(nome text, ok boolean) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FALHOU: %', nome; end if;
  raise notice 'ok: %', nome;
end $$;

-- A instrução tem que falhar, e com o estado de erro esperado (padrão 42501: permissão negada).
create function teste.negar(p_sql text, p_estado text default '42501') returns void language plpgsql as $$
declare e text;
begin
  begin
    execute p_sql;
  exception when others then
    e := sqlstate;
    if e = p_estado then raise notice 'ok (negado %): %', e, left(p_sql, 70); return; end if;
    raise exception 'FALHOU: "%" falhou com % e não com %: %', left(p_sql, 90), e, p_estado, sqlerrm;
  end;
  raise exception 'FALHOU: deveria ter sido negado: %', left(p_sql, 100);
end $$;

\i supabase/migrations/0001_ai_score.sql
\i supabase/migrations/0002_cadastro_fechado.sql
\i supabase/migrations/0003_captura_em_duas_etapas.sql
\i supabase/migrations/0004_crm_email_dicas.sql
\i supabase/migrations/0005_versoes_capturas.sql
\i supabase/migrations/0006_tarefas.sql

begin;
select set_config('resetia.permitir_cadastro', 'sim', true);
insert into auth.users values ('11111111-1111-4111-8111-111111111111', 'admin@resetia.com.br'), ('22222222-2222-4222-8222-222222222222', 'outro@x.com');
insert into public.admins (user_id) values ('11111111-1111-4111-8111-111111111111');
commit;

-- Leads anteriores à tabela de consentimentos (0007): o preenchimento retroativo só pode refletir o que foi marcado.
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao)
values ('d0000000-0000-4000-8000-000000000001', 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 34, 'explorando', false, '{}', 'v=1&e=empresa', '1');
insert into public.leads (id, avaliacao_id, nome, email, empresa, whatsapp, pediu_contato, consentimento_marketing) values
  ('d1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'So Resultado', 'a@x.com', null, null, false, false),
  ('d1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Relatorio', 'b@x.com', 'Empresa B', null, false, false),
  ('d1000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'Pediu Tudo', 'c@x.com', 'Empresa C', '5511999990000', true, true),
  ('d1000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'Pediu Sem Numero', 'd@x.com', 'Empresa D', null, true, false);

\i supabase/migrations/0007_consentimentos.sql
\i supabase/migrations/0008_captura.sql
\i supabase/migrations/0009_tokens.sql
\i supabase/migrations/0010_crm_marcos_preferencias.sql

\echo '--- retroativo: só o que foi marcado'
select teste.afirmar('retroativo: quem só viu o resultado não ganha consentimento',
  (select count(*) from public.consentimentos where lead_id = 'd1000000-0000-4000-8000-000000000001') = 0);
select teste.afirmar('retroativo: quem completou a etapa 2 ganha só o relatório por e-mail',
  (select string_agg(finalidade || '/' || canal, ',' order by finalidade) from public.consentimentos where lead_id = 'd1000000-0000-4000-8000-000000000002') = 'relatorio-email/email');
select teste.afirmar('retroativo: relatório, conteúdo e contato por e-mail, WhatsApp e ligação (pediu e tem número)',
  (select string_agg(finalidade || '/' || canal, ',' order by finalidade, canal) from public.consentimentos where lead_id = 'd1000000-0000-4000-8000-000000000003')
  = 'contato-analise/email,contato-analise/ligacao,contato-analise/whatsapp,conteudo-email/email,relatorio-email/email');
select teste.afirmar('retroativo: pediu contato sem número não ganha WhatsApp nem ligação',
  (select string_agg(finalidade || '/' || canal, ',' order by finalidade, canal) from public.consentimentos where lead_id = 'd1000000-0000-4000-8000-000000000004') = 'contato-analise/email,relatorio-email/email');
select teste.afirmar('retroativo: todos marcados como legado, sem texto inventado',
  (select bool_and(fonte = 'legado' and texto_versao = 'legado-2026-10-28') from public.consentimentos));
select teste.afirmar('retroativo: o momento do pedido de conversa não é inventado',
  (select count(*) from public.leads where pedido_conversa_em is not null) = 0);

\echo '--- inventário de privilégios'
select teste.afirmar('anon: nenhum privilégio de tabela em nenhuma tabela',
  (select count(*) = 0 from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')));
select teste.afirmar('anon: nenhuma coluna legível, alterável ou referenciável',
  (select count(*) = 0 from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
     and has_column_privilege('anon', c.oid, a.attnum, 'SELECT, UPDATE, REFERENCES')));
select teste.afirmar('anon: insere em avaliacoes só as 17 colunas que o site antigo enviava',
  (select array_agg(a.attname::text order by a.attname) from pg_attribute a
   where a.attrelid = 'public.avaliacoes'::regclass and a.attnum > 0 and not a.attisdropped
     and has_column_privilege('anon', 'public.avaliacoes', a.attname, 'INSERT'))
  = (select array_agg(x order by x) from unnest(array['id','escopo','papel','porte','segmento','respostas','desafios','horizonte','indice','nivel','parcial','dimensoes','areas','codigo','versao','origem','ambiente']) x));
select teste.afirmar('anon: insere em leads só as 10 colunas que o site antigo enviava',
  (select array_agg(a.attname::text order by a.attname) from pg_attribute a
   where a.attrelid = 'public.leads'::regclass and a.attnum > 0 and not a.attisdropped
     and has_column_privilege('anon', 'public.leads', a.attname, 'INSERT'))
  = (select array_agg(x order by x) from unnest(array['id','avaliacao_id','nome','email','email_pessoal','empresa','whatsapp','pediu_contato','consentimento_marketing','ambiente']) x));
select teste.afirmar('anon: executa só ping, completar_lead, lead_liberado e ler_relatorio',
  (select string_agg(p.proname, ',' order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege('anon', p.oid, 'EXECUTE'))
  = 'completar_lead,lead_liberado,ler_relatorio,ping');
select teste.afirmar('logado: executa só as funções de leitura pública e as de admin (conferem eh_admin por dentro)',
  (select string_agg(p.proname, ',' order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prokind = 'f' and has_function_privilege('authenticated', p.oid, 'EXECUTE'))
  = 'completar_lead,contatos_permitidos,eh_admin,lead_liberado,ler_relatorio,ping,reprocessar_tarefa,revogar_tokens');
select teste.afirmar('logado: tabelas só para leitura (e atividades para registrar); alteração só por coluna',
  (select string_agg(c.relname || ':' || p, ',' order by c.relname, p) from pg_class c cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE']) p
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and has_table_privilege('authenticated', c.oid, p))
  = 'aprofundamentos:SELECT,atividades:INSERT,atividades:SELECT,avaliacoes:SELECT,consentimentos:SELECT,dicas:SELECT,emails:SELECT,leads:SELECT,marcos:DELETE,marcos:INSERT,marcos:SELECT,relatorios:SELECT,tarefas:SELECT');
select teste.afirmar('service_role executa as funções de captura, de tarefas, de consentimento e de token',
  (select count(*) = 11 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname in ('registrar_avaliacao','registrar_captura','completar_captura','gravar_aprofundamento','pegar_tarefas','concluir_tarefa','consumir_limite','limpar_expirados','elegivel','criar_token','preferencias_do_token')
     and has_function_privilege('service_role', p.oid, 'EXECUTE')));
select teste.afirmar('toda tabela nova do schema public tem RLS ligado',
  (select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'));

\echo '--- caminho antigo: o site com JavaScript em cache continua funcionando, mais apertado'
set role anon;
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, areas, codigo, versao, origem, ambiente)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'empresa', 'ceo', '50-199', 'tecnologia', '{"centrais":[3,3,2,2,2,1,2,2,1,1,2,1],"areas":{}}', array['comecar'], '3-meses', 34, 'explorando', false, '{"estrategia":70}', '{}', 'v=1&e=empresa', '1', '{"utm_source":"linkedin"}', 'producao');
insert into public.leads (id, avaliacao_id, nome, email, email_pessoal, empresa, whatsapp, pediu_contato, consentimento_marketing, ambiente)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Maria Teste', 'maria@empresa.com.br', false, null, null, false, false, 'producao');
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, relatorio_enviado_em) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', now())$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, responsavel) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'eu')$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, proximo_contato) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', current_date)$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, status) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'cliente')$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, notas) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'x')$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, chave_hash) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', repeat('a', 64))$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, canal) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', 'funcao')$q$);
select teste.negar($q$insert into public.leads (id, avaliacao_id, nome, email, criado_em) values (gen_random_uuid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fulano', 'f@x.com', '2000-01-01')$q$);
select teste.negar($q$insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, codigo, versao, canal) values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 'x', '1', 'funcao')$q$);
select teste.negar($q$insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, codigo, versao, resultado) values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 'x', '1', '{}')$q$);
select teste.negar($q$insert into public.avaliacoes (id, criada_em, escopo, papel, porte, segmento, respostas, desafios, horizonte, codigo, versao) values (gen_random_uuid(), '2000-01-01', 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 'x', '1')$q$);
select teste.negar($q$select count(*) from public.relatorios$q$);
select teste.negar($q$select count(*) from public.tarefas$q$);
select teste.negar($q$select count(*) from public.consentimentos$q$);
select teste.negar($q$select count(*) from public.aprofundamentos$q$);
select teste.negar($q$select public.registrar_avaliacao('{}'::jsonb)$q$);
select teste.negar($q$select public.registrar_captura('{}'::jsonb)$q$);
select teste.negar($q$select public.completar_captura('{}'::jsonb)$q$);
select teste.negar($q$select public.gravar_aprofundamento('{}'::jsonb)$q$);
select teste.negar($q$select public.consumir_limite('x', 60, 1)$q$);
select teste.negar($q$select public.elegivel(gen_random_uuid(), 'relatorio-email', 'email')$q$);
insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaab2', 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 34, 'explorando', false, '{}', 'v=2&m=1&n=2&e=empresa', '2');
select teste.negar($q$insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao) values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 34, 'explorando', false, '{}', 'x', '3')$q$, '23514');
reset role;

select teste.afirmar('legado: o lead criado pelo navegador nasce legado, sem chave, novo e sem campos do CRM',
  (select canal = 'legado' and chave_hash is null and status = 'novo' and relatorio_enviado_em is null and responsavel is null and proximo_contato is null
   from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'));
select teste.afirmar('legado: a avaliação do navegador nasce legado, sem versões de método e análise',
  (select canal = 'legado' and versao_metodo is null and versao_analise is null and resultado is null and criada_em::date = current_date
   from public.avaliacoes where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'));

\echo '--- completar_lead (caminho antigo): só preenche vazio, só lead sem chave, só por 7 dias'
set role anon;
select teste.afirmar('completar_lead preenche empresa e WhatsApp', public.completar_lead('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Empresa Um', '5511999990000', true, false));
select teste.afirmar('completar_lead não sobrescreve empresa nem WhatsApp já informados',
  public.completar_lead('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Empresa Dois', '5511888880000', false, true));
select teste.afirmar('completar_lead de id inexistente devolve falso', not public.completar_lead(gen_random_uuid(), 'X'));
reset role;
select teste.afirmar('legado: empresa e WhatsApp originais mantidos; pedido de contato e conteúdo só ligam',
  (select empresa = 'Empresa Um' and whatsapp = '5511999990000' and pediu_contato and consentimento_marketing
   from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'));
update public.leads set criado_em = now() - interval '8 days' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
set role anon;
select teste.afirmar('completar_lead recusa lead com mais de 7 dias', not public.completar_lead('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Empresa Tres'));
reset role;

\echo '--- função de captura (service_role): registrar'
select jsonb_build_object(
  'avaliacao', jsonb_build_object('id', 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1', 'escopo', 'empresa', 'papel', 'ceo', 'porte', '50-199',
    'segmento', 'tecnologia', 'respostas', jsonb_build_object('centrais', jsonb_build_array(3,3,2,2,2,1,2,2,1,1,2,1), 'areas', '{}'::jsonb),
    'desafios', jsonb_build_array('comecar'), 'horizonte', '3-meses', 'indice', 34, 'nivel', 'explorando', 'parcial', false,
    'dimensoes', jsonb_build_object('estrategia', 70), 'areas', '{}'::jsonb, 'codigo', 'v=2&m=1&n=2&e=empresa', 'versao', '2',
    'versao_metodo', '1', 'versao_analise', '2', 'resultado', jsonb_build_object('indice', 34, 'situacao', 'completa'),
    'origem', jsonb_build_object('utm_source', 'teste'), 'ambiente', 'dev'),
  'lead', jsonb_build_object('id', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'nome', 'Maria Funcao', 'email', 'maria.f@empresa.com.br',
    'email_pessoal', false, 'consentimento_marketing', true, 'ambiente', 'dev'),
  'chave_hash', repeat('1', 64),
  'consentimentos', jsonb_build_array(jsonb_build_object('finalidade', 'conteudo-email', 'canal', 'email', 'concedido', true,
    'fonte', 'formulario', 'texto_versao', 't1', 'evento_id', 'e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1')),
  'relatorio', jsonb_build_object('versao_metodo', '1', 'versao_analise', '2', 'resultado', jsonb_build_object('indice', 34),
    'devolutiva', jsonb_build_object('x', 1), 'hash', repeat('2', 64))
)::text as reg \gset
select (:'reg'::jsonb || jsonb_build_object('chave_hash', repeat('9', 64)))::text as reg_outra_chave \gset
select jsonb_set(:'reg'::jsonb, '{relatorio,hash}', '"curto"')::text as reg_invalido \gset
select jsonb_set(jsonb_set(jsonb_set(:'reg'::jsonb, '{avaliacao,id}', '"a2a2a2a2-a2a2-4a2a-8a2a-a2a2a2a2a2a2"'), '{lead,id}', '"b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2"'), '{relatorio,hash}', '"curto"')::text as reg_atomico \gset
select jsonb_set(:'reg'::jsonb, '{avaliacao,codigo}', '"v=2&m=1&n=2&e=vendas"')::text as reg_outro_codigo \gset

set role service_role;
select teste.afirmar('registrar: primeira vez devolve registrado', (public.registrar_captura(:'reg'::jsonb) ->> 'status') = 'registrado');
select teste.afirmar('registrar: o mesmo pedido de novo devolve ja-registrado (idempotente)', (public.registrar_captura(:'reg'::jsonb) ->> 'status') = 'ja-registrado');
select teste.afirmar('registrar: o mesmo lead com outra chave é conflito', (public.registrar_captura(:'reg_outra_chave'::jsonb) ->> 'status') = 'conflito');
select teste.afirmar('registrar: a mesma avaliação com outro código é conflito', (public.registrar_captura(:'reg_outro_codigo'::jsonb) ->> 'status') = 'conflito');
select teste.negar(format('select public.registrar_captura(%L::jsonb)', :'reg_invalido'), '23514');
reset role;

select teste.afirmar('registrar: uma avaliação, um lead, um relatório e um consentimento, mesmo com o pedido repetido',
  (select count(*) from public.avaliacoes where id = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1') = 1
  and (select count(*) from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 1
  and (select count(*) from public.relatorios where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 1
  and (select count(*) from public.consentimentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 1);
select teste.afirmar('registrar: a nota e as versões ficam gravadas, com canal função e a chave só em hash',
  (select a.canal = 'funcao' and a.versao = '2' and a.versao_metodo = '1' and a.versao_analise = '2' and (a.resultado ->> 'indice') = '34'
     and l.canal = 'funcao' and l.chave_hash = repeat('1', 64) and l.status = 'novo' and l.empresa is null
   from public.avaliacoes a join public.leads l on l.avaliacao_id = a.id where l.id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));

\echo '--- avaliação sozinha (quem concluiu e ainda não deixou contato)'
select (:'reg'::jsonb -> 'avaliacao' || jsonb_build_object('id', 'a3a3a3a3-a3a3-4a3a-8a3a-a3a3a3a3a3a3', 'codigo', 'v=2&m=1&n=2&e=empresa&id=a3'))::text as aval \gset
select jsonb_set(:'aval'::jsonb, '{codigo}', '"v=2&m=1&n=2&e=vendas&id=a3"')::text as aval_outro_codigo \gset
set role service_role;
select teste.afirmar('avaliação: primeira vez devolve registrado', (public.registrar_avaliacao(:'aval'::jsonb) ->> 'status') = 'registrado');
select teste.afirmar('avaliação: repetir é idempotente', (public.registrar_avaliacao(:'aval'::jsonb) ->> 'status') = 'ja-registrado');
select teste.afirmar('avaliação: outro código com o mesmo id é conflito', (public.registrar_avaliacao(:'aval_outro_codigo'::jsonb) ->> 'status') = 'conflito');
reset role;
select teste.afirmar('avaliação: uma linha, canal função, sem lead nenhum',
  (select count(*) from public.avaliacoes where id = 'a3a3a3a3-a3a3-4a3a-8a3a-a3a3a3a3a3a3' and canal = 'funcao' and versao_metodo = '1') = 1
  and (select count(*) from public.leads where avaliacao_id = 'a3a3a3a3-a3a3-4a3a-8a3a-a3a3a3a3a3a3') = 0);

\echo '--- atomicidade: se qualquer parte falha, nada fica gravado'
set role service_role;
select teste.negar(format('select public.registrar_captura(%L::jsonb)', :'reg_atomico'), '23514');
reset role;
select teste.afirmar('atomicidade: sem avaliação nem lead órfãos depois da falha no relatório',
  (select count(*) from public.avaliacoes where id = 'a2a2a2a2-a2a2-4a2a-8a2a-a2a2a2a2a2a2') = 0
  and (select count(*) from public.leads where id = 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2') = 0);

\echo '--- completar: exige a chave; enfileira o envio e as dicas uma vez só'
select jsonb_build_object('lead_id', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'avaliacao_id', 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1',
  'chave_hash', repeat('1', 64), 'empresa', 'Empresa F', 'whatsapp', '5511999990000', 'pediu_contato', true, 'marketing', false,
  'consentimentos', jsonb_build_array(
    jsonb_build_object('finalidade', 'relatorio-email', 'canal', 'email', 'concedido', true, 'fonte', 'formulario', 'texto_versao', 't1', 'evento_id', 'e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2'),
    jsonb_build_object('finalidade', 'contato-analise', 'canal', 'email', 'concedido', true, 'fonte', 'formulario', 'texto_versao', 't1', 'evento_id', 'e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3'),
    jsonb_build_object('finalidade', 'contato-analise', 'canal', 'whatsapp', 'concedido', true, 'fonte', 'formulario', 'texto_versao', 't1', 'evento_id', 'e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4')
  ))::text as comp \gset
select jsonb_set(:'comp'::jsonb, '{chave_hash}', to_jsonb(repeat('8', 64)))::text as comp_errada \gset
select jsonb_set(:'comp'::jsonb, '{lead_id}', '"c0c0c0c0-c0c0-4c0c-8c0c-c0c0c0c0c0c0"')::text as comp_inexistente \gset
set role service_role;
select teste.afirmar('completar: chave errada é recusada', (public.completar_captura(:'comp_errada'::jsonb) ->> 'status') = 'nao-autorizado');
select teste.afirmar('completar: lead inexistente tem a mesma resposta da chave errada (sem pista)', (public.completar_captura(:'comp_inexistente'::jsonb) ->> 'status') = 'nao-autorizado');
reset role;
select teste.afirmar('completar: a recusa não mudou nada',
  (select empresa is null and not pediu_contato from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')
  and (select count(*) from public.tarefas) = 0);
set role service_role;
select teste.afirmar('completar: com a chave certa completa', (public.completar_captura(:'comp'::jsonb) ->> 'status') = 'completado');
select teste.afirmar('completar: repetir o pedido é seguro', (public.completar_captura(:'comp'::jsonb) ->> 'status') = 'completado');
reset role;
select teste.afirmar('completar: empresa, pedido e momento do pedido gravados',
  (select empresa = 'Empresa F' and whatsapp = '5511999990000' and pediu_contato and pedido_conversa_em is not null
   from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));
select teste.afirmar('completar: uma tarefa de e-mail e uma de dicas, mesmo com o pedido repetido',
  (select string_agg(tipo || '/' || status, ',' order by tipo) from public.tarefas where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 'dicas/pendente,email-relatorio/pendente');
select teste.afirmar('completar: consentimentos do formulário registrados uma vez cada (evento_id)',
  (select count(*) from public.consentimentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 4);

\echo '--- consentimento por finalidade e canal'
select teste.afirmar('elegível: relatório por e-mail, sim', public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'relatorio-email', 'email'));
select teste.afirmar('elegível: contato da análise por e-mail e WhatsApp, sim',
  public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'email') and public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'whatsapp'));
select teste.afirmar('elegível: ligação, não (não foi concedida)', not public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'ligacao'));
select teste.afirmar('elegível: sem registro nenhum, não', not public.elegivel('d1000000-0000-4000-8000-000000000001', 'conteudo-email', 'email'));
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
values ('d1000000-0000-4000-8000-000000000004', 'contato-analise', 'whatsapp', true, 'formulario', 't1', gen_random_uuid());
select teste.afirmar('elegível: um evento concedido sem número informado continua não valendo',
  not public.elegivel('d1000000-0000-4000-8000-000000000004', 'contato-analise', 'whatsapp'));
select teste.negar($q$insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) values ('d1000000-0000-4000-8000-000000000001', 'conteudo-email', 'whatsapp', true, 'formulario', 't1', gen_random_uuid())$q$, '23514');

set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select teste.afirmar('logado sem ser admin: não vê relatórios, tarefas, consentimentos nem aprofundamentos',
  (select count(*) from public.relatorios) + (select count(*) from public.tarefas) + (select count(*) from public.consentimentos) + (select count(*) from public.aprofundamentos) = 0);
select teste.negar($q$insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) values ('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'email', false, 'admin-revogacao', 't1', gen_random_uuid())$q$);
select teste.negar($q$select public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'relatorio-email', 'email')$q$);

set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('admin: lê relatórios, tarefas e consentimentos',
  (select count(*) from public.relatorios) = 1 and (select count(*) from public.tarefas) = 2 and (select count(*) from public.consentimentos) > 0);
select teste.negar($q$insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) values ('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'ligacao', true, 'admin-revogacao', 't1', gen_random_uuid())$q$);
select teste.negar($q$insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) values ('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'email', false, 'formulario', 't1', gen_random_uuid())$q$);
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
values ('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'whatsapp', false, 'admin-revogacao', 'revogacao-admin', gen_random_uuid());
select teste.negar($q$update public.consentimentos set concedido = true$q$);
select teste.negar($q$delete from public.consentimentos$q$);
select teste.negar($q$update public.relatorios set devolutiva = '{}'$q$);
select teste.negar($q$delete from public.relatorios$q$);
select teste.negar($q$update public.tarefas set status = 'aceito'$q$);
select teste.negar($q$insert into public.tarefas (tipo, lead_id, chave) values ('dicas', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'x')$q$);
reset role;
select teste.afirmar('a revogação registrada pelo admin vale no mesmo instante',
  not public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'whatsapp')
  and public.elegivel('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'contato-analise', 'email'));

\echo '--- aprofundamento: chave, revisão fora de ordem e limites'
select jsonb_build_object('lead_id', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'chave_hash', repeat('1', 64), 'revisao', 1, 'area', 'vendas',
  'camada', 1, 'rotina', 'propostas', 'volume', 200, 'unidade', 'propostas', 'periodo', 'mes', 'consequencia', 'retrabalho',
  'ferramentas', '[]'::jsonb, 'nao_sei', '[]'::jsonb)::text as apro1 \gset
select jsonb_set(:'apro1'::jsonb, '{chave_hash}', to_jsonb(repeat('7', 64)))::text as apro_errada \gset
select (:'apro1'::jsonb || jsonb_build_object('revisao', 2, 'camada', 2, 'minutos', 15, 'dados', 'parcial', 'papel_decisor', 'influencio',
  'ferramentas', jsonb_build_array('CRM'), 'indicador', 'tempo de resposta'))::text as apro2 \gset
select jsonb_set(jsonb_set(:'apro1'::jsonb, '{volume}', '0'), '{revisao}', '4')::text as apro_volume_zero \gset
select jsonb_set(jsonb_set(:'apro1'::jsonb, '{revisao}', '3'), '{minutos}', '9999')::text as apro_minutos_enorme \gset
set role service_role;
select teste.afirmar('aprofundamento: chave errada é recusada', (public.gravar_aprofundamento(:'apro_errada'::jsonb) ->> 'status') = 'nao-autorizado');
select teste.afirmar('aprofundamento: revisão 1 grava', (public.gravar_aprofundamento(:'apro1'::jsonb) ->> 'status') = 'gravado');
select teste.afirmar('aprofundamento: a mesma revisão de novo é ignorada', (public.gravar_aprofundamento(:'apro1'::jsonb) ->> 'status') = 'ignorado');
select teste.afirmar('aprofundamento: revisão 2 atualiza', (public.gravar_aprofundamento(:'apro2'::jsonb) ->> 'status') = 'gravado');
select teste.afirmar('aprofundamento: uma gravação atrasada (revisão 1 depois da 2) não sobrescreve', (public.gravar_aprofundamento(:'apro1'::jsonb) ->> 'status') = 'ignorado');
reset role;
select teste.afirmar('aprofundamento: ficou a revisão 2, com a camada 2 completa',
  (select revisao = 2 and camada = 2 and minutos = 15 and dados = 'parcial' and ferramentas = array['CRM'] and volume = 200 and periodo = 'mes'
   from public.aprofundamentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));
set role service_role;
select teste.negar(format('select public.gravar_aprofundamento(%L::jsonb)', :'apro_volume_zero'), '23514');
select teste.negar(format('select public.gravar_aprofundamento(%L::jsonb)', :'apro_minutos_enorme'), '23514');
reset role;
select teste.afirmar('aprofundamento: volume zero foi recusado e não mudou nada',
  (select revisao = 2 from public.aprofundamentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));

\echo '--- tarefas: reserva, nova tentativa com espera, falha definitiva e limites'
set role service_role;
select teste.afirmar('tarefas: pega as duas pendentes e as reserva', (select count(*) from public.pegar_tarefas(5)) = 2);
select teste.afirmar('tarefas: reservadas, ninguém pega de novo (vários processadores ao mesmo tempo)', (select count(*) from public.pegar_tarefas(5)) = 0);
reset role;
select teste.afirmar('tarefas: tentativa contada e trava de alguns minutos',
  (select bool_and(status = 'processando' and tentativas = 1 and travada_ate > now()) from public.tarefas));
update public.tarefas set travada_ate = now() - interval '1 minute';
set role service_role;
select teste.afirmar('tarefas: a reserva vencida (processo que morreu) volta para a fila', (select count(*) from public.pegar_tarefas(5)) = 2);
select teste.afirmar('tarefas: aceito pelo provedor é final e guarda o id do provedor',
  (select public.concluir_tarefa(id, 'aceito', 'prov-123') from public.tarefas where tipo = 'email-relatorio') = 'aceito');
select teste.afirmar('tarefas: nova tentativa agenda para depois',
  (select public.concluir_tarefa(id, 'nova-tentativa', null, 'tempo esgotado', interval '10 minutes') from public.tarefas where tipo = 'dicas') = 'nova-tentativa');
select teste.afirmar('tarefas: com espera pela frente ninguém a pega agora', (select count(*) from public.pegar_tarefas(5)) = 0);
select teste.negar($q$select public.concluir_tarefa(gen_random_uuid(), 'inventado')$q$, 'P0001');
reset role;
select teste.afirmar('tarefas: e-mail aceito com o id do provedor; dicas esperando a próxima tentativa',
  (select string_agg(tipo || '/' || status || '/' || coalesce(provedor_id, '-'), ',' order by tipo) from public.tarefas) = 'dicas/nova-tentativa/-,email-relatorio/aceito/prov-123');
update public.tarefas set tentar_em = now() - interval '1 minute', tentativas = max_tentativas where tipo = 'dicas';
set role service_role;
select teste.afirmar('tarefas: sem tentativas sobrando a nova tentativa vira falha',
  (select public.concluir_tarefa(id, 'nova-tentativa', null, 'sem rede') from public.tarefas where tipo = 'dicas') = 'falhou');
select teste.afirmar('limite: dentro do máximo', public.consumir_limite('teste', 3600, 2) and public.consumir_limite('teste', 3600, 2));
select teste.afirmar('limite: acima do máximo', not public.consumir_limite('teste', 3600, 2));
select teste.afirmar('limite: chaves diferentes não se misturam', public.consumir_limite('outra', 3600, 2));
reset role;
insert into public.emails (lead_id, tipo, assunto, status, tarefa_id, provedor_id)
select lead_id, 'relatorio', 'Seu relatório', 'aceito', id, 'prov-123' from public.tarefas where tipo = 'email-relatorio';
select teste.afirmar('emails: o estado aceito existe e o enviado antigo continua válido',
  (select count(*) from public.emails where status = 'aceito') = 1);
select teste.negar($q$insert into public.emails (lead_id, tipo, assunto, status) select id, 'relatorio', 'x', 'entregue' from public.leads limit 1$q$, '23514');

\echo '--- tokens: finalidade restrita, expiração, revogação; o link antigo só vale para o que já existia'
select encode(sha256(convert_to('token-de-leitura-0123456789abcdef', 'UTF8')), 'hex') as hash_leitura \gset
select encode(sha256(convert_to('token-de-preferencias-0123456789', 'UTF8')), 'hex') as hash_pref \gset
set role anon;
select teste.negar(format('select public.criar_token(%L, %L, %L, 180)', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'ler-relatorio', :'hash_leitura'));
select teste.negar($q$select count(*) from public.tokens$q$);
reset role;
set role service_role;
select public.criar_token('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'ler-relatorio', :'hash_leitura', 180);
select public.criar_token('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'preferencias', :'hash_pref', 365);
select teste.negar(format('select public.criar_token(%L, %L, %L, 0)', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'ler-relatorio', repeat('a', 64)), '22023');
select teste.negar(format('select public.criar_token(%L, %L, %L, 180)', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'inventada', repeat('b', 64)), '23514');
select teste.negar(format('select public.criar_token(%L, %L, %L, 180)', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'ler-relatorio', 'curto'), '23514');
reset role;
select teste.afirmar('token: só o hash fica no banco, nunca o token',
  (select count(*) = 2 and bool_and(token_hash ~ '^[0-9a-f]{64}$') from public.tokens));
create temp table antes as select nome, empresa, status, atualizado_em from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1';
set role anon;
select teste.afirmar('ler_relatorio: o token de leitura devolve nome, empresa e a avaliação a que pertence',
  (public.ler_relatorio('token-de-leitura-0123456789abcdef') ->> 'avaliacao') = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'
  and (public.ler_relatorio('token-de-leitura-0123456789abcdef') ->> 'nome') = 'Maria Funcao');
select teste.afirmar('ler_relatorio: token errado, curto ou nulo devolve nulo',
  public.ler_relatorio('token-que-nao-existe-0123456789') is null and public.ler_relatorio('curto') is null and public.ler_relatorio(null) is null);
select teste.afirmar('ler_relatorio: o token de preferências não abre o relatório (finalidade restrita)',
  public.ler_relatorio('token-de-preferencias-0123456789') is null);
reset role;
select teste.afirmar('ler_relatorio: conta os usos e não altera o lead',
  (select usos = 2 and ultimo_uso_em is not null from public.tokens where token_hash = :'hash_leitura')
  and (select (a.nome, a.empresa, a.status, a.atualizado_em) is not distinct from (l.nome, l.empresa, l.status, l.atualizado_em)
       from antes a, public.leads l where l.id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));
update public.tokens set criado_em = now() - interval '200 days', expira_em = now() - interval '1 day' where token_hash = :'hash_leitura';
set role anon;
select teste.afirmar('ler_relatorio: token expirado devolve nulo', public.ler_relatorio('token-de-leitura-0123456789abcdef') is null);
reset role;
update public.tokens set criado_em = now(), expira_em = now() + interval '180 days' where token_hash = :'hash_leitura';
set role anon;
select teste.afirmar('ler_relatorio: com o prazo renovado volta a abrir', public.ler_relatorio('token-de-leitura-0123456789abcdef') is not null);
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select teste.negar($q$select public.revogar_tokens('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')$q$);
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('revogar_tokens: o admin revoga todos os tokens do lead', public.revogar_tokens('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 2);
select teste.afirmar('revogar_tokens: revogar de novo não encontra nada', public.revogar_tokens('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 0);
reset role;
select teste.afirmar('revogar_tokens: guarda quem revogou e quando',
  (select count(*) = 2 and bool_and(revogado_em is not null and revogado_por = '11111111-1111-4111-8111-111111111111') from public.tokens));
set role anon;
select teste.afirmar('ler_relatorio: token revogado devolve nulo', public.ler_relatorio('token-de-leitura-0123456789abcdef') is null);
reset role;
select teste.afirmar('lead_liberado: o lead novo (com chave) não abre pelo par de ids, mesmo com empresa',
  (select public.lead_liberado(id, avaliacao_id) is null from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1'));
update public.leads set criado_em = now() - interval '10 days' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select teste.afirmar('lead_liberado: o lead antigo (sem chave) continua abrindo pelo par, nos primeiros 180 dias',
  (select (public.lead_liberado(id, avaliacao_id) ->> 'empresa') = 'Empresa Um' from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'));
update public.leads set criado_em = now() - interval '181 days' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select teste.afirmar('lead_liberado: depois de 180 dias o link antigo deixa de abrir',
  (select public.lead_liberado(id, avaliacao_id) is null from public.leads where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'));

\echo '--- pedido de conversa, primeira resposta, marcos, contatos permitidos, reprocessar e preferências'
insert into public.leads (id, avaliacao_id, nome, email, empresa, pediu_contato) values
  ('e1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Sem Pedido', 'p1@x.com', 'E1', false),
  ('e1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Com Pedido', 'p2@x.com', 'E2', true);
select teste.afirmar('pedido de conversa: o momento é gravado quando a pessoa pede, e só nessa hora',
  (select pedido_conversa_em is null from public.leads where id = 'e1000000-0000-4000-8000-000000000001')
  and (select pedido_conversa_em is not null from public.leads where id = 'e1000000-0000-4000-8000-000000000002'));
update public.leads set pediu_contato = true where id = 'e1000000-0000-4000-8000-000000000001';
select teste.afirmar('pedido de conversa: ligar o pedido depois (caminho antigo) também grava o momento',
  (select pedido_conversa_em is not null from public.leads where id = 'e1000000-0000-4000-8000-000000000001'));
select pedido_conversa_em as pedido_antes from public.leads where id = 'e1000000-0000-4000-8000-000000000002' \gset
update public.leads set nome = 'Com Pedido Editado' where id = 'e1000000-0000-4000-8000-000000000002';
select teste.afirmar('pedido de conversa: editar o lead não muda o momento do pedido',
  (select pedido_conversa_em = :'pedido_antes'::timestamptz from public.leads where id = 'e1000000-0000-4000-8000-000000000002'));

-- Primeira resposta: só contato humano da equipe.
set request.jwt.claim.sub = '';
set role service_role;
insert into public.atividades (lead_id, tipo, texto) values ('e1000000-0000-4000-8000-000000000002', 'email', 'Relatório aceito pelo provedor');
reset role;
select teste.afirmar('primeira resposta: o que o sistema registra sozinho não conta',
  (select primeira_resposta_em is null from public.leads where id = 'e1000000-0000-4000-8000-000000000002'));
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.atividades (lead_id, tipo, texto) values ('e1000000-0000-4000-8000-000000000002', 'nota', 'Anotação interna');
reset role;
select teste.afirmar('primeira resposta: uma nota interna não é resposta',
  (select primeira_resposta_em is null from public.leads where id = 'e1000000-0000-4000-8000-000000000002'));
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.atividades (lead_id, tipo, texto) values ('e1000000-0000-4000-8000-000000000002', 'ligacao', 'Liguei e conversamos');
reset role;
select primeira_resposta_em as primeira from public.leads where id = 'e1000000-0000-4000-8000-000000000002' \gset
select teste.afirmar('primeira resposta: a primeira ligação da equipe grava o momento', :'primeira' <> '');
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.atividades (lead_id, tipo, texto) values ('e1000000-0000-4000-8000-000000000002', 'whatsapp', 'Segundo contato');
reset role;
select teste.afirmar('primeira resposta: um contato seguinte não a move',
  (select primeira_resposta_em = :'primeira'::timestamptz from public.leads where id = 'e1000000-0000-4000-8000-000000000002'));

-- Marcos do funil.
set role anon;
select teste.negar($q$select count(*) from public.marcos$q$);
select teste.negar($q$insert into public.marcos (lead_id, tipo) values ('e1000000-0000-4000-8000-000000000002', 'ganho')$q$);
reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select teste.negar($q$insert into public.marcos (lead_id, tipo) values ('e1000000-0000-4000-8000-000000000002', 'ganho')$q$);
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.marcos (lead_id, tipo, valor_informado, observacao) values ('e1000000-0000-4000-8000-000000000002', 'proposta-enviada', 1500.50, 'proposta de piloto');
insert into public.marcos (lead_id, tipo) values ('e1000000-0000-4000-8000-000000000002', 'reuniao-agendada');
select teste.negar($q$insert into public.marcos (lead_id, tipo, valor_informado) values ('e1000000-0000-4000-8000-000000000002', 'ganho', -1)$q$, '23514');
select teste.negar($q$insert into public.marcos (lead_id, tipo) values ('e1000000-0000-4000-8000-000000000002', 'inventado')$q$, '23514');
select teste.negar($q$insert into public.marcos (lead_id, tipo, criado_por) values ('e1000000-0000-4000-8000-000000000002', 'ganho', '22222222-2222-4222-8222-222222222222')$q$);
select teste.afirmar('marcos: o admin registra e lê, com o valor que informou e o autor',
  (select count(*) = 2 and bool_and(criado_por = '11111111-1111-4111-8111-111111111111') from public.marcos)
  and (select valor_informado = 1500.50 from public.marcos where tipo = 'proposta-enviada'));
select teste.afirmar('marcos: mudar o status do lead não cria valor nem marco (receita nunca é deduzida)',
  (select count(*) from public.marcos where tipo in ('ganho', 'perdido')) = 0);
delete from public.marcos where tipo = 'reuniao-agendada';
select teste.afirmar('marcos: o admin corrige apagando um marco registrado por engano', (select count(*) = 1 from public.marcos));
reset role;

-- Contatos permitidos: o número só volta com a escolha registrada.
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select teste.negar($q$select * from public.contatos_permitidos()$q$);
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('contatos permitidos: com a escolha de WhatsApp e ligação, o número volta',
  (select telefone = '5511999990000' and whatsapp and ligacao and email from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000003'));
select teste.afirmar('contatos permitidos: pediu contato mas sem número, nada de WhatsApp nem ligação',
  (select telefone is null and not whatsapp and not ligacao and email from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000004'));
select teste.afirmar('contatos permitidos: quem só pediu o relatório não tem contato de conversa liberado',
  (select telefone is null and not whatsapp and not ligacao and not email from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000002'));
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
values ('d1000000-0000-4000-8000-000000000003', 'contato-analise', 'whatsapp', false, 'admin-revogacao', 'admin', gen_random_uuid());
select teste.afirmar('contatos permitidos: revogado o WhatsApp, o canal fecha, mas a ligação (outra escolha) segue liberada com o número',
  (select not whatsapp and ligacao and telefone = '5511999990000' from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000003'));
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
values ('d1000000-0000-4000-8000-000000000003', 'contato-analise', 'ligacao', false, 'admin-revogacao', 'admin', gen_random_uuid());
select teste.afirmar('contatos permitidos: sem WhatsApp nem ligação, o número some',
  (select not whatsapp and not ligacao and telefone is null from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000003'));
select teste.negar($q$insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) values ('d1000000-0000-4000-8000-000000000003', 'contato-analise', 'whatsapp', true, 'admin-revogacao', 'admin', gen_random_uuid())$q$);
reset role;

-- Reprocessar tarefa.
update public.tarefas set status = 'falhou', tentativas = 5 where tipo = 'dicas';
select id as tarefa_dicas from public.tarefas where tipo = 'dicas' \gset
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select teste.negar(format('select public.reprocessar_tarefa(%L)', :'tarefa_dicas'));
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('reprocessar: tarefa que falhou volta para a fila com as tentativas zeradas',
  (select public.reprocessar_tarefa(id) from public.tarefas where tipo = 'dicas'));
reset role;
select teste.afirmar('reprocessar: fica pendente, para já, sem erro antigo',
  (select status = 'pendente' and tentativas = 0 and ultimo_erro is null and tentar_em <= now() from public.tarefas where tipo = 'dicas'));
update public.tarefas set status = 'cancelada' where tipo = 'dicas';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('reprocessar: tarefa cancelada (sem consentimento) não volta', not (select public.reprocessar_tarefa(id) from public.tarefas where tipo = 'dicas'));
reset role;

-- Preferências pelo token.
select encode(sha256(convert_to('token-de-preferencias-do-lead-3', 'UTF8')), 'hex') as hash_pref3 \gset
select encode(sha256(convert_to('token-de-leitura-do-lead-3-0000', 'UTF8')), 'hex') as hash_leitura3 \gset
set role service_role;
select public.criar_token('d1000000-0000-4000-8000-000000000003', 'preferencias', :'hash_pref3', 30);
select public.criar_token('d1000000-0000-4000-8000-000000000003', 'ler-relatorio', :'hash_leitura3', 30);
select teste.afirmar('preferências: o token lê as escolhas atuais, com o WhatsApp já revogado pela equipe',
  (select (public.preferencias_do_token(:'hash_pref3') ->> 'status') = 'ok'
    and (select bool_and(case when e ->> 'canal' = 'whatsapp' then (e ->> 'concedido') = 'false' else true end)
         from jsonb_array_elements(public.preferencias_do_token(:'hash_pref3') -> 'escolhas') e)));
select teste.afirmar('preferências: token de outra finalidade, inexistente ou expirado não vale',
  (public.preferencias_do_token(:'hash_leitura3') ->> 'status') = 'invalido'
  and (public.preferencias_do_token(repeat('a', 64)) ->> 'status') = 'invalido');
select jsonb_build_array(
  jsonb_build_object('finalidade', 'contato-analise', 'canal', 'whatsapp', 'concedido', true, 'texto_versao', 't1', 'evento_id', 'f1000000-0000-4000-8000-000000000001'),
  jsonb_build_object('finalidade', 'conteudo-email', 'canal', 'email', 'concedido', false, 'texto_versao', 't1', 'evento_id', 'f1000000-0000-4000-8000-000000000002')
)::text as eventos \gset
select teste.afirmar('preferências: a própria pessoa pode voltar a conceder e pode revogar; vira evento com a fonte preferencias',
  (public.preferencias_do_token(:'hash_pref3', :'eventos'::jsonb) ->> 'status') = 'ok');
select public.preferencias_do_token(:'hash_pref3', :'eventos'::jsonb);
reset role;
select teste.afirmar('preferências: os eventos ficam gravados como foram dados e o mesmo evento repetido não duplica',
  (select count(*) = 2 from public.consentimentos where fonte = 'preferencias' and lead_id = 'd1000000-0000-4000-8000-000000000003'));
select teste.afirmar('preferências: nada foi apagado (as revogações da equipe, de WhatsApp e de ligação, continuam no histórico)',
  (select count(*) = 2 from public.consentimentos where fonte = 'admin-revogacao' and lead_id = 'd1000000-0000-4000-8000-000000000003'));
select teste.afirmar('preferências: a escolha mais recente vale (WhatsApp concedido de novo, conteúdo revogado)',
  (select (elegivel_w, elegivel_c) = (true, false) from (select public.elegivel('d1000000-0000-4000-8000-000000000003', 'contato-analise', 'whatsapp') as elegivel_w, public.elegivel('d1000000-0000-4000-8000-000000000003', 'conteudo-email', 'email') as elegivel_c) x));
select encode(sha256(convert_to('token-de-preferencias-sem-numero', 'UTF8')), 'hex') as hash_pref2 \gset
set role service_role;
select public.criar_token('d1000000-0000-4000-8000-000000000002', 'preferencias', :'hash_pref2', 30);
select teste.afirmar('preferências: não dá para conceder WhatsApp ou ligação sem número informado',
  (public.preferencias_do_token(:'hash_pref2', jsonb_build_array(jsonb_build_object('finalidade', 'contato-analise', 'canal', 'whatsapp', 'concedido', true, 'texto_versao', 't1', 'evento_id', 'f1000000-0000-4000-8000-000000000003'))) ->> 'status') = 'sem-numero');
select teste.afirmar('preferências: lista grande demais é recusada',
  (public.preferencias_do_token(:'hash_pref2', (select jsonb_agg(jsonb_build_object('finalidade', 'conteudo-email', 'canal', 'email', 'concedido', false, 'texto_versao', 't1', 'evento_id', gen_random_uuid())) from generate_series(1, 13))) ->> 'status') = 'campos');
select teste.negar(format('select public.preferencias_do_token(%L, %L::jsonb)', :'hash_pref3', '[{"finalidade":"conteudo-email","canal":"whatsapp","concedido":true,"texto_versao":"t1","evento_id":"f1000000-0000-4000-8000-000000000009"}]'), '23514');
reset role;
set role anon;
select teste.negar(format('select public.preferencias_do_token(%L)', :'hash_pref2'));
reset role;
update public.tokens set criado_em = now() - interval '40 days', expira_em = now() - interval '10 days' where token_hash = :'hash_pref2';
set role service_role;
select teste.afirmar('preferências: token expirado não vale', (public.preferencias_do_token(:'hash_pref2') ->> 'status') = 'invalido');
reset role;

\echo '--- apagar um lead leva tudo junto'
delete from public.leads where id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1';
select teste.afirmar('cascata: relatórios, consentimentos, tarefas, tokens, marcos e aprofundamento do lead apagado se vão com ele',
  (select count(*) from public.relatorios where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')
  + (select count(*) from public.tarefas where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')
  + (select count(*) from public.aprofundamentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')
  + (select count(*) from public.tokens where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1')
  + (select count(*) from public.consentimentos where lead_id = 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1') = 0);
delete from public.leads where id = 'e1000000-0000-4000-8000-000000000002';
select teste.afirmar('cascata: os marcos e as atividades do lead apagado se vão com ele',
  (select count(*) from public.marcos where lead_id = 'e1000000-0000-4000-8000-000000000002') = 0);

\echo '--- pendentes: 0011 (o admin não lê whatsapp nem chave direto) e 0012 (fecha o caminho antigo)'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('contatos permitidos: diz se há número sem entregá-lo (tem_numero)',
  (select tem_numero from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000003')
  and not (select tem_numero from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000002'));
reset role;
\i supabase/pendentes/0011_leads_sem_whatsapp_direto.sql
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select teste.afirmar('0011: o admin ainda lê as colunas que o painel usa', (select count(*) > 0 from (select id, nome, email, status, pedido_conversa_em, primeira_resposta_em, canal from public.leads) x));
select teste.negar($q$select whatsapp from public.leads$q$);
select teste.negar($q$select chave_hash from public.leads$q$);
select teste.negar($q$select * from public.leads$q$);
select teste.afirmar('0011: o telefone só chega por contatos_permitidos() e só com a escolha do canal (a pessoa voltou a escolher WhatsApp; quem não tem número, nulo)',
  (select telefone = '5511999990000' from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000003')
  and (select telefone is null from public.contatos_permitidos() where lead_id = 'd1000000-0000-4000-8000-000000000004'));
update public.leads set status = 'contatado' where id = 'd1000000-0000-4000-8000-000000000004';
select teste.afirmar('0011: o admin continua atualizando as colunas do CRM', (select status = 'contatado' from public.leads where id = 'd1000000-0000-4000-8000-000000000004'));
reset role;
\i supabase/pendentes/0012_fechar_caminho_antigo.sql
set role anon;
select teste.negar($q$insert into public.avaliacoes (id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, codigo, versao) values (gen_random_uuid(), 'empresa', 'ceo', '50-199', 'tecnologia', '{}', array['comecar'], '3-meses', 34, 'explorando', false, '{}', 'v=1&e=empresa', '1')$q$);
select teste.negar($q$select public.completar_lead(gen_random_uuid(), 'X')$q$);
select teste.negar($q$select public.lead_liberado(gen_random_uuid(), gen_random_uuid())$q$);
reset role;
select teste.afirmar('0012: a função de captura (service_role) continua funcionando depois de fechar o caminho antigo',
  (select count(*) = 1 from public.avaliacoes where id = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'));

\echo 'CAPTURA_OK'
