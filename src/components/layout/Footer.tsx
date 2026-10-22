import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { footer, nav, site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer
      data-tom="carvao"
      className="bg-carvao text-cinza gutter border-cinza/25 relative z-[1] border-t pt-16 pb-28 md:pb-10"
    >
      <div className="container-site grid grid-cols-2 gap-10 text-[15px] leading-[1.6] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo tom="carvao" altura={44} className="mb-3 inline-block" />
          <p>
            {footer.frase[0]}
            <br />
            {footer.frase[1]}
          </p>
        </div>
        <div>
          <Eyebrow className="mb-3">{footer.colunas.navegacao}</Eyebrow>
          <ul className="text-neutro flex flex-col gap-2">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Eyebrow className="mb-3">{footer.colunas.contato}</Eyebrow>
          <ul className="text-neutro flex flex-col gap-2">
            <li>
              <a href={waGeral()} target="_blank" rel="noopener" data-cta="footer">
                {site.whatsappFormatado}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          </ul>
        </div>
        <div>
          <Eyebrow className="mb-3">{footer.colunas.redes}</Eyebrow>
          <ul className="text-neutro flex flex-col gap-2">
            {footer.redes.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-site border-cinza/25 mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-[13px]">
        {footer.legal.map((item) => (
          <span key={item}>{item}</span>
        ))}
        <Link href={footer.privacidade.href} className="hover:text-neutro">
          {footer.privacidade.label}
        </Link>
        <span className="basis-full">{footer.aviso}</span>
      </div>
    </footer>
  );
}
