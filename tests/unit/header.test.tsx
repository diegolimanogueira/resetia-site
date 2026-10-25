import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let rotaAtual = "/";
vi.mock("next/navigation", () => ({ usePathname: () => rotaAtual }));

import { Header } from "@/components/layout/Header";

const renderHeader = (rota: string) => {
  rotaAtual = rota;
  return render(<Header />);
};

describe("Header", () => {
  it("é sticky e carvão em todas as páginas", () => {
    for (const rota of ["/", "/agentes/", "/solucoes/scan/"]) {
      const { container, unmount } = renderHeader(rota);
      const header = container.querySelector("header")!;
      expect(header.getAttribute("data-tom")).toBe("carvao");
      expect(header.className).toContain("sticky");
      unmount();
    }
  });

  it("leva Método, Soluções e Tecnologias às âncoras da home", () => {
    renderHeader("/");
    const principal = screen.getByRole("navigation", { name: "Principal" });
    const links = Array.from(principal.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toEqual(expect.arrayContaining(["/#metodo", "/#solucoes", "/agentes", "/#tecnologias", "/sobre"]));
  });

  it("marca a página ativa, inclusive com barra final", () => {
    renderHeader("/sobre/");
    const principal = screen.getByRole("navigation", { name: "Principal" });
    expect(principal.querySelector("a[href='/sobre']")!.getAttribute("aria-current")).toBe("page");
    expect(principal.querySelector("a[href='/agentes']")!.getAttribute("aria-current")).toBeNull();
  });

  it("o menu do celular abre e fecha pelo botão e pelo Esc", () => {
    renderHeader("/");
    const botao = screen.getByRole("button", { name: "Menu" });
    const painel = document.getElementById("menu-mobile")!;
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(painel.hidden).toBe(true);
    fireEvent.click(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("true");
    expect(painel.hidden).toBe(false);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(botao.getAttribute("aria-expanded")).toBe("false");
  });
});
