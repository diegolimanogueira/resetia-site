import { Bar } from "@/components/motion/Bar";
import { Eyebrow } from "@/components/ui/eyebrow";
import { solucoes } from "@/content/solucoes";
import type { ProgramaDetalhe as Programa } from "@/content/types";

function Campo({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <div className="grid grid-cols-[3px_1fr] gap-6">
      <Bar />
      <div>
        <Eyebrow className="text-fg-2 mb-1.5">{rotulo}</Eyebrow>
        <p className="max-w-[62ch] text-[18px] leading-[1.6]">{texto}</p>
      </div>
    </div>
  );
}

/** Um programa da página Soluções: numeral + nome à esquerda, três campos à direita. */
export function ProgramaDetalhe({ programa }: { programa: Programa }) {
  const id = programa.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return (
    <article id={id} className="border-line border-t py-16">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <Eyebrow className="text-fg-2 mb-3">{programa.num}</Eyebrow>
          <h2 className="text-[clamp(28px,3.2vw,44px)] leading-none font-bold tracking-[-0.03em]">{programa.nome}</h2>
        </div>
        <div className="flex flex-col gap-8">
          <Campo rotulo={solucoes.campos.quem} texto={programa.quem} />
          <Campo rotulo={solucoes.campos.como} texto={programa.como} />
          <Campo rotulo={solucoes.campos.leva} texto={programa.leva} />
        </div>
      </div>
    </article>
  );
}
