import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Perguntas } from "@/components/sections/shared/Perguntas";
import { Botao } from "@/components/ui/botao";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { diagnostico } from "@/content/diagnostico";
import { seo, site } from "@/content/site";
import { ctaPadrao } from "@/content/solucoes";
import { testeSpotliteUrl } from "@/lib/teste-spotlite";
import { waDiagnostico } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.diagnostico.title,
  description: seo.diagnostico.description,
  alternates: { canonical: "/diagnostico-gratuito/" },
};

/**
 * Análise Estratégica RESET (URL antiga do diagnóstico gratuito): o que aprofundamos, como funciona a partir do
 * AI Score, o limite do escopo e o teste da Spotlite como alternativa.
 */
export default function DiagnosticoGratuito() {
  const d = diagnostico;
  const t = d.teste;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina
        kicker={d.hero.kicker}
        icone="diagnostico"
        titulo={<Linhas itens={d.hero.titulo} />}
        tituloMenor
        lead={d.hero.lead}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Botao href={waDiagnostico()} origem="diagnostico-pagina">
            {site.ctaDiagnostico}
          </Botao>
          <Botao href="/ai-score/" origem="ai-score-pagina" variante="secundario">
            {site.ctaAiScore}
          </Botao>
        </div>
        <p className="text-fg-2 mt-5 text-[14px]">{d.hero.nota}</p>
      </HeroPagina>

      <Section tom="escuro">
        <div className="container-site">
          <CabecalhoSecao kicker={d.avaliamos.kicker} titulo={d.avaliamos.titulo} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {d.avaliamos.itens.map((item) => (
              <li
                key={item}
                className="border-line bg-painel flex items-start gap-3 border p-6 text-[16px] leading-[1.5]"
              >
                <span aria-hidden="true" className="text-verde">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="container-site">
          <CabecalhoSecao kicker={d.etapas.kicker} titulo={d.etapas.titulo} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {d.etapas.passos.map((e) => (
              <li key={e.numero} className="border-line bg-painel border px-6 py-[30px]">
                <span className="text-verde text-[11px] tracking-[.1em]">{e.numero}</span>
                <h3 className="mt-5 mb-2 text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">{e.titulo}</h3>
                <p className="text-fg-2 text-[14px] leading-[1.6]">{e.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Botao href="/ai-score/" origem="ai-score-pagina-etapas">
              {site.ctaAiScore}
            </Botao>
            <Botao href={waDiagnostico()} origem="diagnostico-pagina-etapas" variante="secundario">
              {site.ctaDiagnostico}
            </Botao>
          </div>
        </div>
      </Section>

      <Section tom="contraste">
        <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
          <h2 className="display-h2">
            <Linhas itens={d.escopo.titulo} />
          </h2>
          <div>
            <p className="text-fg-2 mb-6 text-[18px] leading-[1.75]">{d.escopo.texto}</p>
            <LinkSeta href={d.escopo.link.href} seta="→">
              {d.escopo.link.label}
            </LinkSeta>
          </div>
        </div>
      </Section>

      <Section id="teste-de-ia">
        <div className="container-site border-line grid gap-10 border p-[26px] md:grid-cols-[1.1fr_1fr] md:gap-[70px] md:p-[50px]">
          <div>
            <Eyebrow>{t.kicker}</Eyebrow>
            <h2 className="display-h2 mb-6">
              <Linhas itens={t.titulo} />
            </h2>
            <p className="text-fg-2 mb-4 max-w-[560px] text-[18px] leading-[1.7]">{t.lead}</p>
            <p className="text-fg mb-8 text-[15px]">{t.paraQuem}</p>
            <Botao href={testeSpotliteUrl("diagnostico")} origem="teste-spotlite" variante="secundario">
              {t.cta}
            </Botao>
            <p className="text-fg-2 mt-5 max-w-[520px] text-[13px] leading-[1.6]">{t.nota}</p>
            <p className="text-fg-2 mt-1 text-[13px] leading-[1.6]">{t.aviso}</p>
          </div>
          <ol className="grid content-center gap-3 sm:grid-cols-2">
            {t.etapas.map((e) => (
              <li key={e.numero} className="border-line bg-painel border px-6 py-7">
                <span className="text-verde block text-[32px] leading-none font-bold tracking-[-0.03em]">
                  {e.numero}
                </span>
                <span className="mt-4 block text-[18px] font-semibold">{e.texto}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Perguntas tom="escuro" kicker={d.perguntas.kicker} titulo={d.perguntas.titulo} itens={d.perguntas.itens} />

      <CtaFinal cta={ctaPadrao} origem="pagina-final" />
    </main>
  );
}
