import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { Line } from "@/components/motion/Line";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { Glow } from "@/components/ui/glow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { waSpotlite } from "@/lib/whatsapp";

/** Ato 6 — Spotlite em destaque (carvão, glow), com a Fluxa BPM numa linha abaixo. */
export function SpotliteDestaque() {
  const s = home.spotlite;
  return (
    <Section
      tom="carvao"
      data-ato="spotlite"
      data-stick
      className="gutter sticky top-0 z-0 flex min-h-screen flex-col justify-center overflow-hidden pt-[120px] pb-[120px]"
    >
      <Glow posicao="inferior-esquerda" opacidade={0.14} />
      <div className="container-site relative grid w-full items-center gap-16 md:grid-cols-2">
        <div>
          <h2 className="display-h2 mb-7">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <p className="text-cinza mb-5 max-w-[60ch] text-[18px] leading-[1.6]">{s.texto}</p>
          <p className="text-neutro mb-10 max-w-[52ch] text-[18px] leading-[1.5] font-semibold">{s.valor}</p>
          <div className="flex flex-wrap gap-3.5">
            <Botao href={s.ctaSite.href} origem="home-spotlite-site">
              {s.ctaSite.label}
            </Botao>
            <Botao href={waSpotlite()} variante="secundario" origem="home-spotlite">
              {s.ctaWhatsapp}
            </Botao>
          </div>
        </div>
        <SpotliteCard card={s.card} />
      </div>
      <div className="container-site relative mt-20">
        <Line className="mb-8" />
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-16">
          <h3 className="text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">
            <MarcaFerramenta qual="fluxa" />
          </h3>
          <div>
            <p className="text-cinza mb-5 max-w-[68ch] text-[17px] leading-[1.6]">{s.fluxa.texto}</p>
            <LinkSeta href={s.fluxa.link.href}>{s.fluxa.link.label}</LinkSeta>
          </div>
        </div>
      </div>
    </Section>
  );
}
