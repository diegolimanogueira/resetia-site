"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Sublinhado verde de 4px que cresce da esquerda (.6s, atraso .2s) quando a frase entra na viewport. */
export function Underline({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true, amount: "some" });
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-ul
      className={cn(
        "bg-verde absolute right-0 bottom-[-6px] left-0 h-1 origin-left transition-transform delay-200 duration-600 ease-out",
        visivel ? "scale-x-100" : "scale-x-0",
        className,
      )}
    />
  );
}
