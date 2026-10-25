import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Problema (reset360 .split + .stats-grid): a segunda linha do título fica apagada; três pilares numerados. */
export function Problema() {
  const p = home.problema;
  return (
    <Section tom="escuro">
      <div className="container-site grid gap-[30px] md:grid-cols-2 md:gap-[90px]">
        <div>
          <Eyebrow>{p.kicker}</Eyebrow>
          <h2 className="display-h2">
            {p.titulo[0]} <br />
            <span className="text-fg-2">{p.titulo[1]}</span>
          </h2>
        </div>
        <div className="text-fg-2 text-[19px] leading-[1.8]">
          <p className="mb-6">{p.texto}</p>
          <p>
            {p.pergunta.antes} <strong className="text-fg">{p.pergunta.destaque}</strong>
          </p>
        </div>
      </div>
      <div className="container-site mt-[65px] grid gap-3 sm:grid-cols-3 sm:gap-6">
        {p.pilares.map((pilar) => (
          <div key={pilar.numero} className="border-line border-t pt-[25px]">
            <strong className="text-verde block text-[44px] leading-[1.2] font-bold tracking-[-0.03em]">
              {pilar.numero}
            </strong>
            <span className="text-[17px]">{pilar.texto}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
