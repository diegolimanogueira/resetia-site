import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas, seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.spotlite.title,
  description: seo.spotlite.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/tecnologias/" },
};

/** Rota antiga. A Spotlite vive em /tecnologias. */
export default function SpotliteAntiga() {
  return <PaginaMovida titulo={movidas.spotlite.titulo} link={movidas.spotlite.link} />;
}
