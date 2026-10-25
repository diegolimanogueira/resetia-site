import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";

/** Kicker + H2 à esquerda e lead à direita, alinhados pela base (reset360 .heading-row). */
export function CabecalhoSecao({ kicker, titulo, lead }: { kicker: string; titulo: readonly string[]; lead?: string }) {
  return (
    <>
      <Eyebrow>{kicker}</Eyebrow>
      <div className="mb-[50px] flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-20">
        <h2 className="display-h2 flex-1">
          <Linhas itens={titulo} />
        </h2>
        {lead ? <p className="text-fg-2 max-w-[420px] text-[16px] leading-[1.6] md:flex-[.65]">{lead}</p> : null}
      </div>
    </>
  );
}
