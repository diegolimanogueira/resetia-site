import type { Metadata } from "next";
import { MarcaFerramenta } from "@/components/brand/MarcaFerramenta";
import { Line } from "@/components/motion/Line";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { FluxaCard } from "@/components/sections/shared/FluxaCard";
import { SpotliteCard } from "@/components/sections/shared/SpotliteCard";
import { Botao } from "@/components/ui/botao";
import { CapturaSite } from "@/components/ui/captura-site";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Glow } from "@/components/ui/glow";
import { ListaNumerada } from "@/components/ui/lista-numerada";
import { Ponto } from "@/components/ui/ponto";
import { Section } from "@/components/ui/section";
import { fluxa } from "@/content/fluxa";
import { produtos } from "@/content/produtos";
import { seo, site } from "@/content/site";
import { spotlite } from "@/content/spotlite";
import { cn } from "@/lib/utils";
import { waFluxa, waSpotlite } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.produtos.title,
  description: seo.produtos.description,
  alternates: { canonical: "/produtos/" },
};

export default function Produtos() {
  const sp = spotlite;
  return (
    <main data-tom="carvao" className="text-fg bg-(--bg)">
      {/* Hero */}
      <Section tom="carvao" className="gutter overflow-hidden pt-[140px] pb-[80px]">
        <Glow posicao="superior-direita-alta" />
        <div className="container-site relative">
          <h1 className="mb-6 text-[clamp(56px,9vw,128px)] leading-[.9] font-bold tracking-[-0.04em]">
            {produtos.hero.titulo}
          </h1>
          <p className="text-cinza mb-10 max-w-[62ch] text-[20px] leading-[1.6]">{produtos.hero.lead}</p>
          <div className="flex flex-wrap gap-3.5">
            {produtos.hero.ancoras.map((a) => (
              <Botao key={a.href} href={a.href} variante="secundario">
                {a.label}
              </Botao>
            ))}
          </div>
        </div>
      </Section>

      {/* Spotlite */}
      <Section tom="carvao" id="spotlite" className="gutter scroll-mt-[72px] pt-[60px] pb-[120px]">
        <div className="container-site">
          <Line className="mb-16" />
          <Eyebrow className="text-cinza mb-4 flex flex-wrap items-center gap-x-3">
            <MarcaFerramenta qual="spotlite" className="tracking-normal normal-case" /> {produtos.spotlite.eyebrow}
          </Eyebrow>
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="display-h2 mb-6">{produtos.spotlite.titulo}</h2>
              <p className="text-cinza mb-6 max-w-[58ch] text-[18px] leading-[1.6]">{sp.hero.lead}</p>
              <p className="text-neutro mb-10 max-w-[52ch] text-[18px] leading-[1.5] font-semibold">
                {sp.paraQuem.valor}
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Botao href={sp.hero.ctaSite.href} origem="spotlite-site">
                  {sp.hero.ctaSite.label}
                </Botao>
                <Botao href={waSpotlite()} variante="secundario" origem="produtos-spotlite">
                  {site.ctaSpotlite}
                </Botao>
              </div>
              <p className="text-cinza mt-4 text-[14px]">{site.semFormulario}</p>
            </div>
            <SpotliteCard card={sp.cardExemplo} tamanho="lg" />
          </div>

          <div className="mt-16">
            <CapturaSite
              base={sp.captura.base}
              alt={sp.captura.alt}
              legenda={sp.captura.legenda}
              href={sp.hero.ctaSite.href}
            />
          </div>

          <div className="mt-24 grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <h3 className="text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
              {sp.recebe.titulo}
            </h3>
            <div className="flex flex-col gap-7">
              {sp.recebe.itens.map((item) => (
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

          <div className="mt-24 grid gap-16 md:grid-cols-2">
            <div>
              <h3 className="mb-8 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
                {sp.comoFunciona.titulo}
              </h3>
              <ListaNumerada passos={sp.comoFunciona.passos} numeralClass="text-neutro/25" />
            </div>
            <div>
              <h3 className="mb-8 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
                {sp.metodo.titulo}
              </h3>
              <ListaNumerada passos={sp.metodo.passos} />
              <p className="text-cinza mt-6 max-w-[62ch] text-[14px] leading-[1.6]">{sp.metodo.referencias}</p>
            </div>
          </div>

          <div className="mt-24 grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <h3 className="text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
              {sp.paraQuem.titulo}
            </h3>
            <div>
              <ul className="flex flex-col">
                {sp.paraQuem.itens.map((item, i) => (
                  <li
                    key={item}
                    className={cn(
                      "border-line border-t py-6 text-[22px] leading-[1.3] font-semibold tracking-[-0.01em]",
                      i === sp.paraQuem.itens.length - 1 && "border-b",
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-cinza mt-6 text-[16px]">{sp.paraQuem.nota}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Fluxa BPM */}
      <Section tom="neutro" id="fluxa" className="gutter scroll-mt-[72px] py-[120px]">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-4 flex flex-wrap items-center gap-x-3">
            <MarcaFerramenta qual="fluxa" className="tracking-normal normal-case" /> {fluxa.eyebrow}
          </Eyebrow>
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="display-h2 mb-6">{fluxa.titulo}</h2>
              <p className="text-fg-2 mb-6 max-w-[58ch] text-[18px] leading-[1.6]">{fluxa.lead}</p>
              <p className="text-fg mb-10 max-w-[52ch] text-[18px] leading-[1.5] font-semibold">{fluxa.valor}</p>
              <div className="flex flex-wrap gap-3.5">
                <Botao href={fluxa.links.gratis.href} origem="fluxa-gratis">
                  {fluxa.links.gratis.label}
                </Botao>
                <Botao
                  href={fluxa.links.site.href}
                  variante="secundario"
                  className="border-carvao/40 text-carvao hover:border-carvao hover:text-carvao"
                >
                  {fluxa.links.site.label}
                </Botao>
              </div>
              <p className="text-fg-2 mt-4 text-[14px]">{fluxa.planos}</p>
            </div>
            <FluxaCard />
          </div>

          <div className="mt-16">
            <CapturaSite
              base={fluxa.captura.base}
              alt={fluxa.captura.alt}
              legenda={fluxa.captura.legenda}
              href={fluxa.links.site.href}
            />
          </div>

          <div className="mt-24 grid gap-16 md:grid-cols-2">
            <div>
              <h3 className="mb-8 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
                {fluxa.entregasTitulo}
              </h3>
              <ListaNumerada passos={fluxa.entregas} />
            </div>
            <div>
              <h3 className="mb-8 text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
                {fluxa.vemJuntoTitulo}
              </h3>
              <div className="flex flex-col gap-6">
                {fluxa.vemJunto.map((p) => (
                  <Ponto key={p.destaque} destaque={p.destaque} texto={p.texto} className="max-w-none" />
                ))}
              </div>
            </div>
          </div>

          <Line className="mt-24 mb-12" />
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <h3 className="text-[clamp(28px,3.2vw,40px)] leading-[1.02] font-bold tracking-[-0.03em]">
              {fluxa.servico.titulo}
            </h3>
            <div>
              <p className="text-fg-2 mb-8 max-w-[62ch] text-[18px] leading-[1.6]">{fluxa.servico.texto}</p>
              <Botao href={waFluxa()} origem="produtos-fluxa">
                {fluxa.servico.cta}
              </Botao>
              <p className="text-fg-2 mt-4 text-[14px]">{site.semFormulario}</p>
            </div>
          </div>
        </div>
      </Section>

      <CtaFinal
        titulo={produtos.cta.titulo}
        botao={produtos.cta.botao}
        href={waSpotlite()}
        origem="produtos-spotlite-final"
      />
    </main>
  );
}
