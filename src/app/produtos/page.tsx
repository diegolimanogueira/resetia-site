import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas, seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.produtos.title,
  description: seo.produtos.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/tecnologias/" },
};

/** Rota antiga. A página Produtos virou Tecnologias. */
export default function ProdutosAntiga() {
  return <PaginaMovida titulo={movidas.produtos.titulo} link={movidas.produtos.link} />;
}
