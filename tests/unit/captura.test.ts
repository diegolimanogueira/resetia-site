import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** O cliente lê as envs ao carregar: cada teste importa os módulos de novo com as envs que quer. */
async function carregar(ativo = true) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ativo ? "https://projeto.supabase.co/" : "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ativo ? "chave-anon" : "");
  return {
    captura: await import("@/lib/ai-score/captura"),
    fila: await import("@/lib/ai-score/fila"),
    nav: await import("@/lib/ai-score/navegador"),
  };
}

const ok = (corpo: unknown = { status: "registrado" }) => new Response(JSON.stringify(corpo), { status: 200 });
const erro = (status: number) => new Response(JSON.stringify({ erro: "x" }), { status });
const AV = "00000000-0000-4000-8000-000000000000";
const LEAD = "11111111-1111-4111-8111-111111111111";
const CHAVE = "k".repeat(43);
const registro = {
  avaliacaoId: AV,
  leadId: LEAD,
  chave: CHAVE,
  codigo: "v=2&m=1&n=2&e=empresa",
  nome: "Maria",
  email: "m@x.com",
  marketing: false,
};
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const liberar = (nav: Awaited<ReturnType<typeof carregar>>["nav"]) =>
  nav.relatorio.liberar(AV, {
    leadId: LEAD,
    chave: CHAVE,
    nome: "Maria",
    data: "01/11/2026",
    completo: false,
    contato: "pendente",
  });
const liberacao = (nav: Awaited<ReturnType<typeof carregar>>["nav"]) => nav.lerLiberacao(nav.relatorio.ler(AV));

describe("classificação das respostas", () => {
  it("200 é aceito; rede, tempo esgotado, 408, 429 e 5xx valem nova tentativa; o resto é recusa definitiva", async () => {
    const { captura } = await carregar();
    expect(captura.classificar({ ok: true, status: 200 })).toBe("aceito");
    for (const status of [0, 408, 429, 500, 502, 503])
      expect(captura.classificar({ ok: false, status }), String(status)).toBe("tentar-de-novo");
    for (const status of [400, 403, 404, 409, 413, 422])
      expect(captura.classificar({ ok: false, status }), String(status)).toBe("recusado");
  });
});

describe("registrar o contato (etapa 1)", () => {
  it("desligado (demonstração): nada vai para a rede nem para a fila", async () => {
    const { captura, fila } = await carregar(false);
    expect(await captura.registrarContato(registro)).toBe("desligado");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fila.pendentesNaFila()).toBe(0);
  });

  it("aceito: manda o corpo certo à função, sai da fila e marca o contato como aceito", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockResolvedValue(ok());
    expect(await captura.registrarContato(registro)).toBe("aceito");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://projeto.supabase.co/functions/v1/ai-score");
    expect(JSON.parse(init.body)).toMatchObject({
      acao: "registrar",
      avaliacao_id: AV,
      lead_id: LEAD,
      chave: CHAVE,
      nome: "Maria",
      email: "m@x.com",
      ambiente: "dev",
    });
    // Nunca vai nota, nível nem dimensões do navegador: a nota é recalculada no servidor.
    expect(Object.keys(JSON.parse(init.body))).not.toEqual(expect.arrayContaining(["indice"]));
    expect(fila.pendentesNaFila()).toBe(0);
    expect(liberacao(nav)?.contato).toBe("aceito");
  });

  it("sem rede: fica pendente, o item sobrevive na fila e o contato NÃO é apresentado como registrado", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await captura.registrarContato(registro)).toBe("pendente");
    expect(fila.pendentesNaFila()).toBe(1);
    expect(liberacao(nav)?.contato).toBe("pendente");
  });

  it("o item é gravado ANTES da tentativa: se a aba fechar no meio, ele já está na fila", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    let naFilaDuranteAChamada = -1;
    fetchMock.mockImplementation(async () => {
      naFilaDuranteAChamada = fila.pendentesNaFila();
      return ok();
    });
    await captura.registrarContato(registro);
    expect(naFilaDuranteAChamada).toBe(1);
  });

  it("recusa definitiva (409, 422, 403): sai da fila e marca recusado", async () => {
    for (const status of [409, 422, 403]) {
      localStorage.clear();
      const { captura, fila, nav } = await carregar();
      liberar(nav);
      fetchMock.mockResolvedValue(erro(status));
      expect(await captura.registrarContato(registro), String(status)).toBe("recusado");
      expect(fila.pendentesNaFila()).toBe(0);
      expect(liberacao(nav)?.contato).toBe("recusado");
    }
  });
});

