import { expect, test } from "@playwright/test";
import { site } from "@/content/site";
import { linksNav, rotas } from "./rotas";

test.describe("navegação", () => {
  test("header: logo volta para a home e o link ativo tem aria-current", async ({ page, isMobile }) => {
    test.skip(isMobile, "nav desktop");
    await page.goto("/solucoes/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav.getByRole("link", { name: "Soluções" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Spotlite" })).not.toHaveAttribute("aria-current", /.*/);
    await nav.getByRole("link", { name: "Spotlite" }).click();
    await expect(page).toHaveURL(/\/spotlite\/$/);
    await expect(nav.getByRole("link", { name: "Spotlite" })).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: site.nome, exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  for (const rota of rotas) {
    test(`header assume o tom da página em ${rota.caminho}`, async ({ page }) => {
      await page.goto(rota.caminho);
      await expect(page.locator("header")).toHaveAttribute("data-tom", rota.tom);
    });
  }

  test("menu mobile: abre, foca, navega e fecha com Esc", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só mobile");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
    const abrir = page.getByRole("button", { name: "Abrir menu" });
    await abrir.click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    for (const l of linksNav) await expect(dialogo.getByRole("link", { name: l.label })).toBeVisible();
    await expect(dialogo.getByRole("link", { name: site.ctaHeader })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await abrir.click();
    await dialogo.getByRole("link", { name: "Sobre" }).click();
    await expect(page).toHaveURL(/\/sobre\/$/);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quem está por trás.");
  });

  test("botão secundário do hero leva à âncora #como-funciona", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ver como funciona" }).click();
    await expect(page).toHaveURL(/#como-funciona$/);
    await expect
      .poll(
        async () =>
          page.evaluate(() => Math.abs(document.querySelector("#como-funciona")!.getBoundingClientRect().top)),
        {
          timeout: 5_000,
        },
      )
      .toBeLessThan(120);
  });
});
