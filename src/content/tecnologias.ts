import { site } from "./site";
import type { Ferramenta, Link } from "./types";

/** As duas tecnologias próprias, nos cards da seção Tecnologias da home (reset360). */
export const ferramentas: Record<Ferramenta, { tag: string; titulo: string; texto: string; nota: string; site: Link }> =
  {
    spotlite: {
      tag: "Diagnóstico",
      titulo: "Dados antes de decisões.",
      texto:
        "A Spotlite apoia o diagnóstico de maturidade e oportunidades de IA, identificando atividades, potencial de automação e estimativas de valor para orientar prioridades.",
      nota: "Na Reset: acelera o RESET Scan e o acompanhamento de evolução.",
      site: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite },
    },
    fluxa: {
      tag: "Processos",
      titulo: "Processo claro. IA que funciona.",
      texto:
        "A Fluxa BPM ajuda a mapear como o trabalho acontece, evidenciar gargalos e propor novos fluxos antes de iniciar automações.",
      nota: "Na Reset: acelera o RESET Processos com IA.",
      site: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa },
    },
  };
