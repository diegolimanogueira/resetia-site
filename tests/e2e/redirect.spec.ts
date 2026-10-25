import { expect, test } from "@playwright/test";

/** Rotas antigas viraram seções da home (layout do reset360). */
const antigas = [
  ["/solucoes/", "solucoes"],
  ["/tecnologias/", "tecnologias"],
  ["/produtos/", "tecnologias"],
  ["/spotlite/", "tecnologias"],
] as const;

for (const [antiga, ancora] of antigas) {
  test(`a rota antiga ${antiga} leva à seção #${ancora} da home`, async ({ page }) => {
    await page.goto(antiga);
    await expect(page).toHaveURL(new RegExp(`/#${ancora}$`), { timeout: 5_000 });
    await expect(page.locator(`#${ancora}`)).toBeVisible();
  });
}