describe("a fila volta a tentar, na ordem certa, sem perder nada", () => {
  it("ao reconectar: tenta o que venceu, aceita e esvazia a fila", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await captura.registrarContato(registro);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(ok());
    // Ainda dentro da espera: não tenta.
    await captura.retomarFila();
    expect(fetchMock).not.toHaveBeenCalled();
    // Vencida a espera (aqui forçada): tenta, o servidor aceita e o item sai.
    const [item] = fila.proximosPendentes(Date.now() + 3_600_000);
    expect(item?.tentativas).toBe(1);
    vi.useFakeTimers({ now: Date.now() + 3_600_000 });
    await captura.retomarFila();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fila.pendentesNaFila()).toBe(0);
    expect(liberacao(nav)?.contato).toBe("aceito");
  });

  it("completar e aprofundar esperam o registro do mesmo lead ser aceito", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await captura.registrarContato(registro);
    await captura.completarContato({
      avaliacaoId: AV,
      leadId: LEAD,
      chave: CHAVE,
      empresa: "Empresa",
      whatsapp: null,
      pediuContato: false,
      marketing: false,
    });
    expect(fila.pendentesNaFila()).toBe(2);
    // Mesmo com tudo vencido, só o registro pode sair primeiro.
    const prontos = fila.proximosPendentes(Date.now() + 10 * 3_600_000);
    expect(prontos.map((i) => i.tipo)).toEqual(["registrar"]);
  });

  it("o que entra na fila enquanto ela é reprocessada não se perde (a fila antiga sobrescrevia)", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await captura.registrarContato(registro);
    vi.useFakeTimers({ now: Date.now() + 3_600_000 });
    // Durante a nova tentativa do registro, outro pedido entra na fila.
    fetchMock.mockImplementation(async () => {
      fila.enfileirar({
        id: "novo",
        tipo: "concluir",
        avaliacaoId: "outra",
        corpo: { acao: "concluir" },
        criadoEm: Date.now(),
      });
      return ok();
    });
    await captura.retomarFila();
    const restantes = fila.proximosPendentes(Date.now() + 10 * 3_600_000).map((i) => i.id);
    expect(restantes).toEqual(["novo"]);
  });

  it("um pedido por tipo e lead: o mais novo substitui o antigo; no aprofundamento, a revisão maior vence", async () => {
    const { fila } = await carregar();
    const base = { tipo: "aprofundar" as const, avaliacaoId: AV, leadId: LEAD, criadoEm: 1 };
    fila.enfileirar({ ...base, id: "a", revisao: 2, corpo: { r: 2 } }, 1);
    fila.enfileirar({ ...base, id: "b", revisao: 1, corpo: { r: 1 } }, 2);
    expect(fila.pendentesNaFila()).toBe(1);
    expect(fila.proximosPendentes(10)[0].id).toBe("a");
    fila.enfileirar({ ...base, id: "c", revisao: 3, corpo: { r: 3 } }, 3);
    expect(fila.proximosPendentes(10).map((i) => i.id)).toEqual(["c"]);
  });

  it("vence em 7 dias: o item sai e conta como recusado (nunca chegou ao servidor)", async () => {
    const { captura, fila, nav } = await carregar();
    liberar(nav);
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await captura.registrarContato(registro);
    vi.useFakeTimers({ now: Date.now() + fila.VALIDADE_MS + 1000 });
    fetchMock.mockReset();
    await captura.retomarFila();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fila.pendentesNaFila()).toBe(0);
    expect(liberacao(nav)?.contato).toBe("recusado");
  });

  it("espera crescente: 5 s, 15 s, 45 s… no máximo 1 hora, com aleatoriedade limitada", async () => {
    const { fila } = await carregar();
    const sem = () => 0.5; // sem desvio
    expect([1, 2, 3, 4, 5].map((n) => fila.esperaAte(n, sem))).toEqual([5000, 15000, 45000, 135000, 405000]);
    expect(fila.esperaAte(20, sem)).toBe(3_600_000);
    for (let i = 0; i < 20; i++) {
      const e = fila.esperaAte(2);
      expect(e).toBeGreaterThanOrEqual(12000);
      expect(e).toBeLessThanOrEqual(18000);
    }
  });

  it("os dados pessoais saem do navegador junto com o item: nada fica depois de aceito", async () => {
    const { captura, nav } = await carregar();
    liberar(nav);
    fetchMock.mockResolvedValue(ok());
    await captura.registrarContato(registro);
    expect(localStorage.getItem("resetia.ai-score.fila.v2")).toBeNull();
  });
});

