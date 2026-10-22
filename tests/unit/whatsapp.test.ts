import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { waGeral, waSolucao, waSpotlite, waUrl } from "@/lib/whatsapp";

describe("waUrl", () => {
  it("aponta para o número da Reset IA com a mensagem geral codificada", () => {
    const url = new URL(waGeral());
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
    expect(url.searchParams.get("text")).toBe(site.mensagens.geral);
  });

  it("usa a mensagem do Spotlite na variante do diagnóstico", () => {
    expect(new URL(waSpotlite()).searchParams.get("text")).toBe(site.mensagens.spotlite);
    expect(waSpotlite()).not.toBe(waGeral());
  });

  it("cada solução tem mensagem própria com o nome dela", () => {
    expect(new URL(waSolucao("RESET Scan")).searchParams.get("text")).toBe("Olá! Quero conhecer o RESET Scan.");
    expect(waSolucao("RESET Scan")).not.toBe(waGeral());
  });

  it("codifica acentos e espaços (sem caracteres crus na URL)", () => {
    const url = waUrl("Olá, equipe!");
    expect(url).toBe(`https://wa.me/${site.whatsapp}?text=Ol%C3%A1%2C%20equipe!`);
  });
});
