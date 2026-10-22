# Reset IA — site institucional

[![CI](https://github.com/diegolimanogueira/resetia-site/actions/workflows/ci.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/ci.yml)
[![Deploy](https://github.com/diegolimanogueira/resetia-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/deploy.yml)
[![Smoke em produção](https://github.com/diegolimanogueira/resetia-site/actions/workflows/smoke.yml/badge.svg)](https://github.com/diegolimanogueira/resetia-site/actions/workflows/smoke.yml)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/diegolimanogueira/resetia-site/tree/main)

**Staging (GitHub Pages, noindex):** https://diegolimanogueira.github.io/resetia-site/ · **Produção:** https://www.resetia.com.br

Site de [www.resetia.com.br](https://www.resetia.com.br): RESET 360, IA aplicada a Marketing, Vendas e Customer Success. Páginas `/`, `/solucoes` (portfólio) e `/solucoes/[slug]` (as sete soluções), `/agentes` (catálogo com filtro por área), `/tecnologias` (Spotlite e Fluxa BPM), `/sobre` e `/privacidade`; `/produtos` e `/spotlite` redirecionam para `/tecnologias`. Um objetivo: gerar conversa no WhatsApp.

## Stack

- **Next.js 16** (App Router, TypeScript) com `output: 'export'`: site 100% estático em `out/`.
- **Tailwind v4** com tokens do manual de marca; **shadcn/ui** (Base UI) só para o menu mobile (Sheet).
- **motion** + **Lenis** para o movimento (um só loop de rAF), tudo gateado por `prefers-reduced-motion`.
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
| `NEXT_PUBLIC_MOVIMENTO`          | `false` desliga todo o movimento (depuração, prints determinísticos) |
| `NEXT_PUBLIC_SITE_URL`           | URL pública; usada pelo deploy e pelo smoke                          |

Os eventos de analytics que importam são `cta_whatsapp` (todo clique em link `wa.me`) e `cta_diagnostico` (todo clique no teste de IA da Spotlite), com a origem do botão (`hero`, `fecho`, `home-diagnostico`…). O link do teste leva `utm_source=resetia.<origem>`, que a Spotlite grava no lead.

## Trocar conteúdo

Todo texto do site está em `src/content/`:

| Arquivo          | O quê                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| `site.ts`        | nome, WhatsApp e mensagens, e-mail, fundadores, navegação, rodapé, títulos de SEO     |
| `home.ts`        | os oito atos da home                                                                  |
| `agentes.ts`     | catálogo dos 30 agentes por área, filtro, aviso                                       |
| `solucoes.ts`    | as sete soluções (uma página cada), rótulos da página de solução e o CTA final padrão |
| `spotlite.ts`    | Spotlite: passos, entregas, método, mockup de exemplo, para quem                      |
| `fluxa.ts`       | Fluxa BPM: entregas, o que vem junto, serviço, exemplo                                |
| `tecnologias.ts` | resumo das duas ferramentas (home e soluções), hero e CTA da página Tecnologias       |
| `privacidade.ts` | política de privacidade                                                               |
| `sobre.ts`       | essência, Élida e Diego, convicção                                                    |

Pendências usam a constante `FALTA` (`"[FALTA]"`): `npm run check:falta` lista onde elas aparecem no HTML gerado. Não invente copy: o que falta é fornecido pelo Diego (ver `docs/decisions.md`).

Imagens de marca em `public/brand/`. `npm run images` reotimiza (WebP/AVIF), regenera favicon, ícones PWA, a foto do Sobre e a imagem de compartilhamento (`src/app/opengraph-image.png`). `npm run snapshots:produtos` refaz as capturas dos sites da Spotlite e da Fluxa usadas na página Tecnologias.

## Testes e qualidade

```bash
npm run lint && npm run typecheck && npm run test   # estático + unidade
npm run build && npm run e2e                         # Playwright: E2E, axe, reduced-motion, visual, SEO
npm run lhci                                         # Lighthouse CI (mobile) sobre out/
npm run check:html && npm run check:size && npm run check:falta
```

A pirâmide completa, o que cada camada pega e como atualizar os baselines visuais estão em [`docs/testing.md`](docs/testing.md). O CI (`.github/workflows/ci.yml`) roda tudo isso em cada push e PR; o deploy só acontece com o CI verde.

## Deploy

Static Site no DigitalOcean App Platform, spec em `.do/app.yaml`. `npm run deploy:do` (depois de `doctl auth init`) cria o app, espera o deploy e grava o secret do GitHub. O botão "Deploy to DO" acima cria o app com um clique (template em `.do/deploy.template.yaml`); depois disso o `deploy.yml` passa a publicar a cada CI verde. Enquanto o domínio não aponta, o staging no GitHub Pages (`pages.yml`) publica a mesma `main` em `/resetia-site/` com `noindex`. Passo a passo (token, DNS sem derrubar o e-mail, Uptime, Search Console) em [`docs/deploy.md`](docs/deploy.md).

## Estrutura

```
src/app/            rotas, layout, metadados, sitemap, robots, manifest, 404
src/components/     brand · layout (Header, MobileMenu, Footer) · motion · sections · ui
src/content/        todo o copy, tipado
src/lib/            waUrl(), formatNota(), analytics, media queries
scripts/            optimize-images, og-image, check-falta, screenshots
tests/unit          Vitest · tests/e2e  Playwright
design/handoff/     protótipos e README do Claude Design (fonte de verdade do visual)
docs/               decisions.md · brand.md · testing.md · deploy.md
```

## Documentos

- [`docs/decisions.md`](docs/decisions.md): decisões de arquitetura (ADRs) e pendências.
- [`docs/brand.md`](docs/brand.md): tokens e regras do manual de marca.
- [`CLAUDE.md`](CLAUDE.md) e `AGENTS.md`: regras para agentes de código.
