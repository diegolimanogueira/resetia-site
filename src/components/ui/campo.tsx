import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Entrada de texto no tom da seção: painel, linha cinza, foco verde (o outline vem do :focus-visible global). */
export const classesEntrada =
  "border-line bg-painel text-fg w-full border px-4 py-3 text-[16px] leading-[1.4] transition-colors duration-200 hover:border-fg/50 aria-invalid:border-fg";

const descricao = (id: string, apoio?: ReactNode, erro?: string) =>
  [apoio ? `${id}-apoio` : null, erro ? `${id}-erro` : null].filter(Boolean).join(" ") || undefined;

/** Mensagem de erro de campo: texto, não só cor (a paleta não tem vermelho). */
function ErroCampo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="border-fg mt-2 border-l-2 pl-2.5 text-[13px] font-semibold">
      {children}
    </p>
  );
}

/** Rótulo + input + apoio + erro, ligados por id e aria-describedby. */
export function Campo({
  id,
  rotulo,
  apoio,
  erro,
  className,
  ...input
}: { id: string; rotulo: string; apoio?: ReactNode; erro?: string; className?: string } & Omit<
  ComponentProps<"input">,
  "id" | "className"
>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[14px] font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao(id, apoio, erro)}
        className={classesEntrada}
        {...input}
      />
      {apoio ? (
        <p id={`${id}-apoio`} className="text-fg-2 mt-1.5 text-[13px] leading-[1.5]">
          {apoio}
        </p>
      ) : null}
      {erro ? <ErroCampo id={`${id}-erro`}>{erro}</ErroCampo> : null}
    </div>
  );
}

/** Caixa de seleção com o rótulo ao lado (consentimentos, desafios). */
export function Marcador({
  rotulo,
  className,
  ...input
}: { rotulo: ReactNode; className?: string } & Omit<ComponentProps<"input">, "type" | "className">) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-[15px] leading-[1.5]", className)}>
      <input type="checkbox" className="accent-verde mt-1 size-4 shrink-0 cursor-pointer" {...input} />
      <span>{rotulo}</span>
    </label>
  );
}
