import { describe, expect, it } from "vitest";
import { desafios, dimensoes, perguntasCentrais } from "@/content/ai-score-questionario";
import { montarDevolutiva } from "@/lib/ai-score/devolutiva";
import { respostasVazias } from "@/lib/ai-score/codificar";
import { comQuem } from "@/lib/ai-score/quem";
import { regras } from "@/lib/ai-score/regras";
import type { Sintese } from "@/lib/ai-score/sintese";
import type { RespostasCompletas, Slot } from "@/lib/ai-score/tipos";
import type { DesafioId } from "@/content/types";

const centrais = (t: string): Slot[] => [...t.replace(/\s/g, "")].map((c) => (c === "x" ? null : (Number(c) as Slot)));

const respostas = (t: string, d: DesafioId[] = []): RespostasCompletas =>
  ({
    ...respostasVazias(),
    escopo: "empresa",
    papel: "ceo",
    porte: "50-199",
    segmento: "tecnologia",
    desafios: d,
    horizonte: "3-meses",
    centrais: centrais(t),
  }) as RespostasCompletas;

const sinteseDe = (t: string, d: DesafioId[] = []) => montarDevolutiva(respostas(t, d)).sintese;
const ids = (s: Sintese) => s.plano.etapas.map((e) => e.id);
/** Todo texto da síntese, para varrer o que ela promete. */
const textos = (valor: unknown): string[] =>
  typeof valor === "string" ? [valor] : valor && typeof valor === "object" ? Object.values(valor).flatMap(textos) : [];

