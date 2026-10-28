import type { Link } from "./types";

/** Marcador de pendência. Nunca inventar o que falta: o Diego fornece. */
export const FALTA = "[FALTA]";

export const site = {
  nome: "Reset IA",
  dominio: "https://www.resetia.com.br",
  /** A logo traz o slogan escrito; o alt repete o que está na imagem. */
  logoAlt: "Reset IA — IA sem hype. Resultado na prática.",
  whatsapp: "5511916170606",
  whatsappFormatado: "+55 11 91617-0606",
  mensagens: {
    geral: "Olá! Quero conhecer as soluções da Reset 360.",
    /**
     * Análise Estratégica RESET: todo botão "Falar com um especialista" abre o WhatsApp com esta mensagem.
     * Na tela de resultado do AI Score a mensagem leva a nota e as lacunas (ver resultadoTextos.mensagem).
     */
    diagnostico:
      "Olá! Conheci a Reset pelo site e gostaria de conversar com um especialista sobre a Análise Estratégica RESET para a minha empresa.",
  },
  email: "contato@resetia.com.br",
  // [FALTA] confirmar os dois perfis do LinkedIn (vieram do estudo de conteúdo RESET 360).
  fundadores: {
    elida: { nome: "Élida Almeida", cargo: "Co-founder & CEO", linkedin: "https://www.linkedin.com/in/elidaalmeida/" },
    diego: {
      nome: "Diego Nogueira",
      cargo: "Co-founder & CTO",
      linkedin: "https://www.linkedin.com/in/diegonogueira1/",
    },
  },
  /** Produtos da Reset IA. Sempre que o site fala deles, aponta para cá. */
  ferramentas: {
    spotlite: "https://www.spotlite.com.br/",
    spotlitePrivacidade: "https://www.spotlite.com.br/privacidade",
    fluxa: "https://www.fluxabpm.com.br/",
    fluxaPrivacidade: "https://www.fluxabpm.com.br/privacidade",
    /** Teste aberto de IA para negócios. A pessoa responde e, no fim, deixa nome, e-mail e WhatsApp. */
    spotliteTeste: "https://www.spotlite.com.br/descoberta/ia-negocios",
  },
  cidades: "Fortaleza e Campinas, Brasil",
  ano: 2026,
  /** Item destacado do menu: leva ao RESET AI Score. */
  ctaMenu: "Descubra seu AI Score",
  /** Botões que abrem o WhatsApp com a mensagem da Análise Estratégica (caminho secundário). */
  ctaDiagnostico: "Falar com um especialista",
  /** Botões que levam ao RESET AI Score (/ai-score), a porta de entrada do site. */
  ctaAiScore: "Descobrir meu AI Score",
  assinatura: "IA sem hype. Resultado na prática.",
  ctaSpotliteSite: "Conhecer Spotlite",
  ctaFluxaSite: "Conhecer Fluxa BPM",
  barraMobile: "Falar no WhatsApp",
} as const;

export const nav: Link[] = [
  { label: "Início", href: "/" },
  { label: "Soluções", href: "/solucoes" },
  { label: "Agentes de IA", href: "/agentes-de-ia" },
  { label: "Tecnologias", href: "/tecnologias" },
  { label: "Sobre a Reset", href: "/sobre" },
];

/** RESET AI Score: botão verde no fim do menu. */
export const navDiagnostico: Link = { label: site.ctaMenu, href: "/ai-score" };

/** Link da navegação ativo na rota atual, inclusive em subpáginas. A home só fica ativa nela mesma. */
export const rotaAtiva = (caminho: string, href: string) =>
  href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);

export const footer = {
  frase: ["Um novo jeito de trabalhar.", "Uma nova forma de crescer."],
  solucoes: { titulo: "Soluções" },
  explore: {
    titulo: "Explore",
    links: [
      { label: "Agentes de IA", href: "/agentes-de-ia" },
      { label: "Tecnologias", href: "/tecnologias" },
      { label: "Sobre a Reset", href: "/sobre" },
      { label: "RESET AI Score", href: "/ai-score" },
      { label: "Análise Estratégica", href: "/diagnostico-gratuito" },
    ] satisfies Link[],
  },
  contato: {
    titulo: "Fale com a Reset",
    whatsapp: "WhatsApp",
    redes: [
      { label: "Élida no LinkedIn", href: site.fundadores.elida.linkedin },
      { label: "Diego no LinkedIn", href: site.fundadores.diego.linkedin },
    ] satisfies Link[],
  },
  legal: `© ${site.ano} Reset IA. ${site.cidades}.`,
  aviso: "Conteúdo institucional. Resultados dependem do contexto e da implantação.",
  privacidade: { label: "Política de privacidade", href: "/privacidade" } satisfies Link,
};

