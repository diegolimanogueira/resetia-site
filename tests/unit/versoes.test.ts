import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import {
  desafios,
  horizontes,
  modulosArea,
  niveis,
  perguntasCentrais,
  segmentacao,
} from "@/content/ai-score-questionario";
import { calcular } from "@/lib/ai-score/calcular";
import { codificar, decodificar, respostasVazias } from "@/lib/ai-score/codificar";
import { lerLink } from "@/lib/ai-score/codec";
import { VOCABULARIO } from "@/lib/ai-score/codec/comum";
import { codificarV1, decodificarV1 } from "@/lib/ai-score/codec/v1";
import { codificarV2 } from "@/lib/ai-score/codec/v2";
import { coberturaDe } from "@/lib/ai-score/cobertura";
import { METODOS, metodoAtual, metodoDe } from "@/lib/ai-score/metodo";
import { metodo1 } from "@/lib/ai-score/metodo/metodo-1";
import type { Respostas, Slot } from "@/lib/ai-score/tipos";
import { ANALISE_ATUAL, comparavel, FORMATO_ATUAL, METODO_ATUAL } from "@/lib/ai-score/versoes";

const centrais = (t: string): Slot[] =>
  [...t.replace(/\s/g, "")].map((c) => (c === "-" ? undefined : c === "x" ? null : (Number(c) as Slot)));

const base = (t: string, extra: Partial<Respostas> = {}): Respostas => ({
  ...respostasVazias(),
  escopo: "empresa",
  papel: "ceo",
  porte: "50-199",
  segmento: "tecnologia",
  desafios: ["comecar"],
  horizonte: "3-meses",
  centrais: centrais(t),
  ...extra,
});

/**
 * Links reais de avaliações antigas (formato 1), copiados como literais: não leem o conteúdo atual, de propósito.
 * Se um destes testes falhar, uma avaliação já gravada passou a ter outra nota: a mudança está errada, não o teste.
 */
const GOLDEN_V1_EXEMPLO =
  "v=1&e=empresa&p=ceo&t=50-199&s=servicos-b2b&r=322221211x1x&a=marketing,vendas&am=2112&av=1201&d=repetitivas,governanca&h=3-meses&id=00000000-0000-4000-8000-000000000000";
const GOLDEN_V1_COMPLETO =
  "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=marketing,customer-success&am=12x3&ac=0014&d=agentes,medir&h=3-meses&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f";

describe("método 1 congelado", () => {
  it("é o método atual e está idêntico ao literal de 28/10", () => {
    expect(metodoAtual).toBe(metodo1);
    expect(METODO_ATUAL).toBe("1");
    expect(metodo1).toEqual({
      versao: "1",
      pontos: [0, 15, 40, 70, 100],
      pesoMenorDimensao: 2,
      minimoRespondidas: 10,
      dimensaoDaPergunta: [
        "estrategia",
        "estrategia",
        "pessoas",
        "pessoas",
        "processos",
        "processos",
        "dados",
        "dados",
        "governanca",
        "governanca",
        "resultados",
        "resultados",
      ],
      niveis: [
        { id: "inicial", min: 0, max: 19 },
        { id: "explorando", min: 20, max: 39 },
        { id: "desenvolvimento", min: 40, max: 59 },
        { id: "estruturada", min: 60, max: 79 },
        { id: "avancada", min: 80, max: 100 },
      ],
    });
  });

  it("não se altera em tempo de execução", () => {
    expect(Object.isFrozen(metodo1)).toBe(true);
    expect(Object.isFrozen(metodo1.pontos)).toBe(true);
    expect(Object.isFrozen(metodo1.niveis)).toBe(true);
    expect(() => {
      (metodo1.pontos as unknown as number[])[1] = 25;
    }).toThrow();
  });

  it("está de acordo com o conteúdo do questionário (níveis e dimensão de cada pergunta)", () => {
    expect(metodo1.dimensaoDaPergunta).toEqual(perguntasCentrais.map((p) => p.dimensao));
    expect(metodo1.niveis).toEqual(niveis.map((n) => ({ id: n.id, min: n.min, max: n.max })));
  });

  it("o registro conhece só métodos que existem e ignora nomes herdados do objeto", () => {
    expect(Object.keys(METODOS)).toEqual(["1"]);
    expect(metodoDe("1")).toBe(metodo1);
    for (const v of ["0", "2", "", "constructor", "__proto__", "toString"]) expect(metodoDe(v)).toBeUndefined();
  });

  it("só notas do mesmo método são comparáveis", () => {
    expect(comparavel({ metodo: "1" }, { metodo: "1" })).toBe(true);
    expect(comparavel({ metodo: "1" }, { metodo: "2" })).toBe(false);
  });

  it("o cálculo recebe o método: trocar a regra muda a nota sem mexer na do método 1", () => {
    const r = base("33 22 21 22 11 21");
    expect(calcular(r, metodo1).indice).toBe(34);
    const linear = { ...metodo1, versao: "teste", pontos: [0, 25, 50, 75, 100] as const, pesoMenorDimensao: 1 };
    expect(calcular(r, linear).indice).not.toBe(34);
    expect(calcular(r).indice).toBe(34);
  });
});

