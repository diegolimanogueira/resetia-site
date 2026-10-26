import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { nomeDaArea } from "@/content/agentes";
import { home } from "@/content/home";

/** Marketing, Vendas e CS: papel na jornada, exemplos de agentes e link para o catálogo já filtrado. */
export function Areas() {
  const a = home.areas;
  return (
    <Section id="areas">
      <div className="container-site">
        <Eyebrow>{a.kicker}</Eyebrow>
        <h2 className="display-h2">
          <Linhas itens={a.titulo} />
        </h2>
        <div className="mt-[50px] grid gap-[15px] md:grid-cols-3">
          {a.itens.map((item) => (
            <Link
              key={item.area}
              href={`/agentes-de-ia/?area=${item.area}`}
              className="group border-line bg-painel hover:border-verde hover:text-fg flex min-h-[340px] flex-col border p-[30px] transition-[transform,border-color] duration-200 motion-safe:hover:-translate-y-1 md:p-[35px]"
            >
              <Icone id={item.area} tamanho={40} />
              <h3 className="mt-[30px] text-[29px] leading-[1.15] font-bold tracking-[-0.02em]">
                {nomeDaArea(item.area)}
              </h3>
              <p className="text-verde mt-1 text-[14px] font-semibold">{item.papel}</p>
              <p className="text-fg-2 mt-4 text-[16px] leading-[1.6]">{item.texto}</p>
              <p className="eyebrow text-fg-2 mt-6 mb-2 text-[11px]">{a.exemplosRotulo}</p>
              <ul className="text-fg/85 flex flex-wrap gap-2 text-[13px]">
                {item.exemplos.map((e) => (
                  <li key={e} className="border-line border px-2.5 py-1">
                    {e}
                  </li>
                ))}
              </ul>
              <span className="text-verde mt-auto pt-6 text-[13px] font-bold">
                {a.link} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
