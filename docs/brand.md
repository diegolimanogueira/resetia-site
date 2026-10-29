# Identidade visual — Reset IA (manual de marca + layout do protótipo reset360)

Desde 25/10/2026 o layout, a estrutura e os efeitos seguem `design/reset360/`; a identidade (cores, logo, tipografia) é a do manual abaixo. O lime do protótipo é sempre o verde Reset IA. Desde 29/10/2026 o site é **claro** (neutro), com o CTA final e o rodapé em carvão; o protótipo continua valendo para layout e efeitos.

## Cores

| Token       | Hex       | Uso                                                                        |
| ----------- | --------- | -------------------------------------------------------------------------- |
| carvão      | `#0B0F0E` | texto; fundo do fecho (CTA final e rodapé)                                 |
| neutro      | `#F6F7F5` | fundo da página; texto no fecho                                            |
| verde reset | `#00E676` | acento único. **Nunca fundo de seção inteira.** Ver as duas formas abaixo. |
| cinza       | `#9CA3AF` | só linhas e bordas no fecho em carvão                                      |

Derivados só por mistura (`color-mix`) e opacidade (nunca inventar hex novo). Tokens em `globals.css`, ativados por `data-tema="claro"` no `<html>` (`src/lib/tema.ts`); os componentes usam `text-fg`, `text-fg-2`, `border-line`, `bg-fundo`, `bg-painel`, nunca cores fixas.

| Papel                                 | Valor                                                 | Contraste                |
| ------------------------------------- | ----------------------------------------------------- | ------------------------ |
| Fundo base (`data-tom="carvao"`)      | neutro `#F6F7F5`                                      |                          |
| Seção **escura** / de **contraste**   | carvão a 3% / 5% sobre neutro (`#EFF0EE` / `#EAEBE9`) |                          |
| **Painel** (cards)                    | branco `#FFFFFF`                                      |                          |
| Texto / apoio (`text-fg-2`)           | carvão / carvão a 72%                                 | 16,1–17,9 / 7,2–7,6:1    |
| Linhas                                | carvão a 12%                                          |                          |
| `verde` (texto, ícones, traços, foco) | verde a 45% com carvão (`#06703D`)                    | 5,2–6,2:1                |
| Destaque dos títulos (`h1/h2 em`)     | verde a 60% com carvão (`#04904C`)                    | 3,4–3,8:1 (texto grande) |
| `verde-vivo` (preenchimentos)         | `#00E676`, sempre com texto carvão por cima           | 11,6:1                   |

O verde puro sobre o claro fica em ~1,6:1: por isso ele aparece só como **preenchimento** (botões, ponto do hero, barras do AI Score, filtros ativos, selo "Crítica") e no glow, e o texto verde usa as misturas acima. Os nomes dos tons ficaram do tema escuro: `carvao` é o fundo base (neutro no claro).

**Fecho em carvão** (`data-tom="noite"`, CTA final e rodapé): a única faixa escura, com os valores do tema escuro: fundo carvão, todo texto neutro (inclusive o de apoio, pedido do Diego em 27/10), linhas `rgba(156,163,175,.25)`, verde puro em texto e destaque. A logo do rodapé é a `logo-dark`.

Glow (`radial-gradient` verde a 10–16%, transparente a partir de ~40–55%): no hero da home, no topo das páginas internas, no bloco do AI Score, no hub do diagrama e nas faixas do AI Score. Nenhum outro gradiente, exceto a grade sutil do hero (linhas na cor do texto a 2,5%).

Voltar ao escuro: `tema = "escuro"` em `src/lib/tema.ts` (o CTA final volta para `contraste` e a logo para `logo-dark`).

## Tipografia (Inter, pesos 400/500/600/700)

