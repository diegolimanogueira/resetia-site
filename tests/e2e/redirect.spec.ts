import { expect, test } from "@playwright/test";
import { tecnologias } from "@/content/tecnologias";

for (const antiga of ["/spotlite/", "/produtos/"]) {
  test(`a rota antiga ${antiga} leva para Tecnologias`, async ({ page }) => {
    await page.goto(antiga);
    await expect(page).toHaveURL(/\/tecnologias\/(#spotlite)?$/, { timeout: 5_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tecnologias.hero.titulo);
  });
}
