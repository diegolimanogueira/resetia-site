import type {
  AreaId,
  DesafioId,
  DimensaoId,
  Escopo,
  HorizonteId,
  NivelId,
  PapelId,
  PorteId,
  SegmentoId,
} from "@/content/types";

/** Pontos de uma alternativa (0 a 4) ou `null` para "Não sei responder". */
export type Resposta = 0 | 1 | 2 | 3 | 4 | null;
/** `undefined` = pergunta ainda sem resposta (só existe no rascunho). */
export type Slot = Resposta | undefined;

/** Tudo o que a pessoa respondeu. Os campos opcionais faltam enquanto o questionário está em andamento. */
export interface Respostas {
  id?: string;
  escopo?: Escopo;
  papel?: PapelId;
  porte?: PorteId;
  segmento?: SegmentoId;
  /** Áreas com módulo de quatro perguntas: as escolhidas (visão empresa) ou a própria área (visão por área). */
  areas: AreaId[];
  /** As 12 perguntas centrais, na ordem do conteúdo. */
  centrais: Slot[];
  porArea: Partial<Record<AreaId, Slot[]>>;
  desafios: DesafioId[];
  horizonte?: HorizonteId;
}

/** Respostas completas: o que o resultado precisa. */
export type RespostasCompletas = Required<Omit<Respostas, "id">> & { id?: string };

export interface Resultado {
  /** Nota de 0 a 100 por dimensão; `null` quando a dimensão não tem resposta válida. */
  dimensoes: Record<DimensaoId, number | null>;
  /** Perguntas centrais com resposta válida (sem contar "Não sei responder"). */
  respondidas: number;
  /** Menos de 10 respostas válidas ou alguma dimensão vazia: sem nota consolidada. */
  parcial: boolean;
  /** Média das dimensões com nota, mesmo no parcial (arredondada). Usada nas travas de recomendação. */
  media: number | null;
  /** AI Score: inteiro de 0 a 100, `null` no resultado parcial. */
  indice: number | null;
  nivel: NivelId | null;
  /** Índice de Aplicação de IA na Área (0 a 100) das áreas avaliadas. Nunca entra no AI Score. */
  areas: Partial<Record<AreaId, number | null>>;
}

export type Faixa = "baixa" | "media" | "alta";

/** Em que se apoia uma conclusão: a nota de uma dimensão, um desafio declarado ou uma resposta específica. */
export type Apoio =
  | { tipo: "dimensao"; id: DimensaoId; nota: number }
  | { tipo: "desafio"; id: DesafioId }
  | { tipo: "resposta"; ref: string; valor: number };

/** Condição para indicar uma solução: a resposta (`ref`, p1 a p12) precisa chegar a `minimo`. */
export interface Condicao {
  ref: string;
  minimo: number;
  situacao: "atendida" | "pendente" | "sem-resposta";
}

/** O que decidiu uma ordem quando as notas empatavam (nunca a posição na lista). */
export type CriterioDeDesempate = "desafio" | "evidencia-direta" | "resposta-mais-baixa" | "dependencia";

export interface Indicacao {
  slug: string;
  /** `indicada`: há evidência direta e as condições estão atendidas. `investigar`: falta uma das duas. */
  forca: "indicada" | "investigar";
  apoios: Apoio[];
  /** Há apoio direto (uma dimensão ou um desafio compatível com as respostas)? */
  direta: boolean;
  condicoes: Condicao[];
  /** Quando esta posição foi decidida por um empate. */
  criterio?: CriterioDeDesempate;
}

/** Desafio declarado e o que as respostas dizem dele. */
export interface LeituraDoDesafio {
  id: DesafioId;
  /** `sustentado`: a dimensão dele está abaixo do limite; `contradiz`: respostas altas, exige validação. */
  situacao: "sustentado" | "contradiz" | "sem-resposta";
  dimensao: DimensaoId;
  nota: number | null;
}

export interface Recomendacao {
  /** Maior dimensão, quando se destaca (nota mínima e acima da menor). */
  forte: DimensaoId | null;
  /** Todas as dimensões empatadas na maior nota, quando ela se destaca. */
  fortes: DimensaoId[];
  /** Lacunas de maturidade: só dimensões abaixo do limite, da mais frágil para a menos. Pode ser vazio. */
  lacunas: DimensaoId[];
  /** Em lacunas empatadas, o critério que decidiu a ordem. */
  desempate: Partial<Record<DimensaoId, CriterioDeDesempate>>;
  /** Até duas soluções, cada uma com a evidência, as condições e a força da indicação. Pode ser vazio. */
  indicacoes: Indicacao[];
  /** Slugs das soluções de `indicacoes`, na mesma ordem (indicadas ou a investigar). */
  solucoes: string[];
  /** Cada desafio declarado frente às respostas. */
  desafios: LeituraDoDesafio[];
}
