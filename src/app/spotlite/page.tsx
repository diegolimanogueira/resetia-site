import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Glow } from "@/components/ui/glow";
import { Imagem } from "@/components/ui/imagem";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { spotlite } from "@/content/spotlite";
import { cn } from "@/lib/utils";
import { waSpotlite } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.spotlite.title,
  description: seo.spotlite.description,
  alternates: { canonical: "/spotlite/" },
};

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
            <p className="text-cinza max-w-[52ch] text-[20px] leading-[1.6]">{s.hero.lead}</p>
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
          <ol className="flex flex-col">
            {s.comoFunciona.passos.map((p, i) => (
              <li
                key={p.numero}
                className={cn(
                  "border-line grid grid-cols-[64px_1fr] gap-6 border-t py-7",
                  i === s.comoFunciona.passos.length - 1 && "border-b",
                )}
              >
                <span
                  aria-hidden="true"
                  data-decorativo
                  className="text-carvao/25 text-[32px] leading-none font-bold tracking-[-0.03em]"
                >
                  {p.numero}
                </span>
                <p className="text-fg-2 text-[18px] leading-[1.6]">
                  <strong className="text-fg font-semibold">{p.titulo}</strong> {p.texto}
                </p>
              </li>
            ))}
          </ol>
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
          <h2 className="display-h2">{s.paraQuem.titulo}</h2>
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
        </div>
      </Section>

      <CtaFinal titulo={s.cta.titulo} botao={s.cta.botao} href={waSpotlite()} origem="spotlite" />
    </main>
  );
}
