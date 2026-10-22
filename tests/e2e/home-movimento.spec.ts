import { expect, test } from "@playwright/test";
import { home } from "@/content/home";

/** Movimento da home com ponteiro fino e sem reduced-motion (só desktop-chromium). */
test.describe("home: movimento", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("o título decodifica e assenta no texto final em até 1,2 s", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(home.hero.titulo.join(""), { timeout: 1_500 });
  });

  test("Lenis e cursor da marca ativos; header some ao descer e volta ao subir", async ({ page }) => {
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await expect(page.locator("html")).toHaveAttribute("data-movimento", "true");
    await expect(page.locator("body")).toHaveAttribute("data-nocursor", "");
    await page.getByRole("link", { name: home.hero.ctaPrimario }).first().hover();
    await expect(page.locator("[data-cursor='anel']")).toHaveAttribute("data-modo", "link");

    await page.mouse.move(700, 450);
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(120);
    }
    await expect(page.locator("header")).toHaveAttribute("data-escondido", "", { timeout: 3_000 });
    await expect(page.locator("header")).toHaveAttribute("data-rolou", "");
    await page.mouse.wheel(0, -400);
    await expect(page.locator("header")).not.toHaveAttribute("data-escondido", /.*/, { timeout: 3_000 });
  });

  test("seções presas e wipe: a seção seguinte entra recortada por clip-path", async ({ page }) => {
    // O top das seções presas é calculado num efeito após a hidratação: esperar, não ler de imediato.
    const lerTops = () =>
      page.locator("[data-stick]").evaluateAll((els) => els.map((e) => (e as HTMLElement).style.top));
    await expect.poll(async () => (await lerTops()).every((t) => /^-?\d+px$/.test(t)), { timeout: 5_000 }).toBe(true);
    expect(await lerTops()).toHaveLength(3);
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 500);
    await expect
      .poll(
        async () =>
          page
            .locator("[data-wipe]")
            .first()
            .evaluate((e) => (e as HTMLElement).style.clipPath),
        { timeout: 3_000 },
      )
      .toMatch(/^inset\(\d+px( 0(px)?){1,3}\)$/); // Chrome serializa inset(180px 0 0 0) como inset(180px 0px 0px)
  });

  test("o mockup da Spotlite conta do zero até 3,6 / R$ 4.200 / 9 ao entrar na tela", async ({ page }) => {
    const card = page.locator("[data-count]").first();
    await expect(card).toHaveAttribute("data-armado", "");
    await expect(card.locator("[data-nota]")).toHaveText("0,0");
    await page.mouse.move(700, 450);
    // A página cresceu: rola em passos curtos até o cartão entrar (intervalo fixo, senão o poll espaça demais).
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 600);
          await page.waitForTimeout(100);
          return card.getAttribute("data-armado");
        },
        { intervals: [150], timeout: 15_000 },
      )
      .toBeNull();
    await expect(card.locator("[data-nota]")).toHaveText("3,6", { timeout: 3_000 });
    await expect(card.locator("[data-horas]")).toContainText("4.200");
    await expect(card.locator("[data-ativ]")).toContainText("9");
  });
});
