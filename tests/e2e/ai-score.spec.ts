import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { aiScore } from "@/content/ai-score";
import {
  alertas,
  aprofundar,
  contato,
  desafios,
  exemplo,
  formulario,
  horizontes,
  modulosArea,
  perguntasCentrais,
  questionario,
  regua,
  relatorio,
  resultadoTextos,
} from "@/content/ai-score-questionario";
import { site } from "@/content/site";
import { waUrl } from "@/lib/whatsapp";

/** Respostas do exemplo do documento. Na escala progressiva: 34, Explorando (dimensões 70, 40, 27,5, 40, 15, 27,5). */
const EXEMPLO = [3, 3, 2, 2, 2, 1, 2, 2, 1, 1, 2, 1];
const graves = new Set(["serious", "critical"]);

/** Resposta da REST simulada: funções devolvem true; inserções, 201. */
const responder = (rota: import("@playwright/test").Route) =>
  rota.request().url().includes("/rpc/") ? rota.fulfill({ json: true }) : rota.fulfill({ status: 201, body: "" });

async function semViolacoes(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(
    r.violations
      .filter((v) => graves.has(v.impact ?? ""))
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

/** Dicas "da IA" simuladas para o exemplo (governança e processos são dimensões de nota baixa). */
const DICAS_IA = {
  fonte: "ia",
  modelo: "claude-opus-5-5",
  dimensoes: [
    {
      id: "governanca",
      fonte: "ia",
      dicas: ["Defina quem aprova novos usos de IA e registre as decisões num documento simples e acessível."],
    },
    {
      id: "processos",
      fonte: "ia",
      dicas: ["Escolha um processo repetitivo da equipe e descreva as etapas antes de testar a IA nele."],
    },
  ],
};

/** Intercepta a função ai-score (dicas e e-mail do relatório) e guarda os pedidos. Nunca chega à função real. */
async function interceptarFuncao(page: Page) {
  const pedidos: Array<Record<string, unknown>> = [];
  await page.route("**/functions/v1/**", async (rota) => {
    const corpo = (rota.request().postDataJSON() ?? {}) as Record<string, unknown>;
    pedidos.push(corpo);
    await rota.fulfill({ json: corpo.acao === "dicas" ? DICAS_IA : { status: "enviado" } });
  });
  return pedidos;
}

/** Intercepta a REST do Supabase (o CI builda com uma URL fictícia) e guarda o que o site gravou. */
async function interceptarSupabase(page: Page) {
  const gravados: Array<{ tabela: string; corpo: Record<string, unknown> }> = [];
  await page.route("**/rest/v1/**", async (rota) => {
    const tabela = new URL(rota.request().url()).pathname.split("/").pop()!;
    gravados.push({ tabela, corpo: rota.request().postDataJSON() });
    await responder(rota);
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

/** Etapa 1 da captura: nome e e-mail abrem o resultado. */
async function abrirResultado(page: Page, nome = "Maria Teste", email = "maria@empresa.com.br") {
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(contato.titulo.map(semMarcas).join(" "));
  await page.getByLabel(contato.campos.nome, { exact: true }).fill(nome);
  await page.getByLabel(contato.campos.email, { exact: true }).fill(email);
  await page.getByRole("button", { name: contato.enviar }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(resultadoTextos.titulo);
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
    await page.route("**/rest/v1/**", responder);
    await page.route("**/functions/v1/**", (rota) => rota.fulfill({ status: 503, json: {} }));
  });

  test("landing page: hero, seis dimensões, exemplo ilustrativo (28) e CTAs", async ({ page }) => {
    await page.goto("/ai-score/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      aiScore.hero.titulo.map(semMarcas).join(" "),
    );
    await expect(page.locator("a[data-cta='ai-score-hero']")).toHaveAttribute("href", "/ai-score/avaliacao/");
    await expect(page.getByText(aiScore.hero.nota).first()).toBeVisible();
    await expect(page.locator("#dimensoes h3")).toHaveCount(6);
    await expect(page.locator("[data-nota]")).toHaveText("28");
    await expect(page.getByText(aiScore.exemplo.aviso)).toBeVisible();
    await expect(page.getByRole("link", { name: aiScore.exemplo.link.label })).toHaveAttribute(
      "href",
      "/ai-score/exemplo/",
    );
  });

  test("visão empresa: fluxo completo até o relatório liberado e impresso em fundo claro", async ({ page }) => {
    const gravados = await interceptarSupabase(page);
    const funcao = await interceptarFuncao(page);
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

    // Etapa 1: nome e e-mail abrem o resultado; obrigatórios e e-mail válido.
    await page.getByRole("button", { name: contato.enviar }).click();
    await expect(page.getByLabel(contato.campos.nome, { exact: true })).toBeFocused();
    await page.getByLabel(contato.campos.nome, { exact: true }).fill("Maria Teste");
    await page.getByLabel(contato.campos.email, { exact: true }).fill("maria@empresa");
    await page.getByRole("button", { name: contato.enviar }).click();
    await expect(page.getByText(formulario.erros.email)).toBeVisible();
    await semViolacoes(page);
    await abrirResultado(page);

    await expect(page.getByText(resultadoTextos.ola("Maria Teste"))).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveText("34");
    await expect(page.getByText(resultadoTextos.nivelDe(2))).toBeVisible();
    await expect(page.getByText(regua.faltam(6, "Em desenvolvimento"))).toBeVisible();
    for (const id of ["adocao-sem-governanca", "estrategia-sem-execucao", "ferramentas-sem-resultado"] as const)
      await expect(page.getByText(alertas.itens[id].titulo, { exact: true })).toBeVisible();

    const conversa = page.locator("a[data-cta='diagnostico-resultado']");
    const texto = new URL((await conversa.getAttribute("href"))!).searchParams.get("text")!;
    expect(texto).toContain("34/100, nível Explorando");
    expect(texto).toContain("Governança e Segurança e Processos e Aplicações");
    expect(await conversa.getAttribute("href")).toBe(waUrl(texto));
    await semViolacoes(page);

    // Etapa 2: a empresa libera o relatório completo.
    await page.getByRole("button", { name: formulario.enviar }).click();
    await expect(page.getByLabel(formulario.campos.empresa, { exact: true })).toBeFocused();
    await page.getByLabel(formulario.campos.empresa, { exact: true }).fill("Empresa Teste");
    await page.getByLabel(formulario.campos.whatsapp, { exact: true }).fill("(85) 99999-0000");
    await page.getByLabel(formulario.campos.contato).check();
    await page.getByRole("button", { name: formulario.enviar }).click();

    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeFocused();
    const rel = page.locator("#relatorio");
    await expect(
      rel.getByText("Empresa Teste está no nível Explorando, com AI Score 34 de 100.", { exact: false }),
    ).toBeVisible();
    await expect(rel.getByText(relatorio.simulacao.texto(40, 34, 44, "Em desenvolvimento"))).toBeVisible();
    for (const titulo of [
      relatorio.prioridades.titulo,
      relatorio.leitura,
      relatorio.pontosCegos.titulo,
      relatorio.plano.titulo,
    ])
      await expect(rel.getByRole("heading", { name: titulo })).toBeVisible();
    await expect(rel.getByText(relatorio.pontosCegos.nenhum)).toBeVisible();
    await expect(rel.getByText(perguntasCentrais[0].alternativas[4]).first()).toBeVisible();
    await expect(rel.locator("a[href='/solucoes/governance/']")).toBeVisible();
    // Governança é a menor dimensão; o desafio "por onde começar" empata AI Champions com Processos com IA,
    // e o desempate segue a ordem do portfólio.
    await expect(rel.locator("a[href='/solucoes/ai-champions/']")).toBeVisible();
    await expect(rel.locator("a[href^='/solucoes/']")).toHaveCount(2);
    await expect(rel.getByText(modulosArea[1].perguntas[0].texto)).toBeVisible();

    // Dicas para evoluir nas dimensões de nota baixa e a assinatura do squad multiagente no fim.
    await expect(rel.getByRole("heading", { name: relatorio.dicas.titulo })).toBeVisible();
    const assinatura = rel.locator("[data-assinatura]");
    await expect(assinatura).toContainText(relatorio.assinatura.titulo);
    for (const paragrafo of relatorio.assinatura.paragrafos) await expect(assinatura).toContainText(paragrafo);
    if (modo === "producao") {
      await expect(rel.locator("[data-fonte-dicas='ia']")).toHaveText(relatorio.dicas.fonte.ia);
      await expect(rel.getByText(DICAS_IA.dimensoes[0].dicas[0])).toBeVisible();
      await expect(page.getByText(relatorio.enviado("maria@empresa.com.br"))).toBeVisible();
    } else {
      await expect(rel.locator("[data-fonte-dicas='biblioteca']")).toHaveText(relatorio.dicas.fonte.biblioteca);
      expect(funcao).toEqual([]);
    }
    await semViolacoes(page);

    if (modo === "producao") {
      // Avaliação ao concluir, de novo (idempotente) na etapa 1 com o lead sem empresa, e a etapa 2 completando o lead.
      expect(gravados.map((g) => g.tabela)).toEqual(["avaliacoes", "avaliacoes", "leads", "completar_lead"]);
      const [avaliacao, , lead, completar] = gravados.map((g) => g.corpo);
      expect(avaliacao).toMatchObject({
        escopo: "empresa",
        papel: "ceo",
        indice: 34,
        nivel: "explorando",
        parcial: false,
      });
      expect(JSON.stringify(avaliacao)).not.toContain("maria");
      expect(lead).toMatchObject({
        avaliacao_id: avaliacao.id,
        nome: "Maria Teste",
        email: "maria@empresa.com.br",
        empresa: null,
        whatsapp: null,
        email_pessoal: false,
        pediu_contato: false,
      });
      expect(completar).toEqual({
        p_id: lead.id,
        p_empresa: "Empresa Teste",
        p_whatsapp: "5585999990000",
        p_pediu_contato: true,
        p_marketing: false,
      });
      // Depois da etapa 2: o relatório vai por e-mail e as dicas são pedidas à função, sempre com o par certo.
      const par = { avaliacao_id: avaliacao.id, lead_id: lead.id };
      expect(funcao).toContainEqual({ acao: "enviar-relatorio", ...par });
      expect(funcao).toContainEqual({ acao: "dicas", ...par });
      for (const pedido of funcao) expect(JSON.stringify(pedido)).not.toMatch(/maria|Empresa Teste/i);
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
    await abrirResultado(page);
    await expect(page.getByText(resultadoTextos.escopo("vendas"))).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveText("34");
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
    await abrirResultado(page);
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

  test("relatório de exemplo: tudo aberto, já no HTML do servidor, sem formulários", async ({ page, request }) => {
    const html = await (await request.get("/ai-score/exemplo/")).text();
    expect(html).toContain(relatorio.plano.titulo);
    await page.goto("/ai-score/exemplo/");
    await expect(page.getByText(exemplo.aviso)).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveText("28");
    const rel = page.locator("#relatorio");
    await expect(
      rel.getByText("Empresa Exemplo está no nível Explorando, com AI Score 28 de 100.", { exact: false }),
    ).toBeVisible();
    await expect(rel.getByText(relatorio.simulacao.texto(40, 28, 42, "Em desenvolvimento"))).toBeVisible();
    for (const id of ["adocao-sem-governanca", "estrategia-sem-execucao", "pontos-cegos"] as const)
      await expect(page.getByText(alertas.itens[id].titulo, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
    await expect(page.getByRole("button", { name: formulario.enviar })).toHaveCount(0);
    await expect(page.locator("a[data-cta='ai-score-exemplo-topo']")).toHaveAttribute("href", "/ai-score/avaliacao/");
    await semViolacoes(page);
  });

  test("link do e-mail libera o relatório completo em outro aparelho, só com o par certo", async ({ page }) => {
    await page.goto("/ai-score/");
    test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
    const lead = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
    const consultas: unknown[] = [];
    await page.route("**/rest/v1/rpc/lead_liberado", async (rota) => {
      const corpo = rota.request().postDataJSON() as { p_lead: string };
      consultas.push(corpo);
      await rota.fulfill({ json: corpo.p_lead === lead ? { nome: "Maria Teste", empresa: "Empresa Teste" } : null });
    });
    await interceptarFuncao(page);
    // Área de transferência simulada (o WebKit do Playwright não concede essa permissão).
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (texto: string) => {
            (window as unknown as { copiado?: string }).copiado = texto;
          },
        },
      }),
    );

    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}&lead=${lead}`);
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
    await expect(page.getByRole("button", { name: formulario.enviar })).toHaveCount(0);
    await expect(page.getByText(resultadoTextos.ola("Maria Teste"))).toBeVisible();
    expect(consultas).toHaveLength(1);
    // Compartilhar não leva o lead junto.
    await page.getByRole("button", { name: resultadoTextos.compartilhar }).click();
    await expect(page.getByText(resultadoTextos.copiado)).toBeVisible();
    const copiado = await page.evaluate(() => (window as unknown as { copiado?: string }).copiado);
    expect(copiado).toContain("/ai-score/resultado/#v=1");
    expect(copiado).not.toContain("lead=");

    // Outro lead no link (ou link adulterado): volta para a etapa 1.
    await page.evaluate(() => localStorage.clear());
    await page.goto("/ai-score/");
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}&lead=00000000-0000-4000-8000-000000000000`);
    await expect(page.getByRole("button", { name: contato.enviar })).toBeVisible();
  });

  test("admin abre o resultado de um lead sem passar pelas etapas", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("resetia.ai-score.ver-como-admin", String(Date.now())));
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}`);
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
  });

  test("questionário, resultado e exemplo ficam fora do índice", async ({ page }) => {
    for (const caminho of ["/ai-score/avaliacao/", "/ai-score/resultado/", "/ai-score/exemplo/"]) {
      await page.goto(caminho);
      await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
      await expect(page).toHaveTitle(/Reset IA$/);
    }
    expect(site.ctaAiScore).toBe("Descobrir meu AI Score");
  });
});
