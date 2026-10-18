# Handoff: Site Reset IA

## Overview
Site institucional da Reset IA (treinamento de IA para equipes). Quatro páginas: Home, Soluções, Spotlite, Sobre. Objetivo: converter gestores em uma conversa de 30 minutos via WhatsApp. Idioma: português do Brasil.

## Sobre os arquivos
Os `.dc.html` deste pacote são **referências de design em HTML** (protótipos com a aparência e o comportamento pretendidos), não código de produção. A tarefa é **recriar estas telas no ambiente do projeto** (Next.js/React, Astro, etc.) seguindo os padrões do repositório. Se ainda não houver stack, recomendação: Next.js (App Router) + Tailwind, páginas estáticas, sem CMS. Todos os estilos nos protótipos são inline; leia-os como especificação, não como estrutura a copiar. Os arquivos abrem direto no navegador (precisam do `support.js` ao lado).

## Fidelidade
**Alta (hi-fi).** Cores, tipografia, espaçamentos, copy e interações são finais. Recriar com fidelidade visual; o copy deve ser mantido literalmente.

## Rotas
- `/` → `home.dc.html`
- `/solucoes` → `solucoes.dc.html`
- `/spotlite` → `spotlite.dc.html`
- `/sobre` → `sobre.dc.html`

## Design tokens
Cores
- Carvão (fundo escuro / texto em claro): `#0B0F0E`
- Neutro (fundo claro / texto em escuro): `#F6F7F5`
- Verde Reset (acento, CTAs, numerais, traços): `#00E676`
- Cinza (texto secundário em fundo escuro): `#9CA3AF`
- Texto secundário em fundo claro: `rgba(11,15,14,.6)`
- Linhas em fundo escuro: `rgba(156,163,175,.25)`; em fundo claro: `rgba(11,15,14,.12)`
- Glow radial (hero e Spotlite): `radial-gradient(circle, rgba(0,230,118,.16) 0%, rgba(0,230,118,0) 65%)`, círculo de 60vw (máx. 900px), posicionado fora da borda

Tipografia (Inter, Google Fonts, pesos 400/500/600/700)
- H1 home: `clamp(42px,7vw,96px)`, 700, line-height .95, letter-spacing -0.03em
- H1 internas: `clamp(40px,5.6vw,80px)`; Spotlite: `clamp(56px,9vw,128px)`, letter-spacing -0.04em, line-height .9
- H2 de seção: `clamp(36px,4.6vw,64px)`, 700, line-height .98, letter-spacing -0.03em
- H3: 24–28px, 600, letter-spacing -0.02em, line-height 1.1
- Corpo: 17–18px, line-height 1.6; lead: 20px
- Rótulo (eyebrow): 12px, 500, letter-spacing .18em, uppercase
- Numerais grandes: 32–40px, 700, letter-spacing -0.03em; nota Spotlite `clamp(64px,8vw,112px)`, letter-spacing -0.04em
- `text-wrap: balance` em títulos, `pretty` em parágrafos

Espaçamento e forma
- Gutter horizontal: `6vw`; container `max-width: 1200px`
- Padding vertical de seção: 120–140px (topo) / 120px (base); CTA final 140–180px
- Botões: pill (`border-radius: 999px`), padding `16px 26px`, 16px/600. Primário: fundo `#00E676`, texto `#0B0F0E`. Secundário: borda 1.5px `rgba(246,247,245,.4)`, texto claro, hover borda sólida
- Header: 72px, fixo (home) ou sticky (internas), fundo com `backdrop-filter: blur(12px)` e 80–85% de opacidade; links com sublinhado verde de 2px no hover e na rota ativa; CTA "Fale conosco" (14px, padding 10px 18px)
- Listas de pontos: grid `3px 1fr`, gap 24px; a barra de 3px começa cinza e vira `#00E676` ao entrar na viewport (transição .6s)
- Linhas horizontais nascem com `scaleX(0)` e crescem para 1 (.5s ease) ao entrar na viewport
- Sem border-radius em cartões; sem sombras
- Foco: `outline: 2px solid #00E676; outline-offset: 3px`

Breakpoint: 860px. Abaixo: nav e CTA do header somem (adicionar menu mobile), grids viram 1 coluna, rodapé 2 colunas.

## Assets (pasta `brand/`)
- `logo-dark.png` — logo para fundo escuro (header da home/spotlite, rodapé). Altura 40px no header, 44px no rodapé
- `logo-light.png` — logo para fundo claro (header de Soluções e Sobre)
- `icone-dark.png` / `icone-light.png` — só o símbolo
- `porta.png` — hero da home (923×580)
- `bussola.png` — Ato 4 da home e hero do Spotlite. **Baixa resolução (215×341)**: pedir a arte original em alta antes de publicar
- `estrada.png` — não usado; disponível

