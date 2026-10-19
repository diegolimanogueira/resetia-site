import type { Link, Tom } from "./types";

/** Marcador de pendência. Nunca inventar o que falta: o Diego fornece. */
export const FALTA = "[FALTA]";

export const site = {
  nome: "Reset IA",
  tagline: "IA sem hype. Resultado na prática.",
  dominio: "https://www.resetia.com.br",
  logoAlt: "Reset IA — IA sem hype. Resultado na prática.",
  whatsapp: "5511916170606",
  whatsappFormatado: "+55 11 91617-0606",
  mensagens: {
    geral: "Olá! Vim pelo site da Reset IA e quero conversar sobre treinamento de IA para a minha equipe.",
    spotlite: "Olá! Vim pelo site da Reset IA e quero fazer o diagnóstico Spotlite do meu setor.",
    fluxa: "Olá! Vim pelo site da Reset IA e quero que vocês mapeiem um processo da minha empresa com a Fluxa BPM.",
  },
  email: "contato@resetia.com.br",
  redes: {
    instagram: "https://www.instagram.com/odiegonog", // [FALTA] Reset IA terá perfil próprio?
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
  ctaHeader: "Fale conosco",
  ctaGeral: "Falar com um especialista",
  ctaSpotlite: "Pedir o diagnóstico do meu setor",
  ctaSpotliteSite: "Conhecer a Spotlite",
  ctaFluxaSite: "Conhecer a Fluxa BPM",
  ctaFluxaGratis: "Mapear um processo grátis",
  ctaFluxaServico: "Pedir para a Reset IA mapear um processo",
  /** Microcopy sob os botões: tira a fricção de "vai cair num formulário". */
  semFormulario: "WhatsApp direto, sem formulário.",
  barraMobile: "Falar no WhatsApp",
} as const;

export const nav: Link[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Produtos", href: "/produtos" },
  { label: "Sobre", href: "/sobre" },
];

/** Tom do fundo da página: define header, logo e cor base. */
export const tomPorRota: Record<string, Tom> = {
  "/": "carvao",
  "/solucoes": "neutro",
  "/produtos": "carvao",
  "/spotlite": "carvao",
  "/sobre": "neutro",
  "/privacidade": "neutro",
};

export const footer = {
  frase: "Um novo ciclo de possibilidades.",
  colunas: {
    navegacao: "Navegação",
    contato: "Contato",
    redes: "Redes e ferramentas",
  },
  redes: [
    { label: "Instagram", href: site.redes.instagram },
    { label: "Spotlite", href: site.ferramentas.spotlite },
    { label: "Fluxa BPM", href: site.ferramentas.fluxa },
  ] satisfies Link[],
  legal: [`© ${site.ano} Reset IA`, site.cidades],
  privacidade: { label: "Política de privacidade", href: "/privacidade" } satisfies Link,
};

export const seo = {
  home: {
    title: "Reset IA — Treinamento de IA para equipes | IA sem hype",
    description:
      "Consultoria de inteligência artificial para negócios. Treinamos equipes com diagnóstico antes, prática durante e medição depois. Spotlite: diagnóstico de IA por setor.",
  },
  solucoes: {
    title: "Treinamentos de IA para equipes | Reset IA",
    description:
      "Letramento em IA, Champions de IA, workshops por ferramenta, Claude Code e uso seguro de IA. Todos online, com exercícios sobre o trabalho real de cada pessoa.",
  },
  produtos: {
    title: "Produtos — Spotlite e Fluxa BPM | Reset IA",
    description:
      "Duas ferramentas próprias da Reset IA. Spotlite: diagnóstico com IA que mostra onde a IA vale a pena, em horas e reais. Fluxa BPM: a IA desenha e melhora os processos.",
  },
  spotlite: {
    title: "Spotlite — diagnóstico de IA | Reset IA",
    description: "A Spotlite agora está na página Produtos da Reset IA.",
  },
  sobre: {
    title: "Quem está por trás da Reset IA",
    description:
      "Diego Nogueira, arquiteto de IA e consultor de inovação. Muita prática, pouca teoria. Como a Reset IA trabalha, seus métodos e ferramentas próprias.",
  },
  privacidade: {
    title: "Política de privacidade | Reset IA",
    description: "Como a Reset IA trata os dados de quem visita o site e entra em contato por WhatsApp ou e-mail.",
  },
  naoEncontrada: {
    title: "Página não encontrada | Reset IA",
  },
} as const;

export const naoEncontrada = {
  titulo: "Página não encontrada.",
  apoio: "Vamos reprogramar a rota.",
  link: { label: "Voltar para a home", href: "/" } satisfies Link,
};
