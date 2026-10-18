"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useMotionOk } from "./MotionProvider";

const PROFUNDIDADE_WIPE = 0.45;
const FATOR_PARALLAX = 0.08;

/**
 * Transição entre atos da home. Seções [data-stick] ficam presas (top = min(0, 100vh − altura)) e a
 * seguinte [data-wipe] sobe por cima com clip-path: inset(X 0 0 0), X = (1 − progresso) × 45% da viewport.
 * O usuário vê o escuro ser "coberto" pelo claro e vice-versa, sem fade. Também move a porta do hero
 * (translateY = scroll × 0.08). Tudo lido no mesmo tick de scroll do Motion; só transform e clip-path.
 */
export function WipeStack({ children }: { children: ReactNode }) {
  const ok = useMotionOk();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const tick = useCallback(() => {
    const root = ref.current;
    if (!root || !ok) return;
    const vh = window.innerHeight;
    root.querySelectorAll<HTMLElement>("[data-wipe]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh - r.top) / vh));
      el.style.clipPath = p >= 1 ? "none" : `inset(${Math.round((1 - p) * vh * PROFUNDIDADE_WIPE)}px 0 0 0)`;
    });
    const porta = root.querySelector<HTMLElement>("[data-porta]");
    if (porta) {
      const y = Math.min(scrollY.get(), vh * 1.5);
      porta.style.transform = `translate3d(0,${(y * FATOR_PARALLAX).toFixed(1)}px,0)`;
    }
  }, [ok, scrollY]);

  const layout = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const vh = window.innerHeight;
    root.querySelectorAll<HTMLElement>("[data-stick]").forEach((el) => {
      el.style.top = ok ? `${Math.min(0, vh - el.offsetHeight)}px` : "";
    });
  }, [ok]);

  useMotionValueEvent(scrollY, "change", tick);

  useEffect(() => {
    layout();
    tick();
    const aoRedimensionar = () => {
      layout();
      tick();
    };
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [layout, tick]);

  useEffect(() => {
    if (ok) return;
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-wipe]").forEach((el) => (el.style.clipPath = ""));
    root.querySelectorAll<HTMLElement>("[data-porta]").forEach((el) => (el.style.transform = ""));
  }, [ok]);

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  );
}
