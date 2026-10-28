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
[ "$(grep -c 'permission denied for table' <<<"$SAIDA")" -eq 7 ] || { echo "FALHOU: esperadas 7 permissões negadas"; exit 1; }
esperar "permission denied for function eh_admin"
esperar " contatado | Ligar quinta | t"
[ "$(grep -c '^ novo   | t' <<<"$SAIDA")" -eq 1 ] || { echo "FALHOU: status/notas forjados pelo anônimo"; exit 1; }
echo "Banco OK: RLS, permissões, CHECKs e gatilhos como esperado."
