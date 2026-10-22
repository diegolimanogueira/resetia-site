# Deploy — DigitalOcean App Platform (Static Site)

O site é um export estático (`out/`). Vai para o App Platform como componente `static_site`, no tier gratuito (até 3 apps estáticos, 1 GiB de saída por app/mês; excedente US$ 0,02/GiB). CDN e TLS automáticos. O spec está em `.do/app.yaml`. A DO publica sozinha a cada push na `main` (`deploy_on_push: true`), sem token; o CI protege a `main` no GitHub. O `deploy.yml` com token é opcional e fica dormente sem o secret.

## Staging já no ar (GitHub Pages)

`pages.yml` publica a `main` em https://diegolimanogueira.github.io/resetia-site/ depois de cada CI verde. É o mesmo build, com `NEXT_PUBLIC_BASE_PATH=/resetia-site` e `NEXT_PUBLIC_STAGING=true` (robots noindex, `robots.txt` bloqueando tudo). Serve para conferir no celular e mandar para alguém olhar; produção é o DigitalOcean.

## Se o painel disser "Deploy failed"

Checar, nesta ordem, em Apps → resetia-site → Settings → componente:

1. **Tipo do componente deve ser Static Site, não Web Service.** O painel costuma detectar Next.js como Web Service: o build passa e o deploy falha no health check, porque um site estático não abre porta. Edit → Resource Type → Static Site. (Por garantia, `npm start` agora respeita `$PORT`, então até como Web Service subiria, mas isso custa plano pago sem necessidade.)
2. **Output Directory = `out`.** A DO só detecta sozinha `_static`, `dist`, `public` e `build`; sem isso ela não acha o site.
3. **Build Command = `npm run build`** (ou `npm ci && npm run build`). Node vem de `engines.node` (24.x).
4. **Error Document = `404.html`.**
5. Se ainda falhar, abrir Activity → o deploy → Build Logs / Deploy Logs e copiar as últimas ~40 linhas.

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
3. **Primeiro deploy.** O caminho mais curto é `doctl auth init` (cola o token) e depois `npm run deploy:do`: o script cria o app pelo spec, espera o deploy, grava o token como secret no GitHub e imprime o host para o DNS. Alternativas:
   - Botão **Deploy to DO** no README (lê `.do/deploy.template.yaml`, cria o app no painel em um clique; adicionar os domínios depois em Settings → Domains ou deixando o `deploy.yml` aplicar o spec completo);
   - GitHub → Actions → "Deploy" → Run workflow (usa o secret e o spec); ou
   - `brew install doctl && doctl auth init && doctl apps create --spec .do/app.yaml`.
     Depois do primeiro deploy, anotar o host padrão (`resetia-site-xxxxx.ondigitalocean.app`).
4. **DNS.** O canonical do site é `https://www.resetia.com.br`.

   **Situação encontrada em 18/10/2026:** `resetia.com.br` está estacionado na **Hostinger** (nameservers `lunar/solar.dns-parking.com`, apex A `2.57.91.91`, `www` CNAME para o apex, página "Parked Domain", **nenhum registro MX ou TXT**). Ou seja: a zona DNS se edita no hPanel da Hostinger, e hoje não há e-mail configurado no DNS para proteger; se o `contato@resetia.com.br` for criado depois (Hostinger Email, Google Workspace, Zoho), os registros MX/TXT entram na zona que estiver ativa.
   - `www`: registro **CNAME** → `resetia-site-xxxxx.ondigitalocean.app`.
   - Apex `resetia.com.br`: há dois caminhos.
     - **Recomendado: nameservers na DO** (`ns1/ns2/ns3.digitalocean.com`, trocados no painel onde o domínio está registrado). Como a zona atual só tem o parking da Hostinger, não há nada a migrar. A DO cria A/AAAA do apex e o redirect apex → www funciona pela regra do spec. Se um dia houver e-mail, criar os MX/TXT na zona da DO.
     - **DNS fica na Hostinger**: criar o CNAME de `www`, apagar o A do parking e usar o redirecionamento de domínio da Hostinger para mandar o apex para `https://www.resetia.com.br`. Nesse caso, remover `resetia.com.br` da lista `domains` do spec, ou o DO vai esperar a validação.
   - Propagação: até 48 h. A DO emite o certificado quando o DNS aponta.

5. **Uptime Check.** Painel → Monitoring → Uptime → Create Check: HTTPS `https://www.resetia.com.br`, regiões US-East e EU, alerta por e-mail (1 check é gratuito).
6. **Google Search Console.** Adicionar a propriedade `www.resetia.com.br`, verificar por DNS ou arquivo, enviar `https://www.resetia.com.br/sitemap.xml`.
7. **Analytics.** Criar o site no Umami (cloud.umami.is) ou a propriedade GA4, preencher `NEXT_PUBLIC_ANALYTICS_ID` em `.do/app.yaml` (e `NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4` se for GA4). Os eventos `cta_whatsapp` e `cta_diagnostico` aparecem com a origem do botão (`hero`, `fecho`, `home-diagnostico`…).

## Operação

- **Publicar:** merge na `main` → CI (lint, tipos, unidade, build, HTML, peso, links, E2E, axe, visual, Lighthouse) → Deploy → Smoke. Nada vai ao ar com o CI vermelho.
- **Cache:** a CDN da DO cacheia 24 h e invalida a cada deploy. Não há headers customizados em static site.
- **Rollback:** painel → App → Deployments → Rollback, ou `git revert` + push.
- **Pendências `[FALTA]`:** `npm run check:falta` lista; `npm run check:falta -- --strict` falha o build. Quando CNPJ, política de privacidade e foto chegarem, trocar o `--strict` para o CI (`ci.yml`).
- **Custo esperado:** US$ 0 no tier gratuito até ~1 GiB/mês de saída (≈ 1.700 visitas com a home em ~600 KB). Depois, centavos por GiB.
