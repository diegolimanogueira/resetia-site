import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@/components/analytics/Analytics";
import { BarraMobile } from "@/components/layout/BarraMobile";
import { JsonLd } from "@/components/seo/JsonLd";
import { seo, site } from "@/content/site";
import { STAGING } from "@/lib/asset";
import { tema } from "@/lib/tema";
import "./globals.css";

// Inter variável (subconjunto latino, OFL) no repositório: o build não depende do Google Fonts.
// No runner do GitHub o Google passou a servir URLs "l/font?kit=…&…" que o next/font/google
// do Turbopack não resolve, e o build quebrava.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 700",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.dominio),
  title: { default: seo.home.title, template: "%s" },
  description: seo.home.description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
    url: site.dominio,
  },
  twitter: { card: "summary_large_image" },
  // Staging no GitHub Pages nunca entra no índice; o canonical continua apontando para a produção.
  ...(STAGING ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-tema={tema} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        {children}
        <Footer />
        <BarraMobile />
        <Analytics />
        <JsonLd />
      </body>
    </html>
  );
}
