import type { Metadata } from "next";
import { Areas } from "@/components/sections/home/Areas";
import { Clientes } from "@/components/sections/home/Clientes";
import { Hero } from "@/components/sections/home/Hero";
import { Problema } from "@/components/sections/home/Problema";
import { Prova } from "@/components/sections/home/Prova";
import { QuemSomos } from "@/components/sections/home/QuemSomos";
import { Scan } from "@/components/sections/home/Scan";
import { Solucoes } from "@/components/sections/home/Solucoes";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Perguntas } from "@/components/sections/shared/Perguntas";
import { seo } from "@/content/site";
import { ctaPadrao, perguntasHome, solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
};

/**
 * Jornada da home (enxugada em 18/11): entender a Reset → reconhecer o problema → ver as cinco soluções →
 * ver quem já fez → ver exemplos por área → descobrir o AI Score (ou falar com um especialista).
 */
export default function Home() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Hero />
      <Prova />
      <Problema />
      <Solucoes />
      <Clientes />
      <Areas />
      <Scan />
      <QuemSomos />
      <Perguntas kicker={solucoes.perguntas.kicker} titulo={solucoes.perguntas.titulo} itens={perguntasHome} />
      <CtaFinal cta={ctaPadrao} origem="final" />
    </main>
  );
}
