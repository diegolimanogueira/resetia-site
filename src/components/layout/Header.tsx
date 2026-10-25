"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Botao } from "@/components/ui/botao";
import { nav, rotaAtiva, site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const semBarra = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/** Header do reset360: sticky em todas as páginas, carvão translúcido com blur. Sem animação de scroll. */
export function Header() {
  const pathname = semBarra(usePathname() ?? "/");

  return (
    <header
      data-tom="carvao"
      className="gutter border-line bg-carvao/94 text-fg sticky top-0 z-50 flex h-[72px] items-center justify-between border-b backdrop-blur-[18px]"
    >
      <Link href="/" aria-label={site.nome} className="flex items-center">
        <Logo altura={36} />
      </Link>
      <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
        {nav.map((l) => {
          const ativo = rotaAtiva(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : ativo ? "true" : undefined}
              className={cn(
                "border-b-2 py-1 text-[14px] font-medium transition-colors",
                ativo ? "border-verde text-fg" : "text-fg/80 border-transparent",
              )}
            >
              {l.label}
            </Link>
          );
        })}
        <Botao href={waGeral()} tamanho="sm" origem="header">
          {site.ctaHeader}
        </Botao>
      </nav>
      <MobileMenu pathname={pathname} />
    </header>
  );
}
