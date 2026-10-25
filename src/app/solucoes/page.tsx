import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.solucoes.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

/** Rota antiga: as sete soluções agora são a seção #solucoes da home (layout do reset360). */
export default function SolucoesAntiga() {
  return <PaginaMovida titulo={movidas.solucoes.titulo} link={movidas.solucoes.link} />;
}
