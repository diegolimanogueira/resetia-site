import { describe, expect, it } from "vitest";
import { home } from "@/content/home";
import { FALTA, nav, seo, site, tomPorRota } from "@/content/site";
import { sobre } from "@/content/sobre";
import { solucoes } from "@/content/solucoes";
import { spotlite } from "@/content/spotlite";

const semVazio = (obj: Record<string, unknown>) =>
  Object.values(obj).forEach((v) => {
    if (typeof v === "string") expect(v.trim().length, JSON.stringify(obj)).toBeGreaterThan(0);
  });

describe("conteúdo do site", () => {
  it("tem os cinco programas, com os quatro campos, na home e em Soluções", () => {
    expect(home.treinamentos.programas).toHaveLength(5);
    expect(solucoes.programas).toHaveLength(5);
    home.treinamentos.programas.forEach(semVazio);
    solucoes.programas.forEach(semVazio);
    expect(solucoes.programas.map((p) => p.nome)).toEqual(home.treinamentos.programas.map((p) => p.nome));
  });

  it("tem cinco perguntas no FAQ, quatro passos no Spotlite e três princípios e métodos no Sobre", () => {
    expect(solucoes.faq.itens).toHaveLength(5);
    solucoes.faq.itens.forEach(semVazio);
    expect(spotlite.comoFunciona.passos).toHaveLength(4);
    expect(sobre.comoTrabalhamos.principios).toHaveLength(3);
    expect(sobre.metodos.itens).toHaveLength(3);
  });

  it("toda rota da navegação tem tom definido", () => {
    expect(nav).toHaveLength(3);
    nav.forEach((l) => expect(tomPorRota[l.href], l.href).toMatch(/^(carvao|neutro)$/));
    expect(tomPorRota["/"]).toBe("carvao");
  });

  it("títulos e descrições cabem nos limites de SEO", () => {
    // Título ≤ 70. Descrição ≤ 170: a da home vem literal do briefing com 167 caracteres (Google corta em ~160, mas indexa).
    for (const [pagina, meta] of Object.entries(seo)) {
      expect(meta.title.length, `${pagina}.title`).toBeLessThanOrEqual(70);
      if ("description" in meta) expect(meta.description.length, `${pagina}.description`).toBeLessThanOrEqual(170);
    }
  });

  it("as pendências [FALTA] são exatamente as conhecidas", () => {
    const pendentes: string[] = [];
    if (site.cnpj === FALTA) pendentes.push("site.cnpj");
    if (site.politicaPrivacidade === FALTA) pendentes.push("site.politicaPrivacidade");
    if (sobre.diego.fotoPlaceholder.includes(FALTA)) pendentes.push("sobre.diego.foto");
    expect(pendentes).toEqual(["site.cnpj", "site.politicaPrivacidade", "sobre.diego.foto"]);
  });

  it("o mockup do Spotlite é rotulado como exemplo", () => {
    expect(spotlite.cardExemplo.tag).toBe("exemplo");
    expect(home.spotlite.card).toBe(spotlite.cardExemplo);
  });
});
