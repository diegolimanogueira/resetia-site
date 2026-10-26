import { expect, test } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { categoriasAgentes } from "@/content/agentes";
import { solucoes } from "@/content/solucoes";
import { waDiagnostico, waUrl } from "@/lib/whatsapp";

const linkDaSolucao = (page: import("@playwright/test").Page, nome: string) =>
  page.getByRole("link").filter({ has: page.getByRole("heading", { name: nome, exact: true }) });

test.describe("Soluções", () => {
  test("a página de soluções e a home listam as cinco, cada uma levando à sua landing page", async ({ page }) => {
    for (const caminho of ["/solucoes/", "/"]) {
      await page.goto(caminho);
      const escopo = caminho === "/" ? page.locator("#solucoes") : page.locator("main");
      for (const s of solucoes.lista) {
        const link = escopo.getByRole("link").filter({ has: page.getByRole("heading", { name: s.nome, exact: true }) });
        await expect(link, `${caminho} ${s.slug}`).toHaveCount(1);
        await expect(link).toHaveAttribute("href", `/solucoes/${s.slug}/`);
      }
    }
    const s = solucoes.lista[2];
    await linkDaSolucao(page, s.nome).first().click();
    await expect(page).toHaveURL(new RegExp(`/solucoes/${s.slug}/$`));
  });

  for (const s of solucoes.lista) {
    test(`${s.nome}: headline, desafios, benefícios, entregáveis, etapas e CTAs`, async ({ page }) => {
      await page.goto(`/solucoes/${s.slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(s.headline.map(semMarcas).join(" "));
      for (const p of s.problemas) await expect(page.getByText(p, { exact: true })).toBeVisible();
      for (const b of s.beneficios)
        await expect(page.getByRole("listitem").filter({ hasText: b }).first()).toBeVisible();
      for (const e of s.entregaveis)
        await expect(page.getByRole("listitem").filter({ hasText: e }).first()).toBeVisible();
      for (const e of s.etapas) await expect(page.getByRole("heading", { name: e.titulo, exact: true })).toBeVisible();
      await expect(page.getByText(s.paraQuem)).toBeVisible();
      await expect(page.locator(`a[data-cta='solucao-${s.slug}']`)).toHaveAttribute("href", waUrl(s.cta.mensagem));
      await expect(page.locator(`a[data-cta='solucao-${s.slug}']`)).toHaveText(new RegExp(s.cta.label));
      await expect(page.locator(`a[data-cta='diagnostico-solucao-${s.slug}']`)).toHaveAttribute(
        "href",
        waDiagnostico(),
      );
      for (const r of s.relacionadas)
        await expect(page.locator(`main a[href='/solucoes/${r}/']`).first()).toBeVisible();
      await expect(page.getByRole("link", { name: solucoes.detalhe.voltar.label })).toHaveAttribute(
        "href",
        "/solucoes/",
      );
    });
  }

  test("Processos com IA apresenta a Fluxa BPM como tecnologia, não como produto", async ({ page }) => {
    await page.goto("/solucoes/processos-com-ia/");
    await expect(page.getByText("não é um sexto produto de consultoria", { exact: false })).toBeVisible();
    await expect(page.locator("a[data-cta='solucao-processos-com-ia-fluxa-site']")).toHaveAttribute(
      "href",
      "https://www.fluxabpm.com.br/",
    );
  });

  test("Agent Factory: abas por área com os exemplos e link para o catálogo filtrado", async ({ page }) => {
    await page.goto("/solucoes/agent-factory/");
    const [mkt, vendas] = categoriasAgentes;
    await expect(page.getByRole("tab", { name: mkt.nome })).toHaveAttribute("aria-selected", "true");
    for (const a of mkt.agentes) await expect(page.getByText(a.nome, { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: vendas.nome }).click();
    await expect(page.getByRole("tab", { name: vendas.nome })).toHaveAttribute("aria-selected", "true");
    for (const a of vendas.agentes) await expect(page.getByText(a.nome, { exact: true })).toBeVisible();
    await expect(page.getByText(mkt.agentes[0].nome, { exact: true })).toBeHidden();
    await page.getByText(vendas.agentes[0].nome, { exact: true }).click();
    await expect(page).toHaveURL(/\/agentes-de-ia\/\?area=vendas$/);
  });

  test("slug inexistente é 404", async ({ page }) => {
    const resposta = await page.goto("/solucoes/nao-existe/");
    expect(resposta?.status()).toBe(404);
  });
});
