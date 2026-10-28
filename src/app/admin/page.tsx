import type { Metadata } from "next";
import { Admin } from "@/components/admin/Admin";
import { admin } from "@/content/admin";
import { solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: admin.seo.title,
  robots: { index: false, follow: false },
};

/**
 * Mini CRM do RESET AI Score. A página é estática e pública; os dados só aparecem para quem entra com
 * um usuário cadastrado em public.admins (RLS no Supabase). Fora do menu, do rodapé e do sitemap.
 */
export default function PaginaAdmin() {
  const nomesSolucoes = Object.fromEntries(solucoes.lista.map((s) => [s.slug, s.nome]));
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Admin nomesSolucoes={nomesSolucoes} />
    </main>
  );
}
