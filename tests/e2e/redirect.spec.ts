import { expect, test } from "@playwright/test";

test("a rota antiga /spotlite/ leva para Produtos", async ({ page }) => {
  await page.goto("/spotlite/");
  await expect(page).toHaveURL(/\/produtos\/(#spotlite)?$/, { timeout: 5_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produtos.");
});
