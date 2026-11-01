import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { semMarcas } from "@/components/ui/linhas";
import { aiScore } from "@/content/ai-score";
import { alertas } from "@/content/ai-score-analise";
import { aprofundar as aprof } from "@/content/ai-score-aprofundamento";
import { assinatura as assinaturaTextos, dicas as dicasTextos, plano as planoTextos } from "@/content/ai-score-sintese";
import {
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

type Resposta = { status?: number; json?: unknown } | "abortar";
type Comportamentos = Record<string, (n: number, corpo: Record<string, unknown>) => Resposta>;
const PADRAO: Comportamentos = {
  concluir: () => ({ json: { status: "registrado" } }),
  registrar: () => ({ json: { status: "registrado" } }),
  completar: () => ({ json: { status: "completado" } }),
  aprofundar: () => ({ json: { status: "gravado" } }),
  status: () => ({ json: { relatorio_email: { estado: "aceito" } } }),
  dicas: () => ({ json: DICAS_IA }),
  "enviar-relatorio": () => ({ json: { status: "enviado" } }),
};

/**
 * Intercepta a função ai-score, responde por ação (o teste troca o que quiser, inclusive derrubar a rede) e guarda os
 * pedidos. Nunca chega à função real. Sem comportamento próprio, a ação responde como o servidor responderia com sucesso.
 */
async function interceptarFuncao(page: Page, personalizados: Comportamentos = {}) {
  const pedidos: Array<Record<string, unknown>> = [];
  const contagem = new Map<string, number>();
  await page.route("**/functions/v1/**", async (rota) => {
    const corpo = (rota.request().postDataJSON() ?? {}) as Record<string, unknown>;
    pedidos.push(corpo);
    const acao = String(corpo.acao);
    const n = (contagem.get(acao) ?? 0) + 1;
    contagem.set(acao, n);
    const r = (personalizados[acao] ?? PADRAO[acao] ?? (() => ({ status: 400, json: { erro: "acao" } })))(n, corpo);
    if (r === "abortar") return rota.abort("failed");
    await rota.fulfill({ status: r.status ?? 200, json: r.json ?? {} });
  });
  return pedidos;
}

/** Espera o React assumir a página: o sinal de hidratação, em vez de uma espera fixa. */
const aguardarPronto = (page: Page) => expect(page.locator("[data-pronto='sim']").first()).toBeAttached();

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

    await expect(page).toHaveURL(/\/ai-score\/resultado\/#v=2&m=1&n=2&e=empresa&p=ceo&/);

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
    for (const id of ["adocao-sem-governanca", "estrategia-sem-execucao", "desequilibrio"] as const)
      await expect(page.getByText(alertas.itens[id].titulo, { exact: true })).toBeVisible();

    const conversa = page.locator("a[data-cta='diagnostico-resultado']");
    const texto = new URL((await conversa.getAttribute("href"))!).searchParams.get("text")!;
    expect(texto).toContain("34/100, nível Explorando");
    expect(texto).toContain("Principais lacunas: Governança e Segurança, Processos e Aplicações.");
    expect(await conversa.getAttribute("href")).toBe(waUrl(texto));
    // O convite do resumo reconhece o resultado e mostra, antes do clique, o que a mensagem leva (sem dado pessoal nem link).
    const convite = page.locator("[data-convite='resumo']");
    await expect(convite).toContainText("Seu resultado aponta Governança e Segurança como a dimensão mais frágil.");
    await convite.getByText("O que a mensagem leva").click();
    await expect(convite.locator("[data-previa-whatsapp]")).toHaveText(texto);
    expect(texto).not.toMatch(/maria|Empresa Teste|@|https?:/i);
    await expect(convite.locator("a[data-cta='diagnostico-resultado-resumo']")).toHaveAttribute("href", waUrl(texto));
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
    // O resumo executivo (primeira parte do resultado) passa a nomear a empresa e responde às seis perguntas.
    const resumo = page.locator("[data-resumo-executivo]");
    await expect(resumo.locator("[data-item='cenario']")).toContainText(
      "Empresa Teste está no nível Explorando, com AI Score 34 de 100.",
    );
    await expect(resumo.locator("[data-item]")).toHaveCount(6);
    await expect(resumo.locator("[data-item='atencao']")).toContainText(
      "Governança e Segurança é a dimensão mais frágil",
    );
    await expect(rel.getByText(relatorio.simulacao.texto(40, 34, 44, "Em desenvolvimento"))).toBeVisible();
    for (const titulo of [
      relatorio.prioridades.titulo,
      relatorio.leitura,
      relatorio.pontosCegos.titulo,
      planoTextos.titulo,
    ])
      await expect(rel.getByRole("heading", { name: titulo })).toBeVisible();
    await expect(rel.getByText(relatorio.pontosCegos.nenhum)).toBeVisible();
    await expect(rel.getByText(perguntasCentrais[0].alternativas[4]).first()).toBeVisible();
    await expect(rel.locator("a[href='/solucoes/governance/']")).toBeVisible();
    // Governança é a menor dimensão. "Não sabemos por onde começar" não soma pontos, porque Estratégia está em 70:
    // o desafio fica como oportunidade a validar, e AI Champions não é indicada só por ele.
    await expect(rel.locator("a[href='/solucoes/processos-com-ia/']")).toBeVisible();
    await expect(rel.locator("a[href='/solucoes/ai-champions/']")).toHaveCount(0);
    await expect(rel.locator("a[href^='/solucoes/']")).toHaveCount(2);
    await expect(rel.locator("[data-oportunidade='comecar']")).toHaveAttribute("data-situacao", "contradiz");
    await expect(rel.locator("[data-indicacao='governance']")).toHaveAttribute("data-forca", "indicada");
    // O roteiro tem a linha de base antes do piloto e cada etapa diz de que depende.
    const etapas = rel.locator("[data-etapa]");
    const ordem = await etapas.evaluateAll((els) => els.map((e) => e.getAttribute("data-etapa")));
    expect(ordem.indexOf("linha-de-base")).toBeLessThan(ordem.indexOf("piloto"));
    expect(ordem.indexOf("controles")).toBeLessThan(ordem.indexOf("piloto"));
    await expect(rel.locator("[data-etapa='piloto']")).toContainText(planoTextos.rotulos.depende);
    await expect(rel.getByText(modulosArea[1].perguntas[0].texto)).toBeVisible();

    // Dicas para evoluir nas dimensões de nota baixa e a assinatura do squad multiagente no fim.
    await expect(rel.getByRole("heading", { name: dicasTextos.titulo })).toBeVisible();
    const assinatura = rel.locator("[data-assinatura]");
    await expect(assinatura).toContainText(assinaturaTextos.titulo);
    for (const paragrafo of assinaturaTextos.paragrafos) await expect(assinatura).toContainText(paragrafo);
    if (modo === "producao") {
      await expect(rel.locator("[data-fonte-dicas='ia']")).toHaveText(dicasTextos.fonte.ia);
      await expect(rel.getByText(DICAS_IA.dimensoes[0].dicas[0])).toBeVisible();
      // O estado do e-mail é o que o servidor informa: aceito pelo provedor (nunca "entregue" nem "enviado").
      await expect(page.locator("[data-email-estado='aceito']")).toHaveText(
        relatorio.email.aceito("maria@empresa.com.br"),
        {
          timeout: 15_000,
        },
      );
    } else {
      await expect(rel.locator("[data-fonte-dicas='biblioteca']")).toHaveText(dicasTextos.fonte.biblioteca);
      expect(funcao).toEqual([]);
    }
    await semViolacoes(page);

    // O navegador nunca mais grava direto no banco: tudo passa pela função, que recalcula a nota.
    expect(gravados).toEqual([]);
    if (modo === "producao") {
      const por = (acao: string) => funcao.filter((p) => p.acao === acao);
      // Ao concluir o questionário: só a avaliação, sem nota nenhuma vinda do navegador.
      const [concluir] = por("concluir");
      expect(concluir).toMatchObject({ acao: "concluir", ambiente: expect.stringMatching(/^(dev|staging|producao)$/) });
      expect(String(concluir.codigo)).toMatch(/^v=2&m=1&n=2&e=empresa&p=ceo&/);
      // Etapa 1: o contato com a chave que o navegador gerou (43 caracteres), sem nota, nível ou dimensões.
      const [registrar] = por("registrar");
      expect(registrar).toMatchObject({
        acao: "registrar",
        avaliacao_id: concluir.avaliacao_id,
        codigo: concluir.codigo,
        nome: "Maria Teste",
        email: "maria@empresa.com.br",
        marketing: false,
      });
      expect(String(registrar.chave)).toMatch(/^[A-Za-z0-9_-]{43}$/);
      for (const proibida of ["indice", "nivel", "parcial", "dimensoes", "areas", "respostas"])
        expect(Object.keys(registrar)).not.toContain(proibida);
      // Etapa 2: empresa e pedidos, com a mesma chave. O e-mail agora é tarefa do servidor: nenhum pedido de "enviar-relatorio".
      const [completar] = por("completar");
      expect(completar).toEqual({
        acao: "completar",
        avaliacao_id: concluir.avaliacao_id,
        lead_id: registrar.lead_id,
        chave: registrar.chave,
        empresa: "Empresa Teste",
        whatsapp: "5585999990000",
        pediu_contato: true,
        marketing: false,
      });
      expect(por("enviar-relatorio")).toEqual([]);
      // As dicas e o estado do e-mail são pedidos com a chave; nada pessoal vai nas dicas.
      expect(por("dicas")[0]).toEqual({
        acao: "dicas",
        avaliacao_id: concluir.avaliacao_id,
        lead_id: registrar.lead_id,
        chave: registrar.chave,
      });
      expect(por("status")[0]).toEqual({ acao: "status", lead_id: registrar.lead_id, chave: registrar.chave });
      // Contato confirmado pelo servidor: nenhum aviso de "não confirmado".
      await expect(page.locator("[data-contato]")).toHaveCount(0);
      // A chave nunca aparece na página.
      expect(await page.content()).not.toContain(String(registrar.chave));
    } else {
      expect(funcao).toEqual([]);
      await expect(page.getByText(formulario.demo)).toBeVisible();
    }

    // Download direto do PDF, gerado no navegador com os dados deste relatório (a impressão segue como alternativa).
    await expect(rel.getByRole("button", { name: relatorio.imprimir })).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      rel.getByRole("button", { name: relatorio.baixar }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("RESET-AI-Score-Empresa-Teste.pdf");
    const pdf = readFileSync((await download.path())!).toString("latin1");
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    // O texto do PDF é texto (os literais ficam legíveis no arquivo): a nota, a empresa e o roteiro da mesma devolutiva.
    expect(pdf).toContain("Preparado para Maria Teste, Empresa Teste");
    expect(pdf).toContain("Empresa Teste est");
    expect(pdf).toContain("(34)");
    expect(pdf.length).toBeLessThan(200_000);
    await expect(rel.getByRole("button", { name: relatorio.baixar })).toBeEnabled();

    // Relatório continua liberado depois de recarregar.
    await page.reload();
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator("body > header")).toBeHidden();
    await expect(page.getByText(/Preparado para Maria Teste, Empresa Teste, em /)).toBeVisible();
    await expect(page.getByRole("button", { name: relatorio.baixar })).toBeHidden();
  });

  /** Questionário da visão empresa (respostas do exemplo) até a etapa de contato, e só roda com Supabase configurado. */
  async function ateOContato(page: Page) {
    await page.goto("/ai-score/");
    test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
    await page.goto("/ai-score/avaliacao/");
    await aguardarPronto(page);
    await segmentar(page, /^Empresa como um todo/);
    await responderCentrais(page);
    await page.getByRole("checkbox", { name: "Vendas" }).check();
    await continuar(page);
    await responderArea(page, "vendas", [4, 3, 2, 3]);
    await fechar(page);
    await expect(page).toHaveURL(/\/ai-score\/resultado\//);
    await aguardarPronto(page);
  }

  const fila = (page: Page) =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem("resetia.ai-score.fila.v2") ?? "[]") as Array<{ tipo: string }>,
    );

  test("rede cai ao deixar o contato: resultado abre com aviso de pendente, sobrevive ao recarregar e a fila reenvia", async ({
    page,
  }) => {
    const funcao = await interceptarFuncao(page, {
      registrar: (n) => (n === 1 ? "abortar" : { json: { status: "registrado" } }),
    });
    await ateOContato(page);
    await abrirResultado(page);

    // Sem confirmação do servidor, a tela não diz que o contato foi registrado.
    const aviso = page.locator("[data-contato='pendente']");
    await expect(aviso).toContainText(resultadoTextos.contatoAviso.pendente.titulo);
    await expect(page.locator("[data-nota]")).toHaveText("34");
    expect((await fila(page)).map((i) => i.tipo)).toContain("registrar");

    // Recarregar mantém o resultado liberado, o aviso e o item na fila.
    await page.reload();
    await aguardarPronto(page);
    await expect(page.locator("[data-nota]")).toHaveText("34");
    await expect(page.locator("[data-contato='pendente']")).toBeVisible();
    expect((await fila(page)).map((i) => i.tipo)).toContain("registrar");

    // Passada a espera da fila (5 s, com variação), o mesmo pedido é reenviado e o servidor o aceita.
    await expect(page.locator("[data-contato]")).toHaveCount(0, { timeout: 30_000 });
    expect((await fila(page)).map((i) => i.tipo)).not.toContain("registrar");
    const registros = funcao.filter((p) => p.acao === "registrar");
    expect(registros.length).toBeGreaterThanOrEqual(2);
    // Idempotente: toda tentativa leva os mesmos ids e a mesma chave.
    for (const r of registros.slice(1)) {
      expect(r.lead_id).toBe(registros[0].lead_id);
      expect(r.avaliacao_id).toBe(registros[0].avaliacao_id);
      expect(r.chave).toBe(registros[0].chave);
    }
  });

  test("o servidor recusa o contato de vez: aviso de recusado, nada é reenviado e a fila é limpa", async ({ page }) => {
    const funcao = await interceptarFuncao(page, { registrar: () => ({ status: 422, json: { erro: "invalido" } }) });
    await ateOContato(page);
    await abrirResultado(page);
    await expect(page.locator("[data-contato='recusado']")).toContainText(resultadoTextos.contatoAviso.recusado.titulo);
    await expect(page.locator("[data-nota]")).toHaveText("34");
    expect(await fila(page)).toEqual([]);
    expect(funcao.filter((p) => p.acao === "registrar")).toHaveLength(1);
  });

  /** Etapa 2: a empresa libera o relatório completo (e com ele o convite ao aprofundamento). */
  async function liberarRelatorio(page: Page) {
    await page.getByLabel(formulario.campos.empresa, { exact: true }).fill("Empresa Teste");
    await page.getByLabel(formulario.campos.whatsapp, { exact: true }).fill("(85) 99999-0000");
    await page.getByRole("button", { name: formulario.enviar }).click();
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
  }

  /** Chega ao convite do aprofundamento com o contato aceito (visão empresa, só Vendas: a área é conhecida). */
  async function ateOAprofundamento(page: Page, comportamentos: Comportamentos = {}) {
    const funcao = await interceptarFuncao(page, comportamentos);
    await ateOContato(page);
    await abrirResultado(page);
    await liberarRelatorio(page);
    const caixa = page.locator("[data-aprofundamento]");
    await expect(caixa).toHaveAttribute("data-aprofundamento", "convite");
    return { funcao, caixa, aprofundamentos: () => funcao.filter((p) => p.acao === "aprofundar") };
  }

  const opcao = (caixa: ReturnType<Page["locator"]>, nome: string | RegExp) =>
    caixa.getByRole("radio", { name: nome, exact: typeof nome === "string" });
  const seguinte = (caixa: ReturnType<Page["locator"]>) => caixa.getByRole("button", { name: aprof.proxima });
  const salvar = (caixa: ReturnType<Page["locator"]>) => caixa.getByRole("button", { name: aprof.salvar });

  /** Camada 1 inteira: propostas, 200 por mês, retrabalho. Termina no resumo do que foi salvo. */
  async function responderCamada1(caixa: ReturnType<Page["locator"]>) {
    await caixa.getByRole("button", { name: aprof.comecar }).click();
    await opcao(caixa, "Elaboração de propostas").check();
    await seguinte(caixa).click();
    // A unidade da rotina escolhida já vem sugerida, e a pessoa pode trocá-la.
    await expect(caixa.getByLabel(aprof.volume.unidade)).toHaveValue("propostas");
    await caixa.getByLabel(aprof.volume.quantidade).fill("200");
    await opcao(caixa, "por mês").check();
    await seguinte(caixa).click();
    await opcao(caixa, "Retrabalho").check();
    await salvar(caixa).click();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "salvo");
  }

  test("aprofundamento: perguntas curtas, voltar, recarregar, salvar e corrigir; só o necessário vai à função", async ({
    page,
  }) => {
    const { caixa, aprofundamentos } = await ateOAprofundamento(page);
    const lead = (await page.evaluate(() => localStorage.getItem("resetia.ai-score.fila.v2"))) ?? "[]";
    expect(JSON.parse(lead)).toEqual([]);

    await caixa.getByRole("button", { name: aprof.comecar }).click();
    await expect(caixa.getByText(aprof.passo(1, 3))).toBeVisible();
    await expect(caixa.getByRole("heading", { name: aprof.rotina.pergunta })).toBeFocused();
    await opcao(caixa, "Elaboração de propostas").check();
    await seguinte(caixa).click();
    await caixa.getByLabel(aprof.volume.quantidade).fill("200");
    await opcao(caixa, "por mês").check();

    // Recarregar mantém o relatório liberado e o rascunho, na mesma pergunta.
    await page.reload();
    await aguardarPronto(page);
    await expect(caixa).toHaveAttribute("data-aprofundamento", "perguntas");
    await expect(caixa.getByLabel(aprof.volume.quantidade)).toHaveValue("200");
    await expect(opcao(caixa, "por mês")).toBeChecked();

    // Voltar mantém o que foi respondido.
    await caixa.getByRole("button", { name: aprof.voltar }).click();
    await expect(opcao(caixa, "Elaboração de propostas")).toBeChecked();
    await seguinte(caixa).click();
    await seguinte(caixa).click();
    await opcao(caixa, "Retrabalho").check();
    expect(aprofundamentos()).toHaveLength(0);
    await salvar(caixa).click();

    await expect(caixa).toHaveAttribute("data-aprofundamento", "salvo");
    await expect(caixa.locator("[data-salvo-estado='aceito']")).toHaveText(aprof.salvo.titulo);
    await expect(caixa).toContainText(aprof.volume.resumo("200", "propostas", "mês"));
    await expect(caixa).toContainText("Retrabalho");
    await expect(caixa.locator("[data-esforco]")).toHaveCount(0);
    expect(aprofundamentos()).toHaveLength(1);
    const [enviado] = aprofundamentos();
    // Só o aprofundamento, o lead e a chave: nada de nome, e-mail, empresa ou nota.
    expect(Object.keys(enviado).sort()).toEqual(["acao", "aprofundamento", "chave", "lead_id"]);
    expect(enviado.aprofundamento).toEqual({
      area: "vendas",
      camada: 1,
      revisao: 1,
      rotina: "propostas",
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
      consequencia: "retrabalho",
      ferramentas: [],
      naoSei: [],
    });
    expect(JSON.stringify(enviado)).not.toMatch(/maria|Empresa Teste/i);

    // Corrigir: a consequência vira "Não sei" e a revisão sobe (uma gravação atrasada nunca vence a nova).
    await caixa.getByRole("button", { name: aprof.editar }).click();
    await expect(opcao(caixa, "Elaboração de propostas")).toBeChecked();
    await seguinte(caixa).click();
    await seguinte(caixa).click();
    await opcao(caixa, aprof.naoSei).check();
    await salvar(caixa).click();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "salvo");
    await expect(caixa.getByText(aprof.resumo.naoSei, { exact: true })).toBeVisible();
    expect(aprofundamentos()).toHaveLength(2);
    expect(aprofundamentos()[1].aprofundamento).toMatchObject({ revisao: 2, naoSei: ["consequencia"] });
    expect(aprofundamentos()[1].aprofundamento).not.toHaveProperty("consequencia");

    // O resumo continua depois de recarregar.
    await page.reload();
    await aguardarPronto(page);
    await expect(caixa).toHaveAttribute("data-aprofundamento", "salvo");
    await semViolacoes(page);
  });

  test("aprofundamento camada 2: 200 por mês × 15 min ÷ 60 = 50 h; sem o tempo, diz o que falta", async ({ page }) => {
    const { caixa, aprofundamentos } = await ateOAprofundamento(page);
    await responderCamada1(caixa);
    await caixa.getByRole("button", { name: aprof.aprofundarMais }).click();
    await expect(caixa.getByRole("heading", { name: aprof.camada2.minutos.pergunta })).toBeFocused();

    await caixa.getByLabel(aprof.camada2.minutos.rotulo).fill("15");
    const previa = caixa.locator("[data-esforco-conta]");
    await expect(previa).toHaveText(aprof.esforco.formula("200", "propostas", "mês", "15", "50"));
    await seguinte(caixa).click();
    await caixa.getByLabel(aprof.camada2.ferramentas.rotulo).fill("CRM, planilha; crm");
    await seguinte(caixa).click();
    await opcao(caixa, "Temos parte, em lugares diferentes").check();
    await seguinte(caixa).click();
    await caixa.getByLabel(aprof.camada2.indicador.rotulo).fill("tempo de resposta");
    await seguinte(caixa).click();
    await opcao(caixa, "Eu decido").check();
    await salvar(caixa).click();

    await expect(caixa).toHaveAttribute("data-aprofundamento", "salvo");
    const calculado = caixa.locator("[data-esforco='calculado']");
    await expect(calculado.locator("[data-esforco-conta]")).toHaveText(
      aprof.esforco.formula("200", "propostas", "mês", "15", "50"),
    );
    // Premissas visíveis e nenhuma conversão em dinheiro.
    for (const premissa of aprof.esforco.premissas) await expect(calculado).toContainText(premissa);
    await expect(caixa).not.toContainText(/R\$|economia de|reais/i);
    expect(aprofundamentos().at(-1)?.aprofundamento).toMatchObject({
      camada: 2,
      minutos: 15,
      ferramentas: ["CRM", "planilha"],
      dados: "parcial",
      indicador: "tempo de resposta",
      papelDecisor: "decido",
    });

    // Corrigir e marcar "Não sei" no tempo: o esforço deixa de ser calculado e a tela diz o que falta.
    await caixa.getByRole("button", { name: aprof.editar }).click();
    for (let i = 0; i < 3; i++) await seguinte(caixa).click();
    await caixa.getByRole("checkbox", { name: aprof.naoSei }).check();
    for (let i = 0; i < 4; i++) await seguinte(caixa).click();
    await salvar(caixa).click();
    const incompleto = caixa.locator("[data-esforco='incompleto']");
    await expect(incompleto).toContainText(aprof.esforco.falta.titulo);
    await expect(incompleto).toContainText(aprof.esforco.falta.minutos);
    await expect(incompleto).not.toContainText(aprof.esforco.falta.volume);
    expect(aprofundamentos().at(-1)?.aprofundamento).toMatchObject({ revisao: 3, naoSei: ["minutos"] });
  });

  test("aprofundamento: números e textos inválidos param na pergunta, com a mensagem, e nada é enviado", async ({
    page,
  }) => {
    const { caixa, aprofundamentos } = await ateOAprofundamento(page);
    await caixa.getByRole("button", { name: aprof.comecar }).click();
    await opcao(caixa, aprof.rotina.outra).check();
    await caixa.getByLabel(aprof.rotina.outraRotulo).fill("ligar para ana@empresa.com");
    await seguinte(caixa).click();
    await expect(caixa.getByText("Não coloque e-mail nem telefone aqui.")).toBeVisible();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "perguntas");
    await caixa.getByLabel(aprof.rotina.outraRotulo).fill("Triagem de pedidos");
    await seguinte(caixa).click();

    const volume = caixa.getByLabel(aprof.volume.quantidade);
    for (const [valor, mensagem] of [
      ["abc", "Informe um número maior que zero."],
      ["0", "Informe um número maior que zero."],
      ["100001", `Use um número de até ${(100_000).toLocaleString("pt-BR")}.`],
      ["1,234", "Use no máximo duas casas decimais."],
    ] as const) {
      await volume.fill(valor);
      await opcao(caixa, "por mês").check();
      await seguinte(caixa).click();
      await expect(caixa.getByText(mensagem), valor).toBeVisible();
    }
    // O volume pede unidade e período: sem eles, a pergunta não avança.
    await volume.fill("1.500");
    await caixa.getByLabel(aprof.volume.unidade).fill("pedidos");
    await page
      .locator("input[name='aprofundamento-periodo']")
      .first()
      .evaluate((el: HTMLInputElement) => (el.checked = false));
    await seguinte(caixa).click();
    expect(aprofundamentos()).toHaveLength(0);
  });

  test("aprofundamento: agora não, retomar, e em branco não grava", async ({ page }) => {
    const { caixa, aprofundamentos } = await ateOAprofundamento(page);
    await caixa.getByRole("button", { name: aprof.pular }).click();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "adiado");
    await expect(caixa.getByText(aprof.adiado)).toBeVisible();
    await caixa.getByRole("button", { name: aprof.retomar }).click();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "perguntas");
    // Pular as três perguntas (deixar em branco) e tentar salvar: pede ao menos uma resposta.
    await seguinte(caixa).click();
    await seguinte(caixa).click();
    await salvar(caixa).click();
    await expect(caixa.getByRole("alert")).toBeVisible();
    expect(aprofundamentos()).toHaveLength(0);
  });

  test("aprofundamento: função fora do ar ao salvar vira pendente e a fila reenvia com a mesma revisão", async ({
    page,
  }) => {
    const { caixa, aprofundamentos } = await ateOAprofundamento(page, {
      aprofundar: (n) => (n === 1 ? { status: 503, json: {} } : { json: { status: "gravado" } }),
    });
    await responderCamada1(caixa);
    await expect(caixa.locator("[data-salvo-estado='pendente']")).toBeVisible();
    await expect(caixa).toContainText(aprof.salvo.pendente);
    await expect(caixa.locator("[data-salvo-estado='aceito']")).toBeVisible({ timeout: 30_000 });
    expect(aprofundamentos().length).toBeGreaterThanOrEqual(2);
    for (const p of aprofundamentos()) expect(p.aprofundamento).toMatchObject({ revisao: 1, volume: 200 });
  });

  test("aprofundamento: recusa do servidor mostra a mensagem e deixa corrigir", async ({ page }) => {
    const { caixa } = await ateOAprofundamento(page, { aprofundar: () => ({ status: 422, json: { erro: "campos" } }) });
    await responderCamada1(caixa);
    await expect(caixa.locator("[data-salvo-estado='recusado']")).toBeVisible();
    await expect(caixa).toContainText(aprof.salvo.recusado);
    await caixa.getByRole("button", { name: aprof.editar }).click();
    await expect(caixa).toHaveAttribute("data-aprofundamento", "perguntas");
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

  test("link vazio, adulterado ou de uma versão desconhecida mostra o convite para começar, com a mensagem certa", async ({
    page,
  }) => {
    const casos: Array<[string, { titulo: string }]> = [
      ["", resultadoTextos.vazio],
      ["#v=1&e=governo", resultadoTextos.invalido],
      ["#v=2&m=1&n=2&e=governo", resultadoTextos.invalido],
      ["#v=3&e=empresa", resultadoTextos.versaoDesconhecida],
      ["#v=2&m=9&n=2&e=empresa&r=332221221121", resultadoTextos.versaoDesconhecida],
    ];
    for (const [hash, esperado] of casos) {
      await page.goto(`/ai-score/resultado/${hash}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(resultadoTextos.titulo);
      await expect(page.getByText(esperado.titulo), hash).toBeVisible();
      await expect(page.locator("a[data-cta='ai-score-resultado-vazio']")).toHaveAttribute(
        "href",
        "/ai-score/avaliacao/",
      );
    }
  });

  test("relatório de exemplo: tudo aberto, já no HTML do servidor, sem formulários", async ({ page, request }) => {
    const html = await (await request.get("/ai-score/exemplo/")).text();
    expect(html).toContain(planoTextos.titulo);
    await page.goto("/ai-score/exemplo/");
    await expect(page.getByText(exemplo.aviso)).toBeVisible();
    await expect(page.locator("[data-nota]")).toHaveText("28");
    const rel = page.locator("#relatorio");
    await expect(page.locator("[data-resumo-executivo] [data-item='cenario']")).toContainText(
      "Empresa Exemplo está no nível Explorando, com AI Score 28 de 100. Nota estimada: 10 de 12 respostas válidas",
    );
    // O exemplo tem duas respostas "Não sei": a nota é estimativa e a tela diz quais dimensões usam uma resposta só.
    const aviso = page.locator("[data-cobertura='estimativa']");
    await expect(aviso).toContainText(resultadoTextos.cobertura.estimativa.texto(10, 12));
    await expect(aviso).toContainText("Governança e Segurança, Resultados e Escala");
    await expect(rel.getByText(relatorio.simulacao.texto(40, 28, 42, "Em desenvolvimento"))).toBeVisible();
    for (const id of ["adocao-sem-governanca", "estrategia-sem-execucao", "pontos-cegos"] as const)
      await expect(page.getByText(alertas.itens[id].titulo, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
    await expect(page.getByRole("button", { name: formulario.enviar })).toHaveCount(0);
    await expect(page.locator("a[data-cta='ai-score-exemplo-topo']")).toHaveAttribute("href", "/ai-score/avaliacao/");
    await semViolacoes(page);
    // O PDF do exemplo sai com o aviso de caso fictício.
    await aguardarPronto(page);
    const [baixado] = await Promise.all([
      page.waitForEvent("download"),
      rel.getByRole("button", { name: relatorio.baixar }).click(),
    ]);
    expect(baixado.suggestedFilename()).toBe("RESET-AI-Score-Empresa-Exemplo.pdf");
    expect(readFileSync((await baixado.path())!).toString("latin1")).toContain("Exemplo ilustrativo com respostas hip");
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
    expect(copiado).toContain("/ai-score/resultado/#v=2&m=1&n=2");
    expect(copiado).not.toContain("lead=");

    // Outro lead no link (ou link adulterado): volta para a etapa 1.
    await page.evaluate(() => localStorage.clear());
    await page.goto("/ai-score/");
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}&lead=00000000-0000-4000-8000-000000000000`);
    await expect(page.getByRole("button", { name: contato.enviar })).toBeVisible();
  });

  test("link do e-mail com token: libera, tira o token da barra, não o guarda e recusa token de outra avaliação", async ({
    page,
  }) => {
    await page.goto("/ai-score/");
    test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
    const avaliacao = /id=([^&]+)/.exec(aiScore.exemplo.codigo)![1];
    const token = "t".repeat(43);
    const consultas: unknown[] = [];
    let devolve: string | null = avaliacao;
    await page.route("**/rest/v1/rpc/ler_relatorio", async (rota) => {
      const corpo = rota.request().postDataJSON() as { p_token: string };
      consultas.push(corpo);
      await rota.fulfill({
        json:
          corpo.p_token === token && devolve
            ? { nome: "Maria Teste", empresa: "Empresa Teste", avaliacao: devolve }
            : null,
      });
    });
    await interceptarFuncao(page);
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

    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}&k=${token}`);
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
    await expect(page.getByText(resultadoTextos.ola("Maria Teste"))).toBeVisible();
    expect(consultas).toEqual([{ p_token: token }]);
    // O token sai do endereço assim que é lido e nunca é guardado no navegador.
    expect(page.url()).not.toContain("k=");
    expect(page.url()).toContain("/ai-score/resultado/#v=2&m=1&n=2");
    expect(
      await page.evaluate(() => JSON.stringify([...Object.entries(localStorage), ...Object.entries(sessionStorage)])),
    ).not.toContain(token);
    // Recarregar mantém a liberação (que não precisa mais do token).
    await page.reload();
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
    expect(consultas).toHaveLength(1);
    await page.getByRole("button", { name: resultadoTextos.compartilhar }).click();
    const copiado = await page.evaluate(() => (window as unknown as { copiado?: string }).copiado);
    expect(copiado).not.toMatch(/k=|lead=/);

    // Token que não existe, ou que pertence a outra avaliação: volta para a etapa 1, sem liberar nada.
    for (const [rotulo, enviado, resposta] of [
      ["token errado", "x".repeat(43), avaliacao],
      ["outra avaliação", token, "11111111-1111-4111-8111-111111111111"],
    ] as const) {
      devolve = resposta;
      await page.evaluate(() => localStorage.clear());
      await page.goto("/ai-score/");
      await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}&k=${enviado}`);
      await expect(page.getByRole("button", { name: contato.enviar }), rotulo).toBeVisible();
      await expect(page.getByRole("heading", { name: relatorio.titulo }), rotulo).toHaveCount(0);
    }
  });

  test("preferências de contato: lê o que o servidor tem, grava só o que mudou e não guarda o token", async ({
    page,
  }) => {
    await page.goto("/ai-score/");
    test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
    const token = "p".repeat(43);
    const escolhas: Record<string, boolean> = {
      "relatorio-email|email": true,
      "conteudo-email|email": false,
      "contato-analise|email": true,
      "contato-analise|whatsapp": false,
      "contato-analise|ligacao": false,
    };
    const resposta = (temNumero: boolean) => ({
      status: "ok",
      tem_numero: temNumero,
      escolhas: Object.entries(escolhas).map(([k, concedido]) => {
        const [finalidade, canal] = k.split("|");
        return { finalidade, canal, concedido };
      }),
    });
    const pedidos = await interceptarFuncao(page, {
      preferencias: (_n, corpo) => {
        if (corpo.token !== token) return { status: 403, json: { erro: "invalido" } };
        for (const e of (corpo.escolhas as Array<{ finalidade: string; canal: string; concedido: boolean }>) ?? [])
          escolhas[`${e.finalidade}|${e.canal}`] = e.concedido;
        return { json: resposta(false) };
      },
    });

    await page.goto(`/ai-score/preferencias/#k=${token}`);
    const quadro = page.locator("[data-preferencias='pronto']");
    await expect(quadro).toBeVisible();
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    const caixa = (rotulo: string) => quadro.getByRole("checkbox", { name: new RegExp(rotulo) });
    await expect(caixa("relatório do meu resultado")).toBeChecked();
    await expect(caixa("conteúdos da Reset IA")).not.toBeChecked();
    // Sem número informado, WhatsApp e ligação não podem ser escolhidos, e a tela diz por quê.
    await expect(caixa("por WhatsApp")).toBeDisabled();
    await expect(caixa("uma ligação")).toBeDisabled();
    await expect(quadro.getByText("Você não informou um WhatsApp").first()).toBeVisible();
    await semViolacoes(page);

    // Sem mudança, nada é enviado; com mudança, só o que mudou, com um identificador do pedido.
    await quadro.getByRole("button", { name: "Salvar preferências" }).click();
    await expect(page.locator("[data-situacao='sem-mudanca']")).toBeVisible();
    expect(pedidos.filter((p) => p.escolhas)).toHaveLength(0);
    await caixa("conteúdos da Reset IA").check();
    await caixa("por e-mail, sobre o meu resultado").uncheck();
    await quadro.getByRole("button", { name: "Salvar preferências" }).click();
    await expect(page.locator("[data-situacao='salvo']")).toBeVisible();
    const gravacao = pedidos.find((p) => p.escolhas)!;
    expect(gravacao.escolhas).toEqual([
      { finalidade: "conteudo-email", canal: "email", concedido: true },
      { finalidade: "contato-analise", canal: "email", concedido: false },
    ]);
    expect(String(gravacao.pedido)).toMatch(/^[0-9a-f-]{36}$/);
    await expect(caixa("conteúdos da Reset IA")).toBeChecked();

    // O token fica só no endereço (fragmento): nunca em armazenamento do navegador.
    expect(
      await page.evaluate(() => JSON.stringify([...Object.entries(localStorage), ...Object.entries(sessionStorage)])),
    ).not.toContain(token);
    await page.reload();
    await expect(page.locator("[data-preferencias='pronto']")).toBeVisible();
    await expect(caixa("conteúdos da Reset IA")).toBeChecked();

    // Link inválido ou expirado, e link sem token.
    await page.goto(`/ai-score/preferencias/#k=${"x".repeat(43)}`);
    await expect(page.locator("[data-preferencias='indisponivel']")).toContainText("Este link não vale mais.");
    await page.goto("/ai-score/preferencias/#k=curto");
    await expect(page.locator("[data-preferencias='indisponivel']")).toContainText("Este link está incompleto.");
  });

  test("a mesma nota de 100 com uma resposta baixa trocada por 'Não sei': a tela mostra que é estimativa", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("resetia.ai-score.ver-como-admin", String(Date.now())));
    const resto = "e=empresa&p=ceo&t=50-199&s=tecnologia&d=comecar&h=3-meses";

    // Resposta baixa em Estratégia: nota 86, avaliação completa.
    await page.goto(`/ai-score/resultado/#v=2&m=1&n=2&${resto}&r=404444444444`);
    await expect(page.locator("[data-nota]")).toHaveText("86");
    await expect(page.locator("[data-cobertura='completa']")).toHaveText(resultadoTextos.cobertura.completa(12, 12));
    await expect(page.locator("[data-cobertura='estimativa']")).toHaveCount(0);

    // A mesma resposta como "Não sei": a regra do método 1 tira ela da média e a nota sobe a 100. A tela não
    // apresenta isso como avaliação completa: é estimativa, com 11 de 12 respostas e Estratégia com uma só.
    await page.goto(`/ai-score/resultado/#v=2&m=1&n=2&${resto}&r=4x4444444444`);
    await expect(page.locator("[data-nota]")).toHaveText("100");
    const aviso = page.locator("[data-cobertura='estimativa']");
    await expect(aviso).toContainText(resultadoTextos.cobertura.estimativa.titulo);
    await expect(aviso).toContainText(resultadoTextos.cobertura.estimativa.texto(11, 12));
    await expect(aviso).toContainText("Estratégia e Liderança");
    await expect(page.getByText(resultadoTextos.cobertura.naDimensao(1, 2)).first()).toBeVisible();
    await semViolacoes(page);
  });

  test("link do formato 1 (anterior ao versionamento): nota pelo método 1 e aviso de que a leitura é a atual", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("resetia.ai-score.ver-como-admin", String(Date.now())));
    const v1 = aiScore.exemplo.codigo.replace("v=2&m=1&n=2&", "v=1&");
    expect(v1.startsWith("v=1&e=empresa")).toBe(true);
    await page.goto(`/ai-score/resultado/#${v1}`);
    await expect(page.locator("[data-nota]")).toHaveText("28");
    await expect(page.getByText(resultadoTextos.versao.anterior("1", "2"))).toBeVisible();

    // Já o link do formato atual não leva o aviso.
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}`);
    await expect(page.locator("[data-nota]")).toHaveText("28");
    await expect(page.getByText(resultadoTextos.versao.anterior("1", "2"))).toHaveCount(0);
  });

  test("link de uma análise mais nova que a do site: mostra o aviso e a nota", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("resetia.ai-score.ver-como-admin", String(Date.now())));
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo.replace("n=2", "n=9")}`);
    await expect(page.locator("[data-nota]")).toHaveText("28");
    await expect(page.getByText(resultadoTextos.versao.maisNova)).toBeVisible();
  });

  test("admin abre o resultado de um lead sem passar pelas etapas", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("resetia.ai-score.ver-como-admin", String(Date.now())));
    await page.goto(`/ai-score/resultado/#${aiScore.exemplo.codigo}`);
    await expect(page.getByRole("heading", { name: relatorio.titulo })).toBeVisible();
    await expect(page.getByRole("button", { name: contato.enviar })).toHaveCount(0);
  });

  test("questionário, resultado e exemplo ficam fora do índice", async ({ page }) => {
    for (const caminho of [
      "/ai-score/avaliacao/",
      "/ai-score/resultado/",
      "/ai-score/exemplo/",
      "/ai-score/preferencias/",
    ]) {
      await page.goto(caminho);
      await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
      await expect(page).toHaveTitle(/Reset IA$/);
    }
    expect(site.ctaAiScore).toBe("Fazer a avaliação gratuita");
  });
});
