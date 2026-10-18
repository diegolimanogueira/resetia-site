import type { Metadata } from "next";
import Link from "next/link";
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
        tom="carvao"
        className="gutter flex flex-1 flex-col items-center justify-center pt-[180px] pb-[160px] text-center"
      >
        <h1 className="mb-6 max-w-[22ch] text-[clamp(36px,5vw,72px)] leading-[.95] font-bold tracking-[-0.03em]">
          {naoEncontrada.titulo}
          <br />
          <span className="text-cinza">{naoEncontrada.apoio}</span>
        </h1>
        <Link
          href={naoEncontrada.link.href}
          className="text-cinza border-cinza/40 hover:text-neutro hover:border-verde border-b pb-[3px] text-[15px] font-medium"
        >
          {naoEncontrada.link.label} →
        </Link>
      </Section>
    </main>
  );
}
