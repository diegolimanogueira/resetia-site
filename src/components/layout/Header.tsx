"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Botao } from "@/components/ui/botao";
import { nav, navDiagnostico, rotaAtiva, site } from "@/content/site";
import { cn } from "@/lib/utils";

const semBarra = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/** Header sticky em todas as páginas, carvão translúcido com blur. O RESET AI Score é o botão verde. */
export function Header() {
  const pathname = semBarra(usePathname() ?? "/");

  return (
    <header
      data-tom="carvao"
      className="gutter border-line bg-fundo/94 text-fg sticky top-0 z-50 flex h-[72px] items-center justify-between border-b backdrop-blur-[18px]"
    >
      <Link href="/" aria-label={site.nome} className="flex items-center">
        <Logo altura={36} />
      </Link>
      <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
        {nav.map((l) => {
          const ativo = rotaAtiva(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : ativo ? "true" : undefined}
              className={cn(
                "border-b-2 py-1 text-[14px] font-medium transition-colors",
                ativo ? "border-verde text-fg" : "text-fg border-transparent",
              )}
            >
              {l.label}
            </Link>
          );
        })}
        <Botao
          href={navDiagnostico.href}
          tamanho="sm"
          origem="menu"
          aria-current={rotaAtiva(pathname, navDiagnostico.href) ? "page" : undefined}
        >
          {navDiagnostico.label}
        </Botao>
      </nav>
      <MobileMenu pathname={pathname} />
    </header>
  );
}
