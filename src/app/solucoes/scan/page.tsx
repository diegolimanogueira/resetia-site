import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.scan.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: movidas.scan.link.href },
};

/** Rota antiga: o RESET Scan deixou de ser produto e virou o diagnóstico gratuito. */
export default function ScanAntigo() {
  return <PaginaMovida titulo={movidas.scan.titulo} link={movidas.scan.link} />;
}