describe("resumo executivo", () => {
  const s = sinteseDe("33 22 21 22 11 21", ["repetitivas"]);

  it("responde às seis perguntas, na ordem", () => {
    expect(s.resumo.itens.map((i) => i.id)).toEqual([
      "cenario",
      "atencao",
      "sustentacao",
      "consequencia",
      "primeira-acao",
      "validar",
    ]);
    const por = Object.fromEntries(s.resumo.itens.map((i) => [i.id, i]));
    // Cenário: nível, nota e cobertura; a empresa entra na hora de mostrar.
    expect(comQuem(por.cenario.texto, "A Empresa X")).toBe(
      "A Empresa X está no nível Explorando, com AI Score 34 de 100. Nota calculada com 12 de 12 respostas.",
    );
    // O que merece atenção: a dimensão mais frágil, com a nota.
    expect(por.atencao.texto).toContain("Governança e Segurança é a dimensão mais frágil, com nota 15 de 100.");
    // O que sustenta: as respostas declaradas, literais (p9 = 1 e p10 = 1).
    expect(por.sustentacao.texto).toContain(perguntasCentrais[8].alternativas[1]);
    expect(por.sustentacao.natureza).toBe("declarado");
    // Consequência: o desafio declarado e uma hipótese, dita como hipótese.
    expect(por.consequencia.texto).toMatch(/Você apontou como desafio: temos muitas tarefas repetitivas/);
    expect(por.consequencia.texto).toContain("Hipótese, a validar:");
    expect(por.consequencia.natureza).toBe("hipotese");
    // Primeira ação: a primeira etapa do roteiro.
    expect(por["primeira-acao"].texto).toBe(s.plano.etapas[0].acao);
  });

  describe("consequência declarada e hipótese: só se pareiam quando falam da mesma dimensão", () => {
    const consequencia = (t: string, d: DesafioId[]) =>
      sinteseDe(t, d).resumo.itens.find((i) => i.id === "consequencia")!.texto;
    const minuscula = (id: DesafioId) => {
      const l = desafios.find((x) => x.id === id)!.label;
      return `${l.charAt(0).toLowerCase()}${l.slice(1)}`;
    };
    // "33 22 21 22 11 21": a dimensão mais frágil é Governança e Segurança (15).
    const fragil = "33 22 21 22 11 21";

    it("o desafio é da dimensão mais frágil: vem logo antes da hipótese", () => {
      const texto = consequencia(fragil, ["governanca"]);
      expect(texto).toMatch(
        new RegExp(
          `^Você apontou como desafio: ${minuscula("governanca").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} Hipótese, a validar:`,
        ),
      );
      expect(texto).not.toContain("é outro assunto");
    });

    it("o desafio é de outra dimensão: aparece à parte, e o texto diz que a mais frágil é outro assunto", () => {
      const texto = consequencia(fragil, ["repetitivas"]);
      expect(texto).toContain(`Você apontou como desafio: ${minuscula("repetitivas")}`);
      expect(texto).toContain("A dimensão mais frágil, Governança e Segurança, é outro assunto.");
      // A hipótese vem depois e continua marcada como hipótese (a ficha comercial a extrai por esse marcador).
      expect(texto.indexOf("é outro assunto")).toBeLessThan(texto.indexOf("Hipótese, a validar:"));
    });

    it("dois desafios, um da dimensão mais frágil: pareia esse e avisa que o outro é lido à parte", () => {
      const texto = consequencia(fragil, ["repetitivas", "governanca"]);
      expect(texto).toContain(`Você apontou como desafio: ${minuscula("governanca")}`);
      expect(texto).not.toContain(minuscula("repetitivas"));
      expect(texto).toContain("O outro desafio que você marcou é lido à parte, em oportunidades a investigar.");
    });

    it("dois desafios, nenhum da dimensão mais frágil: os dois entram, sem ligar a hipótese a eles", () => {
      const texto = consequencia(fragil, ["repetitivas", "comecar"]);
      expect(texto).toContain("Você apontou como desafios:");
      expect(texto).toContain(minuscula("repetitivas").replace(/\.$/, ""));
      expect(texto).toContain(minuscula("comecar").replace(/\.$/, ""));
      expect(texto).toContain("é outro assunto");
    });

    it("sem desafio declarado: diz que não há, e a hipótese segue marcada", () => {
      const texto = consequencia(fragil, []);
      expect(texto).toContain("O questionário não registrou nenhuma consequência declarada.");
      expect(texto).toContain("Hipótese, a validar:");
      expect(texto).not.toContain("é outro assunto");
    });
  });

  it("sem lacuna, não inventa fragilidade; sem nota, não aponta dimensão", () => {
    const topo = sinteseDe("44 44 44 44 44 44");
    expect(topo.resumo.itens.find((i) => i.id === "atencao")!.texto).toMatch(/Nenhuma fragilidade/);
    const parcial = sinteseDe("xx xx xx 22 22 22");
    expect(comQuem(parcial.resumo.itens[0].texto, "Sua empresa")).toMatch(/resultado parcial/);
    expect(parcial.resumo.itens.find((i) => i.id === "atencao")!.texto).toMatch(/Sem nota consolidada/);
    expect(parcial.indicacoes.semIndicacao).toMatch(/Sem nota consolidada/);
  });

  it("o que validar lista as pendências reais: desafio contraditório e condições não atendidas", () => {
    // Estratégia em 100 contradiz "não sabemos por onde começar"; processos ainda não estão mapeados para agentes.
    const s2 = sinteseDe("44 44 22 22 11 22", ["comecar", "agentes"]);
    const validar = s2.resumo.itens.find((i) => i.id === "validar")!;
    expect(validar.lista?.length).toBeGreaterThan(0);
    expect(validar.lista!.length).toBeLessThanOrEqual(3);
    expect(validar.lista!.join(" ")).toMatch(/Escolher por onde começar/);
  });
});

describe("oportunidades a investigar", () => {
  it("cada desafio vira hipótese com perguntas, lido contra as respostas", () => {
    const s = sinteseDe("33 22 21 22 11 21", ["governanca", "comecar"]);
    expect(s.oportunidades.itens.map((o) => [o.id, o.situacao])).toEqual([
      ["governanca", "sustentado"],
      ["comecar", "contradiz"],
    ]);
    for (const o of s.oportunidades.itens) {
      expect(o.hipotese).not.toBe("");
      expect(o.perguntas.length).toBeGreaterThanOrEqual(2);
    }
    expect(s.oportunidades.itens[1].rotuloSituacao).toMatch(/apontam o contrário/);
  });

  it("agentes: o pedido vem com as condições e a situação de cada uma", () => {
    const s = sinteseDe("22 22 11 22 22 22", ["agentes"]);
    const agentes = s.oportunidades.itens[0];
    expect(agentes.condicoes.map((c) => c.situacao)).toEqual(["pendente", "atendida", "atendida"]);
    expect(agentes.condicoes[0].rotulo).toContain("ainda não: você respondeu");
    expect(agentes.hipotese).toMatch(/O pedido sozinho não prova/);
  });

  it("sem desafio informado, diz que não há oportunidade declarada", () => {
    expect(sinteseDe("22 22 22 22 22 22").oportunidades.itens).toEqual([]);
  });
});

