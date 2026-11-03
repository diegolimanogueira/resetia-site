// Utilitários da função ai-score: variáveis de ambiente, acesso ao banco com a chave de serviço e respostas HTTP.
// Quem importa este arquivo lê o ambiente na hora da importação (o teste define as variáveis antes).

export const env = (k: string) => Deno.env.get(k) ?? "";
export const SUPABASE_URL = env("SUPABASE_URL");
export const SERVICO = env("SUPABASE_SERVICE_ROLE_KEY");
export const SITE = (env("SITE_URL") || "https://www.resetia.com.br").replace(/\/$/, "");
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const limite = (k: string, padrao: number) => (Number(env(k)) > 0 ? Number(env(k)) : padrao);
export const desde = (ms: number) => encodeURIComponent(new Date(Date.now() - ms).toISOString());

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-processador",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
export const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
export const espera = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

/** REST do próprio projeto com a chave de serviço (a função passa por cima do RLS, com cuidado). */
export function rest(caminho: string, init: RequestInit = {}) {
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

/**
 * Chama uma função do banco (RPC). `estado`: "ok" com os dados; "recusado" quando o banco recusou o dado (4xx, por
 * exemplo uma violação de CHECK: definitivo); "indisponivel" para rede ou erro do servidor (vale tentar de novo).
 */
export async function rpc<T = unknown>(
  nome: string,
  args: Record<string, unknown>,
): Promise<{ estado: "ok" | "recusado" | "indisponivel"; dados: T | null; codigo?: string }> {
  try {
    const r = await rest(`rpc/${nome}`, { method: "POST", body: JSON.stringify(args) });
    const dados = (await r.json().catch(() => null)) as T | null;
    if (r.ok) return { estado: "ok", dados };
    const codigo = (dados as { code?: string } | null)?.code;
    console.warn(`rpc ${nome}: ${r.status}${codigo ? ` ${codigo}` : ""}`);
    return { estado: r.status >= 500 ? "indisponivel" : "recusado", dados: null, codigo };
  } catch {
    console.warn(`rpc ${nome}: sem resposta`);
    return { estado: "indisponivel", dados: null };
  }
}

/** Quantas linhas um filtro da REST encontra (Content-Range). Na dúvida, "muitas": o limite vale. */
export async function contar(caminho: string) {
  const r = await rest(caminho, { headers: { Prefer: "count=exact", Range: "0-0" } });
  const total = Number((r.headers.get("content-range") ?? "").split("/")[1]);
  return r.ok && Number.isFinite(total) ? total : Number.POSITIVE_INFINITY;
}

/**
 * Trabalho depois da resposta. No Supabase, `EdgeRuntime.waitUntil` mantém a função viva até terminar; fora dele
 * (desenvolvimento e testes) devolve a promessa para quem chamou esperar. Nunca lança.
 */
export function agendar(trabalho: Promise<unknown>): Promise<void> | null {
  const seguro = trabalho.then(
    () => undefined,
    (erro) => console.error("trabalho em segundo plano", erro instanceof Error ? erro.message : erro),
  );
  const runtime = (globalThis as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
  if (runtime?.waitUntil) {
    runtime.waitUntil(seguro);
    return null;
  }
  return seguro;
}
