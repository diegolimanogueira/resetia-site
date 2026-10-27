import { seo, site } from "@/content/site";

/** Schema.org Organization: nome, URL, logo, fundadores, ferramentas, contato. */
export function JsonLd() {
  const dados = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.nome,
    url: `${site.dominio}/`,
    logo: `${site.dominio}/brand/logo-dark.png`,
    description: seo.home.description,
    email: site.email,
    sameAs: [site.ferramentas.spotlite, site.ferramentas.fluxa],
    founder: Object.values(site.fundadores).map((f) => ({
      "@type": "Person",
      name: f.nome,
      jobTitle: f.cargo,
      sameAs: f.linkedin,
    })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${site.whatsapp}`,
      availableLanguage: "Portuguese",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />;
}
