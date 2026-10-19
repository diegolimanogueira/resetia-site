import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { privacidade } from "@/content/privacidade";
import { seo } from "@/content/site";

export const metadata: Metadata = {
  title: seo.privacidade.title,
  description: seo.privacidade.description,
  alternates: { canonical: "/privacidade/" },
};

export default function Privacidade() {
  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-[120px]">
        <div className="container-site max-w-[72ch]">
          <h1 className="mb-4 text-[clamp(36px,5vw,64px)] leading-[.98] font-bold tracking-[-0.03em]">
            {privacidade.titulo}
          </h1>
          <p className="eyebrow text-fg-2 mb-10">Atualizada em {privacidade.atualizadaEm}</p>
          <p className="text-fg mb-14 text-[20px] leading-[1.6]">{privacidade.intro}</p>
          <div className="flex flex-col gap-12">
            {privacidade.secoes.map((s) => (
              <section key={s.titulo}>
                <h2 className="mb-4 text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">{s.titulo}</h2>
                {s.paragrafos.map((p) => (
                  <p key={p} className="text-fg-2 mb-4 text-[18px] leading-[1.6]">
                    {p}
                  </p>
                ))}
                {"links" in s && s.links ? (
                  <ul className="mt-2 flex flex-wrap gap-6 text-[15px] font-medium">
                    {s.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener"
                          className="text-fg border-fg/30 hover:border-verde border-b pb-[3px]"
                        >
                          {l.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
