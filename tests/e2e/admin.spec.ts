import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { admin } from "@/content/admin";
import { adminCanais, adminFicha, adminFila, adminMarcos, adminOperacao, adminTokens } from "@/content/admin-conversas";

const AVALIACOES: Array<Record<string, unknown> & { codigo: string }> = [
  {
    id: "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    criada_em: "2026-10-28T12:59:00Z",
    escopo: "empresa",
    papel: "ceo",
    porte: "50-199",
    segmento: "tecnologia",
    horizonte: "imediato",
    indice: 46,
    nivel: "desenvolvimento",
    parcial: false,
    codigo:
      "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=vendas&av=4323&d=comecar&h=imediato&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    origem: { utm_source: "linkedin", entrada: "/ai-score/" },
    ambiente: "producao",
    leads: [
      {
        id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
        avaliacao_id: "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
        criado_em: "2026-10-28T13:00:00Z",
        atualizado_em: "2026-10-28T13:00:00Z",
        nome: "Maria Teste",
        email: "maria@empresa.com.br",
        email_pessoal: false,
        empresa: "Empresa Teste",
        whatsapp: "5585999990000",
        pediu_contato: true,
        consentimento_marketing: false,
        status: "novo",
        notas: null,
        responsavel: null,
        proximo_contato: null,
        relatorio_enviado_em: null,
        pedido_conversa_em: "2026-10-28T13:00:00Z",
        primeira_resposta_em: null,
        canal: "funcao",
        ambiente: "producao",
      },
    ],
  },
];
// Uma avaliação concluída sem lead (conta em "Concluíram sem deixar contato").
AVALIACOES.push({
  ...AVALIACOES[0],
  id: "b0000000-0000-4000-8000-000000000000",
  criada_em: "2026-10-27T10:00:00Z",
  leads: [],
});

const LEAD_ID = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";

const TODOS_OS_CANAIS = [{ lead_id: LEAD_ID, email: true, whatsapp: true, ligacao: true, telefone: "5585999990000" }];
const NENHUM_CANAL = [{ lead_id: LEAD_ID, email: false, whatsapp: false, ligacao: false, telefone: null }];

interface Opcoes {
  /** O que `contatos_permitidos` responde (lista), ou `null` para o banco fora do ar. */
  contatos?: Array<{
    lead_id: string;
    email: boolean;
    whatsapp: boolean;
    ligacao: boolean;
    telefone: string | null;
  }> | null;
}

