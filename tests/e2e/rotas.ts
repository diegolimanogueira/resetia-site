import { nav, seo } from "@/content/site";

export const rotas = [
  { nome: "home", caminho: "/", titulo: seo.home.title, tom: "carvao" },
  { nome: "solucoes", caminho: "/solucoes/", titulo: seo.solucoes.title, tom: "neutro" },
  { nome: "produtos", caminho: "/produtos/", titulo: seo.produtos.title, tom: "carvao" },
  { nome: "sobre", caminho: "/sobre/", titulo: seo.sobre.title, tom: "neutro" },
  { nome: "privacidade", caminho: "/privacidade/", titulo: seo.privacidade.title, tom: "neutro" },
] as const;

export const linksNav = nav;
