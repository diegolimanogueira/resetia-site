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

export interface Recomendacao {
  /** Maior dimensão, quando se destaca (nota mínima e acima da menor). */
  forte: DimensaoId | null;
  /** Dimensões com nota, da menor para a maior. A primeira é a principal oportunidade. */
  lacunas: DimensaoId[];
  /** Até três próximos passos. */
  passos: string[];
  /** Slugs das soluções indicadas (no máximo duas). */
  solucoes: string[];
}
