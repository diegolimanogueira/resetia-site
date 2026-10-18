"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Botao } from "@/components/ui/botao";
import { Sheet, SheetBody, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { nav, site } from "@/content/site";
import type { Tom } from "@/content/types";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Menu mobile: Sheet lateral carvão com os três links grandes e o botão de WhatsApp. */
export function MobileMenu({ tom }: { tom: Tom }) {
  const [aberto, setAberto] = useState(false);
  const pathname = (usePathname() ?? "/").replace(/(.)\/$/, "$1");

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        aria-label="Abrir menu"
        data-tom={tom}
        className="text-fg hover:text-verde -mr-2 inline-flex h-11 w-11 items-center justify-center md:hidden"
      >
        <MenuIcon size={26} strokeWidth={1.5} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="gutter border-cinza/25 flex h-[72px] items-center border-b">
          <Logo tom="carvao" altura={32} />
        </div>
        <SheetBody className="gutter pt-6 pb-10">
          <nav aria-label="Principal" className="flex flex-col">
            {nav.map((l) => {
              const ativo = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={ativo ? "page" : undefined}
                  onClick={() => setAberto(false)}
                  className={cn(
                    "border-cinza/25 border-b py-4 text-[32px] leading-none font-semibold tracking-[-0.02em]",
                    ativo && "text-verde",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-10">
            <Botao href={waGeral()} origem="menu-mobile" onClick={() => setAberto(false)}>
              {site.ctaHeader}
            </Botao>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
