import { Line } from "@/components/motion/Line";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Ato 3 — O problema (neutro). Âncora do botão "Ver como funciona". */
export function Problema() {
  const s = home.problema;
  return (
    <Section
      tom="neutro"
      id="como-funciona"
      data-ato="problema"
      data-wipe
      className="gutter z-[1] pt-[140px] pb-[120px]"
    >
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-16">
        <h2 className="display-h2">
          {s.titulo[0]}
          <br />
          {s.titulo[1]}
        </h2>
        <div className="flex flex-col gap-10">
          {s.pontos.map((p) => (
            <Ponto key={p.destaque} destaque={p.destaque} texto={p.texto} />
          ))}
          <Line />
          <p className="max-w-[30ch] text-[22px] leading-[1.4] font-semibold tracking-[-0.01em]">{s.fecho}</p>
        </div>
      </div>
    </Section>
  );
}
