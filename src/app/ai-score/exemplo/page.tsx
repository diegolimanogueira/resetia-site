import type { Metadata } from "next";
import { Resultado } from "@/components/sections/ai-score/Resultado";
import { CardSolucao } from "@/components/sections/shared/CardSolucao";
import { aiScore } from "@/content/ai-score";
import { seo } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { completas, lerLink } from "@/lib/ai-score/codificar";
import { montarDevolutiva } from "@/lib/ai-score/devolutiva";

export const metadata: Metadata = {
  title: seo.aiScoreExemplo.title,
  description: seo.aiScoreExemplo.description,
  alternates: { canonical: "/ai-score/exemplo/" },
  robots: { index: false, follow: true },
};

/**
 * Relatório completo de exemplo, com respostas hipotéticas: mostra o que a pessoa recebe antes de responder.
 * A devolutiva sai calculada aqui, no build (o caso é fixo): a página já vem completa no HTML e não baixa o motor.
 */
export default function PaginaExemplo() {
  const cartoes = Object.fromEntries(solucoes.lista.map((s) => [s.slug, <CardSolucao key={s.slug} s={s} />]));
  const e = aiScore.exemplo;
  const link = lerLink(e.codigo);
  if (link.tipo !== "ok" || !completas(link.respostas)) throw new Error("O código do exemplo do AI Score é inválido.");
  const devolutiva = montarDevolutiva(link.respostas, link);
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Resultado cartoes={cartoes} exemplo={{ codigo: e.codigo, nome: e.nome, empresa: e.empresa, devolutiva }} />
    </main>
  );
}
