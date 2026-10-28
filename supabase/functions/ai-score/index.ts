// Função do RESET AI Score (Supabase Edge Function, Deno). Três ações, por POST JSON {acao, ...}:
//   dicas             {avaliacao_id, lead_id} -> dicas de evolução para as dimensões de nota baixa.
//   enviar-relatorio  {avaliacao_id, lead_id} -> envia o relatório completo por e-mail ao lead (uma vez).
//   email-reset       {lead_id, assunto, corpo} + token de um admin -> envia o e-mail sobre a Reset IA.
// Dicas: um agente escritor e um agente revisor (Claude), saída em JSON com esquema, e um validador em código
// (nucleo.js, o mesmo código do site) que descarta números, marcas e promessas; sem chave ou com falha, a
// biblioteca de dicas. Os agentes só recebem fatos estruturados (alternativas escolhidas, notas, rótulos):
// nenhum texto digitado por quem respondeu entra no prompt.
// Segredos (Supabase -> Edge Functions -> Secrets): ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_REMETENTE
// ("Reset IA <contato@resetia.com.br>"), EMAIL_RESPOSTA (opcional), SITE_URL (opcional), DICAS_POR_HORA e
// RELATORIOS_POR_HORA (opcionais, limites contra abuso). SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY vêm do Supabase.
// Limites: qualquer pessoa cria um lead (o anônimo insere), então a função limita gerações por IA e e-mails de
// relatório por hora, e no máximo três relatórios por endereço por dia; acima disso, biblioteca e "limite".
import Anthropic from "npm:@anthropic-ai/sdk@1.3.0";
import * as nucleo from "./nucleo.js";

const env = (k: string) => Deno.env.get(k) ?? "";
const SUPABASE_URL = env("SUPABASE_URL");
const SERVICO = env("SUPABASE_SERVICE_ROLE_KEY");
const SITE = (env("SITE_URL") || "https://www.resetia.com.br").replace(/\/$/, "");
const MODELO = "claude-opus-5-5";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const limite = (k: string, padrao: number) => (Number(env(k)) > 0 ? Number(env(k)) : padrao);
const DICAS_POR_HORA = limite("DICAS_POR_HORA", 20);
const RELATORIOS_POR_HORA = limite("RELATORIOS_POR_HORA", 30);
const RELATORIOS_POR_ENDERECO_DIA = 3;
const desde = (ms: number) => encodeURIComponent(new Date(Date.now() - ms).toISOString());

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
const espera = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

