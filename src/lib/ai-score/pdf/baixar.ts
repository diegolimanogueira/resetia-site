import { validarAprofundamento } from "../aprofundamento";
import { aprofundamentoSalvo, lerAprofundamentoSalvo } from "../navegador";
import { gerarPdf, nomeDoArquivo, type EntradaDoPdf } from "./relatorio";

/**
 * Gera o PDF no navegador e inicia o download. Este módulo, o gerador e o escritor só são baixados quando a pessoa
 * clica em "Baixar PDF" (import() no relatório): fora do peso inicial da página de resultado.
 */
export async function baixarPdf(e: EntradaDoPdf & { avaliacaoId?: string }) {
  // O aprofundamento só entra se existir neste navegador (ele não vai no link nem na devolutiva).
  let aprofundamento = e.aprofundamento ?? null;
  if (!aprofundamento && e.avaliacaoId && !e.exemplo) {
    const guardado = lerAprofundamentoSalvo(aprofundamentoSalvo.ler(e.avaliacaoId));
    const v = guardado ? validarAprofundamento(guardado.valor) : null;
    aprofundamento = v?.ok ? v.valor : null;
  }
  const bytes = gerarPdf({ ...e, aprofundamento });
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeDoArquivo(e.empresa, "RESET-AI-Score");
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
