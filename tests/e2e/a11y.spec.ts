import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { rotas } from "./rotas";

const graves = new Set(["serious", "critical"]);

for (const rota of rotas) {
  test(`acessibilidade (axe, WCAG 2.1 AA) em ${rota.caminho}`, async ({ page }) => {
    await page.goto(rota.caminho);
    await page.evaluate(() => document.fonts.ready);
    // [data-decorativo]: numerais e o "+" do FAQ em verde sobre neutro (escolha do manual, aria-hidden, ordem já na <ol>).
    const resultado = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("[data-decorativo]")
      .analyze();
    const violacoes = resultado.violations.filter((v) => graves.has(v.impact ?? ""));
    expect(
      violacoes.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    ).toEqual([]);
  });
}

test("404 também passa no axe", async ({ page }) => {
  await page.goto("/rota-que-nao-existe/");
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(resultado.violations.filter((v) => graves.has(v.impact ?? ""))).toEqual([]);
});
