import { regras } from "./regras";
import type { LeadVisao } from "./leads";

/**
 * Fila dos pedidos de conversa: quem pediu para falar com um especialista, há quanto tempo, se alguém já respondeu e
 * o que está pendente. Só entra quem pediu; quem apenas concluiu a avaliação não entra em nenhuma cadência.
 */

export type Pendencia = "sem-responsavel" | "sem-resposta" | "sem-retorno-marcado" | "retorno-atrasado" | "sem-canal";

export interface ItemDaFila {
  visao: LeadVisao;
  /** Horas desde o pedido; `null` nos leads anteriores a 01/11/2026 (o momento do pedido não foi guardado). */
  esperaEmHoras: number | null;
  respondido: boolean;
  /** Horas do pedido até a primeira resposta humana, quando os dois momentos existem. */
  ateAPrimeiraRespostaEmHoras: number | null;
  pendencias: Pendencia[];
}

const horasEntre = (de: string, ate: string | number | Date) =>
  (new Date(ate).getTime() - new Date(de).getTime()) / 3_600_000;
const ENCERRADOS = ["cliente", "descartado"];

export function filaDeConversas(
  leads: LeadVisao[],
  agora: Date,
  hoje: string,
  /** Leads com algum canal de contato liberado (o banco confere as escolhas); `null` enquanto não carregou. */
  comCanal: ReadonlySet<string> | null = null,
): ItemDaFila[] {
  return leads
    .filter((v) => v.lead.pediu_contato && !ENCERRADOS.includes(v.lead.status))
    .map((visao): ItemDaFila => {
      const l = visao.lead;
      const respondido = l.primeira_resposta_em !== null;
      const espera = l.pedido_conversa_em ? horasEntre(l.pedido_conversa_em, agora) : null;
      const pendencias: Pendencia[] = [];
      if (!l.responsavel) pendencias.push("sem-responsavel");
      if (!respondido && (espera === null || espera >= regras.conversa.respostaEmHoras))
        pendencias.push("sem-resposta");
      if (!l.proximo_contato) pendencias.push("sem-retorno-marcado");
      else if (l.proximo_contato < hoje) pendencias.push("retorno-atrasado");
      if (comCanal && !comCanal.has(l.id)) pendencias.push("sem-canal");
      return {
        visao,
        esperaEmHoras: espera,
        respondido,
        ateAPrimeiraRespostaEmHoras:
          l.pedido_conversa_em && l.primeira_resposta_em
            ? Math.max(0, horasEntre(l.pedido_conversa_em, l.primeira_resposta_em))
            : null,
        pendencias,
      };
    })
    .sort((a, b) => {
      // Sem resposta primeiro (o mais antigo na frente; sem momento guardado, por último entre eles), depois os respondidos.
      if (a.respondido !== b.respondido) return a.respondido ? 1 : -1;
      return (b.esperaEmHoras ?? -1) - (a.esperaEmHoras ?? -1);
    });
}

const mediana = (xs: number[]) => {
  if (!xs.length) return null;
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

/** Resumo da fila: quantos aguardam, quantos passaram do prazo e o tempo mediano até a primeira resposta. */
export function resumoDaFila(itens: ItemDaFila[]) {
  const aguardando = itens.filter((i) => !i.respondido);
  const tempos = itens.map((i) => i.ateAPrimeiraRespostaEmHoras).filter((h): h is number => h !== null);
  return {
    pedidos: itens.length,
    aguardando: aguardando.length,
    passaramDoPrazo: aguardando.filter(
      (i) => i.esperaEmHoras !== null && i.esperaEmHoras >= regras.conversa.respostaEmHoras,
    ).length,
    semResponsavel: itens.filter((i) => i.pendencias.includes("sem-responsavel")).length,
    /** Pedidos respondidos que têm os dois momentos: a base do tempo mediano. */
    comTempoMedido: tempos.length,
    medianaAtePrimeiraRespostaEmHoras: mediana(tempos),
    /** Pedidos antigos, sem o momento guardado: aparecem na fila, mas não entram em nenhuma média. */
    semMomentoDoPedido: itens.filter((i) => i.esperaEmHoras === null).length,
  };
}
