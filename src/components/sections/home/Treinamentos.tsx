import { Line } from "@/components/motion/Line";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Ato 5 — Treinamentos (carvão). Linhas de tabela, não cards. Hover revela a descrição. */
export function Treinamentos() {
  const s = home.treinamentos;
  return (
    <Section tom="carvao" data-ato="treinamentos" data-wipe className="gutter z-[1] pt-[140px] pb-[120px]">
      <div className="container-site">
        <h2 className="display-h2 mb-16 max-w-[16ch]">{s.titulo}</h2>
        <div
          className="eyebrow text-cinza hidden grid-cols-[1.1fr_1.4fr_1fr] gap-8 pb-3.5 pl-6 md:grid"
          aria-hidden="true"
        >
          {s.colunas.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <Line />
        <ul>
          {s.programas.map((p) => (
            <li key={p.nome} className="group border-line relative border-b py-7 pl-6">
              <span
                aria-hidden="true"
                className="group-hover:bg-verde absolute top-7 bottom-7 left-0 w-0.5 bg-transparent transition-colors duration-300"
              />
              <div className="grid items-baseline gap-2 md:grid-cols-[1.1fr_1.4fr_1fr] md:gap-8">
                <h3 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.02em]">{p.nome}</h3>
                <p className="text-cinza text-[16px] leading-[1.5]">
                  <span className="md:sr-only">{s.colunas[1]}: </span>
                  {p.quem}
                </p>
                <p className="text-neutro text-[15px] leading-[1.5]">
                  <span className="md:sr-only">{s.colunas[2]}: </span>
                  {p.leva}
                </p>
              </div>
              <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-[350ms] ease-out md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="text-neutro/70 mt-4 max-w-[68ch] text-[16px] leading-[1.6]">{p.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <LinkSeta href={s.link.href}>{s.link.label}</LinkSeta>
        </div>
      </div>
    </Section>
  );
}
