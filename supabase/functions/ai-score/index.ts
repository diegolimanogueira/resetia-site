// Função do RESET AI Score (Supabase Edge Function, Deno). Ações, por POST JSON {acao, ...}:
//   concluir    {avaliacao_id, codigo, ambiente, origem}                  -> terminou o questionário: grava só a avaliação (nota recalculada aqui).
//   registrar   {avaliacao_id, lead_id, chave, codigo, nome, email, ...} -> etapa 1: cria avaliação e lead (nota recalculada aqui).
//   completar   {avaliacao_id, lead_id, chave, empresa, ...}              -> etapa 2: completa o lead e enfileira o relatório por e-mail.
//   aprofundar  {lead_id, chave, aprofundamento}                          -> grava o aprofundamento de uma dor (camada 1 ou 2).
//   status      {lead_id, chave}                                          -> estado real do envio do relatório.
//   preferencias {token[, escolhas, pedido]}                              -> lê ou muda as escolhas de contato (token de preferências).
//   processar   (cabeçalho x-processador ou token de admin)               -> processa as tarefas pendentes (agendador, botão do painel).
//   dicas             {avaliacao_id, lead_id[, chave]} -> dicas de evolução para as dimensões de nota baixa.
//   enviar-relatorio  {avaliacao_id, lead_id}          -> (só lead antigo, sem chave) envia o relatório completo por e-mail.
//   email-reset       {lead_id, assunto, corpo} + token de um admin -> e-mail sobre a Reset IA, só com consentimento.
// Quem escreve num lead prova que conhece a chave que o navegador gerou; o id do lead, que é público, não autoriza
// escrita. A nota é sempre recalculada aqui, com o mesmo código do site (nucleo.js).
// Dicas: um agente escritor e um agente revisor (Claude), saída em JSON com esquema, e um validador em código
// (nucleo.js) que descarta números, marcas e promessas; sem chave ou com falha, a biblioteca de dicas. Os agentes
// só recebem fatos estruturados (alternativas escolhidas, notas, rótulos): nenhum texto digitado entra no prompt.
// Segredos (Supabase -> Edge Functions -> Secrets): ANTHROPIC_API_KEY, RESEND_API_KEY, EMAIL_REMETENTE
// ("Reset IA <contato@resetia.com.br>"), EMAIL_RESPOSTA (opcional), SITE_URL (opcional), PROCESSADOR_SEGREDO (agendador),
// e os limites opcionais DICAS_POR_HORA, RELATORIOS_POR_HORA, REGISTROS_POR_IP_HORA e REGISTROS_POR_HORA.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY vêm do Supabase.
import Anthropic from "npm:@anthropic-ai/sdk@1.3.0";
import {
  agendar,
  contar,
  cors,
  desde,
  env,
  espera,
  limite,
  resposta,
  rest,
  rpc,
  SERVICO,
  SITE,
  SUPABASE_URL,
  UUID,
} from "./base.ts";
import { aprofundar, completar, concluir, preferencias, registrar, status } from "./captura.ts";
// @ts-types="./nucleo.d.ts"
import * as nucleo from "./nucleo.js";
import { CHAVE, sha256hex } from "./seguranca.ts";
import { processar, type Dependencias, type Envio } from "./tarefas.ts";

const MODELO = "claude-opus-5-5";
const DICAS_POR_HORA = limite("DICAS_POR_HORA", 20);
const RELATORIOS_POR_HORA = limite("RELATORIOS_POR_HORA", 30);
const RELATORIOS_POR_ENDERECO_DIA = 3;
const RESEND = (env("RESEND_BASE_URL") || "https://api.resend.com").replace(/\/$/, "");

type Lead = {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  canal: string;
  chave_hash: string | null;
  relatorio_enviado_em: string | null;
  avaliacao: { id: string; codigo: string } | null;
};

async function carregarLead(leadId: string, avaliacaoId?: string): Promise<Lead | null> {
  if (!UUID.test(leadId) || (avaliacaoId !== undefined && !UUID.test(avaliacaoId))) return null;
  const filtro = avaliacaoId ? `&avaliacao_id=eq.${avaliacaoId}` : "";
  const r = await rest(
    `leads?id=eq.${leadId}${filtro}&select=id,nome,email,empresa,canal,chave_hash,relatorio_enviado_em,avaliacao:avaliacoes(id,codigo)`,
  );
  if (!r.ok) return null;
  const [lead] = (await r.json()) as Lead[];
  return lead ?? null;
}

