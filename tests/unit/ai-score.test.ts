import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import { dimensoes, niveis, perguntasCentrais } from "@/content/ai-score-questionario";
import { solucaoPorSlug } from "@/content/solucoes";
import { analisar } from "@/lib/ai-score/analisar";
import { calcular, faixaDe, formatarNota, indiceDe, nivelDe, notaDe, numeroDoNivel } from "@/lib/ai-score/calcular";
import { codificar, completas, decodificar, respostasVazias } from "@/lib/ai-score/codificar";
import { emailPessoal, emailValido, normalizarWhatsapp } from "@/lib/ai-score/contato";
import { pontuacoes, type DadosLead } from "@/lib/ai-score/lead-score";
import { condicoesDe, ordenarLacunas, recomendar } from "@/lib/ai-score/recomendar";
import { metodoAtual } from "@/lib/ai-score/metodo";
import { metodo1 } from "@/lib/ai-score/metodo/metodo-1";
import { regras } from "@/lib/ai-score/regras";
import type { Respostas, Slot } from "@/lib/ai-score/tipos";
import type { DesafioId, DimensaoId } from "@/content/types";

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

/** Respostas do exemplo do documento. Na escala progressiva: dimensões 70, 40, 27,5, 40, 15, 27,5. */
const EXEMPLO = "33 22 21 22 11 21";

