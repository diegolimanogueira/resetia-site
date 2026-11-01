-- Verificação geral das migrações 0005 a 0010 (uma grade só). Rode no SQL Editor do Supabase depois da 0010 e ANTES das
-- pendentes 0011 e 0012 (a 0012 muda de propósito as permissões do anônimo que a grade confere). Toda linha deve dizer
-- "ok" na última coluna; as duas últimas são informativas. Só lê: não altera nada. Também roda no teste de banco
-- (supabase/tests/captura.sql), que falha se alguma linha disser DIFERENTE.
with
tabelas(nome) as (values ('relatorios'), ('tarefas'), ('limites'), ('consentimentos'), ('aprofundamentos'), ('tokens'), ('marcos')),
funcoes(nome, anon_ok, auth_ok) as (values
  ('pegar_tarefas', false, false), ('concluir_tarefa', false, false), ('consumir_limite', false, false),
  ('limpar_expirados', false, false), ('elegivel', false, false),
  ('registrar_avaliacao', false, false), ('registrar_captura', false, false), ('completar_captura', false, false),
  ('gravar_aprofundamento', false, false),
  ('criar_token', false, false), ('ler_relatorio', true, true), ('revogar_tokens', false, true),
  ('primeira_resposta', false, false), ('lead_pedido_conversa', false, false), ('preferencias_do_token', false, false),
  ('contatos_permitidos', false, true), ('reprocessar_tarefa', false, true)),
linhas as (
  select 1 as o, 'tabela com RLS: ' || t.nome as item, 'true' as esperado,
         coalesce((select c.relrowsecurity::text from pg_class c
                   where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relname = t.nome), 'ausente') as obtido
  from tabelas t
  union all
  select 2, 'execute anon/authenticated: ' || f.nome, f.anon_ok::text || '/' || f.auth_ok::text,
         coalesce((select has_function_privilege('anon', p.oid, 'EXECUTE')::text || '/' ||
                          has_function_privilege('authenticated', p.oid, 'EXECUTE')::text
                   from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = f.nome limit 1), 'ausente')
  from funcoes f
  union all
  select 3, 'colunas novas (avaliacoes 4, leads 4, emails 2)', '10',
         (select count(*)::text from information_schema.columns
          where table_schema = 'public'
            and ((table_name = 'avaliacoes' and column_name in ('versao_metodo', 'versao_analise', 'canal', 'resultado'))
              or (table_name = 'leads' and column_name in ('chave_hash', 'canal', 'pedido_conversa_em', 'primeira_resposta_em'))
              or (table_name = 'emails' and column_name in ('tarefa_id', 'provedor_id'))))
  union all
  select 4, 'anon insere ' || x.tab || '.' || x.col, x.esperado, has_column_privilege('anon', x.tab, x.col, 'INSERT')::text
  from (values ('public.leads', 'nome', 'true'), ('public.leads', 'email', 'true'),
               ('public.leads', 'relatorio_enviado_em', 'false'), ('public.leads', 'responsavel', 'false'),
               ('public.leads', 'chave_hash', 'false'), ('public.leads', 'status', 'false'),
               ('public.avaliacoes', 'indice', 'true'), ('public.avaliacoes', 'canal', 'false'),
               ('public.avaliacoes', 'resultado', 'false')) as x (tab, col, esperado)
  union all
  select 5, 'gatilhos novos', 'atividades_primeira_resposta, leads_pedido_conversa',
         coalesce((select string_agg(tgname, ', ' order by tgname) from pg_trigger
                   where not tgisinternal and tgname in ('atividades_primeira_resposta', 'leads_pedido_conversa')), 'ausente')
  union all
  select 6, 'emails aceita o estado aceito', 'true',
         coalesce((select (pg_get_constraintdef(oid) like '%aceito%')::text from pg_constraint
                   where conname = 'emails_status_check' and conrelid = 'public.emails'::regclass), 'ausente')
  union all
  select 7, 'leads que marcaram algo e estao sem nenhum consentimento (se nao for 0, rode a atualizacao do passo 4)', '0',
         (select count(*)::text from public.leads l
          where (l.empresa is not null or l.consentimento_marketing or l.pediu_contato)
            and not exists (select 1 from public.consentimentos c where c.lead_id = l.id))
  union all
  select 8, 'avaliacoes / leads', 'informativo',
         (select count(*) from public.avaliacoes)::text || ' / ' || (select count(*) from public.leads)::text
  union all
  select 9, 'leads por canal', 'informativo',
         coalesce((select string_agg(canal || '=' || n, ', ' order by canal) from
                   (select canal, count(*) n from public.leads group by 1) q), '')
)
select item, esperado, obtido,
       case when esperado = 'informativo' then '' when esperado = obtido then 'ok' else 'DIFERENTE' end as bate
from linhas order by o, item;
