import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { descricaoDosEventos } from "@/content/ai-score-eventos";
import { eventoDoClique } from "@/lib/analytics";
import { EVENTOS_AI_SCORE, limparDados } from "@/lib/analytics-eventos";
import { testeSpotliteUrl } from "@/lib/teste-spotlite";
import { waDiagnostico, waGeral } from "@/lib/whatsapp";

describe("eventoDoClique", () => {
  it("separa o diagnóstico gratuito das demais conversas no WhatsApp", () => {
    expect(eventoDoClique({ href: waDiagnostico(), cta: "diagnostico-hero" })).toBe("cta_diagnostico_gratuito");
    expect(eventoDoClique({ href: waGeral(), cta: "footer" })).toBe("cta_whatsapp");
    expect(eventoDoClique({ href: waGeral() })).toBe("cta_whatsapp");
  });

  it("conta a ida para a página do diagnóstico e o teste da Spotlite", () => {
    expect(eventoDoClique({ href: "https://www.resetia.com.br/diagnostico-gratuito/", cta: "menu" })).toBe(
      "cta_pagina_diagnostico",
    );
    expect(eventoDoClique({ href: testeSpotliteUrl("diagnostico"), cta: "teste-spotlite" })).toBe("cta_teste_spotlite");
  });

  it("conta a ida para o RESET AI Score separada da página do diagnóstico", () => {
    expect(eventoDoClique({ href: "https://www.resetia.com.br/ai-score/", cta: "ai-score-hero" })).toBe("cta_ai_score");
    expect(eventoDoClique({ href: "https://www.resetia.com.br/ai-score/avaliacao/", cta: "ai-score-lp" })).toBe(
      "cta_ai_score",
    );
  });
});

describe("eventos do AI Score: sem dado pessoal, sem repetição, só o que está no catálogo", () => {
  const umami = { track: vi.fn() };

  async function carregar(id = "site-id") {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ID", id);
    return import("@/lib/analytics");
  }

  beforeEach(() => {
    umami.track.mockClear();
    sessionStorage.clear();
    (window as unknown as { umami: typeof umami }).umami = umami;
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sem analytics configurado, nada é enviado", async () => {
    const { track } = await carregar("");
    track("ai_score_abertura");
    await vi.dynamicImportSettled();
    expect(umami.track).not.toHaveBeenCalled();
  });

  it("evento fora do catálogo é descartado", async () => {
    const { track } = await carregar();
    track("evento_inventado", { origem: "x" });
    track("ai_score_abertura");
    await vi.dynamicImportSettled();
    expect(umami.track.mock.calls.map((c) => c[0])).toEqual(["ai_score_abertura"]);
  });

  it("só passam as chaves declaradas e os valores de vocabulário controlado", () => {
    const sujo = {
      escopo: "empresa",
      nivel: "explorando",
      nome: "Maria Silva",
      email: "maria@empresa.com.br",
      papel: "maria@empresa.com.br",
      indice: 34,
      marketing: true,
      token: "t".repeat(43),
    };
    expect(limparDados(EVENTOS_AI_SCORE.ai_score_concluido.chaves, sujo)).toEqual({
      escopo: "empresa",
      nivel: "explorando",
      indice: 34,
    });
    // Telefone, UUID e token são recusados mesmo dentro de uma chave permitida.
    for (const v of [
      "5585999990000",
      "(85) 99999-0000",
      "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
      "a".repeat(40),
      "texto livre digitado",
      "x@y.com",
    ])
      expect(limparDados(["papel"], { papel: v }), v).toEqual({});
    expect(limparDados(["papel"], { papel: "ceo" })).toEqual({ papel: "ceo" });
    expect(limparDados(["indice"], { indice: Number.NaN })).toEqual({});
  });

  it("nenhum evento do catálogo aceita uma chave que possa levar nome, e-mail, telefone, texto ou token", () => {
    const proibidas = /nome|email|e-mail|telefone|whatsapp|empresa|texto|token|lead|chave|codigo|respostas|hash|id$/i;
    for (const [evento, e] of Object.entries(EVENTOS_AI_SCORE))
      for (const chave of e.chaves) expect(chave, `${evento}.${chave}`).not.toMatch(proibidas);
  });

  it("evento único conta uma vez por sessão, mesmo renderizando de novo", async () => {
    const { track } = await carregar();
    for (let i = 0; i < 5; i++) track("ai_score_abertura");
    track("ai_score_etapa", { etapa: 2, total: 9 });
    track("ai_score_etapa", { etapa: 3, total: 9 });
    await vi.dynamicImportSettled();
    expect(umami.track.mock.calls.filter((c) => c[0] === "ai_score_abertura")).toHaveLength(1);
    // Etapas contam cada avanço (não são únicas).
    expect(umami.track.mock.calls.filter((c) => c[0] === "ai_score_etapa")).toHaveLength(2);
  });

  it("evento único por avaliação conta uma vez para cada avaliação", async () => {
    const { track } = await carregar();
    track("ai_score_contato", { nivel: "explorando" }, "aval-1");
    track("ai_score_contato", { nivel: "explorando" }, "aval-1");
    track("ai_score_contato", { nivel: "explorando" }, "aval-2");
    await vi.dynamicImportSettled();
    expect(umami.track.mock.calls.filter((c) => c[0] === "ai_score_contato")).toHaveLength(2);
  });

  it("os eventos pedidos existem, cada um com o que mede e o denominador", () => {
    const pedidos = [
      "ai_score_abertura",
      "ai_score_primeira_interacao",
      "ai_score_inicio",
      "ai_score_etapa",
      "ai_score_concluido",
      "ai_score_contato",
      "ai_score_lead",
      "ai_score_aprofundamento_inicio",
      "ai_score_aprofundamento_salvo",
      "ai_score_aprofundamento_pulado",
      "ai_score_download",
      "ai_score_email_aceito",
      "ai_score_email_falhou",
    ] as const;
    expect(Object.keys(EVENTOS_AI_SCORE).sort()).toEqual([...pedidos].sort());
    expect(Object.keys(descricaoDosEventos).sort()).toEqual([...pedidos].sort());
    for (const nome of pedidos) {
      expect(descricaoDosEventos[nome].mede.length, nome).toBeGreaterThan(5);
      expect(descricaoDosEventos[nome].denominador.length, nome).toBeGreaterThan(5);
    }
  });
});
