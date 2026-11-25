#!/usr/bin/env bash
# Aplica supabase/migrations num Postgres temporário e roda supabase/tests/seguranca.sql (papéis anon,
# authenticated e admin). Precisa de initdb, pg_ctl e psql (ex.: brew install postgresql@17). Não toca no Supabase.
set -euo pipefail
cd "$(dirname "$0")/.."
DIR=$(mktemp -d /tmp/resetia-pg.XXXX)
PORTA=${PORTA:-54329}
trap 'pg_ctl -D "$DIR/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
initdb -D "$DIR/data" -U postgres -A trust >/dev/null
pg_ctl -D "$DIR/data" -o "-p $PORTA -k $DIR -c listen_addresses=''" -l "$DIR/log" -w start >/dev/null
SAIDA=$(psql -h "$DIR" -p "$PORTA" -U postgres -X -f supabase/tests/seguranca.sql 2>&1)
echo "$SAIDA"
# Cada cenário negativo precisa ter falhado do jeito certo, e nenhum positivo pode ter falhado.
esperar() { grep -q -- "$1" <<<"$SAIDA" || { echo "FALHOU: esperado '$1'"; exit 1; }; }
esperar "Cadastro fechado"
esperar "duplicate key value violates unique constraint \"avaliacoes_pkey\""
esperar "violates foreign key constraint \"leads_avaliacao_id_fkey\""
esperar "violates check constraint \"leads_email_check\""
esperar "violates check constraint \"leads_whatsapp_check\""
esperar "violates check constraint \"avaliacoes_desafios_check\""
esperar "violates check constraint \"leads_status_check\""
[ "$(grep -c 'permission denied for table' <<<"$SAIDA")" -eq 16 ] || { echo "FALHOU: esperadas 16 permissões negadas"; exit 1; }
esperar "permission denied for function eh_admin"
esperar " contatado | Ligar quinta | t"
esperar " Etapa Um | Empresa Etapa | 5511999990000 | t             | novo"
[ "$(grep -c '^ t$' <<<"$SAIDA")" -ge 3 ] || { echo "FALHOU: completar_lead não devolveu true"; exit 1; }
[ "$(grep -c '^ f$' <<<"$SAIDA")" -ge 1 ] || { echo "FALHOU: completar_lead aceitou id inexistente"; exit 1; }
[ "$(grep -c '^ novo   | t' <<<"$SAIDA")" -eq 1 ] || { echo "FALHOU: status/notas forjados pelo anônimo"; exit 1; }
esperar ' {"nome" : "Etapa Um", "empresa" : "Empresa Etapa"}'
esperar " admin@resetia.com.br | ligacao"
esperar " admin@resetia.com.br | 2026-11-05"
esperar "new row violates row-level security policy for table \"atividades\""
# Materiais (0005): leitura pública só do publicado, escrita só de admin, contadores só pela função, arquivos só de admin.
esperar " admin ve | 2"
esperar "duplicate key value violates unique constraint \"materiais_palavra_key\""
esperar "violates check constraint \"materiais_palavra_check\""
esperar "violates check constraint \"materiais_arquivo_check\""
esperar "new row violates row-level security policy for table \"materiais\""
esperar " sem admin ve | 0"
esperar " anon ve | 1"
esperar " brabo|Guia Brabo|dddddddd-dddd-4ddd-8ddd-dddddddddddd/brabo.pdf"
[ "$(grep -c 'permission denied for table materiais' <<<"$SAIDA")" -eq 5 ] || { echo "FALHOU: esperadas 5 permissões negadas em materiais"; exit 1; }
[ "$(grep -c '^ acesso=t$' <<<"$SAIDA")" -eq 2 ] || { echo "FALHOU: registrar_material não contou os dois acessos"; exit 1; }
esperar " download=t"
esperar " rascunho=f"
esperar " invalido=f"
esperar " brabo acessos=2 downloads=1 editado=f"
esperar " rascunho acessos=0 downloads=0 editado=f"
esperar " brabo titulo=Guia Brabo 2 editado=t"
esperar " anon ve despublicado | 0"
esperar " bucket=materiais publico=t limite=20971520 tipos={application/pdf}"
esperar "new row violates row-level security policy for table \"objects\""
esperar " sem admin ve arquivos | 0"
esperar " admin ve arquivos | 1"
esperar " admin apagou, restam | 0"
esperar " admin ve depois de excluir | 1"
echo "Banco OK: RLS, permissões, CHECKs e gatilhos como esperado."
