import { expect, test } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { site } from "@/content/site";
import { sobre } from "@/content/sobre";
import { linksNav, rotas } from "./rotas";

/** A seção da âncora termina logo abaixo do header sticky (72px). */
async function esperarNoTopo(page: import("@playwright/test").Page, id: string) {
  await expect
    .poll(async () => page.evaluate((s) => document.querySelector(s)!.getBoundingClientRect().top, `#${id}`), {
      timeout: 5_000,
    })
    .toBeLessThan(120);
}

test.describe("navegação", () => {
  test("header: âncoras da home, link ativo com aria-current e logo de volta à home", async ({ page, isMobile }) => {
    test.skip(isMobile, "nav desktop");
    await page.goto("/agentes/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav.getByRole("link", { name: "Agentes" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Sobre" })).not.toHaveAttribute("aria-current", /.*/);
    await nav.getByRole("link", { name: "Método" }).click();
    await expect(page).toHaveURL(/\/#metodo$/);
    await esperarNoTopo(page, "metodo");
    await nav.getByRole("link", { name: "Tecnologias" }).click();
    await expect(page).toHaveURL(/\/#tecnologias$/);
    await esperarNoTopo(page, "tecnologias");
    await nav.getByRole("link", { name: "Sobre" }).click();
    await expect(page).toHaveURL(/\/sobre\/$/);
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

  test("menu mobile: abre, mostra os links, fecha com Esc e navega", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só mobile");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
    const botao = page.getByRole("button", { name: "Menu" });
    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("navigation", { name: "Menu" });
    for (const l of linksNav) await expect(menu.getByRole("link", { name: l.label })).toBeVisible();
    await expect(page.locator("#menu-mobile").getByRole("link", { name: site.ctaHeader })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(botao).toBeFocused();
    await botao.click();
    await menu.getByRole("link", { name: "Sobre" }).click();
    await expect(page).toHaveURL(/\/sobre\/$/);
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      sobre.hero.titulo.map(semMarcas).join(" "),
    );
  });

  test("botão secundário do hero leva à âncora #solucoes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Explorar o Reset 360" }).click();
    await expect(page).toHaveURL(/#solucoes$/);
    await esperarNoTopo(page, "solucoes");
  });
});
