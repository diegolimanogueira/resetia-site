import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { Imagem } from "@/components/ui/imagem";
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
        <div className="container-site">
          <div className="grid items-start gap-8 md:grid-cols-[112px_minmax(0,1fr)] md:gap-12">
            <Imagem
              base={s.diego.foto.base}
              formatos={["avif", "webp"]}
              fallback="jpg"
              alt={s.diego.foto.alt}
              width={480}
              height={480}
              className="h-28 w-28 rounded-full object-cover"
            />
            <div className="max-w-[68ch]">
              <h2 className="mb-2 text-[clamp(32px,3.6vw,48px)] leading-none font-bold tracking-[-0.03em]">
                {s.diego.nome}
              </h2>
              <p className="text-fg-2 mb-6 text-[20px] leading-[1.5]">{s.diego.subtitulo}</p>
              <p className="mb-8 text-[18px] leading-[1.6]">{s.diego.descricao}</p>
              <div className="mb-8 flex flex-col gap-5">
                {s.diego.destaques.map((d) => (
                  <Ponto key={d.destaque} destaque={d.destaque} texto={d.texto} className="max-w-none text-[17px]" />
                ))}
              </div>
              <div className="flex gap-7">
                {s.diego.links.map((l) => (
                  <LinkSeta key={l.href} href={l.href}>
                    {l.label}
                  </LinkSeta>
                ))}
              </div>
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
                {"href" in m && m.href ? (
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener"
                    className="text-fg hover:border-verde border-b border-transparent font-semibold tracking-[.02em]"
                  >
                    {m.nome}
                  </a>
                ) : (
                  <strong className="text-fg font-semibold tracking-[.02em]">{m.nome}</strong>
                )}{" "}
                — {m.texto}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaFinal titulo={s.cta.titulo} botao={s.cta.botao} href={waGeral()} origem="sobre" />
    </main>
  );
}
