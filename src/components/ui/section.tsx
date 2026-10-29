import type { ComponentProps } from "react";
import type { Tom } from "@/content/types";
import { cn } from "@/lib/utils";

const espacos = {
  /** Seção comum: 75px no celular, 120px no desktop (reset360). */
  secao: "py-[75px] md:py-[120px]",
  nenhum: "",
};

/**
 * Seção com tom (carvao = fundo base, escuro, contraste ou noite). O atributo data-tom define --bg em globals.css;
 * filhos usam text-fg, text-fg-2 e border-line.
 */
export function Section({
  tom = "carvao",
  espaco = "secao",
  className,
  ...rest
}: ComponentProps<"section"> & { tom?: Tom; espaco?: keyof typeof espacos }) {
  return (
    <section data-tom={tom} className={cn("gutter text-fg relative bg-(--bg)", espacos[espaco], className)} {...rest} />
  );
}
