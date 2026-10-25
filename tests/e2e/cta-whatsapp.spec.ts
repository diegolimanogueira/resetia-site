import { expect, test } from "@playwright/test";
import { site } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { diagnosticoUrl } from "@/lib/diagnostico";
import { waGeral, waSolucao } from "@/lib/whatsapp";
import { rotas } from "./rotas";

/** Mensagem esperada pela origem do botão (data-cta). */
function esperadoPara(origem: string) {
  const solucao = solucoes.lista.find((s) => origem === `solucao-${s.slug}` || origem === `solucao-${s.slug}-final`);
  return solucao ? waSolucao(solucao.nome) : waGeral();
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

  test("na home: hero, fecho e rodapé no WhatsApp; Spotlite e Fluxa com link para o próprio site", async ({ page }) => {
    await page.goto("/");
    for (const cta of ["hero", "fecho", "footer", "header"])
      await expect(page.locator(`a[data-cta='${cta}']`)).toHaveAttribute("href", waGeral());
    await expect(page.locator("a[data-cta='home-spotlite-site']")).toHaveAttribute("href", site.ferramentas.spotlite);
    await expect(page.locator("a[data-cta='home-fluxa-site']")).toHaveAttribute("href", site.ferramentas.fluxa);
  });

  test("o teste de IA da Spotlite abre em nova aba com a origem da home", async ({ page }) => {
    await page.goto("/");
    const a = page.locator("a[data-cta='home-diagnostico']");
    await expect(a).toHaveAttribute("href", diagnosticoUrl("home"));
    await expect(a).toHaveAttribute("target", "_blank");
    expect(await a.getAttribute("rel")).toContain("noopener");
  });

  test("a mensagem decodificada é a do conteúdo", async ({ page }) => {
    await page.goto("/");
    const href = (await page.locator("a[data-cta='fecho']").getAttribute("href"))!;
    expect(new URL(href).searchParams.get("text")).toBe(site.mensagens.geral);
  });
});
