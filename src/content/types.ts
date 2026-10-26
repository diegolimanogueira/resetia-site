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

export interface Pergunta {
  pergunta: string;
  resposta: string;
}

export type Ferramenta = "spotlite" | "fluxa";

/** Ícones de linha (lucide) usados no site. O conteúdo escolhe pela chave; o mapa fica em components/ui/icone.tsx. */
export type IconeId =
  | "champions"
  | "processos"
  | "agentes"
  | "governanca"
  | "performance"
  | "diagnostico"
  | "marketing"
  | "vendas"
  | "customer-success";

/** Títulos são linhas; trechos entre *asteriscos* ficam em destaque verde. */
export interface CtaFinal {
  kicker?: string;
  titulo: string[];
  apoio?: string;
  botao: string;
}

/** Botão comercial de uma solução: rótulo próprio e mensagem de WhatsApp com o contexto. */
interface CtaSolucao {
  label: string;
  mensagem: string;
}

/** Uma das cinco soluções do RESET 360. Cada uma tem landing page em /solucoes/[slug]. */
export interface Solucao {
  slug: string;
  num: string;
  nome: string;
  icone: IconeId;
  /** Frase curta: cards e meta description quando não há outra. */
  frase: string;
  /** Headline da landing page (H1). */
  headline: string[];
  /** Parágrafos de abertura. */
  descricao: string[];
  problemas: string[];
  beneficios: string[];
  entregaveis: string[];
  paraQuem: string;
  etapas: Passo[];
  medimos: string;
  cta: CtaSolucao;
  /** Slugs das soluções que costumam andar juntas (links internos). */
  relacionadas: string[];
  seo: { title: string; description: string };
  /** Blocos próprios de algumas soluções. */
  formatos?: { kicker: string; titulo: string[]; itens: Array<{ titulo: string; texto: string }> };
  tecnologia?: { ferramenta: Ferramenta; texto: string };
  destaque?: { titulo: string[]; texto: string };
  indicadores?: { kicker: string; titulo: string[]; itens: Array<{ area: string; texto: string }>; aviso: string };
}

export type AreaId = "marketing" | "vendas" | "customer-success";

export interface Agente {
  area: AreaId;
  nome: string;
  texto: string;
}
