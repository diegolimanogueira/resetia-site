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

## 2026-10-18 · shadcn/ui só para Sheet e Accordion (Accordion saiu em 22/10, ver abaixo)

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

## 2026-10-22 · Conteúdo RESET 360

A pedido do Diego, o conteúdo do site foi trocado pelo estudo `reset360-site.zip` (21/10/2026). O layout, os tokens e o movimento continuam os mesmos; só a copy e a estrutura de páginas mudaram. Posicionamento: IA aplicada a Marketing, Vendas e Customer Success ("Não é sobre ter mais IA. É sobre fazer mais negócio."), com Élida Almeida (negócio) e Diego Nogueira (tecnologia) como sócios.

- **Rotas.** `/solucoes` lista as sete soluções; cada uma tem página em `/solucoes/[slug]` (`generateStaticParams`, `dynamicParams = false`). `/agentes` é o catálogo de 30 agentes com filtro por área (`?area=marketing|vendas|customer-success`, lido com `useSearchParams` dentro de `Suspense`; o HTML estático sai com "Todos"). `/produtos` virou `/tecnologias`; `/produtos` e `/spotlite` redirecionam no cliente.
- **Home.** Hero (porta) → problema → método em quatro etapas (bússola presa) → sete soluções → tecnologias próprias (Spotlite e Fluxa, presas) → áreas → quem está por trás → fecho. Continua com três seções presas e o wipe entre elas.
- **Rótulos de seção.** O estudo usa um rótulo (eyebrow) acima de cada título; foram mantidos, no estilo `eyebrow` que já existia.
- **WhatsApp.** Mensagem geral do estudo ("Quero conhecer as soluções da Reset 360"); cada solução tem mensagem própria com o nome dela (`waSolucao`), para o Diego saber de onde veio o contato.
- **Saíram:** treinamentos (cinco programas), "Depois do treinamento", FAQ e o Accordion, princípios e métodos do Sobre (CLARO, PACEF), a linha da Unimed e o Instagram pessoal. O microcopy "WhatsApp direto, sem formulário" saiu porque o diagnóstico aberto com formulário vem aí.
- **Ficaram:** a faixa de prova social (equipes treinadas em IEL, Fortes Tecnologia, FortesPay e Longevidade Saudável), a página detalhada das ferramentas, mockups e capturas.
- **Pendências do Diego** (comentadas no código, sem `[FALTA]` visível): confirmar os LinkedIns de Élida e Diego (vieram do estudo); foto autorizada da Élida (até lá, monograma "ÉA" no mesmo círculo da foto do Diego).

## 2026-10-22 · Diagnóstico aberto na Spotlite

O diagnóstico aberto com IA fica na Spotlite, não no site: o site é estático e a Spotlite já tem o funil (`spotlite.com.br/descoberta/ia-negocios`, "Teste de IA para negócios": começa sem cadastro e pede nome, e-mail e WhatsApp para mostrar a devolutiva). O site só aponta para lá, então a política de privacidade do site continua valendo como está (sem formulário próprio; a Spotlite tem a sua).

- **Onde aparece:** botão principal do hero ("Descobrir oportunidades", com a nota "Teste de IA para negócios na Spotlite, em 5 a 7 minutos"), seção própria na home logo depois do problema (carvão, bloco Spotlite com glow) e link na página Tecnologias, no lugar do antigo "Em breve". O WhatsApp continua no header, na barra do celular, no fecho, nas soluções e no rodapé.
- **Origem do lead:** `diagnosticoUrl(origem)` acrescenta `utm_source=resetia.<origem>`; a Spotlite grava a origem no contato (minúsculas, `[a-z0-9][a-z0-9_.-]`).
- **Analytics:** clique no teste vira `cta_diagnostico`, ao lado de `cta_whatsapp`.
- **Copy:** a da seção é a do próprio teste (duração, o que a pessoa recebe, etapas, aviso de diagnóstico educacional). Se o teste mudar de endereço ou de texto, atualizar `site.ferramentas.spotliteTeste` e `home.diagnostico`.

## 2026-10-25 · Layout do reset360, sem movimento pesado

