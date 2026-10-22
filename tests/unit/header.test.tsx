import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let rotaAtual = "/";
vi.mock("next/navigation", () => ({ usePathname: () => rotaAtual }));

import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";

const renderHeader = (rota: string) => {
  rotaAtual = rota;
  return render(
    <MotionProvider>
      <Header />
    </MotionProvider>,
  );
};

describe("Header", () => {
  it("na home é fixo e carvão", () => {
    const { container } = renderHeader("/");
    const header = container.querySelector("header")!;
    expect(header.getAttribute("data-tom")).toBe("carvao");
    expect(header.className).toContain("fixed");
  });

  it("em Soluções é sticky, neutro e marca o link ativo", () => {
    const { container } = renderHeader("/solucoes");
    const header = container.querySelector("header")!;
    expect(header.getAttribute("data-tom")).toBe("neutro");
    expect(header.className).toContain("sticky");
    expect(screen.getByRole("link", { name: "Soluções" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Tecnologias" }).getAttribute("aria-current")).toBeNull();
  });

  it("aceita a rota com barra final", () => {
    const { container } = renderHeader("/tecnologias/");
    expect(container.querySelector("header")!.getAttribute("data-tom")).toBe("carvao");
    expect(screen.getByRole("link", { name: "Tecnologias" }).getAttribute("aria-current")).toBe("page");
  });

  it("numa solução herda o tom de Soluções e marca a seção no menu", () => {
    const { container } = renderHeader("/solucoes/scan/");
    expect(container.querySelector("header")!.getAttribute("data-tom")).toBe("neutro");
    expect(screen.getByRole("link", { name: "Soluções" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Agentes" }).getAttribute("aria-current")).toBeNull();
  });
});
