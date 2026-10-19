import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { STAGING } from "@/lib/asset";

export const dynamic = "force-static";

/** Produção: tudo liberado e sitemap. Staging (GitHub Pages): nada indexado. */
export default function robots(): MetadataRoute.Robots {
  if (STAGING) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.dominio}/sitemap.xml`,
    host: site.dominio,
  };
}
