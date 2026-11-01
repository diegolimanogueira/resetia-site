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

- **Migrações aplicadas em produção (28/10): só 0001 a 0004.** As `0005` a `0010` estão no repositório e **não foram aplicadas**; as pendentes `0011` e `0012` (`supabase/pendentes/`) têm condição própria. Ordem e verificação em "Publicar a evolução do AI Score", mais abaixo. As quatro primeiras: `supabase/migrations/0001_ai_score.sql` (tabelas, RLS, permissões, `ping()`), `0002_cadastro_fechado.sql` (um gatilho em `auth.users` recusa qualquer cadastro novo; também tira da API a função `rls_auto_enable` do RLS automático do Supabase), `0003_captura_em_duas_etapas.sql` (`completar_lead`) e `0004_crm_email_dicas.sql` (CRM, e-mails, dicas e `lead_liberado`). Conferido pela API pública: o anônimo só insere, cadastro por e-mail e anônimo recusados, o admin lê e só muda os campos do CRM.
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

Código em `supabase/functions/ai-score/` (`index.ts` + `nucleo.js`, gerado por `npm run funcao:nucleo` a partir de `src/lib/ai-score/servidor.ts`). Publicada com **verificação de JWT desligada** (a chave `sb_publishable_…` não é JWT; a própria função autoriza: a chave do lead (só o hash fica no banco), o token do link do e-mail (hash, com finalidade e validade), o segredo do agendador ou o token de um admin da tabela `admins`; o id do lead sozinho não autoriza escrita).

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

## Publicar a evolução do AI Score (fases 3 a 6)

**Nada deste roteiro foi executado.** O código está na branch `feat/ai-score-evolucao`; migrações, função, agendador e site vão a produção só com aprovação do Diego, nesta ordem. A ordem existe por um motivo concreto: **a DigitalOcean publica o site assim que a `main` recebe o merge** (`deploy_on_push`), e o site novo chama ações da função (`registrar`, `completar`, `aprofundar`, `preferencias`) e tabelas que o ambiente atual não tem. Os passos 1 a 3 são compatíveis com o site antigo (as migrações só acrescentam, e a função mantém o caminho dos clientes antigos, apertado), então o ambiente continua funcionando entre um passo e outro. O merge é o passo 5.

| #   | Passo                                                     | Quem faz | Reversível                       |
| --- | --------------------------------------------------------- | -------- | -------------------------------- |
| 0   | Conferir o estado e guardar uma cópia dos dados           | Diego    | n/a (só leitura)                 |
| 1   | Aplicar as migrações `0005` a `0010`, uma por vez         | Diego    | sim (aditivas; ver "Reversão")   |
| 2   | Definir os segredos e publicar a função                   | Diego    | sim (publicar o commit anterior) |
| 3   | Ligar o agendador (pg_cron, pg_net, Vault)                | Diego    | sim (`cron.unschedule`)          |
| 4   | Rodar o smoke contra a função, antes do site              | Diego    | n/a                              |
| 5   | Merge da branch na `main` (publica o site)                | Diego    | sim (Rollback na DO)             |
| 6   | Smoke completo em produção, com a sua própria caixa       | Diego    | n/a                              |
| 7   | Aplicar `supabase/pendentes/0011`                         | Diego    | sim (um `grant`)                 |
| 8   | Aplicar `supabase/pendentes/0012`, só com o contador zero | Diego    | sim (os `grant` ao contrário)    |

### 0. Conferir e guardar uma cópia

Rode as consultas Q1 em diante de `docs/ai-score-evolucao.md` ("Consultas de produção", só leitura) e anote os totais de `avaliacoes` e `leads`. Guarde uma cópia dos dados antes de mexer: Supabase → Table Editor → `avaliacoes`, `leads`, `atividades`, `emails`, `dicas` → Export (CSV). Não conte com backup automático no plano gratuito: sem essa cópia, não há como desfazer uma alteração de dados.

### 1. Migrações `0005` a `0010`

No SQL Editor do projeto `site_resetia`, cole **um arquivo por vez**, na ordem, e confira o resultado antes do seguinte. Se algum falhar, **pare**: não rode o próximo, guarde a mensagem de erro e confira o estado com a consulta abaixo. Todas só acrescentam colunas, tabelas e funções (o cabeçalho de cada arquivo diz a reversão).

| Arquivo                            | O que acrescenta                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `0005_versoes_capturas.sql`        | versões do método e da análise, chave do lead, canal, `relatorios`, `registrar_captura` |
| `0006_tarefas.sql`                 | `tarefas` (e-mail, dicas), `limites`, estados reais de e-mail                           |
| `0007_consentimentos.sql`          | `consentimentos` (finalidade × canal), `elegivel()`, backfill dos leads antigos         |
| `0008_captura.sql`                 | funções de captura e do aprofundamento                                                  |
| `0009_tokens.sql`                  | `tokens` (hash, finalidade, validade, revogação), `ler_relatorio`, `revogar_tokens`     |
| `0010_crm_marcos_preferencias.sql` | `marcos`, `primeira_resposta_em`, `contatos_permitidos()`, preferências por token       |

