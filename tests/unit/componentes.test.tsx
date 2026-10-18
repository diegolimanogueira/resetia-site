import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Decode } from "@/components/motion/Decode";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { cardExemplo } from "@/content/spotlite";
import { waGeral } from "@/lib/whatsapp";

describe("Botao", () => {
  it("link externo abre em nova aba com rel=noopener e marca a origem", () => {
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
  });

  it("âncora interna vira <a> simples (para o Lenis tratar) e rota interna vira Link", () => {
    render(
      <>
        <Botao href="#como-funciona" variante="secundario">
          Ver
        </Botao>
        <Botao href="/spotlite" magnetico={false}>
          Spotlite
        </Botao>
      </>,
    );
    expect(screen.getByRole("link", { name: "Ver" }).getAttribute("href")).toBe("#como-funciona");
    expect(screen.getByRole("link", { name: "Spotlite" }).getAttribute("href")).toBe("/spotlite");
  });
});

describe("SpotliteCard", () => {
  it("sem movimento mostra os valores finais de imediato", () => {
    render(
      <MotionProvider movimento={false}>
        <SpotliteCard card={cardExemplo} />
      </MotionProvider>,
    );
    expect(screen.getByText("7,1")).toBeTruthy();
    expect(screen.getByText("11")).toBeTruthy();
    expect(screen.getByText(/^46/)).toBeTruthy();
    expect(screen.getByText("exemplo")).toBeTruthy();
  });
});

describe("Decode", () => {
  it("renderiza o texto final no HTML e volta a ele ao terminar a animação", () => {
    vi.useFakeTimers();
    const { container } = render(
      <MotionProvider>
        <Decode linhas={["IA sem hype.", "Resultado na prática."]} />
      </MotionProvider>,
    );
    const h1 = container.querySelector("h1")!;
    expect(h1.textContent).toBe("IA sem hype.Resultado na prática.");
    vi.advanceTimersByTime(1500);
    expect(h1.textContent).toBe("IA sem hype.Resultado na prática.");
    vi.useRealTimers();
  });

  it("sem movimento não altera o texto", () => {
    vi.useFakeTimers();
    const { container } = render(
      <MotionProvider movimento={false}>
        <Decode linhas={["IA sem hype."]} />
      </MotionProvider>,
    );
    vi.advanceTimersByTime(200);
    expect(container.querySelector("h1")!.textContent).toBe("IA sem hype.");
    vi.useRealTimers();
  });
});
