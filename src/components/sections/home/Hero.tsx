import { Fragment } from "react";
import { preload } from "react-dom";
import { Decode } from "@/components/motion/Decode";
import { Line } from "@/components/motion/Line";
import { Botao } from "@/components/ui/botao";
import { Glow } from "@/components/ui/glow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { waGeral } from "@/lib/whatsapp";

/** Ato 1 (hero) + Ato 2 (faixa de prova), na mesma seção carvão. */
export function Hero() {
  const h = home.hero;
  const p = home.prova;
  // LCP da home: avisa o navegador antes do CSS/JS. Browsers sem AVIF ignoram pelo type.
  preload("/brand/porta.avif", { as: "image", type: "image/avif", fetchPriority: "high" });
  return (
    <Section
      tom="carvao"
      data-ato="hero"
      data-stick
      className="sticky top-0 z-0 flex min-h-screen flex-col overflow-hidden"
    >
      <Glow posicao="superior-direita" />
      <div className="gutter relative grid flex-1 items-center gap-10 pt-[150px] pb-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <div className="max-w-[720px]">
          <Decode
            linhas={h.titulo}
            className="mb-7 text-[clamp(42px,7vw,96px)] leading-[.95] font-bold tracking-[-0.03em]"
          />
          <p className="text-cinza mb-10 max-w-[560px] text-[20px] leading-[1.6]">{h.lead}</p>
          <div className="flex flex-wrap gap-3.5">
            <Botao href={waGeral()} origem="hero">
              {h.ctaPrimario}
            </Botao>
            <Botao href={h.ctaSecundario.href} variante="secundario">
              {h.ctaSecundario.label}
            </Botao>
          </div>
        </div>
        <div className="relative h-full min-h-[420px] overflow-hidden">
          <picture>
            <source media="(max-width: 860px)" srcSet="/brand/porta-768.avif" type="image/avif" />
            <source media="(max-width: 860px)" srcSet="/brand/porta-768.webp" type="image/webp" />
            <source srcSet="/brand/porta.avif" type="image/avif" />
            <source srcSet="/brand/porta.webp" type="image/webp" />
            <img
              src="/brand/porta.png"
              alt={h.imagemAlt}
              width={920}
              height={582}
              fetchPriority="high"
              decoding="async"
              data-porta
              className="absolute inset-x-0 inset-y-[-6%] h-[112%] w-full object-cover object-[60%_50%] will-change-transform"
            />
          </picture>
          <ul className="eyebrow text-neutro absolute top-5 right-5 hidden flex-col gap-3.5 text-right md:flex">
            {h.manifesto.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li aria-hidden="true" className="bg-verde mt-1.5 h-0.5 w-7 self-end" />
          </ul>
        </div>
      </div>
      <div data-ato="prova" className="gutter relative pt-8 pb-10">
        <Line className="mb-7" />
        <p className="text-cinza max-w-[760px] text-[17px] leading-[1.6]">
          {p.antes}{" "}
          {p.empresas.map((e) => (
            <Fragment key={e}>
              <strong className="text-neutro font-semibold">{e}</strong>
              {", "}
            </Fragment>
          ))}
          {p.depois}
        </p>
      </div>
    </Section>
  );
}
