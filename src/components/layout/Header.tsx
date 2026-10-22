"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useMotionOk } from "@/components/motion/MotionProvider";
import { Botao } from "@/components/ui/botao";
import { nav, rotaAtiva, site, tomDaRota } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const semBarra = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/**
 * Header. Internas: sticky, fundo do tom da página com blur. Home: fixo e transparente no topo;
 * após 80px vira carvão 80% com blur; some ao rolar para baixo (além de 200px) e volta ao rolar para cima.
 */
export function Header() {
  const pathname = semBarra(usePathname() ?? "/");
  const tom = tomDaRota(pathname);
  const home = pathname === "/";
  const motionOk = useMotionOk();
  const [rolou, setRolou] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!home) return;
    const anterior = scrollY.getPrevious() ?? y;
    setRolou(y > 80);
    setEscondido(motionOk && y > anterior && y > 200);
  });

  const fundo = !home || rolou;
  const tomHeader = home ? "carvao" : tom;

  return (
    <header
      data-tom={tomHeader}
      data-rolou={rolou ? "" : undefined}
      data-escondido={escondido ? "" : undefined}
      className={cn(
        "gutter text-fg top-0 right-0 left-0 z-50 flex h-[72px] items-center justify-between border-b transition-[transform,background-color,border-color] duration-[350ms] ease-out",
        home ? "fixed" : "sticky",
        fundo
          ? tomHeader === "carvao"
            ? "border-cinza/15 bg-carvao/80 backdrop-blur-[12px]"
            : "border-carvao/8 bg-neutro/85 backdrop-blur-[12px]"
          : "border-transparent bg-transparent",
        escondido && "-translate-y-full",
      )}
    >
      <Link href="/" aria-label={site.nome} className="flex items-center">
        <Logo tom={tomHeader} altura={40} />
      </Link>
      <nav aria-label="Principal" className="hidden gap-9 text-[15px] font-medium md:flex">
        {nav.map((l) => {
          const ativo = rotaAtiva(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : ativo ? "true" : undefined}
              className={cn(
                "hover:border-verde text-fg border-b-2 py-1.5 transition-colors",
                ativo ? "border-verde" : "border-transparent",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden md:block">
        <Botao href={waGeral()} tamanho="sm" origem="header">
          {site.ctaHeader}
        </Botao>
      </div>
      <MobileMenu tom={tomHeader} />
    </header>
  );
}
