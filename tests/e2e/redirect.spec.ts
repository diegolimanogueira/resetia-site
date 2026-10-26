import { expect, test } from "@playwright/test";

/** Rotas antigas e o destino novo (a query segue junto). */
const antigas = [
  ["/solucoes/scan/", /\/diagnostico-gratuito\/$/],
  ["/solucoes/workshops/", /\/solucoes\/ai-champions\/$/],
  ["/agentes/", /\/agentes-de-ia\/$/],
  ["/agentes/?area=vendas", /\/agentes-de-ia\/\?area=vendas$/],
  ["/produtos/", /\/tecnologias\/$/],
  ["/spotlite/", /\/tecnologias\/$/],
] as const;

for (const [antiga, destino] of antigas) {
  test(`a rota antiga ${antiga} redireciona`, async ({ page }) => {
    await page.goto(antiga);
    await expect(page).toHaveURL(destino, { timeout: 5_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("o filtro da rota antiga de agentes continua valendo no destino", async ({ page }) => {
  await page.goto("/agentes/?area=vendas");
  await expect(page).toHaveURL(/\/agentes-de-ia\/\?area=vendas$/, { timeout: 5_000 });
  await expect(page.locator("[data-filtro='vendas']")).toHaveAttribute("aria-pressed", "true");
});
