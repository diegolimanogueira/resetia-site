// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CONSENTIMENTOS_VERSAO, textosDeConsentimento, textosDePreferencias } from "@/content/ai-score-consentimentos";

/**
 * Cada consentimento registrado guarda a versão do texto que a pessoa viu. Se o texto mudar sem a versão mudar, o
 * registro passaria a afirmar que a pessoa viu um texto que não viu. Para mudar um texto: suba CONSENTIMENTOS_VERSAO
 * e atualize a impressão digital abaixo.
 */
const IMPRESSAO = {
  versao: "2026-11-02",
  sha256: "3d65e3f24740b726a6a9fe1849102f798032902ea0b0f5ffd91ea86011d13c1c",
};

describe("textos de consentimento", () => {
  it("a versão registrada acompanha a impressão digital dos textos", () => {
    const digest = createHash("sha256")
      .update(JSON.stringify({ textosDeConsentimento, textosDePreferencias }))
      .digest("hex");
    expect(CONSENTIMENTOS_VERSAO, "versão em uso").toBe(IMPRESSAO.versao);
    expect(digest, "texto mudou: suba CONSENTIMENTOS_VERSAO e atualize IMPRESSAO").toBe(IMPRESSAO.sha256);
  });

  it("receber o relatório, receber conteúdo e pedir análise são escolhas distintas", () => {
    expect(
      new Set([
        textosDeConsentimento.relatorioEmail,
        textosDeConsentimento.conteudoEmail,
        textosDeConsentimento.contatoAnalise,
      ]).size,
    ).toBe(3);
    expect(textosDePreferencias.contatoWhatsapp).not.toBe(textosDePreferencias.contatoLigacao);
  });

  it("os textos não prometem o que não existe (nada de cadência automática nem de envio sem escolha)", () => {
    for (const t of [...Object.values(textosDeConsentimento), ...Object.values(textosDePreferencias)])
      expect(t).not.toMatch(/automátic|toda semana|diariamente|sempre que/i);
  });
});