/** Simula GoTrue, PostgREST e a função ai-score (o CI builda com uma URL fictícia do Supabase). */
async function simularSupabase(page: Page, opcoes: Opcoes = {}) {
  const patches: unknown[] = [];
  const atividades: Array<Record<string, unknown>> = [];
  const funcao: Array<Record<string, unknown>> = [];
  const marcos: Array<Record<string, unknown>> = [];
  const escritas: Array<{ caminho: string; metodo: string; corpo: unknown }> = [];
  const contatos = opcoes.contatos === undefined ? TODOS_OS_CANAIS : opcoes.contatos;
  await page.route("**/auth/v1/token**", async (rota) => {
    const corpo = rota.request().postDataJSON() as { password?: string };
    if (corpo.password !== "senha-certa") return rota.fulfill({ status: 400, json: { error: "invalid_grant" } });
    await rota.fulfill({
      json: {
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 3600,
        user: { email: "admin@resetia.com.br" },
      },
    });
  });
  await page.route("**/rest/v1/**", async (rota) => {
    const r = rota.request();
    const caminho = new URL(r.url()).pathname;
    expect(r.headers()["authorization"]).toBe("Bearer token");
    if (caminho.endsWith("/rpc/eh_admin")) return rota.fulfill({ json: true });
    if (caminho.endsWith("/rpc/contatos_permitidos"))
      return contatos ? rota.fulfill({ json: contatos }) : rota.fulfill({ status: 500, json: {} });
    if (caminho.endsWith("/rpc/revogar_tokens") || caminho.endsWith("/rpc/reprocessar_tarefa")) {
      escritas.push({ caminho, metodo: r.method(), corpo: r.postDataJSON() });
      return rota.fulfill({ json: caminho.endsWith("revogar_tokens") ? 2 : true });
    }
    if (caminho.endsWith("/marcos")) {
      if (r.method() === "POST") {
        const novo = r.postDataJSON() as Record<string, unknown>;
        marcos.unshift({
          ...novo,
          id: `m${marcos.length}`,
          ocorrido_em: novo.ocorrido_em ?? "2026-10-28",
          observacao: novo.observacao ?? null,
          valor_informado: novo.valor_informado ?? null,
        });
        return rota.fulfill({ status: 201 });
      }
      if (r.method() === "DELETE") {
        marcos.length = 0;
        return rota.fulfill({ status: 204 });
      }
      return rota.fulfill({ json: marcos });
    }
    if (caminho.endsWith("/consentimentos")) {
      escritas.push({ caminho, metodo: r.method(), corpo: r.postDataJSON() });
      return rota.fulfill({ status: 201 });
    }
    if (caminho.endsWith("/aprofundamentos")) return rota.fulfill({ json: [] });
    if (caminho.endsWith("/tarefas"))
      return rota.fulfill({
        json: [
          {
            id: "t1",
            tipo: "email-relatorio",
            lead_id: LEAD_ID,
            status: "falhou",
            tentativas: 5,
            max_tentativas: 5,
            tentar_em: "2026-10-28T14:00:00Z",
            ultimo_erro: "tempo esgotado",
            atualizada_em: "2026-10-28T14:00:00Z",
          },
          {
            id: "t2",
            tipo: "dicas",
            lead_id: LEAD_ID,
            status: "concluida",
            tentativas: 1,
            max_tentativas: 5,
            tentar_em: "2026-10-28T13:10:00Z",
            ultimo_erro: null,
            atualizada_em: "2026-10-28T13:10:00Z",
          },
        ],
      });
    if (new URL(r.url()).searchParams.get("canal")) return rota.fulfill({ json: [] });
    if (r.method() === "PATCH") {
      patches.push(r.postDataJSON());
      return rota.fulfill({ status: 204 });
    }
    if (caminho.endsWith("/atividades")) {
      if (r.method() === "POST") {
        const nova = r.postDataJSON() as Record<string, unknown>;
        atividades.unshift({
          ...nova,
          id: `a${atividades.length}`,
          criado_em: "2026-10-28T15:00:00Z",
          autor: "admin@resetia.com.br",
        });
        return rota.fulfill({ status: 201 });
      }
      return rota.fulfill({ json: atividades });
    }
    if (caminho.endsWith("/emails") || caminho.endsWith("/dicas")) return rota.fulfill({ json: [] });
    await rota.fulfill({ json: AVALIACOES });
  });
  // E-mail ainda não configurado: a função responde "nao-configurado".
  await page.route("**/functions/v1/ai-score", async (rota) => {
    const corpo = rota.request().postDataJSON() as Record<string, unknown>;
    funcao.push(corpo);
    await rota.fulfill({
      json: corpo.acao === "processar" ? { processadas: 1, falhas: 0 } : { status: "nao-configurado" },
    });
  });
  await page.context().route("https://wa.me/**", (rota) => rota.fulfill({ body: "" }));
  return { patches, atividades, funcao, marcos, escritas };
}

const semViolacoes = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
    .then((r) => expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]));

