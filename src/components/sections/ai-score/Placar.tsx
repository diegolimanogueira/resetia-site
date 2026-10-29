import { dimensoes, niveis, regua, resultadoTextos as t } from "@/content/ai-score-questionario";
import type { DimensaoId, NivelId } from "@/content/types";
import { formatarNota, numeroDoNivel } from "@/lib/ai-score/calcular";
import { cn } from "@/lib/utils";

/**
 * Peças do resultado sem estado (servem à landing page e à tela de resultado): a nota grande com o nível
 * e as barras finas por dimensão (trilho cinza, preenchimento verde, como o mockup da Spotlite).
 */

export function Nota({
  indice,
  nivel,
  tamanho = "grande",
}: {
  indice: number;
  nivel: NivelId;
  tamanho?: "grande" | "medio";
}) {
  const n = niveis.find((x) => x.id === nivel)!;
  return (
    <div>
      <p className="flex items-baseline gap-2">
        <span
          data-nota
          className={cn(
            "leading-none font-bold tracking-[-0.05em]",
            tamanho === "grande" ? "text-[clamp(88px,11vw,150px)]" : "text-[clamp(64px,7vw,96px)]",
          )}
        >
          {indice}
        </span>
        <span className="text-fg-2 text-[22px] font-semibold">{t.de100}</span>
      </p>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-verde text-[20px] font-bold">{n.nome}</span>
        <span className="text-fg-2 eyebrow text-[11px]">{t.nivelDe(numeroDoNivel(nivel))}</span>
      </p>
    </div>
  );
}

/** Barra de 0 a 100: o número fica no texto; a barra é decorativa. */
export function Barra({ valor }: { valor: number | null }) {
  return (
    <span aria-hidden="true" data-imprimir-cor className="bg-line relative block h-[3px] w-full overflow-hidden">
      {valor !== null ? (
        <span className="bg-verde-vivo absolute inset-y-0 left-0 block" style={{ width: `${valor}%` }} />
      ) : null}
    </span>
  );
}

export function BarrasDimensoes({
  notas,
  className,
}: {
  notas: Record<DimensaoId, number | null>;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-5", className)}>
      {dimensoes.map((d) => {
        const v = notas[d.id];
        return (
          <li key={d.id} className="break-inside-avoid">
            <span className="mb-2 flex items-baseline justify-between gap-4 text-[15px]">
              <span className="font-semibold">{d.nome}</span>
              <span className={cn("tabular-nums", v === null ? "text-fg-2 text-[13px]" : "font-bold")}>
                {v === null ? t.semResposta : formatarNota(v)}
              </span>
            </span>
            <Barra valor={v} />
          </li>
        );
      })}
    </ul>
  );
}

/** Régua dos cinco níveis com a posição atual e quantos pontos faltam para o próximo. */
export function Regua({ indice, nivel }: { indice: number; nivel: NivelId }) {
  const atual = numeroDoNivel(nivel) - 1;
  const proximo = niveis[atual + 1];
  return (
    <div>
      <p className="eyebrow text-fg-2 mb-4 text-[11px]">{regua.titulo}</p>
      <ol className="grid grid-cols-5 gap-1.5">
        {niveis.map((n, i) => (
          <li key={n.id} aria-current={i === atual ? "step" : undefined}>
            <span
              data-imprimir-cor
              className={cn(
                "block h-[6px]",
                i < atual ? "bg-verde-vivo/45" : i === atual ? "bg-verde-vivo" : "bg-line",
              )}
            />
            <span
              className={cn(
                "mt-2 block text-[11px] leading-[1.25] sm:text-[12px]",
                i === atual ? "text-fg font-bold" : "text-fg-2",
              )}
            >
              {n.nome}
            </span>
            <span className="text-fg-2 block text-[10px] tabular-nums sm:text-[11px]">
              {n.min}–{n.max}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[14px] font-semibold">
        {proximo ? regua.faltam(proximo.min - indice, proximo.nome) : regua.topo}
      </p>
    </div>
  );
}
