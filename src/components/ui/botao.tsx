import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario";
type Tamanho = "md" | "sm";

type Props = {
  href: string;
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  /** Identifica a origem do clique para analytics (ex.: "hero", "fecho"). */
  origem?: string;
  /** Seta depois do texto. Padrão: ↗ em links externos, nada nos internos. */
  seta?: "↗" | "↓" | null;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">;

const base =
  "inline-flex items-center justify-center gap-3 rounded-full font-semibold whitespace-nowrap transition-[transform,background-color,border-color] duration-200 motion-safe:hover:-translate-y-0.5";
const tamanhos = {
  md: "text-[15px] px-6 py-[14px]",
  sm: "text-[14px] px-[18px] py-[10px]",
};
const variantes = {
  primario: "bg-verde text-carvao hover:text-carvao",
  secundario: "border-[1.5px] border-neutro/40 text-neutro hover:border-neutro hover:text-neutro",
};

const classesBotao = (variante: Variante, tamanho: Tamanho, className?: string) =>
  cn(base, tamanhos[tamanho], variantes[variante], className);

/** Botão pill do manual Reset IA. Primário verde, secundário contorno. Externos abrem em nova aba. */
export function Botao({
  href,
  children,
  variante = "primario",
  tamanho = "md",
  origem,
  seta,
  className,
  ...rest
}: Props) {
  const classes = classesBotao(variante, tamanho, className);
  const externo = /^https?:\/\//.test(href);
  const ancora = href.startsWith("#");
  const marca = seta === undefined ? (externo ? "↗" : null) : seta;

  const conteudo = (
    <>
      {children}
      {marca ? <span aria-hidden="true">{marca}</span> : null}
    </>
  );

  return externo || ancora ? (
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
}

/**
 * O mesmo pill como <button>, para ações na própria página (avançar no questionário, enviar o formulário,
 * baixar o relatório). `type` é obrigatório: nada de submit implícito.
 */
export function BotaoAcao({
  type,
  children,
  variante = "primario",
  tamanho = "md",
  className,
  ...rest
}: {
  type: "button" | "submit";
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  className?: string;
} & Omit<ComponentProps<"button">, "type" | "children" | "className">) {
  return (
    <button
      type={type}
      className={classesBotao(
        variante,
        tamanho,
        cn("cursor-pointer disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0", className),
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
