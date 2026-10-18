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
    linkedinEmpresa: "https://www.linkedin.com/company/resetia", // [FALTA] confirmar slug
    linkedinDiego: "https://www.linkedin.com/in/diegonogueira1",
    instagram: "https://www.instagram.com/odiegonog", // [FALTA] Reset IA terá perfil próprio?
  },
  cidades: "Fortaleza e Campinas, Brasil",
  cnpj: FALTA,
  politicaPrivacidade: FALTA,
  ano: 2026,
  ctaHeader: "Fale conosco",
  ctaGeral: "Falar com um especialista",
  ctaSpotlite: "Pedir o diagnóstico do meu setor",
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
    redes: "Redes",
  },
  redes: [
    { label: "LinkedIn Reset IA", href: site.redes.linkedinEmpresa },
    { label: "LinkedIn Diego", href: site.redes.linkedinDiego },
    { label: "Instagram", href: site.redes.instagram },
  ] satisfies Link[],
  legal: [
    `© ${site.ano} Reset IA`,
    `CNPJ ${site.cnpj}`,
    site.cidades,
    `Política de privacidade ${site.politicaPrivacidade}`,
  ],
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
      "Diagnóstico de inteligência artificial, automação e processos. Por pessoa, por setor, antes e depois. Nota de maturidade, atividades automatizáveis e economia estimada.",
  },
  sobre: {
    title: "Quem está por trás da Reset IA",
    description:
      "Diego Nogueira, arquiteto de IA e consultor de inovação. Muita prática, pouca teoria. Como a Reset IA trabalha e seus métodos próprios.",
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
