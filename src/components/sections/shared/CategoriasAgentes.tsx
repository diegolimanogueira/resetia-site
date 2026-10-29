"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { categoriasAgentes, consolidacao } from "@/content/agentes";
import { cn } from "@/lib/utils";

/**
 * As três frentes da Agent Factory em abas (Marketing, Sales e Customer Intelligence).
 * Todas as abas estão no HTML estático; a ativa é a única visível. Cada card leva ao catálogo filtrado.
 * Os ícones chegam prontos do servidor (`icones`, na ordem das frentes) para não levar a biblioteca ao cliente.
 */
export function CategoriasAgentes({ icones }: { icones: ReactNode[] }) {
  const [ativa, setAtiva] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label={consolidacao.exemplos.kicker} className="mb-8 flex flex-wrap gap-2">
        {categoriasAgentes.map((c, i) => (
          <button
            key={c.area}
            id={`aba-${c.area}`}
            type="button"
            role="tab"
            aria-selected={i === ativa}
            aria-controls={`painel-${c.area}`}
            tabIndex={i === ativa ? 0 : -1}
            onClick={() => setAtiva(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const prox =
                (i + (e.key === "ArrowRight" ? 1 : -1) + categoriasAgentes.length) % categoriasAgentes.length;
              setAtiva(prox);
              document.getElementById(`aba-${categoriasAgentes[prox].area}`)?.focus();
            }}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2.5 border px-[18px] py-3 text-[14px] font-semibold transition-colors duration-200",
              i === ativa
                ? "border-verde bg-verde-vivo text-carvao"
                : "border-line bg-painel text-fg hover:border-verde",
            )}
          >
            <span className={i === ativa ? "[&_svg]:text-carvao" : undefined}>{icones[i]}</span>
            {c.nome}
          </button>
        ))}
      </div>
      {categoriasAgentes.map((c, i) => (
        <div
          key={c.area}
          id={`painel-${c.area}`}
          role="tabpanel"
          aria-labelledby={`aba-${c.area}`}
          hidden={i !== ativa}
        >
          <p className="text-fg-2 mb-5 max-w-[70ch] text-[16px] leading-[1.6]">{c.descricao}</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.agentes.map((a) => (
              <li key={a.nome}>
                <Link
                  href={`/agentes-de-ia/?area=${c.area}`}
                  data-agente-factory={c.area}
                  className="border-line bg-painel hover:border-verde hover:text-fg flex h-full min-h-[150px] flex-col border p-6 transition-colors duration-200"
                >
                  <span className="text-verde text-[10px] tracking-[.15em] uppercase">{c.nome}</span>
                  <span className="mt-5 mb-2 text-[20px] leading-[1.2] font-bold tracking-[-0.02em]">{a.nome}</span>
                  <span className="text-fg-2 text-[14px] leading-[1.6]">{a.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
