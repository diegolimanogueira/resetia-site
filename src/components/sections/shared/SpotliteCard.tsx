"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Line } from "@/components/motion/Line";
import { useMotionOk } from "@/components/motion/MotionProvider";
import type { CardSpotlite } from "@/content/types";
import { formatInteiro, formatNota } from "@/lib/format";
import { useMontado } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Fase = "inicial" | "armado" | "disparado";
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
const ZERO = { nota: 0, destaque: 0, respondentes: 0 };

/**
 * Mockup do relatório da Spotlite, com a estrutura do relatório real (nota do setor, mapa de horas,
 * oportunidade em reais, respondentes) e dados fictícios. Ao entrar 40% na viewport, os números contam
 * do zero (1,4s, ease-out cúbico) e as barras crescem em sequência. O HTML já sai com os valores finais.
 */
export function SpotliteCard({ card, tamanho = "md" }: { card: CardSpotlite; tamanho?: "md" | "lg" }) {
  const lg = tamanho === "lg";
  const ok = useMotionOk();
  const montado = useMontado();
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.4 });
  const fase: Fase = !montado || !ok ? "inicial" : visivel ? "disparado" : "armado";
  const finais = { nota: card.nota, destaque: card.destaque.valor, respondentes: card.respondentes.valor };
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
          destaque: Math.round(card.destaque.valor * t),
          respondentes: Math.round(card.respondentes.valor * t),
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
      <div className="eyebrow text-cinza flex justify-between gap-4">
        <span>{card.setor}</span>
        <span className="shrink-0">{card.tag}</span>
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
          <span className="text-neutro">{card.notaApoio}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-cinza">{card.barrasTitulo}</p>
        <ul className="flex flex-col gap-3">
          {card.barras.map((b, i) => (
            <li key={b.label} className="flex flex-col gap-3">
              <div className="text-cinza flex justify-between text-[14px]">
                <span>{b.label}</span>
                <span className="text-neutro">{b.valor}</span>
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
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Line className="col-span-2" />
        <div>
          <div
            data-horas
            className={cn("leading-none font-bold tracking-[-0.03em] tabular-nums", lg ? "text-[40px]" : "text-[36px]")}
          >
            <span className="text-verde text-[18px] font-medium">{card.destaque.prefixo} </span>
            {formatInteiro(valores.destaque)}
            <span className="text-verde text-[18px] font-medium">{card.destaque.sufixo}</span>
          </div>
          <div className="text-cinza mt-1.5 text-[14px]">{card.destaque.label}</div>
        </div>
        <div>
          <div
            data-ativ
            className={cn("leading-none font-bold tracking-[-0.03em] tabular-nums", lg ? "text-[40px]" : "text-[36px]")}
          >
            {valores.respondentes} <span className="text-cinza text-[18px] font-medium">de {card.respondentes.de}</span>
          </div>
          <div className="text-cinza mt-1.5 text-[14px]">{card.respondentes.label}</div>
        </div>
      </div>
    </div>
  );
}
