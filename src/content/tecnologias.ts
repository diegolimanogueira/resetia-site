import { site } from "./site";
import type { CtaFinal, Ferramenta, Link } from "./types";

/**
 * Resumo das duas tecnologias próprias: aparece na home, na página Tecnologias e nas soluções
 * que cada ferramenta acelera.
 */
export const ferramentas: Record<
  Ferramenta,
  { eyebrow: string; titulo: string; texto: string; nota: string; site: Link; solucao: Link }
> = {
  spotlite: {
    eyebrow: "Diagnóstico",
    titulo: "Dados antes de decisões.",
    texto:
      "A Spotlite apoia o diagnóstico de maturidade e oportunidades de IA, identificando atividades, potencial de automação e estimativas de valor para orientar prioridades.",
    nota: "Na Reset: acelera o RESET Scan e o acompanhamento de evolução.",
    site: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite },
    solucao: { label: "RESET Scan", href: "/solucoes/scan" },
  },
  fluxa: {
    eyebrow: "Processos",
    titulo: "Processo claro. IA que funciona.",
    texto:
      "A Fluxa BPM ajuda a mapear como o trabalho acontece, evidenciar gargalos e propor novos fluxos antes de iniciar automações.",
    nota: "Na Reset: acelera o RESET Processos com IA.",
    site: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa },
    solucao: { label: "RESET Processos com IA", href: "/solucoes/processos-com-ia" },
  },
};

export const tecnologias = {
  hero: {
    kicker: "Tecnologias próprias",
    titulo: "Tecnologias.",
    lead: "Produtos que potencializam a transformação: duas ferramentas independentes, que também podem acelerar os projetos da Reset. Uma mede onde a IA vale a pena; a outra desenha os processos onde ela entra. As duas falam a mesma língua: horas e reais.",
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
