import { site } from "./site";
import type { AreaId, Link } from "./types";

/**
 * Home do RESET 360 (brief de 26/10): o que a Reset faz, que problemas resolve e como começar.
 * Títulos em linhas; *trecho* = destaque verde.
 */
export const home = {
  hero: {
    eyebrow: "Reset 360 · IA aplicada ao crescimento do negócio",
    titulo: ["Sua parceira na *transformação digital e comercial* do seu negócio."],
    lead: "Transformamos a forma como empresas trabalham com inteligência artificial. Desenvolvemos líderes, redesenhamos processos e criamos agentes inteligentes para potencializar Marketing, Vendas e Customer Success.",
    /** Abre o WhatsApp com a mensagem do diagnóstico. */
    ctaPrimario: site.ctaDiagnostico,
    ctaSecundario: { label: "Conhecer nossas soluções", href: "#solucoes" } satisfies Link,
    pilulas: ["Marketing", "Vendas", "Customer Success"],
    legenda: "Inteligência em toda a jornada de receita",
    rodape: [site.assinatura, "Pessoas → Processos → Agentes → Resultado", "Scroll ↓"],
  },
  /** Prova de credibilidade validada pelo Diego (equipes treinadas). */
  prova: {
    antes: "Equipes treinadas em empresas como",
    empresas: ["IEL", "Fortes Tecnologia", "FortesPay", "Longevidade Saudável"],
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
    ajudamos: "Ajudamos empresas a",
    itens: [
      "Capacitar gestores e equipes para trabalhar com IA.",
      "Redesenhar processos e melhorar a eficiência operacional.",
      "Desenvolver agentes inteligentes personalizados.",
      "Reduzir a dependência de ferramentas redundantes.",
      "Estruturar a governança de inteligência artificial.",
      "Mensurar ganhos de produtividade, eficiência e resultados de negócio.",
      "Identificar oportunidades para ampliar aquisição, conversão, retenção e receita.",
    ],
  },
  reset360: {
    kicker: "O que é a RESET 360",
    titulo: ["Uma transformação completa.", "*Do potencial da IA ao resultado do negócio.*"],
    paragrafos: [
      "Acreditamos que a inteligência artificial só gera valor quando conecta as pessoas certas, processos eficientes e soluções tecnológicas aplicadas aos desafios reais da empresa.",
      "Por isso, desenvolvemos uma atuação 360°, que combina capacitação, transformação operacional, agentes inteligentes, governança e evolução contínua.",
      "Nosso foco é ajudar empresas a trabalhar melhor, reduzir desperdícios e desenvolver novas oportunidades de crescimento.",
    ],
    diagrama: {
      rotulo: "A jornada de receita conectada às cinco soluções da Reset",
      hub: "RESET 360",
      jornada: [
        { area: "marketing", papel: "Atrair e gerar oportunidades." },
        { area: "vendas", papel: "Converter e aumentar receita." },
        { area: "customer-success", papel: "Reter, fidelizar e expandir." },
      ] satisfies Array<{ area: AreaId; papel: string }>,
      legenda: "Cinco soluções atendem uma necessidade pontual ou uma transformação integrada de toda a jornada.",
    },
  },
  solucoes: {
    kicker: "Portfólio RESET 360",
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
  scan: {
    kicker: "RESET Scan · Diagnóstico gratuito",
    titulo: ["Por onde sua empresa", "*deveria começar com IA?*"],
    lead: "Descubra oportunidades de aplicação da inteligência artificial, identifique desafios de adoção e entenda quais iniciativas podem gerar mais valor para o seu negócio.",
    link: { label: "Como funciona o diagnóstico", href: "/diagnostico-gratuito" } satisfies Link,
  },
  tecnologias: {
    kicker: "Tecnologias próprias",
    titulo: ["Tecnologia própria para transformar", "*estratégia em execução.*"],
    lead: "As cinco soluções são o trabalho de transformação e consultoria da Reset. Spotlite e Fluxa BPM são tecnologias próprias, com propostas independentes, que apoiam essas soluções.",
    link: { label: "Conhecer as tecnologias", href: "/tecnologias" } satisfies Link,
  },
  quemSomos: {
    kicker: "Quem está por trás",
    titulo: ["Negócio encontra", "*tecnologia.*"],
    paragrafos: [
      "Élida entende os desafios de crescimento do negócio. Diego transforma esses desafios em soluções tecnológicas inteligentes.",
      "Juntos, conectam estratégia, pessoas, processos e IA para ajudar empresas a operar de maneira mais eficiente e competitiva.",
    ],
    link: { label: "Conheça a Reset", href: "/sobre" } satisfies Link,
  },
};
