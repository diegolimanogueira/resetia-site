import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Quem está por trás (reset360 .founder-preview): texto e o monograma É + D. */
export function QuemSomos() {
  const q = home.quemSomos;
  return (
    <Section tom="escuro">
      <div className="container-site grid items-center gap-[30px] md:grid-cols-2 md:gap-[90px]">
        <div>
          <Eyebrow>{q.kicker}</Eyebrow>
          <h2 className="display-h2 mb-8">
            <Linhas itens={q.titulo} />
          </h2>
          <p className="text-fg-2 mb-8 max-w-[500px] text-[18px] leading-[1.7]">{q.texto}</p>
          <LinkSeta href={q.link.href}>{q.link.label}</LinkSeta>
        </div>
        <div
          aria-hidden="true"
          className="border-line bg-painel relative flex h-[260px] items-center justify-center gap-5 border md:h-[360px]"
        >
          <span className="text-verde text-[75px] font-bold">{q.monograma.letras[0]}</span>
          <span className="text-fg-2 text-[45px] font-bold">+</span>
          <span className="text-verde text-[75px] font-bold">{q.monograma.letras[1]}</span>
          <small className="text-fg-2 absolute bottom-[23px] text-[10px] tracking-[.2em] uppercase">
            {q.monograma.legenda}
          </small>
        </div>
      </div>
    </Section>
  );
}