- H1 (home e internas, `display-h1`): `clamp(46px,6.4vw,100px)`, 700, lh .98, ls -0.04em
- H2 de seção (`display-h2`): `clamp(36px,4.4vw,64px)`, 700, lh 1.04, ls -0.03em; CTA final `clamp(40px,6vw,84px)`
- Títulos em linhas; o trecho entre `*asteriscos*` no conteúdo vira `<em>` verde
- H3 de card: 23–35px, 700, ls -0.02em
- Corpo 16–19px, lh 1.6–1.8; texto de card 14px
- Kicker (`Eyebrow`): 12px, 600, ls .16em, caixa alta, verde, acima de cada título
- Numerais: 44px verdes (pilares), 32px (etapas do teste)
- `text-wrap: balance` em títulos, `pretty` em parágrafos

## Espaço e forma

- Gutter `6vw`; container 1220px
- Seção: 75px (celular) / 120px (desktop) em cima e embaixo
- Botões pill (`border-radius: 999px`), `14px 24px`, 15px/600, seta ↗ em links externos. Primário verde vivo com texto carvão. Secundário borda 1.5px na cor do texto a 40%.
- Header sticky de 72px em todas as páginas, fundo base a 94% com blur; link da página atual com sublinhado verde 2px
- Cards quadrados (sem border-radius), borda `line`, fundo `painel` (branco); no hover sobem 4px e a borda fica verde
- Efeitos só em CSS; deslocamentos com `motion-safe:`; `prefers-reduced-motion` zera transições e scroll suave
- Sem sombras em cards; o núcleo das órbitas tem um halo verde (parte do glow do hero). Sem emojis.
- Ícones de linha (traçado do Lucide, 1,5px, verde) só para identificar soluções, áreas e o diagnóstico: `components/ui/icone.tsx`, sempre `aria-hidden`. Glifos tipográficos (↗ → ✓ +) marcam links, listas e o FAQ.
- Microinterações: cards sobem 4px e a borda fica verde no hover; o “+” do FAQ gira; nas conexões do diagrama RESET 360 corre um brilho verde lento. Tudo some com `prefers-reduced-motion`.
- Foco: `outline: 2px solid` no `verde` (o de texto no claro, o puro no fecho); `outline-offset: 3px`
- Breakpoint: 861px (abaixo: menu mobile, grids em 1–2 colunas, rodapé 2 colunas)

## Marcas das ferramentas

Spotlite (`#FF7A45`, ponto) e Fluxa BPM (`#0B7A4F`) aparecem só como um ponto colorido ao lado do nome, via `MarcaFerramenta`. Não entram em fundos, botões ou traços.

## Logo e ícone

`public/brand/`: `logo-light` (header e o resto do site), `logo-dark` (rodapé em carvão), `icone-light` (WebP de 180px no núcleo das órbitas do hero e na imagem de compartilhamento), `icone-dark` (favicon e ícones PWA, sobre carvão). Hoje em PNG/WebP exportados do manual. **[FALTA]** SVGs oficiais. Favicon e ícones PWA gerados por `npm run images` (placeholder até o SVG chegar).

## Imagens

`diego` (Sobre, foto redonda no card do fundador; fonte em `design/fotos/`). O hero não usa foto: as órbitas são CSS. `porta.png` e `bussola.png`, do layout anterior, estão guardadas em `design/imagens/`.

## Impressão (relatório do RESET AI Score)

O relatório completo do AI Score sai pela impressão do navegador ("Salvar como PDF"). Em `@media print` (`globals.css`): fundo branco, texto carvão, apoio carvão a 72%, linhas carvão a 18%, painéis brancos; o verde vira `color-mix(in srgb, #00e676 55%, #0b0f0e)`, porque o verde puro no branco fica em ~1,6:1. As barras imprimem a cor (`print-color-adjust: exact` só nelas). Header, rodapé, barra do celular, formulários e CTAs (`[data-nao-imprimir]`) ficam fora; entram um cabeçalho com nome, empresa e data e um rodapé com o aviso de autoavaliação.
