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

/** Bloco de seção com título em linhas. */
interface Bloco<T> {
  titulo: string[];
  itens: T[];
}

/**
 * Uma das cinco soluções do RESET 360. Cada uma tem landing page em /solucoes/[slug], na ordem:
 * hero, sobre, benefícios, (exemplos), entregáveis, (blocos próprios), para quem, como funciona, CTA final.
 */
export interface Solucao {
  slug: string;
  num: string;
  nome: string;
  icone: IconeId;
  /** Frase curta: cards da home e da página de soluções. */
  frase: string;
  /** Headline da landing page (H1). */
  headline: string[];
  /** Parágrafos do hero. */
  descricao: string[];
  cta: CtaSolucao;
  /** Botão secundário do hero: âncora para uma seção da própria página. */
  ctaSecundario: Link;
  sobre: { titulo: string[]; paragrafos: string[] };
  beneficios: Bloco<{ titulo: string; texto: string }>;
  entregaveis: Bloco<string> & { nota?: string };
  paraQuem: Bloco<string>;
  etapas: Passo[];
  ctaFinal: { titulo: string[]; texto: string; botao: string };
  /** Slugs das soluções que costumam andar juntas (links internos). */
  relacionadas: string[];
  seo: { title: string; description: string };
  /** Tecnologia própria que acelera a solução (Processos com IA → Fluxa BPM). */
  tecnologia?: { ferramenta: Ferramenta; kicker: string; titulo: string[]; paragrafos: string[]; cta: string };
  /** O que pode ser medido (Performance). */
  medicao?: { kicker: string; titulo: string[]; itens: Array<{ area: string; texto: string }>; aviso: string };
}

export type AreaId = "marketing" | "vendas" | "customer-success";

export interface Agente {
  area: AreaId;
  nome: string;
  texto: string;
}
