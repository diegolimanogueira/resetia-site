import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { waDiagnostico } from "@/lib/whatsapp";

/**
 * RESET AI Score em destaque: a principal porta de entrada. O botão leva ao AI Score; falar com um especialista
 * (WhatsApp) fica como segundo caminho. O detalhe das seis dimensões fica na página do AI Score.
 */
export function Scan() {
  const s = home.scan;
  return (
    <Section id="ai-score">
      <div className="container-site border-verde/40 grid items-center gap-8 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.14)_0%,rgba(0,230,118,0)_55%)] p-[26px] md:grid-cols-[minmax(0,1fr)_auto] md:gap-[70px] md:p-[56px]">
        <div>
          <Eyebrow className="flex items-center gap-2.5">
            <Icone id="ai-score" tamanho={18} />
            {s.kicker}
          </Eyebrow>
          <h2 className="display-h2 mb-6">
            <Linhas itens={s.titulo} />
          </h2>
          <p className="text-fg-2 max-w-[560px] text-[18px] leading-[1.7]">{s.lead}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Botao href="/ai-score/" origem="ai-score-home">
            {site.ctaAiScore}
          </Botao>
          <Botao href={waDiagnostico()} origem="diagnostico-home" variante="secundario">
            {site.ctaDiagnostico}
          </Botao>
          <p className="text-fg-2 mt-2 text-[14px]">{s.nota}</p>
          <LinkSeta href={s.link.href} seta="→">
            {s.link.label}
          </LinkSeta>
        </div>
      </div>
    </Section>
  );
}
