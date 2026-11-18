import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** O problema: a segunda linha do título fica apagada. O que a Reset faz vem na seção seguinte, uma vez só. */
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
    </Section>
  );
}
