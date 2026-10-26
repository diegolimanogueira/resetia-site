import { home } from "./home";
import { site } from "./site";
import { ctaPadrao } from "./solucoes";
import type { Link } from "./types";

interface Fundador {
  nome: string;
  especialidade: string;
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
    apoio:
      "A Reset une conhecimento técnico em inteligência artificial e inovação à experiência executiva em Marketing, Vendas e crescimento empresarial.",
  },
  historia: {
    kicker: "Nossa história",
    titulo: ["De treinamentos", "*à transformação.*"],
    paragrafos: [
      "A Reset começou formando equipes para usar inteligência artificial no trabalho do dia a dia. Hoje, a atuação vai além da capacitação: conectamos pessoas, processos, tecnologia e resultados.",
      "Nosso território é a aplicação de IA em Marketing, Vendas e Customer Success, com uma visão integrada de toda a jornada de receita.",
      "Acreditamos que o potencial da IA está em transformar rotinas, ampliar a capacidade das pessoas e criar operações mais inteligentes, não apenas em contratar novas plataformas.",
    ],
    prova: home.prova,
  },
  proposta: {
    kicker: "Proposta de valor",
    titulo: [
      "A Reset não vende apenas treinamentos, agentes ou tecnologia.",
      "*Ajuda empresas a desenvolver pessoas, transformar operações e gerar mais valor com IA.*",
    ],
  },
  fundadores: {
    kicker: "Quem está por trás",
    titulo: ["Visões complementares.", "*Uma só direção.*"],
    pessoas: [
      {
        nome: site.fundadores.diego.nome,
        especialidade: "Especialista em Inteligência Artificial, Tecnologia e Inovação",
        paragrafos: [
          "Profissional com sólida trajetória em tecnologia, inovação, arquitetura de soluções e inteligência artificial.",
          "Sua experiência inclui atuação em projetos corporativos de transformação digital, automação e desenvolvimento de soluções inteligentes, incluindo sua trajetória na Unimed Nacional.",
          "Na Reset, lidera a frente de tecnologia, arquitetura e desenvolvimento de soluções de inteligência artificial.",
        ],
        link: { label: "Ver LinkedIn", href: site.fundadores.diego.linkedin },
        foto: { base: "/brand/diego", alt: "Diego Nogueira, fundador da Reset IA" },
        monograma: "DN",
      },
      {
        nome: site.fundadores.elida.nome,
        especialidade: "Especialista em Estratégia, Marketing, Vendas e Growth",
        paragrafos: [
          "Executiva com mais de 15 anos de experiência em Marketing, estratégias de crescimento e desenvolvimento de negócios.",
          "Sua trajetória inclui posições de liderança em organizações como NP Digital e Gomes de Matos Consultoria, com atuação em geração de demanda, integração de Marketing e Vendas, liderança de equipes e crescimento orientado por dados.",
          "Na Reset, conecta a inteligência artificial aos desafios comerciais e estratégicos das empresas, ajudando a transformar tecnologia em produtividade, oportunidades e geração de valor.",
        ],
        link: { label: "Ver LinkedIn", href: site.fundadores.elida.linkedin },
        // [FALTA] foto autorizada da Élida (design/fotos/elida.png → npm run images). Até lá, monograma.
        monograma: "ÉA",
      },
    ] satisfies Fundador[],
  },
  fechamento: {
    titulo: [
      "Élida entende os desafios de crescimento do negócio.",
      "*Diego transforma esses desafios em soluções tecnológicas inteligentes.*",
    ],
    texto:
      "Juntos, conectam estratégia, pessoas, processos e IA para ajudar empresas a operar de maneira mais eficiente e competitiva.",
  },
  cta: ctaPadrao,
};