test("admin: login, indicadores, funil, gaveta do lead, atividades, e-mail, lista, CSV e sair", async ({
  page,
  isMobile,
}) => {
  await page.goto("/ai-score/");
  const modo = await page.locator("main").getAttribute("data-ai-score-modo");
  await page.goto("/admin/");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  await expect(page.locator("[data-barra-mobile]")).toHaveCount(0);
  if (modo !== "producao") {
    await expect(page.getByText(admin.login.desligado)).toBeVisible();
    return;
  }

  const { patches, atividades, funcao, marcos, escritas } = await simularSupabase(page);
  await page.getByLabel(admin.login.email).fill("admin@resetia.com.br");
  await page.getByLabel(admin.login.senha).fill("senha-errada");
  await page.getByRole("button", { name: admin.login.entrar }).click();
  await expect(page.getByText(admin.login.erro)).toBeVisible();
  await page.getByLabel(admin.login.senha).fill("senha-certa");
  await page.getByRole("button", { name: admin.login.entrar }).click();

  // Indicadores e funil.
  await expect(page.getByRole("heading", { level: 1, name: admin.titulo })).toBeVisible();
  const numeros = page.locator("dl").first();
  const indicador = (rotulo: string) => numeros.getByText(rotulo, { exact: true }).locator("..");
  await expect(indicador(admin.indicadores.avaliacoes)).toContainText("2");
  await expect(indicador(admin.indicadores.semLead)).toContainText("1");
  await expect(indicador(admin.indicadores.leads)).toContainText("1");
  await expect(indicador(admin.indicadores.pediram)).toContainText("1");
  // A conversão mostra o denominador, sobre todos os leads, e a outra taxa tem nome próprio.
  await expect(indicador(admin.indicadores.conversao)).toContainText("0 de 1 · 0%");
  await expect(indicador(admin.indicadores.conversaoSemDescartados)).toContainText("0 de 1 · 0%");
  await expect(page.getByRole("button", { name: admin.vistas.funil })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-etapa='novo']")).toContainText("Maria Teste");
  const cartao = page.locator(`[data-lead='${LEAD_ID}']`);
  await expect(cartao.getByRole("link", { name: admin.detalhe.acoes.whatsapp })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/5585999990000\?text=/,
  );
  await semViolacoes(page);

  // Mover pelo seletor (teclado e celular) e arrastando: grava a etapa e registra na linha do tempo.
  await page.getByLabel(`${admin.funil.mover} (Maria Teste)`).selectOption("contatado");
  await expect(page.locator("[data-etapa='contatado']")).toContainText("Maria Teste");
  await expect.poll(() => atividades.length).toBe(1);
  expect(atividades[0]).toMatchObject({
    lead_id: LEAD_ID,
    tipo: "status",
    texto: admin.detalhe.atividades.statusAlterado(admin.status.novo, admin.status.contatado),
  });
  // Arrastar é do mouse; no celular, o seletor faz o mesmo.
  if (isMobile) await page.getByLabel(`${admin.funil.mover} (Maria Teste)`).selectOption("qualificado");
  else await cartao.dragTo(page.locator("[data-etapa='qualificado']"));
  await expect(page.locator("[data-etapa='qualificado']")).toContainText("Maria Teste");
  expect(patches).toEqual([{ status: "contatado" }, { status: "qualificado" }]);

  // Gaveta do lead.
  await page.getByRole("button", { name: admin.funil.abrir("Maria Teste") }).click();
  const gaveta = page.getByRole("dialog", { name: "Maria Teste" });
  await expect(gaveta).toBeVisible();
  await expect(gaveta.getByText("Estratégia e Liderança")).toBeVisible();
  await expect(gaveta.getByText("linkedin")).toBeVisible();
  await expect(
    gaveta.getByText(admin.detalhe.atividades.statusAlterado(admin.status.contatado, admin.status.qualificado)),
  ).toBeVisible();
  const wa = gaveta.getByRole("link", { name: /\+5585999990000/ });
  expect(new URL((await wa.getAttribute("href"))!).searchParams.get("text")).toContain("(34/100)");
  await expect(gaveta.getByRole("link", { name: admin.detalhe.verResultado })).toHaveAttribute(
    "href",
    `/ai-score/resultado/#${AVALIACOES[0].codigo}`,
  );
  await semViolacoes(page);

  // Ficha de preparação, pontuações separadas, canais liberados pelo banco e marcos do funil.
  const ficha = gaveta.locator("[data-ficha]");
  await expect(ficha.getByRole("heading", { name: adminFicha.titulo })).toBeVisible();
  for (const secao of ["perfil", "dor", "sustentacao", "hipotese", "faltam", "perguntas", "piloto", "proximo"])
    await expect(ficha.locator(`[data-ficha-secao='${secao}']`)).toBeVisible();
  await expect(ficha.locator("[data-ficha-secao='proximo']")).toContainText("Responder ao pedido de conversa");
  await expect(ficha).not.toContainText("maria@empresa.com.br");
  await expect(ficha).not.toContainText("5585999990000");
  for (const nome of [
    admin.detalhe.pontuacoes.aderencia,
    admin.detalhe.pontuacoes.intencao,
    admin.detalhe.pontuacoes.oportunidade,
  ])
    await expect(gaveta.locator(`[data-pontuacao='${nome}']`)).toBeVisible();
  await expect(gaveta.locator("[data-canal='whatsapp']")).toHaveAttribute("data-liberado", "true");
  await gaveta.getByRole("button", { name: adminMarcos.registrar }).click();
  await expect(gaveta.locator("[data-marco='reuniao-agendada']")).toBeVisible();
  expect(marcos[0]).toMatchObject({ lead_id: LEAD_ID, tipo: "reuniao-agendada" });
  await gaveta.getByLabel(adminMarcos.valor).fill("1.500,50");
  await gaveta.getByLabel(adminMarcos.tipo).selectOption("proposta-enviada");
  await gaveta.getByRole("button", { name: adminMarcos.registrar }).click();
  await expect(gaveta.locator("[data-marco='proposta-enviada']")).toContainText("1.500,50");
  expect(marcos[0]).toMatchObject({ tipo: "proposta-enviada", valor_informado: 1500.5 });
  // Revogar os links do relatório e registrar que a pessoa pediu para parar (a equipe só revoga, nunca concede).
  await gaveta.getByRole("button", { name: adminTokens.revogar }).click();
  await expect(gaveta.getByText(adminTokens.revogados(2))).toBeVisible();
  expect(escritas.find((e) => e.caminho.endsWith("revogar_tokens"))?.corpo).toEqual({ p_lead: LEAD_ID });
  await gaveta.locator("[data-canal='ligacao']").getByRole("button", { name: adminCanais.revogar }).click();
  await expect(gaveta.getByText(adminCanais.revogado)).toBeVisible();
  expect(escritas.find((e) => e.caminho.endsWith("consentimentos"))?.corpo).toMatchObject({
    lead_id: LEAD_ID,
    finalidade: "contato-analise",
    canal: "ligacao",
    concedido: false,
    fonte: "admin-revogacao",
  });

  // Abrir o WhatsApp registra o contato.
  const popup = page.waitForEvent("popup");
  await wa.click();
  await (await popup).close();
  await expect(gaveta.getByText(admin.detalhe.atividades.whatsappAberto)).toBeVisible();

  // Acompanhamento: etapa, próximo contato (no passado, fica atrasado), responsável e notas.
  patches.length = 0;
  await gaveta.getByLabel(admin.detalhe.statusRotulo).selectOption("oportunidade");
  await gaveta.getByLabel(admin.detalhe.proximoContato).fill("2026-10-01");
  await gaveta.getByRole("button", { name: admin.detalhe.assumir }).click();
  await expect(gaveta.getByLabel(admin.detalhe.responsavel)).toHaveValue("admin@resetia.com.br");
  await gaveta.getByLabel(admin.detalhe.notas).fill("Ligar na quinta");
  await gaveta.getByRole("button", { name: admin.detalhe.salvar }).click();
  await expect(gaveta.getByText(admin.detalhe.salvo)).toBeVisible();
  expect(patches).toEqual([
    {
      status: "oportunidade",
      notas: "Ligar na quinta",
      responsavel: "admin@resetia.com.br",
      proximo_contato: "2026-10-01",
    },
  ]);
  await expect(
    gaveta.getByText(admin.detalhe.atividades.statusAlterado(admin.status.qualificado, admin.status.oportunidade)),
  ).toBeVisible();

  // Registrar uma ligação.
  await gaveta.getByLabel(admin.detalhe.atividades.tipo).selectOption("ligacao");
  await gaveta.getByLabel(admin.detalhe.atividades.texto).fill("Pediu proposta para o time de vendas");
  await gaveta.getByRole("button", { name: admin.detalhe.atividades.registrar, exact: true }).click();
  await expect(gaveta.getByText("Pediu proposta para o time de vendas")).toBeVisible();
  expect(atividades[0]).toMatchObject({ tipo: "ligacao", lead_id: LEAD_ID });

  // E-mail sobre a Reset IA sem envio configurado: oferece o e-mail de quem está no admin.
  await gaveta.getByRole("button", { name: admin.detalhe.acoes.email }).click();
  const compositor = page.getByRole("dialog", { name: admin.compositor.titulo });
  await expect(compositor.getByLabel(admin.compositor.assunto)).toHaveValue(/Empresa Teste/);
  await compositor.getByRole("button", { name: admin.compositor.enviar }).click();
  await expect(compositor.getByText(admin.compositor.naoConfigurado)).toBeVisible();
  await expect(compositor.getByRole("link", { name: admin.compositor.abrirEmail })).toHaveAttribute(
    "href",
    /^mailto:maria@empresa\.com\.br\?subject=/,
  );
  expect(funcao.at(-1)).toMatchObject({ acao: "email-reset", lead_id: LEAD_ID });
  await compositor.getByRole("button", { name: admin.compositor.cancelar }).click();
  await expect(compositor).toBeHidden();
  await expect(gaveta).toBeVisible();

  // Relatório completo por e-mail.
  await gaveta.getByRole("button", { name: admin.detalhe.acoes.relatorio }).click();
  await expect(gaveta.getByText(admin.detalhe.emails.status["nao-configurado"]).first()).toBeVisible();
  expect(funcao.at(-1)).toMatchObject({ acao: "enviar-relatorio", lead_id: LEAD_ID });

  await gaveta.getByRole("button", { name: admin.detalhe.fechar }).click();
  await expect(gaveta).toBeHidden();

  // Lista: etapa e próximo contato atrasado.
  await page.getByRole("button", { name: admin.vistas.lista }).click();
  await expect(page.getByRole("row")).toHaveCount(2);
  const linha = page.getByRole("row").nth(1);
  await expect(linha).toContainText("Maria Teste");
  await expect(linha).toContainText(admin.status.oportunidade);
  await expect(linha).toContainText(admin.detalhe.atrasado);
  await expect(indicador(admin.indicadores.atrasados)).toContainText("1");
  await expect(indicador(admin.indicadores.emNegociacao)).toContainText("1");

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: admin.exportar }).click();
  expect((await download).suggestedFilename()).toMatch(/^leads-ai-score-\d{4}-\d{2}-\d{2}\.csv$/);

  // Fila de pedidos de conversa: o pedido sem primeira resposta aparece com as pendências.
  await page.getByRole("button", { name: admin.vistas.conversas }).click();
  const fila = page.locator("[data-fila]");
  await expect(fila.getByRole("heading", { name: adminFila.titulo })).toBeVisible();
  await expect(fila.locator(`[data-fila-lead='${LEAD_ID}']`)).toContainText(adminFila.naoRespondido);
  await expect(fila.locator(`[data-fila-lead='${LEAD_ID}']`)).toContainText(adminFila.pendencias["sem-resposta"]);
  // Pedido anterior ao momento guardado ou respondido: sem tempo mediano, o painel diz que não há base.
  await expect(fila.locator("[data-fila-base]")).toContainText(adminFila.resumo.semBase);
  await semViolacoes(page);

  // Operação do servidor: analytics, caminho antigo, tarefas e reprocessamento.
  await page.getByRole("button", { name: admin.vistas.operacao }).click();
  const operacao = page.locator("[data-operacao]");
  await expect(operacao.locator("[data-analytics='desligado']")).toContainText(adminOperacao.analytics.desligado);
  await expect(operacao.locator("[data-legado]")).toContainText("Nos últimos 7 dias: 0 leads e 0 avaliações");
  await expect(operacao.locator("[data-tarefa='falhou']")).toContainText("tempo esgotado");
  await operacao
    .locator("[data-tarefa='falhou']")
    .getByRole("button", { name: adminOperacao.tarefas.reprocessar })
    .click();
  await expect(operacao.getByText(adminOperacao.tarefas.reprocessada)).toBeVisible();
  expect(escritas.find((e) => e.caminho.endsWith("reprocessar_tarefa"))?.corpo).toEqual({ p_id: "t1" });
  await operacao.getByRole("button", { name: adminOperacao.tarefas.processar }).click();
  await expect(operacao.getByText(adminOperacao.tarefas.processado(1, 0))).toBeVisible();
  expect(funcao.at(-1)).toMatchObject({ acao: "processar" });
  await expect(operacao.locator("[data-funil]")).toContainText(adminOperacao.funil.semAnalytics);

  await page.getByRole("button", { name: admin.sair }).click();
  await expect(page.getByRole("button", { name: admin.login.entrar })).toBeVisible();
});

