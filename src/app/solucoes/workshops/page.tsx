import type { Metadata } from "next";
import { PaginaMovida } from "@/components/sections/shared/PaginaMovida";
import { movidas } from "@/content/site";

export const metadata: Metadata = {
  title: `${movidas.workshops.titulo} | Reset IA`,
  robots: { index: false, follow: true },
  alternates: { canonical: movidas.workshops.link.href },
};

/** Rota antiga: os workshops agora fazem parte do RESET AI Champions. */
export default function WorkshopsAntigo() {
  return <PaginaMovida titulo={movidas.workshops.titulo} link={movidas.workshops.link} />;
}
