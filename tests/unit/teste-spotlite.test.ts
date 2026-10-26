import { describe, expect, it } from "vitest";
import { diagnostico } from "@/content/diagnostico";
import { site } from "@/content/site";
import { testeSpotliteUrl } from "@/lib/teste-spotlite";

describe("testeSpotliteUrl", () => {
  it("aponta para o teste aberto da Spotlite com a origem do clique", () => {
    const url = new URL(testeSpotliteUrl("diagnostico"));
    expect(url.origin + url.pathname).toBe(site.ferramentas.spotliteTeste);
    expect(url.origin).toBe("https://www.spotlite.com.br");
    expect(url.searchParams.get("utm_source")).toBe("resetia.diagnostico");
  });

  it("a origem usada no site cabe no formato que a Spotlite grava", () => {
    // Regra da Spotlite (migração individual_signup): minúsculas, [a-z0-9][a-z0-9_.-]{0,59}.
    expect(new URL(testeSpotliteUrl("diagnostico")).searchParams.get("utm_source")).toMatch(
      /^[a-z0-9][a-z0-9_.-]{0,59}$/,
    );
  });

  it("o teste tem as quatro etapas e avisa que o resultado pede nome, e-mail e WhatsApp", () => {
    expect(diagnostico.teste.etapas).toHaveLength(4);
    expect(diagnostico.teste.nota).toMatch(/nome, e-mail e WhatsApp/);
  });
});
