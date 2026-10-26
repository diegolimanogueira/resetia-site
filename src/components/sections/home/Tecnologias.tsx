import { CardTecnologia } from "@/components/sections/shared/CardTecnologia";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Tecnologias próprias: Spotlite e Fluxa BPM lado a lado, separadas das cinco soluções de consultoria. */
export function Tecnologias() {
  const t = home.tecnologias;
  return (
    <Section tom="contraste" id="tecnologias">
      <div className="container-site">
        <CabecalhoSecao kicker={t.kicker} titulo={t.titulo} lead={t.lead} />
        <div className="grid gap-5 md:grid-cols-2">
          <CardTecnologia id="spotlite" origem="home" />
          <CardTecnologia id="fluxa" origem="home" />
        </div>
        <div className="mt-8">
          <LinkSeta href={t.link.href} seta="→">
            {t.link.label}
          </LinkSeta>
        </div>
      </div>
    </Section>
  );
}
