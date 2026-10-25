import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";

/** Método (reset360 .steps): quatro cards "01 / Descobrir". */
export function Metodo() {
  const m = home.metodo;
  return (
    <Section id="metodo">
      <div className="container-site">
        <CabecalhoSecao kicker={m.kicker} titulo={m.titulo} lead={m.lead} />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {m.passos.map((p) => (
            <li key={p.numero} className="border-line bg-painel min-h-[170px] border px-6 py-[34px] sm:min-h-[260px]">
              <span className="text-verde text-[11px] tracking-[.1em] uppercase">
                {p.numero} / {p.etapa}
              </span>
              <h3 className="mt-5 mb-2 text-[26px] leading-[1.15] font-bold tracking-[-0.02em] sm:mt-[42px]">
                {p.titulo}
              </h3>
              <p className="text-fg-2 text-[14px] leading-[1.6]">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
