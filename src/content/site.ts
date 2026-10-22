import type { Link, Tom } from "./types";

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
    spotlite: "Olá! Vim pelo site da Reset IA e quero fazer o diagnóstico Spotlite do meu setor.",
    fluxa: "Olá! Vim pelo site da Reset IA e quero que vocês mapeiem um processo da minha empresa com a Fluxa BPM.",
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
    fluxaGratis: "https://www.fluxabpm.com.br/signup",
    fluxaPrivacidade: "https://www.fluxabpm.com.br/privacidade",
  },
  cidades: "Fortaleza e Campinas, Brasil",
  ano: 2026,
  ctaHeader: "Vamos conversar",
  ctaSpotlite: "Pedir o diagnóstico do meu setor",
  ctaSpotliteSite: "Conhecer Spotlite",
  ctaFluxaSite: "Conhecer Fluxa BPM",
  ctaFluxaGratis: "Mapear um processo grátis",
  ctaFluxaServico: "Pedir para a Reset IA mapear um processo",
  barraMobile: "Falar no WhatsApp",
} as const;

export const nav: Link[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Agentes", href: "/agentes" },
  { label: "Tecnologias", href: "/tecnologias" },
  { label: "Sobre", href: "/sobre" },
];

/** Tom do fundo da página: define header, logo e cor base. */
export const tomPorRota: Record<string, Tom> = {
  "/": "carvao",
  "/solucoes": "neutro",
  "/agentes": "neutro",
  "/tecnologias": "carvao",
  "/produtos": "carvao",
  "/spotlite": "carvao",
  "/sobre": "neutro",
  "/privacidade": "neutro",
};

/** Tom de qualquer rota: exata ou pela primeira parte (ex.: /solucoes/scan herda de /solucoes). */
export function tomDaRota(caminho: string): Tom {
  return tomPorRota[caminho] ?? tomPorRota[`/${caminho.split("/")[1] ?? ""}`] ?? "carvao";
}

/** Link da navegação ativo na rota atual, inclusive em subpáginas. */
export const rotaAtiva = (caminho: string, href: string) => caminho === href || caminho.startsWith(`${href}/`);

export const footer = {
  frase: ["Um novo jeito de trabalhar.", "Uma nova forma de crescer."],
  colunas: {
    navegacao: "Explore",
    contato: "Fale com a Reset",
    redes: "Redes e ferramentas",
  },
  redes: [
    { label: "Élida no LinkedIn", href: site.fundadores.elida.linkedin },
    { label: "Diego no LinkedIn", href: site.fundadores.diego.linkedin },
    { label: "Spotlite", href: site.ferramentas.spotlite },
    { label: "Fluxa BPM", href: site.ferramentas.fluxa },
  ] satisfies Link[],
  legal: [`© ${site.ano} Reset IA`, site.cidades],
  aviso: "Conteúdo institucional. Resultados dependem do contexto e da implantação.",
  privacidade: { label: "Política de privacidade", href: "/privacidade" } satisfies Link,
};

export const seo = {
  home: {
    title: "IA aplicada a Marketing, Vendas e CS | Reset IA",
    description:
      "Transforme pessoas, processos e agentes em crescimento real com o RESET 360: IA aplicada a Marketing, Vendas e Customer Success.",
  },
  solucoes: {
    title: "Soluções RESET 360 | Reset IA",
    description:
      "Sete soluções, uma transformação. Contrate uma capacidade específica ou combine soluções em uma jornada integrada. Cada produto tem escopo e entregáveis próprios.",
  },
  agentes: {
    title: "Catálogo de agentes | Reset IA",
    description: "Conheça 30 casos de uso de agentes de IA para Marketing, Vendas e Customer Success.",
  },
  tecnologias: {
    title: "Tecnologias — Spotlite e Fluxa BPM | Reset IA",
    description:
      "Duas ferramentas próprias da Reset IA. Spotlite: diagnóstico com IA que mostra onde a IA vale a pena, em horas e reais. Fluxa BPM: a IA desenha e melhora os processos.",
  },
  produtos: {
    title: "Tecnologias | Reset IA",
    description:
      "A página Produtos agora se chama Tecnologias: Spotlite e Fluxa BPM, as ferramentas próprias da Reset IA.",
  },
  spotlite: {
    title: "Spotlite — diagnóstico de IA | Reset IA",
    description: "A Spotlite agora está na página Tecnologias da Reset IA.",
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

/** Rotas antigas que viraram redirecionamento no cliente. */
export const movidas = {
  produtos: {
    titulo: "Produtos agora se chama Tecnologias.",
    link: { label: "Ir para Tecnologias", href: "/tecnologias/" } satisfies Link,
  },
  spotlite: {
    titulo: "A Spotlite agora está em Tecnologias.",
    link: { label: "Ir para Tecnologias", href: "/tecnologias/#spotlite" } satisfies Link,
  },
};

export const naoEncontrada = {
  titulo: "Página não encontrada.",
  apoio: "Vamos reprogramar a rota.",
  link: { label: "Voltar para a home", href: "/" } satisfies Link,
};
