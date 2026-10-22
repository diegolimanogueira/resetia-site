import Link from "next/link";
import { Redirecionar } from "@/components/ui/redirecionar";
import { Section } from "@/components/ui/section";
import type { Link as LinkTipo } from "@/content/types";

/** Rota antiga: redireciona no cliente e mantém um link visível para quem chegou sem JS. */
export function PaginaMovida({ titulo, link }: { titulo: string; link: LinkTipo }) {
  return (
    <main data-tom="carvao" className="text-fg flex flex-1 bg-(--bg)">
      <Redirecionar para={link.href} />
      <Section
        tom="carvao"
        className="gutter flex flex-1 flex-col items-center justify-center pt-[180px] pb-[160px] text-center"
      >
        <h1 className="mb-6 text-[clamp(32px,4vw,56px)] leading-[.95] font-bold tracking-[-0.03em]">{titulo}</h1>
        <Link
          href={link.href}
          className="text-cinza border-cinza/40 hover:text-neutro hover:border-verde border-b pb-[3px] text-[15px] font-medium"
        >
          {link.label} →
        </Link>
      </Section>
    </main>
  );
}
