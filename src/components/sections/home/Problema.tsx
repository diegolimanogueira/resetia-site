import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** O problema e o que a Reset faz: a segunda linha do título fica apagada; sete frentes de ajuda em grade. */
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
      <div className="container-site mt-[65px]">
        <h3 className="eyebrow text-fg-2 mb-5">{p.ajudamos}</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {p.itens.map((item, i) => (
            <li key={item} className="border-line border-t pt-5 pr-4">
              <span className="text-verde block text-[28px] leading-none font-bold tracking-[-0.03em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 block text-[16px] leading-[1.5]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
