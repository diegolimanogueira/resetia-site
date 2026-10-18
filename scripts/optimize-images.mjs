// Converte os PNGs de marca em WebP/AVIF e gera ícones PWA/favicon a partir do símbolo.
// Rodar: npm run images. Saídas são commitadas; o build não depende deste script.
import sharp from "sharp";
import { stat } from "node:fs/promises";

const BRAND = "public/brand";
const CARVAO = "#0B0F0E";

const kb = async (p) => `${Math.round((await stat(p)).size / 1024)} KB`;

async function convert(input, outputs) {
  for (const { file, opts, fmt } of outputs) {
    await sharp(`${BRAND}/${input}`)[fmt](opts).toFile(`${BRAND}/${file}`);
    console.log(`${input} → ${file} (${await kb(`${BRAND}/${file}`)})`);
  }
}

async function icon(size, output, { padding = 0.18 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const symbol = await sharp(`${BRAND}/icone-dark.png`)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: CARVAO } })
    .composite([{ input: symbol, gravity: "centre" }])
    .png()
    .toFile(output);
  console.log(`ícone ${size}px → ${output} (${await kb(output)})`);
}

await convert("porta.png", [
  { file: "porta.webp", fmt: "webp", opts: { quality: 80 } },
  { file: "porta.avif", fmt: "avif", opts: { quality: 55 } },
]);
// Variante para telas até 860px (coluna ocupa a largura toda; 768px cobre 2x em 390px)
for (const [fmt, file, opts] of [
  ["webp", "porta-768.webp", { quality: 80 }],
  ["avif", "porta-768.avif", { quality: 55 }],
]) {
  await sharp(`${BRAND}/porta.png`).resize({ width: 768 })[fmt](opts).toFile(`${BRAND}/${file}`);
  console.log(`porta.png → ${file} (${await kb(`${BRAND}/${file}`)})`);
}
await convert("bussola.png", [{ file: "bussola.webp", fmt: "webp", opts: { quality: 82 } }]);
await convert("logo-dark.png", [{ file: "logo-dark.webp", fmt: "webp", opts: { quality: 90 } }]);
await convert("logo-light.png", [{ file: "logo-light.webp", fmt: "webp", opts: { quality: 90 } }]);

// PLACEHOLDER brand: ícones gerados do PNG. Trocar pelo SVG oficial quando o Diego exportar.
await icon(512, "src/app/icon.png");
await icon(180, "src/app/apple-icon.png", { padding: 0.14 });
await icon(192, "public/icons/icon-192.png");
await icon(512, "public/icons/icon-512.png");
await icon(512, "public/icons/icon-maskable-512.png", { padding: 0.26 });
