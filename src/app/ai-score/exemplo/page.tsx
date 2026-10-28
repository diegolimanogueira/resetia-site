import type { Metadata } from "next";
import { Resultado } from "@/components/sections/ai-score/Resultado";
import { CardSolucao } from "@/components/sections/shared/CardSolucao";
import { aiScore } from "@/content/ai-score";
import { seo } from "@/content/site";
import { solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: seo.aiScoreExemplo.title,
  description: seo.aiScoreExemplo.description,
  alternates: { canonical: "/ai-score/exemplo/" },
  robots: { index: false, follow: true },
};

/**
 * Relatório completo de exemplo, com respostas hipotéticas: mostra o que a pessoa recebe antes de responder.
 * Renderizado já no servidor (o caso é fixo), sem etapas de captura nem gravação.
 */
export default function PaginaExemplo() {
  const cartoes = Object.fromEntries(solucoes.lista.map((s) => [s.slug, <CardSolucao key={s.slug} s={s} />]));
  const e = aiScore.exemplo;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Resultado cartoes={cartoes} exemplo={{ codigo: e.codigo, nome: e.nome, empresa: e.empresa }} />
    </main>
  );
}
