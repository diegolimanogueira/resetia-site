// Lista toda ocorrência de "[FALTA]" no HTML exportado. Em CI vira anotação (::warning).
// Com --strict falha o build: usar quando o Diego decidir publicar sem pendências.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const raiz = "out";
const ignorar = /(^|\/)(_not-found|404)(\/|\.html$)/; // variantes da 404 repetem o rodapé

async function htmls(dir) {
  const itens = await readdir(dir, { withFileTypes: true });
  const arquivos = [];
  for (const it of itens) {
    const p = join(dir, it.name);
    if (it.isDirectory()) arquivos.push(...(await htmls(p)));
    else if (it.name.endsWith(".html")) arquivos.push(p);
  }
  return arquivos;
}

const ocorrencias = [];
for (const arquivo of (await htmls(raiz)).filter((a) => !ignorar.test(a.slice(raiz.length + 1)))) {
  const html = await readFile(arquivo, "utf8");
  const visivel = html.replace(/<script[\s\S]*?<\/script>/g, ""); // ignora o payload RSC, que repete o HTML
  const trechos = [...visivel.matchAll(/[^<>]{0,40}\[FALTA\][^<>]{0,20}/g)].map((m) => m[0].trim());
  if (trechos.length) ocorrencias.push({ arquivo, trechos });
}

if (ocorrencias.length === 0) {
  console.log("check-falta: nenhuma pendência [FALTA] no HTML exportado.");
  process.exit(0);
}

for (const { arquivo, trechos } of ocorrencias) {
  const unicos = [...new Set(trechos)];
  console.log(
    `${process.env.GITHUB_ACTIONS ? `::warning file=${arquivo}::` : "⚠ "}${arquivo}: ${unicos.length} pendência(s) — ${unicos.join(" | ")}`,
  );
}
console.log(`check-falta: ${ocorrencias.length} arquivo(s) com [FALTA].${strict ? " Modo estrito: falhando." : ""}`);
process.exit(strict ? 1 : 0);
