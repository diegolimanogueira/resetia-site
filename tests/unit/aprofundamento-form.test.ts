import { describe, expect, it } from "vitest";
import { OUTRA } from "@/content/ai-score-aprofundamento";
import { esforcoEstimado, validarAprofundamento } from "@/lib/ai-score/aprofundamento";
import {
  camposDe,
  camposVazios,
  entradaDe,
  lerRascunho,
  numeroDe,
  passoDoErro,
  passosDe,
  type Rascunho,
} from "@/lib/ai-score/aprofundamento-form";

const base = (parte: Partial<Rascunho> = {}): Rascunho => ({
  fase: "perguntas",
  passo: "rotina",
  camada: 1,
  campos: {
    ...camposVazios("vendas"),
    rotina: "propostas",
    volume: "200",
    unidade: "propostas",
    periodo: "mes",
    consequencia: "retrabalho",
  },
  naoSei: [],
  ...parte,
});

describe("numeroDe", () => {
  it("lê números em português sem confundir ponto de milhar com decimal", () => {
    expect(numeroDe("200")).toBe(200);
    expect(numeroDe("1,5")).toBe(1.5);
    expect(numeroDe("1.500")).toBe(1500);
    expect(numeroDe("1.500,5")).toBe(1500.5);
    expect(numeroDe("2.5")).toBe(2.5);
    expect(numeroDe("  ")).toBeUndefined();
    expect(numeroDe("abc")).toBeNaN();
    expect(numeroDe("12 propostas")).toBeNaN();
  });
});

describe("passos", () => {
  it("a área só é perguntada quando não dá para deduzi-la; a camada 2 vem depois da 1", () => {
    expect(passosDe(1, false)).toEqual(["rotina", "volume", "consequencia"]);
    expect(passosDe(1, true)[0]).toBe("area");
    expect(passosDe(2, false)).toEqual([
      "rotina",
      "volume",
      "consequencia",
      "minutos",
      "ferramentas",
      "dados",
      "indicador",
      "papel",
    ]);
  });
  it("todo erro do validador aponta para uma pergunta (ou para o aviso geral)", () => {
    expect(passoDoErro("unidade")).toBe("volume");
    expect(passoDoErro("rotinaOutra")).toBe("rotina");
    expect(passoDoErro("papelDecisor")).toBe("papel");
    expect(passoDoErro("geral")).toBeNull();
  });
});

describe("entradaDe", () => {
  it("monta uma entrada que o validador aceita, sem os campos da camada 2 na camada 1", () => {
    const entrada = entradaDe(base({ campos: { ...base().campos, minutos: "15", indicador: "retrabalho" } }), 1);
    expect(entrada).not.toHaveProperty("minutos");
    expect(entrada).not.toHaveProperty("indicador");
    const v = validarAprofundamento(entrada);
    expect(v.ok && v.valor).toMatchObject({
      area: "vendas",
      camada: 1,
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
    });
  });

  it("200 propostas por mês × 15 minutos ÷ 60 = 50 horas por mês", () => {
    const r = base({ camada: 2, campos: { ...base().campos, minutos: "15" } });
    const v = validarAprofundamento(entradaDe(r, 1));
    expect(v.ok && esforcoEstimado(v.valor)).toMatchObject({ calculavel: true, horas: 50, periodo: "mes" });
  });

  it('"Não sei" vence o valor digitado e "minutos: não sei" não vale na camada 1', () => {
    const r = base({ naoSei: ["volume", "minutos"] });
    const entrada = entradaDe(r, 1);
    expect(entrada).not.toHaveProperty("volume");
    expect(entrada).not.toHaveProperty("unidade");
    expect(entrada.naoSei).toEqual(["volume"]);
    expect(validarAprofundamento(entrada).ok).toBe(true);
  });

  it("volume sem unidade ou período é erro na pergunta do volume; ferramentas viram lista sem repetição", () => {
    const sem = validarAprofundamento(entradaDe(base({ campos: { ...base().campos, unidade: "", periodo: "" } }), 1));
    expect(!sem.ok && Object.keys(sem.erros).sort()).toEqual(["periodo", "unidade"]);
    const camada2 = base({ camada: 2, campos: { ...base().campos, ferramentas: "CRM, planilha; crm\nWhatsApp" } });
    const v = validarAprofundamento(entradaDe(camada2, 1));
    expect(v.ok && v.valor.ferramentas).toEqual(["CRM", "planilha", "WhatsApp"]);
  });

  it("'Outro processo' exige o texto; contato pessoal no texto é recusado", () => {
    const vazio = validarAprofundamento(entradaDe(base({ campos: { ...base().campos, rotina: OUTRA } }), 1));
    expect(!vazio.ok && vazio.erros.rotinaOutra).toBeTruthy();
    const contato = validarAprofundamento(
      entradaDe(base({ campos: { ...base().campos, rotina: OUTRA, rotinaOutra: "ligar para ana@empresa.com" } }), 1),
    );
    expect(!contato.ok && contato.erros.rotinaOutra).toBeTruthy();
  });

  it("volume digitado errado vira erro, não zero", () => {
    for (const volume of ["abc", "0", "-3", "100001", "1,234"]) {
      const v = validarAprofundamento(entradaDe(base({ campos: { ...base().campos, volume } }), 1));
      expect(v.ok, volume).toBe(false);
    }
  });

  it("corrigir um aprofundamento salvo devolve a mesma entrada", () => {
    const original = validarAprofundamento(
      entradaDe(
        base({
          camada: 2,
          campos: {
            ...base().campos,
            minutos: "7,5",
            ferramentas: "CRM",
            dados: "parcial",
            indicador: "tempo de resposta",
            papelDecisor: "decido",
          },
        }),
        3,
      ),
    );
    expect(original.ok).toBe(true);
    if (!original.ok) return;
    const refeito = validarAprofundamento(
      entradaDe({ campos: camposDe(original.valor), naoSei: original.valor.naoSei, camada: 2 }, 3),
    );
    expect(refeito).toEqual(original);
  });
});

describe("lerRascunho", () => {
  it("devolve o rascunho com a forma certa e descarta o resto", () => {
    expect(lerRascunho(JSON.stringify(base()))).toEqual(base());
    expect(lerRascunho(null)).toBeNull();
    expect(lerRascunho("não é json")).toBeNull();
    expect(lerRascunho(JSON.stringify({ ...base(), fase: "outra" }))).toBeNull();
    expect(lerRascunho(JSON.stringify({ ...base(), passo: "inventado" }))).toBeNull();
    expect(lerRascunho(JSON.stringify({ ...base(), camada: 3 }))).toBeNull();
  });
  it("campos com tipo errado voltam vazios, texto longo é cortado e 'não sei' desconhecido sai", () => {
    const r = lerRascunho(
      JSON.stringify({ ...base(), campos: { rotina: 5, indicador: "x".repeat(900) }, naoSei: ["volume", "outro"] }),
    );
    expect(r?.campos.rotina).toBe("");
    expect(r?.campos.indicador).toHaveLength(400);
    expect(r?.naoSei).toEqual(["volume"]);
  });
});