/** REST do próprio projeto com a chave de serviço (a função passa por cima do RLS, com cuidado). */
function rest(caminho: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    ...init,
    headers: {
      apikey: SERVICO,
      Authorization: `Bearer ${SERVICO}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

/** Quantas linhas um filtro da REST encontra (Content-Range). Na dúvida, "muitas": o limite vale. */
async function contar(caminho: string) {
  const r = await rest(caminho, { headers: { Prefer: "count=exact", Range: "0-0" } });
  const total = Number((r.headers.get("content-range") ?? "").split("/")[1]);
  return r.ok && Number.isFinite(total) ? total : Number.POSITIVE_INFINITY;
}

type Lead = {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  relatorio_enviado_em: string | null;
  avaliacao: { id: string; codigo: string } | null;
};

async function carregarLead(leadId: string, avaliacaoId?: string): Promise<Lead | null> {
  if (!UUID.test(leadId) || (avaliacaoId !== undefined && !UUID.test(avaliacaoId))) return null;
  const filtro = avaliacaoId ? `&avaliacao_id=eq.${avaliacaoId}` : "";
  const r = await rest(
    `leads?id=eq.${leadId}${filtro}&select=id,nome,email,empresa,relatorio_enviado_em,avaliacao:avaliacoes(id,codigo)`,
  );
  if (!r.ok) return null;
  const [lead] = (await r.json()) as Lead[];
  return lead ?? null;
}

function analisarLead(lead: Lead) {
  const r = lead.avaliacao ? nucleo.decodificar(lead.avaliacao.codigo) : null;
  if (!lead.avaliacao || !nucleo.completas(r)) return null;
  const respostas = { ...r, id: lead.avaliacao.id };
  const resultado = nucleo.calcular(respostas);
  const rec = nucleo.recomendar(resultado, respostas.desafios);
  return { respostas, resultado, rec, analise: nucleo.analisar(respostas, resultado, rec) };
}

// Dicas -------------------------------------------------------------------------------------------------------

/** Escritor e revisor: a mesma chamada com instruções diferentes; JSON garantido pelo esquema. */
async function gerarComIa(fatos: unknown, alvos: string[]) {
  const chave = env("ANTHROPIC_API_KEY");
  if (!chave) return null;
  // Duas chamadas de até 55 s cabem no limite de 150 s da função.
  const cliente = new Anthropic({ apiKey: chave, timeout: 55_000, maxRetries: 0 });
  const esquema = nucleo.esquemaDicas(alvos);

  async function pedir(sistema: string, conteudo: string) {
    // fallbacks "default": se o modelo recusar, o próprio servidor tenta o modelo recomendado para o caso.
    const r = await cliente.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: esquema } },
      system: sistema,
      messages: [{ role: "user", content: conteudo }],
    } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);
    if (r.stop_reason !== "end_turn") return null;
    const texto = r.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
    if (!texto) return null;
    try {
      return JSON.parse(texto) as unknown;
    } catch {
      return null;
    }
  }

  const fatosJson = JSON.stringify(fatos, null, 2);
  const rascunho = await pedir(nucleo.instrucoes.escritor, `Fatos:\n${fatosJson}`);
  if (!rascunho) return null;
  const revisado = await pedir(
    nucleo.instrucoes.revisor,
    `Fatos:\n${fatosJson}\n\nDicas do escritor:\n${JSON.stringify(rascunho, null, 2)}`,
  );
  if (!revisado) return null;
  return nucleo.validarDicas(revisado, alvos);
}

/**
 * Dicas de uma avaliação, geradas uma vez e guardadas em public.dicas. Uma linha "gerando" serve de trava para
 * que a tela e o e-mail não gerem em dobro. Só o que veio da IA fica guardado: sem chave ou com falha, devolve
 * a biblioteca e tenta de novo na próxima vez.
 */
async function obterDicas(avaliacaoId: string, a: NonNullable<ReturnType<typeof analisarLead>>) {
  const alvos = nucleo.alvosDasDicas(a.resultado);
  const biblioteca = () => nucleo.montarDicas(a.respostas, alvos);
  if (!alvos.length) return biblioteca();
  if (!env("ANTHROPIC_API_KEY")) return biblioteca();

  for (let tentativa = 0; tentativa < 25; tentativa++) {
    const [linha] = (await (
      await rest(`dicas?avaliacao_id=eq.${avaliacaoId}&select=fonte,conteudo,criado_em`)
    ).json()) as Array<{
      fonte: string;
      conteudo: unknown;
      criado_em: string;
    }>;
    if (linha?.conteudo) return linha.conteudo;
    if (linha && Date.now() - Date.parse(linha.criado_em) < 90_000) {
      await espera(2000);
      continue;
    }
    if (linha) await rest(`dicas?avaliacao_id=eq.${avaliacaoId}`, { method: "DELETE" });
    if ((await contar(`dicas?criado_em=gte.${desde(3_600_000)}&select=avaliacao_id`)) >= DICAS_POR_HORA) {
      console.warn("dicas: limite por hora atingido; usando a biblioteca");
      return biblioteca();
    }
    const trava = await rest("dicas", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ avaliacao_id: avaliacaoId, fonte: "gerando" }),
    });
    if (!trava.ok) {
      await espera(1000);
      continue;
    }
    let daIa: Awaited<ReturnType<typeof gerarComIa>> = null;
    try {
      daIa = await gerarComIa(nucleo.fatosParaDicas(a.respostas, a.resultado, alvos), alvos);
    } catch (erro) {
      console.error("dicas: falha na IA", erro instanceof Error ? erro.message : erro);
    }
    const dicas = nucleo.montarDicas(a.respostas, alvos, daIa ?? {}, daIa ? MODELO : undefined);
    if (dicas.fonte === "biblioteca") {
      await rest(`dicas?avaliacao_id=eq.${avaliacaoId}`, { method: "DELETE" });
    } else {
      await rest(`dicas?avaliacao_id=eq.${avaliacaoId}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ fonte: "ia", modelo: MODELO, conteudo: dicas }),
      });
    }
    return dicas;
  }
  return biblioteca();
}

// E-mail ------------------------------------------------------------------------------------------------------

async function enviarEmail(m: { para: string; assunto: string; html: string; texto: string }) {
  const chave = env("RESEND_API_KEY");
  const de = env("EMAIL_REMETENTE");
  if (!chave || !de) return { status: "nao-configurado" as const };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: de,
      to: [m.para],
      subject: m.assunto,
      html: m.html,
      text: m.texto,
      ...(env("EMAIL_RESPOSTA") ? { reply_to: env("EMAIL_RESPOSTA") } : {}),
    }),
  });
  return r.ok ? { status: "enviado" as const } : { status: "falhou" as const, erro: (await r.text()).slice(0, 900) };
}

async function registrar(
  leadId: string,
  tipo: "relatorio" | "reset",
  assunto: string,
  envio: { status: string; erro?: string },
  autor: string,
) {
  await rest("emails", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      lead_id: leadId,
      tipo,
      assunto: assunto.slice(0, 300),
      status: envio.status,
      erro: envio.erro ?? null,
      autor,
    }),
  });
  if (envio.status === "enviado")
    await rest("atividades", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        lead_id: leadId,
        tipo: "email",
        autor,
        texto:
          tipo === "relatorio" ? `Relatório completo enviado por e-mail: ${assunto}` : `E-mail enviado: ${assunto}`,
      }),
    });
}

