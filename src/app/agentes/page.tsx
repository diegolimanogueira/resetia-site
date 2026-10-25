import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo, CatalogoAgentes } from "@/components/sections/shared/CatalogoAgentes";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
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

/** Catálogo de agentes (reset360 agentes.html): topo, filtro por área, grade de 30, "Menos complexidade", fecho. */
export default function Agentes() {
  const h = agentes.hero;
  const c = agentes.complexidade;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina kicker={h.kicker} titulo={<Linhas itens={h.titulo} />} lead={h.lead}>
        <LinkSeta href={h.link.href}>{h.link.label}</LinkSeta>
      </HeroPagina>

      <Section>
        <div className="container-site">
          <Suspense fallback={<Catalogo area={null} />}>
            <CatalogoAgentes />
          </Suspense>
          <p className="text-fg-2 mt-[30px] max-w-[90ch] text-[12px] leading-[1.6]">{agentes.aviso}</p>
        </div>
      </Section>

      <Section tom="contraste">
        <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
          <div>
            <Eyebrow>{c.kicker}</Eyebrow>
            <h2 className="display-h2">
              <Linhas itens={c.titulo} />
            </h2>
          </div>
          <div>
            <p className="text-fg-2 mb-8 text-[19px] leading-[1.8]">{c.texto}</p>
            <LinkSeta href={c.link.href}>{c.link.label}</LinkSeta>
          </div>
        </div>
      </Section>

      <CtaFinal cta={agentes.cta} href={waGeral()} origem="agentes" />
    </main>
  );
}
