// Teste de integração da função ai-score (Deno): sobe um mock da REST do Supabase, do GoTrue e da API da
// Anthropic, importa a função de verdade e confere as três ações. Sem rede externa: sem RESEND_API_KEY, o
// e-mail fica em "nao-configurado". Rodar com `npm run test:funcao`.
import assert from "node:assert/strict";

const AVALIACAO = "00000000-0000-4000-8000-000000000000";
const LEAD = "11111111-1111-4111-8111-111111111111";
const LEAD_NOVO = "44444444-4444-4444-8444-444444444444";
const CHAVE = "k".repeat(43);
const SEM_EMPRESA = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
// Empresa de serviços B2B com processos, dados, governança e resultados abaixo de 40.
const CODIGO =
  "v=1&e=empresa&p=ceo&t=50-199&s=servicos-b2b&r=322221211x1x&a=marketing,vendas&am=2112&av=1201&d=repetitivas,governanca&h=3-meses&id=00000000-0000-4000-8000-000000000000";
const DICA_BOA =
  "Escolha um responsável pela dimensão e combine com as equipes um primeiro passo simples para as próximas semanas.";
const DICA_RUIM = "Reduza em 30 dias o retrabalho com o ChatGPT.";

type Linha = Record<string, unknown>;
const sha256 = async (t: string) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const HASH_DA_CHAVE = await sha256(CHAVE);
const banco = {
  leads: [
    { id: LEAD, avaliacao_id: AVALIACAO, nome: "Maria Teste", email: "maria@empresa.com.br", empresa: "Empresa Teste" },
    { id: SEM_EMPRESA, avaliacao_id: AVALIACAO, nome: "Sem Empresa", email: "s@e.com.br", empresa: null },
    // Lead novo (criado pela função): tem chave, canal função e já completou a etapa 2.
    {
      id: LEAD_NOVO,
      avaliacao_id: AVALIACAO,
      nome: "Ana Nova",
      email: "ana@empresa.com.br",
      empresa: "Empresa Nova",
      chave_hash: HASH_DA_CHAVE,
      canal: "funcao",
    },
  ].map((l) => ({ canal: "legado", chave_hash: null, ...l, relatorio_enviado_em: null })) as Linha[],
  dicas: new Map<string, Linha>(),
  emails: [] as Linha[],
  atividades: [] as Linha[],
  mensagens: [] as Array<{ cabecalhos: Headers; corpo: Linha }>,
  // Chamadas RPC recebidas e o comportamento de cada uma (o teste troca por cenário).
  rpcs: [] as Array<{ nome: string; args: Linha }>,
  contadores: new Map<string, number>(),
  elegiveis: new Set<string>(),
  tarefas: [] as Linha[],
  // Resend: o que responder e o que foi recebido.
  resend: { status: 200, corpo: { id: "re_123" } as Linha, atrasoMs: 0 },
  envios: [] as Array<{ cabecalhos: Headers; corpo: Linha }>,
};
const rpcHandlers: Record<string, (a: Linha) => unknown> = {
  consumir_limite: (a) => {
    const n = (banco.contadores.get(String(a.p_chave)) ?? 0) + 1;
    banco.contadores.set(String(a.p_chave), n);
    return n <= Number(a.p_maximo);
  },
  elegivel: (a) => banco.elegiveis.has(`${a.p_lead}|${a.p_finalidade}|${a.p_canal}`),
  pegar_tarefas: () => [],
  concluir_tarefa: (a) => String(a.p_status),
  criar_token: () => null,
};

const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { "Content-Type": "application/json" } });
const contagem = (n: number) =>
  new Response("[]", { headers: { "Content-Range": n ? `0-0/${n}` : "*/0", "Content-Type": "application/json" } });
const valor = (q: URLSearchParams, k: string) => (q.get(k) ?? "").replace(/^(eq|gte)\./, "");

