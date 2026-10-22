import type { ReactNode } from "react";
import { Bar } from "@/components/motion/Bar";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Campo rotulado com a barra de 3px à esquerda (Para quem, Principais entregas...). Agnóstico ao tom. */
export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[3px_1fr] gap-6">
      <Bar />
      <div>
        <Eyebrow className="text-fg-2 mb-2">{rotulo}</Eyebrow>
        <div className="max-w-[62ch] text-[18px] leading-[1.6]">{children}</div>
      </div>
    </div>
  );
}
