import type { Metadata } from "next";
import { Areas } from "@/components/sections/home/Areas";
import { Hero } from "@/components/sections/home/Hero";
import { Problema } from "@/components/sections/home/Problema";
import { Prova } from "@/components/sections/home/Prova";
import { QuemSomos } from "@/components/sections/home/QuemSomos";
import { Reset360 } from "@/components/sections/home/Reset360";
import { Scan } from "@/components/sections/home/Scan";
import { Solucoes } from "@/components/sections/home/Solucoes";
import { Tecnologias } from "@/components/sections/home/Tecnologias";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Perguntas } from "@/components/sections/shared/Perguntas";
import { seo } from "@/content/site";
import { ctaPadrao, perguntas, solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
};

/**
 * Jornada da home: entender a Reset → identificar a necessidade → explorar uma solução →
 * conhecer a experiência → solicitar o diagnóstico gratuito.
 */
export default function Home() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Hero />
      <Prova />
      <Problema />
      <Reset360 />
      <Solucoes />
      <Areas />
      <Scan />
      <Tecnologias />
      <QuemSomos />
      <Perguntas kicker={solucoes.perguntas.kicker} titulo={solucoes.perguntas.titulo} itens={perguntas} />
      <CtaFinal cta={ctaPadrao} origem="final" />
    </main>
  );
}