const mock = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen() {} }, async (req) => {
  const u = new URL(req.url);
  const q = u.searchParams;
  const conta = (req.headers.get("prefer") ?? "").includes("count=exact");
  const corpo = ["POST", "PATCH"].includes(req.method) ? ((await req.json()) as Linha) : {};

  if (u.pathname === "/v1/messages") {
    banco.mensagens.push({ cabecalhos: req.headers, corpo });
    const formato = (corpo.output_config as { format: { schema: Linha } }).format.schema as {
      properties: { dimensoes: { items: { properties: { id: { enum: string[] } } } } };
    };
    const alvos = formato.properties.dimensoes.items.properties.id.enum;
    const texto = JSON.stringify({ dimensoes: alvos.map((id) => ({ id, dicas: [DICA_BOA, DICA_RUIM] })) });
    return json({
      id: "msg",
      type: "message",
      role: "assistant",
      model: corpo.model,
      content: [{ type: "text", text: texto }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    });
  }
  if (u.pathname === "/auth/v1/user")
    return req.headers.get("authorization") === "Bearer token-admin"
      ? json({ id: ADMIN, email: "admin@resetia.com.br" })
      : json({ msg: "invalid" }, 401);

  if (u.pathname === "/emails") {
    banco.envios.push({ cabecalhos: req.headers, corpo });
    if (banco.resend.atrasoMs) await new Promise((ok) => setTimeout(ok, banco.resend.atrasoMs));
    return json(banco.resend.corpo, banco.resend.status);
  }
  if (u.pathname.startsWith("/rest/v1/rpc/")) {
    const nome = u.pathname.replace("/rest/v1/rpc/", "");
    banco.rpcs.push({ nome, args: corpo });
    const h = rpcHandlers[nome];
    if (!h) return json({ code: "PGRST202", message: `sem mock para ${nome}` }, 404);
    const r = h(corpo);
    return r instanceof Response ? r : json(r);
  }
  const tabela = u.pathname.replace("/rest/v1/", "");
  if (tabela === "tarefas") return json(banco.tarefas.filter((t) => t.lead_id === valor(q, "lead_id")));
  if (tabela === "admins") return json(valor(q, "user_id") === ADMIN ? [{ user_id: ADMIN }] : []);
  if (tabela === "leads") {
    if (conta)
      return contagem(
        banco.leads.filter(
          (l) =>
            l.email === valor(q, "email") &&
            l.relatorio_enviado_em &&
            String(l.relatorio_enviado_em) >= valor(q, "relatorio_enviado_em"),
        ).length,
      );
    const alvo = banco.leads.filter(
      (l) =>
        l.id === valor(q, "id") &&
        (!q.has("avaliacao_id") || l.avaliacao_id === valor(q, "avaliacao_id")) &&
        (!q.has("chave_hash") || l.chave_hash === valor(q, "chave_hash")),
    );
    if (req.method === "GET") return json(alvo.map((l) => ({ ...l, avaliacao: { id: AVALIACAO, codigo: CODIGO } })));
    const livres = q.get("relatorio_enviado_em") === "is.null" ? alvo.filter((l) => !l.relatorio_enviado_em) : alvo;
    livres.forEach((l) => Object.assign(l, corpo));
    return (req.headers.get("prefer") ?? "").includes("representation")
      ? json(livres)
      : new Response(null, { status: 204 });
  }
  if (tabela === "dicas") {
    if (conta) return contagem(banco.dicas.size);
    const id = valor(q, "avaliacao_id");
    if (req.method === "GET") return json(banco.dicas.has(id) ? [banco.dicas.get(id)] : []);
    if (req.method === "POST") {
      if (banco.dicas.has(String(corpo.avaliacao_id))) return json({ code: "23505" }, 409);
      banco.dicas.set(String(corpo.avaliacao_id), { ...corpo, conteudo: null, criado_em: new Date().toISOString() });
      return new Response(null, { status: 201 });
    }
    if (req.method === "DELETE") banco.dicas.delete(id);
    if (req.method === "PATCH") Object.assign(banco.dicas.get(id) ?? {}, corpo);
    return new Response(null, { status: 204 });
  }
  if (tabela === "emails") {
    if (conta) return contagem(banco.emails.filter((e) => e.tipo === valor(q, "tipo")).length);
    banco.emails.push(corpo);
    return new Response(null, { status: 201 });
  }
  if (tabela === "atividades") {
    banco.atividades.push(corpo);
    return new Response(null, { status: 201 });
  }
  return json({ erro: `rota desconhecida: ${req.method} ${tabela}` }, 404);
});

const base = `http://127.0.0.1:${mock.addr.port}`;
Deno.env.set("SUPABASE_URL", base);
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "servico");
Deno.env.set("ANTHROPIC_BASE_URL", base);
Deno.env.set("RELATORIOS_POR_HORA", "2");
Deno.env.set("RESEND_BASE_URL", base);
Deno.env.set("RESEND_TIMEOUT_MS", "300");
Deno.env.set("PROCESSADOR_SEGREDO", "segredo-do-agendador-teste");
Deno.env.delete("ANTHROPIC_API_KEY");
Deno.env.delete("RESEND_API_KEY");
await import("../functions/ai-score/index.ts");

async function chamar(corpo: unknown, cabecalhos: Record<string, string> = {}) {
  const r = await fetch("http://127.0.0.1:8000", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabecalhos },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
  return {
    status: r.status,
    dados: (await r.json()) as Linha & { dimensoes?: Array<{ id: string; dicas: string[] }> },
  };
}
const opcoes = { sanitizeOps: false, sanitizeResources: false };
const par = { avaliacao_id: AVALIACAO, lead_id: LEAD };

Deno.test("rejeita método, JSON e ação inválidos", opcoes, async () => {
  assert.equal((await chamar("nao-json")).status, 400);
  assert.deepEqual(await chamar({ acao: "outra" }), { status: 400, dados: { erro: "acao" } });
  const r = await fetch("http://127.0.0.1:8000");
  assert.equal(r.status, 405);
  await r.body?.cancel();
});

Deno.test("sem o par (lead, avaliação) de um lead com empresa, nem dicas nem relatório", opcoes, async () => {
  for (const corpo of [
    { acao: "dicas", avaliacao_id: AVALIACAO, lead_id: SEM_EMPRESA },
    { acao: "dicas", avaliacao_id: "00000000-0000-4000-8000-000000000001", lead_id: LEAD },
    { acao: "enviar-relatorio", avaliacao_id: "x", lead_id: LEAD },
  ])
    assert.equal((await chamar(corpo)).status, 404);
});

Deno.test("sem chave da IA: dicas da biblioteca, nada guardado", opcoes, async () => {
  const r = await chamar({ acao: "dicas", ...par });
  assert.equal(r.dados.fonte, "biblioteca");
  assert.deepEqual(
    r.dados.dimensoes!.map((d) => d.id),
    ["processos", "dados", "governanca", "resultados"],
  );
  assert.equal(banco.dicas.size, 0);
  assert.equal(banco.mensagens.length, 0);
});

Deno.test("com IA: escritor e revisor, saída validada, guardada uma vez e sem dados pessoais", opcoes, async () => {
  Deno.env.set("ANTHROPIC_API_KEY", "sk-teste");
  const respostas = await Promise.all([1, 2, 3].map(() => chamar({ acao: "dicas", ...par })));
  Deno.env.delete("ANTHROPIC_API_KEY");
  // Três pedidos ao mesmo tempo: uma geração só (escritor + revisor), a trava segura os outros.
  assert.equal(banco.mensagens.length, 2);
  for (const r of respostas) assert.deepEqual(r.dados, respostas[0].dados);
  const dicas = respostas[0].dados;
  assert.equal(dicas.fonte, "ia");
  for (const d of dicas.dimensoes!) assert.deepEqual(d.dicas, [DICA_BOA]); // a dica com número e marca caiu
  assert.equal(banco.dicas.get(AVALIACAO)?.fonte, "ia");
  const [escritor, revisor] = banco.mensagens;
  assert.equal(escritor.cabecalhos.get("anthropic-beta"), "server-side-fallback-2026-07-01");
  assert.equal(escritor.corpo.model, "claude-opus-5-5");
  assert.equal(escritor.corpo.fallbacks, "default");
  assert.deepEqual((escritor.corpo.output_config as Linha).effort, "low");
  assert.match(JSON.stringify((revisor.corpo.messages as Linha[])[0]), /Dicas do escritor/);
  const prompts = JSON.stringify(banco.mensagens.map((m) => m.corpo));
  for (const pessoal of ["Maria", "maria@", "Empresa Teste", LEAD]) assert.equal(prompts.includes(pessoal), false);
});

