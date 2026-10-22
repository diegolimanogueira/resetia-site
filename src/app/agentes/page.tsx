import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo, CatalogoAgentes } from "@/components/sections/shared/CatalogoAgentes";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { agentes } from "@/content/agentes";
import { seo } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.agentes.title,
  description: seo.agentes.description,
  alternates: { canonical: "/agentes/" },
};

export default function Agentes() {
  const h = agentes.hero;
  const c = agentes.complexidade;
  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-20">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-6">{h.kicker}</Eyebrow>
          <h1 className="mb-6 text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">
            {h.titulo[0]}
            <br />
            {h.titulo[1]}
          </h1>
          <p className="text-fg-2 mb-8 max-w-[62ch] text-[20px] leading-[1.6]">{h.lead}</p>
          <LinkSeta href={h.link.href}>{h.link.label}</LinkSeta>
        </div>
      </Section>

      <Section tom="neutro" className="gutter pb-[120px]">
        <div className="container-site">
          <Suspense fallback={<Catalogo area={null} />}>
            <CatalogoAgentes />
          </Suspense>
          <p className="text-fg-2 mt-12 max-w-[72ch] text-[15px] leading-[1.6]">{agentes.aviso}</p>
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
          <div>
            <Eyebrow className="text-fg-2 mb-6">{c.kicker}</Eyebrow>
            <h2 className="display-h2">
              {c.titulo[0]}
              <br />
              {c.titulo[1]}
            </h2>
          </div>
          <div className="md:pt-10">
            <p className="mb-8 max-w-[56ch] text-[20px] leading-[1.6]">{c.texto}</p>
            <LinkSeta href={c.link.href}>{c.link.label}</LinkSeta>
          </div>
        </div>
      </Section>

      <CtaFinal cta={agentes.cta} href={waGeral()} origem="agentes" />
    </main>
  );
}
