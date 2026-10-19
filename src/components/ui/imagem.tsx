import type { ComponentProps } from "react";
import { asset } from "@/lib/asset";

type Props = {
  /** Caminho sem extensão em /public, ex.: "/brand/porta". */
  base: string;
  alt: string;
  width: number;
  height: number;
  formatos?: Array<"avif" | "webp">;
  fallback?: "png" | "jpg";
} & Omit<ComponentProps<"img">, "src" | "alt" | "width" | "height">;

/** <picture> com AVIF/WebP e fallback PNG. Em export estático não há otimizador do Next. */
export function Imagem({ base, alt, width, height, formatos = ["webp"], fallback = "png", ...rest }: Props) {
  return (
    <picture>
      {formatos.map((f) => (
        <source key={f} srcSet={asset(`${base}.${f}`)} type={`image/${f}`} />
      ))}
      <img src={asset(`${base}.${fallback}`)} alt={alt} width={width} height={height} decoding="async" {...rest} />
    </picture>
  );
}
