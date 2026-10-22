import { expect, test } from "@playwright/test";
import { site } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { waFluxa, waGeral, waSolucao, waSpotlite } from "@/lib/whatsapp";
import { rotas } from "./rotas";

/** Mensagem esperada pela origem do botão (data-cta). */
function esperadoPara(origem: string) {
  const solucao = solucoes.lista.find((s) => origem === `solucao-${s.slug}` || origem === `solucao-${s.slug}-final`);
  if (solucao) return waSolucao(solucao.nome);
  if (/fluxa/.test(origem)) return waFluxa();
  if (/spotlite/.test(origem)) return waSpotlite();
  return waGeral();
}

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
        expect.soft(href, `CTA ${origem || "sem origem"} em ${rota.caminho}`).toBe(esperadoPara(origem));
        await expect.soft(a).toHaveAttribute("target", "_blank");
        expect.soft(await a.getAttribute("rel")).toContain("noopener");
      }
    });
  }

  test("cada uma das sete soluções abre o WhatsApp com o nome dela", async ({ page }) => {
    for (const s of solucoes.lista) {
      await page.goto(`/solucoes/${s.slug}/`);
      await expect(page.locator(`a[data-cta='solucao-${s.slug}']`)).toHaveAttribute("href", waSolucao(s.nome));
      await expect(page.locator(`a[data-cta='solucao-${s.slug}-final']`)).toHaveAttribute("href", waSolucao(s.nome));
    }
  });

  test("a página Tecnologias: Spotlite e Fluxa com as mensagens e os links certos", async ({ page }) => {
    await page.goto("/tecnologias/");
    await expect(page.locator("a[data-cta='spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='fluxa-gratis']")).toHaveAttribute("href", site.ferramentas.fluxaGratis);
    await expect(page.locator("a[data-cta='tecnologias-spotlite']")).toHaveAttribute("href", waSpotlite());
    await expect(page.locator("a[data-cta='tecnologias-fluxa']")).toHaveAttribute("href", waFluxa());
    await expect(page.locator("a[data-cta='tecnologias-spotlite-final']")).toHaveAttribute("href", waSpotlite());
    await expect(page.locator("a[data-cta='footer']")).toHaveAttribute("href", waGeral());
  });

  test("na home, Spotlite e Fluxa têm o mesmo peso: cada uma com link para o próprio site", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[data-cta='home-spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='home-fluxa-site']")).toHaveAttribute("href", site.ferramentas.fluxa);
  });

  test("a mensagem decodificada é a do conteúdo", async ({ page }) => {
    await page.goto("/");
    const href = (await page.locator("a[data-cta='hero']").getAttribute("href"))!;
    expect(new URL(href).searchParams.get("text")).toBe(site.mensagens.geral);
  });
});
