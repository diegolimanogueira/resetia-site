import { home } from "./home";
import { site } from "./site";
import { ctaPadrao } from "./solucoes";
import type { Link } from "./types";

interface Fundador {
  nome: string;
  cargo: string;
  descricao: string;
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
        nome: site.fundadores.elida.nome,
        cargo: site.fundadores.elida.cargo,
        descricao:
          "Especialista em marketing e crescimento, com experiência em estratégias de geração de demanda e receita. Atua na conexão entre marketing e negócios para impulsionar o crescimento das empresas.",
        link: { label: "Ver LinkedIn", href: site.fundadores.elida.linkedin },
        foto: { base: "/brand/elida", alt: "Élida Almeida, co-founder e CEO da Reset IA" },
        monograma: "ÉA",
      },
      {
        nome: site.fundadores.diego.nome,
        cargo: site.fundadores.diego.cargo,
        descricao:
          "Arquiteto e consultor de inteligência artificial, com experiência em gestão de produtos e projetos de inovação. Ajuda empresas a transformar processos e implementar soluções de IA para ganhar eficiência e escala.",
        link: { label: "Ver LinkedIn", href: site.fundadores.diego.linkedin },
        foto: { base: "/brand/diego", alt: "Diego Nogueira, co-founder e CTO da Reset IA" },
        monograma: "DN",
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
