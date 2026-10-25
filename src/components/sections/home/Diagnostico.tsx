import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { diagnosticoUrl } from "@/lib/diagnostico";

/** Teste de IA para negócios da Spotlite: texto e botão à esquerda, as quatro etapas à direita. */
export function Diagnostico() {
  const d = home.diagnostico;
  return (
    <Section id="teste-de-ia">
      <div className="container-site border-line grid gap-10 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_55%)] p-[26px] md:grid-cols-[1.1fr_1fr] md:gap-[70px] md:p-[50px]">
        <div>
          <Eyebrow>{d.kicker}</Eyebrow>
          <h2 className="display-h2 mb-6">
            <Linhas itens={d.titulo} />
          </h2>
          <p className="text-fg-2 mb-4 max-w-[560px] text-[18px] leading-[1.7]">{d.lead}</p>
          <p className="text-fg mb-8 text-[15px]">{d.paraQuem}</p>
          <Botao href={diagnosticoUrl("home")} origem="home-diagnostico">
            {d.cta}
          </Botao>
          <p className="text-fg-2 mt-5 max-w-[520px] text-[13px] leading-[1.6]">{d.nota}</p>
          <p className="text-fg-2 mt-1 text-[13px] leading-[1.6]">{d.aviso}</p>
        </div>
        <ol className="grid content-center gap-3 sm:grid-cols-2">
          {d.etapas.map((e) => (
            <li key={e.numero} className="border-line bg-painel border px-6 py-7">
              <span className="text-verde block text-[32px] leading-none font-bold tracking-[-0.03em]">{e.numero}</span>
              <span className="mt-4 block text-[18px] font-semibold">{e.texto}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
