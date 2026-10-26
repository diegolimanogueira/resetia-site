import { describe, expect, it } from "vitest";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { diagnosticoUrl } from "@/lib/diagnostico";

describe("diagnosticoUrl", () => {
  it("aponta para o teste aberto da Spotlite com a origem do clique", () => {
    const url = new URL(diagnosticoUrl("hero"));
    expect(url.origin + url.pathname).toBe(site.ferramentas.spotliteTeste);
    expect(url.origin).toBe("https://www.spotlite.com.br");
    expect(url.searchParams.get("utm_source")).toBe("resetia.hero");
  });

  it("toda origem usada no site cabe no formato que a Spotlite grava", () => {
    // Regra da Spotlite (migração individual_signup): minúsculas, [a-z0-9][a-z0-9_.-]{0,59}.
    for (const origem of ["hero", "home", "tecnologias"])
      expect(new URL(diagnosticoUrl(origem)).searchParams.get("utm_source")).toMatch(/^[a-z0-9][a-z0-9_.-]{0,59}$/);
  });

  it("a seção do teste tem as quatro etapas e avisa que o resultado pede nome, e-mail e WhatsApp", () => {
    expect(home.diagnostico.etapas).toHaveLength(4);
    expect(home.diagnostico.nota).toMatch(/nome, e-mail e WhatsApp/);
  });
});
