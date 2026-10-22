import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import type { CtaFinal as Cta } from "@/content/types";

type Props = { cta: Cta; href: string; origem: string };

/** Fecho das páginas internas: frase grande centralizada, apoio e botão verde. Sempre carvão. */
export function CtaFinal({ cta, href, origem }: Props) {
  return (
    <Section tom="carvao" className="gutter py-[140px] text-center">
      {cta.kicker ? <Eyebrow className="text-fg-2 mb-6">{cta.kicker}</Eyebrow> : null}
      <h2 className="mx-auto mb-8 max-w-[18ch] text-[clamp(36px,5vw,72px)] leading-[.95] font-bold tracking-[-0.03em]">
        {cta.titulo}
      </h2>
      {cta.apoio ? <p className="text-fg-2 mx-auto mb-10 max-w-[44ch] text-[20px] leading-[1.6]">{cta.apoio}</p> : null}
      <Botao href={href} origem={origem}>
        {cta.botao}
      </Botao>
    </Section>
  );
}
