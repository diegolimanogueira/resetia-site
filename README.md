# Reset IA — site institucional

[![CI](https://github.com/diegolimanogueira/resetia-site/actions/workflows/ci.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/ci.yml)
[![Deploy](https://github.com/diegolimanogueira/resetia-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/deploy.yml)
[![Smoke em produção](https://github.com/diegolimanogueira/resetia-site/actions/workflows/smoke.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/smoke.yml)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/diegolimanogueira/resetia-site/tree/main)

**Staging (GitHub Pages, noindex):** https://diegolimanogueira.github.io/resetia-site/ · **Produção:** https://www.resetia.com.br

Site de [www.resetia.com.br](https://www.resetia.com.br): RESET 360, IA aplicada a Marketing, Vendas e Customer Success. Layout do protótipo `design/reset360/` com a identidade Reset IA; arquitetura e conteúdo do brief de reestruturação (26/10). Páginas `/`, `/solucoes` e as cinco landing pages em `/solucoes/[slug]` (AI Champions, Processos com IA, Agent Factory, Governance, Performance), `/agentes-de-ia` (catálogo com filtro por área), `/tecnologias` (Spotlite e Fluxa BPM), `/sobre`, `/diagnostico-gratuito` (RESET Scan) e `/privacidade`. Rotas antigas (`/solucoes/scan`, `/solucoes/workshops`, `/agentes`, `/produtos`, `/spotlite`) redirecionam. Objetivo: levar ao diagnóstico gratuito pelo WhatsApp.

## Stack

- **Next.js 16** (App Router, TypeScript) com `output: 'export'`: site 100% estático em `out/`.
- **Tailwind v4** com tokens do manual de marca. Sem biblioteca de componentes: o menu mobile é um botão com `aria-expanded`.
- **Efeitos só em CSS**, como no protótipo: hover em botões e cards, header sticky com blur, scroll suave nativo. Com `prefers-reduced-motion`, sem deslocamento, transição nem scroll suave.
- **DigitalOcean App Platform** (Static Site, tier gratuito), deploy pelo GitHub Actions só com CI verde.
- Conteúdo tipado em `src/content/*.ts`. Sem CMS, sem banco, sem API.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # gera out/
npm start            # serve out/ em http://localhost:4173 (o mesmo que os testes usam)
```

Node 24 (`engines`). Node 26 local funciona.

## Variáveis de ambiente (todas opcionais)

Copie `.env.example` para `.env.local`.

| Variável                         | Para quê                                                             |
| -------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `umami` (padrão) ou `ga4`                                            |
| `NEXT_PUBLIC_ANALYTICS_ID`       | ID do site no Umami ou da propriedade GA4. Sem ela, nada é carregado |
| `NEXT_PUBLIC_ANALYTICS_HOST`     | Umami self-hosted (padrão `https://cloud.umami.is`)                  |
| `NEXT_PUBLIC_SITE_URL`           | URL pública; usada pelo deploy e pelo smoke                          |

Eventos de analytics (todos com a origem do botão, `data-cta`): `cta_diagnostico_gratuito` (WhatsApp do RESET Scan, origens `diagnostico-*`), `cta_whatsapp` (demais conversas, inclusive os CTAs de cada solução `solucao-<slug>`), `cta_pagina_diagnostico` (links para `/diagnostico-gratuito`) e `cta_teste_spotlite` (teste da Spotlite, com `utm_source=resetia.<origem>`, que a Spotlite grava no lead).

## Trocar conteúdo

Todo texto do site está em `src/content/`:

| Arquivo          | O quê                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `site.ts`        | nome, WhatsApp e mensagens (geral e diagnóstico), fundadores, navegação, rodapé, SEO, rotas movidas |
| `home.ts`        | as seções da home (hero, RESET 360 e diagrama, áreas, Scan, tecnologias, fundadores)                |
| `diagnostico.ts` | página do diagnóstico gratuito (RESET Scan) e o teste da Spotlite como alternativa                  |
| `agentes.ts`     | catálogo dos 30 agentes, as três frentes da Agent Factory e a seção de consolidação                 |
| `solucoes.ts`    | as cinco soluções (landing page cada), FAQ do site, rótulos e o CTA final padrão                    |
| `tecnologias.ts` | Spotlite e Fluxa BPM (cards da home e página Tecnologias)                                           |
| `privacidade.ts` | política de privacidade                                                                             |
| `sobre.ts`       | história, Diego e Élida (especialidade, bio, LinkedIn), fechamento, proposta de valor               |

Pendências usam a constante `FALTA` (`"[FALTA]"`): `npm run check:falta` lista onde elas aparecem no HTML gerado. Não invente copy: o que falta é fornecido pelo Diego (ver `docs/decisions.md`).

Imagens de marca em `public/brand/`. `npm run images` reotimiza (WebP/AVIF), regenera favicon, ícones PWA, as fotos dos fundadores (`design/fotos/diego.png` e, quando existir, `elida.png`) e a imagem de compartilhamento (`src/app/opengraph-image.png`).

## Testes e qualidade

```bash
npm run lint && npm run typecheck && npm run test   # estático + unidade
npm run build && npm run e2e                         # Playwright: E2E, axe, visual, SEO
npm run lhci                                         # Lighthouse CI (mobile) sobre out/
npm run check:html && npm run check:size && npm run check:falta
```

A pirâmide completa, o que cada camada pega e como atualizar os baselines visuais estão em [`docs/testing.md`](docs/testing.md). O CI (`.github/workflows/ci.yml`) roda tudo isso em cada push e PR; o deploy só acontece com o CI verde.

## Deploy

Static Site no DigitalOcean App Platform, spec em `.do/app.yaml`. `npm run deploy:do` (depois de `doctl auth init`) cria o app, espera o deploy e grava o secret do GitHub. O botão "Deploy to DO" acima cria o app com um clique (template em `.do/deploy.template.yaml`); depois disso o `deploy.yml` passa a publicar a cada CI verde. Enquanto o domínio não aponta, o staging no GitHub Pages (`pages.yml`) publica a mesma `main` em `/resetia-site/` com `noindex`. Passo a passo (token, DNS sem derrubar o e-mail, Uptime, Search Console) em [`docs/deploy.md`](docs/deploy.md).

## Estrutura

```
src/app/            rotas, layout, metadados, sitemap, robots, manifest, 404
src/components/     brand · layout (Header, MobileMenu, Footer, BarraMobile) · sections · ui
src/content/        todo o copy, tipado
src/lib/            waUrl()/waDiagnostico(), testeSpotliteUrl(), analytics
scripts/            optimize-images, og-image, check-falta, screenshots
tests/unit          Vitest · tests/e2e  Playwright
design/reset360/    protótipo HTML (fonte de verdade do layout); design/handoff/ é o handoff antigo, histórico
docs/               decisions.md · brand.md · testing.md · deploy.md
```

## Documentos

- [`docs/decisions.md`](docs/decisions.md): decisões de arquitetura (ADRs) e pendências.
- [`docs/brand.md`](docs/brand.md): tokens e regras do manual de marca.
- [`CLAUDE.md`](CLAUDE.md) e `AGENTS.md`: regras para agentes de código.