Verificar depois de cada arquivo (o esperado é o objeto existir e nada de erro):

```sql
-- Tabelas novas, todas com RLS ligado:
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;
-- Contagens inalteradas em relação ao passo 0:
select (select count(*) from public.avaliacoes) avaliacoes, (select count(*) from public.leads) leads;
```

Depois da `0010`, confira pela API que o anônimo continua sem ler nada (use a chave `sb_publishable_…` do `.env.production`): `GET /rest/v1/leads?select=id` deve devolver erro de permissão ou lista vazia, **nunca linhas**; o mesmo para `consentimentos`, `tokens`, `tarefas` e `marcos`.

### 2. Segredos e função

1. Gere o segredo do agendador (mínimo 16 caracteres; use 32 bytes): `openssl rand -hex 32`. Grave em Supabase → Edge Functions → Secrets como `PROCESSADOR_SEGREDO` e **guarde o valor** para o passo 3. Os demais segredos são os da tabela da seção anterior (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_REMETENTE`...). Sem `RESEND_API_KEY`, o e-mail fica "não configurado" e o painel mostra isso; sem `ANTHROPIC_API_KEY`, as dicas vêm da biblioteca.
2. Gere o núcleo e publique, **a partir de um commit que o CI já tenha aprovado**:

```bash
npm run funcao:nucleo && git diff --exit-code supabase/functions/ai-score/nucleo.js
npx supabase functions deploy ai-score --project-ref pjjzjbjamalwkjtlifgm --no-verify-jwt
```

3. Confirme no ar (a função só responde a `POST`):

```bash
URL=https://pjjzjbjamalwkjtlifgm.supabase.co/functions/v1/ai-score
KEY=<sb_publishable_ do .env.production>
# a função está no ar:                                   esperado {"erro":"acao"}
curl -s -X POST $URL -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"acao":"x"}'
# preferências com token inventado (formato válido):     esperado {"erro":"invalido"} (403)
curl -s -o /dev/null -w "%{http_code}\n" -X POST $URL -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"acao":"preferencias","token":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'
# processar sem o segredo e sem ser admin:               esperado 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST $URL -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"acao":"processar"}'
```

### 3. Agendador (pg_cron, pg_net e Vault)

As tarefas (e-mail do relatório, dicas) rodam na hora; o agendador reprocessa o que falhou e limpa o contador de limites. Em Supabase → Database → Extensions, habilite `pg_cron` e `pg_net` (e confirme que o Vault está disponível). Depois, no SQL Editor (troque `<SEGREDO>` pelo valor do `PROCESSADOR_SEGREDO`):

```sql
select vault.create_secret('<SEGREDO>', 'processador_segredo');

select cron.schedule(
  'ai-score-processar', '*/5 * * * *',
  $$ select net.http_post(
       url := 'https://pjjzjbjamalwkjtlifgm.supabase.co/functions/v1/ai-score',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-processador', (select decrypted_secret from vault.decrypted_secrets where name = 'processador_segredo')),
       body := '{"acao":"processar","max":10}'::jsonb,
       timeout_milliseconds := 20000) $$);