/** Admin: o token precisa ser de um usuário em public.admins. Devolve o e-mail dele. */
async function adminDoToken(req: Request): Promise<string | null> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const u = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICO, Authorization: `Bearer ${token}` },
  });
  if (!u.ok) return null;
  const usuario = (await u.json()) as { id?: string; email?: string };
  if (!usuario.id || !UUID.test(usuario.id)) return null;
  const r = await rest(`admins?user_id=eq.${usuario.id}&select=user_id`);
  const linhas = r.ok ? ((await r.json()) as unknown[]) : [];
  return linhas.length ? (usuario.email ?? "admin") : null;
}

// Rotas -------------------------------------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return resposta({ erro: "metodo" }, 405);
  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return resposta({ erro: "json" }, 400);
  }
  const texto = (k: string) => (typeof corpo[k] === "string" ? (corpo[k] as string) : "");

  try {
    if (corpo.acao === "dicas" || corpo.acao === "enviar-relatorio") {
      const lead = await carregarLead(texto("lead_id"), texto("avaliacao_id"));
      // O relatório completo (e as dicas) exige a etapa 2: lead com empresa.
      if (!lead?.empresa) return resposta({ erro: "lead" }, 404);
      const a = analisarLead(lead);
      if (!a) return resposta({ erro: "avaliacao" }, 422);

      if (corpo.acao === "dicas") return resposta(await obterDicas(lead.avaliacao!.id, a));

      if (lead.relatorio_enviado_em) return resposta({ status: "ja-enviado" });
      const recentes = await contar(`emails?tipo=eq.relatorio&criado_em=gte.${desde(3_600_000)}&select=id`);
      const paraEsteEndereco = await contar(
        `leads?email=eq.${encodeURIComponent(lead.email)}&relatorio_enviado_em=gte.${desde(86_400_000)}&select=id`,
      );
      if (recentes >= RELATORIOS_POR_HORA || paraEsteEndereco >= RELATORIOS_POR_ENDERECO_DIA) {
        console.warn("enviar-relatorio: limite atingido");
        return resposta({ status: "limite" });
      }
      const dicas = await obterDicas(lead.avaliacao!.id, a);
      const email = nucleo.montarEmailRelatorio({
        nome: lead.nome,
        quem: nucleo.quemDoResumo(a.respostas, lead.empresa),
        resultado: a.resultado,
        recomendacao: a.rec,
        analise: a.analise,
        dicas,
        link: nucleo.linkRelatorio(SITE, a.respostas, lead.id),
        whatsapp: nucleo.whatsappDoResultado(a.respostas),
        site: SITE,
        nomesSolucoes: nucleo.nomesSolucoes,
      });
      // Reserva atômica: só um pedido marca o lead (a tela e a fila de reenvio podem chegar juntas).
      const reserva = await rest(`leads?id=eq.${lead.id}&relatorio_enviado_em=is.null`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ relatorio_enviado_em: new Date().toISOString() }),
      });
      if (!reserva.ok || !((await reserva.json()) as unknown[]).length) return resposta({ status: "ja-enviado" });
      const envio = await enviarEmail({ para: lead.email, ...email });
      if (envio.status !== "enviado")
        await rest(`leads?id=eq.${lead.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ relatorio_enviado_em: null }),
        });
      await registrar(lead.id, "relatorio", email.assunto, envio, "sistema");
      return resposta({ status: envio.status });
    }

    if (corpo.acao === "email-reset") {
      const autor = await adminDoToken(req);
      if (!autor) return resposta({ erro: "admin" }, 401);
      const assunto = texto("assunto").trim();
      const mensagem = texto("corpo").trim();
      if (!assunto || assunto.length > 200 || !mensagem || mensagem.length > 6000)
        return resposta({ erro: "campos" }, 400);
      const lead = await carregarLead(texto("lead_id"));
      if (!lead) return resposta({ erro: "lead" }, 404);
      const r = lead.avaliacao ? nucleo.decodificar(lead.avaliacao.codigo) : null;
      const whatsapp = nucleo.completas(r) ? nucleo.whatsappDoResultado(r) : nucleo.waUrl();
      const email = nucleo.montarEmailReset({ assunto, corpo: mensagem, whatsapp, site: SITE });
      const envio = await enviarEmail({ para: lead.email, ...email });
      await registrar(lead.id, "reset", assunto, envio, autor);
      return resposta({ status: envio.status });
    }

    return resposta({ erro: "acao" }, 400);
  } catch (erro) {
    console.error("ai-score", erro instanceof Error ? erro.message : erro);
    return resposta({ erro: "interno" }, 500);
  }
});
