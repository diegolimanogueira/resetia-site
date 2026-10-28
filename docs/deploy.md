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
7. **Analytics.** Criar o site no Umami (cloud.umami.is) ou a propriedade GA4, preencher `NEXT_PUBLIC_ANALYTICS_ID` em `.do/app.yaml` (e `NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4` se for GA4). Os eventos (`cta_ai_score`, `cta_diagnostico_gratuito`, `cta_whatsapp`, `ai_score_concluido`, `ai_score_lead`…) aparecem com a origem do botão (`ai-score-hero`, `diagnostico-final`…).

## RESET AI Score: Supabase

Configurado em 28/10/2026 no projeto **`site_resetia`** (`pjjzjbjamalwkjtlifgm`, South America / São Paulo, plano gratuito; o `projetosunimed` foi pausado para liberar a vaga).

- **Migrações aplicadas:** `supabase/migrations/0001_ai_score.sql` (tabelas, RLS, permissões, `ping()`), `0002_cadastro_fechado.sql` (um gatilho em `auth.users` recusa qualquer cadastro novo; também tira da API a função `rls_auto_enable` do RLS automático do Supabase), `0003_captura_em_duas_etapas.sql` (`completar_lead`) e `0004_crm_email_dicas.sql` (CRM, e-mails, dicas e `lead_liberado`). Conferido pela API pública: o anônimo só insere, cadastro por e-mail e anônimo recusados, o admin lê e só muda os campos do CRM.
- **Admin:** `contato@resetia.com.br`, criado direto no banco e já em `public.admins`. A senha foi entregue ao Diego; a recuperação por e-mail passa a funcionar quando a caixa existir.
- **Chaves no site:** `.env.production` (versionado) traz a URL e a chave `sb_publishable_…`. O `next build` lê esse arquivo na DigitalOcean, sem configurar o painel. O CI sobrescreve com um Supabase fictício e o staging com valores vazios (modo demonstração). Não declarar essas variáveis no painel da DO: um valor vazio lá venceria o arquivo.
- **Keep-alive:** as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão em GitHub → Settings → Variables; o `keepalive.yml` chama `public.ping()` a cada dois dias.

**Cadastrar outro admin.** Com o cadastro fechado, o usuário nasce pelo SQL Editor (troque e-mail e senha):

```sql
select set_config('resetia.permitir_cadastro', 'sim', true);
with u as (
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'NOVO-EMAIL', extensions.crypt('SENHA-FORTE', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  returning id, email
), i as (
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), id, id::text, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
         'email', now(), now(), now() from u
)
insert into public.admins (user_id) select id from u;
```

**Trocar a senha de um admin** (SQL Editor): `update auth.users set encrypted_password = extensions.crypt('NOVA-SENHA', extensions.gen_salt('bf')) where email = 'contato@resetia.com.br';`

**Se o projeto pausar** (o GitHub avisa quando o keep-alive falha): painel do Supabase → Restore. O site guarda no navegador o que não conseguiu gravar e reenvia quando a pessoa volta. Para eliminar o risco, plano Pro (US$ 25/mês, organização separada).

## Função `ai-score`: relatório por e-mail e dicas por IA

Código em `supabase/functions/ai-score/` (`index.ts` + `nucleo.js`, gerado por `npm run funcao:nucleo` a partir de `src/lib/ai-score/servidor.ts`). Publicada com **verificação de JWT desligada** (a chave `sb_publishable_…` não é JWT; a própria função confere o par lead e avaliação e, no e-mail do admin, o token e a tabela `admins`).

**Publicar de novo** (depois de mexer em `src/lib/ai-score`, no conteúdo do AI Score ou na função):

```bash
npm run funcao:nucleo
npx supabase functions deploy ai-score --project-ref pjjzjbjamalwkjtlifgm --no-verify-jwt
```

(Pede `npx supabase login` uma vez.) Sem a CLI, dá para publicar pelo MCP do Supabase trocando, no `index.ts` enviado, o `./nucleo.js` pela URL do jsDelivr fixada no commit (`https://cdn.jsdelivr.net/gh/diegolimanogueira/resetia-site@<sha>/supabase/functions/ai-score/nucleo.js`), como foi feito na primeira publicação.

**Segredos** (Supabase → Edge Functions → Secrets). Sem eles a função funciona em modo reserva: dicas da biblioteca e e-mail "não configurado".

| Segredo                                 | Valor                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                     | Chave da API da Anthropic (console.anthropic.com). Defina um teto de gasto mensal no console. |
| `RESEND_API_KEY`                        | Chave do Resend (resend.com), depois de verificar o domínio.                                  |
| `EMAIL_REMETENTE`                       | `Reset IA <contato@resetia.com.br>`                                                           |
| `EMAIL_RESPOSTA`                        | Opcional: endereço que recebe as respostas, se não for o remetente.                           |
| `SITE_URL`                              | Opcional; padrão `https://www.resetia.com.br`.                                                |
| `DICAS_POR_HORA`, `RELATORIOS_POR_HORA` | Opcionais; padrão 20 e 30 (limites contra abuso).                                             |

**E-mail (Resend), uma vez:** criar a conta, adicionar o domínio `resetia.com.br` (região São Paulo, se oferecida) e criar no DNS do domínio os registros que o Resend mostrar (SPF e DKIM, em geral num subdomínio `send.`; não mexem no MX que recebe o e-mail de `contato@`). Quando o domínio aparecer como verificado, criar a chave e gravar `RESEND_API_KEY` e `EMAIL_REMETENTE`. Recomendado: um registro DMARC (`_dmarc`, `v=DMARC1; p=none; rua=mailto:contato@resetia.com.br`).

**Conferir no ar:**

```bash
curl -s -X POST https://pjjzjbjamalwkjtlifgm.supabase.co/functions/v1/ai-score \
  -H "Authorization: Bearer sb_publishable_OaKut3f98HlEiw8v5B0t_g_JnZhwa3h" \
  -H "Content-Type: application/json" -d '{"acao":"x"}'
# {"erro":"acao"}: a função está no ar
```

Os logs ficam em Supabase → Edge Functions → ai-score → Logs. No admin, a seção E-mails de cada lead mostra o que saiu, o que falhou e por quê.

## Operação

- **Publicar:** merge na `main` → CI (lint, tipos, unidade, build, HTML, peso, links, E2E, axe, visual, Lighthouse) → Deploy → Smoke. Nada vai ao ar com o CI vermelho.
- **Cache:** a CDN da DO cacheia 24 h e invalida a cada deploy. Não há headers customizados em static site.
- **Rollback:** painel → App → Deployments → Rollback, ou `git revert` + push.
- **Pendências `[FALTA]`:** `npm run check:falta` lista; `npm run check:falta -- --strict` falha o build. Quando CNPJ, política de privacidade e foto chegarem, trocar o `--strict` para o CI (`ci.yml`).
- **Custo esperado:** US$ 0 no tier gratuito até ~1 GiB/mês de saída (≈ 1.700 visitas com a home em ~600 KB). Depois, centavos por GiB.
