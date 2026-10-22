import { Line } from "@/components/motion/Line";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { nomeDaArea } from "@/content/agentes";
import { home } from "@/content/home";

/** Ato 6 — Onde a IA encontra a receita (neutro): Marketing, Vendas e CS, cada um levando ao catálogo filtrado. */
export function Areas() {
  const s = home.areas;
  return (
    <Section tom="neutro" id="areas" data-ato="areas" data-wipe className="gutter z-[1] pt-[140px] pb-[120px]">
      <div className="container-site">
        <Eyebrow className="text-fg-2 mb-6">{s.kicker}</Eyebrow>
        <h2 className="display-h2 mb-16">
          {s.titulo[0]}
          <br />
          {s.titulo[1]}
        </h2>
        <div className="grid gap-14 md:grid-cols-[1fr_1px_1fr_1px_1fr] md:gap-10">
          {s.itens.map((a, i) => (
            <div key={a.area} className="contents">
              {i > 0 ? <Line eixo="y" className="hidden md:block" /> : null}
              <div>
                <h3 className="mb-4 text-[28px] leading-[1.1] font-semibold tracking-[-0.02em]">
                  {nomeDaArea(a.area)}
                </h3>
                <p className="text-fg-2 mb-6 text-[18px] leading-[1.6]">{a.texto}</p>
                <LinkSeta href={`/agentes?area=${a.area}`}>{s.link}</LinkSeta>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