describe("indicações com evidência e condições", () => {
  it("cada indicação cita em que se apoia; sem apoio direto, diz que falta confirmar", () => {
    const s = sinteseDe("00 44 44 44 44 44");
    expect(s.indicacoes.itens).toHaveLength(1);
    const champions = s.indicacoes.itens[0];
    expect(champions).toMatchObject({ slug: "ai-champions", forca: "investigar" });
    expect(champions.porque).toEqual(["Estratégia e Liderança está em 0."]);
    expect(champions.ressalva).toMatch(/evidência direta/);
  });

  it("no máximo duas soluções, e nenhuma quando as respostas não pedem", () => {
    for (const t of ["00 00 00 00 00 00", "11 22 33 44 11 22", "33 33 33 33 33 22"])
      expect(sinteseDe(t, ["agentes", "medir"]).indicacoes.itens.length).toBeLessThanOrEqual(2);
    const topo = sinteseDe("44 44 44 44 44 44");
    expect(topo.indicacoes.itens).toEqual([]);
    expect(topo.indicacoes.semIndicacao).toMatch(/manter o acompanhamento/);
  });

  it("o critério de um empate é dito na própria indicação", () => {
    const s = sinteseDe("22 22 22 22 22 22");
    expect(s.indicacoes.itens.some((i) => i.criterio)).toBe(true);
  });
});

describe("roteiro de 90 dias por dependências", () => {
  /** Vetores de resposta determinísticos (gerador congruencial), para varrer combinações sem aleatoriedade solta. */
  function* vetores(n: number) {
    let x = 12345;
    const proximo = (m: number) => {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      return x % m;
    };
    for (let i = 0; i < n; i++) {
      const t = Array.from({ length: 12 }, () => {
        const v = proximo(7);
        return v === 6 ? "x" : String(v % 5);
      }).join("");
      const d = [...new Set([proximo(8), proximo(8)].slice(0, 1 + proximo(2)))].map((k) => desafios[k].id);
      yield { t, d };
    }
  }

  it("a linha de base vem antes do piloto, e controles e capacitação antes de ampliar", () => {
    for (const { t, d } of vetores(300)) {
      const s = sinteseDe(t, d);
      const etapas = s.plano.etapas;
      const pos = (id: string) => ids(s).indexOf(id as never);
      const ctx = `${t} ${d.join(",")}`;
      expect(new Set(ids(s)).size, ctx).toBe(etapas.length);
      for (const e of etapas) {
        for (const dep of e.depende) {
          expect(pos(dep), `${ctx}: ${e.id} depende de ${dep}`).toBeGreaterThanOrEqual(0);
          expect(pos(dep), `${ctx}: ${dep} antes de ${e.id}`).toBeLessThan(pos(e.id));
          expect(etapas[pos(dep)].fase, ctx).toBeLessThanOrEqual(e.fase);
        }
        for (const campo of ["acao", "responsavel", "entrega", "indicador"] as const)
          expect(e[campo], ctx).not.toBe("");
      }
      expect(pos("problema"), ctx).toBeLessThan(pos("linha-de-base"));
      expect(pos("linha-de-base"), ctx).toBeLessThan(pos("piloto"));
      expect(etapas[pos("piloto")].depende, ctx).toContain("linha-de-base");
      expect(etapas[pos("avaliacao")].depende, ctx).toEqual(["piloto"]);
      expect(pos("piloto"), ctx).toBeLessThan(pos("avaliacao"));
      for (const previo of ["controles", "capacitacao", "dados"] as const)
        if (pos(previo) >= 0) {
          expect(etapas[pos("piloto")].depende, `${ctx}: piloto depende de ${previo}`).toContain(previo);
        }
      for (const previo of ["controles", "capacitacao"] as const)
        if (pos(previo) >= 0) expect(etapas[pos("expansao")].depende, ctx).toContain(previo);
      expect(etapas[pos("expansao")].depende, ctx).toContain("avaliacao");
      expect(etapas[pos("reavaliar")].depende, ctx).toContain("avaliacao");
    }
  });

  it("as etapas condicionais aparecem quando a lacuna existe, e só então", () => {
    const fraco = sinteseDe("22 11 22 11 11 22");
    expect(ids(fraco)).toEqual([
      "problema",
      "linha-de-base",
      "controles",
      "capacitacao",
      "dados",
      "piloto",
      "avaliacao",
      "expansao",
      "reavaliar",
    ]);
    // Tudo em 70 ou mais: nada a corrigir, e o roteiro começa por confirmar o que as respostas dizem.
    const topo = sinteseDe("44 44 44 44 44 44");
    expect(ids(topo)).toEqual(["revisar", "problema", "linha-de-base", "piloto", "avaliacao", "expansao", "reavaliar"]);
    expect(topo.plano.etapas[0].depende).toEqual([]);
    expect(topo.plano.etapas[1].depende).toEqual(["revisar"]);
  });

  it("o desafio declarado entra na definição do problema; sem desafio, a dimensão mais frágil", () => {
    const com = sinteseDe("22 22 22 22 11 22", ["repetitivas"]).plano.etapas[0];
    expect(com.detalhe).toContain(desafios.find((x) => x.id === "repetitivas")!.passo);
    const sem = sinteseDe("22 22 22 22 11 22").plano.etapas[0];
    expect(sem.detalhe).toBe(dimensoes.find((x) => x.id === "governanca")!.passos.estruturar);
  });

  it("a ordem das etapas dentro do plano acompanha as fases (1, 2, 3)", () => {
    for (const { t, d } of vetores(50)) {
      const fases = sinteseDe(t, d).plano.etapas.map((e) => e.fase);
      expect(fases, `${t}`).toEqual([...fases].sort());
    }
  });
});

