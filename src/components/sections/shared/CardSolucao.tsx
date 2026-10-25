import Link from "next/link";
import { solucoes } from "@/content/solucoes";
import type { Solucao } from "@/content/types";
import { cn } from "@/lib/utils";

/** Card de solução do reset360: número, símbolo, nome, frase e "Explorar solução ↗". O card inteiro é o link. */
function CardSolucao({ s, compacto = false }: { s: Solucao; compacto?: boolean }) {
  return (
    <Link
      href={`/solucoes/${s.slug}/`}
      className={cn(
        "group border-line bg-painel hover:border-verde hover:text-fg flex flex-col border p-[25px] transition-[transform,border-color] duration-200 motion-safe:hover:-translate-y-1",
        compacto ? "min-h-[260px]" : "min-h-[270px] md:min-h-[310px]",
      )}
    >
      <span className="text-fg-2 text-[11px] tracking-[.18em]">{s.num}</span>
      <span aria-hidden="true" className="text-verde mt-3 text-[36px] leading-none">
        ✳
      </span>
      <h3 className="mt-3 mb-2.5 text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">{s.nome}</h3>
      <p className="text-fg-2 text-[14px] leading-[1.6]">{s.frase}</p>
      <span className="text-verde mt-auto flex justify-between pt-5 text-[13px] font-bold">
        {solucoes.explorar} <span aria-hidden="true">↗</span>
      </span>
    </Link>
  );
}

/** Grade dos cards: 3 colunas no desktop, 2 no tablet, 1 no celular. */
export function GradeSolucoes({ itens, compacto }: { itens: Solucao[]; compacto?: boolean }) {
  return (
    <div className="grid gap-[14px] sm:grid-cols-2 md:grid-cols-3">
      {itens.map((s) => (
        <CardSolucao key={s.slug} s={s} compacto={compacto} />
      ))}
    </div>
  );
}
