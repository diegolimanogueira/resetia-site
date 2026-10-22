import type { Metadata } from "next";
import { Areas } from "@/components/sections/home/Areas";
import { Diagnostico } from "@/components/sections/home/Diagnostico";
import { Fecho } from "@/components/sections/home/Fecho";
import { Hero } from "@/components/sections/home/Hero";
import { Metodo } from "@/components/sections/home/Metodo";
import { Problema } from "@/components/sections/home/Problema";
import { QuemSomos } from "@/components/sections/home/QuemSomos";
import { Solucoes } from "@/components/sections/home/Solucoes";
import { Tecnologias } from "@/components/sections/home/Tecnologias";
import { WipeStack } from "@/components/motion/WipeStack";
import { seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.home.title,
  description: seo.home.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <WipeStack>
        <Hero />
        <Problema />
        <Diagnostico />
        <Metodo />
        <Solucoes />
        <Tecnologias />
        <Areas />
        <QuemSomos />
        <Fecho />
      </WipeStack>
    </main>
  );
}
