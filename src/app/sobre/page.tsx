import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Imagem } from "@/components/ui/imagem";
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

export default function Sobre() {
  const s = sobre;
  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-20">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-6">{s.hero.kicker}</Eyebrow>
          <h1 className="mb-6 text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">
            {s.hero.titulo[0]}
            <br />
            {s.hero.titulo[1]}
          </h1>
          <p className="text-fg-2 max-w-[52ch] text-[20px] leading-[1.6]">{s.hero.lead}</p>
        </div>
      </Section>

      <Section tom="neutro" className="gutter pb-[120px]">
        <div className="container-site grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
          <div>
            <Eyebrow className="text-fg-2 mb-6">{s.essencia.kicker}</Eyebrow>
            <h2 className="display-h2">
              {s.essencia.titulo[0]}
              <br />
              {s.essencia.titulo[1]}
            </h2>
          </div>
          <div className="flex flex-col gap-6 md:pt-10">
            {s.essencia.paragrafos.map((p) => (
              <p key={p} className="max-w-[58ch] text-[19px] leading-[1.6]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-6">{s.fundadores.kicker}</Eyebrow>
          <h2 className="display-h2 mb-16">
            {s.fundadores.titulo[0]}
            <br />
            {s.fundadores.titulo[1]}
          </h2>
          <div className="grid gap-16 md:grid-cols-2">
            {s.fundadores.pessoas.map((p) => (
              <article key={p.nome} className="border-line border-t pt-10">
                {"foto" in p && p.foto ? (
                  <Imagem
                    base={p.foto.base}
                    formatos={["avif", "webp"]}
                    fallback="jpg"
                    alt={p.foto.alt}
                    width={480}
                    height={480}
                    loading="lazy"
                    className="mb-8 h-28 w-28 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="border-line text-fg-2 mb-8 flex h-28 w-28 items-center justify-center rounded-full border text-[28px] font-semibold tracking-[-0.02em]"
                  >
                    {p.monograma}
                  </div>
                )}
                <Eyebrow className="text-fg-2 mb-3">{p.areas}</Eyebrow>
                <h3 className="mb-6 text-[clamp(28px,3.2vw,40px)] leading-none font-bold tracking-[-0.03em]">
                  {p.nome}
                </h3>
                {p.paragrafos.map((t, i) => (
                  <p
                    key={t}
                    className={i === 0 ? "mb-5 text-[18px] leading-[1.6]" : "text-fg-2 mb-8 text-[18px] leading-[1.6]"}
                  >
                    {t}
                  </p>
                ))}
                <LinkSeta href={p.link.href}>{p.link.label}</LinkSeta>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
          <div>
            <Eyebrow className="text-fg-2 mb-6">{s.conviccao.kicker}</Eyebrow>
            <h2 className="display-h2">
              {s.conviccao.titulo[0]}
              <br />
              {s.conviccao.titulo[1]}
            </h2>
          </div>
          <p className="max-w-[52ch] text-[20px] leading-[1.6] md:pt-10">{s.conviccao.texto}</p>
        </div>
      </Section>

      <CtaFinal cta={s.cta} href={waGeral()} origem="sobre" />
    </main>
  );
}
