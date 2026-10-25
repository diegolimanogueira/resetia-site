"use client";

import { useSearchParams } from "next/navigation";
import { agentes, areas, nomeDaArea } from "@/content/agentes";
import type { AreaId } from "@/content/types";
import { cn } from "@/lib/utils";

const ehArea = (valor: string | null): valor is AreaId => areas.some((a) => a.id === valor);

/** Troca o filtro sem recarregar: o Next sincroniza replaceState com useSearchParams. */
function escolher(area: AreaId | null) {
  window.history.replaceState(null, "", area ? `?area=${area}` : window.location.pathname);
}

/**
 * Catálogo dos 30 agentes com filtro por área (reset360 .filter-line + .agent-grid).
 * Renderiza o estado "Todos" no HTML estático (fallback do Suspense).
 */
export function Catalogo({ area }: { area: AreaId | null }) {
  const f = agentes.filtro;
  const lista = area ? agentes.lista.filter((a) => a.area === area) : agentes.lista;
  const opcoes = [
    { id: null, nome: f.todos, total: agentes.lista.length },
    ...areas.map((a) => ({ id: a.id, nome: a.nome, total: agentes.lista.filter((x) => x.area === a.id).length })),
  ];

  return (
    <>
      <div className="mb-[35px] flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-[30px]">
        <p className="eyebrow text-verde text-[11px]">{f.rotulo}</p>
        <div role="group" aria-label={f.rotulo} className="flex flex-wrap gap-2">
          {opcoes.map((o) => {
            const ativo = o.id === area;
            return (
              <button
                key={o.nome}
                type="button"
                aria-pressed={ativo}
                data-filtro={o.id ?? "todos"}
                onClick={() => escolher(o.id)}
                className={cn(
                  "hover:bg-verde hover:text-carvao cursor-pointer border px-[17px] py-3 text-[14px] transition-colors duration-200 max-sm:px-2.5 max-sm:py-2.5 max-sm:text-[12px]",
                  ativo ? "border-verde bg-verde text-carvao" : "border-line bg-painel text-fg",
                )}
              >
                {o.nome}
                <small className="ml-[7px]">{o.total}</small>
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {f.contagem(lista.length)}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {lista.map((a) => (
          <li key={a.nome} data-agente={a.area} className="border-line bg-painel min-h-[200px] border p-[27px]">
            <p className="text-verde text-[10px] tracking-[.15em] uppercase">{nomeDaArea(a.area)}</p>
            <h3 className="mt-[30px] mb-2.5 text-[23px] leading-[1.2] font-bold tracking-[-0.02em]">{a.nome}</h3>
            <p className="text-fg-2 text-[14px] leading-[1.6]">{a.texto}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Lê ?area= da URL. Precisa de <Suspense> em volta (export estático). */
export function CatalogoAgentes() {
  const pedida = useSearchParams().get("area");
  return <Catalogo area={ehArea(pedida) ? pedida : null} />;
}
