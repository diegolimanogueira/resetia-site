import { expect, test } from "@playwright/test";
import { solucoes } from "@/content/solucoes";

test.describe("Soluções", () => {
  test("a home lista as sete soluções em cards, cada um levando à sua página", async ({ page }) => {
    await page.goto("/");
    const secao = page.locator("#solucoes");
    for (const s of solucoes.lista) {
      const link = secao.getByRole("link").filter({ has: page.getByRole("heading", { name: s.nome, exact: true }) });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", `/solucoes/${s.slug}/`);
      await expect(link.getByText(s.frase)).toBeVisible();
    }
    const s = solucoes.lista[3];
    await secao
      .getByRole("link")
      .filter({ has: page.getByRole("heading", { name: s.nome, exact: true }) })
      .click();
    await expect(page).toHaveURL(new RegExp(`/solucoes/${s.slug}/$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(s.nome);
  });

  for (const s of solucoes.lista) {
    test(`${s.nome}: título, quadro lateral, entregas e as outras seis soluções`, async ({ page }) => {
      await page.goto(`/solucoes/${s.slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(s.nome);
      await expect(page.getByText(s.descricao)).toBeVisible();
      await expect(page.getByText(s.paraQuem)).toBeVisible();
      await expect(page.getByText(s.medimos)).toBeVisible();
      for (const e of s.entregas) await expect(page.getByRole("listitem").filter({ hasText: e }).first()).toBeVisible();
      await expect(page.locator("main a[href^='/solucoes/'] h3")).toHaveCount(solucoes.lista.length - 1);
      await expect(page.getByRole("link", { name: solucoes.detalhe.voltar.label })).toHaveAttribute(
        "href",
        "/#solucoes",
      );
    });
  }

  test("Agent Factory aponta para o catálogo de agentes", async ({ page }) => {
    await page.goto("/solucoes/agent-factory/");
    await page.getByRole("link", { name: /Ver catálogo de agentes/ }).click();
    await expect(page).toHaveURL(/\/agentes\/$/);
  });

  test("slug inexistente é 404", async ({ page }) => {
    const resposta = await page.goto("/solucoes/nao-existe/");
    expect(resposta?.status()).toBe(404);
  });
});
