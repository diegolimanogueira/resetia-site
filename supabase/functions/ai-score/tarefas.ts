// Processador das tarefas do servidor (envio do relatório por e-mail, dicas). Cada tarefa tem estado persistente e
// espera crescente entre tentativas: depois que o servidor aceita o contato, o e-mail não depende de o visitante
// voltar. "aceito" quer dizer que o PROVEDOR aceitou a mensagem; não há confirmação de entrega na caixa de entrada.
// @ts-types="./nucleo.d.ts"
import * as nucleo from "./nucleo.js";
import { limite, rest, rpc, SITE } from "./base.ts";
import { dentroDoLimite, sha256hex } from "./seguranca.ts";

export type Envio =
  | { status: "aceito"; id: string | null }
  | { status: "nao-configurado" }
  | { status: "falhou"; erro: string; definitivo: boolean };

export interface LeadTarefa {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  canal: string;
  avaliacao: { id: string; codigo: string } | null;
}

/** O que a função calcula de um lead: as respostas (com o id da avaliação) e o que se tira delas. */
export interface AnaliseDoLead {
  respostas: nucleo.RespostasCompletas & { id: string };
  resultado: any;
  rec: any;
  analise: any;
  sintese: any;
}

export interface Dependencias {
  carregarLead(leadId: string): Promise<LeadTarefa | null>;
  analisarLead(lead: LeadTarefa): AnaliseDoLead | null;
  obterDicas(avaliacaoId: string, analise: AnaliseDoLead): Promise<any>;
  enviarEmail(m: { para: string; assunto: string; html: string; texto: string }, idempotencia: string): Promise<Envio>;
}

type Tarefa = { id: string; tipo: string; lead_id: string; status: string; tentativas: number; max_tentativas: number };

/** Segundos de espera até a próxima tentativa, conforme quantas já foram feitas. */
const ESPERAS = [60, 300, 1200, 3600, 7200];
export const esperaDaTentativa = (tentativas: number) => ESPERAS[Math.min(Math.max(tentativas, 1), ESPERAS.length) - 1];
const RELATORIOS_POR_HORA = limite("RELATORIOS_POR_HORA", 30);
const RELATORIOS_POR_ENDERECO_DIA = 3;

async function concluir(
  t: Tarefa,
  estado: string,
  extra: { provedor?: string | null; erro?: string; espera?: number } = {},
) {
  await rpc("concluir_tarefa", {
    p_id: t.id,
    p_status: estado,
    p_provedor_id: extra.provedor ?? null,
    p_erro: extra.erro ?? null,
    p_em: `${extra.espera ?? esperaDaTentativa(t.tentativas)} seconds`,
  });
}

