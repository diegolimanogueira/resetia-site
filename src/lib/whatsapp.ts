import { site } from "@/content/site";

/** Todo CTA do site abre o WhatsApp. Fonte única da URL. */
export function waUrl(mensagem: string = site.mensagens.geral, numero: string = site.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export const waGeral = () => waUrl(site.mensagens.geral);
export const waSpotlite = () => waUrl(site.mensagens.spotlite);