select cron.schedule('ai-score-limpar', '17 3 * * *', $$ select public.limpar_expirados() $$);
```

Verificar: `select jobname, schedule, active from cron.job;` mostra os dois ativos; depois de 5 a 10 minutos, `select status, return_message from cron.job_run_details order by start_time desc limit 5;` mostra `succeeded`, e `select status, count(*) from net._http_response group by 1;` mostra respostas 200. A cada 5 minutos o agendador chama a função, mesmo sem tarefa pendente; ele não envia nada sozinho.

### 4. Smoke da função, antes do site

Com o site antigo ainda no ar, faça uma avaliação nele com um e-mail seu e confira que continua entrando em `leads` (caminho dos clientes antigos). Isso prova que a troca de função e de migrações não quebrou quem está usando o site agora.

### 5. Merge e publicação do site

Abra o PR da branch, espere o CI verde (lint, tipos, unidade, build, HTML, peso, links, E2E, axe, visual, Lighthouse) e só então faça o merge. **A DO publica antes de o CI terminar** (memória do projeto): valide tudo localmente (`npm run build && npm run lint && npm run typecheck && npm run test && npm run check:rotas`) e confira que o `.env.production` está completo; o build de produção **falha** sem o Supabase configurado, a menos que `RESETIA_MODO=demo|teste`, de propósito (`scripts/configuracao-build.mjs`). O staging (GitHub Pages, `RESETIA_MODO=demo`) atualiza junto.

### 6. Smoke completo em produção

Use **uma caixa de e-mail e um telefone que sejam seus**. Não use contatos de leads reais.

1. Abra `/ai-score/`, responda o questionário, veja o resultado; deixe nome e e-mail e depois a empresa e o seu WhatsApp. Confira no `/admin` que o lead aparece, com canal `funcao`, e que a aba E-mails mostra o relatório como "aceito" (nunca "entregue").
2. Abra o e-mail no Gmail e no Outlook: assunto, links, renderização. Clique no link do relatório (o endereço perde o código depois de abrir) e baixe o PDF.
3. Faça o aprofundamento, salve, recarregue a página e confira que as respostas continuam.
4. Abra o link de preferências do e-mail, altere uma escolha e confira o evento no painel; marque "quero contato por WhatsApp" e confira que o número só aparece para a equipe depois dessa escolha.
5. No painel, revogue o link do lead e confirme que ele passa a dizer "inválido".
6. Derrube a rede no navegador (modo offline) ao enviar o contato: o resultado abre com aviso de pendente, e a fila reenvia ao voltar.

Pronto quando: lead com canal `funcao`, e-mail aceito, PDF com acentos, preferências gravadas, painel sem o número antes da escolha, nenhum erro no console.

Saúde contínua (SQL Editor, só leitura):

```sql
select status, count(*) from public.tarefas group by 1;                       -- 'falhou' e 'nova-tentativa' são os que pedem olhar
select status, count(*) from public.emails group by 1;                        -- aceito, falhou, nao-configurado
select canal, count(*) from public.leads where criado_em > now() - interval '7 days' group by 1;  -- 'legado' deve ir a zero
```

### 7. Migração pendente `0011` (leitura direta do WhatsApp)

Condição: o painel publicado já lê o telefone por `contatos_permitidos()` (passo 5 feito e smoke ok). Aplicar antes disso quebra a lista do admin com "permission denied for column whatsapp". Rode `supabase/pendentes/0011_leads_sem_whatsapp_direto.sql`; confira que a lista de leads do `/admin` carrega e que o telefone só aparece para quem pediu WhatsApp ou ligação.

### 8. Migração pendente `0012` (fechar o caminho antigo)

Condição: o contador "caminho antigo de gravação" (aba Operação do painel) em zero por um período que a equipe considere seguro (sugestão: 30 dias depois do passo 5, quando o cache dos navegadores com o site antigo já expirou). Antes disso, quem tem o site antigo aberto perderia o contato sem aviso. Rode `supabase/pendentes/0012_fechar_caminho_antigo.sql`.

### Reversão

| O que                 | Como                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Site                  | Painel da DO → Deployments → Rollback, ou `git revert` do merge e push. O site antigo continua falando com a função nova (caminho legado).                         |
| Função                | `git checkout <commit-anterior> -- supabase/functions/ai-score` e o mesmo `functions deploy`. Os dados das tabelas novas ficam; o site antigo não os usa.          |
| Agendador             | `select cron.unschedule('ai-score-processar'); select cron.unschedule('ai-score-limpar');`                                                                         |
| Migrações `0005-0010` | São aditivas: as tabelas, colunas e funções novas podem ficar sem uso. O cabeçalho de cada arquivo diz a reversão específica. Dados só voltam da cópia do passo 0. |
| `0011`                | `grant select on public.leads to authenticated;`                                                                                                                   |
| `0012`                | Os `grant` do arquivo, ao contrário (o cabeçalho tem o texto).                                                                                                     |
| Segredo vazado        | Gere outro `PROCESSADOR_SEGREDO`, atualize o secret da função e o do Vault (`vault.update_secret(<id do segredo>, '<novo valor>')`), ou faça `cron.unschedule`.    |

### O que este roteiro não valida

Entrega real no Gmail e no Outlook (o provedor só diz "aceito"), a renderização do e-mail em clientes reais, o Lighthouse em produção e a rotina do agendador por dias seguidos. Ficam como conferências suas depois do passo 6.

## Operação

- **Publicar:** merge na `main` → CI (lint, tipos, unidade, build, HTML, peso, links, E2E, axe, visual, Lighthouse) → Deploy → Smoke. Nada vai ao ar com o CI vermelho.
- **Cache:** a CDN da DO cacheia 24 h e invalida a cada deploy. Não há headers customizados em static site.
- **Rollback:** painel → App → Deployments → Rollback, ou `git revert` + push.
- **Pendências `[FALTA]`:** `npm run check:falta` lista; `npm run check:falta -- --strict` falha o build. Quando CNPJ, política de privacidade e foto chegarem, trocar o `--strict` para o CI (`ci.yml`).
- **Custo esperado:** US$ 0 no tier gratuito até ~1 GiB/mês de saída (≈ 1.700 visitas com a home em ~600 KB). Depois, centavos por GiB.
