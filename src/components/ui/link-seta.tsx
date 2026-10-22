import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Link de texto com seta e sublinhado fino que fica verde no hover. `voltar` põe a seta para trás, antes do texto. */
export function LinkSeta({
  href,
  children,
  voltar = false,
  className,
}: {
  href: string;
  children: ReactNode;
  voltar?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-block text-[15px] font-medium text-fg-2 border-b border-fg/30 pb-[3px] transition-colors hover:text-fg hover:border-verde",
    className,
  );
  const externo = /^https?:\/\//.test(href);
  const conteudo = voltar ? <>← {children}</> : <>{children} →</>;
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
