import type { Metadata } from "next";
import { CardTecnologia } from "@/components/sections/shared/CardTecnologia";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { ctaPadrao } from "@/content/solucoes";
import { tecnologias } from "@/content/tecnologias";
import type { Ferramenta } from "@/content/types";

export const metadata: Metadata = {
  title: seo.tecnologias.title,
  description: seo.tecnologias.description,
  alternates: { canonical: "/tecnologias/" },
};

const ordem: Ferramenta[] = ["spotlite", "fluxa"];

/** Tecnologias próprias: a separação entre soluções (consultoria) e ferramentas, e as duas com links oficiais. */
export default function Tecnologias() {
  const t = tecnologias;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina kicker={t.hero.kicker} titulo={<Linhas itens={t.hero.titulo} />} tituloMenor lead={t.hero.lead} />

      <Section tom="escuro">
        <div className="container-site grid gap-3 md:grid-cols-2">
          {t.separacao.map((b) => (
            <div key={b.titulo} className="border-line bg-painel border p-[26px] md:p-8">
              <h2 className="mb-3 text-[24px] font-bold tracking-[-0.02em]">{b.titulo}</h2>
              <p className="text-fg-2 mb-6 text-[16px] leading-[1.7]">{b.texto}</p>
              <LinkSeta href={b.link.href} seta="→">
                {b.link.label}
              </LinkSeta>
            </div>
          ))}
        </div>
      </Section>

      {ordem.map((id, i) => (
        <Section key={id} id={id} tom={i ? "contraste" : "carvao"}>
          <div className="container-site">
            <CardTecnologia id={id} origem="tecnologias" completo />
          </div>
        </Section>
      ))}

      <CtaFinal cta={ctaPadrao} origem="tecnologias" />
    </main>
  );
}