describe("cobertura das respostas", () => {
  it("caso de regressão do pedido: uma resposta baixa vira 'Não sei' e a nota sobe de 86 para 100", () => {
    const completa = base("40 44 44 44 44 44");
    const comNaoSei = base("4x 44 44 44 44 44");
    const a = calcular(completa);
    const b = calcular(comNaoSei);
    expect(a.indice).toBe(86);
    expect(b.indice).toBe(100);

    // A nota sozinha engana; a cobertura diz o que aconteceu.
    const ca = coberturaDe(completa.centrais, a);
    const cb = coberturaDe(comNaoSei.centrais, b);
    expect(ca).toMatchObject({ validas: 12, total: 12, situacao: "completa", umaResposta: [], naoSei: [] });
    expect(cb).toMatchObject({
      validas: 11,
      total: 12,
      situacao: "estimativa",
      umaResposta: ["estrategia"],
      naoSei: [1],
    });
    expect(cb.porDimensao.estrategia).toEqual({ validas: 1, total: 2 });
    expect(cb.porDimensao.pessoas).toEqual({ validas: 2, total: 2 });
  });

  it("estimativa: nota calculável com ao menos um 'Não sei'; parcial: sem nota consolidada", () => {
    const parcial = base("4x 2x 2x 22 22 22");
    const c = coberturaDe(parcial.centrais, calcular(parcial));
    expect(c).toMatchObject({ situacao: "parcial", validas: 9 });
    expect(c.naoSei).toEqual([1, 3, 5]);

    const semDimensao = base("22 22 22 22 xx 22");
    const d = coberturaDe(semDimensao.centrais, calcular(semDimensao));
    expect(d.situacao).toBe("parcial");
    expect(d.semResposta).toEqual(["governanca"]);
  });

  it("o exemplo público tem 10 de 12 respostas: duas dimensões com uma resposta só", () => {
    const r = decodificarV1(GOLDEN_V1_EXEMPLO)!;
    const c = coberturaDe(r.centrais, calcular(r));
    expect(c).toMatchObject({ validas: 10, total: 12, situacao: "estimativa" });
    expect(c.umaResposta).toEqual(["governanca", "resultados"]);
    expect(c.naoSei).toEqual([9, 11]);
  });
});

