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
    /** {solucao} vira o nome da solução, ex.: "RESET Scan". */
    solucao: "Olá! Quero conhecer o {solucao}.",
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
  ctaHeader: "Vamos conversar",
  ctaSpotliteSite: "Conhecer Spotlite",
  ctaFluxaSite: "Conhecer Fluxa BPM",
  barraMobile: "Falar no WhatsApp",
} as const;

/** Navegação do reset360: Método, Soluções e Tecnologias são seções da home. */
export const nav: Link[] = [
  { label: "Método", href: "/#metodo" },
  { label: "Soluções", href: "/#solucoes" },
  { label: "Agentes", href: "/agentes" },
  { label: "Tecnologias", href: "/#tecnologias" },
  { label: "Sobre", href: "/sobre" },
];

/** Link da navegação ativo na rota atual, inclusive em subpáginas. Âncoras da home nunca ficam ativas. */
export const rotaAtiva = (caminho: string, href: string) => caminho === href || caminho.startsWith(`${href}/`);

export const footer = {
  frase: ["Um novo jeito de trabalhar.", "Uma nova forma de crescer."],
  explore: {
    titulo: "Explore",
    links: [
      { label: "Soluções", href: "/#solucoes" },
      { label: "Fábrica de agentes", href: "/agentes" },
      { label: "Nossa história", href: "/sobre" },
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
      "Transforme pessoas, processos e agentes em crescimento real com o RESET 360: IA aplicada a Marketing, Vendas e Customer Success.",
  },
  agentes: {
    title: "Catálogo de agentes | Reset IA",
    description: "Conheça 30 casos de uso de agentes de IA para Marketing, Vendas e Customer Success.",
  },
  sobre: {
    title: "Sobre a Reset | Reset IA",
    description: "Conheça Élida Almeida e Diego Nogueira, os profissionais por trás da Reset IA.",
  },
  privacidade: {
    title: "Política de privacidade | Reset IA",
    description: "Como a Reset IA trata os dados de quem visita o site e entra em contato por WhatsApp ou e-mail.",
  },
  naoEncontrada: {
    title: "Página não encontrada | Reset IA",
  },
} as const;

/** Rotas antigas que viraram redirecionamento no cliente: o conteúdo agora é seção da home. */
export const movidas = {
  solucoes: {
    titulo: "As soluções agora estão na página inicial.",
    link: { label: "Ver as soluções", href: "/#solucoes" } satisfies Link,
  },
  tecnologias: {
    titulo: "As tecnologias agora estão na página inicial.",
    link: { label: "Ver as tecnologias", href: "/#tecnologias" } satisfies Link,
  },
};

export const naoEncontrada = {
  titulo: "Página não encontrada.",
  apoio: "Vamos reprogramar a rota.",
  link: { label: "Voltar para a home", href: "/" } satisfies Link,
};
