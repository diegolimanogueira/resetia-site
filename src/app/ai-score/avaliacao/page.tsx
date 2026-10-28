import type { Metadata } from "next";
import { Avaliacao } from "@/components/sections/ai-score/Avaliacao";
import { seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.aiScoreAvaliacao.title,
  description: seo.aiScoreAvaliacao.description,
  alternates: { canonical: "/ai-score/avaliacao/" },
  robots: { index: false, follow: true },
};

/** Questionário do RESET AI Score (client). Fora do sitemap: a porta de entrada indexada é /ai-score. */
export default function PaginaAvaliacao() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Avaliacao />
    </main>
  );
}
