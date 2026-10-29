import { site } from "@/content/site";
import { asset } from "@/lib/asset";
import { varianteMarca } from "@/lib/tema";

// PLACEHOLDER brand: logo em PNG/WebP exportada do manual. Trocar por SVG quando o Diego enviar.
// A versão segue o tema do site (logo-dark no carvão, logo-light no neutro); o rodapé, sempre em carvão, pede a dark.

/** Logo horizontal da Reset IA na versão do tema do site (ou na pedida). */
export function Logo({
  altura = 40,
  variante = varianteMarca,
  className,
}: {
  altura?: number;
  variante?: "dark" | "light";
  className?: string;
}) {
  const base = `/brand/logo-${variante}`;
  const largura = Math.round(altura * 4.45);
  return (
    <picture className={className}>
      <source srcSet={asset(`${base}.webp`)} type="image/webp" />
      <img
        src={asset(`${base}.png`)}
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
