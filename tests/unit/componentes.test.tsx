import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Botao } from "@/components/ui/botao";
import { Linhas, semMarcas } from "@/components/ui/linhas";
import { waGeral } from "@/lib/whatsapp";

describe("Botao", () => {
  it("link externo abre em nova aba com rel=noopener, marca a origem e ganha a seta ↗", () => {
    render(
      <Botao href={waGeral()} origem="hero">
        Falar
      </Botao>,
    );
    const a = screen.getByRole("link", { name: "Falar" });
    expect(a).toHaveProperty("target", "_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(a.getAttribute("data-cta")).toBe("hero");
    expect(a.getAttribute("href")).toBe(waGeral());
    expect(a.textContent).toBe("Falar↗");
  });

  it("âncora interna vira <a> simples e rota interna vira Link, sem seta por padrão", () => {
    render(
      <>
        <Botao href="#solucoes" variante="secundario" seta="↓">
          Ver
        </Botao>
        <Botao href="/agentes">Agentes</Botao>
      </>,
    );
    expect(screen.getByRole("link", { name: "Ver" }).getAttribute("href")).toBe("#solucoes");
    expect(screen.getByRole("link", { name: "Ver" }).textContent).toBe("Ver↓");
    expect(screen.getByRole("link", { name: "Agentes" }).getAttribute("href")).toBe("/agentes");
    expect(screen.getByRole("link", { name: "Agentes" }).textContent).toBe("Agentes");
  });
});

describe("Linhas", () => {
  it("quebra em linhas, põe *trechos* em <em> e mantém as palavras separadas no texto", () => {
    const { container } = render(
      <h2>
        <Linhas itens={["Uma visão *360°.*", "Um caminho claro."]} />
      </h2>,
    );
    const h2 = container.querySelector("h2")!;
    expect(h2.querySelectorAll("br")).toHaveLength(1);
    expect(h2.querySelector("em")!.textContent).toBe("360°.");
    expect(h2.textContent).toBe("Uma visão 360°. Um caminho claro.");
  });

  it("semMarcas devolve o texto sem asteriscos", () => {
    expect(semMarcas("para *resetar o futuro?*")).toBe("para resetar o futuro?");
  });
});
