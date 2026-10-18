"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { usePonteiroFino } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { useMotionOk } from "./MotionProvider";

/** Desloca o filho até ±8px/±6px na direção do cursor enquanto o mouse está sobre ele. Só com ponteiro fino. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ok = useMotionOk();
  const fino = usePonteiroFino();
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 25 });
  const y = useSpring(my, { stiffness: 300, damping: 25 });

  const mover = (e: PointerEvent<HTMLSpanElement>) => {
    if (!ok || !fino || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 8);
    my.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 6);
  };
  const sair = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.span
      ref={ref}
      data-magnetic
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={mover}
      onPointerLeave={sair}
    >
      {children}
    </motion.span>
  );
}
