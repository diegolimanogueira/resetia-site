import { Botao } from "@/components/ui/botao";
import { Section } from "@/components/ui/section";

type Props = { titulo: string; botao: string; href: string; origem: string };

/** Fecho das páginas internas: frase grande centralizada + botão verde. Sempre carvão. */
export function CtaFinal({ titulo, botao, href, origem }: Props) {
  return (
    <Section tom="carvao" className="gutter py-[140px] text-center">
      <h2 className="mx-auto mb-8 max-w-[18ch] text-[clamp(36px,5vw,72px)] leading-[.95] font-bold tracking-[-0.03em]">
        {titulo}
      </h2>
      <Botao href={href} origem={origem}>
        {botao}
      </Botao>
    </Section>
  );
}
