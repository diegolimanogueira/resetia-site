// Converte os PNGs de marca em WebP/AVIF e gera ícones PWA/favicon a partir do símbolo.
// Rodar: npm run images. Saídas são commitadas; o build não depende deste script.
import sharp from "sharp";
import { existsSync } from "node:fs";
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

await convert("logo-dark.png", [{ file: "logo-dark.webp", fmt: "webp", opts: { quality: 90 } }]);
await convert("logo-light.png", [{ file: "logo-light.webp", fmt: "webp", opts: { quality: 90 } }]);

// Ícone no núcleo das órbitas do hero (até 92px na tela; 180px cobre 2x), nas duas versões do tema.
for (const v of ["dark", "light"]) {
  await sharp(`${BRAND}/icone-${v}.png`)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(`${BRAND}/icone-${v}.webp`);
  console.log(`icone-${v}.png → icone-${v}.webp (${await kb(`${BRAND}/icone-${v}.webp`)})`);
}

// Fotos dos fundadores (design/fotos/<nome>.png): quadrado centrado no rosto, para os retratos redondos.
// `recorte` enquadra o rosto quando a foto já é quadrada (a da Élida é 800×800 com o rosto no terço de cima).
const fotos = [{ nome: "diego" }, { nome: "elida", recorte: { left: 170, top: 10, width: 520, height: 520 } }];
for (const { nome, recorte } of fotos) {
  const origem = `design/fotos/${nome}.png`;
  if (!existsSync(origem)) {
    console.log(`${origem} não existe: pulando`);
    continue;
  }
  for (const [fmt, file, opts] of [
    ["avif", `${nome}.avif`, { quality: 60 }],
    ["webp", `${nome}.webp`, { quality: 82 }],
    ["jpeg", `${nome}.jpg`, { quality: 84 }],
  ]) {
    const imagem = sharp(origem);
    await (recorte ? imagem.extract(recorte) : imagem)
      .resize(480, 480, { fit: "cover", position: sharp.strategy.attention })
      [fmt](opts)
      .toFile(`${BRAND}/${file}`);
    console.log(`${nome}.png → ${file} (${await kb(`${BRAND}/${file}`)})`);
  }
}

// PLACEHOLDER brand: ícones gerados do PNG. Trocar pelo SVG oficial quando o Diego exportar.
await icon(512, "src/app/icon.png");
await icon(180, "src/app/apple-icon.png", { padding: 0.14 });
await icon(192, "public/icons/icon-192.png");
await icon(512, "public/icons/icon-512.png");
await icon(512, "public/icons/icon-maskable-512.png", { padding: 0.26 });
