import { expect, test } from "@playwright/test";
import { solucoes } from "@/content/solucoes";

test.describe("Soluções", () => {
  test("lista os cinco programas com os três campos", async ({ page }) => {
    await page.goto("/solucoes/");
    for (const p of solucoes.programas) {
      const bloco = page.locator("article").filter({ has: page.getByRole("heading", { name: p.nome, exact: true }) });
      await expect(bloco).toHaveCount(1);
      await expect(bloco.getByText(p.quem)).toBeVisible();
    }
  });

  test("FAQ: um item aberto por vez, acessível por teclado", async ({ page }) => {
    await page.goto("/solucoes/");
    const triggers = page.locator("[data-slot='accordion-trigger']");
    await expect(triggers).toHaveCount(solucoes.faq.itens.length);
    await triggers.nth(0).scrollIntoViewIfNeeded();
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
    await triggers.nth(0).click();
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(solucoes.faq.itens[0].resposta)).toBeVisible();
    await triggers.nth(1).click();
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
    await triggers.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
  });
});
