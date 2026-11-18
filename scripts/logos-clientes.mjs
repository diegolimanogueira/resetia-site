// Logos dos clientes (design/clientes/<id>.png|webp) → public/clientes/<id>.png, com fundo transparente.
// Só PNG em paleta: para logos chapadas ele sai menor que o WebP.
// Rodar: npm run images. Saídas são commitadas; o build não depende deste script.
// Imprime o tamanho de exibição de cada logo (para src/content/clientes.ts): a largura e a altura saem da
// proporção, de modo que todas ocupem a mesma área na tela e nenhuma pareça maior que as outras.
import sharp from "sharp";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

const ORIGEM = "design/clientes";
const SAIDA = "public/clientes";
/** Lado do quadrado de mesma área, em px na tela (os arquivos saem em 2x). */
const LADO = 78;

/**
 * `recorte` tira o que não cabe numa logo pequena (o slogan sob a marca do IEL). `escala` corrige o peso visual:
 * a marca do IEL é um bloco cheio e, na mesma área das outras, parece maior.
 */
const logos = [
  { id: "fortes-tecnologia" },
  { id: "fortespay" },
  { id: "somapay" },
  { id: "longevidade-saudavel" },
  { id: "iel", recorte: { left: 0, top: 0, width: 1920, height: 410 }, escala: 0.88 },
];

/**
 * Fundo branco chapado vira transparência: cada pixel é tratado como a cor original composta sobre branco,
 * o que preserva as bordas suavizadas. Imagens que já têm transparência passam direto.
 */
async function semFundoBranco(imagem) {
  const { data, info } = await imagem.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const alfa = 1 - Math.min(data[i], data[i + 1], data[i + 2]) / 255;
    for (let c = 0; c < 3; c++) data[i + c] = alfa === 0 ? 0 : Math.round((data[i + c] - 255 * (1 - alfa)) / alfa);
    data[i + 3] = Math.round(alfa * 255);
  }
  return sharp(data, { raw: info });
}

await mkdir(SAIDA, { recursive: true });
for (const { id, recorte, escala = 1 } of logos) {
  const origem = ["png", "webp"].map((ext) => `${ORIGEM}/${id}.${ext}`).find(existsSync);
  if (!origem) {
    console.log(`${ORIGEM}/${id}.(png|webp) não existe: pulando`);
    continue;
  }
  let imagem = sharp(origem);
  if (recorte) imagem = imagem.extract(recorte);
  if ((await sharp(origem).stats()).isOpaque) imagem = await semFundoBranco(imagem);
  const aparada = await imagem.png().trim().toBuffer({ resolveWithObject: true });
  const proporcao = aparada.info.width / aparada.info.height;
  const largura = Math.round(LADO * escala * Math.sqrt(proporcao));
  const altura = Math.round((LADO * escala) / Math.sqrt(proporcao));
  await sharp(aparada.data)
    .resize(largura * 2, altura * 2)
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${SAIDA}/${id}.png`);
  console.log(`${id}: largura ${largura}, altura ${altura}`);
}