## Links e contato
- WhatsApp geral: `https://wa.me/5511916170606?text=` + URL-encode de "Olá! Vim pelo site da Reset IA e quero conversar sobre treinamento de IA para a minha equipe."
- WhatsApp Spotlite: mesmo número, texto "Olá! Vim pelo site da Reset IA e quero fazer o diagnóstico Spotlite do meu setor."
- E-mail: contato@resetia.com.br
- LinkedIn empresa: linkedin.com/company/resetia · Diego: linkedin.com/in/diegonogueira1 · Instagram: instagram.com/odiegonog
- Pendências marcadas `[FALTA]` no rodapé e na página Sobre: CNPJ, política de privacidade, foto do Diego

## Telas

### Home (`home.dc.html`)
Sequência de "atos" alternando carvão e neutro. Nas transições, a seção seguinte entra por cima da anterior (ver Movimento).

1. **Hero (carvão)** — grid 1.1fr / .9fr. Esquerda: H1 em duas linhas "IA sem hype." / "Resultado na prática.", lead (20px, #9CA3AF, máx. 560px), dois botões (primário "Falar com um especialista" → WhatsApp; secundário "Ver como funciona" → `#como-funciona`). Direita: `porta.png` em `object-fit: cover`, com lista de manifesto sobreposta no canto superior direito (Estratégia / Tecnologia / Pessoas / Resultados, eyebrow, alinhada à direita, traço verde de 28×2px abaixo). Glow radial no canto superior direito.
2. **Prova (mesma seção)** — linha animada + frase "Equipes treinadas em empresas como IEL, Fortes Tecnologia, FortesPay, Longevidade Saudável, entre outras." (17px, nomes em 600 claro).
3. **Problema (neutro)** — H2 "Sua empresa já usa IA. / Só não sabe como." à esquerda; à direita três pontos com barra (Licença parada / Uso escondido / Prompt ruim, resultado ruim), linha, fecho em 22px/600: "Treinamento de IA não é mostrar ferramenta. É mudar o jeito que a equipe trabalha."
4. **Como funciona (neutro)** — grid .8fr / 1.2fr. Esquerda: painel da bússola (aspect-ratio 2:3, máx. 520px, sticky top 120px). Direita: H2 "Diagnóstico. Treino. Medição. / Nessa ordem." e três passos em lista com bordas (`64px 1fr`, numeral 32px verde): 01 Diagnóstico com o Spotlite, 02 Treinamento direcionado, 03 Medição antes × depois. Link "Conhecer o Spotlite →".
5. **Treinamentos (carvão)** — H2 "Um programa para cada ponto da empresa." Tabela de 5 linhas (colunas 1.1fr / 1.4fr / 1fr: Programa, Para quem, Formato). No hover da linha: barra verde de 2px à esquerda e descrição expande (grid-template-rows 0fr→1fr, .35s). Dados em `programas` no logic class. Link "Ver os programas em detalhe →".
6. **Spotlite (carvão)** — grid 1fr/1fr, glow no canto inferior esquerdo. Esquerda: H2 "Spotlite. / O diagnóstico que direciona tudo.", parágrafo, botão primário "Pedir o diagnóstico do meu setor" (WhatsApp Spotlite). Direita: cartão com borda 1px, padding 36px: eyebrow "Setor: Financeiro / exemplo"; nota 7,1 (antes: 3,4) com contador animado; três barras (92% / 64% / 48%, 2px, verde, width transita 1.2s com stagger .15s); 11 atividades automatizáveis; 46 h/mês. Dispara ao entrar 40% na viewport.
7. **Depois (neutro)** — H2 "Treinar é o começo." Duas colunas separadas por linha vertical: Governança de IA / Fábrica de Agentes. Nota final: "Essas frentes entram depois que a equipe está treinada. Nunca antes."
8. **Fecho (carvão, centrado)** — H2 "Reprogramar hoje" (em #9CA3AF) / "para um amanhã maior." com sublinhado verde de 4px que cresce (scaleX 0→1, .6s, delay .2s) ao entrar na viewport. Lead "Um novo ciclo começa com uma conversa de 30 minutos." Botão primário.
9. **Rodapé** — 4 colunas (1.4fr 1fr 1fr 1fr): logo + "Um novo ciclo de possibilidades."; Navegação; Contato; Redes. Linha inferior: © 2026 Reset IA · CNPJ [FALTA] · Fortaleza e Campinas, Brasil · Política de privacidade [FALTA].

### Soluções (`solucoes.dc.html`, fundo neutro)
Hero "Treinamentos que a equipe usa na segunda-feira." + lead. Cinco programas, cada um em bloco com borda superior, grid 1fr/2fr: esquerda numeral (eyebrow) + nome do programa (`clamp(28px,3.2vw,44px)`); direita três campos com barra (Para quem / Como funciona / O que a equipe leva). Dados em `programas` no logic class. Seção carvão "Depois do treinamento" (Governança / Fábrica de Agentes). FAQ em accordion (5 itens, botão com "+" que gira 45°, conteúdo expande via grid-rows .3s, `aria-expanded`). CTA carvão centrado. Rodapé igual à home.

### Spotlite (`spotlite.dc.html`, fundo carvão)
Hero grid 1.2fr/.8fr: "Spotlite." gigante + lead; bússola em painel 4:5. Seção neutra "Como funciona" com lista numerada 01–04. Seção carvão "O que o gestor recebe" (quatro pontos, três com barra verde fixa) + o mesmo cartão de exemplo da home (padding 40px, contador). Seção neutra "Para quem" com três frases em 22px/600. CTA "Comece pelo diagnóstico." Rodapé.

### Sobre (`sobre.dc.html`, fundo neutro)
H1 "Quem está por trás." Grid .8fr/1.2fr: placeholder de foto 4:5 em carvão ("Foto do Diego [FALTA]") + bio de Diego Nogueira (nome, subtítulo 20px, dois parágrafos, links LinkedIn/Instagram com sublinhado). Seção carvão "Como trabalhamos" (3 pontos com barra). Seção neutra "Métodos próprios" (lista: CLARO · CONFERE · PARE; PACEF; Spotlite). CTA carvão. Rodapé.

## Movimento (home)
Respeitar `prefers-reduced-motion: reduce` e a prop `movimento=false`: nesse caso, tudo estático, linhas e barras já no estado final, cursor nativo.

- **Header**: transparente no topo; após 80px de scroll ganha fundo `rgba(11,15,14,.8)` + blur; esconde (translateY -100%) ao rolar para baixo além de 200px e reaparece ao rolar para cima. Transições .35s.
- **Wipes**: seções 3, 5 e 7 têm `position: relative; z-index: 1`; as seções 1, 4 e 6 são `position: sticky; top: calc(min(0, 100vh - altura))`. A seção que entra recebe `clip-path: inset(Xpx 0 0 0)` com X = (1 − progresso) × 45% da viewport, até progresso 1 → `none`. Dá a sensação de "cortina" leve. Implementar com `requestAnimationFrame` no scroll (ou Framer Motion / GSAP ScrollTrigger).
- **Parallax da porta**: `translateY(scroll × 0.08)` na imagem do hero (imagem tem 112% de altura para não vazar).
- **Decode do H1 do hero**: por 900ms, caracteres ainda não "assentados" alternam entre os glifos `▮▯/\|` a cada 40ms, assentando da esquerda para a direita; espaços preservados. Só no carregamento.
- **Linhas e barras**: IntersectionObserver com threshold .3, animam uma vez.
- **Botões magnéticos** (`data-magnetic`): deslocam até ±8px/±6px seguindo o mouse dentro do botão; no hover o texto desliza 2px e uma seta "→" aparece (width 0→22px, opacity 0→1, .25s). Reset no mouseleave.
- **Cursor personalizado** (apenas `pointer: fine`, prop `cursorPersonalizado`): ponto de 6px com `mix-blend-mode: difference` segue o mouse instantaneamente; anel de 28px (borda 1.5px) segue com mola (k .18, amortecimento .72). Sobre links/botões: anel cresce para 48px e fica verde. Sobre texto: vira barra vertical de 2×26px e o ponto some. `cursor: none` no body enquanto ativo.
- **Contador Spotlite**: 1400ms, ease-out cúbico; nota 0→7,1 (uma casa decimal, vírgula), 0→11, 0→46; barras entram em sequência.
- **Linhas de programa**: expansão por hover descrita acima.

## Estado
Home: `scrolled`, `hidden` (header), `hover` (linha de programa ativa), `nota/ativ/horas/counted` (contador). Soluções: `open` (índice do FAQ aberto, −1 fechado). Spotlite: contador. Sem dados remotos; tudo estático.

## SEO / acessibilidade
Títulos de página já definidos em cada arquivo (`<title>`). `aria-current="page"` no link ativo. Alt descritivo nas imagens. Contraste: texto secundário #9CA3AF sobre #0B0F0E ≈ 6.9:1; rgba(11,15,14,.6) sobre #F6F7F5 ≈ 6.6:1.

## Arquivos
- `home.dc.html`, `solucoes.dc.html`, `spotlite.dc.html`, `sobre.dc.html` — protótipos
- `support.js` — runtime necessário só para abrir os protótipos no navegador (não portar)
- `brand/` — logos e imagens
