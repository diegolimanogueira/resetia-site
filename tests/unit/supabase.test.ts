import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** O cliente lê as envs ao carregar: cada teste importa o módulo de novo com as envs que quer. */
async function carregar(ativo = true) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ativo ? "https://projeto.supabase.co/" : "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ativo ? "chave-anon" : "");
  return { ...(await import("@/lib/supabase")), ...(await import("@/lib/supabase-admin")) };
}

const resposta = (status: number, corpo: unknown = "") =>
  new Response(status === 204 ? null : typeof corpo === "string" ? corpo : JSON.stringify(corpo), { status });

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
});

describe("cliente anônimo (inserções)", () => {
  it("sem envs é modo demonstração: nada vai para a rede", async () => {
    const { supabase, inserir, enviar } = await carregar(false);
    expect(supabase.ativo).toBe(false);
    expect(await inserir("avaliacoes", { id: "x" })).toBe("desligado");
    expect(await enviar("leads", { id: "x" })).toBe("desligado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("insere com a chave anônima, sem pedir a linha de volta", async () => {
    const { inserir } = await carregar();
    fetchMock.mockResolvedValue(resposta(201));
    expect(await inserir("avaliacoes", { id: "a1" })).toBe("ok");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://projeto.supabase.co/rest/v1/avaliacoes");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      apikey: "chave-anon",
      Authorization: "Bearer chave-anon",
      Prefer: "return=minimal",
    });
    expect(JSON.parse(init.body)).toEqual({ id: "a1" });
  });

  it("linha repetida conta como gravada; dado recusado não volta para a fila", async () => {
    const { inserir, enviar } = await carregar();
    fetchMock.mockResolvedValueOnce(resposta(409, { code: "23505" }));
    expect(await inserir("avaliacoes", { id: "a1" })).toBe("ok");
    fetchMock.mockResolvedValueOnce(resposta(400, { code: "23514" }));
    expect(await enviar("leads", { id: "l1" })).toBe("erro");
    expect(localStorage.getItem("resetia.ai-score.pendentes")).toBeNull();
  });

  it("rede fora, projeto pausado ou avaliação ainda não gravada: guarda e reenvia na ordem", async () => {
    const { enviar, reenviarPendentes } = await carregar();
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(await enviar("avaliacoes", { id: "a1" })).toBe("tentar-de-novo");
    fetchMock.mockResolvedValueOnce(resposta(409, { code: "23503" }));
    expect(await enviar("leads", { id: "l1", avaliacao_id: "a1" })).toBe("tentar-de-novo");
    expect(JSON.parse(localStorage.getItem("resetia.ai-score.pendentes")!)).toHaveLength(2);

    fetchMock.mockResolvedValue(resposta(201));
    await reenviarPendentes();
    expect(fetchMock.mock.calls.slice(2).map(([url]) => url)).toEqual([
      "https://projeto.supabase.co/rest/v1/avaliacoes",
      "https://projeto.supabase.co/rest/v1/leads",
    ]);
    expect(localStorage.getItem("resetia.ai-score.pendentes")).toBeNull();
  });
});

describe("etapa 2: completar o lead pela função do banco", () => {
  it("chama a função como anônimo; true é ok, false (lead ainda não chegou) volta para a fila", async () => {
    const { enviarChamada, reenviarPendentes } = await carregar();
    fetchMock.mockResolvedValueOnce(resposta(200, true));
    expect(await enviarChamada("completar_lead", { p_id: "l1", p_empresa: "X" })).toBe("ok");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://projeto.supabase.co/rest/v1/rpc/completar_lead");
    expect(init.headers).toMatchObject({ apikey: "chave-anon", Authorization: "Bearer chave-anon" });
    expect(JSON.parse(init.body)).toEqual({ p_id: "l1", p_empresa: "X" });

    fetchMock.mockResolvedValueOnce(resposta(200, false));
    expect(await enviarChamada("completar_lead", { p_id: "l2", p_empresa: "Y" })).toBe("tentar-de-novo");
    expect(JSON.parse(localStorage.getItem("resetia.ai-score.pendentes")!)).toEqual([
      { tipo: "rpc", funcao: "completar_lead", args: { p_id: "l2", p_empresa: "Y" } },
    ]);
    fetchMock.mockResolvedValueOnce(resposta(200, true));
    await reenviarPendentes();
    expect(fetchMock.mock.calls[2][0]).toBe("https://projeto.supabase.co/rest/v1/rpc/completar_lead");
    expect(localStorage.getItem("resetia.ai-score.pendentes")).toBeNull();
  });
});

describe("cliente do admin (GoTrue + REST com token)", () => {
  const token = { access_token: "t1", refresh_token: "r1", expires_in: 3600, user: { email: "admin@resetia.com.br" } };

  it("entra com e-mail e senha e separa senha errada de falha de rede", async () => {
    const { entrar } = await carregar();
    fetchMock.mockResolvedValueOnce(resposta(200, token));
    const s = await entrar("admin@resetia.com.br", "segredo");
    expect(s).toMatchObject({ access_token: "t1", refresh_token: "r1", email: "admin@resetia.com.br" });
    expect(fetchMock.mock.calls[0][0]).toBe("https://projeto.supabase.co/auth/v1/token?grant_type=password");
    fetchMock.mockResolvedValueOnce(resposta(400, { error: "invalid_grant" }));
    expect(await entrar("admin@resetia.com.br", "errada")).toBe("credenciais");
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(await entrar("admin@resetia.com.br", "segredo")).toBe("erro");
  });

  it("lista com o token do admin e renova o token perto de expirar", async () => {
    const { listar, sessao, lerSessao } = await carregar();
    const vencendo = {
      access_token: "velho",
      refresh_token: "r1",
      expires_at: Date.now() / 1000 + 10,
      email: "a@b.co",
    };
    fetchMock
      .mockResolvedValueOnce(resposta(200, { ...token, access_token: "novo", refresh_token: "r2" }))
      .mockResolvedValueOnce(resposta(200, [{ id: "a1", leads: [] }]));
    expect(await listar(vencendo)).toEqual([{ id: "a1", leads: [] }]);
    expect(fetchMock.mock.calls[0][0]).toContain("grant_type=refresh_token");
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toContain("/rest/v1/avaliacoes?select=");
    expect(url).toContain("leads(*)");
    expect(init.headers.Authorization).toBe("Bearer novo");
    expect(lerSessao(sessao.ler())?.access_token).toBe("novo");
  });

  it("token recusado e sem renovação: encerra a sessão", async () => {
    const { atualizarLead, sessao } = await carregar();
    const s = { access_token: "t", refresh_token: "r", expires_at: Date.now() / 1000 + 3600, email: "a@b.co" };
    sessao.gravar(s);
    fetchMock.mockResolvedValueOnce(resposta(401)).mockResolvedValueOnce(resposta(400));
    expect(await atualizarLead(s, "l1", { status: "contatado", notas: null })).toBe("sessao");
    expect(sessao.ler()).toBeNull();
  });

  it("atualiza só status e notas do lead pelo id", async () => {
    const { atualizarLead } = await carregar();
    const s = { access_token: "t", refresh_token: "r", expires_at: Date.now() / 1000 + 3600, email: "a@b.co" };
    fetchMock.mockResolvedValueOnce(resposta(204));
    expect(await atualizarLead(s, "l1", { status: "qualificado", notas: "Ligar" })).toBe("ok");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://projeto.supabase.co/rest/v1/leads?id=eq.l1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ status: "qualificado", notas: "Ligar" });
  });
});
