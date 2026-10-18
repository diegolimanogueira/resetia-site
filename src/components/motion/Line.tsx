"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Linha fina que separa blocos. Nasce do comprimento 0 e se desenha (.5s) ao entrar na viewport, uma vez. */
export function Line({ eixo = "x", className }: { eixo?: "x" | "y"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-line={eixo}
      className={cn(
        "bg-line transition-transform duration-500 ease-out",
        eixo === "x" ? "h-px w-full origin-left" : "w-px origin-top self-stretch",
        visivel ? "scale-100" : eixo === "x" ? "scale-x-0" : "scale-y-0",
        className,
      )}
    />
  );
}
