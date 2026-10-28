// Teste de integração da função ai-score (Deno): sobe um mock da REST do Supabase, do GoTrue e da API da
// Anthropic, importa a função de verdade e confere as três ações. Sem rede externa: sem RESEND_API_KEY, o
// e-mail fica em "nao-configurado". Rodar com `npm run test:funcao`.
import assert from "node:assert/strict";

const AVALIACAO = "00000000-0000-4000-8000-000000000000";
const LEAD = "11111111-1111-4111-8111-111111111111";
const SEM_EMPRESA = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
// Empresa de serviços B2B com processos, dados, governança e resultados abaixo de 40.
const CODIGO =
  "v=1&e=empresa&p=ceo&t=50-199&s=servicos-b2b&r=322221211x1x&a=marketing,vendas&am=2112&av=1201&d=repetitivas,governanca&h=3-meses&id=00000000-0000-4000-8000-000000000000";
const DICA_BOA =
  "Escolha um responsável pela dimensão e combine com as equipes um primeiro passo simples para as próximas semanas.";
const DICA_RUIM = "Reduza em 30 dias o retrabalho com o ChatGPT.";

type Linha = Record<string, unknown>;
const banco = {
  leads: [
    { id: LEAD, avaliacao_id: AVALIACAO, nome: "Maria Teste", email: "maria@empresa.com.br", empresa: "Empresa Teste" },
    { id: SEM_EMPRESA, avaliacao_id: AVALIACAO, nome: "Sem Empresa", email: "s@e.com.br", empresa: null },
  ].map((l) => ({ ...l, relatorio_enviado_em: null })) as Linha[],
  dicas: new Map<string, Linha>(),
  emails: [] as Linha[],
  atividades: [] as Linha[],
  mensagens: [] as Array<{ cabecalhos: Headers; corpo: Linha }>,
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

  const tabela = u.pathname.replace("/rest/v1/", "");
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
      (l) => l.id === valor(q, "id") && (!q.has("avaliacao_id") || l.avaliacao_id === valor(q, "avaliacao_id")),
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
  assert.deepEqual((await chamar(corpo, admin)).dados, { status: "nao-configurado" });
  assert.equal(banco.emails.at(-1)?.autor, "admin@resetia.com.br");
});
