import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@/components/analytics/Analytics";
import { BarraMobile } from "@/components/layout/BarraMobile";
import { Cursor } from "@/components/motion/Cursor";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { seo, site } from "@/content/site";
import { STAGING } from "@/lib/asset";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider movimento={process.env.NEXT_PUBLIC_MOVIMENTO !== "false"}>
          <LenisProvider />
          <Cursor />
          <Header />
          {children}
          <Footer />
          <BarraMobile />
          <Analytics />
        </MotionProvider>
        <JsonLd />
      </body>
    </html>
  );
}
