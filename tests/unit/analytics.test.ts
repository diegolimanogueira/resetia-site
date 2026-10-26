import { describe, expect, it } from "vitest";
import { eventoDoClique } from "@/lib/analytics";
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
});
