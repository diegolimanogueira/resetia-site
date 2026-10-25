/** Fundo da seção. Todas são escuras (reset360); muda só a superfície. */
export type Tom = "carvao" | "escuro" | "contraste";

export interface Link {
  label: string;
  href: string;
}

export interface Passo {
  numero: string;
  titulo: string;
  texto: string;
}

export type Ferramenta = "spotlite" | "fluxa";

/** Títulos são linhas; trechos entre *asteriscos* ficam em destaque verde. */
export interface CtaFinal {
  kicker?: string;
  titulo: string[];
  apoio?: string;
  botao: string;
}

/** Uma das sete soluções do RESET 360. Cada uma tem página própria em /solucoes/[slug]. */
export interface Solucao {
  slug: string;
  num: string;
  nome: string;
  /** Frase curta: aparece nos cards e como lead da página. */
  frase: string;
  /** "O que é": também é a meta description da página. */
  descricao: string;
  paraQuem: string;
  entregas: string[];
  medimos: string;
  /** Bloco extra com link (ex.: Agent Factory aponta para o catálogo de agentes). */
  relacionado?: { titulo: string; texto: string; link: Link };
}

export type AreaId = "marketing" | "vendas" | "customer-success";

export interface Agente {
  area: AreaId;
  nome: string;
  texto: string;
}
