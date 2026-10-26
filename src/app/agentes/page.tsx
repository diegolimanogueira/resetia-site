import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.agentes.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: movidas.agentes.link.href },
};

/** Rota antiga: o catálogo virou Agentes de IA (a query ?area= segue junto). */
export default function AgentesAntiga() {
  return <PaginaMovida titulo={movidas.agentes.titulo} link={movidas.agentes.link} />;
}
