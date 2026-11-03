import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { consequencias, dadosDisponiveis, papeisNaDecisao, periodos, rotinas } from "@/content/ai-score-aprofundamento";
import {
  esforcoEstimado,
  LIMITES,
  paraLinha,
  validarAprofundamento,
  type Aprofundamento,
} from "@/lib/ai-score/aprofundamento";

const base = { area: "vendas", camada: 1, revisao: 1 } as const;
const camada1 = {
  ...base,
  rotina: "propostas",
  volume: 200,
  unidade: "propostas",
  periodo: "mes",
  consequencia: "retrabalho",
};
const erros = (entrada: unknown) => {
  const r = validarAprofundamento(entrada);
  return r.ok ? null : r.erros;
};
const valor = (entrada: unknown) => {
  const r = validarAprofundamento(entrada);
  if (!r.ok) throw new Error(`inválido: ${JSON.stringify(r.erros)}`);
  return r.valor;
};

describe("camada 1: rotina, volume com unidade e período, consequência", () => {
  it("aceita uma resposta completa e a normaliza", () => {
    expect(valor(camada1)).toEqual({
      area: "vendas",
      camada: 1,
      revisao: 1,
      rotina: "propostas",
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
      consequencia: "retrabalho",
      ferramentas: [],
      naoSei: [],
    });
  });

  it("tudo é opcional: pode responder só uma pergunta, ou marcar Não sei em todas", () => {
    expect(validarAprofundamento({ ...base, rotina: "crm" }).ok).toBe(true);
    expect(validarAprofundamento({ ...base, consequencia: "atraso" }).ok).toBe(true);
    expect(valor({ ...base, naoSei: ["rotina", "volume", "consequencia"] }).naoSei).toEqual([
      "rotina",
      "volume",
      "consequencia",
    ]);
    expect(erros(base)?.geral).toMatch(/ao menos uma pergunta/);
  });

  it("as opções valem para a área: uma rotina de Vendas não passa em Marketing", () => {
    expect(validarAprofundamento({ ...base, area: "marketing", rotina: "propostas" }).ok).toBe(false);
    expect(validarAprofundamento({ ...base, area: "marketing", rotina: "campanhas" }).ok).toBe(true);
    expect(erros({ ...base, area: "juridico", rotina: "crm" })?.area).toBeDefined();
  });

  it("'Outro processo' e 'Outra consequência' exigem o texto", () => {
    expect(erros({ ...base, rotina: "outra" })?.rotinaOutra).toMatch(/Preencha/);
    expect(valor({ ...base, rotina: "outra", rotinaOutra: "  Revisão   jurídica  de contratos " }).rotinaOutra).toBe(
      "Revisão jurídica de contratos",
    );
    expect(erros({ ...base, consequencia: "outra" })?.consequenciaOutra).toBeDefined();
    expect(
      valor({ ...base, consequencia: "outra", consequenciaOutra: "Clientes desistem antes da proposta" })
        .consequenciaOutra,
    ).toBe("Clientes desistem antes da proposta");
  });

  it("o volume precisa de número maior que zero, dentro do limite, com unidade e período explícitos", () => {
    for (const volume of [0, -5, Number.NaN, Number.POSITIVE_INFINITY, "200", null]) {
      if (volume === null) continue;
      expect(erros({ ...camada1, volume })?.volume, String(volume)).toBeDefined();
    }
    expect(erros({ ...camada1, volume: LIMITES.volume + 1 })?.volume).toMatch(/até/);
    expect(validarAprofundamento({ ...camada1, volume: LIMITES.volume }).ok).toBe(true);
    expect(erros({ ...camada1, volume: 10.123 })?.volume).toMatch(/duas casas/);
    expect(validarAprofundamento({ ...camada1, volume: 10.12 }).ok).toBe(true);
    expect(erros({ ...camada1, unidade: "" })?.unidade).toBeDefined();
    expect(erros({ ...camada1, unidade: "x".repeat(LIMITES.unidade + 1) })?.unidade).toBeDefined();
    expect(erros({ ...camada1, periodo: "ano" })?.periodo).toBeDefined();
    expect(erros({ ...camada1, periodo: undefined })?.periodo).toBeDefined();
  });

  it("'Não sei' não convive com um valor para o mesmo campo", () => {
    expect(erros({ ...camada1, naoSei: ["volume"] })?.volume).toMatch(/não os dois/);
    expect(erros({ ...camada1, naoSei: ["rotina"] })?.rotina).toMatch(/não os dois/);
    expect(erros({ ...camada1, naoSei: ["consequencia"] })?.consequencia).toMatch(/não os dois/);
    expect(erros({ ...base, naoSei: ["inventado"] })?.naoSei).toBeDefined();
    // Mas "Não sei" num campo e resposta em outro é o normal.
    expect(
      validarAprofundamento({
        ...camada1,
        volume: undefined,
        unidade: undefined,
        periodo: undefined,
        naoSei: ["volume"],
      }).ok,
    ).toBe(true);
  });

  it("texto aberto: limite de tamanho, espaços colapsados, e nada de e-mail ou telefone", () => {
    const longa = "a".repeat(LIMITES.rotinaOutra + 1);
    expect(erros({ ...base, rotina: "outra", rotinaOutra: longa })?.rotinaOutra).toBeDefined();
    expect(validarAprofundamento({ ...base, rotina: "outra", rotinaOutra: "a".repeat(LIMITES.rotinaOutra) }).ok).toBe(
      true,
    );
    expect(erros({ ...base, rotina: "outra", rotinaOutra: "x" })?.rotinaOutra).toBeDefined();
    for (const contato of [
      "falar com maria@empresa.com.br",
      "ligar (85) 99999-0000 hoje",
      "5585999990000",
      "+55 85 9 9999 0000",
    ]) {
      expect(erros({ ...base, rotina: "outra", rotinaOutra: contato })?.rotinaOutra, contato).toMatch(
        /e-mail nem telefone/,
      );
      expect(
        erros({ ...base, consequencia: "outra", consequenciaOutra: contato })?.consequenciaOutra,
        contato,
      ).toBeDefined();
    }
    // Números comuns de negócio não são telefone.
    expect(
      validarAprofundamento({ ...base, rotina: "outra", rotinaOutra: "Proposta de R$ 120 mil, 3 vezes por semana" }).ok,
    ).toBe(true);
    // Caracteres de controle viram espaço.
    expect(valor({ ...base, rotina: "outra", rotinaOutra: "Revisão\u0000de\ncontratos" }).rotinaOutra).toBe(
      "Revisão de contratos",
    );
  });

  it("a revisão e a camada são obrigatórias e inteiras", () => {
    expect(erros({ ...camada1, revisao: 0 })?.revisao).toBeDefined();
    expect(erros({ ...camada1, revisao: 1.5 })?.revisao).toBeDefined();
    expect(erros({ ...camada1, revisao: LIMITES.revisao + 1 })?.revisao).toBeDefined();
    expect(erros({ ...camada1, camada: 3 })?.camada).toBeDefined();
    expect(erros({ ...camada1, camada: undefined })?.camada).toBeDefined();
  });

  it("lixo e objetos estranhos não quebram nem poluem", () => {
    for (const lixo of [null, undefined, 42, "x", [], [1, 2]]) expect(validarAprofundamento(lixo).ok).toBe(false);
    const r = validarAprofundamento(
      JSON.parse('{"area":"vendas","camada":1,"revisao":1,"rotina":"crm","__proto__":{"x":1},"extra":"ignorado"}'),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.valor).not.toHaveProperty("extra");
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });
});

