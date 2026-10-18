import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Rótulo de sistema: 12px, 500, tracking .18em, caixa alta. Só em listas-manifesto e marcadores. */
export function Eyebrow({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cn("eyebrow", className)} {...rest} />;
}
