import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Glow } from "@/components/ui/glow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { diagnosticoUrl } from "@/lib/diagnostico";
import { cn } from "@/lib/utils";

/**
 * Ato 2b — Diagnóstico aberto (carvão, bloco Spotlite com glow). Logo depois do problema: antes de
 * conhecer o método, a pessoa já pode fazer o teste de IA para negócios na Spotlite.
 */
export function Diagnostico() {
  const s = home.diagnostico;
  return (
    <Section
      tom="carvao"
      id="diagnostico"
      data-ato="diagnostico"
      className="gutter z-[1] overflow-hidden pt-[140px] pb-[120px]"
    >
      <Glow posicao="superior-direita" opacidade={0.12} />
      <div className="container-site relative grid gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16">
        <div>
          <Eyebrow className="text-cinza mb-6 flex flex-wrap items-center gap-x-3">
            <MarcaFerramenta qual="spotlite" className="tracking-normal normal-case" /> {s.kicker}
          </Eyebrow>
          <h2 className="display-h2 mb-6">
            {s.titulo[0]}
            <br />
            {s.titulo[1]}
          </h2>
          <p className="text-cinza mb-6 max-w-[52ch] text-[20px] leading-[1.6]">{s.lead}</p>
          <p className="text-neutro mb-10 max-w-[52ch] text-[17px] leading-[1.5] font-semibold">{s.paraQuem}</p>
          <Botao href={diagnosticoUrl("home")} origem="home-diagnostico">
            {s.cta}
          </Botao>
          <p className="text-cinza mt-4 max-w-[52ch] text-[14px] leading-[1.5]">{s.nota}</p>
        </div>
        <div className="md:pt-10">
          <ol className="flex flex-col">
            {s.etapas.map((e, i) => (
              <li
                key={e.numero}
                className={cn(
                  "border-line grid grid-cols-[64px_1fr] items-baseline gap-6 border-t py-6",
                  i === s.etapas.length - 1 && "border-b",
                )}
              >
                <span aria-hidden="true" className="text-verde text-[32px] leading-none font-bold tracking-[-0.03em]">
                  {e.numero}
                </span>
                <span className="text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">{e.texto}</span>
              </li>
            ))}
          </ol>
          <p className="text-cinza mt-6 text-[14px] leading-[1.5]">{s.aviso}</p>
        </div>
      </div>
    </Section>
  );
}
