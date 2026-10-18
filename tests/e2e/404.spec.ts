import { expect, test } from "@playwright/test";

test("rota inexistente responde 404 com a página da marca e link para a home", async ({ page }) => {
  const resposta = await page.goto("/rota-que-nao-existe/");
  expect(resposta?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Página não encontrada.");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vamos reprogramar a rota.");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: /Voltar para a home/ }).click();
  await expect(page).toHaveURL(/\/$/);
});
