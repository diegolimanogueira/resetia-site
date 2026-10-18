import { site } from "@/content/site";
import type { Tom } from "@/content/types";

// PLACEHOLDER brand: logos em PNG/WebP exportados do manual. Trocar por SVG quando o Diego enviar.
const arquivos: Record<Tom, string> = {
  carvao: "/brand/logo-dark",
  neutro: "/brand/logo-light",
};

/** Logo horizontal. `tom` é o fundo em que ela aparece. */
export function Logo({ tom, altura = 40, className }: { tom: Tom; altura?: number; className?: string }) {
  const base = arquivos[tom];
  const largura = Math.round(altura * 4.45);
  return (
    <picture className={className}>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.png`}
        alt={site.logoAlt}
        width={largura}
        height={altura}
        style={{ height: altura, width: "auto" }}
        className="block"
        decoding="async"
      />
    </picture>
  );
}
