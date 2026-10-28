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
type Pendente = { tabela: Tabela; linha: Record<string, unknown> };

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
export async function inserir(tabela: Tabela, linha: Record<string, unknown>) {
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

/** Insere e, se não deu por instabilidade, guarda para reenviar na próxima visita. */
export async function enviar(tabela: Tabela, linha: Record<string, unknown>) {
  const r = await inserir(tabela, linha);
  if (r === "tentar-de-novo") pendentes.gravar([...pendentes.ler<Pendente>(), { tabela, linha }]);
  return r;
}

let reenviando = false;

/** Reenvia o que ficou pendente, na ordem (a avaliação antes do lead). */
export async function reenviarPendentes() {
  if (!supabase.ativo || reenviando) return;
  const fila = pendentes.ler<Pendente>();
  if (!fila.length) return;
  reenviando = true;
  const restantes: Pendente[] = [];
  for (const item of fila) if ((await inserir(item.tabela, item.linha)) === "tentar-de-novo") restantes.push(item);
  pendentes.gravar(restantes);
  reenviando = false;
}
