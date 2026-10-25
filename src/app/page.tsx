import type { Metadata } from "next";
import { Areas } from "@/components/sections/home/Areas";
import { Diagnostico } from "@/components/sections/home/Diagnostico";
import { Hero } from "@/components/sections/home/Hero";
import { Metodo } from "@/components/sections/home/Metodo";
import { Problema } from "@/components/sections/home/Problema";
import { QuemSomos } from "@/components/sections/home/QuemSomos";
import { Solucoes } from "@/components/sections/home/Solucoes";
import { Tecnologias } from "@/components/sections/home/Tecnologias";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { seo } from "@/content/site";
import { ctaPadrao } from "@/content/solucoes";
import { waGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
};

/** Home na ordem do reset360, com o teste de IA da Spotlite depois de Tecnologias. */
export default function Home() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Hero />
      <Problema />
      <Metodo />
      <Solucoes />
      <Areas />
      <Tecnologias />
      <Diagnostico />
      <QuemSomos />
      <CtaFinal cta={ctaPadrao} href={waGeral()} origem="fecho" />
    </main>
  );
}
