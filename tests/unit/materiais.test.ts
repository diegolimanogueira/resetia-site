import { describe, expect, it } from "vitest";
import { admin } from "@/content/admin";
import { materiais } from "@/content/materiais";
import { site } from "@/content/site";
import {
  PALAVRA_MAXIMA,
  TAMANHO_MAXIMO,
  caminhoArquivo,
  linkMaterial,
  normalizarPalavra,
  palavraDaUrl,
  palavraValida,
  tamanhoLegivel,
  urlArquivo,
} from "@/lib/materiais";
import { conferirArquivo } from "@/lib/materiais-admin";

describe("palavra-chave do material", () => {
  it("normaliza o que o admin digita para o formato do banco", () => {
    expect(normalizarPalavra("Brabo")).toBe("brabo");
    expect(normalizarPalavra("  Guia Brabo!  ")).toBe("guia-brabo");
    expect(normalizarPalavra("Ação Rápida 2026")).toBe("acao-rapida-2026");
    expect(normalizarPalavra("a__b--c")).toBe("a-b-c");
    expect(normalizarPalavra("!!!")).toBe("");
  });

  it("corta no limite do banco sem deixar hífen no fim", () => {
    const longa = normalizarPalavra(`${"a".repeat(PALAVRA_MAXIMA - 1)} bcd`);
    expect(longa).toBe("a".repeat(PALAVRA_MAXIMA - 1));
    expect(longa.length).toBeLessThanOrEqual(PALAVRA_MAXIMA);
  });

  it("só aceita o que o CHECK do banco aceita", () => {
    expect(palavraValida("brabo")).toBe(true);
    expect(palavraValida("guia-brabo-2")).toBe(true);
    expect(palavraValida("a")).toBe(false);
    expect(palavraValida("")).toBe(false);
    expect(palavraValida("Brabo")).toBe(false);
    expect(palavraValida("guia--brabo")).toBe(false);
    expect(palavraValida("-brabo")).toBe(false);
  });
});

describe("palavraDaUrl", () => {
  it("lê a palavra depois da interrogação, que é o link divulgado", () => {
    expect(palavraDaUrl("/materiais/", "?brabo")).toBe("brabo");
    expect(palavraDaUrl("/materiais/", "?brabo=")).toBe("brabo");
    expect(palavraDaUrl("/materiais/", "?m=brabo")).toBe("brabo");
    expect(palavraDaUrl("/materiais/index.html", "?brabo")).toBe("brabo");
  });

  it("lê a palavra no caminho, com ou sem barra no fim e com o basePath do staging", () => {
    expect(palavraDaUrl("/materiais/brabo", "")).toBe("brabo");
    expect(palavraDaUrl("/materiais/brabo/", "")).toBe("brabo");
    expect(palavraDaUrl("/resetia-site/materiais/guia-brabo/", "")).toBe("guia-brabo");
    expect(palavraDaUrl("/resetia-site/materiais/", "?brabo")).toBe("brabo");
  });

  it("ignora os parâmetros de rastreio que as redes penduram no link", () => {
    expect(palavraDaUrl("/materiais/", "?brabo&fbclid=IwAR0abc&utm_source=ig")).toBe("brabo");
    expect(palavraDaUrl("/materiais/", "?fbclid=IwAR0abc&brabo")).toBe("brabo");
    expect(palavraDaUrl("/materiais/", "?utm_source=ig&m=brabo")).toBe("brabo");
    expect(palavraDaUrl("/materiais/brabo", "?fbclid=IwAR0abc")).toBe("brabo");
    expect(palavraDaUrl("/materiais/", "?fbclid=IwAR0abc&utm_source=ig")).toBe("");
  });

  it("aceita maiúsculas e acento de quem digita o link à mão, e devolve vazio quando não há palavra", () => {
    expect(palavraDaUrl("/materiais/", "?Brabo")).toBe("brabo");
    expect(palavraDaUrl("/materiais/A%C3%A7%C3%A3o", "")).toBe("acao");
    expect(palavraDaUrl("/materiais/", "")).toBe("");
    expect(palavraDaUrl("/materiais/", "?")).toBe("");
    expect(palavraDaUrl("/materiais/%E0%A4%A", "")).toBe("e0-a4-a");
    expect(palavraDaUrl("/", "?brabo")).toBe("brabo");
  });
});

describe("links e arquivo do material", () => {
  it("o link divulgado fica no domínio do site e a página o lê de volta", () => {
    const link = new URL(linkMaterial("guia-brabo"));
    expect(link.origin).toBe(site.dominio);
    expect(link.pathname).toBe("/materiais/");
    expect(palavraDaUrl(link.pathname, link.search)).toBe("guia-brabo");
  });

  it("o PDF mora no bucket público, num caminho que passa no CHECK do banco", () => {
    const caminho = caminhoArquivo("3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f", "guia-brabo");
    expect(caminho).toBe("3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f/guia-brabo.pdf");
    expect(caminho).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+\.pdf$/);
    expect(
      caminhoArquivo("3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f", "a".repeat(PALAVRA_MAXIMA)).length,
    ).toBeLessThanOrEqual(120);
    expect(urlArquivo(caminho)).toMatch(/\/storage\/v1\/object\/public\/materiais\/3f1c2b9e-.+\/guia-brabo\.pdf$/);
  });

  it("mostra o tamanho do arquivo em KB ou MB", () => {
    expect(tamanhoLegivel(null)).toBeNull();
    expect(tamanhoLegivel(0)).toBeNull();
    expect(tamanhoLegivel(300)).toBe("1 KB");
    expect(tamanhoLegivel(348_160)).toBe("340 KB");
    expect(tamanhoLegivel(2_411_725)).toBe("2,3 MB");
    expect(materiais.formato(tamanhoLegivel(2_411_725))).toBe("PDF · 2,3 MB");
    expect(materiais.formato(null)).toBe("PDF");
  });

  it("confere o arquivo antes de enviar: só PDF, até 20 MB", () => {
    expect(conferirArquivo({ type: "application/pdf", name: "guia.pdf", size: 1000 })).toBe("ok");
    expect(conferirArquivo({ type: "", name: "GUIA.PDF", size: 1000 })).toBe("ok");
    expect(conferirArquivo({ type: "image/png", name: "guia.png", size: 1000 })).toBe("tipo");
    expect(conferirArquivo({ type: "", name: "guia.docx", size: 1000 })).toBe("tipo");
    expect(conferirArquivo({ type: "application/pdf", name: "guia.pdf", size: TAMANHO_MAXIMO })).toBe("ok");
    expect(conferirArquivo({ type: "application/pdf", name: "guia.pdf", size: TAMANHO_MAXIMO + 1 })).toBe("tamanho");
    expect(conferirArquivo({ type: "application/pdf", name: "guia.pdf", size: 0 })).toBe("tamanho");
    expect(admin.materiais.form.arquivoApoio).toContain("20 MB");
  });
});