/** Registra a tentativa em `emails` (uma linha por tentativa) e, se foi aceito, na linha do tempo do lead. */
async function registrarTentativa(t: Tarefa, assunto: string, envio: Envio, provedor: string | null) {
  await rest("emails", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      lead_id: t.lead_id,
      tipo: "relatorio",
      assunto: assunto.slice(0, 300),
      status: envio.status,
      erro: envio.status === "falhou" ? envio.erro.slice(0, 900) : null,
      autor: "sistema",
      tarefa_id: t.id,
      provedor_id: provedor,
    }),
  });
  if (envio.status === "aceito") {
    await rest("atividades", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        lead_id: t.lead_id,
        tipo: "email",
        autor: "sistema",
        texto: `Relatório completo aceito pelo provedor de e-mail: ${assunto}`,
      }),
    });
    await rest(`leads?id=eq.${t.lead_id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ relatorio_enviado_em: new Date().toISOString() }),
    });
  }
}

/** Token aleatório de 32 bytes (43 caracteres): só o hash vai ao banco, e o token só existe no e-mail enviado. */
function tokenAleatorio() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function criarToken(leadId: string, finalidade: "ler-relatorio" | "preferencias", dias: number) {
  const token = tokenAleatorio();
  const r = await rpc("criar_token", {
    p_lead: leadId,
    p_finalidade: finalidade,
    p_hash: await sha256hex(token),
    p_dias: dias,
  });
  return r.estado === "ok" ? token : null;
}

async function tarefaDeEmail(t: Tarefa, deps: Dependencias) {
  const lead = await deps.carregarLead(t.lead_id);
  if (!lead?.empresa || !lead.avaliacao) return concluir(t, "cancelada", { erro: "lead sem empresa" });

  // Só se a pessoa pediu o relatório por e-mail (e não revogou).
  const el = await rpc<boolean>("elegivel", { p_lead: lead.id, p_finalidade: "relatorio-email", p_canal: "email" });
  if (el.estado === "indisponivel") return concluir(t, "nova-tentativa", { erro: "banco indisponível" });
  if (el.dados !== true) return concluir(t, "cancelada", { erro: "sem consentimento para o relatório por e-mail" });

  const a = deps.analisarLead(lead);
  if (!a) return concluir(t, "falhou", { erro: "código da avaliação ilegível" });

  // Limites contra abuso: por endereço (só na primeira tentativa, para as novas tentativas não o consumirem) e por hora.
  if (t.tentativas <= 1) {
    const doEndereco = await dentroDoLimite(
      `relatorio:end:${await sha256hex(lead.email)}`,
      86_400,
      RELATORIOS_POR_ENDERECO_DIA,
    );
    if (!doEndereco) return concluir(t, "limite", { erro: "limite diário por endereço" });
  }
  if (!(await dentroDoLimite("relatorio:global", 3600, RELATORIOS_POR_HORA))) {
    console.warn("email-relatorio: limite por hora atingido");
    return concluir(t, "nova-tentativa", { erro: "limite por hora", espera: 1800 });
  }

  const dicas = await deps.obterDicas(lead.avaliacao.id, a);
  // Acesso ao relatório: um token de finalidade restrita (180 dias) e outro só para as preferências de contato (365).
  const leitura = await criarToken(lead.id, "ler-relatorio", 180);
  const preferencias = await criarToken(lead.id, "preferencias", 365);
  if (!leitura || !preferencias) return concluir(t, "nova-tentativa", { erro: "banco indisponível" });
  const email = nucleo.montarEmailRelatorio({
    nome: lead.nome,
    quem: nucleo.quemDoResumo(a.respostas, lead.empresa),
    resultado: a.resultado,
    sintese: a.sintese,
    analise: a.analise,
    dicas,
    // O id do lead nunca vai no link: o que abre o relatório é o token, que expira e pode ser revogado.
    link: nucleo.linkRelatorio(SITE, lead.avaliacao.codigo, null, leitura),
    preferencias: nucleo.linkPreferencias(SITE, preferencias),
    whatsapp: nucleo.waUrl(a.sintese.conversa.mensagem),
    site: SITE,
    nomesSolucoes: nucleo.nomesSolucoes,
  });

  // Chave de idempotência: a mesma tarefa repetida (tempo esgotado depois de o provedor aceitar) não envia duas vezes.
  const envio = await deps.enviarEmail({ para: lead.email, ...email }, `tarefa:${t.id}`);
  if (envio.status === "aceito") {
    await registrarTentativa(t, email.assunto, envio, envio.id);
    return concluir(t, "aceito", { provedor: envio.id });
  }
  if (envio.status === "nao-configurado") {
    await registrarTentativa(t, email.assunto, envio, null);
    return concluir(t, "nao-configurado", { erro: "e-mail não configurado" });
  }
  await registrarTentativa(t, email.assunto, envio, null);
  return concluir(t, envio.definitivo ? "falhou" : "nova-tentativa", { erro: envio.erro });
}

async function tarefaDeDicas(t: Tarefa, deps: Dependencias) {
  const lead = await deps.carregarLead(t.lead_id);
  const a = lead ? deps.analisarLead(lead) : null;
  if (!lead?.avaliacao || !a) return concluir(t, "cancelada", { erro: "avaliação indisponível" });
  await deps.obterDicas(lead.avaliacao.id, a);
  return concluir(t, "concluida");
}

/** Processa até `max` tarefas vencidas. Uma tarefa que lança erro volta para a fila com espera, sem derrubar as outras. */
export async function processar(max: number, deps: Dependencias) {
  const r = await rpc<Tarefa[]>("pegar_tarefas", { p_max: Math.min(Math.max(max, 1), 20) });
  const tarefas = r.dados ?? [];
  const resumo = { processadas: 0, falhas: 0 };
  for (const t of tarefas) {
    try {
      await (t.tipo === "email-relatorio" ? tarefaDeEmail(t, deps) : tarefaDeDicas(t, deps));
      resumo.processadas++;
    } catch (erro) {
      resumo.falhas++;
      console.error("tarefa", t.tipo, erro instanceof Error ? erro.message : erro);
      await concluir(t, "nova-tentativa", { erro: "erro interno" });
    }
  }
  return resumo;
}
