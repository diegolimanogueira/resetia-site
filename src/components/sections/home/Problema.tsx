import { Line } from "@/components/motion/Line";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Ato 2 — O problema (neutro): a ferramenta chegou, a transformação nem sempre. Fecha com os três pilares. */
export function Problema() {
  const s = home.problema;
  return (
    <Section tom="neutro" data-ato="problema" data-wipe className="gutter z-[1] pt-[140px] pb-[120px]">
      <div className="container-site">
        <Eyebrow className="text-fg-2 mb-6">{s.kicker}</Eyebrow>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-16">
          <h2 className="display-h2">
            {s.titulo[0]}
            <br />
            <span className="text-fg-2">{s.titulo[1]}</span>
          </h2>
          <div className="flex flex-col gap-10">
            <Ponto texto={s.texto} />
            <Line />
            <p className="max-w-[34ch] text-[22px] leading-[1.4] tracking-[-0.01em]">
              {s.pergunta.antes} <strong className="font-semibold">{s.pergunta.destaque}</strong>
            </p>
          </div>
        </div>
        <ul className="mt-20 grid md:grid-cols-3 md:gap-8">
          {s.pilares.map((p) => (
            <li key={p.numero} className="border-line grid grid-cols-[56px_1fr] items-baseline gap-4 border-t py-7">
              {/* Numeral decorativo: verde sobre neutro é escolha do manual (ver docs/decisions). */}
              <span
                aria-hidden="true"
                data-decorativo
                className="text-verde text-[32px] leading-none font-bold tracking-[-0.03em]"
              >
                {p.numero}
              </span>
              <span className="text-[22px] leading-[1.2] font-semibold tracking-[-0.02em]">{p.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
