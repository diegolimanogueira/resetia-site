# Deploy — DigitalOcean App Platform (Static Site)

O site é um export estático (`out/`). Vai para o App Platform como componente `static_site`, no tier gratuito (até 3 apps estáticos, 1 GiB de saída por app/mês; excedente US$ 0,02/GiB). CDN e TLS automáticos. O spec está em `.do/app.yaml`; o deploy é disparado pelo GitHub Actions **só depois que o CI passa** (`deploy.yml`).

## Staging já no ar (GitHub Pages)

`pages.yml` publica a `main` em https://diegolimanogueira.github.io/resetia-site/ depois de cada CI verde. É o mesmo build, com `NEXT_PUBLIC_BASE_PATH=/resetia-site` e `NEXT_PUBLIC_STAGING=true` (robots noindex, `robots.txt` bloqueando tudo). Serve para conferir no celular e mandar para alguém olhar; produção é o DigitalOcean.

## O que já está pronto no repositório

- `.do/app.yaml`: build (`npm ci && npm run build`), `output_dir: out`, `error_document: 404.html`, domínios `www` (primário) e apex (alias) e redirect 301 apex → www.
- `.github/workflows/deploy.yml`: roda `digitalocean/app_action/deploy@v2` com o spec quando o workflow CI termina verde na `main`.
- `.github/workflows/smoke.yml`: depois de cada deploy e toda segunda, testa produção (CTAs, SEO, 404) e os links externos.
- `engines.node: 24.x`: o buildpack Node do DO lê isso (suporta até 24.x). `NODE_ENV=development` no build para instalar as devDependencies.

## O que só o Diego pode fazer (uma vez)

1. **Token da DO.** Painel → API → Tokens → Generate New Token (escopo: apps read/write). Guardar no GitHub:
   ```bash
   gh secret set DIGITALOCEAN_ACCESS_TOKEN --repo diegolimanogueira/resetia-site
   ```
2. **Autorizar o GitHub na DO.** Painel → Apps → Create App → GitHub → autorizar a conta `diegolimanogueira` e o repositório `resetia-site` (pode cancelar a criação depois de autorizar; o spec cria o app).
3. **Primeiro deploy.** Três opções:
   - Botão **Deploy to DO** no README (lê `.do/deploy.template.yaml`, cria o app no painel em um clique; adicionar os domínios depois em Settings → Domains ou deixando o `deploy.yml` aplicar o spec completo);
   - GitHub → Actions → "Deploy" → Run workflow (usa o secret e o spec); ou
   - `brew install doctl && doctl auth init && doctl apps create --spec .do/app.yaml`.
     Depois do primeiro deploy, anotar o host padrão (`resetia-site-xxxxx.ondigitalocean.app`).
4. **DNS.** O canonical do site é `https://www.resetia.com.br`.
   - `www`: registro **CNAME** → `resetia-site-xxxxx.ondigitalocean.app`.
   - Apex `resetia.com.br`: há dois caminhos.
     - **Nameservers na DO** (`ns1/ns2/ns3.digitalocean.com`). A DO cria A/AAAA e o redirect apex → www funciona pela regra do spec. **Antes de trocar os NS, recriar na DO todos os registros existentes, em especial os MX e TXT (SPF/DKIM) do e-mail `contato@resetia.com.br`.** Se não, o e-mail para.
     - **DNS fica no Registro.br**: só o CNAME de `www`; o apex usa o redirecionamento do próprio Registro.br (ou um A para o IP de redirect da DO, se a DO fornecer). Nesse caso, remover `resetia.com.br` da lista `domains` do spec, ou o DO vai esperar a validação.
   - Propagação: até 48 h. A DO emite o certificado quando o DNS aponta.
5. **Uptime Check.** Painel → Monitoring → Uptime → Create Check: HTTPS `https://www.resetia.com.br`, regiões US-East e EU, alerta por e-mail (1 check é gratuito).
6. **Google Search Console.** Adicionar a propriedade `www.resetia.com.br`, verificar por DNS ou arquivo, enviar `https://www.resetia.com.br/sitemap.xml`.
7. **Analytics.** Criar o site no Umami (cloud.umami.is) ou a propriedade GA4, preencher `NEXT_PUBLIC_ANALYTICS_ID` em `.do/app.yaml` (e `NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4` se for GA4). O evento `cta_whatsapp` aparece com a origem do botão (`hero`, `fecho`, `spotlite`…).

## Operação

- **Publicar:** merge na `main` → CI (lint, tipos, unidade, build, HTML, peso, links, E2E, axe, visual, Lighthouse) → Deploy → Smoke. Nada vai ao ar com o CI vermelho.
- **Cache:** a CDN da DO cacheia 24 h e invalida a cada deploy. Não há headers customizados em static site.
- **Rollback:** painel → App → Deployments → Rollback, ou `git revert` + push.
- **Pendências `[FALTA]`:** `npm run check:falta` lista; `npm run check:falta -- --strict` falha o build. Quando CNPJ, política de privacidade e foto chegarem, trocar o `--strict` para o CI (`ci.yml`).
- **Custo esperado:** US$ 0 no tier gratuito até ~1 GiB/mês de saída (≈ 1.700 visitas com a home em ~600 KB). Depois, centavos por GiB.
