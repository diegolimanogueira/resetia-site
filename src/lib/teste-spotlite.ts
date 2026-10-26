import { site } from "@/content/site";

/**
 * Link do teste de IA para negócios da Spotlite (autodiagnóstico aberto), com a origem do clique.
 * A Spotlite grava `utm_source` no lead (minúsculas, [a-z0-9][a-z0-9_.-]), então cada botão diz de onde veio.
 * Não confundir com o diagnóstico gratuito (RESET Scan), que é pelo WhatsApp: ver waDiagnostico().
 */
export function testeSpotliteUrl(origem: string) {
  return `${site.ferramentas.spotliteTeste}?utm_source=resetia.${origem}`;
}
