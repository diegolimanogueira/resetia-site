import { nav, seo } from "@/content/site";
import { seoSolucao, solucaoPorSlug } from "@/content/solucoes";

/** Uma solução representa as sete (mesmo template) nos testes por rota: SEO, axe, visual, CTAs. */
const scan = solucaoPorSlug("scan")!;

export const rotas = [
  { nome: "home", caminho: "/", titulo: seo.home.title, tom: "carvao" },
  { nome: "solucoes", caminho: "/solucoes/", titulo: seo.solucoes.title, tom: "neutro" },
  { nome: "solucao-scan", caminho: "/solucoes/scan/", titulo: seoSolucao(scan).title, tom: "neutro" },
  { nome: "agentes", caminho: "/agentes/", titulo: seo.agentes.title, tom: "neutro" },
  { nome: "tecnologias", caminho: "/tecnologias/", titulo: seo.tecnologias.title, tom: "carvao" },
  { nome: "sobre", caminho: "/sobre/", titulo: seo.sobre.title, tom: "neutro" },
  { nome: "privacidade", caminho: "/privacidade/", titulo: seo.privacidade.title, tom: "neutro" },
] as const;

export const linksNav = nav;