describe("e-mail do relatório: o estado vem do servidor", () => {
  it("completar aceito marca o e-mail como pendente (nunca como enviado) e consulta o estado real", async () => {
    const { captura, nav } = await carregar();
    liberar(nav);
    fetchMock.mockResolvedValueOnce(ok({ status: "completado" }));
    expect(
      await captura.completarContato({
        avaliacaoId: AV,
        leadId: LEAD,
        chave: CHAVE,
        empresa: "Empresa",
        whatsapp: "5585999990000",
        pediuContato: true,
        marketing: false,
      }),
    ).toBe("aceito");
    expect(liberacao(nav)?.emailEstado).toBe("pendente");
    expect(liberacao(nav)?.emailEnviado).not.toBe(true);
    const corpo = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(corpo).toMatchObject({
      acao: "completar",
      empresa: "Empresa",
      whatsapp: "5585999990000",
      pediu_contato: true,
    });
  });

  it("consultar traduz os estados e devolve null quando não dá para saber", async () => {
    const { captura } = await carregar();
    for (const estado of [
      "pendente",
      "aceito",
      "nova-tentativa",
      "falhou",
      "nao-configurado",
      "cancelada",
      "limite",
      "nao-pedido",
    ]) {
      fetchMock.mockResolvedValueOnce(ok({ relatorio_email: { estado } }));
      expect(await captura.consultarEmail(LEAD, CHAVE), estado).toBe(estado);
    }
    fetchMock.mockResolvedValueOnce(ok({ relatorio_email: { estado: "entregue" } }));
    expect(await captura.consultarEmail(LEAD, CHAVE)).toBeNull();
    fetchMock.mockResolvedValueOnce(erro(403));
    expect(await captura.consultarEmail(LEAD, CHAVE)).toBeNull();
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(await captura.consultarEmail(LEAD, CHAVE)).toBeNull();
  });

  it("acompanhar: consulta até sair de pendente e grava o estado final na liberação", async () => {
    const { captura, nav } = await carregar();
    liberar(nav);
    fetchMock
      .mockResolvedValueOnce(ok({ relatorio_email: { estado: "pendente" } }))
      .mockResolvedValueOnce(ok({ relatorio_email: { estado: "nova-tentativa" } }))
      .mockResolvedValueOnce(ok({ relatorio_email: { estado: "aceito" } }));
    await captura.acompanharEmail(AV, LEAD, CHAVE, [1, 1, 1, 1, 1]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(liberacao(nav)?.emailEstado).toBe("aceito");
  });

  it("acompanhar para quando as consultas acabam, sem fingir que o e-mail saiu", async () => {
    const { captura, nav } = await carregar();
    liberar(nav);
    fetchMock.mockResolvedValue(ok({ relatorio_email: { estado: "pendente" } }));
    await captura.acompanharEmail(AV, LEAD, CHAVE, [1, 1]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(liberacao(nav)?.emailEstado).toBe("pendente");
  });
});

describe("liberação guardada no navegador", () => {
  it("lê os campos novos e ignora valores inventados", async () => {
    const { nav } = await carregar();
    const l = nav.lerLiberacao(
      JSON.stringify({ nome: "M", data: "d", completo: true, chave: CHAVE, contato: "aceito", emailEstado: "aceito" }),
    );
    expect(l).toMatchObject({ chave: CHAVE, contato: "aceito", emailEstado: "aceito" });
    const ruim = nav.lerLiberacao(
      JSON.stringify({ nome: "M", data: "d", contato: "talvez", emailEstado: "entregue", chave: 5 }),
    );
    expect(ruim?.contato).toBeUndefined();
    expect(ruim?.emailEstado).toBeUndefined();
    expect(ruim?.chave).toBeUndefined();
  });

  it("uma liberação antiga (sem chave) continua válida, para quem fez a etapa 1 antes da mudança", async () => {
    const { nav } = await carregar();
    expect(
      nav.lerLiberacao(JSON.stringify({ leadId: LEAD, nome: "M", data: "d", completo: false }))?.chave,
    ).toBeUndefined();
  });

  it("a chave nova tem 43 caracteres base64url e nunca se repete", async () => {
    const { nav } = await carregar();
    const chaves = new Set(Array.from({ length: 50 }, () => nav.novaChave()));
    expect(chaves.size).toBe(50);
    for (const c of chaves) expect(c).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});
