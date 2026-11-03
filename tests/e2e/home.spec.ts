import { expect, test } from "@playwright/test";
import { aiScore } from "@/content/ai-score";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";

test.describe("home: abertura, demonstração e ordem das seções", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("a abertura fala das dores, explica o produto e deixa gratuidade, tempo e contato junto do botão", async ({
    page,
  }) => {
    const hero = page.locator("section").first();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Descubra onde a IA pode ajudar o seu negócio primeiro.",
    );
    for (const dor of ["Trabalho manual", "ferramentas de IA paradas", "processos soltos", "por onde começar"])
      await expect(hero).toContainText(dor);
    // O nome do produto vem com a explicação em português, e o aprofundamento é dito à parte, sem tempo.
    await expect(hero).toContainText("RESET AI Score");
    await expect(hero).toContainText("nota de 0 a 100 em seis dimensões");
    await expect(hero).toContainText(home.hero.opcional);
    const botao = page.locator("a[data-cta='ai-score-hero']");
    await expect(botao).toHaveText(site.ctaAiScore);
    await expect(botao).toHaveAttribute("href", "/ai-score/");
    const garantias = page.locator("[data-garantias] li");
    await expect(garantias).toHaveText(home.hero.garantias.map((g) => `✓${g}`));
    // As garantias ficam logo abaixo do grupo de botões (perto da ação), não no pé da página. No celular o botão
    // secundário empilha embaixo do primário, por isso a medida parte do último botão do grupo.
    const secundario = page.locator(`a[href='${home.hero.ctaSecundario.href}']`).first();
    const [b, s, g] = await Promise.all([
      botao.boundingBox(),
      secundario.boundingBox(),
      garantias.first().boundingBox(),
    ]);
    const fimDoGrupo = Math.max(b!.y + b!.height, s!.y + s!.height);
    expect(g!.y - fimDoGrupo).toBeLessThan(40);
  });

  test("no celular, texto, botão e benefício vêm antes da ilustração; o botão cabe na primeira tela e as garantias, no 390×844", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "só no celular");
    const [titulo, botao, ilustracao] = await Promise.all([
      page.getByRole("heading", { level: 1 }).boundingBox(),
      page.locator("a[data-cta='ai-score-hero']").boundingBox(),
      page.locator("[data-decorativo]").first().boundingBox(),
    ]);
    expect(titulo!.y).toBeLessThan(botao!.y);
    expect(ilustracao!.y).toBeGreaterThan(botao!.y);
    // O botão principal aparece sem rolar no viewport real do projeto (o Safari do celular desconta a barra do navegador).
    expect(botao!.y + botao!.height).toBeLessThan(page.viewportSize()!.height);
    // As garantias cabem na primeira tela do 390×844 do documento da fase.
    await page.setViewportSize({ width: 390, height: 844 });
    const garantia = await page.locator("[data-garantias]").boundingBox();
    expect(garantia!.y + garantia!.height).toBeLessThan(844);
    // Sem rolagem horizontal.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("a demonstração do diagnóstico vem logo depois da primeira prova, com nota, leitura e próximo passo", async ({
    page,
  }) => {
    const topo = (seletor: string) =>
      page
        .locator(seletor)
        .first()
        .evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const prova = page.getByText(home.prova.antes);
    const demo = page.locator("[data-demonstracao]");
    await expect(demo).toBeVisible();
    await expect(demo).toContainText(home.scan.demo.rotulo);
    await expect(demo.locator("[data-nota-demo]")).toHaveText("28");
    await expect(demo).toContainText("Explorando");
    for (const rotulo of ["O que merece atenção", "Respostas que sustentam essa leitura", "Primeira ação sugerida"])
      await expect(demo).toContainText(rotulo);
    await expect(demo.getByRole("link", { name: home.scan.demo.completo.label })).toHaveAttribute(
      "href",
      "/ai-score/exemplo/",
    );
    // Ordem: prova → demonstração → dores por área → Reset 360 → soluções → tecnologias → equipe.
    const posicoes = await Promise.all([
      prova.evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
      topo("[data-demonstracao]"),
      page.getByText(home.problema.kicker).evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
      page.getByText(home.areas.kicker).evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
      page
        .getByText(home.reset360.kicker, { exact: true })
        .evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
      topo("#solucoes"),
      page
        .getByText(home.tecnologias.kicker)
        .first()
        .evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
      page.getByText(home.quemSomos.kicker).evaluate((e) => e.getBoundingClientRect().top + window.scrollY),
    ]);
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
  });

  test("a nota da demonstração é a mesma do exemplo completo", async ({ page }) => {
    const nota = await page.locator("[data-nota-demo]").textContent();
    await page.goto("/ai-score/exemplo/");
    await expect(page.locator("[data-nota]")).toHaveText(nota!);
    expect(aiScore.exemplo.codigo).toContain("v=2");
  });
});

test.describe("barra persistente: a avaliação é a ação principal, o WhatsApp a alternativa", () => {
  test("na home e no AI Score: avaliação primeiro; na Análise Estratégica: WhatsApp primeiro; no questionário, sem barra", async ({
    page,
  }) => {
    for (const [caminho, primeiro] of [
      ["/", "ai-score-barra"],
      ["/solucoes/", "ai-score-barra"],
      ["/diagnostico-gratuito/", "barra-mobile"],
    ] as const) {
      await page.goto(caminho);
      await page.evaluate(() => window.scrollTo(0, 1200));
      const barra = page.locator("[data-barra-mobile]");
      await expect(barra).toBeVisible();
      const links = barra.locator("a");
      await expect(links).toHaveCount(2);
      await expect(links.first(), caminho).toHaveAttribute("data-cta", primeiro);
      // O WhatsApp está sempre ali, como alternativa de conversa.
      await expect(barra.locator("a[data-cta='barra-mobile']")).toHaveAttribute("href", waGeral());
      await expect(barra.locator("a[data-cta='ai-score-barra']")).toHaveAttribute("href", "/ai-score/");
    }
    for (const caminho of ["/ai-score/avaliacao/", "/ai-score/resultado/", "/ai-score/preferencias/"]) {
      await page.goto(caminho);
      await expect(page.locator("[data-barra-mobile]")).toHaveCount(0);
    }
  });

  test("o data-cta de cada botão é único na página", async ({ page }) => {
    for (const caminho of ["/", "/ai-score/", "/diagnostico-gratuito/", "/solucoes/", "/agentes-de-ia/"]) {
      await page.goto(caminho);
      const ctas = await page.locator("[data-cta]").evaluateAll((els) => els.map((e) => e.getAttribute("data-cta")));
      expect(new Set(ctas).size, `${caminho}: ${ctas.join(", ")}`).toBe(ctas.length);
    }
  });
});
