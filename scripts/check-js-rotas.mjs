// JS (gzip) que cada página do export realmente carrega: soma dos <script src> de cada out/**/index.html.
// Complementa o size-limit (soma de todos os chunks): o Turbopack embute o conteúdo do RESET AI Score no chunk
// de cada rota (avaliação, resultado, admin), então a soma global conta cópias que ninguém baixa junto.
// Uso: node scripts/check-js-rotas.mjs [limite em KB, padrão 225]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const OUT = "out";
const LIMITE = Number(process.argv[2] ?? 225) * 1000;
// O /admin/ fica atrás do login, fora do índice e do Lighthouse, e carrega o mini CRM inteiro (funil, gaveta do
// lead, atividades, compositor de e-mail): teto próprio, para não afrouxar o das páginas públicas.
const LIMITES = { "/admin/": 240_000 };
const LIMITE_SOB_DEMANDA = 30_000;

const paginas = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n === "_next" ? [] : paginas(p);
    return n === "index.html" || n === "404.html" ? [p] : [];
  });

const tamanhos = new Map();
const gz = (arquivo) => {
  if (!tamanhos.has(arquivo)) tamanhos.set(arquivo, gzipSync(readFileSync(join(OUT, arquivo))).length);
  return tamanhos.get(arquivo);
};

let falhou = false;
const linhas = paginas(OUT)
  .map((html) => {
    const scripts = new Set(readFileSync(html, "utf8").match(/_next\/static\/chunks\/[^"']+\.js/g) ?? []);
    const total = [...scripts].reduce((s, c) => s + gz(c), 0);
    return { rota: `/${relative(OUT, html).replace(/index\.html$/, "")}`, total };
  })
  .sort((a, b) => b.total - a.total);

for (const { rota, total } of linhas) {
  const passou = total <= (LIMITES[rota] ?? LIMITE);
  falhou ||= !passou;
  console.log(`${passou ? "  " : "✗ "}${(total / 1000).toFixed(1).padStart(6)} kB  ${rota}`);
}
console.log(`\nLimite por página: ${LIMITE / 1000} kB (gzip); /admin/: ${LIMITES["/admin/"] / 1000} kB.`);

// Chunks que nenhum HTML referencia: carregados sob demanda (import()), como o motor da devolutiva e o gerador de PDF.
// Não pesam no carregamento da página, mas pesam quando a pessoa chega ao ponto que os pede, por isso têm teto próprio.
const emPagina = new Set(
  paginas(OUT).flatMap((html) => readFileSync(html, "utf8").match(/_next\/static\/chunks\/[^"']+\.js/g) ?? []),
);
const sobDemanda = readdirSync(join(OUT, "_next/static/chunks"))
  .filter((n) => n.endsWith(".js") && !emPagina.has(`_next/static/chunks/${n}`))
  .map((n) => ({ n, total: gz(`_next/static/chunks/${n}`) }))
  .sort((a, b) => b.total - a.total);
console.log(`\nSob demanda (teto de ${LIMITE_SOB_DEMANDA / 1000} kB cada):`);
if (!sobDemanda.length) console.log("   nenhum");
for (const { n, total } of sobDemanda) {
  const passou = total <= LIMITE_SOB_DEMANDA;
  falhou ||= !passou;
  console.log(`${passou ? "  " : "✗ "}${(total / 1000).toFixed(1).padStart(6)} kB  ${n}`);
}

if (falhou) {
  console.error("Alguma página ou chunk sob demanda passou do limite de JS.");
  process.exit(1);
}