describe("camada 2: tempo, ferramentas, dados, indicador e papel", () => {
  const camada2 = {
    ...camada1,
    camada: 2,
    revisao: 2,
    minutos: 15,
    ferramentas: ["CRM", "Planilha"],
    dados: "parcial",
    indicador: "tempo de resposta",
    papelDecisor: "influencio",
  };

  it("aceita a camada 2 completa", () => {
    const v = valor(camada2);
    expect(v).toMatchObject({
      camada: 2,
      minutos: 15,
      ferramentas: ["CRM", "Planilha"],
      dados: "parcial",
      papelDecisor: "influencio",
      indicador: "tempo de resposta",
    });
  });

  it("os campos da camada 2 só valem na camada 2", () => {
    expect(erros({ ...camada2, camada: 1 })?.camada).toMatch(/camada 2/);
  });

  it("minutos: maior que zero, até 600, uma casa decimal; ou Não sei", () => {
    for (const minutos of [0, -1, 601, 15.55, Number.NaN, "15"])
      expect(erros({ ...camada2, minutos })?.minutos, String(minutos)).toBeDefined();
    expect(validarAprofundamento({ ...camada2, minutos: 600 }).ok).toBe(true);
    expect(validarAprofundamento({ ...camada2, minutos: 7.5 }).ok).toBe(true);
    expect(valor({ ...camada2, minutos: undefined, naoSei: ["minutos"] }).naoSei).toEqual(["minutos"]);
    expect(erros({ ...camada2, naoSei: ["minutos"] })?.minutos).toMatch(/não os dois/);
  });

  it("ferramentas: até 8, sem repetir (maiúsculas não contam), sem contato", () => {
    expect(valor({ ...camada2, ferramentas: ["CRM", "crm", " Planilha ", ""] }).ferramentas).toEqual([
      "CRM",
      "Planilha",
    ]);
    expect(
      erros({ ...camada2, ferramentas: Array.from({ length: 9 }, (_, i) => `ferramenta ${i}`) })?.ferramentas,
    ).toBeDefined();
    expect(erros({ ...camada2, ferramentas: ["x".repeat(LIMITES.ferramenta + 1)] })?.ferramentas).toBeDefined();
    expect(erros({ ...camada2, ferramentas: ["joao@x.com.br"] })?.ferramentas).toBeDefined();
    expect(erros({ ...camada2, ferramentas: "CRM" })?.ferramentas).toBeDefined();
  });

  it("dados, papel e indicador", () => {
    expect(erros({ ...camada2, dados: "talvez" })?.dados).toBeDefined();
    expect(erros({ ...camada2, papelDecisor: "chefe" })?.papelDecisor).toBeDefined();
    expect(erros({ ...camada2, indicador: "x".repeat(LIMITES.indicador + 1) })?.indicador).toBeDefined();
    expect(erros({ ...camada2, indicador: "me ligue 85 99999 0000" })?.indicador).toMatch(/e-mail nem telefone/);
  });
});

