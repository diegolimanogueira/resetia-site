import type { MetadataRoute } from "next";
import { seo, site } from "@/content/site";
import { asset } from "@/lib/asset";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nome,
    short_name: site.nome,
    description: seo.home.description,
    lang: "pt-BR",
    start_url: asset("/"),
    display: "standalone",
    background_color: "#0B0F0E",
    theme_color: "#0B0F0E",
    icons: [
      { src: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: asset("/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: asset("/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
