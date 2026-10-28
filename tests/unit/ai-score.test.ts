import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import { dimensoes, niveis, perguntasCentrais } from "@/content/ai-score-questionario";
import { solucaoPorSlug } from "@/content/solucoes";
import { calcular, faixaDe, formatarNota, nivelDe, notaDe, numeroDoNivel } from "@/lib/ai-score/calcular";
import { codificar, completas, decodificar, respostasVazias } from "@/lib/ai-score/codificar";
import { emailPessoal, emailValido, normalizarWhatsapp } from "@/lib/ai-score/contato";
import { leadScore } from "@/lib/ai-score/lead-score";
import { recomendar } from "@/lib/ai-score/recomendar";
import { regras } from "@/lib/ai-score/regras";
import type { Respostas, Slot } from "@/lib/ai-score/tipos";

/** 12 respostas centrais a partir de um texto como "3322 2122 1121" (x = não sei, - = sem resposta). */
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

/** Exemplo do documento: dimensões 75, 50, 37,5, 50, 25, 37,5. */
const EXEMPLO = "33 22 21 22 11 21";

describe("cálculo do AI Score", () => {
  it("reproduz o exemplo do documento: 46, Em desenvolvimento", () => {
    const r = calcular(base(EXEMPLO));
    expect(r.dimensoes).toEqual({
      estrategia: 75,
      pessoas: 50,
      processos: 37.5,
      dados: 50,
      governanca: 25,
      resultados: 37.5,
    });
    expect(r.parcial).toBe(false);
    expect(r.indice).toBe(46);
    expect(r.nivel).toBe("desenvolvimento");
    expect(numeroDoNivel("desenvolvimento")).toBe(3);
  });

  it("a landing page usa as respostas do exemplo do documento", () => {
    const r = calcular({ centrais: aiScore.exemplo.respostas as Slot[], areas: [], porArea: {} });
    expect(r.indice).toBe(46);
  });

  it("extremos: tudo 0 dá 0 (Inicial), tudo 4 dá 100 (Avançada)", () => {
    expect(calcular(base("00 00 00 00 00 00"))).toMatchObject({ indice: 0, nivel: "inicial" });
    expect(calcular(base("44 44 44 44 44 44"))).toMatchObject({ indice: 100, nivel: "avancada" });
  });

  it('"Não sei responder" fica fora da média, sem contar como zero', () => {
    const r = calcular(base("4x 22 22 22 22 xx".replace("xx", "22")));
    expect(r.dimensoes.estrategia).toBe(100);
    expect(r.respondidas).toBe(11);
    expect(r.parcial).toBe(false);
  });

  it("parcial com menos de 10 respostas válidas", () => {
    const r = calcular(base("4x 2x 2x 22 22 22"));
    expect(r.respondidas).toBe(9);
    expect(r.parcial).toBe(true);
    expect(r.indice).toBeNull();
    expect(r.nivel).toBeNull();
    expect(r.media).not.toBeNull();
  });

  it("parcial quando uma dimensão não tem resposta válida, mesmo com 10 respostas", () => {
    const r = calcular(base("22 22 22 22 xx 22"));
    expect(r.respondidas).toBe(10);
    expect(r.dimensoes.governanca).toBeNull();
    expect(r.parcial).toBe(true);
    expect(r.indice).toBeNull();
  });

  it("índice da área: média das quatro × 25; área não avaliada não vira zero nem entra no AI Score", () => {
    const comArea = calcular(base(EXEMPLO, { areas: ["vendas"], porArea: { vendas: [4, 3, 2, 3] } }));
    expect(comArea.areas).toEqual({ vendas: 75 });
    expect(comArea.indice).toBe(46);
    expect(comArea.areas.marketing).toBeUndefined();
    expect(
      calcular(base(EXEMPLO, { areas: ["marketing"], porArea: { marketing: [null, null, null, null] } })).areas,
    ).toEqual({
      marketing: null,
    });
  });

  it("limites dos níveis: 19/20, 39/40, 59/60, 79/80", () => {
    expect([19, 20, 39, 40, 59, 60, 79, 80].map(nivelDe)).toEqual([
      "inicial",
      "explorando",
      "explorando",
      "desenvolvimento",
      "desenvolvimento",
      "estruturada",
      "estruturada",
      "avancada",
    ]);
  });

  it("níveis cobrem 0 a 100 sem buracos", () => {
    expect(niveis[0].min).toBe(0);
    expect(niveis.at(-1)!.max).toBe(100);
    for (let i = 1; i < niveis.length; i++) expect(niveis[i].min).toBe(niveis[i - 1].max + 1);
  });

  it("faixas da leitura e formatação brasileira", () => {
    expect([0, 39.9, 40, 74, 75, 100].map(faixaDe)).toEqual(["baixa", "baixa", "media", "media", "alta", "alta"]);
    expect(formatarNota(37.5)).toBe("37,5");
    expect(formatarNota(50)).toBe("50");
    expect(notaDe([])).toBeNull();
  });
});

