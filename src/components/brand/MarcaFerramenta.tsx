import type { Ferramenta } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Nome das ferramentas próprias com um ponto na cor da identidade de cada uma (laranja da Spotlite,
 * verde da Fluxa). Única exceção à regra "verde é o único acento": são marcas de produtos, não decoração.
 */
const marcas: Record<Ferramenta, { nome: string; cor: string }> = {
  spotlite: { nome: "spotlite", cor: "#FF7A45" },
  fluxa: { nome: "fluxa BPM", cor: "#0B7A4F" },
};

export function MarcaFerramenta({ qual, className }: { qual: Ferramenta; className?: string }) {
  const m = marcas[qual];
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-[-0.01em]", className)}>
      <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.cor }} />
      {m.nome}
    </span>
  );
}
