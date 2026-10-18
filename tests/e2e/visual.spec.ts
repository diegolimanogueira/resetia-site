import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { rotas } from "./rotas";

/**
 * Regressão visual determinística: roda nos projetos reduced-motion (sem animação, sem cursor).
 * Baselines são geradas no Linux (workflow "Atualizar snapshots") e commitadas em tests/e2e/__screenshots__.
 * Sem baseline para o projeto, o teste é pulado em vez de falhar: o primeiro CI fica verde e o
 * workflow de atualização cria as imagens.
 */
for (const rota of [...rotas, { nome: "404", caminho: "/rota-que-nao-existe/" }]) {
  test(`página ${rota.nome} igual ao baseline`, async ({ page }, testInfo) => {
    const pasta = join(testInfo.project.testDir, "__screenshots__", testInfo.project.name);
    // Com --update-snapshots (all/changed) não pula: é assim que os baselines nascem.
    const atualizando = ["all", "changed"].includes(testInfo.config.updateSnapshots);
    test.skip(!atualizando && !existsSync(pasta), `sem baseline em ${pasta}; rode o workflow "Atualizar snapshots"`);
    test.skip(process.platform !== "linux", "baselines são Linux (mesma imagem do CI)");
    await page.goto(rota.caminho);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((ok) => img.addEventListener("load", ok, { once: true }))),
      );
    });
    await expect(page).toHaveScreenshot(`${rota.nome}.png`, { fullPage: true });
  });
}
