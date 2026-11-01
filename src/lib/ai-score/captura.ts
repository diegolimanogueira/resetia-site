import { ambiente, chamarFuncao, supabase } from "@/lib/supabase";
import {
  enfileirar,
  expirados,
  proximaTentativaEm,
  proximosPendentes,
  registrarVeredito,
  type Item,
  type TipoItem,
  type Veredito,
} from "./fila";
import { track } from "@/lib/analytics";
import { atualizarLiberacao, lerOrigem, novoId, resolverAprofundamento, type EmailEstado } from "./navegador";

/**
 * Captura do navegador para a função ai-score: avaliação, contato (etapas 1 e 2) e aprofundamento. Cada pedido é
 * gravado na fila ANTES de ir à rede e é idempotente no servidor, então tentar de novo é sempre seguro. O resultado
 * diz a verdade: "aceito" só quando o servidor respondeu que aceitou; sem resposta é "pendente"; "recusado" é
 * definitivo. Quem chama não deve apresentar o contato como registrado, nem o e-mail como enviado, sem isso.
 */

export type Situacao = "aceito" | "pendente" | "recusado" | "desligado";

/** 200 aceita. Rede, tempo esgotado, 408, 429 e 5xx valem nova tentativa. Qualquer outra recusa (409, 403, 4xx) é definitiva. */
export const classificar = (r: { ok: boolean; status: number }): Veredito =>
  r.ok
    ? "aceito"
    : r.status === 0 || r.status >= 500 || r.status === 408 || r.status === 429
      ? "tentar-de-novo"
      : "recusado";

const emExecucao = new Set<string>();
let temporizador: ReturnType<typeof setTimeout> | undefined;
let gatilhos = false;

/** O que muda na tela quando um pedido é resolvido. */
function aplicar(item: Item, v: Veredito) {
  if (v === "tentar-de-novo") return;
  if (item.tipo === "registrar")
    atualizarLiberacao(item.avaliacaoId, { contato: v === "aceito" ? "aceito" : "recusado" });
  if (item.tipo === "completar" && v === "recusado") atualizarLiberacao(item.avaliacaoId, { contato: "recusado" });
  if (item.tipo === "aprofundar") resolverAprofundamento(item.avaliacaoId, item.revisao, v);
  if (item.tipo === "completar" && v === "aceito") {
    atualizarLiberacao(item.avaliacaoId, { emailEstado: "pendente" });
    const { lead_id: leadId, chave } = item.corpo as { lead_id?: string; chave?: string };
    if (leadId && chave) void acompanharEmail(item.avaliacaoId, leadId, chave);
  }
}

async function tentar(item: Item): Promise<Veredito> {
  emExecucao.add(item.id);
  try {
    const v = classificar(await chamarFuncao(item.corpo, { timeout: 20_000, keepalive: true }));
    registrarVeredito(item, v);
    aplicar(item, v);
    return v;
  } finally {
    emExecucao.delete(item.id);
    agendarProxima();
  }
}

function agendarProxima() {
  clearTimeout(temporizador);
  const ms = proximaTentativaEm();
  if (ms !== null) temporizador = setTimeout(() => void retomarFila(), Math.max(ms, 1000));
}

/**
 * Tenta o que ficou pendente: na montagem das telas, ao voltar a conexão, ao voltar para a aba e quando a espera de
 * um item vence. Uma aba por vez (navigator.locks, quando existe); pedidos repetidos são seguros de qualquer jeito.
 */
export async function retomarFila() {
  if (!supabase.ativo) return;
  iniciarGatilhos();
  for (const vencido of expirados()) aplicar(vencido, "recusado");
  const rodar = async () => {
    for (const item of proximosPendentes(Date.now(), emExecucao)) await tentar(item);
  };
  if (typeof navigator !== "undefined" && navigator.locks)
    await navigator.locks.request("resetia-ai-score-fila", { ifAvailable: true }, async (trava) => {
      if (trava) await rodar();
    });
  else await rodar();
  agendarProxima();
}

function iniciarGatilhos() {
  if (gatilhos || typeof window === "undefined") return;
  gatilhos = true;
  window.addEventListener("online", () => void retomarFila());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void retomarFila();
  });
}

async function pedir(
  tipo: TipoItem,
  avaliacaoId: string,
  leadId: string | undefined,
  corpo: Record<string, unknown>,
  revisao?: number,
): Promise<Situacao> {
  if (!supabase.ativo) return "desligado";
  iniciarGatilhos();
  const id = novoId();
  const item = enfileirar({ id, tipo, avaliacaoId, leadId, revisao, corpo, criadoEm: Date.now() });
  // Já existe um aprofundamento mais novo na fila: este, mais antigo, não substitui nem sai.
  if (item.id !== id) return "pendente";
  const v = await tentar(item);
  return v === "aceito" ? "aceito" : v === "recusado" ? "recusado" : "pendente";
}

