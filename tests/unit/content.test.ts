import { describe, expect, it } from "vitest";
import { agentes, areas } from "@/content/agentes";
import { fluxa } from "@/content/fluxa";
import { home } from "@/content/home";
import { privacidade } from "@/content/privacidade";
import { FALTA, footer, nav, seo, site, tomDaRota, tomPorRota } from "@/content/site";
import { sobre } from "@/content/sobre";
import { seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
import { spotlite } from "@/content/spotlite";
import { ferramentas, tecnologias } from "@/content/tecnologias";

describe("conteúdo do site (RESET 360)", () => {
  it("tem as sete soluções, com slug único e todos os campos preenchidos", () => {
    expect(solucoes.lista).toHaveLength(7);
    expect(new Set(solucoes.lista.map((s) => s.slug)).size).toBe(7);
    expect(solucoes.lista.map((s) => s.num)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    for (const s of solucoes.lista) {
      for (const campo of [s.nome, s.frase, s.descricao, s.paraQuem, s.medimos])
        expect(campo.trim().length, `${s.slug}`).toBeGreaterThan(0);
      expect(s.entregas.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(solucaoPorSlug(s.slug)).toBe(s);
    }
    expect(solucaoPorSlug("nao-existe")).toBeUndefined();
  });

  it("as soluções aceleradas pelas ferramentas apontam para a ferramenta certa", () => {
    expect(solucaoPorSlug("scan")?.ferramenta).toBe("spotlite");
    expect(solucaoPorSlug("processos-com-ia")?.ferramenta).toBe("fluxa");
    expect(solucaoPorSlug("agent-factory")?.relacionado?.link.href).toBe("/agentes");
    expect(ferramentas.spotlite.solucao.href).toBe("/solucoes/scan");
    expect(ferramentas.fluxa.solucao.href).toBe("/solucoes/processos-com-ia");
  });

  it("o catálogo tem 30 agentes, 10 por área, sem nome repetido", () => {
    expect(agentes.lista).toHaveLength(30);
    expect(agentes.hero.lead).toContain(String(agentes.lista.length));
    for (const a of areas)
      expect(
        agentes.lista.filter((x) => x.area === a.id),
        a.id,
      ).toHaveLength(10);
    expect(new Set(agentes.lista.map((a) => a.nome)).size).toBe(30);
    expect(home.areas.itens.map((i) => i.area)).toEqual(areas.map((a) => a.id));
  });

  it("o método da home tem quatro etapas, com as ferramentas no diagnóstico, no redesenho e na medição", () => {
    expect(home.metodo.passos).toHaveLength(4);
    expect(home.metodo.passos.map((p) => p.ferramenta)).toEqual(["spotlite", undefined, "fluxa", "spotlite"]);
    expect(home.problema.pilares).toHaveLength(3);
    expect(home.hero.ctaSecundario.href).toBe("#solucoes");
  });

  it("Spotlite e Fluxa apontam para os sites dos produtos", () => {
    expect(site.ferramentas.spotlite).toBe("https://www.spotlite.com.br/");
    expect(site.ferramentas.fluxa).toBe("https://www.fluxabpm.com.br/");
    expect(ferramentas.spotlite.site.href).toBe(site.ferramentas.spotlite);
    expect(ferramentas.fluxa.site.href).toBe(site.ferramentas.fluxa);
    expect(spotlite.hero.ctaSite.href).toBe(site.ferramentas.spotlite);
    expect(fluxa.links.site.href).toBe(site.ferramentas.fluxa);
    expect(home.tecnologias.link.href).toBe("/tecnologias");
    expect(home.tecnologias.card).toBe(spotlite.cardExemplo);
    expect(tecnologias.hero.ancoras.map((a) => a.href)).toEqual(["#spotlite", "#fluxa"]);
  });

  it("navegação com quatro páginas, todas com tom; subpáginas herdam o tom da seção", () => {
    expect(nav.map((l) => l.label)).toEqual(["Soluções", "Agentes", "Tecnologias", "Sobre"]);
    nav.forEach((l) => expect(tomPorRota[l.href], l.href).toMatch(/^(carvao|neutro)$/));
    expect(tomDaRota("/")).toBe("carvao");
    expect(tomDaRota("/solucoes/scan")).toBe("neutro");
    expect(tomDaRota("/rota-nova")).toBe("carvao");
  });

  it("Sobre apresenta Élida e Diego; rodapé leva aos dois LinkedIns e não tem CNPJ", () => {
    expect(sobre.fundadores.pessoas.map((p) => p.nome)).toEqual(["Élida Almeida", "Diego Nogueira"]);
    const diego = sobre.fundadores.pessoas[1];
    expect("foto" in diego && diego.foto?.base).toBe("/brand/diego");
    expect(footer.legal.join(" ")).not.toMatch(/CNPJ/);
    const hrefs = footer.redes.map((r) => r.href);
    expect(hrefs).toContain(site.fundadores.elida.linkedin);
    expect(hrefs).toContain(site.fundadores.diego.linkedin);
  });

  it("títulos e descrições cabem nos limites de SEO, inclusive nas sete soluções", () => {
    const metas = [...Object.entries(seo), ...solucoes.lista.map((s) => [s.slug, seoSolucao(s)] as const)];
    for (const [pagina, meta] of metas) {
      expect(meta.title.length, `${pagina}.title`).toBeLessThanOrEqual(70);
      if ("description" in meta) {
        expect(meta.description.length, `${pagina}.description`).toBeLessThanOrEqual(170);
        expect(meta.description.length, `${pagina}.description`).toBeGreaterThan(50);
      }
    }
  });

  it("não há pendências [FALTA] visíveis no conteúdo e a política de privacidade está completa", () => {
    const tudo = JSON.stringify({ home, solucoes, agentes, spotlite, fluxa, tecnologias, sobre, footer, privacidade });
    expect(tudo).not.toContain(FALTA);
    expect(privacidade.secoes.length).toBeGreaterThanOrEqual(6);
  });

  it("nenhum texto promete 'sem formulário' (o diagnóstico com formulário vem aí)", () => {
    expect(JSON.stringify({ home, site })).not.toMatch(/sem formulário/i);
  });

  it("o mockup da Spotlite é rotulado como exemplo", () => {
    expect(spotlite.cardExemplo.tag).toMatch(/exemplo/);
  });
});
