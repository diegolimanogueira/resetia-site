// Gera src/app/opengraph-image.png (1200×630) e o .alt.txt com next/og (Satori), sem rota em runtime.
// Em export estático a rota opengraph-image.tsx vira um arquivo sem extensão (content-type errado nos
// hosts estáticos); a convenção de arquivo .png resolve. Rodar: npm run images.
import { ImageResponse } from "next/og.js";
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";

const nome = "Reset IA";
const tagline = "IA sem hype. Resultado na prática.";
const dominio = "www.resetia.com.br";
const alt = `${nome} — ${tagline}`;

const [inter700, inter400, icone] = await Promise.all([
  readFile("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
  readFile("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
  readFile("public/brand/icone-dark.png"),
]);
const iconeSrc = `data:image/png;base64,${icone.toString("base64")}`;
const [linha1, linha2] = ["IA sem hype.", "Resultado na prática."];

const arvore = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      background: "#0B0F0E",
      color: "#F6F7F5",
      fontFamily: "Inter",
      position: "relative",
    },
  },
  h("div", {
    style: {
      position: "absolute",
      right: -220,
      top: -260,
      width: 720,
      height: 720,
      borderRadius: 9999,
      background: "radial-gradient(circle, rgba(0,230,118,0.18) 0%, rgba(0,230,118,0) 65%)",
    },
  }),
  h("img", { src: iconeSrc, width: 96, height: 96, style: { width: 96, height: 96 } }),
  h(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 0.98,
          letterSpacing: "-0.03em",
        },
      },
      h("span", null, linha1),
      h("span", null, linha2),
    ),
    h("div", { style: { width: 140, height: 6, background: "#00E676", marginTop: 36 } }),
  ),
  h(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 26,
        color: "#9CA3AF",
        letterSpacing: "0.02em",
      },
    },
    h("span", null, `${nome} · treinamento de IA para equipes`),
    h("span", null, dominio),
  ),
);

const resposta = new ImageResponse(arvore, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Inter", data: inter700, weight: 700, style: "normal" },
    { name: "Inter", data: inter400, weight: 400, style: "normal" },
  ],
});
const png = Buffer.from(await resposta.arrayBuffer());
await writeFile("src/app/opengraph-image.png", png);
await writeFile("src/app/opengraph-image.alt.txt", alt + "\n");
console.log(`og image → src/app/opengraph-image.png (${Math.round(png.length / 1024)} KB)`);