A pedido do Diego, o site passou a seguir o protótipo `design/reset360/` (index, agentes, sobre e as sete páginas de produto) em estrutura, conteúdo e efeitos, mantendo a identidade Reset IA (logo, paleta e Inter). Motivo: o site estava pesado e com efeitos desnecessários. Substitui os registros "Fonte de verdade do design", "Movimento com motion + Lenis" e "shadcn/ui só para Sheet" de 18/10.

- **Paleta.** O lime do protótipo vira o verde `#00E676`. Os tons escuros alternados viram superfícies derivadas por opacidade (neutro sobre carvão: escuro 3%, contraste 5%, painel 7%). O CTA final, que no protótipo é uma faixa lime, fica na superfície de contraste com destaque e botão verdes: verde continua não sendo fundo de seção.
- **Hero.** Órbitas em CSS puro (anéis, núcleo com o ícone Reset IA, pílulas Marketing/Vendas/Customer Success). Saem a foto da porta e a bússola.
- **Efeitos.** Só os do protótipo: hover nos botões e cards, header sticky com blur, scroll suave nativo. Saíram `motion`, Lenis, cursor, decode do H1, seções presas com wipe, botões magnéticos, linhas e barras animadas e o contador da Spotlite. O menu mobile deixou o Sheet do Base UI e virou um painel com `aria-expanded`; saíram `@base-ui/react`, `lucide-react` e `shadcn`. JS da home: de ~250 KB para ~157 KB transferidos (Lighthouse mobile).
- **Rotas.** Como no protótipo, Método, Soluções e Tecnologias são seções da home (`/#metodo`, `/#solucoes`, `/#tecnologias`). `/solucoes` e `/tecnologias` viraram redirecionamentos no cliente (noindex) para essas âncoras, junto com `/produtos` e `/spotlite`. As páginas `/solucoes/[slug]` continuam com as mesmas URLs. Sitemap: 11 URLs.
- **Ficaram do site anterior** (escolha do Diego): o teste de IA da Spotlite como bloco da home, depois de Tecnologias; a foto do Diego no Sobre; a barra de WhatsApp no celular; a política de privacidade.
- **Saíram por não estarem no protótipo:** a faixa de prova social, os selos de ferramenta nos passos do Método e o campo "Tecnologia própria" nas soluções, o mockup da Spotlite, as capturas dos sites e o e-mail no rodapé. O CTA principal do hero volta a abrir o WhatsApp, como no protótipo.
- **Ajustes ao protótipo:** entregas de cada solução em lista (no protótipo, uma frase com ";"); mensagem de WhatsApp com o nome da solução nas páginas de produto; sem as legendas "FOTO DE…" e o aviso de fotos provisórias, que eram notas do protótipo.

## 2026-10-25 · Inter hospedada no repositório

O build no runner do GitHub passou a quebrar no `next/font/google` (Turbopack: "next/font/google queries have exactly one entry"): o Google Fonts começou a responder ao runner com URLs `fonts.gstatic.com/l/font?kit=…&…`, que o Turbopack não resolve. Local, em container Linux e na DigitalOcean o build passava. A Inter variável (subconjunto latino, o mesmo arquivo que o Google entregava, 48 KB) agora fica em `src/app/fonts/` com a licença OFL e entra por `next/font/local`. O build não depende mais de rede para fontes, e o site carrega um arquivo de fonte em vez de seis.

## 2026-10-26 · Reestruturação: cinco soluções e o diagnóstico gratuito como porta de entrada

Brief do Diego ("Reestruturação completa do site Reset IA"). A Reset deixa de parecer uma empresa de treinamentos e passa a se apresentar como transformação de negócios com IA em Marketing, Vendas e Customer Success. A identidade visual (layout do reset360, paleta, Inter, logo) fica; mudam posicionamento, arquitetura, conteúdo comercial e as páginas de solução. Publicado direto em produção, a pedido do Diego (sem preview).

