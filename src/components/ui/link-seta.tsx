import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Link de texto verde com seta (reset360 .text-link). `voltar` vira o link discreto
 * "← Voltar…" do topo das páginas internas.
 */
export function LinkSeta({
  href,
  children,
  seta = "↗",
  voltar = false,
  className,
}: {
  href: string;
  children: ReactNode;
  seta?: "↗" | "→";
  voltar?: boolean;
  className?: string;
}) {
  const classes = cn(
    voltar
      ? "text-fg-2 hover:text-verde inline-block text-[13px]"
      : "text-verde hover:text-fg inline-flex items-center gap-1.5 text-[14px] font-bold",
    className,
  );
  const externo = /^https?:\/\//.test(href);
  const conteudo = voltar ? (
    <>
      <span aria-hidden="true">←</span> {children}
    </>
  ) : (
    <>
      {children} <span aria-hidden="true">{seta}</span>
    </>
  );
  return externo ? (
    <a href={href} target="_blank" rel="noopener" className={classes}>
      {conteudo}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {conteudo}
    </Link>
  );
}
