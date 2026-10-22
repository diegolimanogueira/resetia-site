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
 * Catálogo dos 30 agentes com filtro por área. Sem animação (nada a desligar no reduced-motion).
 * Linhas finas no lugar de cards. Renderiza o estado "Todos" no HTML estático (fallback do Suspense).
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
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow text-fg-2">{f.rotulo}</p>
        <div role="group" aria-label={f.rotulo} className="flex flex-wrap gap-2.5">
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
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-[18px] py-[10px] text-[14px] font-medium transition-colors duration-200",
                  ativo ? "border-verde bg-verde text-carvao" : "border-line text-fg hover:border-fg",
                )}
              >
                {o.nome}
                <span className={ativo ? "text-carvao/70" : "text-fg-2"}>{o.total}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {f.contagem(lista.length)}
      </p>
      <ul className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {lista.map((a) => (
          <li key={a.nome} data-agente={a.area} className="border-line border-t py-7">
            <p className="eyebrow text-fg-2 mb-3">{nomeDaArea(a.area)}</p>
            <h3 className="mb-2 text-[22px] leading-[1.15] font-semibold tracking-[-0.02em]">{a.nome}</h3>
            <p className="text-fg-2 text-[16px] leading-[1.55]">{a.texto}</p>
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
