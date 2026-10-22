# Site Reset IA — regras para agentes

Leia também `AGENTS.md` (regras do Next.js 16 geradas pelo framework) e `docs/decisions.md`.

## O que é

Site institucional estático da Reset IA (`www.resetia.com.br`). Next.js 16 App Router, `output: 'export'`, Tailwind v4, `motion` + Lenis, shadcn (Base UI) só para o Sheet do menu mobile. Deploy como Static Site no DigitalOcean App Platform. Objetivo único do site: gerar conversa no WhatsApp. Conteúdo: RESET 360 (estudo de 21/10/2026, ver `docs/decisions.md`).

## Regras

- **Copy só em `src/content/*.ts`.** Nenhuma string de texto do site dentro de componente. Não invente copy, cliente, número ou promessa: use a constante `FALTA` e siga.
- **Design é fechado.** Fonte de verdade: `design/handoff/` (README + protótipos). Tokens em `docs/brand.md`. Verde é ação e destaque, nunca fundo de seção. Sem cards com sombra, sem gradiente além do glow, sem ícones decorativos, sem emojis.
- **Tom por seção** via `data-tom` (`Section`): use `text-fg`, `text-fg-2`, `border-line`, nunca cores fixas em componentes compartilhados.
- **Reduced motion é obrigatório.** Todo efeito passa por `useMotionOk()`; com `prefers-reduced-motion` o site é estático e o Lenis não inicia.
- **Nunca branch de markup por `useMotionOk()`** (hidratação). Use o valor em efeitos e handlers.
- Links externos: `target="_blank" rel="noopener"`. CTAs de WhatsApp sempre via `waUrl()` em `src/lib/whatsapp.ts`.
- Cada fase fecha com `npm run build`, `npm run lint`, `npm run typecheck` passando.

## Comandos

`npm run dev` · `npm run build` (gera `out/`) · `npm run lint` · `npm run typecheck` · `npm run images` (reotimiza `public/brand`) · `npm run test` · `npm run e2e` · `npm run lhci` · `npm run deploy:do` (primeiro deploy na DO após `doctl auth init`)
