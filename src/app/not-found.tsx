import type { Metadata } from "next";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { naoEncontrada, seo } from "@/content/site";

// O Next já emite <meta name="robots" content="noindex"> na not-found; não duplicar.
export const metadata: Metadata = {
  title: seo.naoEncontrada.title,
};

export default function NaoEncontrada() {
  return (
    <main data-tom="carvao" className="text-fg flex flex-1 bg-(--bg)">
      <Section
        espaco="nenhum"
        className="flex flex-1 flex-col items-center justify-center pt-[140px] pb-[140px] text-center"
      >
        <h1 className="mb-6 max-w-[22ch] text-[clamp(36px,5vw,72px)] leading-[.95] font-bold tracking-[-0.03em]">
          {naoEncontrada.titulo}
          <br />
          <em>{naoEncontrada.apoio}</em>
        </h1>
        <LinkSeta href={naoEncontrada.link.href} seta="→">
          {naoEncontrada.link.label}
        </LinkSeta>
      </Section>
    </main>
  );
}
