import type { Metadata } from "next";
import { ComoFunciona } from "@/components/sections/home/ComoFunciona";
import { Depois } from "@/components/sections/home/Depois";
import { Fecho } from "@/components/sections/home/Fecho";
import { Hero } from "@/components/sections/home/Hero";
import { Problema } from "@/components/sections/home/Problema";
import { Produtos } from "@/components/sections/home/Produtos";
import { Treinamentos } from "@/components/sections/home/Treinamentos";
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
        <ComoFunciona />
        <Treinamentos />
        <Produtos />
        <Depois />
        <Fecho />
      </WipeStack>
    </main>
  );
}