Deno.test(
  "relatório sem e-mail configurado: registra, não marca o lead e respeita o limite por hora",
  opcoes,
  async () => {
    assert.deepEqual((await chamar({ acao: "enviar-relatorio", ...par })).dados, { status: "nao-configurado" });
    assert.equal(banco.leads[0].relatorio_enviado_em, null);
    assert.deepEqual(banco.emails.at(-1), {
      lead_id: LEAD,
      tipo: "relatorio",
      assunto: "Seu RESET AI Score: 28/100, nível Explorando",
      status: "nao-configurado",
      erro: null,
      provedor_id: null,
      autor: "sistema",
    });
    assert.equal((await chamar({ acao: "enviar-relatorio", ...par })).dados.status, "nao-configurado");
    assert.equal((await chamar({ acao: "enviar-relatorio", ...par })).dados.status, "limite");
  },
);

Deno.test("relatório já enviado não sai de novo", opcoes, async () => {
  banco.emails.length = 0;
  banco.leads[0].relatorio_enviado_em = new Date().toISOString();
  assert.deepEqual((await chamar({ acao: "enviar-relatorio", ...par })).dados, { status: "ja-enviado" });
  banco.leads[0].relatorio_enviado_em = null;
});

Deno.test("e-mail da Reset: só com token de admin, campos conferidos e autor registrado", opcoes, async () => {
  const corpo = { acao: "email-reset", lead_id: LEAD, assunto: "Próximos passos", corpo: "Olá, Maria." };
  assert.equal((await chamar(corpo)).status, 401);
  assert.equal((await chamar(corpo, { Authorization: "Bearer outro" })).status, 401);
  const admin = { Authorization: "Bearer token-admin" };
  assert.equal((await chamar({ ...corpo, assunto: "" }, admin)).status, 400);
  assert.equal((await chamar({ ...corpo, corpo: "x".repeat(6001) }, admin)).status, 400);
  // Sem consentimento registrado (nem contato com especialista nem conteúdo), o admin não envia.
  assert.deepEqual(await chamar(corpo, admin), { status: 403, dados: { erro: "consentimento" } });
  banco.elegiveis.add(`${LEAD}|contato-analise|email`);
  assert.deepEqual((await chamar(corpo, admin)).dados, { status: "nao-configurado" });
  assert.equal(banco.emails.at(-1)?.autor, "admin@resetia.com.br");
});

// ---------------------------------------------------------------------------------------------------------------
// Captura, tarefas e e-mail (ações novas). O banco é simulado: o que importa aqui é o que a função valida, recalcula,
// manda ao banco e responde. As funções SQL de verdade são testadas em supabase/tests/captura.sql.
// ---------------------------------------------------------------------------------------------------------------

const NOVO = "55555555-5555-4555-8555-555555555555";
const CODIGO_V2 = CODIGO.replace("v=1&", "v=2&m=1&n=2&");
const SEGREDO = { "x-processador": "segredo-do-agendador-teste" };
const chamadas = (nome: string) => banco.rpcs.filter((r) => r.nome === nome);
const ultima = (nome: string) => chamadas(nome).at(-1)!.args as Linha & { p: Linha };

async function hashDe(texto: string) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
  return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function zerar() {
  banco.rpcs.length = 0;
  banco.contadores.clear();
  banco.envios.length = 0;
  banco.emails.length = 0;
  banco.atividades.length = 0;
  banco.elegiveis.clear();
  for (const l of banco.leads) l.relatorio_enviado_em = null;
  banco.resend = { status: 200, corpo: { id: "re_123" }, atrasoMs: 0 };
  rpcHandlers.registrar_avaliacao = () => ({ status: "registrado" });
  rpcHandlers.registrar_captura = () => ({ status: "registrado" });
  rpcHandlers.completar_captura = () => ({ status: "completado" });
  rpcHandlers.gravar_aprofundamento = (a) => ({ status: "gravado", revisao: a.p && (a.p as Linha).revisao });
  rpcHandlers.pegar_tarefas = () => [];
  Deno.env.delete("RESEND_API_KEY");
  Deno.env.delete("EMAIL_REMETENTE");
}
const registro = (extra: Linha = {}) => ({
  acao: "registrar",
  avaliacao_id: AVALIACAO,
  lead_id: NOVO,
  chave: CHAVE,
  codigo: CODIGO_V2,
  nome: "Maria Nova",
  email: "Maria.Nova@Gmail.com",
  ambiente: "dev",
  marketing: true,
  origem: { utm_source: "linkedin", extra: "ignorado", referrer: "r".repeat(500) },
  ...extra,
});

Deno.test("registrar: a nota é recalculada aqui e o que o navegador diz sobre ela é ignorado", opcoes, async () => {
  zerar();
  const r = await chamar(registro({ indice: 100, nivel: "avancada", parcial: false, dimensoes: { estrategia: 100 } }));
  assert.deepEqual(r.status, 200);
  assert.equal(r.dados.status, "registrado");
  assert.equal(r.dados.nota, 28);
  const { avaliacao, relatorio } = ultima("registrar_captura").p as { avaliacao: Linha; relatorio: Linha };
  assert.equal(avaliacao.indice, 28);
  assert.equal(avaliacao.nivel, "explorando");
  assert.equal(avaliacao.parcial, false);
  assert.equal((avaliacao.dimensoes as Linha).estrategia, 55);
  assert.equal(avaliacao.versao, "2");
  assert.equal(avaliacao.versao_metodo, "1");
  assert.equal(avaliacao.versao_analise, "2");
  assert.deepEqual((avaliacao.resultado as Linha).situacao, "estimativa"); // o exemplo tem duas respostas "Não sei"
  assert.equal(
    (relatorio.devolutiva as Linha).versoes && ((relatorio.devolutiva as Linha).versoes as Linha).analiseAtual,
    "2",
  );
  assert.match(String(relatorio.hash), /^[0-9a-f]{64}$/);
});

