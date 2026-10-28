import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let rotaAtual = "/";
vi.mock("next/navigation", () => ({ usePathname: () => rotaAtual }));

import { Header } from "@/components/layout/Header";

const renderHeader = (rota: string) => {
  rotaAtual = rota;
  return render(<Header />);
};
const principal = () => screen.getByRole("navigation", { name: "Principal" });

describe("Header", () => {
  it("é sticky e carvão em todas as páginas", () => {
    for (const rota of ["/", "/agentes-de-ia/", "/solucoes/governance/"]) {
      const { container, unmount } = renderHeader(rota);
      const header = container.querySelector("header")!;
      expect(header.getAttribute("data-tom")).toBe("carvao");
      expect(header.className).toContain("sticky");
      unmount();
    }
  });

  it("tem as cinco páginas e o RESET AI Score como último item", () => {
    renderHeader("/");
    const links = Array.from(principal().querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/", "/solucoes", "/agentes-de-ia", "/tecnologias", "/sobre", "/ai-score"]);
  });

  it("marca a página ativa, inclusive em subpáginas e com barra final", () => {
    renderHeader("/solucoes/agent-factory/");
    expect(principal().querySelector("a[href='/solucoes']")!.getAttribute("aria-current")).toBe("true");
    expect(principal().querySelector("a[href='/']")!.getAttribute("aria-current")).toBeNull();
  });

  it("Início só fica ativo na home", () => {
    renderHeader("/");
    expect(principal().querySelector("a[href='/']")!.getAttribute("aria-current")).toBe("page");
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
