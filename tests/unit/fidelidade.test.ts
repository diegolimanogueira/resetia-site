import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import { leitura as textosLeitura } from "@/content/ai-score-analise";
import { dimensoes, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import { afirmaDosAlertas, detectarAlertas, type AlertaId } from "@/lib/ai-score/alertas";
import { calcular } from "@/lib/ai-score/calcular";
import { decodificar, respostasVazias } from "@/lib/ai-score/codificar";
import type { Afirmacao } from "@/lib/ai-score/evidencia";
import { leituraDaDimensao, leituras, padraoDe } from "@/lib/ai-score/leituras";
import { metodoAtual } from "@/lib/ai-score/metodo";
import type { Slot } from "@/lib/ai-score/tipos";

/**
 * Fidelidade do diagnóstico: nenhuma conclusão pode negar uma alternativa que a pessoa escolheu, e o que não foi
 * respondido aparece como limite, não como conclusão. Os testes percorrem TODAS as combinações de respostas dentro de
 * cada dimensão (6 x 6, incluindo "Não sei") e conferem três coisas que não dependem do código que escolhe o texto:
 *  1. a declaração `afirma` de cada texto (quando ele é verdadeiro) contra as respostas reais;
 *  2. frases que seriam falsas para certas respostas (lista escrita aqui, à mão);
 *  3. propriedades: reconhecer o declarado, citar o próximo estágio literal, pedir validação quando falta resposta.
 */

const NIVEIS: Slot[] = [0, 1, 2, 3, 4, null];
const ids = perguntasCentrais.map((p) => p.id);
const porId = new Map(perguntasCentrais.map((p, i) => [p.id, i]));

/** 12 respostas, com as pedidas e o resto num valor neutro. */
function respostas(dadas: Record<string, Slot>, resto: Slot = 2): Slot[] {
  return perguntasCentrais.map((p) => (p.id in dadas ? dadas[p.id] : resto));
}
const perguntasDe = (d: DimensaoId) => perguntasCentrais.filter((p) => p.dimensao === d);
const nivelDe = (centrais: Slot[], id: string) => centrais[porId.get(id)!];

/**
 * Frases que são falsas quando a pessoa escolheu certos níveis naquela pergunta. Vale para os textos que descrevem
 * a situação (padrão, divergência, validação, estágio mais alto, alertas); o "próximo estágio" cita de propósito a
 * alternativa seguinte, que ainda não é a situação, e é conferido à parte.
 */
const NEGACOES: Array<{ pergunta: string; niveis: number[]; proibido: RegExp }> = [
  { pergunta: "p1", niveis: [3, 4], proibido: /sem (objetivos|prioridades) definid/i },
  { pergunta: "p1", niveis: [0, 1], proibido: /(objetivos|prioridades) (claros|definidos)/i },
  { pergunta: "p2", niveis: [3, 4], proibido: /ninguém|sem liderança|sem quem lidere|liderança informal/i },
  { pergunta: "p2", niveis: [0, 1], proibido: /liderança formal/i },
  { pergunta: "p3", niveis: [0, 1], proibido: /grupos da equipe|faz parte da rotina/i },
  { pergunta: "p3", niveis: [2, 3, 4], proibido: /praticamente não é utilizada|ninguém usa/i },
  {
    pergunta: "p4",
    niveis: [2, 3, 4],
    proibido: /nenhuma capacitação|sem capacitação|não existem iniciativas de capacitação/i,
  },
  {
    pergunta: "p5",
    niveis: [2, 3, 4],
    proibido: /(não|ainda não) (foram|estão|foi|temos) mapead|não mapeamos|sem mapeamento|não temos clareza/i,
  },
  { pergunta: "p5", niveis: [0, 1], proibido: /já (identificamos|mapeamos|foram mapeados|redesenhamos)/i },
  { pergunta: "p6", niveis: [2, 3, 4], proibido: /(ainda )?não participa/i },
  { pergunta: "p6", niveis: [0, 1], proibido: /reutilizad|executa etapas|agentes integrados/i },
  { pergunta: "p7", niveis: [2, 3, 4], proibido: /dispers|fragmentad/i },
  { pergunta: "p8", niveis: [0], proibido: /ferramentas (contratadas|aprovadas|coordenadas|integradas)/i },
  { pergunta: "p9", niveis: [2, 3, 4], proibido: /não existem regras|sem regras|regras (informais|inexistentes)/i },
  { pergunta: "p10", niveis: [3, 4], proibido: /nenhum processo de verificação|sem verificação/i },
  { pergunta: "p11", niveis: [2, 3, 4], proibido: /nenhum acompanhamento|não acompanhamos/i },
  { pergunta: "p12", niveis: [3, 4], proibido: /sem resultados|ainda não iniciamos/i },
];

/** Afirmações que descrevem a situação (todas menos a citação literal da alternativa e o próximo estágio). */
const descritivas = (afs: Afirmacao[]) =>
  afs.filter((a) => !a.id.includes(".declarado.") && !a.id.includes(".proximo."));

/** Textos de leitura por faixa de média usados até 31/10 (análise 1), que contradiziam as respostas. Só como evidência. */
const TEXTO_ANTIGO = {
  processos:
    "A IA ainda não faz parte dos processos. As atividades repetitivas não foram mapeadas e o uso, quando existe, é individual.",
  dados:
    "Os dados estão dispersos e cada pessoa escolhe as próprias ferramentas. Isso dificulta integrar a IA aos processos e controlar custos.",
};

describe("referências estáveis", () => {
  it("as perguntas centrais seguem p1 a p12, na ordem", () => {
    expect(ids).toEqual(Array.from({ length: 12 }, (_, i) => `p${i + 1}`));
  });
});

describe("leitura por dimensão: todas as combinações de respostas", () => {
  for (const d of dimensoes) {
    const [q1, q2] = perguntasDe(d.id);

    it(`${d.nome}: as 36 combinações`, () => {
      for (const a of NIVEIS) {
        for (const b of NIVEIS) {
          const c = respostas({ [q1.id]: a, [q2.id]: b });
          const l = leituraDaDimensao(d.id, c);
          const caso = `${d.id} ${q1.id}=${a} ${q2.id}=${b}`;
          const validas = [a, b].filter((x) => typeof x === "number") as number[];

          // 0. Ids únicos e evidências coerentes com as respostas reais.
          expect(new Set(l.afirmacoes.map((x) => x.id)).size, caso).toBe(l.afirmacoes.length);
          for (const af of l.afirmacoes)
            for (const ev of af.evidencias) {
              expect(ev.tipo, caso).toBe("resposta");
              if (ev.tipo === "resposta") expect(ev.valor, `${caso} ${af.id}`).toBe(nivelDe(c, ev.ref));
            }

          // 1. O que cada texto declara valer tem que valer para as respostas reais.
          for (const af of l.afirmacoes)
            for (const [pergunta, niveis] of Object.entries(af.afirma ?? {})) {
              const real = nivelDe(c, pergunta);
              expect(typeof real === "number" && niveis.includes(real), `${caso}: ${af.id} afirma ${pergunta}`).toBe(
                true,
              );
            }

          // 2. Nenhum texto descritivo nega uma alternativa escolhida.
          for (const af of descritivas(l.afirmacoes))
            for (const n of NEGACOES) {
              const real = nivelDe(c, n.pergunta);
              if (typeof real === "number" && n.niveis.includes(real))
                expect(af.texto, `${caso}: "${af.texto}" nega ${n.pergunta}=${real}`).not.toMatch(n.proibido);
            }

          // 3. Propriedades.
          // 3a. Toda resposta válida é reconhecida com a alternativa escolhida, literal.
          for (const [k, q] of [q1, q2].entries()) {
            const s = [a, b][k];
            const declarado = l.afirmacoes.find((x) => x.id === `leitura.${d.id}.declarado.${q.id}`);
            if (typeof s === "number") {
              expect(declarado?.texto, caso).toBe(q.alternativas[s]);
              expect(declarado?.natureza).toBe("declarado");
            } else expect(declarado, caso).toBeUndefined();
          }

          if (validas.length === 0) {
            // 3b. Sem nenhuma resposta: não há leitura, só o que validar.
            expect(l.padrao, caso).toBe("sem-dados");
            expect(
              l.afirmacoes.every((x) => x.natureza === "validar"),
              caso,
            ).toBe(true);
          } else if (validas.length === 1) {
            // 3c. Uma resposta só: diz que a leitura se apoia em uma e propõe a pergunta que resolve.
            expect(l.padrao, caso).toBe("incompleto");
            const faltou = a === null || a === undefined ? q1 : q2;
            const validar = l.afirmacoes.find((x) => x.natureza === "validar");
            expect(validar?.id, caso).toBe(`leitura.${d.id}.validar.${faltou.id}`);
            expect(validar?.pergunta, caso).toBe(faltou.texto.empresa);
            expect(validar?.texto, caso).toMatch(/Não sei responder/);
            expect(
              l.afirmacoes.some((x) => x.id.endsWith(".padrao")),
              caso,
            ).toBe(false);
          } else {
            // 3d. As duas respostas: a relação descrita bate com os níveis, lida do próprio texto.
            const [x, y] = [a as number, b as number];
            const padrao = l.afirmacoes.find((af) => af.id === `leitura.${d.id}.padrao`)!;
            const aFrente = padrao.texto.match(/^(.+?) (?:está|estão) à frente d[oae]s? (.+?)\. /);
            const { primeira, segunda } = textosLeitura.papeis[d.id];
            const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
            if (Math.abs(x - y) >= 2) {
              expect(aFrente, `${caso}: ${padrao.texto}`).not.toBeNull();
              const sujeito = aFrente![1];
              const sujeitoEhPrimeira = sujeito === maiuscula(primeira.nome);
              expect(sujeitoEhPrimeira || sujeito === maiuscula(segunda.nome), caso).toBe(true);
              expect(sujeitoEhPrimeira ? x > y : y > x, `${caso}: o "à frente" tem que ser o de nível maior`).toBe(
                true,
              );
              // E a divergência pede validação, com a pergunta do tema mais baixo.
              const div = l.afirmacoes.find((af) => af.id === `leitura.${d.id}.divergencia`);
              expect(div?.natureza, caso).toBe("validar");
              expect(div?.pergunta, caso).toBe((x < y ? q1 : q2).texto.empresa);
            } else {
              expect(aFrente, `${caso}: respostas próximas não podem ter um "à frente"`).toBeNull();
              expect(
                l.afirmacoes.some((af) => af.id.endsWith(".divergencia")),
                caso,
              ).toBe(false);
            }
            // 3e. Próximo estágio: cita a alternativa seguinte, literal, do tema mais baixo (os dois, se empatam).
            const menor = Math.min(x, y);
            if (menor === 4)
              expect(
                l.afirmacoes.some((af) => af.id.endsWith(".estagio-mais-alto")),
                caso,
              ).toBe(true);
            else
              for (const [k, q] of [q1, q2].entries()) {
                const nivel = [x, y][k];
                const proximo = l.afirmacoes.find((af) => af.id === `leitura.${d.id}.proximo.${q.id}`);
                if (nivel === menor) {
                  expect(proximo?.texto, caso).toContain(`«${q.alternativas[nivel + 1]}»`);
                  expect(proximo?.texto, caso).toContain("seria:");
                } else expect(proximo, caso).toBeUndefined();
              }
          }
        }
      }
    });
  }
});

describe("o que a auditoria apontou", () => {
  it("processos: 'já mapeamos' com IA ainda fora da execução não vira 'não foram mapeadas'", () => {
    const l = leituraDaDimensao("processos", respostas({ p5: 2, p6: 0 }));
    const texto = l.afirmacoes.map((a) => a.texto).join("\n");
    expect(texto).toContain("Já identificamos ou mapeamos processos com potencial de IA.");
    expect(texto).toContain("O mapeamento dos processos está à frente da participação da IA na execução.");
    expect(texto).not.toMatch(/\bde (a|o|as|os) /);
    expect(texto).not.toMatch(/não foram mapeadas/i);
    // O texto antigo, escolhido pela média (20, faixa baixa), seguia afirmando isso (copiado aqui como evidência):
    expect(TEXTO_ANTIGO.processos).toMatch(/não foram mapeadas/);
    expect(texto).not.toContain(TEXTO_ANTIGO.processos);
  });

  it("dados: 'dados estruturados' não vira 'dados dispersos'", () => {
    const l = leituraDaDimensao("dados", respostas({ p7: 2, p8: 0 }));
    const texto = l.afirmacoes.map((a) => a.texto).join("\n");
    expect(texto).toContain("Temos dados estruturados em ferramentas ou áreas específicas.");
    expect(texto).toContain("A organização dos dados está à frente da gestão das ferramentas de IA.");
    expect(texto).not.toMatch(/\bde (a|o|as|os) /);
    expect(texto).not.toMatch(/dispers/i);
    expect(TEXTO_ANTIGO.dados).toMatch(/dispersos/);
    expect(texto).not.toContain(TEXTO_ANTIGO.dados);
  });

  it("as mesmas médias com respostas diferentes dão leituras diferentes", () => {
    // (2, 0) e (1, 1) têm a mesma média na escala 0/15/40/70/100? 20 contra 15; (3, 0) e (2, 1) dão 35 e 27,5: ambas 'baixa'.
    const a = leituraDaDimensao("processos", respostas({ p5: 2, p6: 0 }));
    const b = leituraDaDimensao("processos", respostas({ p5: 1, p6: 1 }));
    expect(a.padrao).toBe("primeira-a-frente");
    expect(b.padrao).toBe("alinhado-inicial");
    expect(a.afirmacoes.map((x) => x.texto)).not.toEqual(b.afirmacoes.map((x) => x.texto));
  });

  it("o exemplo público: processos ficam 'em estágios próximos' e o próximo estágio é o de uso compartilhado", () => {
    const r = decodificar(aiScore.exemplo.codigo)!;
    const l = leituraDaDimensao("processos", r.centrais);
    expect(l.padrao).toBe("alinhado-intermediario");
    expect(l.afirmacoes.find((a) => a.id.endsWith(".proximo.p6"))?.texto).toContain(
      "Temos prompts, modelos ou automações reutilizados pela equipe.",
    );
    // Governança e Resultados têm uma resposta só (a outra foi "Não sei"): a leitura diz isso.
    for (const d of ["governanca", "resultados"] as const) {
      const x = leituraDaDimensao(d, r.centrais);
      expect(x.padrao).toBe("incompleto");
      expect(x.afirmacoes.some((a) => a.natureza === "validar" && a.pergunta)).toBe(true);
    }
  });

  it("visão por área usa o texto da pergunta da área", () => {
    const l = leituraDaDimensao("pessoas", respostas({ p3: 2, p4: null }), "area");
    expect(l.afirmacoes.find((a) => a.natureza === "validar")?.pergunta).toBe(perguntasCentrais[3].texto.area);
  });

  it("padrões: as combinações de nível caem em exatamente um padrão", () => {
    const vistos = new Set<string>();
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) vistos.add(padraoDe(a, b));
    expect([...vistos].sort()).toEqual(
      [
        "alinhado-avancado",
        "alinhado-inicial",
        "alinhado-intermediario",
        "primeira-a-frente",
        "segunda-a-frente",
      ].sort(),
    );
    // Simetria: trocar as respostas troca o lado.
    for (let a = 0; a <= 4; a++)
      for (let b = 0; b <= 4; b++) {
        const p = padraoDe(a, b);
        const q = padraoDe(b, a);
        expect(q).toBe(
          p === "primeira-a-frente" ? "segunda-a-frente" : p === "segunda-a-frente" ? "primeira-a-frente" : p,
        );
      }
  });

  it("as seis dimensões saem juntas", () => {
    const todas = leituras(respostas({}, 2));
    expect(Object.keys(todas)).toEqual(dimensoes.map((d) => d.id));
    expect(metodoAtual.dimensaoDaPergunta).toHaveLength(12);
  });
});

