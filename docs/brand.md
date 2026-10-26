# Identidade visual — Reset IA (manual de marca + layout do protótipo reset360)

Desde 25/10/2026 o layout, a estrutura e os efeitos seguem `design/reset360/`; a identidade (cores, logo, tipografia) é a do manual abaixo. O lime do protótipo é sempre o verde Reset IA.

## Cores

| Token       | Hex       | Uso                                                                           |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| carvão      | `#0B0F0E` | fundo escuro; texto em fundo claro                                            |
| neutro      | `#F6F7F5` | fundo claro; texto em fundo escuro                                            |
| verde reset | `#00E676` | acento único: CTAs, numerais, traços, foco. **Nunca fundo de seção inteira.** |
| cinza       | `#9CA3AF` | texto secundário em fundo escuro                                              |

Derivados só por opacidade (nunca inventar hex novo): texto secundário `#9CA3AF`; linhas `rgba(156,163,175,.25)`. O site é todo escuro, como o protótipo; as superfícies são neutro sobre carvão (`color-mix`): seção **escura** 3%, seção de **contraste** 5%, **painel** (cards) 7%. Tokens `bg-escuro`, `bg-contraste`, `bg-painel` em `globals.css`.

Glow (`radial-gradient` verde a 10–16%, transparente a partir de ~40–55%): no hero da home, no topo das páginas internas, no bloco do RESET Scan, no hub do diagrama e nas faixas do diagnóstico. Nenhum outro gradiente, exceto a grade sutil do hero (linhas a 2,5% de neutro).

Contraste: `#9CA3AF` sobre `#0B0F0E` ≈ 6,9:1; `rgba(11,15,14,.6)` sobre `#F6F7F5` ≈ 6,6:1. `#9CA3AF` sobre `#F6F7F5` **não passa** para texto pequeno.

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
- Botões pill (`border-radius: 999px`), `14px 24px`, 15px/600, seta ↗ em links externos. Primário verde/carvão. Secundário borda 1.5px `rgba(246,247,245,.4)`.
- Header sticky de 72px em todas as páginas, carvão a 94% com blur; link da página atual com sublinhado verde 2px
- Cards quadrados (sem border-radius), borda `line`, fundo `painel`; no hover sobem 4px e a borda fica verde
- Efeitos só em CSS; deslocamentos com `motion-safe:`; `prefers-reduced-motion` zera transições e scroll suave
- Sem sombras em cards; o núcleo das órbitas tem um halo verde (parte do glow do hero). Sem emojis.
- Ícones de linha (traçado do Lucide, 1,5px, verde) só para identificar soluções, áreas e o diagnóstico: `components/ui/icone.tsx`, sempre `aria-hidden`. Glifos tipográficos (↗ → ✓ +) marcam links, listas e o FAQ.
- Microinterações: cards sobem 4px e a borda fica verde no hover; o “+” do FAQ gira; nas conexões do diagrama RESET 360 corre um brilho verde lento. Tudo some com `prefers-reduced-motion`.
- Foco: `outline: 2px solid #00E676; outline-offset: 3px`
- Breakpoint: 861px (abaixo: menu mobile, grids em 1–2 colunas, rodapé 2 colunas)

## Marcas das ferramentas

Spotlite (`#FF7A45`, ponto) e Fluxa BPM (`#0B7A4F`) aparecem só como um ponto colorido ao lado do nome, via `MarcaFerramenta`. Não entram em fundos, botões ou traços.

## Logo e ícone

`public/brand/`: `logo-dark` (usada no site todo), `logo-light` (fundo neutro, sem uso hoje), `icone-dark` (também em WebP de 180px no núcleo das órbitas do hero), `icone-light`. Hoje em PNG/WebP exportados do manual. **[FALTA]** SVGs oficiais. Favicon e ícones PWA gerados por `npm run images` (placeholder até o SVG chegar).

## Imagens

`diego` (Sobre, foto redonda no card do fundador; fonte em `design/fotos/`). O hero não usa foto: as órbitas são CSS. `porta.png` e `bussola.png`, do layout anterior, estão guardadas em `design/imagens/`.
