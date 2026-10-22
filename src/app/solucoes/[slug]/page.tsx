import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { ListaSolucoes } from "@/components/sections/shared/ListaSolucoes";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
import { ferramentas } from "@/content/tecnologias";
import { waSolucao } from "@/lib/whatsapp";

// Export estático: só as sete soluções existem; qualquer outro slug é 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return solucoes.lista.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/solucoes/[slug]">): Promise<Metadata> {
  const s = solucaoPorSlug((await params).slug);
  if (!s) return {};
  const meta = seoSolucao(s);
  return { title: meta.title, description: meta.description, alternates: { canonical: `/solucoes/${s.slug}/` } };
}

export default async function Solucao({ params }: PageProps<"/solucoes/[slug]">) {
  const s = solucaoPorSlug((await params).slug);
  if (!s) notFound();
  const d = solucoes.detalhe;
  const ferramenta = s.ferramenta ? ferramentas[s.ferramenta] : null;
  const outras = solucoes.lista.filter((o) => o.slug !== s.slug);

  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-20">
        <div className="container-site">
          <LinkSeta href={d.voltar.href} voltar className="mb-12">
            {d.voltar.label}
          </LinkSeta>
          <Eyebrow className="text-fg-2 mb-6">{d.kicker}</Eyebrow>
          <h1 className="mb-6 text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">
            {s.nome}
            <span aria-hidden="true" className="text-verde">
              .
            </span>
          </h1>
          <p className="text-fg-2 max-w-[48ch] text-[20px] leading-[1.6]">{s.frase}</p>
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <Eyebrow className="text-fg-2 mb-6">{d.oQueE}</Eyebrow>
            <h2 className="display-h2 mb-8">
              {d.titulo[0]}
              <br />
              {d.titulo[1]}
            </h2>
            <p className="max-w-[48ch] text-[20px] leading-[1.6]">{s.descricao}</p>
          </div>
          <div className="flex flex-col gap-10">
            <Campo rotulo={d.campos.paraQuem}>
              <p>{s.paraQuem}</p>
            </Campo>
            <Campo rotulo={d.campos.entregas}>
              <ul className="flex flex-col gap-1.5">
                {s.entregas.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Campo>
            <Campo rotulo={d.campos.medimos}>
              <p>{s.medimos}</p>
            </Campo>
            {s.ferramenta && ferramenta ? (
              <Campo rotulo={d.campos.ferramenta}>
                <p className="mb-1 flex flex-wrap items-center gap-x-3">
                  <MarcaFerramenta qual={s.ferramenta} /> <span className="text-fg-2">{ferramenta.titulo}</span>
                </p>
                <p className="text-fg-2 mb-4">{ferramenta.texto}</p>
                <LinkSeta href={`/tecnologias#${s.ferramenta}`}>{ferramenta.site.label}</LinkSeta>
              </Campo>
            ) : null}
            <div>
              <Botao href={waSolucao(s.nome)} origem={`solucao-${s.slug}`}>
                {d.cta}
              </Botao>
            </div>
          </div>
        </div>

        {s.relacionado ? (
          <div className="container-site mt-20">
            <div className="border-line grid gap-6 border p-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <h3 className="mb-3 text-[clamp(24px,2.6vw,32px)] leading-[1.1] font-bold tracking-[-0.02em]">
                  {s.relacionado.titulo}
                </h3>
                <p className="text-fg-2 max-w-[52ch] text-[18px] leading-[1.6]">{s.relacionado.texto}</p>
              </div>
              <LinkSeta href={s.relacionado.link.href}>{s.relacionado.link.label}</LinkSeta>
            </div>
          </div>
        ) : null}
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-6">{d.continuar.kicker}</Eyebrow>
          <h2 className="display-h2 mb-16">
            {d.continuar.titulo[0]}
            <br />
            {d.continuar.titulo[1]}
          </h2>
          <ListaSolucoes itens={outras} />
        </div>
      </Section>

      <CtaFinal cta={solucoes.cta} href={waSolucao(s.nome)} origem={`solucao-${s.slug}-final`} />
    </main>
  );
}
