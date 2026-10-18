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
  formato: string;
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
  nivel: string;
  pct: number;
}

export interface CardSpotlite {
  setor: string;
  tag: string;
  nota: number;
  notaLabel: string;
  antesLabel: string;
  barras: BarraExemplo[];
  atividades: { valor: number; label: string };
  economia: { valor: number; unidade: string; label: string };
}

export interface CtaFinal {
  titulo: string;
  botao: string;
}
