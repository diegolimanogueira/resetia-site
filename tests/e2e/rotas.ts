import { nav, seo } from "@/content/site";
import { seoSolucao, solucaoPorSlug } from "@/content/solucoes";

/** Uma solução representa as cinco (mesmo template) nos testes por rota: SEO, axe, visual, CTAs. */
const champions = solucaoPorSlug("ai-champions")!;

/** Páginas indexáveis. */
export const rotas = [
  { nome: "home", caminho: "/", titulo: seo.home.title },
  { nome: "solucoes", caminho: "/solucoes/", titulo: seo.solucoes.title },
  { nome: "solucao-ai-champions", caminho: "/solucoes/ai-champions/", titulo: seoSolucao(champions).title },
  { nome: "agentes-de-ia", caminho: "/agentes-de-ia/", titulo: seo.agentes.title },
  { nome: "tecnologias", caminho: "/tecnologias/", titulo: seo.tecnologias.title },
  { nome: "sobre", caminho: "/sobre/", titulo: seo.sobre.title },
  { nome: "diagnostico-gratuito", caminho: "/diagnostico-gratuito/", titulo: seo.diagnostico.title },
  { nome: "privacidade", caminho: "/privacidade/", titulo: seo.privacidade.title },
] as const;

export const linksNav = nav;
