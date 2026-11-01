// @vitest-environment node
import { describe, expect, it } from "vitest";
import { problemasDeConfiguracao, verificarConfiguracao } from "../../scripts/configuracao-build.mjs";

const producao = { NODE_ENV: "production" };
const supabase = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_x",
};

describe("trava do build de produção", () => {
  it("em desenvolvimento, nada é exigido (o AI Score roda em demonstração)", () => {
    expect(problemasDeConfiguracao({ NODE_ENV: "development" })).toEqual([]);
    expect(problemasDeConfiguracao({})).toEqual([]);
  });

  it("produção com o Supabase configurado passa", () => {
    expect(problemasDeConfiguracao({ ...producao, ...supabase })).toEqual([]);
    expect(() => verificarConfiguracao({ ...producao, ...supabase })).not.toThrow();
  });

  it("produção sem a configuração essencial falha, dizendo o que falta, em vez de virar demonstração em silêncio", () => {
    expect(problemasDeConfiguracao(producao)).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL ausente",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY ausente",
    ]);
    expect(
      problemasDeConfiguracao({ ...producao, NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" }),
    ).toHaveLength(2);
    expect(
      problemasDeConfiguracao({ ...producao, NEXT_PUBLIC_SUPABASE_URL: supabase.NEXT_PUBLIC_SUPABASE_URL }),
    ).toEqual(["NEXT_PUBLIC_SUPABASE_ANON_KEY ausente"]);
    expect(() => verificarConfiguracao(producao)).toThrow(
      /Configuração de produção incompleta[\s\S]*RESETIA_MODO=demo/,
    );
  });

  it("URL que não é https, ou fictícia, também falha", () => {
    expect(
      problemasDeConfiguracao({ ...producao, ...supabase, NEXT_PUBLIC_SUPABASE_URL: "http://abc.supabase.co" }),
    ).toEqual(["NEXT_PUBLIC_SUPABASE_URL não é uma URL https"]);
    expect(
      problemasDeConfiguracao({ ...producao, ...supabase, NEXT_PUBLIC_SUPABASE_URL: "https://supabase.invalid" }),
    ).toEqual(["NEXT_PUBLIC_SUPABASE_URL aponta para um endereço fictício (.invalid)"]);
  });

  it("demo e teste são pedidos de propósito e dispensam o Supabase; qualquer outro modo é erro", () => {
    expect(problemasDeConfiguracao({ ...producao, RESETIA_MODO: "demo" })).toEqual([]);
    expect(
      problemasDeConfiguracao({
        ...producao,
        RESETIA_MODO: "teste",
        NEXT_PUBLIC_SUPABASE_URL: "https://supabase.invalid",
      }),
    ).toEqual([]);
    expect(problemasDeConfiguracao({ ...producao, RESETIA_MODO: "producao" })).toEqual([
      "RESETIA_MODO=producao não existe (use demo ou teste, ou deixe vazio).",
    ]);
  });
});
