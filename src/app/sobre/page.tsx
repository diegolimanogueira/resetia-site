import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { sobre } from "@/content/sobre";
import { cn } from "@/lib/utils";
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
      <Section tom="neutro" className="gutter pt-[120px] pb-16">
        <div className="container-site">
          <h1 className="text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">{s.hero.titulo}</h1>
        </div>
      </Section>

      <Section tom="neutro" className="gutter pb-[120px]">
        <div className="container-site grid items-start gap-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          {/* [FALTA] foto do Diego em 4:5 */}
          <div
            role="img"
            aria-label={s.diego.fotoAlt}
            className="bg-carvao text-cinza eyebrow flex aspect-[4/5] items-end p-6"
          >
            {s.diego.fotoPlaceholder}
          </div>
          <div>
            <h2 className="mb-2 text-[clamp(32px,3.6vw,48px)] leading-none font-bold tracking-[-0.03em]">
              {s.diego.nome}
            </h2>
            <p className="text-fg-2 mb-8 text-[20px] leading-[1.5]">{s.diego.subtitulo}</p>
            {s.diego.paragrafos.map((p, i) => (
              <p
                key={i}
                className={cn(
                  "max-w-[62ch] text-[18px] leading-[1.6]",
                  i === s.diego.paragrafos.length - 1 ? "mb-8" : "mb-5",
                )}
              >
                {p}
              </p>
            ))}
            <div className="flex gap-7">
              {s.diego.links.map((l) => (
                <LinkSeta key={l.href} href={l.href}>
                  {l.label}
                </LinkSeta>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="display-h2">{s.comoTrabalhamos.titulo}</h2>
          <div className="flex flex-col gap-10">
            {s.comoTrabalhamos.principios.map((p) => (
              <Ponto
                key={p.destaque}
                destaque={p.destaque}
                texto={p.texto}
                className="max-w-none text-[20px] leading-[1.5]"
              />
            ))}
          </div>
        </div>
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="display-h2">{s.metodos.titulo}</h2>
          <ul className="flex flex-col">
            {s.metodos.itens.map((m, i) => (
              <li
                key={m.nome}
                className={cn(
                  "border-line text-fg-2 border-t py-6 text-[18px] leading-[1.6]",
                  i === s.metodos.itens.length - 1 && "border-b",
                )}
              >
                <strong className="text-fg font-semibold tracking-[.02em]">{m.nome}</strong> — {m.texto}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaFinal titulo={s.cta.titulo} botao={s.cta.botao} href={waGeral()} origem="sobre" />
      <Eyebrow className="sr-only">{s.hero.titulo}</Eyebrow>
    </main>
  );
}
