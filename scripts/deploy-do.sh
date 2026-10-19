#!/usr/bin/env bash
# Primeiro deploy na DigitalOcean em um comando. Pré-requisito único: `doctl auth init` (cole um token da DO).
# Faz: cria/atualiza o app a partir de .do/app.yaml, espera o deploy, grava o token como secret no GitHub
# (para o deploy.yml publicar a cada CI verde) e imprime o host para o DNS.
set -euo pipefail
cd "$(dirname "$0")/.."

APP_NAME="resetia-site"
REPO="diegolimanogueira/resetia-site"
SPEC=".do/app.yaml"

falha() { echo "✗ $1"; exit 1; }
command -v doctl >/dev/null || falha "doctl não encontrado. Instale: brew install doctl"
command -v gh >/dev/null || falha "gh não encontrado. Instale: brew install gh"
doctl account get >/dev/null 2>&1 || falha "doctl sem autenticação. Rode: doctl auth init  (token em cloud.digitalocean.com/account/api/tokens, escopo de apps)"
gh auth status >/dev/null 2>&1 || falha "gh sem autenticação. Rode: gh auth login"

echo "→ Procurando app '$APP_NAME'…"
APP_ID=$(doctl apps list -o json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const a=JSON.parse(s||"[]").find(x=>x.spec&&x.spec.name===process.argv[1]);console.log(a?a.id:"")})' "$APP_NAME")

if [ -z "$APP_ID" ]; then
  echo "→ Criando o app a partir de $SPEC (aguarda o primeiro deploy, até 30 min)…"
  if ! APP_ID=$(doctl apps create --spec "$SPEC" --wait --format ID --no-header 2>/tmp/deploy-do.err); then
    cat /tmp/deploy-do.err
    if grep -qi "github" /tmp/deploy-do.err; then
      echo "✗ A DigitalOcean ainda não tem acesso ao repositório. No painel: Apps → Create App → GitHub → autorizar '$REPO'. Depois rode este script de novo."
    fi
    exit 1
  fi
else
  echo "→ App já existe ($APP_ID). Aplicando o spec e aguardando o deploy…"
  doctl apps update "$APP_ID" --spec "$SPEC" --wait >/dev/null
fi

INFO=$(doctl apps get "$APP_ID" -o json)
HOST=$(echo "$INFO" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const a=JSON.parse(s)[0]||{};console.log(a.default_ingress||a.live_url||"")})')
echo "✓ App $APP_ID no ar em: ${HOST:-<sem URL ainda>}"

# Token do doctl → secret do GitHub (deploy.yml passa a publicar sozinho a cada CI verde)
CFG="$HOME/Library/Application Support/doctl/config.yaml"
[ -f "$CFG" ] || CFG="$HOME/.config/doctl/config.yaml"
TOKEN=$(grep -E '^\s*access-token:' "$CFG" 2>/dev/null | head -1 | sed -E 's/^\s*access-token:\s*//; s/^"//; s/"$//' || true)
if [ -n "${TOKEN:-}" ]; then
  gh secret set DIGITALOCEAN_ACCESS_TOKEN --repo "$REPO" --body "$TOKEN"
  echo "✓ Secret DIGITALOCEAN_ACCESS_TOKEN gravado em $REPO."
else
  echo "! Não achei o token em $CFG. Grave manualmente: gh secret set DIGITALOCEAN_ACCESS_TOKEN --repo $REPO"
fi

cat <<FIM

Próximo passo: DNS (detalhes em docs/deploy.md)
  www.resetia.com.br   CNAME  →  ${HOST#https://}
  resetia.com.br       →  nameservers da DO (ns1/ns2/ns3.digitalocean.com) ou redirecionamento do apex para www
Quando o DNS apontar, a DO emite o certificado e o workflow "Smoke em produção" valida o site.
FIM
