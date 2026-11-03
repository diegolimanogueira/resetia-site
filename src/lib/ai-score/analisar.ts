import { desafios, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DimensaoId, NivelId } from "@/content/types";
import { detectarAlertas, type Alerta } from "./alertas";
import { dimensoesDo, indiceDe, nivelDe } from "./calcular";
import { metodoAtual, type Metodo } from "./metodo";
import { regras } from "./regras";
import type { CriterioDeDesempate, Recomendacao, Resposta, Respostas, Resultado } from "./tipos";

/**
 * Leitura detalhada do resultado para o relatório completo, por regra fixa (sem IA): próximo nível, lacunas de
 * maturidade, cada resposta com o estágio de hoje e o próximo, pontos cegos, alertas (padrões entre respostas, em
 * ./alertas) e simulação de evolução. O plano, as indicações e o resumo executivo estão em ./sintese.
 */

type Prioridade = "critica" | "alta" | "media";

export interface Analise {
  proximoNivel: { nivel: NivelId; faltam: number } | null;
  /** Só as lacunas de maturidade (dimensões abaixo do limite), da mais frágil para a menos. Pode ser vazio. */
  prioridades: Array<{
    dimensao: DimensaoId;
    nota: number;
    prioridade: Prioridade;
    desafio: boolean;
    criterio?: CriterioDeDesempate;
  }>;
  respostas: Array<{ indice: number; dimensao: DimensaoId; atual: Resposta | undefined; proximo: string | null }>;
  pontosCegos: number[];
  alertas: Alerta[];
  simulacao: { alvo: number; de: number; para: number; nivel: NivelId; dimensoes: DimensaoId[] } | null;
}

function prioridadeDe(nota: number): Prioridade {
  const p = regras.prioridades;
  return nota < p.critica ? "critica" : nota < p.alta ? "alta" : "media";
}

/** Simulação matemática da escala: não prevê produtividade, receita nem retorno financeiro. */
function simular(n: Record<DimensaoId, number | null>, indice: number | null, metodo: Metodo): Analise["simulacao"] {
  if (indice === null) return null;
  const ordem = dimensoesDo(metodo);
  const notas = ordem.map((id) => n[id]!);
  const alvo = regras.alvosSimulacao.find((x) => notas.some((nota) => nota < x));
  if (alvo === undefined) return null;
  const sobem = ordem.filter((id) => n[id]! < alvo);
  const para = indiceDe(
    notas.map((nota) => Math.max(nota, alvo)),
    metodo,
  );
  return { alvo, de: indice, para, nivel: nivelDe(para, metodo), dimensoes: sobem };
}

export function analisar(r: Respostas, resultado: Resultado, rec: Recomendacao, metodo: Metodo = metodoAtual): Analise {
  const n = resultado.dimensoes;
  const escolhidos = r.desafios;
  const temaDesafio = new Set(escolhidos.map((id) => desafios.find((d) => d.id === id)!.dimensao));

  // Próximo nível a partir do AI Score.
  let proximoNivel: Analise["proximoNivel"] = null;
  if (resultado.indice !== null && resultado.nivel) {
    const i = metodo.niveis.findIndex((x) => x.id === resultado.nivel);
    const prox = metodo.niveis[i + 1];
    if (prox) proximoNivel = { nivel: prox.id, faltam: prox.min - resultado.indice };
  }

  const prioridades = rec.lacunas.map((id) => ({
    dimensao: id,
    nota: n[id]!,
    prioridade: prioridadeDe(n[id]!),
    desafio: temaDesafio.has(id),
    ...(rec.desempate[id] ? { criterio: rec.desempate[id] } : {}),
  }));

  const respostas = perguntasCentrais.map((p, i) => {
    const atual = r.centrais[i];
    const proximo = typeof atual === "number" && atual < 4 ? p.alternativas[atual + 1] : null;
    return { indice: i, dimensao: p.dimensao, atual, proximo };
  });
  const pontosCegos = respostas.filter((x) => x.atual === null).map((x) => x.indice);

  return {
    proximoNivel,
    prioridades,
    respostas,
    pontosCegos,
    alertas: detectarAlertas(r.centrais, resultado, metodo),
    simulacao: simular(n, resultado.indice, metodo),
  };
}
