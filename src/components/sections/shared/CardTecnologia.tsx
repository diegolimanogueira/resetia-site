import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { LinkSeta } from "@/components/ui/link-seta";
import { tecnologias, ferramentas } from "@/content/tecnologias";
import type { Ferramenta } from "@/content/types";

/** Card de uma tecnologia própria: marca, tag, título, resumo, nota "Na Reset:" e links (site oficial e solução). */
export function CardTecnologia({
  id,
  origem,
  completo = false,
}: {
  id: Ferramenta;
  origem: string;
  completo?: boolean;
}) {
  const f = ferramentas[id];
  return (
    <article className="border-line bg-painel flex flex-col border p-[26px] md:p-10">
      <div className="flex items-center justify-between gap-4">
        <MarcaFerramenta qual={id} className="text-[30px] tracking-[-0.04em]" />
        <span className="border-verde/40 text-verde border p-[7px] text-[10px] tracking-[.1em] uppercase">{f.tag}</span>
      </div>
      <h3 className="mt-[45px] mb-[18px] text-[30px] leading-[1.2] font-bold tracking-[-0.02em] md:mt-[60px] md:text-[34px]">
        {f.titulo}
      </h3>
      <p className="text-fg mb-3 max-w-[510px] text-[17px] leading-[1.6]">{f.resumo}</p>
      {completo ? <p className="text-fg-2 max-w-[510px] text-[16px] leading-[1.6]">{f.texto}</p> : null}
      <p className="border-verde text-fg-2 my-[26px] border-l-2 pl-3 text-[13px] leading-[1.6]">{f.nota}</p>
      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3">
        <a
          href={f.site.href}
          target="_blank"
          rel="noopener"
          data-cta={`${origem}-${id}-site`}
          className="text-verde hover:text-fg text-[14px] font-bold"
        >
          {f.site.label} <span aria-hidden="true">↗</span>
        </a>
        {completo ? (
          <LinkSeta href={f.solucao.href} seta="→">
            {tecnologias.apoia} {f.solucao.label}
          </LinkSeta>
        ) : null}
      </div>
    </article>
  );
}
