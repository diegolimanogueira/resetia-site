import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { Glow } from "@/components/ui/glow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { waSpotlite } from "@/lib/whatsapp";

/** Ato 6 — Spotlite em destaque (carvão, glow). */
export function SpotliteDestaque() {
  const s = home.spotlite;
  return (
    <Section
      tom="carvao"
      data-ato="spotlite"
      data-stick
      className="gutter sticky top-0 z-0 flex min-h-screen items-center overflow-hidden pt-[120px] pb-[140px]"
    >
      <Glow posicao="inferior-esquerda" opacidade={0.14} />
      <div className="container-site relative grid w-full items-center gap-16 md:grid-cols-2">
        <div>
          <h2 className="display-h2 mb-7">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <p className="text-cinza mb-10 max-w-[60ch] text-[18px] leading-[1.6]">{s.texto}</p>
          <Botao href={waSpotlite()} origem="home-spotlite">
            {s.cta}
          </Botao>
        </div>
        <SpotliteCard card={s.card} />
      </div>
    </Section>
  );
}
