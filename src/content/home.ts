import { site } from "./site";
import type { AreaId, Link } from "./types";

/**
 * Home do RESET 360 (brief de 26/10, enxugada em 18/11): o que a Reset faz, que problemas resolve e como começar.
 * Títulos em linhas; *trecho* = destaque verde.
 */
export const home = {
  hero: {
    eyebrow: "IA aplicada ao crescimento do negócio",
    titulo: ["Sua parceira na *transformação digital e comercial* do seu negócio."],
    lead: "Transformamos a forma como empresas trabalham com inteligência artificial. Desenvolvemos líderes, redesenhamos processos e criamos agentes inteligentes para potencializar Marketing, Vendas e Customer Success.",
    /** Leva ao RESET AI Score. */
    ctaPrimario: site.ctaAiScore,
    ctaSecundario: { label: "Conhecer nossas soluções", href: "#solucoes" } satisfies Link,
    pilulas: ["Marketing", "Vendas", "Customer Success"],
  },
  /** Prova de credibilidade validada pelo Diego (equipes treinadas). */
  prova: {
    antes: "Equipes treinadas em empresas como",
    empresas: ["IEL", "Fortes Tecnologia", "FortesPay", "Somapay", "Longevidade Saudável"],
    depois: "entre outras.",
  },
  problema: {
    kicker: "O problema não é a falta de tecnologia",
    titulo: ["A ferramenta chegou.", "A transformação, nem sempre."],
    texto:
      "Licenças pouco usadas, equipes sobrecarregadas, processos fragmentados e dados que não viram decisões. Mais soluções contratadas não significam automaticamente mais resultado.",
    pergunta: {
      antes: "Na Reset, começamos pela pergunta certa:",
      destaque: "onde a IA pode remover desperdício e gerar crescimento mensurável?",
    },
  },
  /** A RESET 360 é apresentada uma vez só, pelas cinco soluções; cada card diz o que a empresa recebe. */
  solucoes: {
    kicker: "O que é a RESET 360",
    titulo: ["Cinco soluções.", "*Uma transformação.*"],
    lead: "Contrate uma solução específica ou combine as cinco em um programa de transformação. Cada empresa entra pela solução adequada à sua maturidade.",
    depois: "Não sabe por onde começar?",
  },
  areas: {
    kicker: "Onde a IA encontra a receita",
    titulo: ["Marketing, Vendas", "*e Customer Success.*"],
    itens: [
      {
        area: "marketing",
        papel: "Atrair e gerar oportunidades",
        texto: "Mais inteligência para criar, atrair, analisar e gerar demanda.",
        exemplos: ["Social Content", "Campaign Builder", "Market Intelligence"],
      },
      {
        area: "vendas",
        papel: "Converter e aumentar receita",
        texto: "Mais capacidade comercial para qualificar, converter e expandir.",
        exemplos: ["AI SDR", "Follow-up", "Sales Proposal"],
      },
      {
        area: "customer-success",
        papel: "Reter, fidelizar e expandir",
        texto: "Experiências melhores para reter, relacionar e crescer.",
        exemplos: ["Customer Onboarding", "Churn Risk", "Expansion"],
      },
    ] satisfies Array<{ area: AreaId; papel: string; texto: string; exemplos: string[] }>,
    exemplosRotulo: "Exemplos de agentes",
    link: "Ver agentes da área",
  },
  /** RESET AI Score em destaque: a porta de entrada. O WhatsApp fica como segundo caminho. */
  scan: {
    kicker: "RESET AI Score",
    titulo: ["Qual é o AI Score", "*da sua empresa?*"],
    lead: "Descubra gratuitamente o nível de maturidade em IA da sua empresa: nota de 0 a 100, seis dimensões avaliadas e os próximos passos para evoluir.",
    nota: "Gratuito • 5 minutos • Resultado imediato",
    link: { label: "Como funciona o AI Score", href: "/ai-score" } satisfies Link,
  },
  /** Faixa curta: quem são os fundadores e o link para a página Sobre, onde ficam as bios. */
  quemSomos: {
    kicker: "Quem está por trás",
    texto:
      "Élida entende os desafios de crescimento do negócio. Diego transforma esses desafios em soluções tecnológicas inteligentes.",
    link: { label: "Conheça a Reset", href: "/sobre" } satisfies Link,
  },
};
