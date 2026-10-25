import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.tecnologias.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

/** Rota antiga: Spotlite e Fluxa BPM agora são a seção #tecnologias da home (layout do reset360). */
export default function TecnologiasAntiga() {
  return <PaginaMovida titulo={movidas.tecnologias.titulo} link={movidas.tecnologias.link} />;
}
