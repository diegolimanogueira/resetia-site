import { expect, test, type Page } from "@playwright/test";
import { rotas } from "./rotas";

/** Telas do documento da fase 7: celular estreito, celular comum e desktop. */
const telas = [
  { largura: 320, altura: 640 },
  { largura: 390, altura: 844 },
  { largura: 1440, altura: 900 },
] as const;

/** As páginas do AI Score que não são indexáveis (não entram em `rotas`), no estado em que abrem sem dados. */
const aiScoreFora = [
  { nome: "avaliacao", caminho: "/ai-score/avaliacao/" },
  { nome: "exemplo", caminho: "/ai-score/exemplo/" },
  { nome: "resultado sem link", caminho: "/ai-score/resultado/" },
  { nome: "preferencias sem link", caminho: "/ai-score/preferencias/" },
];

const todas = [...rotas.map((r) => ({ nome: r.nome, caminho: r.caminho })), ...aiScoreFora];

async function foraDaTela(page: Page) {
  return page.evaluate(() => {
    const largura = window.innerWidth;
    // Rolagem horizontal dentro de um contêiner (tabela larga, por exemplo) é de propósito.
    const rolaPorDentro = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === "auto" || o === "scroll") return true;
      }
      return false;
    };
    const escondido = (el: Element) => !!el.closest("[aria-hidden='true'], [data-decorativo], [hidden], .sr-only");
    const cortados: string[] = [];
    for (const el of document.querySelectorAll(
      "h1, h2, h3, p, li, a, button, summary, label, input, select, textarea",
    )) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || escondido(el) || rolaPorDentro(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > largura + 1 || r.left < -1)
        cortados.push(
          `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 40)}" (${Math.round(r.left)}→${Math.round(r.right)})`,
        );
    }
    return {
      rolagem: document.documentElement.scrollWidth - largura,
      cortados: cortados.slice(0, 5),
    };
  });
}

test.describe("sem rolagem horizontal nem texto cortado em 320, 390 e 1440 px", () => {
  for (const tela of telas) {
    for (const rota of todas) {
      test(`${rota.nome} em ${tela.largura} px`, async ({ page }) => {
        await page.setViewportSize({ width: tela.largura, height: tela.altura });
        await page.goto(rota.caminho);
        await page.evaluate(() => document.fonts.ready);
        const { rolagem, cortados } = await foraDaTela(page);
        expect(rolagem, "a página rola na horizontal").toBeLessThanOrEqual(0);
        expect(cortados, "elementos de texto fora da tela").toEqual([]);
      });
    }
  }
});

/** Contraste (WCAG) entre o contorno do foco e o primeiro fundo opaco atrás do elemento. Mínimo de 3:1 (não textual). */
async function focoAtual(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const cor = (texto: string) => {
      const m = texto.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = 1] = m[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return { r, g, b, a };
    };
    const luz = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const cs = getComputedStyle(el);
    const contorno = cor(cs.outlineColor);
    let fundo = { r: 255, g: 255, b: 255, a: 1 };
    // O contorno fica fora do elemento (outline-offset): o fundo que importa é o de quem está atrás dele, não o do próprio botão.
    for (let p: Element | null = el.parentElement; p; p = p.parentElement) {
      const c = cor(getComputedStyle(p).backgroundColor);
      if (c && c.a === 1) {
        fundo = c;
        break;
      }
    }
    const r = el.getBoundingClientRect();
    const claro = contorno ? Math.max(luz(contorno), luz(fundo)) : 0;
    const escuro = contorno ? Math.min(luz(contorno), luz(fundo)) : 0;
    return {
      nome: `${el.tagName.toLowerCase()} "${(el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 40)}"`,
      visivel: r.width > 0 && r.height > 0,
      contorno: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
      razao: contorno ? (claro + 0.05) / (escuro + 0.05) : 0,
      emFundoCarvao: !!el.closest("[data-tom='noite'], footer"),
    };
  });
}

test.describe("teclado: o foco aparece, em elemento visível e com contraste", () => {
  for (const caminho of ["/", "/ai-score/", "/solucoes/ai-champions/", "/diagnostico-gratuito/", "/privacidade/"]) {
    test(`foco visível em ${caminho}`, async ({ page, isMobile }) => {
      test.skip(isMobile, "o Safari do celular não percorre links com Tab");
      await page.goto(caminho);
      await page.evaluate(() => document.fonts.ready);
      const problemas: string[] = [];
      let passos = 0;
      let carvao = 0;
      for (; passos < 150; passos++) {
        await page.keyboard.press("Tab");
        const f = await focoAtual(page);
        if (!f) break;
        if (f.emFundoCarvao) carvao++;
        if (!f.visivel) problemas.push(`${f.nome}: foco em elemento sem área visível`);
        else if (!f.contorno) problemas.push(`${f.nome}: sem contorno de foco`);
        else if (f.razao < 3) problemas.push(`${f.nome}: contraste do contorno ${f.razao.toFixed(2)}:1 (mínimo 3:1)`);
      }
      expect(passos, "nenhum elemento recebeu foco").toBeGreaterThan(5);
      expect(problemas).toEqual([]);
      // O rodapé em carvão tem links e o contraste dele foi conferido junto, não deixado de fora.
      expect(carvao, "nenhum foco passou pelo rodapé ou pelo fecho em carvão").toBeGreaterThan(0);
    });
  }
});

test.describe("movimento reduzido desliga transição, animação e rolagem suave", () => {
  for (const caminho of ["/", "/ai-score/", "/solucoes/"]) {
    test(`prefers-reduced-motion em ${caminho}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(caminho);
      await page.evaluate(() => document.fonts.ready);
      const estado = await page.evaluate(() => {
        const ligadas: string[] = [];
        for (const el of document.querySelectorAll("a, button, summary, [data-decorativo], svg *")) {
          const cs = getComputedStyle(el);
          const duracoes = cs.transitionDuration.split(",").map((d) => parseFloat(d));
          if (duracoes.some((d) => d > 0))
            ligadas.push(`${el.tagName.toLowerCase()} transição ${cs.transitionDuration}`);
          if (cs.animationName !== "none") ligadas.push(`${el.tagName.toLowerCase()} animação ${cs.animationName}`);
        }
        return {
          rolagem: getComputedStyle(document.documentElement).scrollBehavior,
          ligadas: ligadas.slice(0, 5),
          emAndamento: document.getAnimations().filter((a) => a.playState === "running").length,
        };
      });
      expect(estado.rolagem).toBe("auto");
      expect(estado.ligadas).toEqual([]);
      expect(estado.emAndamento).toBe(0);
    });
  }
});
