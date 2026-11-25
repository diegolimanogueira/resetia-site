import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% estático: gera `out/` e é servido como Static Site no DigitalOcean App Platform.
  output: "export",
  // Staging no GitHub Pages vive em /resetia-site; em produção (DO) fica vazio. Assets em /public passam por asset().
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // NEXT_ASSET_PREFIX: o componente "materiais" da DO (.do/app.yaml) serve só out/materiais em /materiais e leva
  // junto o próprio _next, para não depender dos arquivos (com hash) de outro build.
  assetPrefix: process.env.NEXT_ASSET_PREFIX || process.env.NEXT_PUBLIC_BASE_PATH || undefined,
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
