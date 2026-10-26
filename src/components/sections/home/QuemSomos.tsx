import { RetratoFundador } from "@/components/sections/shared/RetratoFundador";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { sobre } from "@/content/sobre";

/** Quem está por trás: a mensagem dos dois fundadores e os retratos com a especialidade de cada um. */
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
          {q.paragrafos.map((p) => (
            <p key={p} className="text-fg-2 mb-5 max-w-[520px] text-[18px] leading-[1.7]">
              {p}
            </p>
          ))}
          <LinkSeta href={q.link.href} className="mt-3">
            {q.link.label}
          </LinkSeta>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {sobre.fundadores.pessoas.map((p) => (
            <li key={p.nome} className="border-line bg-painel flex flex-col items-start border p-6">
              <RetratoFundador
                foto={"foto" in p ? p.foto : undefined}
                monograma={p.monograma}
                className="size-[96px] text-[32px]"
              />
              <p className="mt-5 text-[22px] font-bold tracking-[-0.02em]">{p.nome}</p>
              <p className="text-fg-2 mt-1 text-[14px] leading-[1.5]">{p.especialidade}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
