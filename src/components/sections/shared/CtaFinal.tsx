import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import type { CtaFinal as Cta } from "@/content/types";

type Props = { cta: Cta; href: string; origem: string };

/**
 * Fecho de todas as páginas (reset360 .final-cta). No protótipo é uma faixa verde; aqui fica na
 * superfície de contraste com destaque e botão verdes (verde não é fundo de seção no manual).
 */
export function CtaFinal({ cta, href, origem }: Props) {
  return (
    <Section tom="contraste" className="border-line border-t text-center">
      <div className="container-site">
        {cta.kicker ? <Eyebrow>{cta.kicker}</Eyebrow> : null}
        <h2 className="mx-auto mb-8 max-w-[1000px] text-[clamp(40px,6vw,84px)] leading-[1.02] font-bold tracking-[-0.035em]">
          <Linhas itens={cta.titulo} />
        </h2>
        {cta.apoio ? (
          <p className="text-fg-2 mx-auto mb-[35px] max-w-[560px] text-[18px] leading-[1.6]">{cta.apoio}</p>
        ) : null}
        <Botao href={href} origem={origem}>
          {cta.botao}
        </Botao>
      </div>
    </Section>
  );
}
