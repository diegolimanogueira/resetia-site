import type { Metadata } from "next";
import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { FaixaAiScore } from "@/components/sections/shared/FaixaAiScore";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Perguntas } from "@/components/sections/shared/Perguntas";
import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { seo, site } from "@/content/site";
import { ctaPadrao, perguntas, solucoes } from "@/content/solucoes";

export const metadata: Metadata = {
  title: seo.solucoes.title,
  description: seo.solucoes.description,
  alternates: { canonical: "/solucoes/" },
};

/** Visão geral das cinco soluções: contratação individual ou combinada, sem sequência obrigatória. */
export default function Solucoes() {
  const h = solucoes.hero;
  const e = solucoes.entrada;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina kicker={h.kicker} titulo={<Linhas itens={h.titulo} />} lead={h.lead}>
        <Botao href="/ai-score/" origem="ai-score-solucoes-topo">
          {site.ctaAiScore}
        </Botao>
      </HeroPagina>

      <Section>
        <div className="container-site">
          <GradeSolucoes itens={solucoes.lista} detalhado />
        </div>
      </Section>

      <Section tom="contraste">
        <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
          <div>
            <Eyebrow>{e.kicker}</Eyebrow>
            <h2 className="display-h2">
              <Linhas itens={e.titulo} />
            </h2>
          </div>
          <div>
            <p className="text-fg-2 mb-8 text-[19px] leading-[1.8]">{e.texto}</p>
            <FaixaAiScore
              texto={solucoes.detalhe.diagnostico.titulo}
              apoio={solucoes.detalhe.diagnostico.texto}
              origem="solucoes-entrada"
            />
          </div>
        </div>
      </Section>

      <Perguntas kicker={solucoes.perguntas.kicker} titulo={solucoes.perguntas.titulo} itens={perguntas} />

      <CtaFinal cta={ctaPadrao} origem="solucoes" />
    </main>
  );
}
