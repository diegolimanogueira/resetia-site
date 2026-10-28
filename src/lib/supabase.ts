import { pendentes } from "@/lib/ai-score/navegador";
import { STAGING } from "@/lib/asset";

/**
 * Cliente mínimo da REST do Supabase (PostgREST + GoTrue) por fetch, sem o SDK (30–40 KB a menos no navegador).
 * Sem NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY tudo vira no-op: é o "modo demonstração"
 * do staging e do CI. A chave anônima é pública por desenho; quem protege os dados é o RLS do banco.
 */
export const supabase = {
  url: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, ""),
  chave: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  get ativo() {
    return this.url.length > 0 && this.chave.length > 0;
  },
};

/** Separa produção de staging e testes locais no admin. */
export const ambiente = STAGING ? "staging" : process.env.NODE_ENV === "production" ? "producao" : "dev";

export type Tabela = "avaliacoes" | "leads";
type Pendente =
  | { tipo?: "inserir"; tabela: Tabela; linha: Record<string, unknown> }
  | { tipo: "rpc"; funcao: string; args: Record<string, unknown> }
  | { tipo: "funcao"; corpo: Record<string, unknown> };
type Situacao = "ok" | "tentar-de-novo" | "erro" | "desligado";

export const cabecalhos = (token?: string): Record<string, string> => ({
  apikey: supabase.chave,
  Authorization: `Bearer ${token ?? supabase.chave}`,
  "Content-Type": "application/json",
});

/**
 * Insere uma linha como anônimo. "ok" também quando a linha já existia (o id nasce no navegador, então
 * reenviar é idempotente). "tentar-de-novo" para falha de rede, projeto fora do ar ou avaliação ainda
 * não gravada (chave estrangeira); "erro" para dado recusado pelo banco.
 */
export async function inserir(tabela: Tabela, linha: Record<string, unknown>): Promise<Situacao> {
  if (!supabase.ativo) return "desligado" as const;
  try {
    const r = await fetch(`${supabase.url}/rest/v1/${tabela}`, {
      method: "POST",
      headers: { ...cabecalhos(), Prefer: "return=minimal" },
      body: JSON.stringify(linha),
      keepalive: true,
    });
    if (r.ok) return "ok" as const;
    const codigo = ((await r.json().catch(() => ({}))) as { code?: string }).code;
    if (codigo === "23505") return "ok" as const;
    if (codigo === "23503" || r.status >= 500 || r.status === 404) return "tentar-de-novo" as const;
    return "erro" as const;
  } catch {
    return "tentar-de-novo" as const;
  }
}

/**
 * Chama uma função do banco como anônimo (hoje, `completar_lead`). A função devolve `true` quando fez o que devia;
 * `false` (o lead ainda não chegou, por exemplo) vira "tentar-de-novo".
 */
export async function chamar(funcao: string, args: Record<string, unknown>): Promise<Situacao> {
  if (!supabase.ativo) return "desligado";
  try {
    const r = await fetch(`${supabase.url}/rest/v1/rpc/${funcao}`, {
      method: "POST",
      headers: cabecalhos(),
      body: JSON.stringify(args),
      keepalive: true,
    });
    if (r.ok) return (await r.json().catch(() => false)) === true ? "ok" : "tentar-de-novo";
    return r.status >= 500 || r.status === 404 ? "tentar-de-novo" : "erro";
  } catch {
    return "tentar-de-novo";
  }
}

/**
 * Função ai-score (Edge Function): dicas por IA, envio do relatório por e-mail e o e-mail do admin.
 * `token`: o do admin, quando a ação exige. Devolve o JSON da função ou `null` se não deu.
 */
