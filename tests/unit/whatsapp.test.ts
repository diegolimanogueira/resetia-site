import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { solucaoPorSlug } from "@/content/solucoes";
import { waDiagnostico, waGeral, waUrl } from "@/lib/whatsapp";

describe("waUrl", () => {
  it("aponta para o número da Reset IA com a mensagem geral codificada", () => {
    const url = new URL(waGeral());
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
    expect(url.searchParams.get("text")).toBe(site.mensagens.geral);
  });

  it("falar com um especialista abre a conversa com a mensagem da Análise Estratégica", () => {
    expect(new URL(waDiagnostico()).searchParams.get("text")).toBe(site.mensagens.diagnostico);
    expect(waDiagnostico()).not.toBe(waGeral());
  });

  it("cada solução tem mensagem própria com o nome dela", () => {
    const s = solucaoPorSlug("agent-factory")!;
    expect(new URL(waUrl(s.cta.mensagem)).searchParams.get("text")).toContain("RESET Agent Factory");
  });

  it("codifica acentos e espaços (sem caracteres crus na URL)", () => {
    expect(waUrl("Olá, equipe!")).toBe(`https://wa.me/${site.whatsapp}?text=Ol%C3%A1%2C%20equipe!`);
  });
});