describe("a síntese não promete o que não pode", () => {
  it("nenhum texto fala de dinheiro, retorno, ganho garantido, prazo de implantação ou meta numérica", () => {
    const proibido = /R\$|reais|retorno financeiro|ROI|economia de|garant|% de |em \d+ (dias|semanas|meses)/i;
    for (const { t, d } of [
      { t: "00 00 00 00 00 00", d: ["agentes", "medir"] as DesafioId[] },
      { t: "33 22 21 22 11 21", d: ["repetitivas"] as DesafioId[] },
      { t: "44 44 44 44 44 44", d: [] as DesafioId[] },
      { t: "xx 22 x2 22 22 22", d: ["custo-ferramentas"] as DesafioId[] },
    ])
      for (const texto of textos(sinteseDe(t, d))) expect(texto, texto).not.toMatch(proibido);
  });

  it("os textos de indicação e plano não trazem nomes de pessoas ou de clientes", () => {
    const s = sinteseDe("00 00 00 00 00 00", ["agentes"]);
    for (const e of s.plano.etapas) expect(e.responsavel).toMatch(/lidera|gestor|liderança|Gestor|Quem/);
  });
});

describe("síntese como dado", () => {
  it("é JSON puro, estável e pequena o bastante para guardar junto da avaliação", () => {
    const pior = sinteseDe("00 00 00 00 00 00", ["agentes", "medir"]);
    const json = JSON.stringify(pior);
    expect(JSON.parse(json)).toEqual(pior);
    expect(json.length).toBeLessThan(24_000);
    expect(JSON.stringify(sinteseDe("00 00 00 00 00 00", ["agentes", "medir"]))).toBe(json);
  });

  it("a devolutiva inteira (guardada junto da avaliação) cabe no limite do banco, com folga", () => {
    for (const t of ["00 00 00 00 00 00", "22 22 22 22 22 22", "x4 x4 x4 x4 x4 x4"]) {
      const bytes = new TextEncoder().encode(
        JSON.stringify(montarDevolutiva(respostas(t, ["agentes", "medir"]))),
      ).length;
      expect(bytes, t).toBeLessThan(52_000);
    }
  });

  it("a regra de prontidão do plano usa só perguntas que existem", () => {
    const existentes = new Set(perguntasCentrais.map((p) => p.id));
    for (const lista of Object.values(regras.prontidao))
      for (const c of lista) expect(existentes.has(c.ref)).toBe(true);
  });
});
