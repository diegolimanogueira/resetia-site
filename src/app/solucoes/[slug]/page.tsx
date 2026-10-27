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
import { waUrl } from "@/lib/whatsapp";

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
const numero = (i: number) => String(i + 1).padStart(2, "0");

/** Agent Factory: as três frentes em abas, logo depois dos benefícios. */
function Exemplos() {
  const e = consolidacao.exemplos;
  return (
    <Section tom="escuro" id="casos-de-uso">
      <div className="container-site">
        <CabecalhoSecao kicker={e.kicker} titulo={e.titulo} />
        <CategoriasAgentes
          icones={categoriasAgentes.map((c) => (
            <Icone key={c.area} id={c.area} tamanho={18} />
          ))}
        />
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-fg-2 max-w-[80ch] text-[13px] leading-[1.6]">{e.aviso}</p>
          <LinkSeta href={consolidacao.catalogo.href} seta="→" className="shrink-0">
            {consolidacao.catalogo.label}
          </LinkSeta>
        </div>
      </div>
    </Section>
  );
}

/** Blocos depois dos entregáveis: Fluxa BPM (Processos), ferramentas redundantes (Agent Factory), medição (Performance). */
function DepoisDosEntregaveis({ s }: { s: Solucao }) {
  const t = s.tecnologia;
  const m = s.medicao;
  return (
    <>
      {t ? (
        <Section>
          <div className="container-site border-line bg-painel grid gap-8 border p-[26px] md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-[70px] md:p-[50px]">
            <div>
              <Eyebrow>{t.kicker}</Eyebrow>
              <h2 className="display-h2 mb-6">
                <Linhas itens={t.titulo} />
              </h2>
              <MarcaFerramenta qual={t.ferramenta} className="text-[30px] tracking-[-0.04em]" />
            </div>
            <div>
              {t.paragrafos.map((p) => (
                <p key={p} className="text-fg-2 mb-4 text-[17px] leading-[1.75]">
                  {p}
                </p>
              ))}
              <Botao
                href={ferramentas[t.ferramenta].site.href}
                variante="secundario"
                origem={`solucao-${s.slug}-${t.ferramenta}-site`}
                className="mt-4"
              >
                {t.cta}
              </Botao>
            </div>
          </div>
        </Section>
      ) : null}

      {s.slug === "agent-factory" ? (
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
      ) : null}

      {m ? (
        <Section id="medicao">
          <div className="container-site">
            <CabecalhoSecao kicker={m.kicker} titulo={m.titulo} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {m.itens.map((i) => (
                <li key={i.area} className="border-line bg-painel border p-6">
                  <h3 className="text-verde mb-2 text-[18px] font-bold">{i.area}</h3>
                  <p className="text-fg-2 text-[15px] leading-[1.6]">{i.texto}</p>
                </li>
              ))}
            </ul>
            <p className="text-fg-2 mt-6 max-w-[90ch] text-[13px] leading-[1.6]">{m.aviso}</p>
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
  const href = waUrl(s.cta.mensagem);

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
          <Botao href={href} origem={`solucao-${s.slug}`}>
            {s.cta.label}
          </Botao>
          <Botao href={s.ctaSecundario.href} variante="secundario" seta="↓">
            {s.ctaSecundario.label}
          </Botao>
        </div>
      </HeroPagina>

      <Section tom="escuro" id="sobre">
        <div className="container-site grid gap-[30px] md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:gap-[90px]">
          <div>
            <Eyebrow>{d.sobre}</Eyebrow>
            <h2 className="text-[clamp(30px,3.4vw,48px)] leading-[1.08] font-bold tracking-[-0.03em]">
              <Linhas itens={s.sobre.titulo} />
            </h2>
          </div>
          <div className="text-fg-2 flex flex-col gap-4 text-[18px] leading-[1.75]">
            {s.sobre.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section id="beneficios">
        <div className="container-site">
          <CabecalhoSecao kicker={d.beneficios} titulo={s.beneficios.titulo} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.beneficios.itens.map((b, i) => (
              <li key={b.titulo} className="border-line bg-painel border p-6 md:p-7">
                <span className="text-verde text-[13px] font-bold tracking-[.12em]">{numero(i)}</span>
                <h3 className="mt-4 mb-2 text-[21px] leading-[1.2] font-bold tracking-[-0.02em]">{b.titulo}</h3>
                <p className="text-fg-2 text-[15px] leading-[1.6]">{b.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {s.slug === "agent-factory" ? <Exemplos /> : null}

      <Section tom="contraste" id="entregaveis">
        <div className="container-site">
          <CabecalhoSecao kicker={d.entregaveis} titulo={s.entregaveis.titulo} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.entregaveis.itens.map((e) => (
              <li
                key={e}
                className="border-line bg-painel flex items-start gap-3 border p-5 text-[16px] leading-[1.45]"
              >
                <span aria-hidden="true" className="text-verde">
                  ✓
                </span>
                {e}
              </li>
            ))}
          </ul>
          {s.entregaveis.nota ? (
            <p className="border-verde text-fg mt-6 max-w-[90ch] border-l-2 pl-4 text-[15px] leading-[1.6]">
              {s.entregaveis.nota}
            </p>
          ) : null}
        </div>
      </Section>

      <DepoisDosEntregaveis s={s} />

      <Section tom="escuro" id="para-quem">
        <div className="container-site grid gap-[30px] md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-[90px]">
          <div>
            <Eyebrow>{d.paraQuem}</Eyebrow>
            <h2 className="display-h2">
              <Linhas itens={s.paraQuem.titulo} />
            </h2>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {s.paraQuem.itens.map((p) => (
              <li key={p} className="border-line flex gap-3 border-t pt-4 text-[16px] leading-[1.55]">
                <span aria-hidden="true" className="text-verde">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="como-funciona">
        <div className="container-site">
          <h2 className="eyebrow text-verde mb-6">{d.etapas}</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {s.etapas.map((e) => (
              <li key={e.numero} className="border-line bg-painel border px-6 py-[30px]">
                <span className="text-verde text-[28px] leading-none font-bold tracking-[-0.03em]">{e.numero}</span>
                <h3 className="mt-5 mb-2 text-[20px] leading-[1.2] font-bold tracking-[-0.02em]">{e.titulo}</h3>
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
        cta={{ titulo: s.ctaFinal.titulo, apoio: s.ctaFinal.texto, botao: site.ctaDiagnostico }}
        menor
        origem={`solucao-${s.slug}-final`}
        primario={{ label: s.ctaFinal.botao, href, origem: `solucao-${s.slug}-final` }}
      />
    </main>
  );
}
