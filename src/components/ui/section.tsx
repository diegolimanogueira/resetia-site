import type { ComponentProps } from "react";
import type { Tom } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Seção com tom (carvão ou neutro). O atributo data-tom define as variáveis
 * --bg, --fg, --fg-2, --line em globals.css; filhos usam text-fg, border-line etc.
 */
export function Section({ tom, className, ...rest }: ComponentProps<"section"> & { tom: Tom }) {
  return <section data-tom={tom} className={cn("text-fg relative bg-(--bg)", className)} {...rest} />;
}
