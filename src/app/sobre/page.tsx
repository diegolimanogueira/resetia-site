import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { RetratoFundador } from "@/components/sections/shared/RetratoFundador";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { sobre } from "@/content/sobre";

export const metadata: Metadata = {
  title: seo.sobre.title,
  description: seo.sobre.description,
  alternates: { canonical: "/sobre/" },
};

/** Sobre a Reset: história, os dois fundadores, a mensagem de fechamento, a proposta de valor e o diagnóstico. */
export default function Sobre() {
  const s = sobre;
  const p = s.historia.prova;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina kicker={s.hero.kicker} titulo={<Linhas itens={s.hero.titulo} />} lead={s.hero.lead}>
        <p className="text-fg max-w-[760px] text-[18px] leading-[1.7]">{s.hero.apoio}</p>
      </HeroPagina>

      <Section>
        <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
          <div>
            <Eyebrow>{s.historia.kicker}</Eyebrow>
            <h2 className="display-h2">
              <Linhas itens={s.historia.titulo} />
            </h2>
          </div>
          <div className="text-fg-2 flex flex-col gap-5 text-[18px] leading-[1.75]">
            {s.historia.paragrafos.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <p className="border-verde text-fg border-l-2 pl-4 text-[15px]">
              {p.antes} {p.empresas.join(", ").replace(/, ([^,]*)$/, " e $1")}, {p.depois}
            </p>
          </div>
        </div>
      </Section>

      <Section tom="contraste">
        <div className="container-site">
          <Eyebrow>{s.fundadores.kicker}</Eyebrow>
          <h2 className="display-h2">
            <Linhas itens={s.fundadores.titulo} />
          </h2>
          <div className="mt-[50px] grid gap-[26px] md:grid-cols-2">
            {s.fundadores.pessoas.map((f) => (
              <article key={f.nome} className="border-line bg-painel border">
                <div className="bg-escuro flex h-[280px] items-center justify-center md:h-[320px]">
                  <RetratoFundador
                    foto={"foto" in f ? f.foto : undefined}
                    monograma={f.monograma}
                    className="size-[200px] text-[72px] md:size-[220px]"
                  />
                </div>
                <div className="p-[30px]">
                  <p className="eyebrow text-verde mb-3 text-[11px]">{f.cargo}</p>
                  <h3 className="mb-5 text-[35px] leading-[1.1] font-bold tracking-[-0.03em]">{f.nome}</h3>
                  <p className="text-fg mb-4 text-[16px] leading-[1.7]">{f.descricao}</p>
                  <LinkSeta href={f.link.href} className="mt-2">
                    {f.link.label}
                  </LinkSeta>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-site max-w-[1000px]">
          <h2 className="display-h2 mb-8">
            <Linhas itens={s.fechamento.titulo} />
          </h2>
          <p className="text-fg-2 text-[22px] leading-[1.6]">{s.fechamento.texto}</p>
        </div>
      </Section>

      <Section tom="escuro">
        <div className="container-site max-w-[1000px]">
          <Eyebrow>{s.proposta.kicker}</Eyebrow>
          <h2 className="text-[clamp(28px,3.4vw,46px)] leading-[1.15] font-bold tracking-[-0.03em]">
            <Linhas itens={s.proposta.titulo} />
          </h2>
        </div>
      </Section>

      <CtaFinal cta={s.cta} origem="sobre" />
    </main>
  );
}
