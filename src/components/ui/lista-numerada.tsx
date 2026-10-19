import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import type { Ferramenta, Passo } from "@/content/types";
import { cn } from "@/lib/utils";

type PassoComFerramenta = Passo & { ferramenta?: Ferramenta };

/** Lista numerada no padrão do site: numeral decorativo à esquerda, título em negrito e texto. */
export function ListaNumerada({
  passos,
  numeralClass = "text-verde",
  tamanho = "md",
}: {
  passos: PassoComFerramenta[];
  numeralClass?: string;
  tamanho?: "md" | "lg";
}) {
  const lg = tamanho === "lg";
  return (
    <ol className="flex flex-col">
      {passos.map((p, i) => (
        <li
          key={p.numero}
          className={cn(
            "border-line grid grid-cols-[64px_1fr] gap-6 border-t py-7",
            i === passos.length - 1 && "border-b",
          )}
        >
          <span
            aria-hidden="true"
            data-decorativo
            className={cn("text-[32px] leading-none font-bold tracking-[-0.03em]", numeralClass)}
          >
            {p.numero}
          </span>
          <div>
            {lg ? (
              <h3 className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">
                {p.titulo}
                {p.ferramenta ? <MarcaFerramenta qual={p.ferramenta} className="text-[15px]" /> : null}
              </h3>
            ) : null}
            <p className={cn("text-fg-2 leading-[1.6]", lg ? "max-w-[58ch] text-[17px]" : "text-[18px]")}>
              {lg ? null : <strong className="text-fg font-semibold">{p.titulo} </strong>}
              {p.texto}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
