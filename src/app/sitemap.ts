import type { MetadataRoute } from "next";
import { nav, navDiagnostico, site } from "@/content/site";
import { solucoes } from "@/content/solucoes";

export const dynamic = "force-static";

/** Home, páginas da navegação, as cinco soluções, o diagnóstico gratuito e a privacidade. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paginas = [...nav.filter((l) => l.href !== "/"), navDiagnostico].map((l) => l.href);
  return [
    { url: `${site.dominio}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    ...paginas.map((href) => ({
      url: `${site.dominio}${href}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: href === navDiagnostico.href ? 0.9 : 0.8,
    })),
    ...solucoes.lista.map((s) => ({
      url: `${site.dominio}/solucoes/${s.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.dominio}/privacidade/`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
