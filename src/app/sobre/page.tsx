import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Imagem } from "@/components/ui/imagem";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { sobre } from "@/content/sobre";
import { waGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.sobre.title,
  description: seo.sobre.description,
  alternates: { canonical: "/sobre/" },
};

/** Sobre (reset360 sobre.html): topo, essência, os dois fundadores em cards, convicção, fecho. */
export default function Sobre() {
  const s = sobre;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina kicker={s.hero.kicker} titulo={<Linhas itens={s.hero.titulo} />} lead={s.hero.lead} />

      <Section>
        <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
          <div>
            <Eyebrow>{s.essencia.kicker}</Eyebrow>
            <h2 className="display-h2">
              <Linhas itens={s.essencia.titulo} />
            </h2>
          </div>
          <div className="text-fg-2 flex flex-col gap-6 text-[19px] leading-[1.8]">
            {s.essencia.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
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
            {s.fundadores.pessoas.map((p) => (
              <article key={p.nome} className="border-line bg-painel border">
                <div className="bg-escuro flex h-[280px] items-center justify-center md:h-[320px]">
                  {"foto" in p && p.foto ? (
                    <Imagem
                      base={p.foto.base}
                      formatos={["avif", "webp"]}
                      fallback="jpg"
                      alt={p.foto.alt}
                      width={480}
                      height={480}
                      loading="lazy"
                      className="border-verde/40 size-[200px] rounded-full border object-cover md:size-[220px]"
                    />
                  ) : (
                    <span aria-hidden="true" className="text-verde text-[120px] leading-none font-bold">
                      {p.monograma}
                    </span>
                  )}
                </div>
                <div className="p-[30px]">
                  <p className="eyebrow text-verde mb-3 text-[11px]">{p.areas}</p>
                  <h3 className="mb-5 text-[35px] leading-[1.1] font-bold tracking-[-0.03em]">{p.nome}</h3>
                  {p.paragrafos.map((t) => (
                    <p key={t} className="text-fg/80 mb-4 text-[16px] leading-[1.7]">
                      {t}
                    </p>
                  ))}
                  <LinkSeta href={p.link.href} className="mt-2">
                    {p.link.label}
                  </LinkSeta>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-site">
          <div className="max-w-[950px]">
            <Eyebrow>{s.conviccao.kicker}</Eyebrow>
            <h2 className="display-h2 mb-8">
              <Linhas itens={s.conviccao.titulo} />
            </h2>
            <p className="text-fg-2 text-[22px] leading-[1.6]">{s.conviccao.texto}</p>
          </div>
        </div>
      </Section>

      <CtaFinal cta={s.cta} href={waGeral()} origem="sobre" />
    </main>
  );
}
