import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.tecnologias.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

/** Rota antiga (Produtos → Tecnologias → seção #tecnologias da home). */
export default function ProdutosAntiga() {
  return <PaginaMovida titulo={movidas.tecnologias.titulo} link={movidas.tecnologias.link} />;
}
