import Link from "next/link";
import { Icone } from "@/components/ui/icone";
import { solucoes } from "@/content/solucoes";
import type { Solucao } from "@/content/types";
import { cn } from "@/lib/utils";

/** Card de solução: número, ícone, nome, frase e "Conhecer solução ↗". O card inteiro é o link. */
function CardSolucao({ s, detalhado = false }: { s: Solucao; detalhado?: boolean }) {
  return (
    <Link
      href={`/solucoes/${s.slug}/`}
      className="group border-line bg-painel hover:border-verde hover:text-fg flex min-h-[270px] flex-col border p-[25px] transition-[transform,border-color] duration-200 motion-safe:hover:-translate-y-1 md:p-[30px]"
    >
      <span className="flex items-start justify-between">
        <span className="border-verde/30 group-hover:border-verde grid size-12 place-items-center rounded-full border transition-colors">
          <Icone id={s.icone} />
        </span>
        <span className="text-fg-2 text-[11px] tracking-[.18em]">{s.num}</span>
      </span>
      <h3 className="mt-6 mb-2.5 text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">{s.nome}</h3>
      <p className="text-fg-2 text-[15px] leading-[1.6]">{s.frase}</p>
      {detalhado ? (
        <ul className="text-fg/80 mt-5 flex flex-col gap-1.5 text-[14px]">
          {s.beneficios.slice(0, 3).map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden="true" className="text-verde">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      <span className="text-verde mt-auto flex justify-between pt-6 text-[13px] font-bold">
        {solucoes.explorar}{" "}
        <span aria-hidden="true" className="transition-transform duration-200 motion-safe:group-hover:translate-x-1">
          ↗
        </span>
      </span>
    </Link>
  );
}

/** Grade dos cards. Cinco soluções: 3 + 2 no desktop, 2 colunas no tablet, 1 no celular. */
export function GradeSolucoes({
  itens,
  detalhado,
  className,
}: {
  itens: Solucao[];
  detalhado?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3", className)}>
      {itens.map((s) => (
        <CardSolucao key={s.slug} s={s} detalhado={detalhado} />
      ))}
    </div>
  );
}
