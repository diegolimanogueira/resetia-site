import { site } from "@/content/site";
import { asset } from "@/lib/asset";

// PLACEHOLDER brand: logo em PNG/WebP exportada do manual. Trocar por SVG quando o Diego enviar.
// O site é todo escuro (reset360), então só a versão para fundo carvão é usada.
const base = "/brand/logo-dark";

/** Logo horizontal da Reset IA sobre fundo escuro. */
export function Logo({ altura = 40, className }: { altura?: number; className?: string }) {
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
