import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { DepoisBlocos } from "@/components/sections/shared/DepoisBlocos";
import { Faq } from "@/components/sections/shared/Faq";
import { ProgramaDetalhe } from "@/components/sections/shared/ProgramaDetalhe";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { waGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.solucoes.title,
  description: seo.solucoes.description,
  alternates: { canonical: "/solucoes/" },
};

export default function Solucoes() {
  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-20">
        <div className="container-site">
          <h1 className="mb-6 max-w-[16ch] text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">
            {solucoes.hero.titulo}
          </h1>
          <p className="text-fg-2 max-w-[60ch] text-[20px] leading-[1.6]">{solucoes.hero.lead}</p>
        </div>
      </Section>
      <Section tom="neutro" className="gutter pb-[120px]">
        <div className="container-site">
          {solucoes.programas.map((p) => (
            <ProgramaDetalhe key={p.num} programa={p} />
          ))}
        </div>
      </Section>
      <Section tom="carvao" className="gutter py-[120px]">
        <DepoisBlocos titulo={solucoes.depois.tituloInterno} />
      </Section>
      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-16">
          <h2 className="display-h2">{solucoes.faq.titulo}</h2>
          <Faq itens={solucoes.faq.itens} />
        </div>
      </Section>
      <CtaFinal titulo={solucoes.cta.titulo} botao={solucoes.cta.botao} href={waGeral()} origem="solucoes" />
    </main>
  );
}
