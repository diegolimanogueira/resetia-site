export type Tom = "carvao" | "neutro";

export interface Link {
  label: string;
  href: string;
}

export interface Ponto {
  destaque: string;
  texto: string;
}

export interface Passo {
  numero: string;
  titulo: string;
  texto: string;
}

export interface ProgramaResumo {
  nome: string;
  quem: string;
  leva: string;
  desc: string;
}

export interface ProgramaDetalhe {
  num: string;
  nome: string;
  quem: string;
  como: string;
  leva: string;
}

export interface Bloco {
  titulo: string;
  texto: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

interface BarraExemplo {
  label: string;
  valor: string;
  pct: number;
}

/** Mockup do relatório da Spotlite. Espelha a estrutura real do relatório do setor, com dados fictícios. */
export interface CardSpotlite {
  setor: string;
  tag: string;
  nota: number;
  notaLabel: string;
  notaApoio: string;
  barrasTitulo: string;
  barras: BarraExemplo[];
  destaque: { prefixo: string; valor: number; sufixo: string; label: string };
  respondentes: { valor: number; de: number; label: string };
}

export type Ferramenta = "spotlite" | "fluxa";

export interface CtaFinal {
  titulo: string;
  botao: string;
}
