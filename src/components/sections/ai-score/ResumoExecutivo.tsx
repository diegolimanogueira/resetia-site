import { comQuem } from "@/lib/ai-score/quem";
import type { Sintese } from "@/lib/ai-score/sintese";

/**
 * Primeira parte do resultado: responde, em seis itens, qual é o cenário, o que merece atenção, em que respostas isso
 * se apoia, qual a consequência declarada (e qual ainda é hipótese), qual a primeira ação e o que validar antes de
 * escolher uma solução. Os textos vêm prontos na devolutiva (a mesma da tela, do PDF e do e-mail).
 */
export function ResumoExecutivo({ resumo, quem }: { resumo: Sintese["resumo"]; quem: string }) {
  return (
    <section
      aria-labelledby="resumo-executivo"
      data-resumo-executivo
      className="border-verde/40 break-inside-avoid border bg-[radial-gradient(circle_at_0%_0%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_55%)] p-[24px] md:p-[36px]"
    >
      <h2 id="resumo-executivo" className="eyebrow text-verde mb-6 text-[11px]">
        {resumo.titulo}
      </h2>
      <dl className="grid gap-x-12 gap-y-7 md:grid-cols-2">
        {resumo.itens.map((i) => (
          <div key={i.id} data-item={i.id} className="break-inside-avoid">
            <dt className="eyebrow text-fg-2 mb-2 text-[11px]">{i.rotulo}</dt>
            <dd className="text-[16px] leading-[1.6]">
              {i.texto ? comQuem(i.texto, quem) : null}
              {i.lista ? (
                <ul className="grid gap-1.5">
                  {i.lista.map((l) => (
                    <li key={l} className="flex gap-2">
                      <span aria-hidden="true" className="text-verde">
                        ·
                      </span>
                      {l}
                    </li>
                  ))}
                </ul>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
