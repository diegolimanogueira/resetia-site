import { DepoisBlocos } from "@/components/sections/shared/DepoisBlocos";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Ato 7 — Depois do treinamento (neutro). */
export function Depois() {
  return (
    <Section tom="neutro" data-ato="depois" data-wipe className="gutter z-[1] pt-[140px] pb-[120px]">
      <DepoisBlocos titulo={home.depois.titulo} />
    </Section>
  );
}
