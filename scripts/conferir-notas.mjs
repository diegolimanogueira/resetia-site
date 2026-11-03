// Confere as notas gravadas no banco contra a reprodução pelo método congelado. Só lê um arquivo local: não acessa rede
// nem o banco. Uso: node --no-warnings scripts/conferir-notas.mjs <export.json|export.csv>
// O arquivo é o resultado da consulta Q3 de docs/ai-score-evolucao.md (colunas id, criada_em, indice, nivel, parcial,
// codigo), exportado do editor SQL do Supabase. Usa supabase/functions/ai-score/nucleo.js, o mesmo código da função.
import { readFileSync } from "node:fs";

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("Uso: node scripts/conferir-notas.mjs <export.json|export.csv>");
  process.exit(2);
}
const { calcular, completas, decodificar } = await import("../supabase/functions/ai-score/nucleo.js");

/** CSV simples com aspas duplas (o que o editor SQL exporta). */
function lerCsv(texto) {
  const linhas = [];
  let campo = "";
  let linha = [];
  let aspas = false;
  const fecharLinha = () => {
    linha.push(campo);
    campo = "";
    if (linha.some((x) => x !== "")) linhas.push(linha);
    linha = [];
  };
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        aspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      aspas = true;
    } else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fecharLinha();
    } else {
      campo += c;
    }
  }
  if (campo !== "" || linha.length) fecharLinha();
  const [cab, ...resto] = linhas;
  return resto.map((l) => Object.fromEntries(cab.map((n, i) => [n.trim(), l[i]])));
}

const bruto = readFileSync(arquivo, "utf8");
const linhas = arquivo.endsWith(".json") ? JSON.parse(bruto) : lerCsv(bruto);
const booleano = (v) => v === true || v === "true" || v === "t";

const divergentes = [];
const ilegiveis = [];
let iguais = 0;
for (const a of linhas) {
  const r = decodificar(String(a.codigo ?? ""));
  if (!completas(r)) {
    ilegiveis.push(a);
    continue;
  }
  const res = calcular(r);
  const gravado = {
    indice: a.indice === null || a.indice === "" ? null : Number(a.indice),
    nivel: a.nivel || null,
    parcial: booleano(a.parcial),
  };
  const reproduzido = { indice: res.indice, nivel: res.nivel, parcial: res.parcial };
  if (JSON.stringify(gravado) === JSON.stringify(reproduzido)) iguais++;
  else divergentes.push({ id: a.id, criada_em: a.criada_em, gravado, reproduzido });
}

console.log(`Avaliações lidas: ${linhas.length}`);
console.log(`  nota gravada = reprodução pelo método 1: ${iguais}`);
console.log(`  divergentes: ${divergentes.length}`);
console.log(`  código ilegível ou incompleto: ${ilegiveis.length}`);
for (const d of divergentes)
  console.log(
    `  - ${d.id} (${d.criada_em}): gravado ${JSON.stringify(d.gravado)} → método 1 ${JSON.stringify(d.reproduzido)}`,
  );
for (const a of ilegiveis) console.log(`  ? ${a.id} (${a.criada_em}): ${String(a.codigo).slice(0, 60)}`);
console.log(
  "\nDivergência não é erro do site: pode ser uma avaliação feita enquanto vigorava a escala anterior (28/10, antes das 14:32).",
);
