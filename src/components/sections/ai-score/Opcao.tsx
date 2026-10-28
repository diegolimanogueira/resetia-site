import type { ChangeEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Alternativa do questionário: input nativo (radio ou checkbox) dentro de um rótulo em forma de card.
 * O input continua visível e focável (teclado e leitor de tela funcionam sem truque); o card marcado ganha
 * borda verde. `compacta` vira pílula, para escalas e segmentação.
 */
export function Opcao({
  tipo = "radio",
  name,
  value,
  checked,
  onChange,
  rotulo,
  apoio,
  compacta = false,
  discreta = false,
  disabled,
}: {
  tipo?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  rotulo: ReactNode;
  apoio?: string;
  compacta?: boolean;
  /** "Não sei responder": mesmo comportamento, menos peso visual. */
  discreta?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start border transition-colors duration-200",
        "has-[:checked]:border-verde hover:border-neutro/50 has-[:checked]:hover:border-verde",
        compacta ? "gap-2.5 px-4 py-3 text-[14px]" : "gap-4 px-5 py-4 text-[16px] md:px-6",
        discreta ? "border-line border-dashed bg-transparent" : "border-line bg-painel",
        disabled && "hover:border-line cursor-not-allowed opacity-50",
      )}
    >
      <input
        type={tipo}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn("accent-verde shrink-0 cursor-pointer", compacta ? "mt-[2px] size-4" : "mt-[3px] size-[18px]")}
      />
      <span className="leading-[1.45]">
        <span className={cn("block", discreta && "text-fg-2")}>{rotulo}</span>
        {apoio ? <span className="text-fg-2 mt-1 block text-[13px] leading-[1.5]">{apoio}</span> : null}
      </span>
    </label>
  );
}
