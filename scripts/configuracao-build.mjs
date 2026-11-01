/**
 * Verificação de configuração do build de PRODUÇÃO do site. Sem o Supabase, o RESET AI Score cai em modo demonstração
 * (nada é gravado, nenhum e-mail sai), e publicar assim por descuido já aconteceu em staging. Por isso o build de
 * produção falha, com a lista do que falta, a menos que a pessoa peça o modo explicitamente:
 *   RESETIA_MODO=demo   staging e prévias: o AI Score roda sem banco, e a tela diz que é demonstração;
 *   RESETIA_MODO=teste  CI e testes: Supabase fictício, tudo interceptado nos testes.
 * Em `next dev` (NODE_ENV diferente de production) nada é exigido.
 */
export const MODOS_EXPLICITOS = ["demo", "teste"];

/**
 * @param {Record<string, string | undefined>} env
 * @returns {string[]} os problemas encontrados (vazio quando está tudo certo).
 */
export function problemasDeConfiguracao(env) {
  if (env.NODE_ENV !== "production") return [];
  const modo = (env.RESETIA_MODO ?? "").trim();
  if (modo && !MODOS_EXPLICITOS.includes(modo))
    return [`RESETIA_MODO=${modo} não existe (use demo ou teste, ou deixe vazio).`];
  if (MODOS_EXPLICITOS.includes(modo)) return [];

  const problemas = [];
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const chave = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!url) problemas.push("NEXT_PUBLIC_SUPABASE_URL ausente");
  else if (!/^https:\/\/[^/\s]+$/.test(url.replace(/\/$/, "")))
    problemas.push("NEXT_PUBLIC_SUPABASE_URL não é uma URL https");
  else if (/\.invalid(\/|$)/.test(url))
    problemas.push("NEXT_PUBLIC_SUPABASE_URL aponta para um endereço fictício (.invalid)");
  if (!chave) problemas.push("NEXT_PUBLIC_SUPABASE_ANON_KEY ausente");
  return problemas;
}

/**
 * Lança com uma mensagem clara quando o build de produção está sem a configuração essencial.
 * @param {Record<string, string | undefined>} [env]
 */
export function verificarConfiguracao(env = process.env) {
  const problemas = problemasDeConfiguracao(env);
  if (!problemas.length) return;
  throw new Error(
    [
      "Configuração de produção incompleta: o RESET AI Score ficaria em modo demonstração, sem gravar leads nem enviar relatórios.",
      ...problemas.map((p) => `  - ${p}`),
      "Os valores de produção ficam em .env.production. Para um build de demonstração ou de teste de propósito,",
      "defina RESETIA_MODO=demo (staging, prévias) ou RESETIA_MODO=teste (CI). Detalhes em docs/deploy.md.",
    ].join("\n"),
  );
}
