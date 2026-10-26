import { expect, test } from "@playwright/test";
import { agentes, areas } from "@/content/agentes";

const total = agentes.lista.length;
const daArea = (id: string) => agentes.lista.filter((a) => a.area === id).length;

test.describe("Catálogo de agentes", () => {
  test("mostra os 30 agentes e filtra por área sem recarregar, refletindo na URL", async ({ page }) => {
    await page.goto("/agentes-de-ia/");
    const cards = page.locator("[data-agente]");
    await expect(cards).toHaveCount(total);
    await expect(page.locator("[data-filtro='todos']")).toHaveAttribute("aria-pressed", "true");

    await page.locator("[data-filtro='vendas']").click();
    await expect(page).toHaveURL(/\/agentes-de-ia\/\?area=vendas$/);
    await expect(cards).toHaveCount(daArea("vendas"));
    await expect(page.locator("[data-agente]:not([data-agente='vendas'])")).toHaveCount(0);
    await expect(page.locator("[data-filtro='vendas']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-filtro='todos']")).toHaveAttribute("aria-pressed", "false");

    await page.locator("[data-filtro='todos']").click();
    await expect(page).toHaveURL(/\/agentes-de-ia\/$/);
    await expect(cards).toHaveCount(total);
  });

  for (const a of areas) {
    test(`abre já filtrado por ?area=${a.id}`, async ({ page }) => {
      await page.goto(`/agentes-de-ia/?area=${a.id}`);
      await expect(page.locator("[data-agente]")).toHaveCount(daArea(a.id));
      await expect(page.locator(`[data-filtro='${a.id}']`)).toHaveAttribute("aria-pressed", "true");
    });
  }

  test("área desconhecida na URL mostra todos", async ({ page }) => {
    await page.goto("/agentes-de-ia/?area=financeiro");
    await expect(page.locator("[data-agente]")).toHaveCount(total);
  });

  test("a home leva ao catálogo já filtrado pela área", async ({ page }) => {
    await page.goto("/");
    await page.locator("#areas").getByRole("link").nth(2).click();
    await expect(page).toHaveURL(/\/agentes-de-ia\/\?area=customer-success$/);
    await expect(page.locator("[data-agente]")).toHaveCount(daArea("customer-success"));
  });
});
