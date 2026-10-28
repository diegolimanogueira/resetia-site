import type { Metadata } from "next";
import { Resultado } from "@/components/sections/ai-score/Resultado";
import { CardSolucao } from "@/components/sections/shared/CardSolucao";
import { seo } from "@/content/site";
import { solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: seo.aiScoreResultado.title,
  description: seo.aiScoreResultado.description,
  alternates: { canonical: "/ai-score/resultado/" },
  robots: { index: false, follow: true },
};

/**
 * Resultado do RESET AI Score. O resultado mora no hash da URL (#v=1&…), lido no cliente.
 * Os cards das cinco soluções saem prontos daqui: o cliente só mostra os indicados.
 */
export default function PaginaResultado() {
  const cartoes = Object.fromEntries(solucoes.lista.map((s) => [s.slug, <CardSolucao key={s.slug} s={s} />]));
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Resultado cartoes={cartoes} />
    </main>
  );
}
