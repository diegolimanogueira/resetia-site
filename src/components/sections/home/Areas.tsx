import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { nomeDaArea } from "@/content/agentes";
import { home } from "@/content/home";

/** Áreas (reset360 #areas): Marketing, Vendas e CS, cada uma abre o catálogo já filtrado. */
export function Areas() {
  const a = home.areas;
  return (
    <Section id="areas">
      <div className="container-site">
        <Eyebrow>{a.kicker}</Eyebrow>
        <h2 className="display-h2">
          <Linhas itens={a.titulo} />
        </h2>
        <div className="mt-[50px] grid gap-[15px] sm:grid-cols-2 md:grid-cols-3">
          {a.itens.map((item) => (
            <Link
              key={item.area}
              href={`/agentes/?area=${item.area}`}
              className="border-line bg-painel hover:border-verde hover:text-fg flex min-h-[300px] flex-col border p-[35px] transition-colors duration-200 md:min-h-[340px]"
            >
              <span aria-hidden="true" className="text-verde text-[65px] leading-none">
                {item.simbolo}
              </span>
              <h3 className="mt-[35px] mb-2 text-[29px] leading-[1.15] font-bold tracking-[-0.02em]">
                {nomeDaArea(item.area)}
              </h3>
              <p className="text-fg-2 text-[16px] leading-[1.6]">{item.texto}</p>
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
