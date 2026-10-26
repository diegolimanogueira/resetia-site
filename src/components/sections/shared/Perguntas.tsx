import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import type { Pergunta, Tom } from "@/content/types";

/** Perguntas frequentes com <details> nativo: abre e fecha sem JS e funciona no teclado. */
export function Perguntas({
  kicker,
  titulo,
  itens,
  tom = "carvao",
}: {
  kicker: string;
  titulo: readonly string[];
  itens: Pergunta[];
  tom?: Tom;
}) {
  return (
    <Section tom={tom} id="perguntas">
      <div className="container-site grid gap-10 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-[90px]">
        <div>
          <Eyebrow>{kicker}</Eyebrow>
          <h2 className="text-[clamp(32px,3.4vw,50px)] leading-[1.06] font-bold tracking-[-0.03em]">
            <Linhas itens={titulo} />
          </h2>
        </div>
        <div className="border-line border-t">
          {itens.map((p) => (
            <details key={p.pergunta} className="group border-line border-b">
              <summary className="hover:text-verde flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[18px] font-semibold transition-colors [&::-webkit-details-marker]:hidden">
                {p.pergunta}
                <span
                  aria-hidden="true"
                  className="text-verde mt-0.5 text-[22px] leading-none transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-fg-2 max-w-[62ch] pb-6 text-[16px] leading-[1.7]">{p.resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
