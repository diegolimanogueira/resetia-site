import { ANALISE_ATUAL } from "../versoes";
import { metodoDe } from "../metodo";
import type { Respostas } from "../tipos";
import { codificarV1, decodificarV1 } from "./v1";
import { codificarV2, decodificarV2 } from "./v2";

/**
 * Leitura de um link do resultado, com estados distintos para a tela e para o painel não tratarem tudo como
 * "inválido": vazio, formato ou método que esta versão do site não conhece, link adulterado, ou ok.
 */
export type LeituraLink =
  | {
      tipo: "ok";
      respostas: Respostas;
      /** Formato do link: "1" (anterior ao versionamento) ou "2". */
      formato: "1" | "2";
      /** Método que calcula a nota deste link (o do link, ou o 1 para o formato 1). */
      metodo: string;
      /** Versão da análise com que foi feita; `null` no formato 1, que não a registrava. */
      analise: string | null;
      /** O link vem de uma análise mais nova que a deste site: só a nota é confiável. */
      analiseMaisNova: boolean;
    }
  | { tipo: "vazio" }
  | { tipo: "invalido" }
  | { tipo: "formato-desconhecido" }
  | { tipo: "metodo-desconhecido"; metodo: string };

export function lerLink(texto: string | null | undefined): LeituraLink {
  const limpo = (texto ?? "").replace(/^#/, "");
  if (!limpo.trim()) return { tipo: "vazio" };
  const v = new URLSearchParams(limpo).get("v");
  if (v === "1") {
    const respostas = decodificarV1(limpo);
    return respostas
      ? { tipo: "ok", respostas, formato: "1", metodo: "1", analise: null, analiseMaisNova: false }
      : { tipo: "invalido" };
  }
  if (v === "2") {
    const l = decodificarV2(limpo);
    if (l.tipo === "invalido") return l;
    if (!metodoDe(l.metodo)) return { tipo: "metodo-desconhecido", metodo: l.metodo };
    return {
      tipo: "ok",
      respostas: l.respostas,
      formato: "2",
      metodo: l.metodo,
      analise: l.analise,
      analiseMaisNova: Number(l.analise) > Number(ANALISE_ATUAL),
    };
  }
  return { tipo: "formato-desconhecido" };
}

/**
 * Código canônico de um link lido: só as respostas e as versões, sem token (`&k=`) nem `&lead=`. É o que o servidor
 * grava e o que o link do resultado repete, no formato do link original (um link do formato 1 continua no 1).
 */
export function codigoCanonico(l: Extract<LeituraLink, { tipo: "ok" }>): string {
  return l.formato === "1"
    ? codificarV1(l.respostas)
    : codificarV2(l.respostas, { metodo: l.metodo, analise: l.analise ?? ANALISE_ATUAL });
}
