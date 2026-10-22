import { Line } from "@/components/motion/Line";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Ato 7 — Quem está por trás (neutro, continua o ato anterior): Élida e Diego, com link para o Sobre. */
export function QuemSomos() {
  const s = home.quemSomos;
  return (
    <Section tom="neutro" data-ato="quem-somos" className="gutter z-[1] pb-[140px]">
      <div className="container-site">
        <Line className="mb-[120px]" />
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
          <div>
            <Eyebrow className="text-fg-2 mb-6">{s.kicker}</Eyebrow>
            <h2 className="display-h2">
              {s.titulo[0]}
              <br />
              {s.titulo[1]}
            </h2>
          </div>
          <div className="md:pt-10">
            <p className="mb-8 max-w-[52ch] text-[20px] leading-[1.6]">{s.texto}</p>
            <LinkSeta href={s.link.href}>{s.link.label}</LinkSeta>
          </div>
        </div>
      </div>
    </Section>
  );
}
