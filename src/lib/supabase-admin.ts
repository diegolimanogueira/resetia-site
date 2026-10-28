import type { Escopo, HorizonteId, NivelId, PapelId, PorteId, SegmentoId, StatusLead } from "@/content/types";
import { cabecalhos, supabase } from "@/lib/supabase";

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
}

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
      "avaliacoes?select=id,criada_em,escopo,papel,porte,segmento,horizonte,indice,nivel,parcial,codigo,origem,ambiente,leads(*)&order=criada_em.desc&limit=1000",
    );
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as AvaliacaoLinha[]) : "erro";
  } catch {
    return "erro";
  }
}

export async function atualizarLead(
  s: Sessao,
  id: string,
  campos: { status: StatusLead; notas: string | null },
): Promise<"ok" | "sessao" | "erro"> {
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