describe("cálculo do AI Score", () => {
  it("escala progressiva e a dimensão mais fraca em dobro: o exemplo do documento dá 34, Explorando", () => {
    expect(metodoAtual).toBe(metodo1);
    expect(metodo1.pontos).toEqual([0, 15, 40, 70, 100]);
    const r = calcular(base(EXEMPLO));
    expect(r.dimensoes).toEqual({
      estrategia: 70,
      pessoas: 40,
      processos: 27.5,
      dados: 40,
      governanca: 15,
      resultados: 27.5,
    });
    expect(r.parcial).toBe(false);
    // (70 + 40 + 27,5 + 40 + 15 + 27,5 + 15) / 7 = 33,6
    expect(r.indice).toBe(34);
    expect(r.nivel).toBe("explorando");
    expect(numeroDoNivel("explorando")).toBe(2);
    expect(indiceDe([70, 40, 27.5, 40, 15, 27.5])).toBe(34);
  });

  it("a landing page e /ai-score/exemplo usam o mesmo caso: 28, Explorando", () => {
    const r = calcular(decodificar(aiScore.exemplo.codigo)!);
    expect(r.indice).toBe(28);
    expect(r.nivel).toBe("explorando");
    expect(completas(decodificar(aiScore.exemplo.codigo))).toBe(true);
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

  it("índice da área: média dos pontos das quatro; área não avaliada não vira zero nem entra no AI Score", () => {
    const comArea = calcular(base(EXEMPLO, { areas: ["vendas"], porArea: { vendas: [4, 3, 2, 3] } }));
    expect(comArea.areas).toEqual({ vendas: 70 });
    expect(comArea.indice).toBe(34);
    expect(comArea.areas.marketing).toBeUndefined();
    expect(
      calcular(base(EXEMPLO, { areas: ["marketing"], porArea: { marketing: [null, null, null, null] } })).areas,
    ).toEqual({
      marketing: null,
    });
  });

  it("limites dos níveis: 19/20, 39/40, 59/60, 79/80", () => {
    expect([19, 20, 39, 40, 59, 60, 79, 80].map((x) => nivelDe(x))).toEqual([
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
    expect([0, 39.9, 40, 69, 70, 100].map(faixaDe)).toEqual(["baixa", "baixa", "media", "media", "alta", "alta"]);
    expect(formatarNota(37.5)).toBe("37,5");
    expect(formatarNota(50)).toBe("50");
    expect(notaDe([])).toBeNull();
  });
});

describe("recomendações", () => {
  const rec = (t: string, d: DesafioId[] = [], extra: Partial<Respostas> = {}) => {
    const r = base(t, { desafios: d, ...extra });
    return recomendar(calcular(r), d, r.centrais);
  };

  it("exemplo do documento: forte em Estratégia, só as dimensões abaixo de 70 são lacunas, Governança primeiro", () => {
    const r = rec(EXEMPLO);
    expect(r.forte).toBe("estrategia");
    expect(r.fortes).toEqual(["estrategia"]);
    // Estratégia (70) não é lacuna. Processos e Resultados empatam em 27,5 e Dados e Pessoas em 40: o critério fica registrado.
    expect(r.lacunas).toEqual(["governanca", "processos", "resultados", "dados", "pessoas"]);
    expect(r.desempate).toMatchObject({ processos: "dependencia", resultados: "dependencia", dados: "dependencia" });
    expect(r.indicacoes.map((i) => [i.slug, i.forca])).toEqual([
      ["governance", "indicada"],
      ["processos-com-ia", "indicada"],
    ]);
    expect(r.solucoes).toEqual(["governance", "processos-com-ia"]);
  });

  it("um desafio que as respostas contradizem não soma pontos: pede validação", () => {
    // "Não sabemos por onde começar" com Estratégia em 70: a direção declarada contradiz o desafio.
    const r = rec(EXEMPLO, ["comecar"]);
    expect(r.desafios).toEqual([{ id: "comecar", dimensao: "estrategia", nota: 70, situacao: "contradiz" }]);
    expect(r.solucoes).not.toContain("ai-champions");
    // Já um desafio de uma dimensão baixa é sustentado e soma pontos, com evidência direta.
    const sustentado = rec("22 00 22 22 22 22", ["capacitar"]);
    expect(sustentado.desafios[0]).toMatchObject({ id: "capacitar", situacao: "sustentado" });
    const champions = sustentado.indicacoes.find((i) => i.slug === "ai-champions");
    expect(champions?.apoios).toContainEqual({ tipo: "desafio", id: "capacitar" });
    expect(champions).toMatchObject({ direta: true, forca: "indicada" });
  });

  it("nunca mais de duas soluções, sempre slugs que existem; pode não haver nenhuma", () => {
    for (const t of [EXEMPLO, "00 00 00 00 00 00", "44 44 44 44 44 44", "22 33 11 44 22 13"]) {
      const r = rec(t, ["agentes", "medir"]);
      expect(r.solucoes.length).toBeLessThanOrEqual(regras.maxSolucoes);
      for (const s of r.solucoes) expect(solucaoPorSlug(s), s).toBeDefined();
    }
    const topo = rec("44 44 44 44 44 44");
    expect(topo.lacunas).toEqual([]);
    expect(topo.indicacoes).toEqual([]);
    expect(topo.solucoes).toEqual([]);
  });

  it("tudo no máximo não vira lacuna, nem com um desafio declarado: o desafio é que exige validação", () => {
    const r = rec("44 44 44 44 44 44", ["agentes", "medir"]);
    expect(r.lacunas).toEqual([]);
    expect(r.solucoes).toEqual([]);
    expect(r.desafios.map((d) => d.situacao)).toEqual(["contradiz", "contradiz"]);
  });

  it("nível Inicial não tem indicação fixa: a Governança, quando é a mais fraca, não some", () => {
    const r = rec("11 11 11 11 00 11");
    expect(r.lacunas[0]).toBe("governanca");
    expect(r.solucoes[0]).toBe("governance");
    expect(r.indicacoes[0]).toMatchObject({ slug: "governance", forca: "indicada" });
  });

  it("um pedido de agentes não prova prontidão: sem processo mapeado, fica a investigar, com a pendência dita", () => {
    // Pedido de agentes e de revisão de ferramentas, mas processos ainda no segundo estágio (p5 = 1): nunca "indicada".
    const sem = rec("22 22 11 22 22 22", ["agentes", "custo-ferramentas"]);
    expect(sem.indicacoes.find((i) => i.slug === "agent-factory")?.forca ?? "investigar").toBe("investigar");
    const centraisSem = base("22 22 11 22 22 22").centrais;
    expect(condicoesDe("agent-factory", centraisSem).find((c) => c.ref === "p5")).toEqual({
      ref: "p5",
      minimo: 2,
      situacao: "pendente",
    });
    // Com processo mapeado, dados organizados e regras, as condições estão atendidas e a solução é indicada.
    const pronto = rec("33 33 32 32 33 33", ["custo-ferramentas", "repetitivas"]);
    expect(pronto.indicacoes.map((i) => [i.slug, i.forca])).toEqual([
      ["processos-com-ia", "indicada"],
      ["agent-factory", "indicada"],
    ]);
    expect(regras.prontidao["agent-factory"].map((c) => c.ref)).toEqual(["p5", "p7", "p9"]);
    // "Não sei" numa condição é "sem resposta", não "atendida".
    expect(condicoesDe("agent-factory", base("22 22 x2 22 22 22").centrais)[0].situacao).toBe("sem-resposta");
  });

  it("Performance só vira indicação com algo em uso para medir; sem isso fica a investigar", () => {
    // Resultados é a menor dimensão, mas a IA não é usada pelas equipes (p3 = 0).
    const r = rec("32 02 33 33 33 10", ["medir"]);
    const performance = r.indicacoes.find((i) => i.slug === "performance");
    expect(performance?.forca).toBe("investigar");
    expect(performance?.condicoes).toEqual([{ ref: "p3", minimo: 1, situacao: "pendente" }]);
  });

  it("falta de liderança (Estratégia baixa) não indica sozinha uma capacitação: AI Champions fica a investigar", () => {
    const r = rec("00 44 44 44 44 44");
    expect(r.lacunas).toEqual(["estrategia"]);
    expect(r.indicacoes).toEqual([
      expect.objectContaining({ slug: "ai-champions", forca: "investigar", direta: false }),
    ]);
  });

  it("empate decidido por critério substantivo, registrado, e nunca pela ordem das dimensões", () => {
    // Todas em 40: o desafio declarado põe Governança na frente; sem desafio, vale a ordem de dependência.
    const r = rec("22 22 22 22 22 22", ["governanca"]);
    expect(r.lacunas[0]).toBe("governanca");
    expect(r.desempate.governanca).toBe("desafio");
    const sem = rec("22 22 22 22 22 22");
    expect(sem.lacunas).toEqual(regras.ordemDependencia);
    expect(Object.values(sem.desempate).every((c) => c === "dependencia")).toBe(true);
    // A menor resposta decide quando nota e desafio empatam.
    const medidas = (id: DimensaoId) => ({
      nota: 40,
      desafio: 1 as const,
      resposta: id === "dados" ? 1 : 2,
      dependencia: 9,
    });
    const o = ordenarLacunas(["pessoas", "dados"], medidas);
    expect(o.ordem).toEqual(["dados", "pessoas"]);
    expect(o.desempate).toEqual({ dados: "resposta-mais-baixa", pessoas: "resposta-mais-baixa" });
  });

  it("a ordem das lacunas não depende da ordem em que as dimensões chegam", () => {
    const ids = dimensoes.map((d) => d.id);
    const medidas = (id: DimensaoId) => ({
      nota: id === "dados" || id === "pessoas" ? 40 : 55,
      desafio: id === "pessoas" ? (0 as const) : (1 as const),
      resposta: id === "dados" ? 1 : 2,
      dependencia: regras.ordemDependencia.indexOf(id),
    });
    const esperado = ordenarLacunas(ids, medidas).ordem;
    for (const embaralhado of [[...ids].reverse(), [ids[3], ids[0], ids[5], ids[1], ids[4], ids[2]]])
      expect(ordenarLacunas(embaralhado, medidas).ordem).toEqual(esperado);
    // Nota igual: desafio, depois a menor resposta, depois a dependência.
    expect(esperado.slice(0, 2)).toEqual(["pessoas", "dados"]);
  });

  it("sem ponto forte quando nada se destaca ou tudo está baixo; com empate no topo, todas contam", () => {
    expect(rec("22 22 22 22 22 22").forte).toBeNull();
    expect(rec("11 11 11 11 11 00").forte).toBeNull();
    expect(rec("33 33 22 22 22 22").fortes).toEqual(["estrategia", "pessoas"]);
    // Em 70: Estratégia, Pessoas e Processos. A ordem de dependência só organiza a lista, não escolhe uma.
    expect(rec("33 33 33 22 22 22").fortes).toEqual(["estrategia", "processos", "pessoas"]);
  });

  it("lacuna só abaixo de 70: com uma dimensão em 70 ou mais, ela fica de fora", () => {
    const r = rec("44 44 44 44 33 44");
    expect(r.lacunas).toEqual([]);
    expect(rec("44 44 44 44 22 44").lacunas).toEqual(["governanca"]);
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
      "v=2&m=1&n=2&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=marketing,customer-success&am=12x3&ac=0014&d=agentes,medir&h=3-meses&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
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
    expect(texto).toBe("v=2&m=1&n=2&e=vendas&r=3x----------&a=vendas&av=----");
    const volta = decodificar(texto)!;
    expect(volta.centrais.slice(0, 3)).toEqual([3, null, undefined]);
    expect(volta.porArea.vendas).toEqual([undefined, undefined, undefined, undefined]);
    expect(completas(volta)).toBe(false);
  });

  it("rejeita links adulterados ou de outra versão", () => {
    const ok = codificar(completo);
    for (const ruim of [
      "",
      ok.replace("v=2", "v=3"),
      ok.replace("m=1&", ""),
      ok.replace("n=2", "n=0"),
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

  it("três pontuações separadas, cada uma com componentes e máximo, e sem nenhuma ligação com o AI Score", () => {
    const todos: DadosLead = {
      papel: "ceo",
      porte: "50-199",
      horizonte: "imediato",
      escopo: "empresa",
      desafios: 2,
      emailPessoal: false,
      whatsapp: true,
      relatorioCompleto: true,
      pediuContato: true,
      solucaoIndicada: true,
      aprofundamento: 2,
    };
    const nenhum: DadosLead = {
      papel: "outro",
      porte: "ate-10",
      horizonte: "explorando",
      escopo: "vendas",
      desafios: 0,
      emailPessoal: true,
      whatsapp: false,
      relatorioCompleto: false,
      pediuContato: false,
      solucaoIndicada: false,
      aprofundamento: 0,
    };
    const maximo = pontuacoes(todos);
    for (const k of ["aderencia", "intencao", "oportunidade"] as const) {
      expect(maximo[k].pontos, k).toBe(maximo[k].maximo);
      expect(
        maximo[k].itens.reduce((t, i) => t + i.pontos, 0),
        k,
      ).toBe(maximo[k].pontos);
    }
    const minimo = pontuacoes(nenhum);
    expect(minimo.intencao.pontos).toBe(0);
    expect(minimo.oportunidade.pontos).toBe(0);
    // Mesmo no pior perfil, a aderência não zera por completo (cargo e porte não são prova de nada).
    expect(minimo.aderencia.pontos).toBeGreaterThan(0);
    // O pedido de contato é o maior componente da intenção; o cargo é pequeno na aderência.
    const intencao = regras.leadScore.intencao;
    expect(intencao.pediuContato).toBeGreaterThan(Math.max(...Object.values(intencao.horizonte)));
    expect(Math.max(...Object.values(regras.leadScore.aderencia.papel))).toBeLessThanOrEqual(10);
  });

  it("a maturidade não entra em nenhuma pontuação: a mesma pessoa pontua igual com qualquer nota", () => {
    const pessoa: DadosLead = {
      papel: "gestor",
      porte: "11-49",
      horizonte: "3-meses",
      escopo: "empresa",
      desafios: 1,
      emailPessoal: false,
      whatsapp: false,
      relatorioCompleto: true,
      pediuContato: false,
      solucaoIndicada: false,
      aprofundamento: 1,
    };
    expect(pontuacoes(pessoa)).toEqual(pontuacoes({ ...pessoa }));
    expect(Object.keys(pessoa)).not.toContain("indice");
  });
});

describe("estrutura do questionário", () => {
  it("doze perguntas, duas por dimensão, na ordem das dimensões", () => {
    expect(perguntasCentrais).toHaveLength(12);
    expect(perguntasCentrais.map((p) => p.dimensao)).toEqual(dimensoes.flatMap((d) => [d.id, d.id]));
    expect(new Set(perguntasCentrais.map((p) => p.id)).size).toBe(12);
  });
});

describe("análise do relatório completo", () => {
  const r = decodificar(aiScore.exemplo.codigo)!;
  const resultado = calcular(r);
  const rec = recomendar(resultado, r.desafios);
  const a = analisar(r, resultado, rec);

  it("próximo nível e as lacunas (só abaixo de 70) com o desafio marcado na dimensão", () => {
    expect(a.proximoNivel).toEqual({ nivel: "desenvolvimento", faltam: 12 });
    expect(a.prioridades.map((p) => [p.dimensao, p.prioridade, p.desafio])).toEqual([
      ["governanca", "critica", true],
      ["resultados", "critica", false],
      ["processos", "alta", true],
      ["dados", "alta", false],
      ["pessoas", "media", false],
      ["estrategia", "media", false],
    ]);
  });

  it("cada resposta com o próximo estágio; Não sei vira ponto cego", () => {
    expect(a.respostas[0]).toMatchObject({ atual: 3, proximo: perguntasCentrais[0].alternativas[4] });
    expect(a.respostas[9]).toMatchObject({ atual: null, proximo: null });
    expect(a.pontosCegos).toEqual([9, 11]);
  });

  it("alertas pelos padrões entre respostas, todos (sem corte), cada um com as respostas que o sustentam", () => {
    expect(a.alertas.map((x) => x.alerta)).toEqual([
      "adocao-sem-governanca",
      "estrategia-sem-execucao",
      "pontos-cegos",
    ]);
    expect(a.alertas[0].evidencias).toEqual([
      { tipo: "resposta", ref: "p3", valor: 2 },
      { tipo: "resposta", ref: "p9", valor: 1 },
    ]);
    const inicial = calcular(base("00 00 00 00 00 00"));
    expect(analisar(base("00 00 00 00 00 00"), inicial, recomendar(inicial, ["comecar"])).alertas[0].alerta).toBe(
      "inicio",
    );
  });

  it("simulação: as dimensões abaixo de 40 chegando a 40 levam de 28 a 42 (Em desenvolvimento)", () => {
    expect(a.simulacao).toEqual({
      alvo: 40,
      de: 28,
      para: 42,
      nivel: "desenvolvimento",
      dimensoes: ["processos", "dados", "governanca", "resultados"],
    });
    const topo = calcular(base("44 44 44 44 44 44"));
    expect(analisar(base("44 44 44 44 44 44"), topo, recomendar(topo, [])).simulacao).toBeNull();
  });
});
