import { nav, seo } from "@/content/site";

export const rotas = [
  { nome: "home", caminho: "/", titulo: seo.home.title, tom: "carvao" },
  { nome: "solucoes", caminho: "/solucoes/", titulo: seo.solucoes.title, tom: "neutro" },
  { nome: "spotlite", caminho: "/spotlite/", titulo: seo.spotlite.title, tom: "carvao" },
  { nome: "sobre", caminho: "/sobre/", titulo: seo.sobre.title, tom: "neutro" },
] as const;

export const linksNav = nav;
