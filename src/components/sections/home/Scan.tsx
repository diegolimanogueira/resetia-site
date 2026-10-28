import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { dimensoes } from "@/content/ai-score-questionario";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { waDiagnostico } from "@/lib/whatsapp";

/**
 * RESET AI Score em destaque: a principal porta de entrada. O botão leva ao AI Score; falar com um especialista
 * (WhatsApp) fica como segundo caminho. À direita, as seis dimensões avaliadas.
 */
export function Scan() {
  const s = home.scan;
  return (
    <Section id="ai-score">
      <div className="container-site border-verde/40 grid gap-10 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.14)_0%,rgba(0,230,118,0)_55%)] p-[26px] md:grid-cols-[1.1fr_1fr] md:gap-[70px] md:p-[56px]">
        <div>
          <Eyebrow className="flex items-center gap-2.5">
            <Icone id="ai-score" tamanho={18} />
            {s.kicker}
          </Eyebrow>
          <h2 className="display-h2 mb-6">
            <Linhas itens={s.titulo} />
          </h2>
          <p className="text-fg-2 mb-8 max-w-[560px] text-[18px] leading-[1.7]">{s.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Botao href="/ai-score/" origem="ai-score-home">
              {site.ctaAiScore}
            </Botao>
            <Botao href={waDiagnostico()} origem="diagnostico-home" variante="secundario">
              {site.ctaDiagnostico}
            </Botao>
          </div>
          <p className="text-fg-2 mt-5 text-[14px]">{s.nota}</p>
          <LinkSeta href={s.link.href} seta="→" className="mt-6">
            {s.link.label}
          </LinkSeta>
        </div>
        <div>
          <p className="eyebrow text-fg-2 mb-4 text-[11px]">{s.dimensoes}</p>
          <ol className="grid gap-2">
            {dimensoes.map((d) => (
              <li key={d.id} className="border-line bg-painel flex items-baseline gap-4 border px-5 py-4 text-[15px]">
                <span className="text-verde text-[13px] font-bold tabular-nums">{d.num}</span>
                <span>
                  <span className="font-semibold">{d.nome}</span>
                  <span className="text-fg-2"> · {d.resumo}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
