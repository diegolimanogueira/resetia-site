"use client";

import { useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, type ReactNode } from "react";

const MotionContext = createContext(true);

/**
 * Gate único de movimento. `movimento=false` ou prefers-reduced-motion desligam
 * todo efeito do site: linhas e barras no estado final, sem cursor, sem Lenis, sem wipe.
 * O estado vai para <html data-movimento> para o CSS forçar o estado final sem depender de JS.
 */
export function MotionProvider({ movimento = true, children }: { movimento?: boolean; children: ReactNode }) {
  const reduzido = useReducedMotion();
  const ok = movimento && !reduzido;

  useEffect(() => {
    document.documentElement.dataset.movimento = ok ? "true" : "false";
  }, [ok]);

  return <MotionContext.Provider value={ok}>{children}</MotionContext.Provider>;
}

export const useMotionOk = () => useContext(MotionContext);
