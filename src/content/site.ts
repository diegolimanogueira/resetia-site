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
    /** RESET Scan: todo botão "Solicitar diagnóstico gratuito" abre o WhatsApp com esta mensagem. */
    diagnostico:
      "Olá! Conheci a Reset pelo site e gostaria de solicitar um diagnóstico gratuito para entender as oportunidades de IA na minha empresa.",
  },
  email: "contato@resetia.com.br",
  // [FALTA] confirmar os dois perfis (vieram do estudo de conteúdo RESET 360).
  fundadores: {
    elida: { nome: "Élida Almeida", linkedin: "https://www.linkedin.com/in/elidaalmeida/" },
    diego: { nome: "Diego Nogueira", linkedin: "https://www.linkedin.com/in/diegonogueira1/" },
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
  /** Item destacado do menu: leva à página do diagnóstico. */
  ctaMenu: "Diagnóstico gratuito",
  /** Botões que abrem o WhatsApp com a mensagem do diagnóstico. */
  ctaDiagnostico: "Solicitar diagnóstico gratuito",
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

/** Página do RESET Scan: botão verde no fim do menu. */
export const navDiagnostico: Link = { label: site.ctaMenu, href: "/diagnostico-gratuito" };

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
      { label: "Diagnóstico gratuito", href: "/diagnostico-gratuito" },
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
    title: "Sobre a Reset: Diego Nogueira e Élida Almeida | Reset IA",
    description:
      "Tecnologia e visão de negócio: conheça Diego Nogueira e Élida Almeida, os fundadores da Reset IA, e a proposta de transformação com IA.",
  },
  diagnostico: {
    title: "Diagnóstico gratuito de IA (RESET Scan) | Reset IA",
    description:
      "Por onde sua empresa deveria começar com IA? Um diagnóstico inicial gratuito, pelo WhatsApp, para indicar oportunidades e próximos passos.",
  },
  privacidade: {
    title: "Política de privacidade | Reset IA",
    description: "Como a Reset IA trata os dados de quem visita o site e entra em contato por WhatsApp ou e-mail.",
  },
  naoEncontrada: {
    title: "Página não encontrada | Reset IA",
  },
} as const;

/** Rotas antigas que viraram redirecionamento no cliente (a query, como ?area=, é mantida). */
export const movidas = {
  scan: {
    titulo: "O RESET Scan agora é o diagnóstico gratuito.",
    link: { label: "Ir para o diagnóstico gratuito", href: "/diagnostico-gratuito/" } satisfies Link,
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
