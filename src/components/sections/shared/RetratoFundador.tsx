import { Imagem } from "@/components/ui/imagem";
import { cn } from "@/lib/utils";

/** Foto redonda do fundador ou, sem foto autorizada, o monograma no mesmo círculo. */
export function RetratoFundador({
  foto,
  monograma,
  className,
}: {
  foto?: { base: string; alt: string };
  monograma: string;
  className?: string;
}) {
  return foto ? (
    <Imagem
      base={foto.base}
      formatos={["avif", "webp"]}
      fallback="jpg"
      alt={foto.alt}
      width={480}
      height={480}
      loading="lazy"
      className={cn("border-verde/40 rounded-full border object-cover", className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "border-verde/40 text-verde bg-escuro grid place-items-center rounded-full border font-bold tracking-[-0.03em]",
        className,
      )}
    >
      {monograma}
    </span>
  );
}
