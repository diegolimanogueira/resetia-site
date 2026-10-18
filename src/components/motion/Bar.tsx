"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Barra de 3px à esquerda de um ponto. Começa na cor da linha e "acende" em verde (.6s) ao entrar na viewport. */
export function Bar({ cor = "verde", className }: { cor?: "verde" | "cinza"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.3 });
  const aceso = cor === "verde" && visivel;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-bar={cor}
      className={cn("w-[3px] transition-colors duration-600 ease-out", aceso ? "bg-verde" : "bg-line", className)}
    />
  );
}
