import { site } from "./site";
import type { CtaFinal } from "./types";

export const produtos = {
  hero: {
    titulo: "Produtos.",
    lead: "Duas ferramentas próprias da Reset IA, feitas para empresas e para quem trabalha nelas. Uma mede onde a IA vale a pena; a outra desenha os processos onde ela entra. As duas falam a mesma língua: horas e reais.",
    ancoras: [
      { label: "Spotlite", href: "#spotlite" },
      { label: "Fluxa BPM", href: "#fluxa" },
    ],
  },
  spotlite: {
    eyebrow: "Diagnóstico com IA",
    titulo: "Descubra onde a IA e a automação já podem trabalhar pelo seu setor.",
  },
  cta: {
    titulo: "Comece pelo diagnóstico.",
    botao: site.ctaSpotlite,
  } satisfies CtaFinal,
};
