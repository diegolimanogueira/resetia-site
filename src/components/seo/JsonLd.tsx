import { seo, site } from "@/content/site";

/** Schema.org Organization: nome, URL, logo, redes, contato. */
export function JsonLd() {
  const dados = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.nome,
    url: `${site.dominio}/`,
    logo: `${site.dominio}/brand/logo-dark.png`,
    description: seo.home.description,
    email: site.email,
    sameAs: [site.redes.instagram, site.ferramentas.spotlite, site.ferramentas.fluxa],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${site.whatsapp}`,
      availableLanguage: "Portuguese",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />;
}
