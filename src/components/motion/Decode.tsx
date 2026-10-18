"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { useMotionOk } from "./MotionProvider";

const GLIFOS = "▮▯/\\|";
const DURACAO = 900;
const TROCA = 40;

type Props = { linhas: string[] } & Omit<ComponentProps<"h1">, "children">;

/**
 * Título que "decodifica": cada caractere alterna glifos a cada 40ms antes de assentar na letra certa,
 * da esquerda para a direita, em no máximo 900ms. Uma vez, no carregamento. Único efeito automático do site.
 * O HTML já sai com o texto final (SEO, no-JS, reduced-motion).
 */
export function Decode({ linhas, ...rest }: Props) {
  const ok = useMotionOk();
  const refs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!ok) return;
    const els = refs.current.filter((el): el is HTMLSpanElement => el !== null);
    if (els.length === 0) return;
    const finais = linhas.map((l) => Array.from(l));
    const aleatorio = () => finais.map((f) => f.map(() => GLIFOS[Math.floor(Math.random() * GLIFOS.length)]));
    let quadro = aleatorio();
    let ultimaTroca = 0;
    const inicio = performance.now();
    let raf = 0;

    const pintar = (t: number) =>
      els.forEach((el, i) => {
        const f = finais[i];
        const assentados = Math.floor(t * (f.length + 3));
        el.textContent = f.map((c, j) => (j < assentados || c === " " ? c : quadro[i][j])).join("");
      });

    const rodar = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      if (agora - ultimaTroca > TROCA) {
        quadro = aleatorio();
        ultimaTroca = agora;
      }
      pintar(t);
      if (t < 1) raf = requestAnimationFrame(rodar);
      else els.forEach((el, i) => (el.textContent = linhas[i]));
    };
    raf = requestAnimationFrame(rodar);

    return () => {
      cancelAnimationFrame(raf);
      els.forEach((el, i) => (el.textContent = linhas[i]));
    };
  }, [ok, linhas]);

  return (
    <h1 data-decode {...rest}>
      {linhas.map((linha, i) => (
        <span
          key={linha}
          data-dl
          className="block"
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          {linha}
        </span>
      ))}
    </h1>
  );
}
