import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: ReactNode;
  variante?: "primario" | "secundario";
  tamanho?: "md" | "sm";
  /** Identifica a origem do clique para analytics (ex.: "hero", "fecho"). */
  origem?: string;
  /** Efeito magnético (padrão: só no primário). */
  magnetico?: boolean;
  /** Seta que aparece no hover (padrão: primário tamanho md). */
  seta?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">;

const base =
  "group inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap transition-[color,border-color] duration-200";
const tamanhos = {
  md: "text-[16px] px-[26px] py-4",
  sm: "text-[14px] px-[18px] py-[10px]",
};
const variantes = {
  primario: "bg-verde text-carvao hover:text-carvao",
  secundario: "border-[1.5px] border-neutro/40 text-neutro font-medium hover:border-neutro hover:text-neutro",
};

/** Botão pill do manual. Primário verde (magnético, seta no hover), secundário contorno. Externos abrem em nova aba. */
export function Botao({
  href,
  children,
  variante = "primario",
  tamanho = "md",
  origem,
  magnetico = variante === "primario",
  seta = variante === "primario" && tamanho === "md",
  className,
  ...rest
}: Props) {
  const classes = cn(base, tamanhos[tamanho], variantes[variante], className);
  const externo = /^https?:\/\//.test(href);
  const ancora = href.startsWith("#");

  const conteudo = seta ? (
    <>
      <span className="inline-block transition-transform duration-250 group-hover:translate-x-0.5 motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="inline-block w-0 -translate-x-1.5 overflow-hidden opacity-0 transition-all duration-250 group-hover:w-[22px] group-hover:translate-x-1.5 group-hover:opacity-100 motion-reduce:transition-none"
      >
        →
      </span>
    </>
  ) : (
    children
  );

  const link =
    externo || ancora ? (
      <a
        href={href}
        className={classes}
        data-cta={origem}
        {...(externo ? { target: "_blank", rel: "noopener" } : {})}
        {...rest}
      >
        {conteudo}
      </a>
    ) : (
      <Link href={href} className={classes} data-cta={origem} {...rest}>
        {conteudo}
      </Link>
    );

  return magnetico ? <Magnetic>{link}</Magnetic> : link;
}
