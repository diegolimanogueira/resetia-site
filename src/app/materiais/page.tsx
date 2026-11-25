import type { Metadata } from "next";
import { Material } from "@/components/sections/materiais/Material";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { materiais } from "@/content/materiais";
import { ctaPadrao } from "@/content/solucoes";

export const metadata: Metadata = {
  title: materiais.seo.title,
  description: materiais.seo.description,
  alternates: { canonical: "/materiais/" },
  robots: { index: false, follow: true },
};

/**
 * Materiais para baixar: a página é uma só e a palavra-chave vem do endereço (/materiais/?brabo), lida no
 * cliente, porque o site é estático e cada material novo nasce no /admin, sem deploy. O fecho é o convite
 * padrão do site para o RESET AI Score. Fora do menu, do sitemap e do índice.
 */
export default function PaginaMateriais() {
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Material />
      <CtaFinal cta={ctaPadrao} origem="materiais" />
    </main>
  );
}
