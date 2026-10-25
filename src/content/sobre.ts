import { site } from "./site";
import { ctaPadrao } from "./solucoes";
import type { Link } from "./types";

interface Fundador {
  nome: string;
  areas: string;
  paragrafos: string[];
  link: Link;
  /** Sem foto, mostra o monograma no mesmo espaço. */
  foto?: { base: string; alt: string };
  monograma: string;
}

export const sobre = {
  hero: {
    kicker: "Sobre a Reset",
    titulo: ["Duas experiências.", "*Uma visão de futuro.*"],
    lead: "A tecnologia transforma possibilidades. A visão de negócio transforma possibilidades em resultados.",
  },
  essencia: {
    kicker: "Nossa essência",
    titulo: ["Inteligência aplicada.", "*Crescimento real.*"],
    paragrafos: [
      "A Reset nasce da combinação entre experiência em inteligência artificial, inovação e construção de soluções digitais e uma trajetória dedicada a Marketing, Vendas e crescimento de negócios.",
      "Acreditamos que o potencial da IA está em transformar rotinas, ampliar a capacidade das pessoas e criar operações mais inteligentes, não apenas em contratar novas plataformas.",
    ],
  },
  fundadores: {
    kicker: "Quem está por trás",
    titulo: ["Visões complementares.", "*Uma só direção.*"],
    pessoas: [
      {
        nome: site.fundadores.elida.nome,
        areas: "Estratégia · Marketing · Growth",
        paragrafos: [
          "Executiva com ampla experiência em Marketing Estratégico, Growth, posicionamento de marcas, liderança de equipes e estratégias comerciais. Sua atuação conecta as oportunidades da IA a desafios concretos de aquisição, conversão e geração de receita.",
          "Na Reset, lidera a perspectiva de negócios: identificação de oportunidades, desenho da experiência do cliente e direcionamento de iniciativas para impacto comercial.",
        ],
        link: { label: "Ver LinkedIn", href: site.fundadores.elida.linkedin },
        // [FALTA] foto autorizada da Élida. Até lá, monograma.
        monograma: "ÉA",
      },
      {
        nome: site.fundadores.diego.nome,
        areas: "Tecnologia · IA · Inovação",
        paragrafos: [
          "Profissional com vasta experiência em tecnologia, projetos de inovação e inteligência artificial. Sua trajetória reúne arquitetura de soluções, produtos digitais, processos e transformação tecnológica em ambientes corporativos.",
          "Na Reset, lidera a perspectiva técnica: arquitetura de IA, criação de agentes inteligentes, integração de sistemas e aplicação responsável de tecnologia à operação.",
        ],
        link: { label: "Ver LinkedIn", href: site.fundadores.diego.linkedin },
        foto: { base: "/brand/diego", alt: "Diego Nogueira, fundador da Reset IA" },
        monograma: "DN",
      },
    ] satisfies Fundador[],
  },
  conviccao: {
    kicker: "Nossa convicção",
    titulo: ["IA não é o destino.", "*É o impulso para crescer.*"],
    texto:
      "Unimos quem entende os desafios de negócio à experiência de quem sabe desenhar a tecnologia para resolvê-los. Da estratégia à execução, sem promessas vazias.",
  },
  cta: ctaPadrao,
};
