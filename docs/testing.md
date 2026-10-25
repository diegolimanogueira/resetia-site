# Testes e qualidade — site Reset IA

O site tem um objetivo: gerar conversa no WhatsApp. A pirâmide abaixo protege isso do mais barato ao mais caro. Tudo roda no CI (`.github/workflows/ci.yml`).

## Pirâmide

| Camada      | Ferramenta                                                       | O que pega                                                                                                                                                                                                                                                                                                                                                                   | Comando                                                               | Onde roda          |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------ |
| Estático    | TypeScript, ESLint (next/core-web-vitals), Prettier, knip        | Tipos, regras do React 19 (`set-state-in-effect`), formato, exports e dependências mortas                                                                                                                                                                                                                                                                                    | `typecheck` · `lint` · `format:check` · `knip`                        | pre-commit, CI     |
| Unidade     | Vitest + Testing Library (jsdom)                                 | `waUrl()` codifica a mensagem certa (geral × solução); conteúdo completo (7 soluções, 30 agentes / 10 por área, hero em 4 linhas, 4 etapas do método); navegação com as âncoras da home; destaques `*…*` em pares; limites de SEO; nenhum `[FALTA]` visível; `Botao` (nova aba, noopener, seta); `Linhas` (quebra e `<em>`); `Header` (sticky, `aria-current`, menu com Esc) | `test`                                                                | CI                 |
| Build       | `next build` + size-limit + html-validate + check-falta + lychee | Peso dos bundles (JS ≤ 220 KB, CSS ≤ 20 KB, imagens da home), HTML válido, pendências `[FALTA]` listadas como aviso, links internos e âncoras quebrados                                                                                                                                                                                                                      | `build` · `check:size` · `check:html` · `check:falta` · `check:links` | CI                 |
| E2E         | Playwright, 4 projetos (ver abaixo), contra o export real        | Navegação (âncoras `#metodo`, `#tecnologias`, `aria-current`); header sticky e carvão; menu mobile (abre, Esc fecha e devolve o foco, navega); **todo link wa.me com a mensagem certa**, nova aba e noopener; teste de IA com `utm_source`; sete páginas de solução; filtro de agentes por área com `?area=`; redirecionamentos para as seções da home; 404                  | `e2e`                                                                 | CI                 |
| A11y        | @axe-core/playwright (WCAG 2.1 AA)                               | Zero violações serious/critical em cada rota, desktop e mobile, e na 404                                                                                                                                                                                                                                                                                                     | `e2e` (a11y.spec)                                                     | CI                 |
| Visual      | Playwright `toHaveScreenshot`, projetos reduced-motion           | Regressão visual determinística das 5 páginas e da 404, desktop e mobile. Baselines Linux commitadas em `tests/e2e/__screenshots__`                                                                                                                                                                                                                                          | `e2e` · `e2e:baselines`                                               | CI (Linux)         |
| SEO         | Playwright (seo.spec)                                            | Título, descrição, canonical, `lang`, um só `h1`, `og:image` respondendo `image/png`, JSON-LD Organization, sitemap com 11 URLs (sem âncoras nem rotas antigas), robots, manifest e ícones                                                                                                                                                                                   | `e2e`                                                                 | CI, smoke          |
| Performance | Lighthouse CI (mobile, 3 rodadas)                                | Performance ≥ 0,90, Acessibilidade ≥ 0,95, Boas práticas ≥ 0,95, SEO ≥ 0,95 nas 5 páginas; orçamentos por página (script ≤ 185 KB, medido ~157 KB em 25/10/2026; imagem ≤ 300 KB; fonte ≤ 150 KB; CSS ≤ 30 KB; total ≤ 600 KB; ≤ 2 terceiros). Relatório em link público no job                                                                                              | `lhci`                                                                | CI                 |
| Produção    | smoke.yml + DigitalOcean Uptime                                  | Após cada deploy e toda segunda: CTAs, SEO e 404 em `www.resetia.com.br`; links externos com lychee                                                                                                                                                                                                                                                                          | `BASE_URL=… npx playwright test …`                                    | GitHub Actions, DO |

## Projetos do Playwright

| Projeto                 | Navegador / viewport      | Roda              |
| ----------------------- | ------------------------- | ----------------- |
| `desktop-chromium`      | Chrome 1440×900           | tudo menos visual |
| `mobile-webkit`         | iPhone 14 (WebKit, 390)   | tudo menos visual |
| `reduced-motion`        | Chrome 1440×900, reduzido | `visual.spec.ts`  |
| `reduced-motion-mobile` | iPhone 14, reduzido       | `visual.spec.ts`  |

Os testes rodam contra `out/` servido estaticamente (`npx serve out`), não contra o dev server: o que se testa é o que o DigitalOcean serve. Com `BASE_URL` definido, nenhum servidor sobe e os mesmos specs rodam contra produção.

## Rodando localmente

```bash
npm run test              # unidade
npm run build && npm run e2e   # E2E (sobe o servidor sozinho)
npm run e2e -- --project=desktop-chromium tests/e2e/cta-whatsapp.spec.ts
npx lhci collect && npx lhci assert   # Lighthouse sem publicar o relatório (precisa do out/)
npm run check:html && npm run check:size && npm run check:falta && npm run check:links
npm run e2e:baselines     # gera baselines visuais na imagem Docker do Playwright (Linux); rodar depois do build
```

## Regressão visual sem flakiness

Snapshots só nos projetos `reduced-motion*` (sem transição nem scroll suave). Fontes e imagens aguardadas antes do print. Baselines são de Linux (a mesma imagem do CI); em macOS o teste é pulado. Para atualizar depois de uma mudança visual intencional: workflow "Atualizar snapshots visuais" ou `npm run build && npm run e2e:baselines`.

## O que fica de fora (de propósito)

- Testes de snapshot de componentes React: a regressão visual real cobre melhor e não quebra com refatoração.
- Storybook: site pequeno; os componentes vivem no contexto das seções.
- Cobertura mínima como portão: o site é conteúdo; os números que importam estão no Lighthouse e no axe.

## Exclusões do axe

As órbitas do hero (`data-decorativo`, `aria-hidden`) ficam fora do axe: repetem as três áreas, que aparecem como texto na seção Áreas.
