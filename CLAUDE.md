# Site Reset IA — regras para agentes

Leia também `AGENTS.md` (regras do Next.js 16 geradas pelo framework) e `docs/decisions.md`.

## O que é

Site institucional estático da Reset IA (`www.resetia.com.br`). Next.js 16 App Router, `output: 'export'`, Tailwind v4. Sem `motion`, Lenis ou biblioteca de componentes (saíram em 25/10, ver `docs/decisions.md`). Deploy como Static Site no DigitalOcean App Platform. Objetivo do site: levar ao **diagnóstico gratuito (RESET Scan)**, uma conversa no WhatsApp; o teste de IA da Spotlite é caminho secundário, só na página do diagnóstico. Conteúdo: RESET 360 reestruturado em 26/10/2026 (cinco soluções, ver `docs/decisions.md`).

## Regras

- **Copy só em `src/content/*.ts`.** Nenhuma string de texto do site dentro de componente. Não invente copy, cliente, número ou promessa: use a constante `FALTA` e siga.
- **Design é fechado.** Layout, estrutura e efeitos: `design/reset360/` (protótipo HTML). Identidade (logo, paleta, Inter): `docs/brand.md`. O lime do protótipo é sempre o verde Reset IA. Verde é ação e destaque, nunca fundo de seção. Sem sombras em cards, sem gradiente além do glow, sem emojis.
- **Tom por seção** via `data-tom` (`Section`: `carvao`, `escuro`, `contraste`): use `text-fg`, `text-fg-2`, `border-line`, `bg-painel`, nunca cores fixas em componentes compartilhados.
- **Títulos em linhas** (`string[]` no conteúdo); destaque verde com `*trecho*`, renderizado por `Linhas`.
- **Efeitos só em CSS** (hover, header sticky, scroll suave nativo). Deslocamentos com `motion-safe:`; `prefers-reduced-motion` zera transições e o scroll suave. Nada de biblioteca de animação ou listener de scroll para efeito.
- Links externos: `target="_blank" rel="noopener"`. CTAs de WhatsApp sempre via `src/lib/whatsapp.ts` (`waDiagnostico()` para "Solicitar diagnóstico gratuito", `waUrl(s.cta.mensagem)` nas soluções, `waGeral()`); teste da Spotlite via `testeSpotliteUrl(origem)` em `src/lib/teste-spotlite.ts`.
- Todo CTA leva `data-cta` único na página; botões do diagnóstico começam com `diagnostico-` (o analytics separa o evento `cta_diagnostico_gratuito`).
- Ícones: só os de `components/ui/icone.tsx` (traçados do Lucide em SVG puro, sem dependência no cliente).
- Cada fase fecha com `npm run build`, `npm run lint`, `npm run typecheck` passando.

## Comandos

`npm run dev` · `npm run build` (gera `out/`) · `npm run lint` · `npm run typecheck` · `npm run images` (reotimiza `public/brand`) · `npm run test` · `npm run e2e` · `npm run lhci` · `npm run deploy:do` (primeiro deploy na DO após `doctl auth init`)
