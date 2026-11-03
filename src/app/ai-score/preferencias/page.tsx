import type { Metadata } from "next";
import { Preferencias } from "@/components/sections/ai-score/Preferencias";
import { seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.aiScorePreferencias.title,
  description: seo.aiScorePreferencias.description,
  alternates: { canonical: "/ai-score/preferencias/" },
  robots: { index: false, follow: false },
};

/** Preferências de contato: o token de finalidade `preferencias` vem no hash do link do e-mail e é lido no cliente. */
export default function PaginaPreferencias() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Preferencias />
    </main>
  );
}
