import { Botao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Linhas } from "@/components/ui/linhas";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { diagnostico } from "@/content/diagnostico";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { waDiagnostico } from "@/lib/whatsapp";

/** RESET Scan em destaque: a principal porta de entrada. Botão abre o WhatsApp; o link explica como funciona. */
export function Scan() {
  const s = home.scan;
  return (
    <Section id="diagnostico">
      <div className="container-site border-verde/40 grid gap-10 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.14)_0%,rgba(0,230,118,0)_55%)] p-[26px] md:grid-cols-[1.1fr_1fr] md:gap-[70px] md:p-[56px]">
        <div>
          <Eyebrow className="flex items-center gap-2.5">
            <Icone id="diagnostico" tamanho={18} />
            {s.kicker}
          </Eyebrow>
          <h2 className="display-h2 mb-6">
            <Linhas itens={s.titulo} />
          </h2>
          <p className="text-fg-2 mb-8 max-w-[560px] text-[18px] leading-[1.7]">{s.lead}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Botao href={waDiagnostico()} origem="diagnostico-home">
              {site.ctaDiagnostico}
            </Botao>
            <LinkSeta href={s.link.href} seta="→">
              {s.link.label}
            </LinkSeta>
          </div>
        </div>
        <div>
          <p className="eyebrow text-fg-2 mb-4 text-[11px]">{diagnostico.avaliamos.kicker}</p>
          <ul className="grid gap-2">
            {diagnostico.avaliamos.itens.map((item) => (
              <li key={item} className="border-line bg-painel flex items-start gap-3 border px-5 py-4 text-[15px]">
                <span aria-hidden="true" className="text-verde">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