describe("recomendações", () => {
  it("exemplo do documento: forte em Estratégia, oportunidade em Governança e os três passos do documento", () => {
    const r = recomendar(calcular(base(EXEMPLO)), []);
    expect(r.forte).toBe("estrategia");
    expect(r.lacunas[0]).toBe("governanca");
    // Empate entre Processos e Resultados (37,5): fica a ordem das dimensões.
    expect(r.lacunas.slice(0, 3)).toEqual(["governanca", "processos", "resultados"]);
    expect(r.passos).toEqual([
      dimensoes[4].passos.estruturar,
      dimensoes[2].passos.estruturar,
      dimensoes[5].passos.estruturar,
    ]);
    expect(r.solucoes).toEqual(["governance", "processos-com-ia"]);
  });

  it("o desafio principal entra como terceiro passo quando é de outro tema", () => {
    const r = recomendar(calcular(base(EXEMPLO)), ["capacitar"]);
    expect(r.passos[2]).toMatch(/trilha de capacitação/);
    // Desafio do mesmo tema de uma das duas menores dimensões: segue a terceira menor.
    const mesmo = recomendar(calcular(base(EXEMPLO)), ["governanca"]);
    expect(mesmo.passos[2]).toBe(dimensoes[5].passos.estruturar);
  });

  it("nunca mais de duas soluções, sempre slugs que existem", () => {
    for (const t of [EXEMPLO, "00 00 00 00 00 00", "44 44 44 44 44 44", "22 33 11 44 22 13"]) {
      const r = recomendar(calcular(base(t)), ["agentes", "medir"]);
      expect(r.solucoes.length).toBeLessThanOrEqual(regras.maxSolucoes);
      for (const s of r.solucoes) expect(solucaoPorSlug(s), s).toBeDefined();
    }
  });

  it("nível Inicial recebe capacitação e mapeamento, nunca Performance ou Agent Factory", () => {
    const r = recomendar(calcular(base("10 00 01 00 00 00")), ["medir", "agentes"]);
    expect(r.solucoes).toEqual(["ai-champions", "processos-com-ia"]);
  });

  it("Performance e Agent Factory ficam travadas abaixo de 40, salvo quando a pessoa quer agentes", () => {
    // Média 25 (Explorando), Resultados é a menor dimensão.
    const explorando = calcular(base("11 11 11 11 11 10"));
    expect(explorando.media).toBeLessThan(40);
    expect(recomendar(explorando, ["medir", "custo-ferramentas"]).solucoes).not.toContain("performance");
    expect(recomendar(explorando, ["custo-ferramentas"]).solucoes).not.toContain("agent-factory");
    expect(recomendar(explorando, ["agentes"]).solucoes).toContain("agent-factory");
  });

  it("empresa madura com ferramentas sobrepostas e tarefas repetitivas recebe Agent Factory", () => {
    const r = recomendar(calcular(base("33 33 32 32 33 33")), ["custo-ferramentas", "repetitivas"]);
    expect(r.solucoes).toEqual(["processos-com-ia", "agent-factory"]);
  });

  it("sem ponto forte quando nada se destaca ou tudo está baixo", () => {
    expect(recomendar(calcular(base("22 22 22 22 22 22")), []).forte).toBeNull();
    expect(recomendar(calcular(base("11 11 11 11 11 00")), []).forte).toBeNull();
  });

  it("na faixa alta, o passo é de evolução", () => {
    const r = recomendar(calcular(base("44 44 44 44 33 44")), []);
    expect(r.lacunas[0]).toBe("governanca");
    expect(r.passos[0]).toBe(dimensoes[4].passos.evoluir);
  });
});

