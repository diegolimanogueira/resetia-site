import { Eyebrow } from "@/components/ui/eyebrow";
import { Imagem } from "@/components/ui/imagem";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { clientes } from "@/content/clientes";
import { cn } from "@/lib/utils";

/**
 * Clientes: um card por empresa, com a logo em cor e o que a Reset fez lá. No desktop, os dois primeiros
 * (os de mais entregas) dividem a primeira linha e os outros três, a segunda.
 */
export function Clientes() {
  const c = clientes;
  return (
    <Section tom="escuro" id="clientes">
      <div className="container-site">
        <Eyebrow>{c.kicker}</Eyebrow>
        <h2 className="display-h2">
          <Linhas itens={c.titulo} />
        </h2>
        <ul className="mt-[50px] grid gap-[15px] md:grid-cols-6">
          {c.lista.map((cliente, i) => (
            <li
              key={cliente.id}
              className={cn(
                "border-line bg-painel flex flex-col border p-[30px] md:p-[35px]",
                i < 2 ? "md:col-span-3" : "md:col-span-2",
              )}
            >
              <h3 className="flex h-[60px] items-center">
                <Imagem
                  base={cliente.logo.base}
                  alt={cliente.nome}
                  width={cliente.logo.largura}
                  height={cliente.logo.altura}
                  formatos={[]}
                  loading="lazy"
                />
              </h3>
              <ul className="border-line mt-6 flex flex-col gap-3 border-t pt-6 text-[16px] leading-[1.5]">
                {cliente.entregas.map((entrega) => (
                  <li key={entrega} className="flex gap-3">
                    <span aria-hidden="true" className="bg-verde-vivo mt-[9px] h-1.5 w-1.5 shrink-0" />
                    {entrega}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
