"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Botao } from "@/components/ui/botao";
import { nav, rotaAtiva, site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Menu do celular (reset360): botão que abre um painel logo abaixo do header. Esc e clique em link fecham. */
export function MobileMenu({ pathname }: { pathname: string }) {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberto(false);
      botao.current?.focus();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  const fechar = () => setAberto(false);

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label="Menu"
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        onClick={() => setAberto((v) => !v)}
        className="text-verde -mr-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center md:hidden"
      >
        <svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor">
          {aberto ? (
            <path d="M6 6l14 14M20 6L6 20" strokeWidth="1.8" />
          ) : (
            <path d="M3 7h20M3 13h20M3 19h20" strokeWidth="1.8" />
          )}
        </svg>
      </button>
      <div
        id="menu-mobile"
        hidden={!aberto}
        className="gutter border-line bg-carvao absolute inset-x-0 top-[72px] border-b pt-2 pb-7 md:hidden"
      >
        <nav aria-label="Menu" className="flex flex-col">
          {nav.map((l) => {
            const ativo = rotaAtiva(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : ativo ? "true" : undefined}
                onClick={fechar}
                className={cn("border-line border-b py-4 text-[20px] font-semibold", ativo && "text-verde")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Botao href={waGeral()} origem="menu-mobile" onClick={fechar} className="mt-6 w-full">
          {site.ctaHeader}
        </Botao>
      </div>
    </>
  );
}
