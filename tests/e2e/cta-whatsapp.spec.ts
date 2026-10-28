import { expect, test } from "@playwright/test";
import { site } from "@/content/site";
import { solucaoPorSlug, solucoes } from "@/content/solucoes";
import { testeSpotliteUrl } from "@/lib/teste-spotlite";
import { waDiagnostico, waGeral, waUrl } from "@/lib/whatsapp";
import { rotas } from "./rotas";

/** Mensagem esperada pela origem do botão (data-cta). O resultado do AI Score leva a nota (ver ai-score.spec). */
function esperadoPara(origem: string) {
  if (origem.startsWith("diagnostico")) return waDiagnostico();
  if (origem === "agentes-factory") return waUrl(solucaoPorSlug("agent-factory")!.cta.mensagem);
  const s = solucoes.lista.find((x) => new RegExp(`^solucao-${x.slug}(-final)?$`).test(origem));
  return s ? waUrl(s.cta.mensagem) : waGeral();
}

/** O site existe para gerar conversa: todo CTA precisa apontar para o número e a mensagem certos. */
test.describe("CTAs de WhatsApp", () => {
  for (const rota of rotas) {
    test(`em ${rota.caminho} todo link wa.me tem a mensagem certa, nova aba e noopener`, async ({ page }) => {
      await page.goto(rota.caminho);
      const links = page.locator("a[href*='wa.me']");
      const total = await links.count();
      expect(total, "há CTAs de WhatsApp na página").toBeGreaterThanOrEqual(2);
      for (let i = 0; i < total; i++) {
        const a = links.nth(i);
        const href = (await a.getAttribute("href"))!;
        const origem = (await a.getAttribute("data-cta")) ?? "";
        expect.soft(href, `CTA ${origem || "sem origem"} em ${rota.caminho}`).toBe(esperadoPara(origem));
        await expect.soft(a).toHaveAttribute("target", "_blank");
        expect.soft(await a.getAttribute("rel")).toContain("noopener");
      }
    });
  }

  test("o AI Score aparece no hero, depois das soluções, no bloco próprio e antes do rodapé da home", async ({
    page,
  }) => {
    await page.goto("/");
    for (const cta of ["ai-score-hero", "ai-score-solucoes", "ai-score-home", "ai-score-final"]) {
      const a = page.locator(`a[data-cta='${cta}']`);
      await expect(a, cta).toHaveAttribute("href", "/ai-score/");
      await expect(a, cta).toHaveText(new RegExp(site.ctaAiScore));
    }
    // Falar com um especialista (Análise Estratégica) é o segundo caminho, no bloco do AI Score e no fecho.
    for (const cta of ["diagnostico-home", "diagnostico-final"]) {
      const a = page.locator(`a[data-cta='${cta}']`);
      await expect(a, cta).toHaveAttribute("href", waDiagnostico());
      await expect(a, cta).toHaveText(new RegExp(site.ctaDiagnostico));
    }
    await expect(page.locator("a[data-cta='home-spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='home-fluxa-site']")).toHaveAttribute("href", site.ferramentas.fluxa);
  });

  test("a página da Análise Estratégica: WhatsApp e AI Score no topo, teste da Spotlite como alternativa", async ({
    page,
  }) => {
    await page.goto("/diagnostico-gratuito/");
    await expect(page.locator("a[data-cta='diagnostico-pagina']")).toHaveAttribute("href", waDiagnostico());
    await expect(page.locator("a[data-cta='ai-score-pagina']")).toHaveAttribute("href", "/ai-score/");
    const teste = page.locator("a[data-cta='teste-spotlite']");
    await expect(teste).toHaveAttribute("href", testeSpotliteUrl("diagnostico"));
    await expect(teste).toHaveAttribute("target", "_blank");
  });

  test("a mensagem decodificada do diagnóstico é a do conteúdo", async ({ page }) => {
    await page.goto("/");
    const href = (await page.locator("a[data-cta='diagnostico-final']").getAttribute("href"))!;
    expect(new URL(href).searchParams.get("text")).toBe(site.mensagens.diagnostico);
  });
});