describe("alertas decididos por perguntas", () => {
  const dimensoesDe = (c: Slot[]) => calcular({ centrais: c, areas: [], porArea: {} });
  const alertasDe = (c: Slot[]) => detectarAlertas(c, dimensoesDe(c)).map((a) => a.alerta);

  it("cada alerta aparece exatamente quando as respostas citadas estão no conjunto que o sustenta", () => {
    const especificados = Object.entries(afirmaDosAlertas) as Array<[AlertaId, Record<string, readonly number[]>]>;
    expect(especificados.length).toBe(6);
    for (const [alerta, afirma] of especificados) {
      const perguntas = Object.keys(afirma);
      const total = NIVEIS.length ** perguntas.length;
      for (let i = 0; i < total; i++) {
        const dadas: Record<string, Slot> = {};
        let resto = i;
        for (const p of perguntas) {
          dadas[p] = NIVEIS[resto % NIVEIS.length];
          resto = Math.floor(resto / NIVEIS.length);
        }
        // O resto das respostas fica em 2: não pode ligar nem desligar o alerta que se está testando.
        const c = respostas(dadas, 2);
        const esperado = perguntas.every((p) => typeof dadas[p] === "number" && afirma[p].includes(dadas[p] as number));
        expect(alertasDe(c).includes(alerta), `${alerta} com ${JSON.stringify(dadas)}`).toBe(esperado);
      }
    }
  });

  it('"Não sei" nunca conta como zero: a resposta que falta não dispara alerta de execução, dados ou regras', () => {
    const c = respostas({ p3: 3, p9: null, p6: null, p7: null, p2: null, p11: null }, 2);
    const a = alertasDe(c);
    for (const id of [
      "adocao-sem-governanca",
      "processos-sem-dados",
      "estrategia-sem-execucao",
      "lideranca-a-frente",
      "ferramentas-sem-resultado",
    ] as const)
      expect(a, id).not.toContain(id);
    expect(a).toContain("pontos-cegos");
  });

  it("nenhum alerta é cortado e a ordem é a de exibição", () => {
    const c = respostas({
      p1: 0,
      p2: 0,
      p3: 3,
      p4: 3,
      p5: 2,
      p6: 3,
      p7: 0,
      p8: 3,
      p9: 0,
      p10: null,
      p11: 0,
      p12: null,
    });
    expect(alertasDe(c)).toEqual([
      "adocao-sem-governanca",
      "uso-sem-direcao",
      "ferramentas-sem-resultado",
      "processos-sem-dados",
      "pontos-cegos",
      "desequilibrio",
    ]);
  });

  it("'jornada por começar' só quando toda resposta válida está nos dois primeiros estágios", () => {
    expect(alertasDe(respostas({}, 0))).toContain("inicio");
    expect(alertasDe(respostas({}, 1))).toContain("inicio");
    expect(alertasDe(respostas({ p1: 2 }, 1))).not.toContain("inicio");
    expect(alertasDe(respostas({}, null))).not.toContain("inicio");
    expect(alertasDe(respostas({ p1: 1 }, null))).toContain("inicio");
  });

  it("o exemplo público: uso sem regras, direção sem execução e pontos cegos", () => {
    const r = decodificar(aiScore.exemplo.codigo)!;
    expect(alertasDe(r.centrais)).toEqual(["adocao-sem-governanca", "estrategia-sem-execucao", "pontos-cegos"]);
  });

  it("cada alerta cita as respostas que o sustentam, com o valor real", () => {
    const c = respostas({ p3: 3, p9: 0 });
    const alerta = detectarAlertas(c, dimensoesDe(c)).find((a) => a.alerta === "adocao-sem-governanca")!;
    expect(alerta.natureza).toBe("derivado");
    expect(alerta.evidencias).toEqual([
      { tipo: "resposta", ref: "p3", valor: 3 },
      { tipo: "resposta", ref: "p9", valor: 0 },
    ]);
    const cegos = detectarAlertas(
      respostas({ p4: null, p8: null }),
      dimensoesDe(respostas({ p4: null, p8: null })),
    ).find((a) => a.alerta === "pontos-cegos")!;
    expect(cegos.evidencias).toEqual([
      { tipo: "resposta", ref: "p4", valor: null },
      { tipo: "resposta", ref: "p8", valor: null },
    ]);
  });

  it("os textos dos alertas não negam as respostas que os sustentam", () => {
    for (let a = 0; a <= 4; a++)
      for (let b = 0; b <= 4; b++) {
        const c = respostas({ p7: a as Slot, p6: b as Slot });
        const alerta = detectarAlertas(c, dimensoesDe(c)).find((x) => x.alerta === "processos-sem-dados");
        if (alerta) {
          expect(a).toBeLessThanOrEqual(1);
          expect(alerta.texto).toMatch(/dispersos ou fragmentados/);
        } else expect(a >= 2 || b <= 1).toBe(true);
      }
  });

  it("a ausência de respostas não quebra nada", () => {
    const vazio = respostasVazias().centrais;
    expect(() => detectarAlertas(vazio, dimensoesDe(vazio))).not.toThrow();
    expect(() => leituras(vazio)).not.toThrow();
  });
});
