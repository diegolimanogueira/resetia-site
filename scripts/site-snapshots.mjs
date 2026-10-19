// Fotografa as páginas iniciais da Spotlite e da Fluxa BPM (1440×900) para a página Produtos.
// Rodar: npm run snapshots:produtos — sempre que os produtos mudarem de cara.
import { createRequire } from "node:module";
import sharp from "sharp";

const { chromium } = createRequire(import.meta.url)("@playwright/test");
const BRAND = "public/brand";
const sites = [
  ["spotlite-site", "https://www.spotlite.com.br/"],
  ["fluxa-site", "https://www.fluxabpm.com.br/"],
];

const browser = await chromium.launch();
for (const [nome, url] of sites) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    locale: "pt-BR",
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  const png = await page.screenshot({ type: "png" });
  for (const [fmt, ext, opts] of [
    ["avif", "avif", { quality: 55 }],
    ["webp", "webp", { quality: 78 }],
    ["jpeg", "jpg", { quality: 82 }],
  ]) {
    const out = `${BRAND}/${nome}.${ext}`;
    const info = await sharp(png).resize({ width: 1440 })[fmt](opts).toFile(out);
    console.log(`${url} → ${out} (${Math.round(info.size / 1024)} KB)`);
  }
  await ctx.close();
}
await browser.close();
