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
  kicker?: string;
  titulo: string;
  apoio?: string;
  botao: string;
}

/** Uma das sete soluções do RESET 360. Cada uma tem página própria em /solucoes/[slug]. */
export interface Solucao {
  slug: string;
  num: string;
  nome: string;
  /** Frase curta: aparece nas listas e como lead da página. */
  frase: string;
  /** "O que é": também é a meta description da página. */
  descricao: string;
  paraQuem: string;
  entregas: string[];
  medimos: string;
  /** Tecnologia própria que acelera a solução. */
  ferramenta?: Ferramenta;
  /** Bloco extra com link (ex.: Agent Factory aponta para o catálogo de agentes). */
  relacionado?: { titulo: string; texto: string; link: Link };
}

export type AreaId = "marketing" | "vendas" | "customer-success";

export interface Agente {
  area: AreaId;
  nome: string;
  texto: string;
}
