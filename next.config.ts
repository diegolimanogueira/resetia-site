import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% estático: gera `out/` e é servido como Static Site no DigitalOcean App Platform.
  output: "export",
  // `solucoes/index.html` em vez de `solucoes.html`: qualquer host estático serve sem regra extra.
  trailingSlash: true,
  // Sem servidor de imagens em export; as imagens já saem otimizadas de scripts/optimize-images.mjs.
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
