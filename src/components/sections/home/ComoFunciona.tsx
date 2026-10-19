import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { Imagem } from "@/components/ui/imagem";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { cn } from "@/lib/utils";

/** Ato 4 — Como funciona (neutro). Bússola fixa à esquerda, três passos à direita. */
export function ComoFunciona() {
  const s = home.comoFunciona;
  return (
    <Section tom="neutro" data-ato="como-funciona" data-stick className="gutter sticky top-0 z-0 pt-[140px] pb-[120px]">
      <div className="container-site grid items-stretch gap-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <div className="bg-carvao relative aspect-[2/3] max-h-[520px] min-h-[320px] self-start overflow-hidden md:sticky md:top-[120px]">
          {/* [FALTA] bússola em alta resolução: original tem 215×341 */}
          <Imagem
            base="/brand/bussola"
            alt={s.imagemAlt}
            width={215}
            height={341}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
        <div>
          <h2 className="display-h2 mb-14">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <ol className="flex flex-col">
            {s.passos.map((p, i) => (
              <li
                key={p.numero}
                className={cn(
                  "border-line grid grid-cols-[64px_1fr] gap-6 border-t py-7",
                  i === s.passos.length - 1 && "border-b",
                )}
              >
                {/* Numeral decorativo: a ordem já está na <ol>. Verde sobre neutro é escolha do manual (ver docs/decisions). */}
                <span
                  aria-hidden="true"
                  data-decorativo
                  className="text-verde text-[32px] leading-none font-bold tracking-[-0.03em]"
                >
                  {p.numero}
                </span>
                <div>
                  <h3 className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">
                    {p.titulo}
                    {p.ferramenta ? <MarcaFerramenta qual={p.ferramenta} className="text-[15px]" /> : null}
                  </h3>
                  <p className="text-fg-2 max-w-[58ch] text-[17px] leading-[1.6]">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <LinkSeta href={s.link.href}>{s.link.label}</LinkSeta>
          </div>
        </div>
      </div>
    </Section>
  );
}