- **Portfólio.** Exatamente cinco soluções, cada uma com landing page completa (headline, desafios, benefícios, entregáveis, público, etapas, como medimos, CTA com mensagem própria, soluções relacionadas): AI Champions (com os workshops incorporados como formato), Processos com IA (Fluxa BPM como tecnologia relacionada, não produto), Agent Factory (três frentes com seis exemplos cada e a seção de ferramentas redundantes, sem promessa de economia), Governance e Performance (indicadores por área, sem impacto financeiro sem linha de base).
- **RESET Scan** deixa de ser produto e vira o diagnóstico gratuito, a porta de entrada: botão verde no menu (leva a `/diagnostico-gratuito/`), hero, depois das soluções, nas landing pages, no Sobre e antes do rodapé. Os botões "Solicitar diagnóstico gratuito" abrem o WhatsApp direto com a mensagem do brief (escolha do Diego: menos atrito). O teste da Spotlite vira alternativa secundária, só na página do diagnóstico.
- **Home.** Hero novo, prova de credibilidade (equipes treinadas em IEL, Fortes Tecnologia, FortesPay e Longevidade Saudável), o problema e as sete frentes de ajuda, "O que é a RESET 360" com o diagrama Marketing → Vendas → Customer Success ligado às cinco soluções, soluções, áreas com exemplos de agentes, Scan em destaque, tecnologias, fundadores, FAQ e CTA. Sai o Método em quatro passos: o brief pede que não haja sequência obrigatória.
- **Rotas.** Voltam `/solucoes/` (visão geral) e `/tecnologias/` como páginas; `/agentes` vira `/agentes-de-ia` (o redirecionamento leva a query `?area=`). `/solucoes/scan` → `/diagnostico-gratuito/`, `/solucoes/workshops` → `/solucoes/ai-champions/`, `/produtos` e `/spotlite` → `/tecnologias/`. Sitemap: 12 URLs.
- **Sobre.** Bios do brief: Diego (IA, tecnologia e inovação, com a trajetória na Unimed Nacional) e Élida (mais de 15 anos; NP Digital e Gomes de Matos Consultoria), mensagem de fechamento e proposta de valor. Foto da Élida pendente: `npm run images` já processa `design/fotos/elida.png` quando o arquivo existir; até lá, monograma.
- **Ícones e efeitos.** Ícones de linha por solução e área, traçados do Lucide copiados como SVG (o `lucide-react` 1.x é componente de cliente e levava ~10 KB de JS). Microinterações só em CSS: hover dos cards e do FAQ (`<details>`), e um brilho que percorre as conexões do diagrama, desligado com `prefers-reduced-motion`.
- **Analytics.** Eventos separados: `cta_diagnostico_gratuito`, `cta_whatsapp`, `cta_pagina_diagnostico`, `cta_teste_spotlite`, sempre com `data-cta` único por página.
- **Conteúdo escrito a partir do brief** (sem números, clientes ou depoimentos novos): desafios de Processos, Agent Factory, Governance e Performance, as quatro etapas de cada solução, o FAQ e o "como funciona" do diagnóstico, derivados dos entregáveis e do conteúdo já validado. Revisar com o Diego.

## 2026-10-26 · Detalhamento das cinco soluções

O Diego mandou o texto completo de cada produto. As landing pages passaram a seguir a estrutura dele: hero (headline, dois parágrafos, CTA principal e um secundário que leva a uma seção da página), Sobre a solução, Benefícios numerados com título e texto, O que entregamos, Para quem é ("Ideal para empresas que…"), Como funciona em cinco passos e um CTA final próprio de cada solução, com o diagnóstico gratuito como segundo botão.

- **Blocos próprios:** Processos com IA apresenta o Fluxa BPM depois dos entregáveis; Agent Factory traz os exemplos por frente (com a descrição de cada uma e o aviso de que são possibilidades) e "Reduza complexidade. Extraia mais valor."; Governance tem a nota sobre Jurídico, Segurança da Informação e Privacidade; Performance tem "O que podemos medir" com seis grupos de indicadores e o aviso sobre atribuição à IA.
- **Saíram** os trechos que eu tinha derivado do brief anterior: desafios de cada solução, quatro etapas, formatos do AI Champions, "governança que acelera", indicadores resumidos e o quadro "Como medimos". Continuam escritos por mim o FAQ do site e o "como funciona" do diagnóstico gratuito.
- Mantidos: a faixa do diagnóstico gratuito em cada página, as soluções relacionadas e as mensagens de WhatsApp por solução.
