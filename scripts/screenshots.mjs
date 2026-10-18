// Prints das páginas para conferência visual no fim de cada fase.
// Uso: npm run build && npx serve out -l 4173 & node scripts/screenshots.mjs [baseUrl]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:4173";
const rotas = [
  ["home", "/"],
  ["solucoes", "/solucoes/"],
  ["spotlite", "/spotlite/"],
  ["sobre", "/sobre/"],
  ["404", "/rota-que-nao-existe/"],
];
const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch();
for (const [vpNome, viewport] of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const [nome, rota] of rotas) {
    await page.goto(base + rota, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const arquivo = `docs/screenshots/${nome}-${vpNome}.png`;
    await page.screenshot({ path: arquivo, fullPage: true });
    console.log(`✓ ${arquivo}`);
  }
  await context.close();
}
await browser.close();
