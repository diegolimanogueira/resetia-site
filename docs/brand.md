# Identidade visual — Reset IA (resumo do manual + tokens do handoff)

## Cores

| Token       | Hex       | Uso                                                                           |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| carvão      | `#0B0F0E` | fundo escuro; texto em fundo claro                                            |
| neutro      | `#F6F7F5` | fundo claro; texto em fundo escuro                                            |
| verde reset | `#00E676` | acento único: CTAs, numerais, traços, foco. **Nunca fundo de seção inteira.** |
| cinza       | `#9CA3AF` | texto secundário em fundo escuro                                              |

Derivados só por opacidade (nunca inventar hex novo): texto secundário no claro `rgba(11,15,14,.6)`; linhas no escuro `rgba(156,163,175,.25)`, no claro `rgba(11,15,14,.12)`. Glow radial permitido só no hero e no bloco Spotlite: `radial-gradient(circle, rgba(0,230,118,.16) 0%, rgba(0,230,118,0) 65%)`, círculo de 60vw (máx. 900px), fora da borda.

Contraste: `#9CA3AF` sobre `#0B0F0E` ≈ 6,9:1; `rgba(11,15,14,.6)` sobre `#F6F7F5` ≈ 6,6:1. `#9CA3AF` sobre `#F6F7F5` **não passa** para texto pequeno.

## Tipografia (Inter, pesos 400/500/600/700)

- H1 home: `clamp(42px,7vw,96px)`, 700, lh .95, ls -0.03em
- H1 internas: `clamp(40px,5.6vw,80px)`; Spotlite: `clamp(56px,9vw,128px)`, ls -0.04em, lh .9
- H2 de seção: `clamp(36px,4.6vw,64px)`, 700, lh .98, ls -0.03em
- H3: 24–28px, 600, ls -0.02em, lh 1.1
- Corpo 17–18px, lh 1.6; lead 20px
- Rótulo (eyebrow): 12px, 500, ls .18em, caixa alta. Só em listas-manifesto e marcadores de eixo.
- Numerais: 32–40px, 700, ls -0.03em; nota Spotlite `clamp(64px,8vw,112px)`, ls -0.04em
- `text-wrap: balance` em títulos, `pretty` em parágrafos

## Espaço e forma

- Gutter `6vw`; container 1200px
- Seção: 120–140px topo / 120px base; CTA final 140–180px
- Botões pill (`border-radius: 999px`), `16px 26px`, 16px/600. Primário verde/carvão. Secundário borda 1.5px `rgba(246,247,245,.4)`.
- Header 72px; links com sublinhado verde 2px no hover e na rota ativa
- Pontos: grid `3px 1fr`, gap 24px; barra começa cinza e vira verde ao entrar na viewport
- Linhas nascem com `scaleX(0)` e crescem (.5s) ao entrar na viewport
- Sem border-radius em cartões; sem sombras; sem ícones decorativos; sem emojis
- Foco: `outline: 2px solid #00E676; outline-offset: 3px`
- Breakpoint: 860px (abaixo: menu mobile, grids em 1 coluna, rodapé 2 colunas)

## Marcas das ferramentas

Spotlite (`#FF7A45`, ponto) e Fluxa BPM (`#0B7A4F`) aparecem só como um ponto colorido ao lado do nome, via `MarcaFerramenta`. Não entram em fundos, botões ou traços.

## Logo e ícone

`public/brand/`: `logo-dark` (fundo carvão), `logo-light` (fundo neutro), `icone-dark`, `icone-light`. Hoje em PNG/WebP exportados do manual. **[FALTA]** SVGs oficiais. Favicon e ícones PWA gerados por `npm run images` (placeholder até o SVG chegar).

## Imagens

`porta` (hero da home, 920×582), `bussola` (Ato 4; **baixa resolução 215×341 [FALTA] original em alta**), `diego` (Sobre, redonda 112px; fonte em `design/fotos/`), `spotlite-site` e `fluxa-site` (capturas reais, `npm run snapshots:produtos`).
