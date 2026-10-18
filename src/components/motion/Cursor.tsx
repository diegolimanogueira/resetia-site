"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { usePonteiroFino } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { useMotionOk } from "./MotionProvider";

type Modo = "padrao" | "link" | "texto";

/**
 * Cursor da marca (só desktop com ponteiro fino): ponto de 6px que segue o mouse na hora e anel de 28px
 * que segue com mola. Sobre links e botões o anel cresce para 48px e fica verde; sobre texto vira uma
 * barra vertical fina (modo leitura). Touch e reduced-motion: cursor nativo, nada acontece.
 */
export function Cursor() {
  const ok = useMotionOk();
  const fino = usePonteiroFino();
  const ativo = ok && fino;
  const [visivel, setVisivel] = useState(false);
  const [modo, setModo] = useState<Modo>("padrao");
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 300, damping: 25, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 300, damping: 25, mass: 0.6 });

  useEffect(() => {
    if (!ativo) return;
    document.body.setAttribute("data-nocursor", "");

    const mover = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisivel(true);
      const alvo = e.target;
      if (!(alvo instanceof Element)) return;
      setModo(alvo.closest("a,button,[data-magnetic]") ? "link" : alvo.closest("p,h1,h2,h3,li") ? "texto" : "padrao");
    };
    const sair = () => setVisivel(false);
    document.addEventListener("mousemove", mover, { passive: true });
    document.documentElement.addEventListener("mouseleave", sair);
    return () => {
      document.removeEventListener("mousemove", mover);
      document.documentElement.removeEventListener("mouseleave", sair);
      document.body.removeAttribute("data-nocursor");
    };
  }, [ativo, mx, my]);

  if (!ativo) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        data-cursor="ponto"
        className="bg-neutro pointer-events-none fixed top-0 left-0 z-[9999] -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full mix-blend-difference transition-opacity duration-200"
        style={{ x: mx, y: my, opacity: visivel && modo !== "texto" ? 1 : 0 }}
      />
      <motion.div
        aria-hidden="true"
        data-cursor="anel"
        data-modo={modo}
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-[9999] border-[1.5px] transition-[width,height,margin,border-color,border-radius,opacity] duration-250 ease-out",
          modo === "link" && "border-verde -mt-6 -ml-6 h-12 w-12 rounded-full",
          modo === "texto" && "border-neutro/70 -mt-[13px] -ml-px h-[26px] w-0.5 rounded-[1px] mix-blend-difference",
          modo === "padrao" && "border-neutro/70 -mt-3.5 -ml-3.5 h-7 w-7 rounded-full mix-blend-difference",
        )}
        style={{ x: rx, y: ry, opacity: visivel ? 1 : 0 }}
      />
    </>
  );
}
