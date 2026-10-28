import { describe, expect, it } from "vitest";
import { agentes, areas, categoriasAgentes, consolidacao } from "@/content/agentes";
import { aiScore } from "@/content/ai-score";
import * as questionario from "@/content/ai-score-questionario";
import { diagnostico } from "@/content/diagnostico";
import { home } from "@/content/home";
import { privacidade } from "@/content/privacidade";
import { FALTA, footer, movidas, nav, navDiagnostico, rotaAtiva, seo, site } from "@/content/site";
import { sobre } from "@/content/sobre";
import { ctaPadrao, perguntas, seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
import { ferramentas, tecnologias } from "@/content/tecnologias";

describe("conteúdo do site (reestruturação RESET 360)", () => {
  it("o portfólio tem exatamente as cinco soluções, sem Scan nem Workshops", () => {
    expect(solucoes.lista.map((s) => s.slug)).toEqual([
      "ai-champions",
      "processos-com-ia",
      "agent-factory",
      "governance",
      "performance",
    ]);
    expect(solucoes.lista.map((s) => s.num)).toEqual(["01", "02", "03", "04", "05"]);
    expect(solucaoPorSlug("scan")).toBeUndefined();
    expect(solucaoPorSlug("workshops")).toBeUndefined();
  });

  it("cada solução é uma landing page completa: sobre, benefícios, entregáveis, para quem, 5 etapas e CTAs", () => {
    for (const s of solucoes.lista) {
      expect(s.headline.length, s.slug).toBeGreaterThan(0);
      expect(s.descricao, s.slug).toHaveLength(2);
      expect(s.sobre.paragrafos.length, s.slug).toBeGreaterThanOrEqual(5);
      expect(s.beneficios.itens.length, s.slug).toBeGreaterThanOrEqual(5);
      for (const b of s.beneficios.itens) expect(b.texto.length, `${s.slug}: ${b.titulo}`).toBeGreaterThan(20);
      expect(s.entregaveis.itens.length, s.slug).toBeGreaterThanOrEqual(9);
      expect(s.paraQuem.itens, s.slug).toHaveLength(6);
      expect(
        s.etapas.map((e) => e.numero),
        s.slug,
      ).toEqual(["01", "02", "03", "04", "05"]);
      expect(s.cta.label, s.slug).toMatch(/^Quero /);
      expect(s.ctaFinal.botao, s.slug).toMatch(/^Quero /);
      expect(s.cta.mensagem, s.slug).toContain(s.nome);
      expect(s.ctaSecundario.href, s.slug).toMatch(/^#(sobre|como-funciona|casos-de-uso)$/);
      for (const r of s.relacionadas) {
        expect(solucaoPorSlug(r), `${s.slug} → ${r}`).toBeDefined();
        expect(r).not.toBe(s.slug);
      }
    }
  });

  it("os blocos próprios estão nas soluções certas", () => {
    expect(solucaoPorSlug("ai-champions")?.entregaveis.itens.join(" ")).toMatch(/Workshops personalizados/);
    expect(solucaoPorSlug("processos-com-ia")?.tecnologia?.ferramenta).toBe("fluxa");
    expect(solucaoPorSlug("governance")?.entregaveis.nota).toMatch(/Jurídico, Segurança da Informação e Privacidade/);
    expect(solucaoPorSlug("performance")?.medicao?.itens).toHaveLength(6);
    const comBloco = solucoes.lista.filter((s) => s.tecnologia || s.medicao).map((s) => s.slug);
    expect(comBloco).toEqual(["processos-com-ia", "performance"]);
  });

  it("Agent Factory: três frentes com seis exemplos cada; catálogo com 30 agentes, 10 por área", () => {
    expect(categoriasAgentes.map((c) => c.nome)).toEqual([
      "Marketing Intelligence",
      "Sales Intelligence",
      "Customer Intelligence",
    ]);
    for (const c of categoriasAgentes) {
      expect(c.agentes, c.nome).toHaveLength(6);
      expect(c.descricao, c.nome).toMatch(/^Agentes para /);
    }
    expect(consolidacao.exemplos.aviso).toMatch(/possibilidades de aplicação/);
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

  it("navegação: Início, Soluções, Agentes de IA, Tecnologias, Sobre a Reset e o botão do AI Score", () => {
    expect(nav.map((l) => l.label)).toEqual(["Início", "Soluções", "Agentes de IA", "Tecnologias", "Sobre a Reset"]);
    expect(navDiagnostico).toEqual({ label: "Descubra seu AI Score", href: "/ai-score" });
    expect(footer.explore.links.map((l) => l.href)).toEqual(
      expect.arrayContaining(["/ai-score", "/diagnostico-gratuito"]),
    );
    expect(rotaAtiva("/", "/")).toBe(true);
    expect(rotaAtiva("/sobre", "/")).toBe(false);
    expect(rotaAtiva("/solucoes/governance", "/solucoes")).toBe(true);
  });

  it("rotas antigas apontam para os novos destinos", () => {
    expect(movidas.scan.link.href).toBe("/ai-score/");
    expect(movidas.workshops.link.href).toBe("/solucoes/ai-champions/");
    expect(movidas.agentes.link.href).toBe("/agentes-de-ia/");
    expect(movidas.tecnologias.link.href).toBe("/tecnologias/");
  });

  it("AI Score como porta de entrada; Análise Estratégica no WhatsApp como segundo caminho", () => {
    expect(site.ctaAiScore).toBe("Descobrir meu AI Score");
    expect(site.ctaDiagnostico).toBe("Falar com um especialista");
    expect(site.mensagens.diagnostico).toMatch(/Análise Estratégica RESET/);
    expect(home.hero.ctaPrimario).toBe(site.ctaAiScore);
    expect(ctaPadrao.botao).toBe(site.ctaAiScore);
    expect(diagnostico.hero.kicker).toBe("Análise Estratégica RESET");
    expect(diagnostico.avaliamos.itens).toHaveLength(6);
    expect(diagnostico.etapas.passos).toHaveLength(4);
    expect(diagnostico.etapas.passos[0].titulo).toMatch(/AI Score/);
    expect(diagnostico.escopo.texto).toMatch(/não substitui um projeto completo/i);
    expect(JSON.stringify({ home, solucoes, diagnostico, footer })).not.toMatch(/diagnóstico gratuito|RESET Scan/i);
  });

  it("tecnologias próprias separadas das soluções, com os sites oficiais", () => {
    expect(site.ferramentas.spotlite).toBe("https://www.spotlite.com.br/");
    expect(site.ferramentas.fluxa).toBe("https://www.fluxabpm.com.br/");
    expect(ferramentas.spotlite.site.href).toBe(site.ferramentas.spotlite);
    expect(ferramentas.fluxa.site.href).toBe(site.ferramentas.fluxa);
    expect(tecnologias.separacao).toHaveLength(2);
    expect(JSON.stringify(tecnologias)).not.toMatch(/sexto produto|novo nome/i);
  });

  it("títulos marcam o destaque com *…* em pares", () => {
    const titulos = [
      home.hero.titulo,
      home.reset360.titulo,
      home.solucoes.titulo,
      home.scan.titulo,
      home.tecnologias.titulo,
      ctaPadrao.titulo,
      diagnostico.hero.titulo,
      sobre.fechamento.titulo,
      ...solucoes.lista.map((s) => s.headline),
      aiScore.hero.titulo,
      aiScore.visoes.titulo,
      aiScore.dimensoes.titulo,
      aiScore.camadas.titulo,
      aiScore.exemplo.titulo,
      aiScore.etapas.titulo,
      aiScore.metodologia.titulo,
      aiScore.perguntas.titulo,
      aiScore.ctaFinal.titulo,
      questionario.resultadoTextos.conversa.titulo,
      questionario.formulario.titulo,
      questionario.contato.titulo,
    ].flat();
    for (const t of titulos) expect((t.match(/\*/g) ?? []).length % 2, t).toBe(0);
  });

  it("Sobre apresenta Élida (CEO) e Diego (CTO) com foto, cargo, descrição e LinkedIn; rodapé sem CNPJ", () => {
    expect(sobre.fundadores.pessoas.map((p) => [p.nome, p.cargo])).toEqual([
      ["Élida Almeida", "Co-founder & CEO"],
      ["Diego Nogueira", "Co-founder & CTO"],
    ]);
    for (const p of sobre.fundadores.pessoas) {
      expect(p.descricao.length, p.nome).toBeGreaterThan(80);
      expect(p.link.href).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
    }
    expect(sobre.fundadores.pessoas.map((p) => ("foto" in p ? p.foto?.base : undefined))).toEqual([
      "/brand/elida",
      "/brand/diego",
    ]);
    expect(footer.legal).not.toMatch(/CNPJ/);
  });

  it("títulos e descrições cabem nos limites de SEO, inclusive nas cinco soluções", () => {
    const metas = [...Object.entries(seo), ...solucoes.lista.map((s) => [s.slug, seoSolucao(s)] as const)];
    for (const [pagina, meta] of metas) {
      expect(meta.title.length, `${pagina}.title`).toBeLessThanOrEqual(70);
      if ("description" in meta) {
        expect(meta.description.length, `${pagina}.description`).toBeLessThanOrEqual(170);
        expect(meta.description.length, `${pagina}.description`).toBeGreaterThan(50);
      }
    }
  });

  it("não há pendências [FALTA] visíveis; FAQ e política de privacidade completas", () => {
    const tudo = JSON.stringify({
      home,
      solucoes,
      agentes,
      ferramentas,
      sobre,
      footer,
      privacidade,
      diagnostico,
      aiScore,
      questionario,
    });
    expect(tudo).not.toContain(FALTA);
    expect(perguntas.length).toBeGreaterThanOrEqual(5);
    expect(privacidade.secoes.length).toBeGreaterThanOrEqual(6);
  });

  it("não há métricas, depoimentos ou promessas de economia inventados", () => {
    const tudo = JSON.stringify({
      home,
      solucoes,
      agentes,
      consolidacao,
      categoriasAgentes,
      sobre,
      diagnostico,
      aiScore,
      questionario,
    });
    expect(tudo).not.toMatch(/\d+\s?%|R\$\s?\d|depoimento/i);
    expect(tudo).not.toMatch(/garantimos|resultado garantido|retorno garantido|economia garantida/i);
    expect(tudo).toContain("Nosso objetivo não é substituir ferramentas indiscriminadamente.");
  });

  it("RESET AI Score: 6 dimensões × 2 perguntas × 5 alternativas, 3 áreas × 4, 8 desafios, 4 prazos e 5 níveis", () => {
    const q = questionario;
    expect(q.dimensoes.map((d) => d.num)).toEqual(["01", "02", "03", "04", "05", "06"]);
    for (const p of q.perguntasCentrais) {
      expect(p.alternativas, p.id).toHaveLength(5);
      expect(p.texto.empresa, p.id).toMatch(/\?$/);
      expect(p.texto.area, p.id).toMatch(/\?$/);
      expect(p.texto.area, p.id).not.toBe(p.texto.empresa);
    }
    expect(q.escalaArea).toHaveLength(5);
    expect(q.modulosArea.map((m) => m.area)).toEqual(areas.map((a) => a.id));
    for (const m of q.modulosArea) expect(m.perguntas, m.area).toHaveLength(4);
    expect(q.desafios).toHaveLength(8);
    expect(q.horizontes.opcoes).toHaveLength(4);
    expect(q.niveis.map((n) => n.nome)).toEqual([
      "Inicial",
      "Explorando",
      "Em desenvolvimento",
      "Estruturada",
      "Avançada",
    ]);
    expect(q.segmentacao.escopo.opcoes.map((o) => o.id)).toEqual(["empresa", ...areas.map((a) => a.id)]);
  });

  it("RESET AI Score: comunicação de autoavaliação, nunca certificação ou benchmark", () => {
    expect(aiScore.hero.nota).toBe("Gratuito • 5 minutos • Resultado imediato");
    expect(questionario.resultadoTextos.aviso).toMatch(/Autoavaliação indicativa/);
    expect(questionario.resultadoTextos.aviso).toMatch(/Não é certificação/);
    expect(JSON.stringify({ aiScore, questionario })).not.toMatch(
      /benchmark|certificad[oa] pela|diagnóstico gratuito/i,
    );
  });
});
