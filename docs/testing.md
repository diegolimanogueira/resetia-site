# Testes e qualidade — site Reset IA

O site tem um objetivo: gerar conversa no WhatsApp. A pirâmide abaixo protege isso do mais barato ao mais caro. Tudo roda no CI (`.github/workflows/ci.yml`); o deploy só acontece se o CI passar.

## Pirâmide

| Camada      | Ferramenta                                                       | O que pega                                                                                                                                                                                                                                                                                                                                                                           | Comando                                               | Onde roda          |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------ |
| Estático    | TypeScript, ESLint (next/core-web-vitals), Prettier, knip        | Tipos, regras do React 19 (`set-state-in-effect`), formato, exports e dependências mortas                                                                                                                                                                                                                                                                                            | `typecheck` · `lint` · `format:check` · `knip`        | pre-commit, CI     |
| Unidade     | Vitest + Testing Library (jsdom)                                 | `waUrl()` codifica a mensagem certa (geral × Spotlite); `formatNota(7.1) === "7,1"`; conteúdo completo (5 programas × 4 campos, 5 FAQ, 4 passos); limites de SEO (título ≤ 70, descrição ≤ 160); inventário exato de `[FALTA]`; `Botao` (nova aba, noopener, âncora); `SpotliteCard` sem movimento mostra o valor final; `Decode` assenta no texto; `Header` escolhe o tom pela rota | `test`                                                | CI                 |
| Build       | `next build` + size-limit + html-validate + check-falta + lychee | Peso dos bundles (JS, CSS, imagens da home), HTML válido, pendências `[FALTA]` listadas como aviso, links internos e âncoras quebrados                                                                                                                                                                                                                                               | `build` · `check:size` · `check:html` · `check:falta` | CI                 |
| E2E         | Playwright, 4 projetos (ver abaixo), contra o export real        | Navegação e `aria-current`; menu mobile (abre, Esc fecha, navega); **todo link wa.me com a mensagem certa**, nova aba e noopener; decode assenta ≤ 1,2 s; Lenis e cursor ativos; header some ao descer e volta ao subir; seções presas e wipe por clip-path; contador 0 → 7,1 / 11 / 46; hover revela descrição; FAQ um aberto por vez e por teclado; 404                            | `e2e`                                                 | CI                 |
| A11y        | @axe-core/playwright (WCAG 2.1 AA)                               | Zero violações serious/critical em cada rota, desktop e mobile, e na 404                                                                                                                                                                                                                                                                                                             | `e2e` (a11y.spec)                                     | CI                 |
| Reduzido    | Playwright, projeto `reduced-motion`                             | Com `prefers-reduced-motion` tudo está no estado final: sem Lenis, sem cursor, linhas desenhadas, barras verdes, seções `relative`, nota 7,1 de imediato                                                                                                                                                                                                                             | `e2e` (reduced.spec)                                  | CI                 |
| Visual      | Playwright `toHaveScreenshot`, projetos reduced-motion           | Regressão visual determinística (sem animação) das 4 páginas e da 404, desktop e mobile. Baselines Linux commitadas em `tests/e2e/__screenshots__`                                                                                                                                                                                                                                   | `e2e` · `e2e:baselines`                               | CI (Linux)         |
| SEO         | Playwright (seo.spec)                                            | Título, descrição, canonical, `lang`, um só `h1`, `og:image` respondendo `image/png`, JSON-LD Organization, sitemap com as 4 URLs, robots, manifest e ícones                                                                                                                                                                                                                         | `e2e`                                                 | CI, smoke          |
| Performance | Lighthouse CI (mobile, 3 rodadas)                                | Performance ≥ 0,90, Acessibilidade ≥ 0,95, Boas práticas ≥ 0,95, SEO ≥ 0,95 nas 4 páginas; orçamentos por página como asserts `resource-summary` (script ≤ 280 KB, medido ~250 KB em 18/10/2026; imagem ≤ 300 KB; fonte ≤ 150 KB; CSS ≤ 30 KB; total ≤ 600 KB; ≤ 2 terceiros). Relatório em link público no job                                                                      | `lhci`                                                | CI                 |
| Produção    | smoke.yml + DigitalOcean Uptime                                  | Após cada deploy e toda segunda: CTAs, SEO e 404 em `www.resetia.com.br`; links externos com lychee. Uptime Check HTTPS com alerta por e-mail (painel da DO)                                                                                                                                                                                                                         | `BASE_URL=… npx playwright test …`                    | GitHub Actions, DO |

## Projetos do Playwright

| Projeto                 | Navegador / viewport      | Roda                                                          |
| ----------------------- | ------------------------- | ------------------------------------------------------------- |
| `desktop-chromium`      | Chrome 1440×900           | tudo, inclusive `home-movimento.spec.ts` e `redirect.spec.ts` |
| `mobile-webkit`         | iPhone 14 (WebKit, 390)   | tudo menos movimento (sem ponteiro fino) e visual             |
| `reduced-motion`        | Chrome 1440×900, reduzido | `reduced.spec.ts` e `visual.spec.ts`                          |
| `reduced-motion-mobile` | iPhone 14, reduzido       | `visual.spec.ts`                                              |

Os testes rodam contra `out/` servido estaticamente (`npx serve out`), não contra o dev server: o que se testa é o que o DigitalOcean serve. Com `BASE_URL` definido, nenhum servidor sobe e os mesmos specs rodam contra produção.

## Rodando localmente

```bash
npm run test              # unidade
npm run build && npm run e2e   # E2E (sobe o servidor sozinho)
npm run e2e -- --project=desktop-chromium tests/e2e/cta-whatsapp.spec.ts
npm run lhci              # Lighthouse (precisa do out/)
npm run check:html && npm run check:size && npm run check:falta
npm run e2e:baselines     # gera baselines visuais na imagem Docker do Playwright (Linux)
```

## Regressão visual sem flakiness

Snapshots só nos projetos `reduced-motion*`: sem decode, sem contador, sem cursor, sem wipe. Fontes e imagens aguardadas antes do print. Baselines são de Linux (a mesma imagem do CI); em macOS o teste é pulado. Para atualizar depois de uma mudança visual intencional: workflow "Atualizar snapshots visuais" ou `npm run e2e:baselines`.

## O que fica de fora (de propósito)

- Testes de snapshot de componentes React: a regressão visual real cobre melhor e não quebra com refatoração.
- Storybook: site de quatro páginas; os componentes vivem no contexto das seções.
- Cobertura mínima como portão: o site é conteúdo; os números que importam estão no Lighthouse e no axe.

## Pendências de contraste assumidas

Numerais `01/02/03/04` (home e Spotlite) e o `+` do FAQ seguem o manual (verde ou carvão a 25% sobre neutro) e ficam abaixo de 3:1. São decorativos (`aria-hidden`, a ordem está na `<ol>`) e marcados com `data-decorativo`, excluídos do axe. Para AA estrito, trocar para `text-fg` em `ComoFunciona.tsx`, `spotlite/page.tsx` e `accordion.tsx`.
