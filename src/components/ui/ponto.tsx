import { Bar } from "@/components/motion/Bar";
import { cn } from "@/lib/utils";

type Props = {
  destaque?: string;
  texto: string;
  cor?: "verde" | "cinza";
  className?: string;
};

/** Afirmação com traço de 3px à esquerda. O destaque fica em 600 na cor do texto principal. */
export function Ponto({ destaque, texto, cor = "verde", className }: Props) {
  return (
    <div className="grid grid-cols-[3px_1fr] gap-6">
      <Bar cor={cor} />
      <p className={cn("text-fg-2 max-w-[60ch] text-[18px] leading-[1.6]", className)}>
        {destaque ? <strong className="text-fg font-semibold">{destaque}</strong> : null}
        {destaque && !texto.startsWith(",") && !texto.startsWith(" ") ? " " : ""}
        {texto}
      </p>
    </div>
  );
}