export async function chamarFuncao<T = unknown>(
  corpo: Record<string, unknown>,
  opcoes: { token?: string; keepalive?: boolean; timeout?: number } = {},
): Promise<{ ok: boolean; status: number; dados: T | null }> {
  if (!supabase.ativo) return { ok: false, status: 0, dados: null };
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), opcoes.timeout ?? 60_000);
  try {
    const r = await fetch(`${supabase.url}/functions/v1/ai-score`, {
      method: "POST",
      headers: cabecalhos(opcoes.token),
      body: JSON.stringify(corpo),
      keepalive: opcoes.keepalive,
      signal: controle.signal,
    });
    return { ok: r.ok, status: r.status, dados: (await r.json().catch(() => null)) as T | null };
  } catch {
    return { ok: false, status: 0, dados: null };
  } finally {
    clearTimeout(limite);
  }
}

async function executarFuncao(corpo: Record<string, unknown>): Promise<Situacao> {
  const r = await chamarFuncao(corpo);
  return r.ok ? "ok" : r.status === 0 || r.status >= 500 ? "tentar-de-novo" : "erro";
}

const executar = (p: Pendente) =>
  p.tipo === "rpc"
    ? chamar(p.funcao, p.args)
    : p.tipo === "funcao"
      ? executarFuncao(p.corpo)
      : inserir(p.tabela, p.linha);

function guardarSe(r: Situacao, p: Pendente) {
  if (r === "tentar-de-novo") pendentes.gravar([...pendentes.ler<Pendente>(), p]);
  return r;
}

/** Insere e, se não deu por instabilidade, guarda para reenviar na próxima visita. */
export async function enviar(tabela: Tabela, linha: Record<string, unknown>) {
  return guardarSe(await inserir(tabela, linha), { tabela, linha });
}

/**
 * Pede à função para enviar o relatório por e-mail e devolve o que ela respondeu ("enviado", "nao-configurado",
 * "ja-enviado", "falhou"). Sem rede, ou se o lead ainda está na fila (`soNaFila`), o pedido entra na fila,
 * depois do lead.
 */
export async function pedirEnvioDoRelatorio(avaliacaoId: string, leadId: string, soNaFila = false) {
  const corpo = { acao: "enviar-relatorio", avaliacao_id: avaliacaoId, lead_id: leadId };
  if (!supabase.ativo) return null;
  if (soNaFila) {
    pendentes.gravar([...pendentes.ler<Pendente>(), { tipo: "funcao", corpo }]);
    return null;
  }
  const r = await chamarFuncao<{ status?: string }>(corpo, { timeout: 120_000 });
  if (!r.ok && (r.status === 0 || r.status >= 500))
    pendentes.gravar([...pendentes.ler<Pendente>(), { tipo: "funcao", corpo }]);
  return r.dados?.status ?? null;
}

/** Chama a função do banco e, se não deu, guarda para tentar de novo depois (na ordem, depois do lead). */
export async function enviarChamada(funcao: string, args: Record<string, unknown>) {
  return guardarSe(await chamar(funcao, args), { tipo: "rpc", funcao, args });
}

/** Link do e-mail do relatório: confere o par (lead, avaliação) e devolve nome e empresa para liberar o relatório. */
export async function consultarLiberacao(leadId: string, avaliacaoId: string) {
  if (!supabase.ativo) return null;
  try {
    const r = await fetch(`${supabase.url}/rest/v1/rpc/lead_liberado`, {
      method: "POST",
      headers: cabecalhos(),
      body: JSON.stringify({ p_lead: leadId, p_avaliacao: avaliacaoId }),
    });
    const d = r.ok ? ((await r.json()) as { nome?: unknown; empresa?: unknown } | null) : null;
    return d && typeof d.nome === "string" && typeof d.empresa === "string"
      ? { nome: d.nome, empresa: d.empresa }
      : null;
  } catch {
    return null;
  }
}

let reenviando = false;

/** Reenvia o que ficou pendente, na ordem (a avaliação antes do lead). */
export async function reenviarPendentes() {
  if (!supabase.ativo || reenviando) return;
  const fila = pendentes.ler<Pendente>();
  if (!fila.length) return;
  reenviando = true;
  const restantes: Pendente[] = [];
  for (const item of fila) if ((await executar(item)) === "tentar-de-novo") restantes.push(item);
  pendentes.gravar(restantes);
  reenviando = false;
}