describe("esforço atual estimado: ocorrências × minutos ÷ 60", () => {
  const dados = (
    extra: Partial<Aprofundamento> = {},
  ): Pick<Aprofundamento, "volume" | "unidade" | "periodo" | "minutos"> => ({
    volume: 200,
    unidade: "propostas",
    periodo: "mes",
    minutos: 15,
    ...extra,
  });

  it("o exemplo do pedido: 200 propostas por mês × 15 minutos = 50 horas por mês", () => {
    expect(esforcoEstimado(dados())).toEqual({
      calculavel: true,
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
      minutos: 15,
      horas: 50,
    });
  });

  it("mostra as entradas e arredonda a uma casa", () => {
    expect(esforcoEstimado(dados({ volume: 33, minutos: 7.5 }))).toMatchObject({ horas: 4.1 });
    expect(esforcoEstimado(dados({ volume: 12, minutos: 10, periodo: "dia" }))).toMatchObject({
      horas: 2,
      periodo: "dia",
    });
  });

  it("sem dados suficientes diz o que falta, e nunca inventa um número", () => {
    expect(esforcoEstimado(dados({ minutos: undefined }))).toEqual({ calculavel: false, falta: ["minutos"] });
    expect(esforcoEstimado(dados({ volume: undefined }))).toEqual({ calculavel: false, falta: ["volume"] });
    expect(esforcoEstimado({})).toEqual({ calculavel: false, falta: ["volume", "minutos"] });
    expect(esforcoEstimado(dados({ unidade: undefined }))).toEqual({ calculavel: false, falta: ["volume"] });
  });

  it("não vira dinheiro, porcentagem nem economia: só horas informadas", () => {
    const e = esforcoEstimado(dados());
    expect(Object.keys(e).sort()).toEqual(["calculavel", "horas", "minutos", "periodo", "unidade", "volume"]);
    expect(JSON.stringify(e)).not.toMatch(/R\$|reais|economia|receita|custo|percent|%/i);
  });
});