function analisarLead(lead: { avaliacao: { id: string; codigo: string } | null }) {
  const l = lead.avaliacao ? nucleo.lerLink(lead.avaliacao.codigo) : null;
  if (!lead.avaliacao || l?.tipo !== "ok" || !nucleo.completas(l.respostas)) return null;
  const respostas = { ...l.respostas, id: lead.avaliacao.id };
  // A nota usa o método da própria avaliação (um link do formato 1 continua no método 1).
  const d = nucleo.montarDevolutiva(respostas, l);
  return { respostas, resultado: d.resultado, rec: d.recomendacao, analise: d.analise, sintese: d.sintese };
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

/**
 * Envia pelo Resend. `idempotencia` vai no cabeçalho Idempotency-Key (24 h): repetir a mesma tarefa depois de um tempo
 * esgotado não envia duas vezes. "aceito" é só o provedor ter aceito a mensagem. Falha de rede, tempo esgotado, 429,
 * 5xx e 409 de requisição simultânea valem nova tentativa; 4xx do provedor (inclusive chave já usada com outro
 * conteúdo) é definitivo.
 */
async function enviarEmail(
  m: { para: string; assunto: string; html: string; texto: string },
  idempotencia?: string,
): Promise<Envio> {
  const chave = env("RESEND_API_KEY");
  const de = env("EMAIL_REMETENTE");
  if (!chave || !de) return { status: "nao-configurado" };
  try {
    const r = await fetch(`${RESEND}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
        ...(idempotencia ? { "Idempotency-Key": idempotencia } : {}),
      },
      body: JSON.stringify({
        from: de,
        to: [m.para],
        subject: m.assunto,
        html: m.html,
        text: m.texto,
        ...(env("EMAIL_RESPOSTA") ? { reply_to: env("EMAIL_RESPOSTA") } : {}),
      }),
      signal: AbortSignal.timeout(limite("RESEND_TIMEOUT_MS", 20_000)),
    });
    const corpo = (await r.json().catch(() => ({}))) as { id?: string; name?: string; message?: string };
    if (r.ok) return { status: "aceito", id: corpo.id ?? null };
    const nome = corpo.name ?? "";
    const transitorio =
      r.status >= 500 ||
      r.status === 429 ||
      r.status === 408 ||
      (r.status === 409 && nome === "concurrent_idempotent_requests");
    return {
      status: "falhou",
      erro: `${r.status} ${nome} ${corpo.message ?? ""}`.trim().slice(0, 300),
      definitivo: !transitorio,
    };
  } catch (erro) {
    // Tempo esgotado ou rede: o provedor pode ou não ter recebido; a chave de idempotência cobre a nova tentativa.
    return { status: "falhou", erro: erro instanceof Error ? erro.name : "erro de rede", definitivo: false };
  }
}

async function registrarEmail(
  leadId: string,
  tipo: "relatorio" | "reset",
  assunto: string,
  envio: Envio,
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
      erro: envio.status === "falhou" ? envio.erro.slice(0, 900) : null,
      provedor_id: envio.status === "aceito" ? envio.id : null,
      autor,
    }),
  });
  if (envio.status === "aceito")
    await rest("atividades", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        lead_id: leadId,
        tipo: "email",
        autor,
        texto:
          tipo === "relatorio"
            ? `Relatório completo aceito pelo provedor de e-mail: ${assunto}`
            : `E-mail aceito pelo provedor: ${assunto}`,
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

/** O que o processador de tarefas usa daqui (injetado para não haver importação circular). */
const dependencias: Dependencias = {
  carregarLead: (id) => carregarLead(id),
  analisarLead,
  obterDicas: (avaliacaoId, a) => obterDicas(avaliacaoId, a),
  enviarEmail,
};

/** Agendador (cabeçalho com o segredo) ou admin logado (botão "Processar pendências" do painel). */
async function podeProcessar(req: Request) {
  const segredo = env("PROCESSADOR_SEGREDO");
  const enviado = req.headers.get("x-processador") ?? "";
  if (segredo.length >= 16 && enviado && (await sha256hex(enviado)) === (await sha256hex(segredo))) return true;
  return (await adminDoToken(req)) !== null;
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
    // Ações novas: autorizadas pela chave do lead, não pelo id.
    if (corpo.acao === "concluir") return await concluir(req, corpo);
    if (corpo.acao === "registrar") return await registrar(req, corpo);
    if (corpo.acao === "completar") return await completar(corpo, () => processar(5, dependencias));
    if (corpo.acao === "aprofundar") return await aprofundar(corpo);
    if (corpo.acao === "status") return await status(corpo);
    if (corpo.acao === "preferencias") return await preferencias(req, corpo);
    if (corpo.acao === "processar") {
      if (!(await podeProcessar(req))) return resposta({ erro: "nao-autorizado" }, 401);
      return resposta(await processar(Number(corpo.max) || 10, dependencias));
    }

    if (corpo.acao === "dicas" || corpo.acao === "enviar-relatorio") {
      const lead = await carregarLead(texto("lead_id"), texto("avaliacao_id"));
      // O relatório completo (e as dicas) exige a etapa 2: lead com empresa.
      if (!lead?.empresa) return resposta({ erro: "lead" }, 404);
      // Lead com chave: só quem a conhece; e o envio do relatório é tarefa do servidor (ver `status`).
      if (lead.chave_hash) {
        const chave = texto("chave");
        if (!CHAVE.test(chave) || (await sha256hex(chave)) !== lead.chave_hash)
          return resposta({ erro: "nao-autorizado" }, 403);
        if (corpo.acao === "enviar-relatorio") return resposta({ erro: "use-status" }, 409);
      }
      const a = analisarLead(lead);
      if (!a) return resposta({ erro: "avaliacao" }, 422);

      if (corpo.acao === "dicas") return resposta(await obterDicas(lead.avaliacao!.id, a));

      // Caminho dos clientes antigos (lead sem chave): reserva, envio e registro do que de fato aconteceu.
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
        sintese: a.sintese,
        analise: a.analise,
        dicas,
        link: nucleo.linkRelatorio(SITE, lead.avaliacao!.codigo, lead.id),
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
      // `enviarEmail` não lança, mas o que vier depois pode: em qualquer falha a reserva é desfeita, para o relatório
      // não ficar marcado como enviado sem ter saído.
      let envio: Envio;
      try {
        envio = await enviarEmail({ para: lead.email, ...email });
      } catch (erro) {
        envio = { status: "falhou", erro: erro instanceof Error ? erro.name : "erro", definitivo: false };
      }
      if (envio.status !== "aceito")
        await rest(`leads?id=eq.${lead.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ relatorio_enviado_em: null }),
        });
      await registrarEmail(lead.id, "relatorio", email.assunto, envio, "sistema");
      // Vocabulário dos clientes antigos: "enviado" quer dizer aceito pelo provedor.
      return resposta({ status: envio.status === "aceito" ? "enviado" : envio.status });
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
      // Só com consentimento registrado: pedir contato com especialista ou aceitar conteúdo, por e-mail.
      const [contato, conteudo] = await Promise.all(
        ["contato-analise", "conteudo-email"].map((p_finalidade) =>
          rpc<boolean>("elegivel", { p_lead: lead.id, p_finalidade, p_canal: "email" }),
        ),
      );
      if (contato.estado === "indisponivel" || conteudo.estado === "indisponivel")
        return resposta({ erro: "banco" }, 502);
      if (contato.dados !== true && conteudo.dados !== true) return resposta({ erro: "consentimento" }, 403);
      const l = lead.avaliacao ? nucleo.lerLink(lead.avaliacao.codigo) : null;
      const whatsapp =
        l?.tipo === "ok" && nucleo.completas(l.respostas) ? nucleo.whatsappDoResultado(l.respostas) : nucleo.waUrl();
      const email = nucleo.montarEmailReset({ assunto, corpo: mensagem, whatsapp, site: SITE });
      let envio: Envio;
      try {
        envio = await enviarEmail({ para: lead.email, ...email });
      } catch (erro) {
        envio = { status: "falhou", erro: erro instanceof Error ? erro.name : "erro", definitivo: false };
      }
      await registrarEmail(lead.id, "reset", assunto, envio, autor);
      return resposta({ status: envio.status === "aceito" ? "enviado" : envio.status });
    }

    return resposta({ erro: "acao" }, 400);
  } catch (erro) {
    console.error("ai-score", erro instanceof Error ? erro.message : erro);
    return resposta({ erro: "interno" }, 500);
  }
});