test("admin: sem a escolha da pessoa, não há botão de WhatsApp, ligação nem número na tela", async ({ page }) => {
  await page.goto("/ai-score/");
  test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
  await page.goto("/admin/");
  await simularSupabase(page, { contatos: NENHUM_CANAL });
  await page.getByLabel(admin.login.email).fill("admin@resetia.com.br");
  await page.getByLabel(admin.login.senha).fill("senha-certa");
  await page.getByRole("button", { name: admin.login.entrar }).click();
  const cartao = page.locator(`[data-lead='${LEAD_ID}']`);
  await expect(cartao).toBeVisible();
  await expect(cartao.getByRole("link", { name: admin.detalhe.acoes.whatsapp })).toHaveCount(0);
  await page.getByRole("button", { name: admin.funil.abrir("Maria Teste") }).click();
  const gaveta = page.getByRole("dialog", { name: "Maria Teste" });
  await expect(gaveta.locator("[data-canal='whatsapp']")).toHaveAttribute("data-liberado", "false");
  await expect(gaveta.getByRole("link", { name: /\+5585999990000/ })).toHaveCount(0);
  await expect(gaveta.getByRole("link", { name: admin.detalhe.acoes.ligar })).toHaveCount(0);
  await expect(gaveta.getByText(adminCanais.semNenhum)).toBeVisible();
  await expect(gaveta.getByText("5585999990000")).toHaveCount(0);
  await semViolacoes(page);
});

test("admin: se o banco não confirma as escolhas, nenhum canal é liberado por segurança", async ({ page }) => {
  await page.goto("/ai-score/");
  test.skip((await page.locator("main").getAttribute("data-ai-score-modo")) !== "producao", "só com Supabase");
  await page.goto("/admin/");
  await simularSupabase(page, { contatos: null });
  await page.getByLabel(admin.login.email).fill("admin@resetia.com.br");
  await page.getByLabel(admin.login.senha).fill("senha-certa");
  await page.getByRole("button", { name: admin.login.entrar }).click();
  await page.getByRole("button", { name: admin.funil.abrir("Maria Teste") }).click();
  const gaveta = page.getByRole("dialog", { name: "Maria Teste" });
  await expect(gaveta.locator("[data-canais='falhou']")).toContainText(adminCanais.falhou);
  await expect(gaveta.getByRole("link", { name: /\+5585999990000/ })).toHaveCount(0);
  await expect(
    page.locator(`[data-lead='${LEAD_ID}']`).getByRole("link", { name: admin.detalhe.acoes.whatsapp }),
  ).toHaveCount(0);
});
