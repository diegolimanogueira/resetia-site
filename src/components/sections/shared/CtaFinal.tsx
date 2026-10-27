import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import type { CtaFinal as Cta } from "@/content/types";
import { waDiagnostico } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Acao = { label: string; href: string; origem: string };

/**
 * Fecho de todas as páginas, antes do rodapé. Por padrão o botão é o diagnóstico gratuito (WhatsApp);
 * nas soluções, o botão comercial da solução vem primeiro e o diagnóstico fica como segundo caminho.
 */
export function CtaFinal({
  cta,
  origem,
  primario,
  menor = false,
}: {
  cta: Cta;
  origem: string;
  primario?: Acao;
  /** Título longo (landing pages das soluções): corpo menor. */
  menor?: boolean;
}) {
  const diagnostico = { label: cta.botao, href: waDiagnostico(), origem: `diagnostico-${origem}` };
  const principal = primario ?? diagnostico;
  return (
    <Section tom="contraste" className="border-line border-t text-center">
      <div className="container-site">
        {cta.kicker ? <Eyebrow>{cta.kicker}</Eyebrow> : null}
        <h2
          className={cn(
            "mx-auto mb-8 max-w-[1000px] leading-[1.04] font-bold tracking-[-0.035em]",
            menor ? "text-[clamp(32px,4.2vw,58px)]" : "text-[clamp(40px,6vw,84px)]",
          )}
        >
          <Linhas itens={cta.titulo} />
        </h2>
        {cta.apoio ? (
          <p className="text-fg-2 mx-auto mb-[35px] max-w-[560px] text-[18px] leading-[1.6]">{cta.apoio}</p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Botao href={principal.href} origem={principal.origem}>
            {principal.label}
          </Botao>
          {primario ? (
            <Botao href={diagnostico.href} origem={diagnostico.origem} variante="secundario">
              {diagnostico.label}
            </Botao>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
