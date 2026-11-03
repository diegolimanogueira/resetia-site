import type { DimensaoId } from "@/content/types";
import { analisar, type Analise } from "./analisar";
import { calcular } from "./calcular";
import { coberturaDe, type Cobertura } from "./cobertura";
import { leituras, type LeituraDaDimensao } from "./leituras";
import { metodoAtual, metodoDe } from "./metodo";
import { recomendar } from "./recomendar";
import { montarSintese, type Sintese } from "./sintese";
import type { Recomendacao, RespostasCompletas, Resultado } from "./tipos";
import { ANALISE_ATUAL, METODO_ATUAL } from "./versoes";

/**
 * Devolutiva: tudo o que a tela, o relatório, o e-mail e o painel mostram de uma avaliação, já calculado, em dados
 * simples (JSON). A tela não importa o motor: ela recebe a devolutiva do servidor (a página de exemplo) ou a pede a
 * este módulo, carregado sob demanda (`motor.ts`). Assim as quatro saídas partem do mesmo cálculo, na mesma versão.
 */

/** De que versão é a avaliação e como a leitura foi feita. */
export interface VersoesDaDevolutiva {
  formato: "1" | "2";
  /** Método que calculou a nota. */
  metodo: string;
  /** Versão de análise registrada no link; `null` no formato 1, que não a registrava. */
  analiseDoLink: string | null;
  /** Versão de análise que gerou os textos desta devolutiva. */
  analiseAtual: string;
  /**
   * Link do formato 1: a nota vem do método 1, congelado, mas o texto de então não foi guardado. A leitura
   * mostrada é a atual, e a tela diz isso em vez de fingir que foi a original.
   */
  anteriorAoVersionamento: boolean;
  /** O link vem de uma análise mais nova que a deste site. */
  analiseMaisNova: boolean;
}

export interface Devolutiva {
  versoes: VersoesDaDevolutiva;
  resultado: Resultado;
  cobertura: Cobertura;
  recomendacao: Recomendacao;
  analise: Analise;
  /** Leitura das seis dimensões, a partir das duas respostas de cada uma. */
  leituras: Record<DimensaoId, LeituraDaDimensao>;
  /** Resumo executivo, oportunidades, indicações com evidência e o roteiro de 90 dias, já em texto. */
  sintese: Sintese;
}

/** O que `lerLink` sabe sobre o link de onde vêm as respostas. */
export interface OrigemDoLink {
  formato: "1" | "2";
  metodo: string;
  analise: string | null;
  analiseMaisNova: boolean;
}

/** Avaliação feita agora, no formato e na versão atuais. */
export const origemAtual: OrigemDoLink = {
  formato: "2",
  metodo: METODO_ATUAL,
  analise: ANALISE_ATUAL,
  analiseMaisNova: false,
};

export function montarDevolutiva(r: RespostasCompletas, origem: OrigemDoLink = origemAtual): Devolutiva {
  const metodo = metodoDe(origem.metodo) ?? metodoAtual;
  const resultado = calcular(r, metodo);
  const recomendacao = recomendar(resultado, r.desafios, r.centrais);
  const cobertura = coberturaDe(r.centrais, resultado, metodo);
  const analise = analisar(r, resultado, recomendacao, metodo);
  const leiturasDaAvaliacao = leituras(r.centrais, r.escopo === "empresa" ? "empresa" : "area", metodo);
  return {
    versoes: {
      formato: origem.formato,
      metodo: metodo.versao,
      analiseDoLink: origem.analise,
      analiseAtual: ANALISE_ATUAL,
      anteriorAoVersionamento: origem.formato === "1",
      analiseMaisNova: origem.analiseMaisNova,
    },
    resultado,
    cobertura,
    recomendacao,
    analise,
    leituras: leiturasDaAvaliacao,
    sintese: montarSintese(r, resultado, cobertura, recomendacao, analise, leiturasDaAvaliacao),
  };
}
