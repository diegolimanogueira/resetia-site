import { expect, test } from "@playwright/test";
import { site } from "@/content/site";
import { waFluxa, waGeral, waSpotlite } from "@/lib/whatsapp";
import { rotas } from "./rotas";

/** O site existe para gerar conversa no WhatsApp: todo CTA precisa apontar para o número e a mensagem certos. */
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
        const esperado = /fluxa/.test(origem) ? waFluxa() : /spotlite/.test(origem) ? waSpotlite() : waGeral();
        expect.soft(href, `CTA ${origem || "sem origem"} em ${rota.caminho}`).toBe(esperado);
        await expect.soft(a).toHaveAttribute("target", "_blank");
        expect.soft(await a.getAttribute("rel")).toContain("noopener");
      }
    });
  }

  test("a página Produtos: Spotlite e Fluxa com as mensagens e os links certos", async ({ page }) => {
    await page.goto("/produtos/");
    await expect(page.locator("a[data-cta='spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='fluxa-gratis']")).toHaveAttribute("href", site.ferramentas.fluxaGratis);
    await expect(page.locator("a[data-cta='produtos-spotlite']")).toHaveAttribute("href", waSpotlite());
    await expect(page.locator("a[data-cta='produtos-fluxa']")).toHaveAttribute("href", waFluxa());
    await expect(page.locator("a[data-cta='produtos-spotlite-final']")).toHaveAttribute("href", waSpotlite());
    await expect(page.locator("a[data-cta='footer']")).toHaveAttribute("href", waGeral());
  });

  test("na home, Spotlite e Fluxa têm o mesmo peso: cada uma com CTA externo e WhatsApp próprio", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[data-cta='home-spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='home-fluxa-gratis']")).toHaveAttribute("href", site.ferramentas.fluxaGratis);
    await expect(page.locator("a[data-cta='home-spotlite']")).toHaveAttribute("href", waSpotlite());
    await expect(page.locator("a[data-cta='home-fluxa']")).toHaveAttribute("href", waFluxa());
  });

  test("a mensagem decodificada é a do conteúdo", async ({ page }) => {
    await page.goto("/");
    const href = (await page.locator("a[data-cta='hero']").getAttribute("href"))!;
    expect(new URL(href).searchParams.get("text")).toBe(site.mensagens.geral);
  });
});
