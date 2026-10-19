import type { Metadata } from "next";
import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { Glow } from "@/components/ui/glow";
import { Imagem } from "@/components/ui/imagem";
import { LinkSeta } from "@/components/ui/link-seta";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { seo, site } from "@/content/site";
import { spotlite } from "@/content/spotlite";
import type { Passo } from "@/content/types";
import { cn } from "@/lib/utils";
import { waSpotlite } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.spotlite.title,
  description: seo.spotlite.description,
  alternates: { canonical: "/spotlite/" },
};

/** Lista numerada no padrão do site: numeral decorativo à esquerda, título em negrito e texto. */
function ListaNumerada({ passos, numeralClass }: { passos: Passo[]; numeralClass: string }) {
  return (
    <ol className="flex flex-col">
      {passos.map((p, i) => (
        <li
          key={p.numero}
          className={cn(
            "border-line grid grid-cols-[64px_1fr] gap-6 border-t py-7",
            i === passos.length - 1 && "border-b",
          )}
        >
          <span
            aria-hidden="true"
            data-decorativo
            className={cn("text-[32px] leading-none font-bold tracking-[-0.03em]", numeralClass)}
          >
            {p.numero}
          </span>
          <p className="text-fg-2 text-[18px] leading-[1.6]">
            <strong className="text-fg font-semibold">{p.titulo}</strong> {p.texto}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function Spotlite() {
  const s = spotlite;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      <Section tom="carvao" className="gutter overflow-hidden pt-[140px] pb-[100px]">
        <Glow posicao="superior-direita-alta" />
        <div className="container-site relative grid items-center gap-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
          <div>
            <h1 className="mb-6 text-[clamp(56px,9vw,128px)] leading-[.9] font-bold tracking-[-0.04em]">
              {s.hero.titulo}
            </h1>
            <p className="text-cinza mb-10 max-w-[56ch] text-[20px] leading-[1.6]">{s.hero.lead}</p>
            <div className="flex flex-wrap gap-3.5">
              <Botao href={s.hero.ctaSite.href} origem="spotlite-site">
                {s.hero.ctaSite.label}
              </Botao>
              <Botao href={waSpotlite()} variante="secundario" origem="spotlite">
                {site.ctaSpotlite}
              </Botao>
            </div>
          </div>
          <div className="bg-carvao relative aspect-[4/5] overflow-hidden">
            {/* [FALTA] bússola em alta resolução: original tem 215×341 */}
            <Imagem
              base="/brand/bussola"
              alt={s.hero.imagemAlt}
              width={215}
              height={341}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="display-h2">{s.comoFunciona.titulo}</h2>
          <ListaNumerada passos={s.comoFunciona.passos} numeralClass="text-carvao/25" />
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site grid items-start gap-16 md:grid-cols-2">
          <div>
            <h2 className="display-h2 mb-12">{s.recebe.titulo}</h2>
            <div className="flex flex-col gap-7">
              {s.recebe.itens.map((item) => (
                <Ponto
                  key={item.texto}
                  destaque={item.destaque || undefined}
                  texto={item.texto}
                  cor={item.verde ? "verde" : "cinza"}
                  className="max-w-none"
                />
              ))}
            </div>
          </div>
          <SpotliteCard card={s.cardExemplo} tamanho="lg" />
        </div>
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="display-h2">{s.metodo.titulo}</h2>
          <div>
            <ListaNumerada passos={s.metodo.passos} numeralClass="text-verde" />
            <p className="text-fg-2 mt-8 max-w-[68ch] text-[15px] leading-[1.6]">{s.metodo.referencias}</p>
          </div>
        </div>
      </Section>

      <Section tom="carvao" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="display-h2">{s.paraQuem.titulo}</h2>
          <div>
            <p className="text-neutro mb-10 max-w-[56ch] text-[20px] leading-[1.5] font-semibold">{s.paraQuem.valor}</p>
            <ul className="flex flex-col">
              {s.paraQuem.itens.map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    "border-line border-t py-6 text-[22px] leading-[1.3] font-semibold tracking-[-0.01em]",
                    i === s.paraQuem.itens.length - 1 && "border-b",
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-cinza mt-6 text-[16px]">{s.paraQuem.nota}</p>
          </div>
        </div>
      </Section>

      <Section tom="neutro" className="gutter py-[120px]">
        <div className="container-site grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <h2 className="display-h2 mb-6">{s.fluxa.titulo}</h2>
            <MarcaFerramenta qual="fluxa" className="text-[24px]" />
          </div>
          <div>
            <p className="text-fg-2 mb-10 max-w-[62ch] text-[18px] leading-[1.6]">{s.fluxa.texto}</p>
            <div className="mb-10 flex flex-col gap-6">
              {s.fluxa.pontos.map((p) => (
                <Ponto key={p.destaque} destaque={p.destaque} texto={p.texto} />
              ))}
            </div>
            <LinkSeta href={s.fluxa.link.href}>{s.fluxa.link.label}</LinkSeta>
          </div>
        </div>
      </Section>

      <CtaFinal titulo={s.cta.titulo} botao={s.cta.botao} href={waSpotlite()} origem="spotlite-final" />
    </main>
  );
}