Deno.test(
  "registrar: o banco recebe só o hash da chave, o código canônico e o e-mail em minúsculas",
  opcoes,
  async () => {
    zerar();
    const codigo = `${CODIGO_V2}&k=${"t".repeat(43)}&lead=${LEAD}`;
    assert.equal((await chamar(registro({ codigo }))).status, 200);
    const { p } = ultima("registrar_captura") as {
      p: { avaliacao: Linha; lead: Linha; chave_hash: string; consentimentos: Linha[]; relatorio: Linha };
    };
    assert.equal(p.chave_hash, HASH_DA_CHAVE);
    assert.equal(JSON.stringify(banco.rpcs).includes(CHAVE), false, "a chave nunca chega ao banco");
    assert.equal(p.avaliacao.codigo, CODIGO_V2, "token e lead do link ficam de fora do código gravado");
    assert.equal(JSON.stringify(p).includes("lead="), false);
    assert.equal(p.lead.email, "maria.nova@gmail.com");
    assert.equal(p.lead.email_pessoal, true);
    assert.equal(p.lead.nome, "Maria Nova");
    assert.deepEqual(Object.keys(p.avaliacao.origem as Linha).sort(), ["referrer", "utm_source"]);
    assert.equal(String((p.avaliacao.origem as Linha).referrer).length, 300);
    assert.equal(p.consentimentos.length, 1);
    assert.deepEqual(
      { ...p.consentimentos[0], evento_id: "x" },
      {
        finalidade: "conteudo-email",
        canal: "email",
        concedido: true,
        fonte: "formulario",
        texto_versao: "2026-11-01",
        evento_id: "x",
      },
    );
    // O mesmo pedido de novo gera o mesmo evento de consentimento (o banco não duplica).
    await chamar(registro({ codigo }));
    const eventos = chamadas("registrar_captura").map(
      (c) => ((c.args.p as Linha).consentimentos as Linha[])[0].evento_id,
    );
    assert.equal(eventos[0], eventos[1]);
  },
);

Deno.test("registrar: sem marcar conteúdo não há evento de consentimento", opcoes, async () => {
  zerar();
  await chamar(registro({ marketing: false }));
  assert.deepEqual((ultima("registrar_captura").p as { consentimentos: unknown[] }).consentimentos, []);
});

Deno.test("registrar: pedido repetido e conflito vêm do banco e viram 200 e 409", opcoes, async () => {
  zerar();
  rpcHandlers.registrar_captura = () => ({ status: "ja-registrado" });
  assert.deepEqual((await chamar(registro())).dados.status, "ja-registrado");
  rpcHandlers.registrar_captura = () => ({ status: "conflito", motivo: "lead" });
  assert.deepEqual(await chamar(registro()), { status: 409, dados: { erro: "conflito", motivo: "lead" } });
});

Deno.test("registrar: valida os campos antes de tocar no banco", opcoes, async () => {
  const ruins: Array<[string, Linha, number]> = [
    ["avaliacao_id inválido", { avaliacao_id: "x" }, 400],
    ["lead_id inválido", { lead_id: "x" }, 400],
    ["chave curta", { chave: "curta" }, 400],
    ["ambiente inventado", { ambiente: "prod" }, 400],
    ["nome de um caractere", { nome: "M" }, 422],
    ["nome com 121 caracteres", { nome: "n".repeat(121) }, 422],
    ["e-mail sem arroba", { email: "maria.empresa.com" }, 422],
    ["e-mail com 201 caracteres", { email: `${"a".repeat(195)}@x.com` }, 422],
    ["código com mais de 400 caracteres", { codigo: `${CODIGO_V2}&${"x".repeat(400)}` }, 413],
    ["código de outra avaliação", { avaliacao_id: "00000000-0000-4000-8000-000000000001" }, 422],
    ["código adulterado", { codigo: CODIGO_V2.replace("e=empresa", "e=governo") }, 422],
    ["método desconhecido", { codigo: CODIGO_V2.replace("m=1", "m=9") }, 422],
    ["formato desconhecido", { codigo: CODIGO_V2.replace("v=2", "v=3") }, 422],
    ["código vazio", { codigo: "" }, 422],
  ];
  for (const [nome, extra, esperado] of ruins) {
    zerar();
    const r = await chamar(registro(extra));
    assert.equal(r.status, esperado, nome);
    assert.equal(chamadas("registrar_captura").length, 0, `${nome}: não pode chegar ao banco`);
  }
});

