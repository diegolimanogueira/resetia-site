import type {
  Escopo,
  HorizonteId,
  NivelId,
  PapelId,
  PorteId,
  SegmentoId,
  StatusLead,
  TipoAtividade,
} from "@/content/types";
import { cabecalhos, chamarFuncao, supabase } from "@/lib/supabase";

/**
 * Admin estático: login no GoTrue (e-mail e senha) e leitura/atualização pela REST com o token do admin.
 * O HTML do /admin é público; quem barra é o RLS (só usuários em public.admins leem e atualizam).
 * A sessão fica no sessionStorage (morre com a aba) e o token é renovado pelo refresh token.
 */

export interface Sessao {
  access_token: string;
  refresh_token: string;
  /** Unix, em segundos. */
  expires_at: number;
  email: string;
}

export interface LeadLinha {
  id: string;
  avaliacao_id: string;
  criado_em: string;
  atualizado_em: string;
  nome: string;
  email: string;
  email_pessoal: boolean;
  /** Vazia até a pessoa pedir o relatório completo (etapa 2). */
  empresa: string | null;
  whatsapp: string | null;
  pediu_contato: boolean;
  consentimento_marketing: boolean;
  status: StatusLead;
  notas: string | null;
  ambiente: string;
  responsavel: string | null;
  /** AAAA-MM-DD */
  proximo_contato: string | null;
  relatorio_enviado_em: string | null;
  /** Quando a pessoa pediu a conversa; nulo nos leads anteriores a 01/11/2026 (o momento não foi guardado). */
  pedido_conversa_em: string | null;
  /** Primeiro contato humano da equipe (ligação, WhatsApp, e-mail ou reunião), nunca o que o sistema registra. */
  primeira_resposta_em: string | null;
  canal: "legado" | "funcao";
}

export interface Atividade {
  id: string;
  criado_em: string;
  autor: string;
  tipo: TipoAtividade;
  texto: string;
}

export interface EmailEnviado {
  id: string;
  criado_em: string;
  tipo: "relatorio" | "reset";
  assunto: string;
  status: "enviado" | "falhou" | "nao-configurado";
  autor: string;
}

/** Campos do lead que o admin pode mudar (o banco só concede UPDATE nestes). */
export type CamposCrm = Partial<{
  status: StatusLead;
  notas: string | null;
  responsavel: string | null;
  proximo_contato: string | null;
}>;

export interface AvaliacaoLinha {
  id: string;
  criada_em: string;
  escopo: Escopo;
  papel: PapelId;
  porte: PorteId;
  segmento: SegmentoId;
  horizonte: HorizonteId;
  indice: number | null;
  nivel: NivelId | null;
  parcial: boolean;
  codigo: string;
  origem: Record<string, string>;
  ambiente: string;
  leads: LeadLinha[];
}

const CHAVE = "resetia.admin.sessao";
const ouvintes = new Set<() => void>();

export const sessao = {
  ler: (): string | null => {
    try {
      return sessionStorage.getItem(CHAVE);
    } catch {
      return null;
    }
  },
  gravar: (s: Sessao | null) => {
    try {
      if (s) sessionStorage.setItem(CHAVE, JSON.stringify(s));
      else sessionStorage.removeItem(CHAVE);
    } catch {
      // Sem sessionStorage, o login dura só até recarregar.
    }
    ouvintes.forEach((f) => f());
  },
  assinar: (f: () => void) => {
    ouvintes.add(f);
    return () => ouvintes.delete(f);
  },
};

export function lerSessao(texto: string | null): Sessao | null {
  if (!texto) return null;
  try {
    const s = JSON.parse(texto) as Partial<Sessao>;
    return s.access_token && s.refresh_token && typeof s.expires_at === "number" && s.email ? (s as Sessao) : null;
  } catch {
    return null;
  }
}

type RespostaToken = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in: number;
  user?: { email?: string };
};

const paraSessao = (r: RespostaToken, email: string): Sessao => ({
  access_token: r.access_token,
  refresh_token: r.refresh_token,
  expires_at: r.expires_at ?? Math.floor(Date.now() / 1000) + r.expires_in,
  email: r.user?.email ?? email,
});

