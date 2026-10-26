import { site } from "./site";
import type { Ferramenta, Link } from "./types";

/** As duas tecnologias próprias: cards da home e página /tecnologias. Não são produtos de consultoria. */
export const ferramentas: Record<
  Ferramenta,
  { tag: string; titulo: string; resumo: string; texto: string; nota: string; site: Link; solucao: Link }
> = {
  spotlite: {
    tag: "Diagnóstico",
    titulo: "Dados antes de decisões.",
    resumo: "Tecnologia de diagnóstico e análise de maturidade e oportunidades de aplicação de IA.",
    texto:
      "A Spotlite apoia o diagnóstico de maturidade e oportunidades de IA, identificando atividades, potencial de automação e estimativas de valor para orientar prioridades.",
    nota: "Na Reset: potencializa diagnósticos e avaliações aprofundadas, conforme o escopo acordado, e o acompanhamento do RESET Performance.",
    site: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite },
    solucao: { label: "RESET Performance", href: "/solucoes/performance" },
  },
  fluxa: {
    tag: "Processos",
    titulo: "Processo claro. IA que funciona.",
    resumo: "Tecnologia de mapeamento, documentação e redesenho de processos com inteligência artificial.",
    texto:
      "A Fluxa BPM ajuda a mapear como o trabalho acontece, evidenciar gargalos e propor novos fluxos antes de iniciar automações.",
    nota: "Na Reset: apoia o RESET Processos com IA.",
    site: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa },
    solucao: { label: "RESET Processos com IA", href: "/solucoes/processos-com-ia" },
  },
};

export const tecnologias = {
  hero: {
    kicker: "Tecnologias próprias",
    titulo: ["Tecnologia própria para transformar", "*estratégia em execução.*"],
    lead: "Spotlite e Fluxa BPM são tecnologias desenvolvidas pela Reset, com propostas independentes. Elas apoiam as soluções de transformação quando o projeto pede, mas não são produtos de consultoria.",
  },
  separacao: [
    {
      titulo: "Soluções RESET 360",
      texto:
        "Os cinco produtos são o trabalho de transformação e consultoria da Reset: pessoas, processos, agentes, governança e resultados.",
      link: { label: "Ver as soluções", href: "/solucoes" },
    },
    {
      titulo: "Tecnologias próprias",
      texto:
        "Spotlite e Fluxa BPM são ferramentas com proposta e site próprios. Nos projetos, aceleram diagnóstico e redesenho de processos.",
      link: { label: "Ver as tecnologias abaixo", href: "#spotlite" },
    },
  ],
  apoia: "Apoia",
};
