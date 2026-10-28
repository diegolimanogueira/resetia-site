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
  | "ai-score"
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

/* RESET AI Score ---------------------------------------------------------------------------------------- */

/** As seis dimensões do índice, na ordem em que aparecem (e em que desempatam). */
export type DimensaoId = "estrategia" | "pessoas" | "processos" | "dados" | "governanca" | "resultados";
export type NivelId = "inicial" | "explorando" | "desenvolvimento" | "estruturada" | "avancada";
/** O que a pessoa avalia: a empresa inteira (empresário/diretor) ou a própria área (gestor). */
export type Escopo = "empresa" | AreaId;
export type PapelId = "ceo" | "diretor" | "gestor" | "coordenador" | "especialista" | "outro";
export type PorteId = "ate-10" | "11-49" | "50-199" | "200-499" | "500-mais";
export type SegmentoId = "tecnologia" | "industria" | "servicos-b2b" | "varejo" | "saude" | "educacao" | "outros";
export type DesafioId =
  "comecar" | "pouco-uso" | "capacitar" | "repetitivas" | "agentes" | "custo-ferramentas" | "governanca" | "medir";
export type HorizonteId = "imediato" | "3-meses" | "6-meses" | "explorando";
export type StatusLead = "novo" | "contatado" | "qualificado" | "oportunidade" | "cliente" | "descartado";
export type TipoAtividade = "nota" | "ligacao" | "whatsapp" | "email" | "reuniao" | "status" | "sistema";

export interface Opcao<T extends string> {
  id: T;
  label: string;
  /** Linha de apoio abaixo do rótulo (ex.: a visão empresa explica que dá para aprofundar as áreas). */
  apoio?: string;
}

export interface Dimensao {
  id: DimensaoId;
  num: string;
  nome: string;
  resumo: string;
  /** Ponto forte, quando é a maior nota. */
  forte: string;
  /** Principal oportunidade, quando é a menor nota. */
  lacuna: string;
  /** Próximo passo: `estruturar` abaixo da faixa alta, `evoluir` na faixa alta. */
  passos: { estruturar: string; evoluir: string };
  /** Leitura do relatório completo por faixa de nota. */
  leitura: { baixa: string; media: string; alta: string };
}

/** Pergunta central: duas por dimensão, cinco alternativas (0 a 4 pontos, na ordem) e "Não sei responder". */
export interface PerguntaCentral {
  id: string;
  dimensao: DimensaoId;
  /** O texto muda com o escopo: "Na sua empresa…" ou "Na sua área…". */
  texto: { empresa: string; area: string };
  alternativas: readonly [string, string, string, string, string];
}

export interface ModuloArea {
  area: AreaId;
  nome: string;
  perguntas: Array<{ id: string; texto: string }>;
}

export interface Nivel {
  id: NivelId;
  nome: string;
  min: number;
  max: number;
  descricao: string;
  /** Título e texto da tela de resultado. */
  titulo: string;
  texto: string;
}

export interface Desafio extends Opcao<DesafioId> {
  /** Dimensão ligada ao desafio: evita repetir o mesmo tema nos próximos passos. */
  dimensao: DimensaoId;
  passo: string;
}