async function token(corpo: Record<string, string>, tipo: "password" | "refresh_token") {
  return fetch(`${supabase.url}/auth/v1/token?grant_type=${tipo}`, {
    method: "POST",
    headers: { apikey: supabase.chave, "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

export async function entrar(email: string, senha: string): Promise<Sessao | "credenciais" | "erro"> {
  try {
    const r = await token({ email, password: senha }, "password");
    if (r.status === 400 || r.status === 401) return "credenciais";
    if (!r.ok) return "erro";
    return paraSessao((await r.json()) as RespostaToken, email);
  } catch {
    return "erro";
  }
}

async function renovar(s: Sessao): Promise<Sessao | null> {
  try {
    const r = await token({ refresh_token: s.refresh_token }, "refresh_token");
    if (!r.ok) return null;
    const nova = paraSessao((await r.json()) as RespostaToken, s.email);
    sessao.gravar(nova);
    return nova;
  } catch {
    return null;
  }
}

/** Chamada autenticada: renova o token perto de expirar e uma vez mais se o servidor recusar. */
async function pedir(s: Sessao, caminho: string, init: RequestInit = {}): Promise<Response | "sessao"> {
  let atual: Sessao | null = s;
  if (atual.expires_at * 1000 - Date.now() < 60_000) atual = await renovar(atual);
  for (let tentativa = 0; atual && tentativa < 2; tentativa++) {
    const r = await fetch(`${supabase.url}/rest/v1/${caminho}`, {
      ...init,
      headers: { ...cabecalhos(atual.access_token), ...(init.headers as Record<string, string> | undefined) },
    });
    if (r.status !== 401) return r;
    atual = await renovar(atual);
  }
  sessao.gravar(null);
  return "sessao";
}

/** O usuário logado está em public.admins? Sem isso o RLS devolve listas vazias, e o painel avisa. */
export async function eAdmin(s: Sessao): Promise<boolean | "sessao" | "erro"> {
  try {
    const r = await pedir(s, "rpc/eh_admin", { method: "POST", body: "{}" });
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as boolean) === true : "erro";
  } catch {
    return "erro";
  }
}

/** Avaliações com os leads de cada uma, das mais recentes para as mais antigas (até 1000 por página do PostgREST). */
export async function listar(s: Sessao): Promise<AvaliacaoLinha[] | "sessao" | "erro"> {
  try {
    const r = await pedir(
      s,
      "avaliacoes?select=id,criada_em,escopo,papel,porte,segmento,horizonte,indice,nivel,parcial,codigo,origem,ambiente,leads(id,avaliacao_id,criado_em,atualizado_em,nome,email,email_pessoal,empresa,whatsapp,pediu_contato,consentimento_marketing,status,notas,ambiente,responsavel,proximo_contato,relatorio_enviado_em,pedido_conversa_em,primeira_resposta_em,canal)&order=criada_em.desc&limit=1000",
    );
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as AvaliacaoLinha[]) : "erro";
  } catch {
    return "erro";
  }
}

export async function atualizarLead(s: Sessao, id: string, campos: CamposCrm): Promise<"ok" | "sessao" | "erro"> {
  try {
    const r = await pedir(s, `leads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(campos),
    });
    if (r === "sessao") return r;
    return r.ok ? "ok" : "erro";
  } catch {
    return "erro";
  }
}

async function lerLista<T>(s: Sessao, caminho: string): Promise<T[] | "sessao" | "erro"> {
  try {
    const r = await pedir(s, caminho);
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as T[]) : "erro";
  } catch {
    return "erro";
  }
}

export const listarAtividades = (s: Sessao, leadId: string) =>
  lerLista<Atividade>(
    s,
    `atividades?lead_id=eq.${encodeURIComponent(leadId)}&select=id,criado_em,autor,tipo,texto&order=criado_em.desc&limit=200`,
  );

export const listarEmails = (s: Sessao, leadId: string) =>
  lerLista<EmailEnviado>(
    s,
    `emails?lead_id=eq.${encodeURIComponent(leadId)}&select=id,criado_em,tipo,assunto,status,autor&order=criado_em.desc&limit=50`,
  );

/** Dicas por IA guardadas para a avaliação (só existem depois que o lead abriu o relatório completo). */
export async function lerDicasDaAvaliacao(s: Sessao, avaliacaoId: string): Promise<unknown | null> {
  const r = await lerLista<{ conteudo: unknown }>(
    s,
    `dicas?avaliacao_id=eq.${encodeURIComponent(avaliacaoId)}&select=conteudo`,
  );
  return Array.isArray(r) ? (r[0]?.conteudo ?? null) : null;
}

export async function registrarAtividade(
  s: Sessao,
  leadId: string,
  tipo: TipoAtividade,
  texto: string,
): Promise<"ok" | "sessao" | "erro"> {
  try {
    const r = await pedir(s, "atividades", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ lead_id: leadId, tipo, texto: texto.slice(0, 4000) }),
    });
    if (r === "sessao") return r;
    return r.ok ? "ok" : "erro";
  } catch {
    return "erro";
  }
}

/** E-mail sobre a Reset IA, pela função (que confere se o token é de um admin e registra o envio). */
export async function enviarEmailReset(s: Sessao, leadId: string, assunto: string, corpo: string) {
  const r = await chamarFuncao<{ status?: string }>(
    { acao: "email-reset", lead_id: leadId, assunto, corpo },
    { token: s.access_token, timeout: 30_000 },
  );
  if (r.status === 401) return "sessao" as const;
  return (r.dados?.status as "enviado" | "falhou" | "nao-configurado" | undefined) ?? ("erro" as const);
}

/** Relatório completo por e-mail para um lead que ainda não recebeu (a mesma ação do site). */
export async function enviarRelatorio(avaliacaoId: string, leadId: string) {
  const r = await chamarFuncao<{ status?: string }>(
    { acao: "enviar-relatorio", avaliacao_id: avaliacaoId, lead_id: leadId },
    { timeout: 120_000 },
  );
  return r.dados?.status ?? "erro";
}

// Marcos do funil, contatos permitidos, aprofundamento, tarefas do servidor ------------------------------------------------

export type TipoMarco =
  "reuniao-agendada" | "reuniao-realizada" | "proposta-enviada" | "ganho" | "perdido" | "sem-resposta";

export interface Marco {
  id: string;
  lead_id: string;
  tipo: TipoMarco;
  ocorrido_em: string;
  valor_informado: number | null;
  observacao: string | null;
}

export const listarMarcos = (s: Sessao) =>
  lerLista<Marco>(
    s,
    "marcos?select=id,lead_id,tipo,ocorrido_em,valor_informado,observacao&order=ocorrido_em.desc&limit=1000",
  );

async function enviarEscrita(s: Sessao, caminho: string, init: RequestInit): Promise<"ok" | "sessao" | "erro"> {
  try {
    const r = await pedir(s, caminho, { ...init, headers: { Prefer: "return=minimal", ...(init.headers as object) } });
    if (r === "sessao") return r;
    return r.ok ? "ok" : "erro";
  } catch {
    return "erro";
  }
}

/** Marco do funil. O valor, se houver, é o que a equipe digitou: nunca é deduzido de um status. */
export const registrarMarco = (
  s: Sessao,
  m: {
    lead_id: string;
    tipo: TipoMarco;
    ocorrido_em?: string;
    valor_informado?: number | null;
    observacao?: string | null;
  },
) => enviarEscrita(s, "marcos", { method: "POST", body: JSON.stringify(m) });

export const removerMarco = (s: Sessao, id: string) =>
  enviarEscrita(s, `marcos?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });

export interface ContatoPermitido {
  lead_id: string;
  email: boolean;
  whatsapp: boolean;
  ligacao: boolean;
  /** O número só volta quando a pessoa escolheu ser contatada por WhatsApp ou por ligação. */
  telefone: string | null;
}

/** O que a equipe pode fazer com cada lead: a função do banco confere a escolha registrada, canal por canal. */
export async function contatosPermitidos(s: Sessao): Promise<ContatoPermitido[] | "sessao" | "erro"> {
  try {
    const r = await pedir(s, "rpc/contatos_permitidos", { method: "POST", body: "{}" });
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as ContatoPermitido[]) : "erro";
  } catch {
    return "erro";
  }
}

/** A equipe só revoga: concede a pessoa, no formulário ou na página de preferências. */
export const revogarConsentimento = (s: Sessao, leadId: string, finalidade: string, canal: string) =>
  enviarEscrita(s, "consentimentos", {
    method: "POST",
    body: JSON.stringify({
      lead_id: leadId,
      finalidade,
      canal,
      concedido: false,
      fonte: "admin-revogacao",
      texto_versao: "admin",
      evento_id: crypto.randomUUID(),
    }),
  });

export interface AprofundamentoLinha {
  lead_id: string;
  area: string;
  camada: 1 | 2;
  revisao: number;
  rotina: string | null;
  rotina_outra: string | null;
  volume: number | null;
  unidade: string | null;
  periodo: string | null;
  consequencia: string | null;
  consequencia_outra: string | null;
  minutos: number | null;
  ferramentas: string[];
  dados: string | null;
  indicador: string | null;
  papel_decisor: string | null;
  nao_sei: string[];
}

export const listarAprofundamentos = (s: Sessao) =>
  lerLista<AprofundamentoLinha>(
    s,
    "aprofundamentos?select=lead_id,area,camada,revisao,rotina,rotina_outra,volume,unidade,periodo,consequencia,consequencia_outra,minutos,ferramentas,dados,indicador,papel_decisor,nao_sei&limit=1000",
  );

export interface TarefaLinha {
  id: string;
  tipo: "email-relatorio" | "dicas";
  lead_id: string;
  status: string;
  tentativas: number;
  max_tentativas: number;
  tentar_em: string;
  ultimo_erro: string | null;
  atualizada_em: string;
}

export const listarTarefas = (s: Sessao) =>
  lerLista<TarefaLinha>(
    s,
    "tarefas?select=id,tipo,lead_id,status,tentativas,max_tentativas,tentar_em,ultimo_erro,atualizada_em&order=atualizada_em.desc&limit=200",
  );

/** Volta uma tarefa que falhou para a fila (só o admin; tarefa cancelada por falta de consentimento não volta). */
export async function reprocessarTarefa(s: Sessao, id: string): Promise<boolean | "sessao" | "erro"> {
  try {
    const r = await pedir(s, "rpc/reprocessar_tarefa", { method: "POST", body: JSON.stringify({ p_id: id }) });
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as boolean) === true : "erro";
  } catch {
    return "erro";
  }
}

/** Processa as tarefas vencidas agora (a função confere o token de admin). */
export async function processarPendencias(s: Sessao) {
  const r = await chamarFuncao<{ processadas?: number; falhas?: number }>(
    { acao: "processar", max: 10 },
    { token: s.access_token, timeout: 120_000 },
  );
  if (r.status === 401) return "sessao" as const;
  return r.ok ? { processadas: r.dados?.processadas ?? 0, falhas: r.dados?.falhas ?? 0 } : ("erro" as const);
}

/** Revoga os links (tokens) de relatório e de preferências do lead. */
export async function revogarTokens(s: Sessao, leadId: string): Promise<number | "sessao" | "erro"> {
  try {
    const r = await pedir(s, "rpc/revogar_tokens", { method: "POST", body: JSON.stringify({ p_lead: leadId }) });
    if (r === "sessao") return r;
    return r.ok ? Number(await r.json()) : "erro";
  } catch {
    return "erro";
  }
}

/** Gravações pelo caminho antigo (navegador com JavaScript em cache) nos últimos 7 dias: quando zerar, o caminho pode fechar. */
export async function contarLegado(s: Sessao): Promise<{ leads: number; avaliacoes: number } | "sessao" | "erro"> {
  const desde = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [leads, avaliacoes] = await Promise.all([
    lerLista<{ id: string }>(s, `leads?canal=eq.legado&criado_em=gte.${desde}&select=id&limit=1000`),
    lerLista<{ id: string }>(s, `avaliacoes?canal=eq.legado&criada_em=gte.${desde}&select=id&limit=1000`),
  ]);
  if (leads === "sessao" || avaliacoes === "sessao") return "sessao";
  if (leads === "erro" || avaliacoes === "erro") return "erro";
  return { leads: leads.length, avaliacoes: avaliacoes.length };
}
