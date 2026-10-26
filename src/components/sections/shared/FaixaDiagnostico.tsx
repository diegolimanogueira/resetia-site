import { Botao } from "@/components/ui/botao";
import { Icone } from "@/components/ui/icone";
import { site } from "@/content/site";
import { waDiagnostico } from "@/lib/whatsapp";

/** Faixa curta com o diagnóstico gratuito: depois das soluções e dentro das páginas de produto. */
export function FaixaDiagnostico({ texto, apoio, origem }: { texto: string; apoio?: string; origem: string }) {
  return (
    <div className="border-verde/40 flex flex-col gap-5 border bg-[radial-gradient(circle_at_0%_50%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_60%)] p-[25px] md:flex-row md:items-center md:justify-between md:p-[30px]">
      <div className="flex items-start gap-4">
        <Icone id="diagnostico" tamanho={28} className="mt-0.5" />
        <div>
          <p className="text-[19px] leading-[1.35] font-bold">{texto}</p>
          {apoio ? <p className="text-fg-2 mt-1 text-[15px]">{apoio}</p> : null}
        </div>
      </div>
      <Botao href={waDiagnostico()} origem={`diagnostico-${origem}`} className="shrink-0">
        {site.ctaDiagnostico}
      </Botao>
    </div>
  );
}
