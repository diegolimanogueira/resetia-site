import { Redirecionar } from "@/components/ui/redirecionar";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import type { Link as LinkTipo } from "@/content/types";

/** Rota antiga: redireciona no cliente e mantém um link visível para quem chegou sem JS. */
export function PaginaMovida({ titulo, link }: { titulo: string; link: LinkTipo }) {
  return (
    <main data-tom="carvao" className="text-fg flex flex-1 bg-(--bg)">
      <Redirecionar para={link.href} />
      <Section
        espaco="nenhum"
        className="flex flex-1 flex-col items-center justify-center pt-[140px] pb-[140px] text-center"
      >
        <h1 className="mb-6 text-[clamp(32px,4vw,56px)] leading-[.95] font-bold tracking-[-0.03em]">{titulo}</h1>
        <LinkSeta href={link.href} seta="→">
          {link.label}
        </LinkSeta>
      </Section>
    </main>
  );
}