export const seo = {
  home: {
    title: "IA aplicada a Marketing, Vendas e CS | Reset IA",
    description:
      "Transformação de negócios com IA: líderes preparados, processos redesenhados e agentes inteligentes para Marketing, Vendas e Customer Success.",
  },
  solucoes: {
    title: "Soluções RESET 360: cinco frentes de transformação | Reset IA",
    description:
      "AI Champions, Processos com IA, Agent Factory, Governance e Performance: contrate uma solução ou combine as cinco em um programa de transformação.",
  },
  agentes: {
    title: "Agentes de IA para Marketing, Vendas e CS | Reset IA",
    description:
      "Catálogo com 30 casos de uso de agentes de IA para Marketing, Vendas e Customer Success, desenhados para o processo e os dados de cada operação.",
  },
  tecnologias: {
    title: "Tecnologias próprias: Spotlite e Fluxa BPM | Reset IA",
    description:
      "Spotlite para diagnóstico de maturidade e oportunidades de IA; Fluxa BPM para mapear e redesenhar processos com IA. Tecnologias próprias da Reset.",
  },
  sobre: {
    title: "Sobre a Reset: Élida Almeida e Diego Nogueira | Reset IA",
    description:
      "Visão de negócio e tecnologia: conheça Élida Almeida, co-founder e CEO, e Diego Nogueira, co-founder e CTO da Reset IA.",
  },
  diagnostico: {
    title: "Análise Estratégica RESET: IA com especialistas | Reset IA",
    description:
      "Seu AI Score mostrou onde sua empresa está. Converse com especialistas da Reset para validar o resultado e definir prioridades de IA.",
  },
  aiScore: {
    title: "RESET AI Score: maturidade em IA da sua empresa | Reset IA",
    description:
      "Descubra gratuitamente o AI Score da sua empresa: nota de 0 a 100, nível de maturidade em IA, seis dimensões e próximos passos, em cerca de 5 minutos.",
  },
  aiScoreAvaliacao: {
    title: "Avaliação RESET AI Score | Reset IA",
    description: "Responda às perguntas do RESET AI Score e descubra o nível de maturidade em IA da sua empresa.",
  },
  aiScoreResultado: {
    title: "Seu resultado RESET AI Score | Reset IA",
    description: "Seu AI Score: nota de 0 a 100, nível de maturidade em IA, resultado por dimensão e próximos passos.",
  },
  privacidade: {
    title: "Política de privacidade | Reset IA",
    description:
      "Como a Reset IA trata os dados de quem visita o site, responde ao RESET AI Score ou entra em contato por WhatsApp ou e-mail.",
  },
  naoEncontrada: {
    title: "Página não encontrada | Reset IA",
  },
} as const;

/** Rotas antigas que viraram redirecionamento no cliente (a query, como ?area=, é mantida). */
export const movidas = {
  scan: {
    titulo: "O RESET Scan agora é o RESET AI Score.",
    link: { label: "Descobrir meu AI Score", href: "/ai-score/" } satisfies Link,
  },
  workshops: {
    titulo: "Os workshops agora fazem parte do RESET AI Champions.",
    link: { label: "Ir para o RESET AI Champions", href: "/solucoes/ai-champions/" } satisfies Link,
  },
  agentes: {
    titulo: "O catálogo agora se chama Agentes de IA.",
    link: { label: "Ir para Agentes de IA", href: "/agentes-de-ia/" } satisfies Link,
  },
  tecnologias: {
    titulo: "Esta página agora está em Tecnologias.",
    link: { label: "Ir para Tecnologias", href: "/tecnologias/" } satisfies Link,
  },
};

export const naoEncontrada = {
  titulo: "Página não encontrada.",
  apoio: "Vamos reprogramar a rota.",
  link: { label: "Voltar para a home", href: "/" } satisfies Link,
};
