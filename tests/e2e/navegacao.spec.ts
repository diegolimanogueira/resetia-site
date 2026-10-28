import { expect, test } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { navDiagnostico, site } from "@/content/site";
import { sobre } from "@/content/sobre";
import { linksNav, rotas } from "./rotas";

test.describe("navegação", () => {
  test("header: cinco páginas, o AI Score em destaque, aria-current e logo de volta à home", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "nav desktop");
    await page.goto("/agentes-de-ia/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const l of linksNav) await expect(nav.getByRole("link", { name: l.label, exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Agentes de IA" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current", /.*/);
    await nav.getByRole("link", { name: navDiagnostico.label }).click();
    await expect(page).toHaveURL(/\/ai-score\/$/);
    await nav.getByRole("link", { name: "Soluções" }).click();
    await expect(page).toHaveURL(/\/solucoes\/$/);
    await page.getByRole("link", { name: site.nome, exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  for (const rota of rotas) {
    test(`header sticky e carvão em ${rota.caminho}`, async ({ page }) => {
      await page.goto(rota.caminho);
      await expect(page.locator("header")).toHaveAttribute("data-tom", "carvao");
      await expect(page.locator("header")).toHaveCSS("position", "sticky");
    });
  }

  test("menu mobile: links, AI Score e WhatsApp; fecha com Esc e navega", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só mobile");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
    const botao = page.getByRole("button", { name: "Menu" });
    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("navigation", { name: "Menu" });
    for (const l of linksNav) await expect(menu.getByRole("link", { name: l.label, exact: true })).toBeVisible();
    const painel = page.locator("#menu-mobile");
    await expect(painel.getByRole("link", { name: navDiagnostico.label })).toBeVisible();
    await expect(painel.getByRole("link", { name: site.barraMobile })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(botao).toBeFocused();
    await botao.click();
    await menu.getByRole("link", { name: "Sobre a Reset" }).click();
    await expect(page).toHaveURL(/\/sobre\/$/);
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      sobre.hero.titulo.map(semMarcas).join(" "),
    );
  });

  test("botão secundário do hero leva às soluções da home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Conhecer nossas soluções" }).click();
    await expect(page).toHaveURL(/#solucoes$/);
    await expect
      .poll(async () => page.evaluate(() => document.querySelector("#solucoes")!.getBoundingClientRect().top), {
        timeout: 5_000,
      })
      .toBeLessThan(120);
  });
});
