import Link from "next/link";
import { Fragment } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { nomeDaArea } from "@/content/agentes";
import { home } from "@/content/home";
import { solucoes } from "@/content/solucoes";

/** Colunas do diagrama: área, conexão, área, conexão, área. A linha das conexões verticais usa o mesmo molde. */
const colunas = "md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)_64px_minmax(0,1fr)]";

/**
 * O que é a RESET 360: texto à esquerda e, abaixo, o diagrama da jornada de receita
 * (Marketing → Vendas → Customer Success) ligada às cinco soluções.
 */
export function Reset360() {
  const r = home.reset360;
  const d = r.diagrama;
  return (
    <Section tom="carvao" id="reset-360">
      <div className="container-site">
        <Eyebrow>{r.kicker}</Eyebrow>
        <h2 className="display-h2 max-w-[1100px]">
          <Linhas itens={r.titulo} />
        </h2>
        <div className="text-fg-2 mt-10 grid gap-5 text-[17px] leading-[1.75] md:grid-cols-3 md:gap-10">
          {r.paragrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <figure aria-label={d.rotulo} className="mt-[60px] md:mt-[80px]">
          <ol className={`grid gap-0 ${colunas}`}>
            {d.jornada.map((j, i) => (
              <Fragment key={j.area}>
                <li className="border-line bg-painel border p-6">
                  <Icone id={j.area} tamanho={28} />
                  <p className="mt-5 text-[22px] font-bold tracking-[-0.02em]">{nomeDaArea(j.area)}</p>
                  <p className="text-fg-2 mt-1 text-[15px]">{j.papel}</p>
                </li>
                {i < d.jornada.length - 1 ? (
                  <li aria-hidden="true" className="flex items-center justify-center py-2 md:py-0">
                    <span className="fluxo-y h-8 w-px md:hidden" />
                    <span className="fluxo-x relative hidden h-px w-full md:block">
                      <span className="text-verde absolute -top-[9px] -right-1 text-[14px]">›</span>
                    </span>
                  </li>
                ) : null}
              </Fragment>
            ))}
          </ol>
          <div aria-hidden="true" className={`hidden h-12 ${colunas} md:grid`}>
            {[0, 2, 4].map((c) => (
              <span key={c} className="fluxo-y mx-auto block h-full w-px" style={{ gridColumnStart: c + 1 }} />
            ))}
          </div>
          <div aria-hidden="true" className="flex justify-center py-2 md:hidden">
            <span className="fluxo-y h-8 w-px" />
          </div>
          <div className="border-verde/40 border bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_60%)] p-5 md:p-7">
            <p className="eyebrow text-verde mb-4 text-center">{d.hub}</p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {solucoes.lista.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/solucoes/${s.slug}/`}
                    className="border-line bg-carvao/60 hover:border-verde hover:text-fg flex h-full items-center gap-3 border px-4 py-3 text-[14px] font-semibold transition-colors"
                  >
                    <Icone id={s.icone} tamanho={20} />
                    {s.nome.replace("RESET ", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="text-fg-2 mt-5 text-center text-[14px]">{d.legenda}</figcaption>
        </figure>
      </div>
    </Section>
  );
}
