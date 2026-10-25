import type { AreaId, Link, Passo } from "./types";

export type PassoMetodo = Passo & { etapa: string };

/** Home no layout do reset360 (design/reset360/index.html). Títulos em linhas; *trecho* = destaque verde. */
export const home = {
  hero: {
    eyebrow: "Reset 360 · Marketing, Vendas & CS",
    titulo: ["Não é sobre", "ter mais IA.", "*É sobre fazer*", "*mais negócio.*"],
    lead: "Conectamos pessoas, processos e agentes inteligentes para transformar a operação de receita. Menos ferramentas desperdiçadas. Mais times preparados. Mais valor para o seu cliente.",
    /** Abre o WhatsApp, como no reset360. */
    ctaPrimario: "Descobrir oportunidades",
    ctaSecundario: { label: "Explorar o Reset 360", href: "#solucoes" } satisfies Link,
    pilulas: ["Marketing", "Vendas", "Customer Success"],
    legenda: "Inteligência em toda a jornada de receita",
    rodape: ["01 / Visão", "Estratégia → Execução → Resultado", "Scroll ↓"],
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
    pilares: [
      { numero: "01", texto: "Pessoas mais capazes" },
      { numero: "02", texto: "Processos mais inteligentes" },
      { numero: "03", texto: "Negócios mais rentáveis" },
    ],
  },
  metodo: {
    kicker: "Nossa forma de trabalhar",
    titulo: ["Uma visão *360°.*", "Um caminho claro."],
    lead: "Da descoberta de oportunidades à evolução contínua, cada etapa tem um propósito de negócio.",
    passos: [
      {
        numero: "01",
        etapa: "Descobrir",
        titulo: "Diagnosticar",
        texto: "Mapear maturidade, ferramentas, processos e oportunidades.",
      },
      {
        numero: "02",
        etapa: "Preparar",
        titulo: "Capacitar",
        texto: "Desenvolver líderes e equipes para o trabalho com IA.",
      },
      {
        numero: "03",
        etapa: "Transformar",
        titulo: "Redesenhar",
        texto: "Reimaginar fluxos e desenvolver agentes com controle.",
      },
      {
        numero: "04",
        etapa: "Evoluir",
        titulo: "Medir",
        texto: "Acompanhar adoção, eficiência e resultados de receita.",
      },
    ] satisfies PassoMetodo[],
  },
  solucoes: {
    kicker: "Portfólio Reset",
    titulo: ["Sete soluções.", "*Uma transformação.*"],
    lead: "Contrate uma capacidade específica ou combine soluções em uma jornada integrada. Cada produto tem escopo e entregáveis próprios.",
  },
  areas: {
    kicker: "Onde a IA encontra a receita",
    titulo: ["Do primeiro contato", "*à próxima compra.*"],
    itens: [
      {
        area: "marketing",
        simbolo: "↗",
        texto: "Mais inteligência para criar, atrair, analisar e gerar demanda.",
      },
      {
        area: "vendas",
        simbolo: "◎",
        texto: "Mais capacidade comercial para qualificar, converter e expandir.",
      },
      {
        area: "customer-success",
        simbolo: "✳",
        texto: "Experiências melhores para reter, relacionar e crescer.",
      },
    ] satisfies Array<{ area: AreaId; simbolo: string; texto: string }>,
    link: "Conhecer agentes",
  },
  tecnologias: {
    kicker: "Tecnologias próprias",
    titulo: ["Produtos que potencializam", "*a transformação.*"],
    lead: "Duas ferramentas independentes, que também podem acelerar os projetos da Reset.",
  },
  /** Texto do próprio teste em spotlite.com.br/descoberta/ia-negocios. */
  diagnostico: {
    kicker: "Diagnóstico aberto com IA",
    titulo: ["Teste de IA", "*para negócios.*"],
    lead: "Em 5 a 7 minutos, você descobre o seu perfil de aplicação de IA, a sua nota nas competências de IA para negócios e três próximos passos para o seu trabalho.",
    paraQuem: "Para empresários e líderes, colaboradores de empresa e profissionais individuais.",
    etapas: [
      { numero: "01", texto: "Sobre você" },
      { numero: "02", texto: "Preferências" },
      { numero: "03", texto: "Situações" },
      { numero: "04", texto: "Seu resultado" },
    ],
    cta: "Fazer o teste",
    nota: "Começa sem cadastro; no fim, você informa nome, e-mail e WhatsApp para ver a devolutiva.",
    aviso: "Diagnóstico educacional: orienta o seu desenvolvimento e não é certificação.",
  },
  quemSomos: {
    kicker: "Quem está por trás",
    titulo: ["Negócio encontra", "*tecnologia.*"],
    texto:
      "A Reset reúne duas experiências que se completam: a visão estratégica de Marketing, Vendas e crescimento de Élida Almeida e a experiência de Diego Nogueira em IA, tecnologia e inovação.",
    link: { label: "Conheça nossa história", href: "/sobre" } satisfies Link,
    monograma: { letras: ["É", "D"], legenda: "Duas visões. Uma Reset." },
  },
};
