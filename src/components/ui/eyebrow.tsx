import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Kicker de seção (reset360): 12px, 600, tracking .16em, caixa alta, verde. */
export function Eyebrow({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cn("eyebrow text-verde mb-6", className)} {...rest} />;
}
