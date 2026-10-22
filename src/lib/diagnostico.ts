import { site } from "@/content/site";

/**
 * Link do teste de IA para negócios da Spotlite, com a origem do clique. A Spotlite grava
 * `utm_source` no lead (minúsculas, [a-z0-9][a-z0-9_.-]), então cada botão diz de onde veio.
 */
export function diagnosticoUrl(origem: string) {
  return `${site.ferramentas.spotliteTeste}?utm_source=resetia.${origem}`;
}
