# Decisões de arquitetura — site Reset IA

Registros curtos (ADR). Data no título. Mudou de ideia? Adicione um novo registro, não apague o antigo.

## 2026-10-18 · Fonte de verdade do design

O handoff do Claude Design (`design/handoff/`) manda em copy, visual e movimento. O prompt original complementa onde o handoff não cobre (stack, SEO, 404, analytics, deploy). Onde divergem, vale o handoff: hero com `porta.png` (não malha SVG), Ato 4 com bússola sticky (não pin com troca de conteúdo), wipe de 45% da viewport, cursor sem modo "ícone". Adicionado ao handoff, a pedido do Diego: smooth scroll com Lenis. Fora: cortina de transição entre páginas.

## 2026-10-18 · Next.js com `output: 'export'`

Nenhum recurso server-side. O build gera `out/` e qualquer host estático serve. `trailingSlash: true` para gerar `rota/index.html`. `images.unoptimized: true`; as imagens já saem otimizadas de `scripts/optimize-images.mjs` (WebP/AVIF commitados). Cache Components do Next 16 desligado no scaffold: é recurso de render dinâmico.

## 2026-10-18 · DigitalOcean App Platform como Static Site

Componente `static_site` (não Web Service Node). Tier gratuito: até 3 apps estáticos, 1 GiB de saída por app/mês, excedente US$ 0,02/GiB. CDN e TLS automáticos. Sem headers customizados em static site; redirect apex → www via `ingress.rules`. Buildpack Node lê `engines.node` (até 24.x), por isso `"node": "24.x"` no `package.json`. Node 26 local funciona normalmente.

## 2026-10-18 · Movimento com `motion` + Lenis, um só loop

`motion` (ex-Framer Motion, import de `motion/react`) para scroll, spring e inView. Lenis com `autoRaf: false`, avançado pelo `frame` do Motion, para não ter dois loops de rAF. Tudo gateado por `useMotionOk()` (`MotionProvider`): `prefers-reduced-motion` ou `movimento=false` deixam o site estático.

## 2026-10-18 · shadcn/ui só para Sheet e Accordion

CLI v4 com Base UI (primitivo padrão desde jul/2026). Só `sheet` (menu mobile) e `accordion` (FAQ): são os dois lugares onde foco, aria e teclado precisam estar certos. O botão pill é componente próprio (`Botao`): dois estilos, comportamento magnético na Fase 2; o sistema de variantes do shadcn não acrescentaria nada.

## 2026-10-18 · Conteúdo tipado em `src/content`

Nenhuma string de copy em componente. `site.ts` é a fonte única de contato, redes e metadados. Pendências do Diego usam a constante `FALTA`; `scripts/check-falta.mjs` lista as ocorrências no build.

## 2026-10-18 · Tom por seção via `data-tom`

Seções alternam carvão e neutro. Em vez de duplicar classes, cada seção tem `data-tom` e variáveis CSS (`--bg`, `--fg`, `--fg-2`, `--line`); componentes compartilhados (`SpotliteCard`, `DepoisBlocos`, `CtaFinal`) ficam agnósticos ao fundo.

## 2026-10-18 · Numerais decorativos abaixo de 3:1 de contraste

O manual pede numerais `01/02/03` em verde (home) e carvão a 25% (Spotlite) sobre neutro, e o `+` do FAQ em verde. Ficam em ~1,6:1 e ~1,8:1. Decisão: manter o design, marcar como decorativos (`aria-hidden`, `data-decorativo`; a ordem já está na `<ol>`) e excluir do axe. Registrado em `docs/testing.md`. Se o Diego quiser AA estrito, a troca é `text-fg` em três lugares.

## 2026-10-18 · OG image como PNG estático gerado por script

`opengraph-image.tsx` em export estático gera um arquivo sem extensão (`out/opengraph-image`), que hosts estáticos servem como `text/html`. `scripts/og-image.mjs` usa o mesmo `next/og` (Satori) para gerar `src/app/opengraph-image.png` + `.alt.txt` (convenção de arquivo), commitados; `npm run images` regenera.

## 2026-10-18 · Peso do JS: medido, não adivinhado

