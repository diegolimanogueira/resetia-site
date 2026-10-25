import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
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

/** Página de produto do reset360 (produto-*.html): topo, "O que é" com o quadro lateral, outras soluções, fecho. */
export default async function Solucao({ params }: PageProps<"/solucoes/[slug]">) {
  const s = solucaoPorSlug((await params).slug);
  if (!s) notFound();
  const d = solucoes.detalhe;
  const outras = solucoes.lista.filter((o) => o.slug !== s.slug);

  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina
        antes={
          <LinkSeta href={d.voltar.href} voltar>
            {d.voltar.label}
          </LinkSeta>
        }
        kicker={d.kicker}
        titulo={
          <>
            {s.nome}
            <span aria-hidden="true" className="text-verde">
              .
            </span>
          </>
        }
        lead={s.frase}
      />

      <Section>
        <div className="container-site grid gap-[30px] md:grid-cols-[minmax(0,1fr)_440px] md:gap-[100px]">
          <div>
            <Eyebrow>{d.oQueE}</Eyebrow>
            <h2 className="display-h2 mb-8">
              <Linhas itens={d.titulo} />
            </h2>
            <p className="text-fg-2 text-[19px] leading-[1.8]">{s.descricao}</p>
          </div>
          <aside className="border-line bg-painel h-max border p-[30px]">
            <div className="border-line mb-5 border-b pt-2.5 pb-5">
              <h3 className="eyebrow text-verde text-[11px]">{d.campos.paraQuem}</h3>
              <p className="text-fg/85 mt-2 text-[16px] leading-[1.6]">{s.paraQuem}</p>
            </div>
            <div className="border-line mb-5 border-b pt-2.5 pb-5">
              <h3 className="eyebrow text-verde text-[11px]">{d.campos.entregas}</h3>
              <ul className="text-fg/85 mt-2 flex flex-col gap-1 text-[16px] leading-[1.5]">
                {s.entregas.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="border-line mb-5 border-b pt-2.5 pb-5">
              <h3 className="eyebrow text-verde text-[11px]">{d.campos.medimos}</h3>
              <p className="text-fg/85 mt-2 text-[16px] leading-[1.6]">{s.medimos}</p>
            </div>
            <Botao href={waSolucao(s.nome)} origem={`solucao-${s.slug}`} className="w-full">
              {d.cta}
            </Botao>
          </aside>
        </div>

        {s.relacionado ? (
          <div className="container-site">
            <div className="border-verde/40 mt-[60px] flex flex-col gap-5 border p-[25px] md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="mb-2 text-[25px] leading-[1.2] font-bold tracking-[-0.02em]">{s.relacionado.titulo}</h3>
                <p className="text-fg-2 max-w-[56ch] text-[16px] leading-[1.6]">{s.relacionado.texto}</p>
              </div>
              <LinkSeta href={s.relacionado.link.href}>{s.relacionado.link.label}</LinkSeta>
            </div>
          </div>
        ) : null}
      </Section>

      <Section tom="contraste">
        <div className="container-site">
          <Eyebrow>{d.continuar.kicker}</Eyebrow>
          <h2 className="display-h2 mb-[35px]">
            <Linhas itens={d.continuar.titulo} />
          </h2>
          <GradeSolucoes itens={outras} compacto />
        </div>
      </Section>

      <CtaFinal cta={solucoes.cta} href={waSolucao(s.nome)} origem={`solucao-${s.slug}-final`} />
    </main>
  );
}
