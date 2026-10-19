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
import { site } from "@/content/site";
import { waFluxa, waSpotlite } from "@/lib/whatsapp";

/** Ato 6 — Produtos (carvão, glow): Spotlite e Fluxa BPM com o mesmo peso, cada um com seu mockup e seus CTAs. */
export function Produtos() {
  const s = home.produtos;
  return (
    <Section
      tom="carvao"
      data-ato="produtos"
      data-stick
      className="gutter sticky top-0 z-0 overflow-hidden pt-[140px] pb-[120px]"
    >
      <Glow posicao="inferior-esquerda" opacidade={0.14} />
      <div className="container-site relative">
        <h2 className="display-h2 mb-20 max-w-[18ch]">
          {s.titulo[0]}
          <br />
          {s.titulo[1]}
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow className="text-cinza mb-4 flex flex-wrap items-center gap-x-3">
              <MarcaFerramenta qual="spotlite" className="tracking-normal normal-case" /> {s.spotlite.eyebrow}
            </Eyebrow>
            <h3 className="mb-5 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
              {s.spotlite.titulo}
            </h3>
            <p className="text-cinza mb-5 max-w-[58ch] text-[17px] leading-[1.6]">{s.spotlite.texto}</p>
            <p className="text-neutro mb-8 max-w-[52ch] text-[17px] leading-[1.5] font-semibold">{s.spotlite.valor}</p>
            <div className="flex flex-wrap gap-3.5">
              <Botao href={s.spotlite.ctaSite.href} origem="home-spotlite-site">
                {s.spotlite.ctaSite.label}
              </Botao>
              <Botao href={waSpotlite()} variante="secundario" origem="home-spotlite">
                {s.spotlite.ctaWhatsapp}
              </Botao>
            </div>
          </div>
          <SpotliteCard card={s.spotlite.card} />
        </div>

        <Line className="my-20" />

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <FluxaCard className="order-2 md:order-1" />
          <div className="order-1 md:order-2">
            <Eyebrow className="text-cinza mb-4 flex flex-wrap items-center gap-x-3">
              <MarcaFerramenta qual="fluxa" className="tracking-normal normal-case" /> {s.fluxa.eyebrow}
            </Eyebrow>
            <h3 className="mb-5 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
              {s.fluxa.titulo}
            </h3>
            <p className="text-cinza mb-5 max-w-[58ch] text-[17px] leading-[1.6]">{s.fluxa.texto}</p>
            <p className="text-neutro mb-8 max-w-[52ch] text-[17px] leading-[1.5] font-semibold">{s.fluxa.valor}</p>
            <div className="flex flex-wrap gap-3.5">
              <Botao href={s.fluxa.ctaGratis.href} origem="home-fluxa-gratis">
                {s.fluxa.ctaGratis.label}
              </Botao>
              <Botao href={waFluxa()} variante="secundario" origem="home-fluxa">
                {site.ctaFluxaServico}
              </Botao>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <LinkSeta href={s.link.href}>{s.link.label}</LinkSeta>
        </div>
      </div>
    </Section>
  );
}