describe("codificação do resultado no link", () => {
  const completo = base(EXEMPLO, {
    id: "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    areas: ["marketing", "customer-success"],
    porArea: { marketing: [1, 2, null, 3], "customer-success": [0, 0, 1, 4] },
    desafios: ["agentes", "medir"],
  });

  it("ida e volta sem perda", () => {
    const texto = codificar(completo);
    expect(texto).toBe(
      "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=marketing,customer-success&am=12x3&ac=0014&d=agentes,medir&h=3-meses&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    );
    expect(decodificar(texto)).toEqual(completo);
    expect(decodificar(`#${texto}`)).toEqual(completo);
    expect(completas(decodificar(texto))).toBe(true);
  });

  it("rascunho: perguntas sem resposta viram '-' e voltam como undefined", () => {
    const rascunho: Respostas = { ...respostasVazias(), escopo: "vendas", areas: ["vendas"] };
    rascunho.centrais[0] = 3;
    rascunho.centrais[1] = null;
    const texto = codificar(rascunho);
    expect(texto).toBe("v=1&e=vendas&r=3x----------&a=vendas&av=----");
    const volta = decodificar(texto)!;
    expect(volta.centrais.slice(0, 3)).toEqual([3, null, undefined]);
    expect(volta.porArea.vendas).toEqual([undefined, undefined, undefined, undefined]);
    expect(completas(volta)).toBe(false);
  });

  it("rejeita links adulterados ou de outra versão", () => {
    const ok = codificar(completo);
    for (const ruim of [
      "",
      ok.replace("v=1", "v=2"),
      ok.replace("e=empresa", "e=governo"),
      ok.replace("r=332221221121", "r=33222122112"),
      ok.replace("r=332221221121", "r=33222122112y"),
      ok.replace("d=agentes,medir", "d=agentes,medir,comecar"),
      ok.replace("d=agentes,medir", "d=agentes,agentes"),
      ok.replace("am=12x3", "am=129"),
      ok.replace("a=marketing", "a=juridico"),
      ok.replace("id=3f1c", "id=zz1c"),
      `${ok}&h=amanha`.replace("h=3-meses&", ""),
    ])
      expect(decodificar(ruim), ruim).toBeNull();
  });

  it("completas exige segmentação, todas as respostas, um ou dois desafios, prazo e a área do gestor", () => {
    expect(completas(completo)).toBe(true);
    expect(completas({ ...completo, desafios: [] })).toBe(false);
    expect(completas({ ...completo, horizonte: undefined })).toBe(false);
    expect(completas({ ...completo, centrais: centrais("33 22 21 22 11 2-") })).toBe(false);
    expect(completas({ ...completo, porArea: { ...completo.porArea, marketing: [1, 2, undefined, 3] } })).toBe(false);
    expect(completas({ ...completo, escopo: "vendas" })).toBe(false);
    expect(completas({ ...completo, escopo: "vendas", areas: ["vendas"], porArea: { vendas: [1, 1, 1, 1] } })).toBe(
      true,
    );
    expect(completas(null)).toBe(false);
  });

  it("nunca leva dados pessoais", () => {
    expect(codificar(completo)).not.toMatch(/@|nome|email/);
  });
});

describe("contato e lead score", () => {
  it("valida e-mail e sinaliza provedores gratuitos", () => {
    expect(emailValido("diego@resetia.com.br")).toBe(true);
    expect(emailValido("diego@resetia")).toBe(false);
    expect(emailValido("diego resetia.com.br")).toBe(false);
    expect(emailPessoal("alguem@Gmail.com")).toBe(true);
    expect(emailPessoal("diego@resetia.com.br")).toBe(false);
  });

  it("normaliza o WhatsApp com o 55 do Brasil", () => {
    expect(normalizarWhatsapp("(11) 91617-0606")).toBe("5511916170606");
    expect(normalizarWhatsapp("+55 11 91617-0606")).toBe("5511916170606");
    expect(normalizarWhatsapp("85 3333-4444")).toBe("558533334444");
    expect(normalizarWhatsapp("91617-0606")).toBeNull();
    expect(normalizarWhatsapp("")).toBeNull();
  });

  it("lead score vai de 0 a 100 e é independente do AI Score", () => {
    const maximo = leadScore({
      papel: "ceo",
      porte: "50-199",
      horizonte: "imediato",
      escopo: "empresa",
      desafios: 2,
      emailPessoal: false,
      whatsapp: true,
      pediuContato: true,
    });
    const minimo = leadScore({
      papel: "outro",
      porte: "ate-10",
      horizonte: "explorando",
      escopo: "vendas",
      desafios: 0,
      emailPessoal: true,
      whatsapp: false,
      pediuContato: false,
    });
    expect(maximo).toBe(100);
    expect(minimo).toBe(regras.leadScore.porte["ate-10"]);
  });
});

describe("estrutura do questionário", () => {
  it("doze perguntas, duas por dimensão, na ordem das dimensões", () => {
    expect(perguntasCentrais).toHaveLength(12);
    expect(perguntasCentrais.map((p) => p.dimensao)).toEqual(dimensoes.flatMap((d) => [d.id, d.id]));
    expect(new Set(perguntasCentrais.map((p) => p.id)).size).toBe(12);
  });
});
