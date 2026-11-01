import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { aiScore } from "@/content/ai-score";
import { dimensoes } from "@/content/ai-score-questionario";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { lerLink } from "@/lib/ai-score/codec";
import { completas } from "@/lib/ai-score/codificar";
import { montarDevolutiva } from "@/lib/ai-score/devolutiva";
import { comQuem } from "@/lib/ai-score/quem";
import { waDiagnostico } from "@/lib/whatsapp";

/**
 * Demonstração do RESET AI Score, perto da primeira prova de credibilidade: o caso fictício do exemplo, calculado no
 * build com o mesmo motor da avaliação. Mostra a nota, o que merece atenção, a resposta que sustenta e a primeira
 * ação: uma leitura apoiada nas respostas, não só um número. O botão leva à avaliação; falar com um especialista
 * (WhatsApp) fica como segundo caminho.
 */
export function Scan() {
  const s = home.scan;
  const link = lerLink(aiScore.exemplo.codigo);
  const d = link.tipo === "ok" && completas(link.respostas) ? montarDevolutiva(link.respostas, link) : null;
  const item = (id: string) => d?.sintese.resumo.itens.find((i) => i.id === id);
  const itens = ["atencao", "sustentacao", "primeira-acao"].flatMap((id) => {
    const i = item(id);
    return i ? [{ rotulo: i.rotulo, texto: comQuem(i.texto, "A empresa do exemplo") }] : [];
  });
  return (
    <Section id="ai-score">
      <div className="container-site border-verde/40 grid gap-10 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.14)_0%,rgba(0,230,118,0)_55%)] p-[22px] md:grid-cols-[1.05fr_1fr] md:gap-[60px] md:p-[56px]">
        <div>
          <Eyebrow className="flex items-center gap-2.5">
            <Icone id="ai-score" tamanho={18} />
            {s.kicker}
          </Eyebrow>
          <h2 className="display-h2 mb-6">
            <Linhas itens={s.titulo} />
          </h2>
          <p className="text-fg-2 mb-8 max-w-[560px] text-[17px] leading-[1.7] md:text-[18px]">{s.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Botao href="/ai-score/" origem="ai-score-home">
              {site.ctaAiScore}
            </Botao>
            <Botao href={waDiagnostico()} origem="diagnostico-home" variante="secundario">
              {site.ctaDiagnostico}
            </Botao>
          </div>
          <p className="text-fg-2 mt-5 text-[14px]">{s.nota}</p>
          <p className="eyebrow text-fg-2 mt-8 mb-3 text-[11px]">{s.dimensoes}</p>
          <ul className="flex flex-wrap gap-2">
            {dimensoes.map((x) => (
              <li key={x.id} className="border-line bg-painel border px-3 py-1.5 text-[13px] font-semibold">
                {x.nome}
              </li>
            ))}
          </ul>
          <LinkSeta href={s.link.href} seta="→" className="mt-6">
            {s.link.label}
          </LinkSeta>
        </div>
        {d ? (
          <div data-demonstracao className="border-line bg-painel border p-[22px] md:p-[28px]">
            <p className="border-verde text-fg-2 mb-5 border-l-2 pl-3 text-[13px]">{s.demo.rotulo}</p>
            <p className="text-fg-2 text-[12px] font-semibold">{s.demo.nota}</p>
            <p className="mb-5 flex items-baseline gap-2">
              <span className="text-[56px] leading-none font-bold tracking-[-0.03em] tabular-nums" data-nota-demo>
                {d.resultado.indice}
              </span>
              <span className="text-fg-2 text-[15px] font-semibold">{s.demo.de100}</span>
              <span className="text-verde ml-2 text-[16px] font-bold">
                {d.resultado.nivel ? d.resultado.nivel.charAt(0).toUpperCase() + d.resultado.nivel.slice(1) : ""}
              </span>
            </p>
            <p className="eyebrow text-fg-2 mb-3 text-[11px]">{s.demo.leitura}</p>
            <dl className="grid gap-4">
              {itens.map((i) => (
                <div key={i.rotulo}>
                  <dt className="text-fg-2 text-[12px] font-semibold">{i.rotulo}</dt>
                  <dd className="mt-1 text-[15px] leading-[1.55]">{i.texto}</dd>
                </div>
              ))}
            </dl>
            <LinkSeta href={s.demo.completo.href} seta="→" className="mt-6">
              {s.demo.completo.label}
            </LinkSeta>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
