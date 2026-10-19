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
  },
  email: "contato@resetia.com.br",
  redes: {
    instagram: "https://www.instagram.com/odiegonog", // [FALTA] Reset IA terá perfil próprio?
  },
  /** Produtos da Reset IA. Sempre que o site fala deles, aponta para cá. */
  ferramentas: {
    spotlite: "https://www.spotlite.com.br/",
    fluxa: "https://www.fluxabpm.com.br/",
  },
  cidades: "Fortaleza e Campinas, Brasil",
  politicaPrivacidade: FALTA,
  ano: 2026,
  ctaHeader: "Fale conosco",
  ctaGeral: "Falar com um especialista",
  ctaSpotlite: "Pedir o diagnóstico do meu setor",
  ctaSpotliteSite: "Conhecer a Spotlite",
  ctaFluxaSite: "Conhecer a Fluxa BPM",
} as const;

export const nav: Link[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Spotlite", href: "/spotlite" },
  { label: "Sobre", href: "/sobre" },
];

/** Tom do fundo da página: define header, logo e cor base. */
export const tomPorRota: Record<string, Tom> = {
  "/": "carvao",
  "/solucoes": "neutro",
  "/spotlite": "carvao",
  "/sobre": "neutro",
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
  legal: [`© ${site.ano} Reset IA`, site.cidades, `Política de privacidade ${site.politicaPrivacidade}`],
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
  spotlite: {
    title: "Spotlite — diagnóstico de IA, automação e processos | Reset IA",
    description:
      "Spotlite, diagnóstico com IA da Reset IA: a equipe inteira responde, a IA mapeia onde as horas vão e quanto IA e automação valem em reais. Nota de 0 a 10 por regra.",
  },
  sobre: {
    title: "Quem está por trás da Reset IA",
    description:
      "Diego Nogueira, arquiteto de IA e consultor de inovação. Muita prática, pouca teoria. Como a Reset IA trabalha, seus métodos e ferramentas próprias.",
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
