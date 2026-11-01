import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import * as analise from "@/content/ai-score-analise";
import * as questionario from "@/content/ai-score-questionario";
import { calcular } from "@/lib/ai-score/calcular";
import { respostasVazias } from "@/lib/ai-score/codificar";
import { metodoAtual } from "@/lib/ai-score/metodo";
import type { Respostas, Slot } from "@/lib/ai-score/tipos";

/**
 * A metodologia que o visitante lê tem que ser a que o cálculo usa. Em 31/10 a landing dizia "O mesmo peso" enquanto
 * o código contava a menor dimensão em dobro. Estes testes amarram o texto público aos números do método em vigor.
 */

const metodologia = aiScore.metodologia.paragrafos.join(" ");
const faq = aiScore.perguntas.itens.map((i) => `${i.pergunta} ${i.resposta}`).join(" ");
const publico = JSON.stringify([aiScore, questionario, analise]);

const base = (centrais: Slot[]): Respostas => ({ ...respostasVazias(), centrais });

describe("a metodologia publicada é a do cálculo", () => {
  it("lista os pontos de cada alternativa do método em vigor", () => {
    const [ate, ultimo] = [metodoAtual.pontos.slice(0, -1).join(", "), metodoAtual.pontos.at(-1)];
    expect(metodologia).toContain(`(${ate} e ${ultimo})`);
  });

  it("descreve o peso real: a menor dimensão conta em dobro, e a fórmula é soma mais a menor dividida por sete", () => {
    expect(metodoAtual.pesoMenorDimensao).toBe(2);
    expect(metodologia).toMatch(/soma das seis notas mais a menor delas, dividida por sete/);
    expect(metodologia).toMatch(/conta em dobro/);
    expect(metodologia).toMatch(/escolha metodológica da Reset, sujeita a calibração/);
    // O divisor da frase é o do cálculo: dimensões + (peso - 1).
    expect(6 + metodoAtual.pesoMenorDimensao - 1).toBe(7);
  });

  it("a fórmula descrita reproduz o AI Score calculado", () => {
    // Dimensões 100, 70, 40, 15, 70, 40 → soma 335, menor 15, (335 + 15) / 7 = 50.
    const r = calcular(base([4, 4, 3, 3, 2, 2, 1, 1, 3, 3, 2, 2]));
    const notas = Object.values(r.dimensoes) as number[];
    const soma = notas.reduce((a, b) => a + b, 0);
    expect(r.indice).toBe(Math.round((soma + Math.min(...notas)) / 7));
    expect(r.indice).toBe(50);
  });

  it("nenhum texto público anuncia pesos iguais", () => {
    expect(publico).not.toMatch(/mesmo peso|pesos? iguais?|peso igual/i);
  });

  it("explica o mínimo de respostas do método e que Não sei vira estimativa", () => {
    expect(faq).toContain(
      `ao menos ${metodoAtual.minimoRespondidas} das ${metodoAtual.dimensaoDaPergunta.length} respostas`,
    );
    expect(faq).toMatch(/nota passa a ser uma estimativa/);
    expect(metodologia).toMatch(/Menos respostas podem até aumentar a nota/);
    expect(questionario.questionario.naoSeiApoio).toMatch(/estimativa/);
  });

  it("não vende a nota como comparação com o mercado, validação científica ou certificação", () => {
    expect(metodologia).toMatch(/Não é certificação nem comparação com o mercado/);
    expect(publico).not.toMatch(/benchmark|validad[oa] cientificamente|certificad[oa] pela/i);
  });
});
