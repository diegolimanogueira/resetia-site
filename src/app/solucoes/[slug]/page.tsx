import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { CategoriasAgentes } from "@/components/sections/shared/CategoriasAgentes";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { FaixaDiagnostico } from "@/components/sections/shared/FaixaDiagnostico";
import { HeroPagina } from "@/components/sections/shared/HeroPagina";
import { Botao } from "@/components/ui/botao";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { categoriasAgentes, consolidacao } from "@/content/agentes";
import { site } from "@/content/site";
import { seoSolucao, solucaoPorSlug, solucoes } from "@/content/solucoes";
import { ferramentas } from "@/content/tecnologias";
import type { Solucao } from "@/content/types";
import { waDiagnostico, waUrl } from "@/lib/whatsapp";

// Export estático: só as cinco soluções existem; qualquer outro slug é 404 (scan e workshops têm rota própria).
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

const d = solucoes.detalhe;

/** Lista com marcador verde (benefícios, desafios, entregáveis). */
function Lista({ itens, marcador = "✓", colunas = false }: { itens: string[]; marcador?: string; colunas?: boolean }) {
  return (
    <ul className={colunas ? "grid gap-x-8 gap-y-3 sm:grid-cols-2" : "flex flex-col gap-3"}>
      {itens.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-[1.55]">
          <span aria-hidden="true" className="text-verde shrink-0">
            {marcador}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Bloco próprio de cada solução: formatos (Champions), Fluxa (Processos), frentes e consolidação (Agent Factory),
 * governança que acelera (Governance), indicadores (Performance). */
function Extras({ s }: { s: Solucao }) {
  return (
    <>
      {s.formatos ? (
        <Section tom="escuro">
          <div className="container-site">
            <CabecalhoSecao kicker={s.formatos.kicker} titulo={s.formatos.titulo} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.formatos.itens.map((f) => (
                <li key={f.titulo} className="border-line bg-painel border p-6">
                  <h3 className="mb-2 text-[20px] font-bold tracking-[-0.02em]">{f.titulo}</h3>
                  <p className="text-fg-2 text-[15px] leading-[1.6]">{f.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      {s.tecnologia ? (
        <Section tom="escuro">
          <div className="container-site border-line bg-painel grid gap-6 border p-[26px] md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 md:p-10">
            <div>
              <p className="eyebrow text-verde mb-3 text-[11px]">{d.tecnologia}</p>
              <MarcaFerramenta qual={s.tecnologia.ferramenta} className="text-[30px] tracking-[-0.04em]" />
            </div>
            <p className="text-fg-2 max-w-[62ch] text-[16px] leading-[1.7]">{s.tecnologia.texto}</p>
            <a
              href={ferramentas[s.tecnologia.ferramenta].site.href}
              target="_blank"
              rel="noopener"
              data-cta={`solucao-${s.slug}-${s.tecnologia.ferramenta}-site`}
              className="text-verde hover:text-fg text-[14px] font-bold whitespace-nowrap"
            >
              {ferramentas[s.tecnologia.ferramenta].site.label} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Section>
      ) : null}

      {s.slug === "agent-factory" ? (
        <>
          <Section tom="escuro" id="casos-de-uso">
            <div className="container-site">
              <CabecalhoSecao kicker={consolidacao.categorias.kicker} titulo={consolidacao.categorias.titulo} />
              <CategoriasAgentes
                icones={categoriasAgentes.map((c) => (
                  <Icone key={c.area} id={c.area} tamanho={18} />
                ))}
              />
              <div className="mt-8">
                <LinkSeta href={consolidacao.catalogo.href} seta="→">
                  {consolidacao.catalogo.label}
                </LinkSeta>
              </div>
            </div>
          </Section>
          <Section>
            <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
              <div>
                <Eyebrow>{consolidacao.kicker}</Eyebrow>
                <h2 className="display-h2">
                  <Linhas itens={consolidacao.titulo} />
                </h2>
              </div>
              <div>
                {consolidacao.paragrafos.map((p) => (
                  <p key={p} className="text-fg-2 mb-5 text-[18px] leading-[1.75]">
                    {p}
                  </p>
                ))}
                <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                  {consolidacao.passos.map((p) => (
                    <li key={p} className="border-line bg-painel border px-4 py-3 text-[14px] font-semibold">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        </>
      ) : null}

      {s.destaque ? (
        <Section tom="escuro">
          <div className="container-site max-w-[1000px] text-center">
            <h2 className="display-h2 mb-6">
              <Linhas itens={s.destaque.titulo} />
            </h2>
            <p className="text-fg-2 mx-auto max-w-[680px] text-[19px] leading-[1.7]">{s.destaque.texto}</p>
          </div>
        </Section>
      ) : null}

      {s.indicadores ? (
        <Section tom="escuro">
          <div className="container-site">
            <CabecalhoSecao kicker={s.indicadores.kicker} titulo={s.indicadores.titulo} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.indicadores.itens.map((i) => (
                <li key={i.area} className="border-line bg-painel border p-6">
                  <h3 className="text-verde mb-2 text-[18px] font-bold">{i.area}</h3>
                  <p className="text-fg-2 text-[15px] leading-[1.6]">{i.texto}</p>
                </li>
              ))}
            </ul>
            <p className="text-fg-2 mt-6 max-w-[80ch] text-[13px] leading-[1.6]">{s.indicadores.aviso}</p>
          </div>
        </Section>
      ) : null}
    </>
  );
}

/** Landing page comercial de uma das cinco soluções. */
export default async function SolucaoPagina({ params }: PageProps<"/solucoes/[slug]">) {
  const s = solucaoPorSlug((await params).slug);
  if (!s) notFound();
  const relacionadas = s.relacionadas.map((slug) => solucaoPorSlug(slug)!).filter(Boolean);
  const cta = { label: s.cta.label, href: waUrl(s.cta.mensagem) };

  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <HeroPagina
        antes={
          <LinkSeta href={d.voltar.href} voltar>
            {d.voltar.label}
          </LinkSeta>
        }
        kicker={s.nome}
        icone={s.icone}
        titulo={<Linhas itens={s.headline} />}
        tituloMenor
        lead={s.descricao[0]}
      >
        {s.descricao.slice(1).map((p) => (
          <p key={p} className="text-fg-2 mb-8 max-w-[760px] text-[18px] leading-[1.7]">
            {p}
          </p>
        ))}
        <div className="flex flex-wrap gap-3">
          <Botao href={cta.href} origem={`solucao-${s.slug}`}>
            {cta.label}
          </Botao>
          <Botao href={waDiagnostico()} origem={`diagnostico-solucao-${s.slug}`} variante="secundario">
            {site.ctaDiagnostico}
          </Botao>
        </div>
      </HeroPagina>

      <Section tom="escuro">
        <div className="container-site">
          <CabecalhoSecao kicker={d.problemas.kicker} titulo={d.problemas.titulo} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.problemas.map((p, i) => (
              <li key={p} className="border-line bg-painel border p-6">
                <span className="text-verde text-[12px] tracking-[.15em]">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-[17px] leading-[1.5]">{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="container-site grid gap-[30px] md:grid-cols-[minmax(0,1fr)_420px] md:gap-[90px]">
          <div>
            <Eyebrow>{d.beneficios.kicker}</Eyebrow>
            <h2 className="display-h2 mb-10">
              <Linhas itens={d.beneficios.titulo} />
            </h2>
            <Lista itens={s.beneficios} colunas />
          </div>
          <aside className="border-line bg-painel h-max border p-[30px]">
            <Icone id={s.icone} tamanho={32} />
            <div className="border-line mt-6 mb-5 border-b pb-5">
              <h3 className="eyebrow text-verde text-[11px]">{d.paraQuem}</h3>
              <p className="text-fg/85 mt-2 text-[16px] leading-[1.6]">{s.paraQuem}</p>
            </div>
            <div className="mb-6">
              <h3 className="eyebrow text-verde text-[11px]">{d.medimos}</h3>
              <p className="text-fg/85 mt-2 text-[16px] leading-[1.6]">{s.medimos}</p>
            </div>
            <Botao href={cta.href} origem={`solucao-${s.slug}-quadro`} className="w-full whitespace-normal">
              {cta.label}
            </Botao>
          </aside>
        </div>
      </Section>

      <Extras s={s} />

      <Section tom="contraste">
        <div className="container-site">
          <CabecalhoSecao kicker={d.entregaveis.kicker} titulo={d.entregaveis.titulo} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.entregaveis.map((e, i) => (
              <li key={e} className="border-line bg-painel flex items-start gap-4 border p-5">
                <span className="text-verde text-[20px] leading-none font-bold tracking-[-0.03em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[16px] leading-[1.45]">{e}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="container-site">
          <CabecalhoSecao kicker={d.etapas.kicker} titulo={d.etapas.titulo} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {s.etapas.map((e) => (
              <li key={e.numero} className="border-line bg-painel border px-6 py-[30px]">
                <span className="text-verde text-[11px] tracking-[.1em]">{e.numero}</span>
                <h3 className="mt-5 mb-2 text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">{e.titulo}</h3>
                <p className="text-fg-2 text-[14px] leading-[1.6]">{e.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-[50px]">
            <FaixaDiagnostico
              texto={d.diagnostico.titulo}
              apoio={d.diagnostico.texto}
              origem={`solucao-${s.slug}-faixa`}
            />
          </div>
        </div>
      </Section>

      <Section tom="escuro">
        <div className="container-site">
          <Eyebrow>{d.relacionadas.kicker}</Eyebrow>
          <h2 className="display-h2 mb-[35px]">
            <Linhas itens={d.relacionadas.titulo} />
          </h2>
          <GradeSolucoes itens={relacionadas} />
        </div>
      </Section>

      <CtaFinal
        cta={solucoes.cta}
        origem={`solucao-${s.slug}-final`}
        primario={{ label: cta.label, href: cta.href, origem: `solucao-${s.slug}-final` }}
      />
    </main>
  );
}