A home carrega ~250 KB (transfer) de JS: React 19 + runtime do Next 16 (~150 KB), Motion (~70 KB), Base UI + Lenis (~30 KB). `LazyMotion`/`m.*` foi testado e economizou 1,4 KB (a engine entra por `useSpring`, `useScroll` e `animate` de qualquer jeito), então ficou fora. Orçamento do Lighthouse: script ≤ 280 KB, total ≤ 600 KB; Performance mobile medida em 91–95. Próximo corte real, se precisar: carregar `WipeStack`, `Cursor` e `SpotliteCard` com `next/dynamic` só em desktop.

## 2026-10-19 · Conteúdo alinhado aos produtos reais (Spotlite e Fluxa BPM)

A pedido do Diego, o site passou a descrever a Spotlite pelo que o produto é em spotlite.com.br: diagnóstico com IA, equipe inteira responde, nota de 0 a 10 por regra fixa em cinco dimensões, mapa de horas por semana, oportunidades em reais sempre como estimativa, Shadow AI só agregado, revisão da Reset IA, referências públicas (Gartner, MIT CISR, BCG, NIST AI RMF 1.0, ISO/IEC 42001:2023). O mockup do relatório espelha a estrutura do relatório real, com dados fictícios. A Fluxa BPM (fluxabpm.com.br) entra como segunda ferramenta: gestão de processos com IA. Todo link para as ferramentas aponta para os sites dos produtos. Saíram: tempos e quantidade de módulos dos treinamentos, CNPJ e LinkedIn (perfil da Reset IA ainda não existe). Mensagem transversal: foco em empresas e colaboradores, retorno e geração de valor.

## 2026-10-19 · Aba Produtos, Fluxa com o mesmo peso e processo com as duas ferramentas

A aba "Spotlite" virou "Produtos" (`/produtos`): Spotlite e Fluxa BPM lado a lado, cada uma com mockup, CTAs externos e WhatsApp com mensagem própria. A rota `/spotlite` ficou como redirecionamento no cliente (noindex, canonical em `/produtos`). O processo da consultoria na home passou a quatro passos, com a Spotlite no diagnóstico e na medição e a Fluxa no redesenho dos processos. Elementos de conversão adicionados sem sair da identidade: barra fixa de WhatsApp no celular (aparece depois do hero, `inert` enquanto escondida), microcopy "WhatsApp direto, sem formulário" sob os CTAs, prova social: fundador é arquiteto de IA no centro de excelência de IA da Unimed Nacional. Política de privacidade geral, no padrão LGPD, publicada em `/privacidade`; o último `[FALTA]` visível é a foto do Diego.

## 2026-10-19 · Foto do Diego e capturas reais dos produtos

Sobre: foto redonda de 112px (≈3 cm) ao lado de uma descrição curta e três destaques de valor (equipes treinadas em IEL, Fortes Tecnologia, FortesPay e Longevidade Saudável; produtos próprios usados nos treinamentos; base técnica e certificações). A trilha de Champions da Unimed ainda não começou e, a pedido do Diego, não aparece no site. Fonte em `design/fotos/diego.png`; `npm run images` gera AVIF/WebP/JPG quadrados centrados no rosto. Produtos: capturas reais das páginas iniciais de spotlite.com.br e fluxabpm.com.br (`npm run snapshots:produtos`, Playwright + sharp), com legenda e link; refazer quando os produtos mudarem de cara. Com isso não resta nenhum `[FALTA]` no site.

## 2026-10-19 · Cores das ferramentas só como marca

As ferramentas têm identidade própria (Spotlite: ponto laranja `#FF7A45` sobre fundo quente; Fluxa: verde `#0B7A4F`). No site da Reset IA elas aparecem só como um ponto na cor da marca ao lado do nome (`MarcaFerramenta`). Nenhum fundo, botão ou traço do site usa essas cores: o verde Reset continua sendo o único acento.

## 2026-10-18 · Deploy gated pelo CI

`deploy_on_push: false` no app spec. GitHub Actions faz o deploy só se o CI (lint, tipos, unit, build, E2E, axe, Lighthouse) passar na `main`. Visual regression roda só no CI (Linux); baselines geradas na imagem Docker oficial do Playwright.
