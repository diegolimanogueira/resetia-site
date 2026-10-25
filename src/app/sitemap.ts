import type { MetadataRoute } from "next";
import { nav, site } from "@/content/site";
import { solucoes } from "@/content/solucoes";

export const dynamic = "force-static";

/** Páginas da navegação (as âncoras da home ficam de fora), as sete soluções e a privacidade. */
const paginasNav = nav.filter((l) => !l.href.includes("#")).map((l) => l.href);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.dominio}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    ...paginasNav.map((href) => ({
      url: `${site.dominio}${href}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...solucoes.lista.map((s) => ({
      url: `${site.dominio}/solucoes/${s.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${site.dominio}/privacidade/`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
