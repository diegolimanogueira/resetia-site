import { describe, expect, it } from "vitest";
import { agentes, areas } from "@/content/agentes";
import { home } from "@/content/home";
import { privacidade } from "@/content/privacidade";
import { FALTA, footer, movidas, nav, seo, site } from "@/content/site";
import { sobre } from "@/content/sobre";
import { ctaPadrao, seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
import { ferramentas } from "@/content/tecnologias";

describe("conteúdo do site (RESET 360, layout do reset360)", () => {
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
    expect(solucaoPorSlug("agent-factory")?.relacionado?.link.href).toBe("/agentes");
    expect(solucoes.detalhe.voltar.href).toBe("/#solucoes");
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

  it("a home segue o reset360: hero em quatro linhas, três pilares, quatro etapas, três áreas", () => {
    expect(home.hero.titulo).toHaveLength(4);
    expect(home.hero.pilulas).toEqual(["Marketing", "Vendas", "Customer Success"]);
    expect(home.hero.ctaSecundario.href).toBe("#solucoes");
    expect(home.problema.pilares).toHaveLength(3);
    expect(home.metodo.passos.map((p) => p.etapa)).toEqual(["Descobrir", "Preparar", "Transformar", "Evoluir"]);
    expect(home.diagnostico.etapas).toHaveLength(4);
    expect(home.quemSomos.monograma.letras).toEqual(["É", "D"]);
  });

  it("Spotlite e Fluxa apontam para os sites dos produtos", () => {
    expect(site.ferramentas.spotlite).toBe("https://www.spotlite.com.br/");
    expect(site.ferramentas.fluxa).toBe("https://www.fluxabpm.com.br/");
    expect(ferramentas.spotlite.site.href).toBe(site.ferramentas.spotlite);
    expect(ferramentas.fluxa.site.href).toBe(site.ferramentas.fluxa);
  });

  it("navegação do reset360: Método, Soluções e Tecnologias são âncoras da home", () => {
    expect(nav.map((l) => l.label)).toEqual(["Método", "Soluções", "Agentes", "Tecnologias", "Sobre"]);
    expect(nav.map((l) => l.href)).toEqual(["/#metodo", "/#solucoes", "/agentes", "/#tecnologias", "/sobre"]);
    expect(movidas.solucoes.link.href).toBe("/#solucoes");
    expect(movidas.tecnologias.link.href).toBe("/#tecnologias");
  });

  it("títulos marcam o destaque com *…* em pares", () => {
    const titulos = [
      home.hero.titulo,
      home.metodo.titulo,
      home.solucoes.titulo,
      home.areas.titulo,
      home.tecnologias.titulo,
      home.quemSomos.titulo,
      ctaPadrao.titulo,
      solucoes.detalhe.titulo,
      agentes.hero.titulo,
      sobre.hero.titulo,
    ].flat();
    for (const t of titulos) expect((t.match(/\*/g) ?? []).length % 2, t).toBe(0);
    expect(ctaPadrao.titulo.join(" ")).toContain("*resetar o futuro?*");
  });

  it("Sobre apresenta Élida e Diego; rodapé leva aos dois LinkedIns e não tem CNPJ", () => {
    expect(sobre.fundadores.pessoas.map((p) => p.nome)).toEqual(["Élida Almeida", "Diego Nogueira"]);
    const diego = sobre.fundadores.pessoas[1];
    expect("foto" in diego && diego.foto?.base).toBe("/brand/diego");
    expect(footer.legal).not.toMatch(/CNPJ/);
    const hrefs = footer.contato.redes.map((r) => r.href);
    expect(hrefs).toEqual([site.fundadores.elida.linkedin, site.fundadores.diego.linkedin]);
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
    const tudo = JSON.stringify({ home, solucoes, agentes, ferramentas, sobre, footer, privacidade });
    expect(tudo).not.toContain(FALTA);
    expect(privacidade.secoes.length).toBeGreaterThanOrEqual(6);
  });

  it("nenhum texto promete 'sem formulário' (o teste da Spotlite pede contato no fim)", () => {
    expect(JSON.stringify({ home, site })).not.toMatch(/sem formulário/i);
  });
});