/** Terminou o questionário: grava só a avaliação (sem lead), para medir quem concluiu sem deixar contato. */
export const concluirAvaliacao = (a: { avaliacaoId: string; codigo: string }) =>
  pedir("concluir", a.avaliacaoId, undefined, {
    acao: "concluir",
    avaliacao_id: a.avaliacaoId,
    codigo: a.codigo,
    ambiente,
    origem: lerOrigem(),
  });

/** Etapa 1: nome e e-mail. A nota é recalculada no servidor a partir do código; nada sobre ela vai daqui. */
export const registrarContato = (a: {
  avaliacaoId: string;
  leadId: string;
  chave: string;
  codigo: string;
  nome: string;
  email: string;
  marketing: boolean;
}) =>
  pedir("registrar", a.avaliacaoId, a.leadId, {
    acao: "registrar",
    avaliacao_id: a.avaliacaoId,
    lead_id: a.leadId,
    chave: a.chave,
    codigo: a.codigo,
    nome: a.nome,
    email: a.email,
    marketing: a.marketing,
    ambiente,
    origem: lerOrigem(),
  });

/** Etapa 2: empresa, WhatsApp e pedidos. O servidor enfileira o relatório por e-mail; o estado real vem de `consultarEmail`. */
export const completarContato = (a: {
  avaliacaoId: string;
  leadId: string;
  chave: string;
  empresa: string;
  whatsapp: string | null;
  pediuContato: boolean;
  marketing: boolean;
}) =>
  pedir("completar", a.avaliacaoId, a.leadId, {
    acao: "completar",
    avaliacao_id: a.avaliacaoId,
    lead_id: a.leadId,
    chave: a.chave,
    empresa: a.empresa,
    whatsapp: a.whatsapp ?? "",
    pediu_contato: a.pediuContato,
    marketing: a.marketing,
  });

/** Aprofundamento (já validado). A revisão cresce a cada gravação; uma gravação atrasada não sobrescreve uma nova. */
export const gravarAprofundamento = (a: {
  avaliacaoId: string;
  leadId: string;
  chave: string;
  aprofundamento: { revisao: number } & Record<string, unknown>;
}) =>
  pedir(
    "aprofundar",
    a.avaliacaoId,
    a.leadId,
    { acao: "aprofundar", lead_id: a.leadId, chave: a.chave, aprofundamento: a.aprofundamento },
    a.aprofundamento.revisao,
  );

const ESTADOS: readonly string[] = [
  "pendente",
  "aceito",
  "nova-tentativa",
  "falhou",
  "nao-configurado",
  "cancelada",
  "limite",
];

/** Como está o envio do relatório por e-mail, segundo o servidor; `null` se não deu para saber. */
export async function consultarEmail(leadId: string, chave: string): Promise<EmailEstado | "nao-pedido" | null> {
  const r = await chamarFuncao<{ relatorio_email?: { estado?: string } }>(
    { acao: "status", lead_id: leadId, chave },
    { timeout: 15_000 },
  );
  const estado = r.dados?.relatorio_email?.estado;
  if (!r.ok || typeof estado !== "string") return null;
  return estado === "nao-pedido" ? "nao-pedido" : ESTADOS.includes(estado) ? (estado as EmailEstado) : null;
}

const acompanhando = new Set<string>();
/** Esperas entre as consultas: o e-mail costuma sair em segundos; depois disso, a tela deixa de perguntar. */
export const ESPERAS_DO_EMAIL = [2_000, 6_000, 15_000, 40_000, 90_000, 180_000];

/** Consulta o estado do e-mail algumas vezes, até ele sair de "pendente"/"nova tentativa" ou as consultas acabarem. */
export async function acompanharEmail(avaliacaoId: string, leadId: string, chave: string, esperas = ESPERAS_DO_EMAIL) {
  if (acompanhando.has(leadId)) return;
  acompanhando.add(leadId);
  try {
    for (const espera of esperas) {
      await new Promise((ok) => setTimeout(ok, espera));
      const estado = await consultarEmail(leadId, chave);
      if (estado && estado !== "nao-pedido") atualizarLiberacao(avaliacaoId, { emailEstado: estado });
      // Só o fim da história vira evento: aceito pelo provedor ou falha (nunca "entregue", que ninguém confirma).
      if (estado === "aceito") track("ai_score_email_aceito", {}, avaliacaoId);
      else if (estado === "falhou" || estado === "limite") track("ai_score_email_falhou", { estado }, avaliacaoId);
      if (estado && estado !== "pendente" && estado !== "nova-tentativa") return;
    }
  } finally {
    acompanhando.delete(leadId);
  }
}
