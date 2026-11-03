import {
  aprofundar as t,
  consequencias,
  dadosDisponiveis,
  OUTRA,
  papeisNaDecisao,
  periodos,
  rotinas,
} from "@/content/ai-score-aprofundamento";
import type { Aprofundamento, Esforco } from "./aprofundamento";

/**
 * O aprofundamento em texto: o resumo do que foi informado e o esforço com as premissas. É o mesmo na tela e no PDF.
 * Tudo é o que a pessoa declarou; nada vira dinheiro nem promessa de ganho.
 */

const numeroBR = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const rotuloDe = (lista: ReadonlyArray<{ id: string; label: string }>, id: string | undefined) =>
  lista.find((o) => o.id === id)?.label;
const extenso = (id: string) => periodos.find((p) => p.id === id)?.extenso ?? id;

/** Pares (rótulo, resposta) do que foi informado, com "Não sei" e "Não respondido" ditos como tais. */
export function linhasDoResumo(valor: Aprofundamento): Array<[string, string]> {
  const r = t.resumo;
  const sei = (campo: Aprofundamento["naoSei"][number]) => valor.naoSei.includes(campo);
  const linhas: Array<[string, string]> = [
    [r.area, t.area.nomes[valor.area]],
    [
      r.rotina,
      sei("rotina")
        ? r.naoSei
        : valor.rotina === OUTRA
          ? (valor.rotinaOutra ?? r.naoRespondido)
          : (rotinas[valor.area].find((o) => o.id === valor.rotina)?.label ?? r.naoRespondido),
    ],
    [
      r.volume,
      sei("volume")
        ? r.naoSei
        : valor.volume !== undefined && valor.unidade && valor.periodo
          ? t.volume.resumo(numeroBR(valor.volume), valor.unidade, extenso(valor.periodo))
          : r.naoRespondido,
    ],
    [
      r.consequencia,
      sei("consequencia")
        ? r.naoSei
        : valor.consequencia === OUTRA
          ? (valor.consequenciaOutra ?? r.naoRespondido)
          : (rotuloDe(consequencias, valor.consequencia) ?? r.naoRespondido),
    ],
  ];
  if (valor.camada === 2)
    linhas.push(
      [
        r.minutos,
        sei("minutos")
          ? r.naoSei
          : valor.minutos !== undefined
            ? r.minutosValor(numeroBR(valor.minutos))
            : r.naoRespondido,
      ],
      [r.ferramentas, valor.ferramentas.length ? valor.ferramentas.join(", ") : r.naoRespondido],
      [r.dados, rotuloDe(dadosDisponiveis, valor.dados) ?? r.naoRespondido],
      [r.indicador, valor.indicador ?? r.naoRespondido],
      [r.papel, rotuloDe(papeisNaDecisao, valor.papelDecisor) ?? r.naoRespondido],
    );
  return linhas;
}

/** O esforço em texto: a conta com as premissas, ou o que falta para poder calculá-lo. */
export function textoDoEsforco(esforco: Esforco) {
  const e = t.esforco;
  return esforco.calculavel
    ? {
        titulo: e.titulo,
        conta: e.formula(
          numeroBR(esforco.volume),
          esforco.unidade,
          extenso(esforco.periodo),
          numeroBR(esforco.minutos),
          numeroBR(esforco.horas),
        ),
        itens: [...e.premissas],
      }
    : { titulo: e.falta.titulo, conta: null, itens: esforco.falta.map((f) => e.falta[f]) };
}
