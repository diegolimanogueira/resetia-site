import { nav, seo } from "@/content/site";
import { seoSolucao, solucaoPorSlug } from "@/content/solucoes";

/** Uma solução representa as sete (mesmo template) nos testes por rota: SEO, axe, visual, CTAs. */
const scan = solucaoPorSlug("scan")!;

/** Páginas indexáveis. Todas escuras (layout do reset360); Soluções e Tecnologias são seções da home. */
export const rotas = [
  { nome: "home", caminho: "/", titulo: seo.home.title },
  { nome: "solucao-scan", caminho: "/solucoes/scan/", titulo: seoSolucao(scan).title },
  { nome: "agentes", caminho: "/agentes/", titulo: seo.agentes.title },
  { nome: "sobre", caminho: "/sobre/", titulo: seo.sobre.title },
  { nome: "privacidade", caminho: "/privacidade/", titulo: seo.privacidade.title },
] as const;

export const linksNav = nav;
