"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Line } from "@/components/motion/Line";
import { useMotionOk } from "@/components/motion/MotionProvider";
import { useMontado } from "@/lib/use-media-query";
import type { CardSpotlite } from "@/content/types";
import { formatNota } from "@/lib/format";
import { cn } from "@/lib/utils";

type Fase = "inicial" | "armado" | "disparado";
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
const ZERO = { nota: 0, ativ: 0, horas: 0 };

/**
 * Mockup abstrato do relatório Spotlite. Dados de exemplo, rotulados como exemplo.
 * Ao entrar 40% na viewport, a nota, as atividades e as horas contam do zero (1,4s, ease-out cúbico)
 * e as barras crescem em sequência. O HTML já sai com os valores finais (no-JS, reduced-motion):
 * só depois de hidratar, com movimento ligado e fora da viewport, o cartão fica "armado" em zero.
 */
export function SpotliteCard({ card, tamanho = "md" }: { card: CardSpotlite; tamanho?: "md" | "lg" }) {
  const lg = tamanho === "lg";
  const ok = useMotionOk();
  const montado = useMontado();
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.4 });
  const fase: Fase = !montado || !ok ? "inicial" : visivel ? "disparado" : "armado";
  const finais = { nota: card.nota, ativ: card.atividades.valor, horas: card.economia.valor };
  const [animados, setAnimados] = useState(ZERO);
  const valores = fase === "inicial" ? finais : fase === "armado" ? ZERO : animados;

  useEffect(() => {
    if (fase !== "disparado") return;
    const controle = animate(0, 1, {
      duration: 1.4,
      ease: EASE_OUT_CUBIC,
      onUpdate: (t) =>
        setAnimados({
          nota: card.nota * t,
          ativ: Math.round(card.atividades.valor * t),
          horas: Math.round(card.economia.valor * t),
        }),
    });
    return () => controle.stop();
  }, [fase, card]);

  return (
    <div
      ref={ref}
      data-count
      data-armado={fase === "armado" ? "" : undefined}
      className={cn("border-line bg-neutro/[0.02] flex flex-col border", lg ? "gap-9 p-10" : "gap-8 p-9")}
    >
      <div className="eyebrow text-cinza flex justify-between">
        <span>{card.setor}</span>
        <span>{card.tag}</span>
      </div>
      <div className="flex items-end gap-5">
        <span
          data-nota
          className={cn(
            "text-neutro leading-[.9] font-bold tracking-[-0.04em] tabular-nums",
            lg ? "text-[clamp(72px,9vw,128px)]" : "text-[clamp(64px,8vw,112px)]",
          )}
        >
          {formatNota(valores.nota)}
        </span>
        <div className="text-cinza pb-2.5 text-[15px] leading-[1.4]">
          {card.notaLabel}
          <br />
          <span className="text-neutro">{card.antesLabel}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {card.barras.map((b, i) => (
          <li key={b.label} className="flex flex-col gap-3">
            <div className="text-cinza flex justify-between text-[14px]">
              <span>{b.label}</span>
              <span className="text-neutro">{b.nivel}</span>
            </div>
            <div className="bg-cinza/20 h-0.5">
              <div
                data-barra
                className="bg-verde h-full transition-[width] duration-[1200ms] ease-out"
                style={{ width: `${b.pct}%`, transitionDelay: `${i * 150}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-6">
        <Line className="col-span-2" />
        <div>
          <div
            data-ativ
            className={cn("leading-none font-bold tracking-[-0.03em] tabular-nums", lg ? "text-[40px]" : "text-[36px]")}
          >
            {valores.ativ}
          </div>
          <div className="text-cinza mt-1.5 text-[14px]">{card.atividades.label}</div>
        </div>
        <div>
          <div
            data-horas
            className={cn("leading-none font-bold tracking-[-0.03em] tabular-nums", lg ? "text-[40px]" : "text-[36px]")}
          >
            {valores.horas} <span className="text-verde text-[18px] font-medium">{card.economia.unidade}</span>
          </div>
          <div className="text-cinza mt-1.5 text-[14px]">{card.economia.label}</div>
        </div>
      </div>
    </div>
  );
}