describe("links: formato 1 congelado e formato 2", () => {
  it("o formato 1 continua dando as mesmas notas (golden)", () => {
    const e = decodificarV1(GOLDEN_V1_EXEMPLO)!;
    expect(calcular(e)).toMatchObject({ indice: 28, nivel: "explorando", respondidas: 10, parcial: false });
    expect(calcular(e).dimensoes).toEqual({
      estrategia: 55,
      pessoas: 40,
      processos: 27.5,
      dados: 27.5,
      governanca: 15,
      resultados: 15,
    });
    const c = decodificarV1(GOLDEN_V1_COMPLETO)!;
    expect(calcular(c)).toMatchObject({ indice: 34, nivel: "explorando" });
    // O exemplo público de hoje, já no formato 2, é exatamente o mesmo caso do golden do formato 1.
    expect(aiScore.exemplo.codigo.startsWith("v=2&m=1&n=2&")).toBe(true);
    expect(decodificar(aiScore.exemplo.codigo)).toEqual(e);
  });

  it("lerLink identifica o formato 1 como anterior ao versionamento: método 1, sem versão de análise", () => {
    const l = lerLink(GOLDEN_V1_EXEMPLO);
    expect(l).toMatchObject({ tipo: "ok", formato: "1", metodo: "1", analise: null, analiseMaisNova: false });
    expect(lerLink(`#${GOLDEN_V1_EXEMPLO}`).tipo).toBe("ok");
  });

  it("o formato 2 carrega método e análise e dá as mesmas respostas que o 1", () => {
    const r = decodificarV1(GOLDEN_V1_COMPLETO)!;
    const v2 = codificar(r);
    expect(FORMATO_ATUAL).toBe("2");
    expect(v2.startsWith(`v=2&m=${METODO_ATUAL}&n=${ANALISE_ATUAL}&`)).toBe(true);
    const l = lerLink(v2);
    expect(l).toMatchObject({ tipo: "ok", formato: "2", metodo: "1", analise: ANALISE_ATUAL, analiseMaisNova: false });
    if (l.tipo === "ok") expect(l.respostas).toEqual(r);
    // Mesma avaliação, mesma nota, em qualquer formato.
    expect(calcular(decodificar(v2)!)).toEqual(calcular(r));
    // O formato 1 ainda se gera e se lê, para testes e rascunhos antigos.
    expect(decodificarV1(codificarV1(r))).toEqual(r);
  });

  it("versão de análise mais nova que a do site: só a nota é confiável; mais antiga: lida com a análise atual", () => {
    const r = decodificarV1(GOLDEN_V1_COMPLETO)!;
    const nova = codificarV2(r, { metodo: "1", analise: String(Number(ANALISE_ATUAL) + 1) });
    expect(lerLink(nova)).toMatchObject({ tipo: "ok", analiseMaisNova: true });
    const antiga = codificarV2(r, { metodo: "1", analise: "1" });
    expect(lerLink(antiga)).toMatchObject({ tipo: "ok", analise: "1", analiseMaisNova: false });
  });

  it("estados que a tela e o painel distinguem", () => {
    const ok = codificar(decodificarV1(GOLDEN_V1_COMPLETO)!);
    expect(lerLink("")).toEqual({ tipo: "vazio" });
    expect(lerLink("#")).toEqual({ tipo: "vazio" });
    expect(lerLink("   ")).toEqual({ tipo: "vazio" });
    expect(lerLink(null)).toEqual({ tipo: "vazio" });
    expect(lerLink(undefined)).toEqual({ tipo: "vazio" });
    // Método que este site não conhece (link de uma versão futura).
    expect(lerLink(ok.replace("m=1", "m=2"))).toEqual({ tipo: "metodo-desconhecido", metodo: "2" });
    // Formato que não existe.
    expect(lerLink(ok.replace("v=2", "v=3")).tipo).toBe("formato-desconhecido");
    expect(lerLink("abc=def").tipo).toBe("formato-desconhecido");
    expect(lerLink("e=empresa&r=332221221121").tipo).toBe("formato-desconhecido");
    // Adulterados.
    expect(lerLink(ok.replace("r=332221221121", "r=33222122112")).tipo).toBe("invalido");
    expect(lerLink(ok.replace("e=empresa", "e=governo")).tipo).toBe("invalido");
    expect(lerLink(ok.replace("m=1", "m=01")).tipo).toBe("invalido");
    expect(lerLink(ok.replace("m=1", "m=")).tipo).toBe("invalido");
    expect(lerLink(ok.replace("n=2", "n=x")).tipo).toBe("invalido");
    expect(lerLink(ok.replace("m=1&n=2&", "")).tipo).toBe("invalido");
    expect(lerLink(`${ok}&e=vendas`).tipo).toBe("invalido");
    expect(lerLink(GOLDEN_V1_EXEMPLO.replace("e=empresa", "e=governo")).tipo).toBe("invalido");
  });

  it("token e lead do link do e-mail ficam fora das respostas e nunca entram no código gravado", () => {
    const r = decodificarV1(GOLDEN_V1_COMPLETO)!;
    const comToken = `${codificar(r)}&k=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ&lead=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f`;
    expect(decodificar(comToken)).toEqual(r);
    expect(codificar(r)).not.toMatch(/(^|&)(k|lead)=/);
    const antigo = `${GOLDEN_V1_COMPLETO}&lead=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f`;
    expect(decodificar(antigo)).toEqual(r);
  });

  it("o vocabulário congelado do link cobre todas as opções do conteúdo (acrescentar pode; tirar, não)", () => {
    const ids = (lista: ReadonlyArray<{ id: string }>) => lista.map((o) => o.id);
    const dentro = (vocab: readonly string[], conteudo: string[]) => {
      for (const id of conteudo) expect(vocab, id).toContain(id);
    };
    dentro(VOCABULARIO.escopo, ids(segmentacao.escopo.opcoes));
    dentro(VOCABULARIO.papel, ids(segmentacao.papel.opcoes));
    dentro(VOCABULARIO.porte, ids(segmentacao.porte.opcoes));
    dentro(VOCABULARIO.segmento, ids(segmentacao.segmento.opcoes));
    dentro(
      VOCABULARIO.area,
      modulosArea.map((m) => m.area),
    );
    dentro(VOCABULARIO.desafio, ids(desafios));
    dentro(VOCABULARIO.horizonte, ids(horizontes.opcoes));
  });
});
