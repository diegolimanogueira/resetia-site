import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.tecnologias.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: movidas.tecnologias.link.href },
};

/** Rota antiga: a Spotlite está na página Tecnologias. */
export default function SpotliteAntiga() {
  return <PaginaMovida titulo={movidas.tecnologias.titulo} link={movidas.tecnologias.link} />;
}
