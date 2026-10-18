import type { MetadataRoute } from "next";
import { nav, site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.dominio}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    ...nav.map((l) => ({
      url: `${site.dominio}${l.href}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
