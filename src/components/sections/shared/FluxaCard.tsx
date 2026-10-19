import { Line } from "@/components/motion/Line";
import { fluxa } from "@/content/fluxa";
import { cn } from "@/lib/utils";

/**
 * Mockup do que a Fluxa entrega: o fluxo desenhado, as quatro respostas e o que sai.
 * Agnóstico ao tom (funciona em carvão e em neutro). Exemplo público do próprio produto.
 */
export function FluxaCard({ className }: { className?: string }) {
  const e = fluxa.exemplo;
  return (
    <div className={cn("border-line bg-fg/[0.02] flex flex-col gap-7 border p-9", className)}>
      <div className="eyebrow text-fg-2 flex justify-between gap-4">
        <span>{e.rotulo}</span>
        <span className="shrink-0">{e.tag}</span>
      </div>
      <ol aria-label="Fluxo do processo desenhado" className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {e.fluxo.map((etapa, i) => (
          <li key={etapa} className="flex items-center gap-2">
            <span
              className={cn(
                "border-line text-fg inline-block border px-3 py-2 text-[13px] leading-none",
                etapa.endsWith("?") && "border-verde/70",
              )}
            >
              {etapa}
            </span>
            {i < e.fluxo.length - 1 ? (
              <span aria-hidden="true" className="text-fg-2 text-[14px]">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-fg-2">{fluxa.entregasTitulo}</p>
        <ol className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {fluxa.entregas.map((d) => (
            <li key={d.numero} className="flex items-baseline gap-2 text-[15px]">
              <span aria-hidden="true" data-decorativo className="text-verde text-[14px] font-bold">
                {d.numero}
              </span>
              <span className="text-fg font-semibold">{d.titulo.replace(/\.$/, "")}</span>
            </li>
          ))}
        </ol>
      </div>
      <Line />
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 text-[14px]">
        <span className="text-fg font-medium">{e.gargalo}</span>
        <span className="text-fg-2">{e.saidas}</span>
      </div>
    </div>
  );
}
