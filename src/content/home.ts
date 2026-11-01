import { site } from "./site";
import type { AreaId, Link } from "./types";

/**
 * Home do RESET 360 (brief de 26/10): o que a Reset faz, que problemas resolve e como começar.
 * Títulos em linhas; *trecho* = destaque verde.
 */
export const home = {
  hero: {
    eyebrow: "IA aplicada a Marketing, Vendas e Customer Success",
    titulo: ["Descubra onde a IA pode", "*ajudar o seu negócio primeiro.*"],
    lead: "Trabalho manual demais, ferramentas de IA paradas, processos soltos e dúvida sobre por onde começar: é aí que a Reset entra. Comece pelo RESET AI Score, a avaliação gratuita da maturidade em IA da sua empresa.",
    /** Perto do botão: o que a pessoa precisa saber antes de clicar. O aprofundamento é à parte, sem promessa de tempo. */
    garantias: ["Gratuito", "Cerca de 5 minutos", "Resultado na hora", "Nome e e-mail só no fim"],
    produto:
      "RESET AI Score: nota de 0 a 100 em seis dimensões, uma leitura apoiada nas suas respostas e o primeiro passo sugerido.",
    opcional: "Depois do resultado, você pode aprofundar uma dor da sua operação, se quiser. É opcional.",
    /** Leva ao RESET AI Score. */
    ctaPrimario: site.ctaAiScore,
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
  /** RESET AI Score em destaque: a porta de entrada. O WhatsApp fica como segundo caminho. */
  scan: {
    kicker: "RESET AI Score",
    titulo: ["Veja o que a avaliação entrega,", "*antes de começar.*"],
    lead: "O RESET AI Score avalia gratuitamente a maturidade da sua empresa em IA: uma nota de 0 a 100 em seis dimensões, uma leitura apoiada nas suas respostas e o primeiro passo sugerido, e não só um número.",
    nota: "Gratuito · cerca de 5 minutos · resultado na hora · nome e e-mail só no fim",
    dimensoes: "O que a avaliação mede",
    link: { label: "Como funciona o AI Score", href: "/ai-score" } satisfies Link,
    /** Demonstração com o caso fictício da página de exemplo, calculada no build com o mesmo motor da avaliação. */
    demo: {
      rotulo: "Exemplo ilustrativo, com respostas hipotéticas: não é uma empresa real.",
      nota: "AI Score",
      de100: "de 100",
      leitura: "O que o resultado diz neste exemplo",
      completo: { label: "Ver o exemplo completo", href: "/ai-score/exemplo" } satisfies Link,
    },
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
