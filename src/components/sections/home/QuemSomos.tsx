import { RetratoFundador } from "@/components/sections/shared/RetratoFundador";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { sobre } from "@/content/sobre";

/** Quem está por trás, em faixa curta: uma frase, os dois fundadores com o cargo e o link para a página Sobre. */
export function QuemSomos() {
  const q = home.quemSomos;
  return (
    <Section tom="escuro" className="py-[60px] md:py-[80px]">
      <div className="container-site grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-[90px]">
        <div>
          <Eyebrow>{q.kicker}</Eyebrow>
          <p className="max-w-[620px] text-[22px] leading-[1.45] font-semibold tracking-[-0.01em]">{q.texto}</p>
          <LinkSeta href={q.link.href} className="mt-6">
            {q.link.label}
          </LinkSeta>
        </div>
        <ul className="flex flex-col gap-5 sm:flex-row sm:gap-10 md:flex-col md:gap-5">
          {sobre.fundadores.pessoas.map((p) => (
            <li key={p.nome} className="flex items-center gap-4">
              <RetratoFundador
                foto={"foto" in p ? p.foto : undefined}
                monograma={p.monograma}
                className="size-[64px] shrink-0 text-[22px]"
              />
              <div>
                <p className="text-[18px] leading-tight font-bold tracking-[-0.02em]">{p.nome}</p>
                <p className="text-verde mt-1 text-[13px] font-semibold">{p.cargo}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
