import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { footer, site } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { waGeral } from "@/lib/whatsapp";

const linkRodape = "text-fg mb-[9px] block text-[13px]";

/** Rodapé: marca, as cinco soluções, Explore e Fale com a Reset; linha legal com a política de privacidade. */
export function Footer() {
  return (
    <footer
      data-tom="carvao"
      className="gutter border-line text-fg relative border-t bg-(--bg) pt-[60px] pb-28 md:pt-[75px] md:pb-[25px]"
    >
      <div className="container-site grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-[50px]">
        <div className="col-span-2 md:col-span-1">
          <Logo altura={38} />
          <p className="text-fg-2 mt-[30px] text-[15px] leading-[1.6]">
            {footer.frase[0]}
            <br />
            {footer.frase[1]}
          </p>
          <p className="text-verde mt-4 text-[13px] font-semibold">{site.assinatura}</p>
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-bold">{footer.solucoes.titulo}</h2>
          {solucoes.lista.map((s) => (
            <Link key={s.slug} href={`/solucoes/${s.slug}`} className={linkRodape}>
              {s.nome}
            </Link>
          ))}
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-bold">{footer.explore.titulo}</h2>
          {footer.explore.links.map((l) => (
            <Link key={l.href} href={l.href} className={linkRodape}>
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-bold">{footer.contato.titulo}</h2>
          <a href={waGeral()} target="_blank" rel="noopener" data-cta="footer" className={linkRodape}>
            {footer.contato.whatsapp} <span aria-hidden="true">↗</span>
          </a>
          {footer.contato.redes.map((r) => (
            <a key={r.href} href={r.href} target="_blank" rel="noopener" className={linkRodape}>
              {r.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
      <div className="container-site border-line text-fg-2 mt-[50px] flex flex-col gap-2 border-t pt-5 text-[12px] md:flex-row md:justify-between md:gap-6">
        <span>{footer.legal}</span>
        <span className="flex flex-col gap-2 md:flex-row md:gap-6">
          <span>{footer.aviso}</span>
          <Link href={footer.privacidade.href} className="text-fg">
            {footer.privacidade.label}
          </Link>
        </span>
      </div>
    </footer>
  );
}
