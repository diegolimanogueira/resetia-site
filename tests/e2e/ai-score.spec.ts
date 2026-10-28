import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { aiScore } from "@/content/ai-score";
import {
  aprofundar,
  desafios,
  formulario,
  horizontes,
  modulosArea,
  perguntasCentrais,
  questionario,
  relatorio,
  resultadoTextos,
} from "@/content/ai-score-questionario";
import { site } from "@/content/site";
import { waUrl } from "@/lib/whatsapp";

/** Respostas do exemplo do documento (46, Em desenvolvimento): dimensões 75, 50, 37,5, 50, 25, 37,5. */
const EXEMPLO = [3, 3, 2, 2, 2, 1, 2, 2, 1, 1, 2, 1];
const graves = new Set(["serious", "critical"]);

async function semViolacoes(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(
    r.violations
      .filter((v) => graves.has(v.impact ?? ""))
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

/** Intercepta a REST do Supabase (o CI builda com uma URL fictícia) e guarda o que o site gravou. */
async function interceptarSupabase(page: Page) {
  const gravados: Array<{ tabela: string; corpo: Record<string, unknown> }> = [];
  await page.route("**/rest/v1/**", async (rota) => {
    const tabela = new URL(rota.request().url()).pathname.split("/").pop()!;
    gravados.push({ tabela, corpo: rota.request().postDataJSON() });
    await rota.fulfill({ status: 201, body: "" });
  });
  return gravados;
}

/** Título da etapa (o rodapé também tem h2). */
const etapa = (page: Page) => page.locator("#avaliacao").getByRole("heading", { level: 2 });
const continuar = (page: Page) => page.getByRole("button", { name: questionario.continuar }).click();

async function segmentar(page: Page, escopo: RegExp) {
  await page.getByRole("radio", { name: "Empresário ou CEO" }).check();
  await page.getByRole("radio", { name: escopo }).check();
  await page.getByRole("radio", { name: "50 a 199" }).check();
  await page.getByRole("radio", { name: "Tecnologia" }).check();
  await continuar(page);
}

async function responderCentrais(page: Page, area = false) {
  for (const [i, p] of perguntasCentrais.entries()) {
    await expect(etapa(page)).toHaveText(area ? p.texto.area : p.texto.empresa);
    await page.getByRole("radio", { name: p.alternativas[EXEMPLO[i]], exact: true }).check();
    await continuar(page);
  }
}

async function responderArea(page: Page, area: string, valores: number[]) {
  const m = modulosArea.find((x) => x.area === area)!;
  await expect(etapa(page)).toHaveText(m.nome);
  const curtas = ["Não usamos", "Ocasional", "Pontual", "Rotina", "Integrada"];
  for (const [i, p] of m.perguntas.entries())
    await page
      .getByRole("group", { name: p.texto })
      .getByRole("radio", { name: curtas[valores[i]], exact: true })
      .check();
  await continuar(page);
}

async function fechar(page: Page) {
  await expect(etapa(page)).toHaveText(questionario.etapas.fechamento);
  await page.getByRole("checkbox", { name: desafios[0].label }).check();
  await page.getByRole("radio", { name: horizontes.opcoes[1].label }).check();
  await page.getByRole("button", { name: questionario.concluir }).click();
}

test.describe("RESET AI Score", () => {
  // Nenhum teste grava no banco de verdade (o smoke roda este arquivo contra produção): a REST é sempre interceptada.
  test.beforeEach(async ({ page }) => {
    await page.route("**/rest/v1/**", (rota) => rota.fulfill({ status: 201, body: "" }));
  });

  test("landing page: hero, seis dimensões, exemplo ilustrativo (46) e CTAs", async ({ page }) => {
    await page.goto("/ai-score/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      aiScore.hero.titulo.map(semMarcas).join(" "),
    );
    await expect(page.locator("a[data-cta='ai-score-hero']")).toHaveAttribute("href", "/ai-score/avaliacao/");
    await expect(page.getByText(aiScore.hero.nota).first()).toBeVisible();
    await expect(page.locator("#dimensoes h3")).toHaveCount(6);
    await expect(page.locator("[data-nota]")).toHaveText("46");
    await expect(page.getByText(aiScore.exemplo.aviso)).toBeVisible();
  });

  test("visão empresa: fluxo completo até o relatório liberado e impresso em fundo claro", async ({ page }) => {
    const gravados = await interceptarSupabase(page);
    await page.goto("/ai-score/");
    const modo = await page.locator("main").getAttribute("data-ai-score-modo");
    await page.locator("a[data-cta='ai-score-hero']").click();
    await expect(page).toHaveURL(/\/ai-score\/avaliacao\/$/);
    await expect(page.locator("[data-barra-mobile]")).toHaveCount(0);

    // Sem resposta, não avança.
    await continuar(page);
    await expect(page.locator("#erro-etapa")).toHaveText(questionario.erros.segmentacao);
    await semViolacoes(page);

    await segmentar(page, /^Empresa como um todo/);
    await responderCentrais(page);
    await expect(etapa(page)).toHaveText(aprofundar.pergunta);
    await page.getByRole("checkbox", { name: "Vendas" }).check();
    await continuar(page);
    await responderArea(page, "vendas", [4, 3, 2, 3]);
    await fechar(page);

    await expect(page).toHaveURL(/\/ai-score\/resultado\/#v=1&e=empresa&p=ceo&/);
    await expect(page.locator("[data-nota]")).toHaveText("46");
    await expect(page.getByText("Em desenvolvimento", { exact: true })).toBeVisible();
    await expect(page.getByText(resultadoTextos.nivelDe(3))).toBeVisible();
    await expect(page.getByText("75", { exact: true }).first()).toBeVisible();

    const conversa = page.locator("a[data-cta='diagnostico-resultado']");
    const texto = new URL((await conversa.getAttribute("href"))!).searchParams.get("text")!;
    expect(texto).toContain("46/100, nível Em desenvolvimento");
    expect(texto).toContain("Governança e Segurança e Processos e Aplicações");
    expect(await conversa.getAttribute("href")).toBe(waUrl(texto));
    await semViolacoes(page);

    // Formulário: obrigatórios e e-mail válido antes de liberar.
    await page.getByRole("button", { name: formulario.enviar }).click();
    await expect(page.getByLabel(formulario.campos.nome, { exact: true })).toBeFocused();
    await expect(page.getByText(formulario.erros.obrigatorio).first()).toBeVisible();
    await page.getByLabel(formulario.campos.nome, { exact: true }).fill("Maria Teste");
    await page.getByLabel(formulario.campos.empresa, { exact: true }).fill("Empresa Teste");
    await page.getByLabel(formulario.campos.email, { exact: true }).fill("maria@empresa");
    await page.getByLabel(formulario.campos.whatsapp, { exact: true }).fill("(85) 99999-0000");
    await page.getByLabel(formulario.campos.contato).check();
    await page.getByRole("button", { name: formulario.enviar }).click();
    await expect(page.getByText(formulario.erros.email)).toBeVisible();
    await page.getByLabel(formulario.campos.email, { exact: true }).fill("maria@empresa.com.br");
    await page.getByRole("button", { name: formulario.enviar }).click();

    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeFocused();
    const rel = page.locator("#relatorio");
    await expect(rel.locator("a[href='/solucoes/governance/']")).toBeVisible();
    // Governança é a menor dimensão; o desafio "por onde começar" empata AI Champions com Processos com IA,
    // e o desempate segue a ordem do portfólio.
    await expect(rel.locator("a[href='/solucoes/ai-champions/']")).toBeVisible();
    await expect(rel.locator("a[href^='/solucoes/']")).toHaveCount(2);
    await expect(rel.getByText(modulosArea[1].perguntas[0].texto)).toBeVisible();

    if (modo === "producao") {
      // Avaliação ao concluir, de novo (idempotente) com o lead, e o lead ligado a ela.
      expect(gravados.map((g) => g.tabela)).toEqual(["avaliacoes", "avaliacoes", "leads"]);
      const [avaliacao, , lead] = gravados.map((g) => g.corpo);
      expect(avaliacao).toMatchObject({
        escopo: "empresa",
        papel: "ceo",
        indice: 46,
        nivel: "desenvolvimento",
        parcial: false,
      });
      expect(JSON.stringify(avaliacao)).not.toContain("maria");
      expect(lead).toMatchObject({
        avaliacao_id: avaliacao.id,
        nome: "Maria Teste",
        email: "maria@empresa.com.br",
        empresa: "Empresa Teste",
        whatsapp: "5585999990000",
        email_pessoal: false,
        pediu_contato: true,
        consentimento_marketing: false,
      });
    } else {
      expect(gravados).toEqual([]);
      await expect(page.getByText(formulario.demo)).toBeVisible();
    }

    // Relatório continua liberado depois de recarregar.
    await page.reload();
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator("body > header")).toBeHidden();
    await expect(page.getByText(/Preparado para Maria Teste, Empresa Teste, em /)).toBeVisible();
    await expect(page.getByRole("button", { name: relatorio.baixar })).toBeHidden();
  });

  test("visão por área: perguntas sobre a área, módulo da própria área e índice separado", async ({ page }) => {
    await interceptarSupabase(page);
    await page.goto("/ai-score/avaliacao/");
    await segmentar(page, /^Vendas/);
    await responderCentrais(page, true);
    await responderArea(page, "vendas", [1, 1, 1, 1]);
    await fechar(page);
    await expect(page.getByText(resultadoTextos.escopo("vendas"))).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveText("46");
    await expect(page.getByRole("heading", { name: resultadoTextos.areas.titulo })).toBeVisible();
  });

  test("retoma o questionário de onde parou", async ({ page }) => {
    await page.goto("/ai-score/avaliacao/");
    await segmentar(page, /^Empresa como um todo/);
    await page.getByRole("radio", { name: perguntasCentrais[0].alternativas[2], exact: true }).check();
    await continuar(page);
    await page.reload();
    await expect(page.getByText(questionario.retomar.titulo)).toBeVisible();
    await page.getByRole("button", { name: questionario.retomar.continuar }).click();
    await expect(etapa(page)).toHaveText(perguntasCentrais[1].texto.empresa);
    await page.getByRole("button", { name: questionario.voltar }).click();
    await expect(page.getByRole("radio", { name: perguntasCentrais[0].alternativas[2], exact: true })).toBeChecked();
  });

  test('"Não sei responder" em excesso dá resultado parcial, sem nota', async ({ page }) => {
    await page.goto("/ai-score/avaliacao/");
    await segmentar(page, /^Empresa como um todo/);
    for (const [i, p] of perguntasCentrais.entries()) {
      const nome = i < 3 ? new RegExp(`^${questionario.naoSei}`) : p.alternativas[2];
      await page.getByRole("radio", { name: nome, exact: true }).check();
      await continuar(page);
    }
    await continuar(page);
    await fechar(page);
    await expect(page.getByText(resultadoTextos.parcial.nome, { exact: true })).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveCount(0);
  });

  test("link vazio ou adulterado mostra o convite para começar", async ({ page }) => {
    for (const hash of ["", "#v=1&e=governo"]) {
      await page.goto(`/ai-score/resultado/${hash}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(resultadoTextos.titulo);
      await expect(page.getByText(resultadoTextos.vazio.titulo)).toBeVisible();
      await expect(page.locator("a[data-cta='ai-score-resultado-vazio']")).toHaveAttribute(
        "href",
        "/ai-score/avaliacao/",
      );
    }
  });

  test("questionário e resultado ficam fora do índice", async ({ page }) => {
    for (const caminho of ["/ai-score/avaliacao/", "/ai-score/resultado/"]) {
      await page.goto(caminho);
      await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
      await expect(page).toHaveTitle(/Reset IA$/);
    }
    expect(site.ctaAiScore).toBe("Descobrir meu AI Score");
  });
});
