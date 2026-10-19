import type { Metadata } from "next";
import Link from "next/link";
import { Redirecionar } from "@/components/ui/redirecionar";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.spotlite.title,
  description: seo.spotlite.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/produtos/" },
};

/** Rota antiga. A Spotlite vive em /produtos; aqui só redireciona e mantém um link para quem chegou sem JS. */
export default function SpotliteAntiga() {
  return (
    <main data-tom="carvao" className="text-fg flex flex-1 bg-(--bg)">
      <Redirecionar para="/produtos/#spotlite" />
      <Section
        tom="carvao"
        className="gutter flex flex-1 flex-col items-center justify-center pt-[180px] pb-[160px] text-center"
      >
        <h1 className="mb-6 text-[clamp(32px,4vw,56px)] leading-[.95] font-bold tracking-[-0.03em]">
          A Spotlite agora está em Produtos.
        </h1>
        <Link
          href="/produtos/#spotlite"
          className="text-cinza border-cinza/40 hover:text-neutro hover:border-verde border-b pb-[3px] text-[15px] font-medium"
        >
          Ir para Produtos →
        </Link>
      </Section>
    </main>
  );
}
