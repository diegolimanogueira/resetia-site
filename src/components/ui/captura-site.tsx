import { Imagem } from "@/components/ui/imagem";

type Props = { base: string; alt: string; legenda: string; href: string };

/** Captura real da página inicial de um produto, com legenda e link. Moldura fina, sem radius, no tom da seção. */
export function CapturaSite({ base, alt, legenda, href }: Props) {
  return (
    <figure className="border-line bg-fg/[0.02] border">
      <Imagem
        base={base}
        formatos={["avif", "webp"]}
        fallback="jpg"
        alt={alt}
        width={1440}
        height={900}
        loading="lazy"
        className="block h-auto w-full"
      />
      <figcaption className="border-line eyebrow text-fg-2 flex items-center justify-between gap-4 border-t px-5 py-3">
        <span>{legenda}</span>
        <a href={href} target="_blank" rel="noopener" className="text-fg hover:text-verde tracking-normal normal-case">
          Abrir o site →
        </a>
      </figcaption>
    </figure>
  );
}