describe("persistência e conteúdo", () => {
  it("paraLinha usa os nomes das colunas do banco e leva null no que não foi respondido", () => {
    const linha = paraLinha(valor(camada1));
    expect(Object.keys(linha).sort()).toEqual(
      [
        "area",
        "camada",
        "consequencia",
        "consequencia_outra",
        "dados",
        "ferramentas",
        "indicador",
        "minutos",
        "nao_sei",
        "papel_decisor",
        "periodo",
        "revisao",
        "rotina",
        "rotina_outra",
        "unidade",
        "volume",
      ].sort(),
    );
    expect(linha).toMatchObject({
      rotina: "propostas",
      volume: 200,
      minutos: null,
      dados: null,
      ferramentas: [],
      nao_sei: [],
    });
  });

  it("os ids das opções seguem o padrão que o banco aceita e são únicos", () => {
    const todos = [
      ...Object.values(rotinas).flat(),
      ...consequencias,
      ...periodos,
      ...dadosDisponiveis,
      ...papeisNaDecisao,
    ];
    for (const o of todos) expect(o.id).toMatch(/^[a-z0-9-]{1,40}$/);
    for (const lista of Object.values(rotinas)) {
      expect(new Set(lista.map((r) => r.id)).size).toBe(lista.length);
      for (const r of lista) expect(r.unidade.length).toBeLessThanOrEqual(LIMITES.unidade);
    }
    expect(
      Object.values(rotinas)
        .flat()
        .some((r) => r.id === "outra"),
    ).toBe(false);
  });
});

describe("os limites do TypeScript são os do banco (supabase/migrations/0008_captura.sql)", () => {
  const sql = readFileSync("supabase/migrations/0008_captura.sql", "utf8");
  const numero = (re: RegExp) => Number(sql.match(re)?.[1]);

  it("volume, minutos e textos", () => {
    expect(numero(/volume numeric\(9, 2\) check \(volume is null or \(volume > 0 and volume <= (\d+)\)\)/)).toBe(
      LIMITES.volume,
    );
    expect(numero(/minutos numeric\(6, 1\) check \(minutos is null or \(minutos > 0 and minutos <= (\d+)\)\)/)).toBe(
      LIMITES.minutos,
    );
    expect(numero(/char_length\(unidade\) between 1 and (\d+)/)).toBe(LIMITES.unidade);
    expect(numero(/char_length\(rotina_outra\) <= (\d+)/)).toBe(LIMITES.rotinaOutra);
    expect(numero(/char_length\(consequencia_outra\) <= (\d+)/)).toBe(LIMITES.consequenciaOutra);
    expect(numero(/char_length\(indicador\) <= (\d+)/)).toBe(LIMITES.indicador);
    expect(numero(/cardinality\(ferramentas\) <= (\d+)/)).toBe(LIMITES.ferramentas);
  });

  it("as opções do banco são as do conteúdo", () => {
    const lista = (campo: string) =>
      [
        ...(sql.match(new RegExp(`${campo} text check \\([^)]*in \\(([^)]*)\\)`))?.[1].matchAll(/'([^']+)'/g) ?? []),
      ].map((m) => m[1]);
    expect(lista("periodo").sort()).toEqual(periodos.map((p) => p.id).sort());
    expect(lista("consequencia").sort()).toEqual([...consequencias.map((c) => c.id), "outra"].sort());
    expect(lista("dados").sort()).toEqual(dadosDisponiveis.map((d) => d.id).sort());
    expect(lista("papel_decisor").sort()).toEqual(papeisNaDecisao.map((p) => p.id).sort());
  });
});
