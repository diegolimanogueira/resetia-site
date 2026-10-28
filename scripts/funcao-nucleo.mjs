// Empacota src/lib/ai-score/servidor.ts (e o conteúdo que ele usa) em supabase/functions/ai-score/nucleo.js,
// para a função Deno usar o mesmo cálculo, análise, dicas e e-mails do site. Rodar depois de mexer em
// src/lib/ai-score ou src/content/ai-score*; o CI confere se o arquivo está em dia.
import { resolve } from "node:path";
import { rolldown } from "rolldown";

const bundle = await rolldown({
  input: "src/lib/ai-score/servidor.ts",
  platform: "neutral",
  resolve: { alias: { "@": resolve("src") } },
  logLevel: "warn",
});
await bundle.write({
  file: "supabase/functions/ai-score/nucleo.js",
  format: "esm",
  minify: true,
  banner: "// Gerado por `npm run funcao:nucleo` a partir de src/lib/ai-score/servidor.ts. Não editar à mão.",
});
await bundle.close();
console.log("supabase/functions/ai-score/nucleo.js atualizado");
