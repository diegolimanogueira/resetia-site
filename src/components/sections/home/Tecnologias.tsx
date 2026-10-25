import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { ferramentas } from "@/content/tecnologias";
import type { Ferramenta } from "@/content/types";

const ordem: Ferramenta[] = ["spotlite", "fluxa"];

/** Tecnologias próprias (reset360 #tecnologias): Spotlite e Fluxa BPM lado a lado, com link para o site de cada uma. */
export function Tecnologias() {
  const t = home.tecnologias;
  return (
    <Section tom="contraste" id="tecnologias">
      <div className="container-site">
        <CabecalhoSecao kicker={t.kicker} titulo={t.titulo} lead={t.lead} />
        <div className="grid gap-5 md:grid-cols-2">
          {ordem.map((id) => {
            const f = ferramentas[id];
            return (
              <article key={id} className="border-line bg-painel border p-[26px] md:p-10">
                <div className="flex items-center justify-between gap-4">
                  <MarcaFerramenta qual={id} className="text-[30px] tracking-[-0.04em]" />
                  <span className="border-verde/40 text-verde border p-[7px] text-[10px] tracking-[.1em] uppercase">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-[45px] mb-[18px] text-[30px] leading-[1.2] font-bold tracking-[-0.02em] md:mt-[75px] md:text-[34px]">
                  {f.titulo}
                </h3>
                <p className="text-fg-2 max-w-[510px] text-[16px] leading-[1.6]">{f.texto}</p>
                <p className="border-verde text-fg-2 my-[26px] border-l-2 pl-3 text-[13px] leading-[1.6]">{f.nota}</p>
                <a
                  href={f.site.href}
                  target="_blank"
                  rel="noopener"
                  data-cta={`home-${id}-site`}
                  className="text-verde hover:text-fg text-[14px] font-bold"
                >
                  {f.site.label} <span aria-hidden="true">↗</span>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
