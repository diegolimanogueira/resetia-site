import { site } from "@/content/site";

/** Todo CTA de conversa abre o WhatsApp. Fonte única da URL. */
export function waUrl(mensagem: string = site.mensagens.geral, numero: string = site.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export const waGeral = () => waUrl(site.mensagens.geral);
/** RESET Scan: "Solicitar diagnóstico gratuito" em qualquer lugar do site. */
export const waDiagnostico = () => waUrl(site.mensagens.diagnostico);
