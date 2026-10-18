"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { useMotionOk } from "./MotionProvider";

/**
 * Smooth scroll. Lenis não roda o próprio rAF: é avançado pelo loop do Motion,
 * para o site inteiro ter um único frame loop. Não inicia com reduced-motion.
 * `anchors: true` cuida do "Ver como funciona" (#como-funciona).
 */
export function LenisProvider() {
  const ok = useMotionOk();
  const ref = useRef<LenisRef>(null);

  useEffect(() => {
    if (!ok) return;
    const update = (data: { timestamp: number }) => ref.current?.lenis?.raf(data.timestamp);
    frame.update(update, true);
    return () => cancelFrame(update);
  }, [ok]);

  if (!ok) return null;
  return <ReactLenis root options={{ autoRaf: false, anchors: true, lerp: 0.1 }} ref={ref} />;
}
