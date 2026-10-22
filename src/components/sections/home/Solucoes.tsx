import { ListaSolucoes } from "@/components/sections/shared/ListaSolucoes";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { solucoes } from "@/content/solucoes";

/** Ato 4 — As sete soluções (carvão). Âncora do botão "Explorar o Reset 360". */
export function Solucoes() {
  const s = home.solucoes;
  return (
    <Section tom="carvao" id="solucoes" data-ato="solucoes" data-wipe className="gutter z-[1] pt-[140px] pb-[120px]">
      <div className="container-site">
        <Eyebrow className="text-fg-2 mb-6">{s.kicker}</Eyebrow>
        <div className="mb-16 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
          <h2 className="display-h2">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <p className="text-fg-2 max-w-[48ch] text-[18px] leading-[1.6]">{s.lead}</p>
        </div>
        <ListaSolucoes itens={solucoes.lista} />
      </div>
    </Section>
  );
}
