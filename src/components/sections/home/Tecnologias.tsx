import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { Line } from "@/components/motion/Line";
import { FluxaCard } from "@/components/sections/shared/FluxaCard";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Glow } from "@/components/ui/glow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { ferramentas } from "@/content/tecnologias";
import type { Ferramenta } from "@/content/types";

function Bloco({ qual }: { qual: Ferramenta }) {
  const f = ferramentas[qual];
  return (
    <div>
      <Eyebrow className="text-cinza mb-4 flex flex-wrap items-center gap-x-3">
        <MarcaFerramenta qual={qual} className="tracking-normal normal-case" /> {f.eyebrow}
      </Eyebrow>
      <h3 className="mb-5 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">{f.titulo}</h3>
      <p className="text-cinza mb-5 max-w-[58ch] text-[17px] leading-[1.6]">{f.texto}</p>
      <p className="text-neutro mb-8 max-w-[52ch] text-[17px] leading-[1.5] font-semibold">{f.nota}</p>
      <Botao href={f.site.href} origem={`home-${qual}-site`}>
        {f.site.label}
      </Botao>
    </div>
  );
}

/** Ato 5 — Tecnologias próprias (carvão, glow): Spotlite e Fluxa BPM com o mesmo peso, cada uma com seu mockup. */
export function Tecnologias() {
  const s = home.tecnologias;
  return (
    <Section
      tom="carvao"
      id="tecnologias"
      data-ato="tecnologias"
      data-stick
      className="gutter sticky top-0 z-0 overflow-hidden pt-[140px] pb-[120px]"
    >
      <Glow posicao="inferior-esquerda" opacidade={0.14} />
      <div className="container-site relative">
        <Eyebrow className="text-cinza mb-6">{s.kicker}</Eyebrow>
        <div className="mb-20 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
          <h2 className="display-h2">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <p className="text-cinza max-w-[44ch] text-[18px] leading-[1.6]">{s.lead}</p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Bloco qual="spotlite" />
          <SpotliteCard card={s.card} />
        </div>

        <Line className="my-20" />

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <FluxaCard className="order-2 md:order-1" />
          <div className="order-1 md:order-2">
            <Bloco qual="fluxa" />
          </div>
        </div>

        <div className="mt-16">
          <LinkSeta href={s.link.href}>{s.link.label}</LinkSeta>
        </div>
      </div>
    </Section>
  );
}
