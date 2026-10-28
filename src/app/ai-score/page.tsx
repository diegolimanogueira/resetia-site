import type { Metadata } from "next";
import { BarrasDimensoes, Nota } from "@/components/sections/ai-score/Placar";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Perguntas } from "@/components/sections/shared/Perguntas";
import { Botao } from "@/components/ui/botao";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { aiScore } from "@/content/ai-score";
import { dimensoes, niveis } from "@/content/ai-score-questionario";
import { seo, site } from "@/content/site";
import { calcular } from "@/lib/ai-score/calcular";
import type { Slot } from "@/lib/ai-score/tipos";
import { supabase } from "@/lib/supabase";
import { waDiagnostico } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.aiScore.title,
  description: seo.aiScore.description,
  alternates: { canonical: "/ai-score/" },
};

const AVALIACAO = "/ai-score/avaliacao/";

/**
 * RESET AI Score: a porta de entrada do site. Duas visões, seis dimensões, as três camadas de entrega,
 * um exemplo de resultado, como funciona, a metodologia e o FAQ.
 */
export default function AiScore() {
  const a = aiScore;
  const exemplo = calcular({ centrais: a.exemplo.respostas as Slot[], areas: [], porArea: {} });
  return (
    <main data-tom="carvao" data-ai-score-modo={supabase.ativo ? "producao" : "demo"} className="text-fg bg-(--bg)">
      <HeroPagina
        kicker={a.hero.kicker}
        icone="ai-score"
        titulo={<Linhas itens={a.hero.titulo} />}
        tituloMenor
        lead={a.hero.lead}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Botao href={AVALIACAO} origem="ai-score-hero">
            {site.ctaAiScore}
          </Botao>
          <Botao href={waDiagnostico()} origem="diagnostico-ai-score" variante="secundario">
            {site.ctaDiagnostico}
          </Botao>
        </div>
        <p className="text-fg-2 mt-5 text-[14px]">{a.hero.nota}</p>
      </HeroPagina>

      <Section tom="escuro">
        <div className="container-site">
          <CabecalhoSecao kicker={a.visoes.kicker} titulo={a.visoes.titulo} />
          <ul className="grid gap-3 md:grid-cols-2">
            {a.visoes.itens.map((v) => (
              <li key={v.nome} className="border-line bg-painel border p-[26px] md:p-[36px]">
                <h3 className="text-[26px] leading-[1.15] font-bold tracking-[-0.02em]">{v.nome}</h3>
                <p className="text-verde mt-2 mb-5 text-[15px] font-semibold">{v.publico}</p>
                <p className="text-fg-2 text-[16px] leading-[1.65]">{v.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="dimensoes">
        <div className="container-site">
          <CabecalhoSecao kicker={a.dimensoes.kicker} titulo={a.dimensoes.titulo} lead={a.dimensoes.lead} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dimensoes.map((d) => (
              <li key={d.id} className="border-line border-t pt-6 pb-4">
                <span
                  aria-hidden="true"
                  data-decorativo
                  className="text-verde block text-[44px] leading-none font-bold tracking-[-0.04em]"
                >
                  {d.num}
                </span>
                <h3 className="mt-5 mb-1.5 text-[21px] leading-[1.2] font-bold tracking-[-0.02em]">{d.nome}</h3>
                <p className="text-fg-2 text-[15px] leading-[1.6]">{d.resumo}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tom="contraste">
        <div className="container-site grid items-center gap-10 md:grid-cols-[1fr_1.05fr] md:gap-[80px]">
          <div>
            <Eyebrow>{a.exemplo.kicker}</Eyebrow>
            <h2 className="display-h2 mb-6">
              <Linhas itens={a.exemplo.titulo} />
            </h2>
            <p className="text-fg-2 mb-8 max-w-[520px] text-[18px] leading-[1.7]">{a.exemplo.lead}</p>
            <Botao href={AVALIACAO} origem="ai-score-exemplo">
              {site.ctaAiScore}
            </Botao>
          </div>
          <figure className="border-line bg-painel border p-[26px] md:p-[40px]">
            <Nota indice={exemplo.indice!} nivel={exemplo.nivel!} tamanho="medio" />
            <BarrasDimensoes notas={exemplo.dimensoes} className="mt-9" />
            <figcaption className="text-fg-2 border-line mt-8 border-t pt-4 text-[12px] leading-[1.5]">
              {a.exemplo.aviso}
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section>
        <div className="container-site">
          <CabecalhoSecao kicker={a.camadas.kicker} titulo={a.camadas.titulo} />
          <ol className="grid gap-3 lg:grid-cols-3">
            {a.camadas.itens.map((c, i) => (
              <li
                key={c.nome}
                className={
                  i === 2
                    ? "border-verde/40 flex flex-col border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_60%)] p-[26px] md:p-[32px]"
                    : "border-line bg-painel flex flex-col border p-[26px] md:p-[32px]"
                }
              >
                <span className="text-verde eyebrow text-[11px]">{c.etiqueta}</span>
                <h3 className="mt-5 mb-3 text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">{c.nome}</h3>
                <p className="text-fg-2 text-[15px] leading-[1.65]">{c.texto}</p>
                {i === 2 ? (
                  <LinkSeta href="/diagnostico-gratuito" seta="→" className="mt-auto pt-6">
                    {c.nome}
                  </LinkSeta>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tom="escuro">
        <div className="container-site">
          <CabecalhoSecao kicker={a.etapas.kicker} titulo={a.etapas.titulo} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {a.etapas.passos.map((e) => (
              <li key={e.numero} className="border-line bg-painel border px-6 py-[30px]">
                <span className="text-verde text-[11px] tracking-[.1em]">{e.numero}</span>
                <h3 className="mt-5 mb-2 text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">{e.titulo}</h3>
                <p className="text-fg-2 text-[14px] leading-[1.6]">{e.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Botao href={AVALIACAO} origem="ai-score-etapas">
              {site.ctaAiScore}
            </Botao>
            <span className="text-fg-2 text-[14px]">{a.hero.nota}</span>
          </div>
        </div>
      </Section>

      <Section id="metodologia">
        <div className="container-site grid gap-10 md:grid-cols-2 md:gap-[90px]">
          <div>
            <Eyebrow>{a.metodologia.kicker}</Eyebrow>
            <h2 className="display-h2 mb-8">
              <Linhas itens={a.metodologia.titulo} />
            </h2>
            {a.metodologia.paragrafos.map((p) => (
              <p key={p} className="text-fg-2 mb-5 text-[17px] leading-[1.75]">
                {p}
              </p>
            ))}
          </div>
          <div>
            <h3 className="eyebrow text-fg-2 mb-4 text-[11px]">{a.metodologia.niveis}</h3>
            <ol className="border-line border-t">
              {niveis.map((n, i) => (
                <li key={n.id} className="border-line grid grid-cols-[72px_1fr] gap-4 border-b py-5">
                  <span className="text-fg-2 text-[13px] tabular-nums">
                    {n.min}–{n.max}
                  </span>
                  <span>
                    <span className="block text-[18px] font-bold">
                      <span className="text-verde mr-2 text-[13px]">{String(i + 1).padStart(2, "0")}</span>
                      {n.nome}
                    </span>
                    <span className="text-fg-2 mt-1 block text-[15px] leading-[1.55]">{n.descricao}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Perguntas tom="escuro" kicker={a.perguntas.kicker} titulo={a.perguntas.titulo} itens={a.perguntas.itens} />

      <CtaFinal
        cta={{ ...a.ctaFinal, botao: site.ctaAiScore }}
        origem="ai-score-final"
        primario={{ label: site.ctaAiScore, href: AVALIACAO, origem: "ai-score-final" }}
      />
    </main>
  );
}
