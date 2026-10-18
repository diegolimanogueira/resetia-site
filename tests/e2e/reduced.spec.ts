import { expect, test } from "@playwright/test";

/** Com prefers-reduced-motion o site inteiro é estático. Roda no projeto reduced-motion. */
test("reduced-motion: tudo no estado final, sem Lenis, sem cursor, sem seções presas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-movimento", "false");
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator("body")).not.toHaveAttribute("data-nocursor", /.*/);
  await expect(page.locator("[data-cursor]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("IA sem hype.Resultado na prática.");
  await expect(page.locator("[data-nota]").first()).toHaveText("7,1");

  const escalas = await page.locator("[data-line]").evaluateAll((els) => els.map((e) => getComputedStyle(e).scale));
  escalas.forEach((s) => expect(s).toBe("none"));
  const barras = await page
    .locator("[data-bar='verde']")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  barras.forEach((b) => expect(b).toBe("rgb(0, 230, 118)"));
  const posicoes = await page
    .locator("[data-stick]")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).position));
  posicoes.forEach((p) => expect(p).toBe("relative"));
});
