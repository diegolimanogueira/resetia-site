import type { MetadataRoute } from "next";
import { seo, site } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nome,
    short_name: site.nome,
    description: seo.home.description,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F0E",
    theme_color: "#0B0F0E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