Deno.test("registrar: limite por IP e global", opcoes, async () => {
  zerar();
  banco.contadores.set("registrar:global", 600);
  assert.deepEqual(await chamar(registro()), { status: 429, dados: { erro: "limite" } });
  assert.equal(chamadas("registrar_captura").length, 0);
  zerar();
  for (let i = 0; i < 30; i++) assert.equal((await chamar(registro())).status, 200);
  assert.equal((await chamar(registro())).status, 429);
  // Cada IP tem a sua conta (guardada só em hash).
  const outro = await chamar(registro(), { "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
  assert.equal(outro.status, 200);
  assert.equal(
    [...banco.contadores.keys()].some((k) => k.includes("203.0.113.9")),
    false,
    "o IP não é gravado",
  );
});

Deno.test(
  "registrar: banco fora do ar é 502 (vale tentar de novo) e dado recusado é 422 (definitivo)",
  opcoes,
  async () => {
    zerar();
    rpcHandlers.registrar_captura = () => json({ message: "fora do ar" }, 503);
    assert.deepEqual(await chamar(registro()), { status: 502, dados: { erro: "banco" } });
    rpcHandlers.registrar_captura = () => json({ code: "23514", message: "check" }, 400);
    assert.deepEqual(await chamar(registro()), { status: 422, dados: { erro: "dados" } });
  },
);

const completo = (extra: Linha = {}) => ({
  acao: "completar",
  avaliacao_id: AVALIACAO,
  lead_id: NOVO,
  chave: CHAVE,
  empresa: "  Empresa   Nova  ",
  whatsapp: "5585999990000",
  pediu_contato: true,
  marketing: false,
  ...extra,
});

Deno.test(
  "completar: registra os consentimentos desta etapa, com eventos repetíveis, e a chave só em hash",
  opcoes,
  async () => {
    zerar();
    const r = await chamar(completo());
    assert.deepEqual(r, { status: 200, dados: { status: "completado" } });
    const { p } = ultima("completar_captura") as { p: Linha & { consentimentos: Linha[] } };
    assert.equal(p.chave_hash, HASH_DA_CHAVE);
    assert.equal(JSON.stringify(banco.rpcs).includes(CHAVE), false);
    assert.equal(p.empresa, "Empresa Nova");
    assert.equal(p.whatsapp, "5585999990000");
    assert.deepEqual(
      p.consentimentos.map((e) => `${e.finalidade}/${e.canal}`),
      ["relatorio-email/email", "contato-analise/email", "contato-analise/whatsapp", "contato-analise/ligacao"],
    );
    assert.equal(
      p.consentimentos.every(
        (e) => e.concedido === true && e.fonte === "formulario" && e.texto_versao === "2026-11-01",
      ),
      true,
    );
    await chamar(completo());
    const [a, b] = chamadas("completar_captura").map((c) =>
      ((c.args.p as Linha).consentimentos as Linha[]).map((e) => e.evento_id),
    );
    assert.deepEqual(a, b);
  },
);

Deno.test(
  "completar: sem pedir contato só há o relatório; sem número não há WhatsApp nem ligação",
  opcoes,
  async () => {
    zerar();
    await chamar(completo({ pediu_contato: false, whatsapp: "" }));
    assert.deepEqual(
      (ultima("completar_captura").p as { consentimentos: Linha[] }).consentimentos.map(
        (e) => `${e.finalidade}/${e.canal}`,
      ),
      ["relatorio-email/email"],
    );
    zerar();
    await chamar(completo({ whatsapp: "", marketing: true }));
    assert.deepEqual(
      (ultima("completar_captura").p as { consentimentos: Linha[] }).consentimentos.map(
        (e) => `${e.finalidade}/${e.canal}`,
      ),
      ["relatorio-email/email", "contato-analise/email", "conteudo-email/email"],
    );
  },
);

Deno.test("completar: chave errada é recusada e os campos são validados", opcoes, async () => {
  zerar();
  rpcHandlers.completar_captura = () => ({ status: "nao-autorizado" });
  assert.deepEqual(await chamar(completo()), { status: 403, dados: { erro: "nao-autorizado" } });
  for (const [nome, extra, esperado] of [
    ["empresa vazia", { empresa: "   " }, 422],
    ["empresa com 161 caracteres", { empresa: "e".repeat(161) }, 422],
    ["WhatsApp fora do padrão", { whatsapp: "(85) 99999-0000" }, 422],
    ["chave curta", { chave: "x" }, 400],
    ["lead_id inválido", { lead_id: "x" }, 400],
  ] as Array<[string, Linha, number]>) {
    zerar();
    assert.equal((await chamar(completo(extra))).status, esperado, nome);
    assert.equal(chamadas("completar_captura").length, 0, nome);
  }
});

const aprofundamento = (extra: Linha = {}) => ({
  area: "vendas",
  camada: 2,
  revisao: 2,
  rotina: "propostas",
  volume: 200,
  unidade: "propostas",
  periodo: "mes",
  consequencia: "retrabalho",
  minutos: 15,
  ...extra,
});
const aprofundar = (extra: Linha = {}, topo: Linha = {}) => ({
  acao: "aprofundar",
  lead_id: NOVO,
  chave: CHAVE,
  aprofundamento: aprofundamento(extra),
  ...topo,
});

Deno.test(
  "aprofundar: valida com o mesmo código do site, grava e devolve o esforço (200 × 15 ÷ 60 = 50 h)",
  opcoes,
  async () => {
    zerar();
    const r = await chamar(aprofundar());
    assert.equal(r.status, 200);
    assert.equal(r.dados.status, "gravado");
    assert.deepEqual(r.dados.esforco, {
      calculavel: true,
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
      minutos: 15,
      horas: 50,
    });
    const { p } = ultima("gravar_aprofundamento") as { p: Linha };
    assert.equal(p.chave_hash, HASH_DA_CHAVE);
    assert.equal(p.lead_id, NOVO);
    assert.equal(p.rotina, "propostas");
    assert.equal(p.volume, 200);
    assert.equal(p.minutos, 15);
    assert.equal(JSON.stringify(banco.rpcs).includes(CHAVE), false);
  },
);

Deno.test("aprofundar: dado inválido não chega ao banco; chave errada é 403", opcoes, async () => {
  zerar();
  for (const [nome, extra] of [
    ["volume zero", { volume: 0 }],
    ["volume acima do limite", { volume: 100_001 }],
    ["minutos acima do limite", { minutos: 601 }],
    ["rotina de outra área", { rotina: "campanhas" }],
    ["contato digitado no texto", { rotina: "outra", rotinaOutra: "falar com ana@empresa.com.br" }],
    ["unidade grande demais", { unidade: "u".repeat(41) }],
  ] as Array<[string, Linha]>) {
    const r = await chamar(aprofundar(extra));
    assert.equal(r.status, 422, nome);
    assert.ok(r.dados.campos, nome);
  }
  assert.equal(chamadas("gravar_aprofundamento").length, 0);
  rpcHandlers.gravar_aprofundamento = () => ({ status: "nao-autorizado" });
  assert.deepEqual(await chamar(aprofundar()), { status: 403, dados: { erro: "nao-autorizado" } });
  rpcHandlers.gravar_aprofundamento = () => ({ status: "ignorado", revisao: 5 });
  const velho = await chamar(aprofundar({ revisao: 1 }));
  assert.deepEqual([velho.dados.status, velho.dados.revisao], ["ignorado", 5]);
});

Deno.test("status: só com a chave certa, sem texto de erro, e processando aparece como pendente", opcoes, async () => {
  zerar();
  banco.tarefas.length = 0;
  assert.deepEqual(await chamar({ acao: "status", lead_id: NOVO, chave: CHAVE }), {
    status: 403,
    dados: { erro: "nao-autorizado" },
  });
  assert.deepEqual(await chamar({ acao: "status", lead_id: LEAD_NOVO, chave: "x".repeat(43) }), {
    status: 403,
    dados: { erro: "nao-autorizado" },
  });
  assert.deepEqual((await chamar({ acao: "status", lead_id: LEAD_NOVO, chave: CHAVE })).dados, {
    relatorio_email: { estado: "nao-pedido" },
  });
  banco.tarefas.push({
    lead_id: LEAD_NOVO,
    tipo: "email-relatorio",
    status: "processando",
    tentativas: 1,
    max_tentativas: 5,
    tentar_em: "2026-11-01T10:00:00Z",
    ultimo_erro: "segredo interno",
  });
  let r = await chamar({ acao: "status", lead_id: LEAD_NOVO, chave: CHAVE });
  assert.deepEqual(r.dados, { relatorio_email: { estado: "pendente", tentativas: 1, maximo: 5, proxima_em: null } });
  assert.equal(JSON.stringify(r.dados).includes("segredo"), false);
  banco.tarefas[0].status = "nova-tentativa";
  r = await chamar({ acao: "status", lead_id: LEAD_NOVO, chave: CHAVE });
  assert.deepEqual(r.dados, {
    relatorio_email: { estado: "nova-tentativa", tentativas: 1, maximo: 5, proxima_em: "2026-11-01T10:00:00Z" },
  });
  banco.tarefas[0].status = "aceito";
  assert.equal(
    ((await chamar({ acao: "status", lead_id: LEAD_NOVO, chave: CHAVE })).dados.relatorio_email as Linha).estado,
    "aceito",
  );
  banco.tarefas.length = 0;
});

Deno.test("processar: só com o segredo do agendador ou com um admin", opcoes, async () => {
  zerar();
  assert.equal((await chamar({ acao: "processar" })).status, 401);
  assert.equal((await chamar({ acao: "processar" }, { "x-processador": "errado-errado-errado" })).status, 401);
  assert.equal((await chamar({ acao: "processar" }, { Authorization: "Bearer outro" })).status, 401);
  assert.deepEqual(await chamar({ acao: "processar" }, SEGREDO), { status: 200, dados: { processadas: 0, falhas: 0 } });
  assert.equal((await chamar({ acao: "processar" }, { Authorization: "Bearer token-admin" })).status, 200);
});

// Tarefa de e-mail do lead novo, com o Resend simulado.
const TAREFA = {
  id: "tarefa-1",
  tipo: "email-relatorio",
  lead_id: LEAD_NOVO,
  status: "processando",
  tentativas: 1,
  max_tentativas: 5,
};
function prepararEmail(tarefa: Linha = TAREFA) {
  zerar();
  Deno.env.set("RESEND_API_KEY", "re_teste");
  Deno.env.set("EMAIL_REMETENTE", "Reset IA <contato@resetia.com.br>");
  banco.elegiveis.add(`${LEAD_NOVO}|relatorio-email|email`);
  rpcHandlers.pegar_tarefas = () => [tarefa];
}
const concluida = () => chamadas("concluir_tarefa").at(-1)!.args as Linha;

Deno.test(
  "tarefa de e-mail: aceito pelo provedor com chave de idempotência, id guardado e nada de id no link",
  opcoes,
  async () => {
    prepararEmail();
    const r = await chamar({ acao: "processar" }, SEGREDO);
    assert.deepEqual(r.dados, { processadas: 1, falhas: 0 });
    assert.equal(banco.envios.length, 1);
    assert.equal(banco.envios[0].cabecalhos.get("idempotency-key"), "tarefa:tarefa-1");
    assert.equal(banco.envios[0].cabecalhos.get("authorization"), "Bearer re_teste");
    assert.deepEqual(banco.envios[0].corpo.to, ["ana@empresa.com.br"]);
    const html = String(banco.envios[0].corpo.html);
    assert.equal(html.includes("lead="), false, "lead novo: o id não vai no link");
    assert.equal(html.includes(LEAD_NOVO), false);
    // O acesso é um token por finalidade: só o hash vai ao banco, com a validade de cada um.
    const [, tokenLeitura] = html.match(/resultado\/#[^"]*?&amp;k=([A-Za-z0-9_-]{43})"/) ?? [];
    const [, tokenPreferencias] = html.match(/preferencias\/#k=([A-Za-z0-9_-]{43})"/) ?? [];
    assert.ok(
      tokenLeitura && tokenPreferencias && tokenLeitura !== tokenPreferencias,
      "dois tokens distintos no e-mail",
    );
    assert.deepEqual(
      chamadas("criar_token").map((c) => [c.args.p_finalidade, c.args.p_dias, c.args.p_hash, c.args.p_lead]),
      [
        ["ler-relatorio", 180, await hashDe(tokenLeitura), LEAD_NOVO],
        ["preferencias", 365, await hashDe(tokenPreferencias), LEAD_NOVO],
      ],
    );
    for (const c of chamadas("criar_token")) assert.equal(JSON.stringify(c.args).includes(tokenLeitura), false);
    assert.deepEqual(
      [concluida().p_status, concluida().p_provedor_id, concluida().p_id],
      ["aceito", "re_123", "tarefa-1"],
    );
    assert.deepEqual(banco.emails.at(-1), {
      lead_id: LEAD_NOVO,
      tipo: "relatorio",
      assunto: "Seu RESET AI Score: 28/100, nível Explorando",
      status: "aceito",
      erro: null,
      autor: "sistema",
      tarefa_id: "tarefa-1",
      provedor_id: "re_123",
    });
    assert.match(String(banco.atividades.at(-1)?.texto), /aceito pelo provedor/);
    assert.notEqual(banco.leads.find((l) => l.id === LEAD_NOVO)?.relatorio_enviado_em, null);
  },
);

Deno.test("tarefa de e-mail: nem o lead antigo leva o id no link; o token não amplia a exposição", opcoes, async () => {
  prepararEmail({ ...TAREFA, lead_id: LEAD });
  banco.elegiveis.add(`${LEAD}|relatorio-email|email`);
  await chamar({ acao: "processar" }, SEGREDO);
  const html = String(banco.envios[0].corpo.html);
  assert.equal(html.includes("lead="), false);
  assert.match(html, /&amp;k=[A-Za-z0-9_-]{43}"/);
});

Deno.test(
  "tarefa de e-mail: sem conseguir criar o token, nada é enviado e a tarefa tenta de novo",
  opcoes,
  async () => {
    prepararEmail();
    rpcHandlers.criar_token = () => json({ message: "fora do ar" }, 503);
    try {
      await chamar({ acao: "processar" }, SEGREDO);
    } finally {
      rpcHandlers.criar_token = () => null;
    }
    assert.equal(banco.envios.length, 0);
    assert.deepEqual([concluida().p_status, concluida().p_erro], ["nova-tentativa", "banco indisponível"]);
  },
);

Deno.test(
  "tarefa de e-mail: falha transitória tenta de novo, definitiva para, e nada é marcado como enviado",
  opcoes,
  async () => {
    const casos: Array<[string, number, Linha, string, string]> = [
      ["erro do servidor", 500, { name: "application_error" }, "nova-tentativa", "60 seconds"],
      ["limite do provedor", 429, { name: "rate_limit_exceeded" }, "nova-tentativa", "60 seconds"],
      ["requisição simultânea", 409, { name: "concurrent_idempotent_requests" }, "nova-tentativa", "60 seconds"],
      ["chave de idempotência com outro conteúdo", 409, { name: "invalid_idempotent_request" }, "falhou", "60 seconds"],
      ["dado recusado", 422, { name: "validation_error", message: "to inválido" }, "falhou", "60 seconds"],
      ["chave de API inválida", 401, { name: "missing_api_key" }, "falhou", "60 seconds"],
    ];
    for (const [nome, status, corpo, esperado] of casos) {
      prepararEmail();
      banco.resend = { status, corpo, atrasoMs: 0 };
      await chamar({ acao: "processar" }, SEGREDO);
      assert.equal(concluida().p_status, esperado, nome);
      assert.equal(
        banco.leads.find((l) => l.id === LEAD_NOVO)?.relatorio_enviado_em,
        null,
        `${nome}: não marca como enviado`,
      );
      assert.equal(banco.emails.at(-1)?.status, "falhou", nome);
      assert.equal(banco.emails.at(-1)?.provedor_id, null, nome);
      assert.equal(banco.atividades.length, 0, nome);
    }
  },
);

Deno.test(
  "tarefa de e-mail: tempo esgotado vira nova tentativa com a mesma chave de idempotência",
  opcoes,
  async () => {
    prepararEmail();
    banco.resend = { status: 200, corpo: { id: "re_lento" }, atrasoMs: 1200 };
    await chamar({ acao: "processar" }, SEGREDO);
    assert.equal(concluida().p_status, "nova-tentativa");
    assert.equal(banco.envios[0].cabecalhos.get("idempotency-key"), "tarefa:tarefa-1");
    assert.equal(banco.leads.find((l) => l.id === LEAD_NOVO)?.relatorio_enviado_em, null);
  },
);

Deno.test("tarefa de e-mail: espera crescente entre as tentativas", opcoes, async () => {
  const esperas: string[] = [];
  for (const tentativas of [1, 2, 3, 4, 5, 6]) {
    prepararEmail({ ...TAREFA, tentativas });
    banco.resend = { status: 500, corpo: {}, atrasoMs: 0 };
    await chamar({ acao: "processar" }, SEGREDO);
    esperas.push(String(concluida().p_em));
  }
  assert.deepEqual(esperas, [
    "60 seconds",
    "300 seconds",
    "1200 seconds",
    "3600 seconds",
    "7200 seconds",
    "7200 seconds",
  ]);
});

Deno.test("tarefa de e-mail: sem provedor configurado, sem consentimento, sem empresa e limites", opcoes, async () => {
  // Sem RESEND_API_KEY: nada é enviado e o estado diz isso.
  prepararEmail();
  Deno.env.delete("RESEND_API_KEY");
  await chamar({ acao: "processar" }, SEGREDO);
  assert.equal(concluida().p_status, "nao-configurado");
  assert.equal(banco.envios.length, 0);
  assert.equal(banco.emails.at(-1)?.status, "nao-configurado");

  // Sem consentimento para o relatório por e-mail: cancelada, e o provedor nem é chamado.
  prepararEmail();
  banco.elegiveis.clear();
  await chamar({ acao: "processar" }, SEGREDO);
  assert.equal(concluida().p_status, "cancelada");
  assert.match(String(concluida().p_erro), /consentimento/);
  assert.equal(banco.envios.length, 0);

  // Banco indisponível na hora de conferir o consentimento: tenta de novo (nunca envia sem conferir).
  prepararEmail();
  rpcHandlers.elegivel = () => json({ message: "fora do ar" }, 503);
  await chamar({ acao: "processar" }, SEGREDO);
  assert.equal(concluida().p_status, "nova-tentativa");
  assert.equal(banco.envios.length, 0);
  rpcHandlers.elegivel = (a) => banco.elegiveis.has(`${a.p_lead}|${a.p_finalidade}|${a.p_canal}`);

  // Lead sem empresa (a etapa 2 não foi feita): cancelada.
  prepararEmail({ ...TAREFA, lead_id: SEM_EMPRESA });
  await chamar({ acao: "processar" }, SEGREDO);
  assert.equal(concluida().p_status, "cancelada");

  // Limite diário por endereço (só na primeira tentativa) e limite por hora.
  prepararEmail();
  banco.contadores.set(`relatorio:end:${await sha256("ana@empresa.com.br")}`, 3);
  await chamar({ acao: "processar" }, SEGREDO);
  assert.equal(concluida().p_status, "limite");
  assert.equal(banco.envios.length, 0);
  prepararEmail();
  banco.contadores.set("relatorio:global", 2);
  await chamar({ acao: "processar" }, SEGREDO);
  assert.deepEqual([concluida().p_status, concluida().p_em], ["nova-tentativa", "1800 seconds"]);
  assert.equal(banco.envios.length, 0);
});

Deno.test("tarefa de dicas: aquece as dicas da avaliação e conclui", opcoes, async () => {
  zerar();
  rpcHandlers.pegar_tarefas = () => [{ ...TAREFA, id: "tarefa-d", tipo: "dicas" }];
  await chamar({ acao: "processar" }, SEGREDO);
  assert.deepEqual([concluida().p_status, concluida().p_id], ["concluida", "tarefa-d"]);
});

Deno.test(
  "lead novo (com chave): as dicas exigem a chave e o envio do relatório é por tarefa, não por pedido",
  opcoes,
  async () => {
    zerar();
    const par2 = { avaliacao_id: AVALIACAO, lead_id: LEAD_NOVO };
    assert.deepEqual(await chamar({ acao: "dicas", ...par2 }), { status: 403, dados: { erro: "nao-autorizado" } });
    assert.equal((await chamar({ acao: "dicas", ...par2, chave: "x".repeat(43) })).status, 403);
    assert.equal((await chamar({ acao: "dicas", ...par2, chave: CHAVE })).status, 200);
    assert.deepEqual(await chamar({ acao: "enviar-relatorio", ...par2, chave: CHAVE }), {
      status: 409,
      dados: { erro: "use-status" },
    });
    assert.equal(banco.envios.length, 0);
  },
);

Deno.test("lead antigo: se o provedor não responde, o relatório não fica marcado como enviado", opcoes, async () => {
  zerar();
  Deno.env.set("RESEND_API_KEY", "re_teste");
  Deno.env.set("EMAIL_REMETENTE", "Reset IA <contato@resetia.com.br>");
  banco.resend = { status: 200, corpo: { id: "x" }, atrasoMs: 1200 };
  const r = await chamar({ acao: "enviar-relatorio", ...par });
  assert.deepEqual(r.dados, { status: "falhou" });
  assert.equal(banco.leads[0].relatorio_enviado_em, null);
  assert.equal(banco.emails.at(-1)?.status, "falhou");
  // Com o provedor respondendo, o cliente antigo continua recebendo "enviado".
  zerar();
  Deno.env.set("RESEND_API_KEY", "re_teste");
  Deno.env.set("EMAIL_REMETENTE", "Reset IA <contato@resetia.com.br>");
  assert.deepEqual((await chamar({ acao: "enviar-relatorio", ...par })).dados, { status: "enviado" });
  assert.notEqual(banco.leads[0].relatorio_enviado_em, null);
  assert.equal(banco.emails.at(-1)?.status, "aceito");
  assert.equal(banco.emails.at(-1)?.provedor_id, "re_123");
  banco.leads[0].relatorio_enviado_em = null;
});

const conclusao = (extra: Linha = {}) => ({
  acao: "concluir",
  avaliacao_id: AVALIACAO,
  codigo: CODIGO_V2,
  ambiente: "dev",
  origem: { utm_source: "linkedin" },
  ...extra,
});

Deno.test("concluir: grava só a avaliação, com a nota recalculada aqui e o código canônico", opcoes, async () => {
  zerar();
  const r = await chamar(conclusao({ indice: 100, nivel: "avancada", codigo: `${CODIGO_V2}&k=${"t".repeat(43)}` }));
  assert.deepEqual([r.status, r.dados.status, r.dados.nota], [200, "registrado", 28]);
  const { p } = ultima("registrar_avaliacao") as { p: Linha };
  assert.equal(p.indice, 28);
  assert.equal(p.nivel, "explorando");
  assert.equal(p.codigo, CODIGO_V2);
  assert.equal(p.versao_metodo, "1");
  assert.equal(chamadas("registrar_captura").length, 0, "nenhum lead é criado");
  assert.equal(JSON.stringify(banco.rpcs).includes("lead_id"), false);
});

Deno.test(
  "concluir: campos inválidos não chegam ao banco; conflito é 409; limite é 429; banco fora é 502",
  opcoes,
  async () => {
    for (const [nome, extra, esperado] of [
      ["avaliacao_id inválido", { avaliacao_id: "x" }, 400],
      ["ambiente inventado", { ambiente: "prod" }, 400],
      ["código de outra avaliação", { avaliacao_id: "00000000-0000-4000-8000-000000000001" }, 422],
      ["código adulterado", { codigo: CODIGO_V2.replace("e=empresa", "e=governo") }, 422],
      ["código grande demais", { codigo: `${CODIGO_V2}&${"x".repeat(400)}` }, 413],
    ] as Array<[string, Linha, number]>) {
      zerar();
      assert.equal((await chamar(conclusao(extra))).status, esperado, nome);
      assert.equal(chamadas("registrar_avaliacao").length, 0, nome);
    }
    zerar();
    rpcHandlers.registrar_avaliacao = () => ({ status: "conflito", motivo: "avaliacao" });
    assert.deepEqual(await chamar(conclusao()), { status: 409, dados: { erro: "conflito", motivo: "avaliacao" } });
    rpcHandlers.registrar_avaliacao = () => json({ message: "fora" }, 503);
    assert.deepEqual(await chamar(conclusao()), { status: 502, dados: { erro: "banco" } });
    zerar();
    banco.contadores.set("concluir:global", 1200);
    assert.deepEqual(await chamar(conclusao()), { status: 429, dados: { erro: "limite" } });
  },
);
