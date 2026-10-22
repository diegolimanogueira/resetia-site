import { cardExemplo } from "./spotlite";
import type { AreaId, Ferramenta, Link, Passo } from "./types";

export type PassoMetodo = Passo & { etapa: string; ferramenta?: Ferramenta };

export const home = {
  hero: {
    eyebrow: "Reset 360 · Marketing, Vendas & CS",
    titulo: ["Não é sobre ter mais IA.", "É sobre fazer mais negócio."],
    lead: "Conectamos pessoas, processos e agentes inteligentes para transformar a operação de receita. Menos ferramentas desperdiçadas. Mais times preparados. Mais valor para o seu cliente.",
    ctaPrimario: "Descobrir oportunidades",
    ctaSecundario: { label: "Explorar o Reset 360", href: "#solucoes" } satisfies Link,
    manifesto: ["Marketing", "Vendas", "Customer Success"],
    imagemAlt: "Corredor escuro com uma porta aberta de onde sai luz verde",
  },
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
    pilares: [
      { numero: "01", texto: "Pessoas mais capazes" },
      { numero: "02", texto: "Processos mais inteligentes" },
      { numero: "03", texto: "Negócios mais rentáveis" },
    ],
  },
  metodo: {
    kicker: "Nossa forma de trabalhar",
    titulo: ["Uma visão 360°.", "Um caminho claro."],
    lead: "Da descoberta de oportunidades à evolução contínua, cada etapa tem um propósito de negócio.",
    imagemAlt: "Bússola com a agulha verde apontando a direção",
    passos: [
      {
        numero: "01",
        etapa: "Descobrir",
        titulo: "Diagnosticar",
        texto: "Mapear maturidade, ferramentas, processos e oportunidades.",
        ferramenta: "spotlite",
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
        ferramenta: "fluxa",
      },
      {
        numero: "04",
        etapa: "Evoluir",
        titulo: "Medir",
        texto: "Acompanhar adoção, eficiência e resultados de receita.",
        ferramenta: "spotlite",
      },
    ] satisfies PassoMetodo[],
  },
  solucoes: {
    kicker: "Portfólio Reset",
    titulo: ["Sete soluções.", "Uma transformação."],
    lead: "Contrate uma capacidade específica ou combine soluções em uma jornada integrada. Cada produto tem escopo e entregáveis próprios.",
  },
  tecnologias: {
    kicker: "Tecnologias próprias",
    titulo: ["Produtos que potencializam", "a transformação."],
    lead: "Duas ferramentas independentes, que também podem acelerar os projetos da Reset.",
    card: cardExemplo,
    link: { label: "Ver as tecnologias em detalhe", href: "/tecnologias" } satisfies Link,
  },
  areas: {
    kicker: "Onde a IA encontra a receita",
    titulo: ["Do primeiro contato", "à próxima compra."],
    itens: [
      { area: "marketing", texto: "Mais inteligência para criar, atrair, analisar e gerar demanda." },
      { area: "vendas", texto: "Mais capacidade comercial para qualificar, converter e expandir." },
      { area: "customer-success", texto: "Experiências melhores para reter, relacionar e crescer." },
    ] satisfies Array<{ area: AreaId; texto: string }>,
    link: "Conhecer agentes",
  },
  quemSomos: {
    kicker: "Quem está por trás",
    titulo: ["Negócio encontra", "tecnologia."],
    texto:
      "A Reset reúne duas experiências que se completam: a visão estratégica de Marketing, Vendas e crescimento de Élida Almeida e a experiência de Diego Nogueira em IA, tecnologia e inovação.",
    link: { label: "Conheça nossa história", href: "/sobre" } satisfies Link,
  },
  fecho: {
    kicker: "O próximo ciclo começa aqui",
    linha1: "Sua empresa está pronta",
    linha2Prefixo: "para ",
    linha2Destaque: "resetar o futuro?",
    apoio: "Comece identificando onde IA pode criar eficiência, liberar capacidade e acelerar crescimento.",
    cta: "Conversar sobre meu negócio",
  },
};
