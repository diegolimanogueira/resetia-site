import { site } from "./site";
import { ctaPadrao } from "./solucoes";
import type { Link, Ponto } from "./types";

export const sobre = {
  hero: { titulo: "Quem está por trás." },
  diego: {
    nome: "Diego Nogueira",
    subtitulo: "Arquiteto de IA e consultor de inovação. Muita prática, pouca teoria.",
    descricao:
      "Arquiteto de IA no centro de excelência de inteligência artificial da Unimed Nacional, onde conduz a trilha de Champions de IA com mais de 250 líderes do sistema Unimed. Quinze anos em tecnologia, com raízes em implantação de sistemas financeiros. Treina equipes em empresas como IEL, Fortes Tecnologia, FortesPay e Longevidade Saudável, e constrói as ferramentas que usa nos treinamentos.",
    destaques: [
      {
        destaque: "Forma líderes em escala.",
        texto: "Mais de 250 líderes do sistema Unimed na trilha de Champions de IA.",
      },
      {
        destaque: "Constrói o que ensina.",
        texto: "Spotlite e Fluxa BPM são produtos próprios, usados nos próprios treinamentos.",
      },
      {
        destaque: "Base técnica de verdade.",
        texto: "Certificações Oracle AI, CSPO e ACSM; formação contínua em engenharia de software, FIAP e IBMEC.",
      },
    ] satisfies Ponto[],
    links: [{ label: "Instagram", href: site.redes.instagram }] satisfies Link[],
    foto: { base: "/brand/diego", alt: "Diego Nogueira, fundador da Reset IA" },
  },
  comoTrabalhamos: {
    titulo: "Como trabalhamos",
    principios: [
      { destaque: "Nada fictício.", texto: "Exercício é feito com o documento real da sua área." },
      { destaque: "Mais mão que fala.", texto: "Quem está na sala executa; o instrutor acompanha." },
      { destaque: "Resultado é número.", texto: "O que não se mede não entra na proposta." },
    ] satisfies Ponto[],
  },
  metodos: {
    titulo: "Métodos e ferramentas próprias",
    itens: [
      { nome: "CLARO · CONFERE · PARE", texto: "como pedir, como checar, quando não usar IA." },
      { nome: "PACEF", texto: "persona, ação, contexto, exemplo, formato." },
      {
        nome: "Spotlite",
        texto: "diagnóstico com IA do setor, em horas e reais, antes e depois do treinamento.",
        href: site.ferramentas.spotlite,
      },
      {
        nome: "Fluxa BPM",
        texto: "gestão de processos com IA: a equipe conta como trabalha, a IA desenha, documenta e propõe a melhoria.",
        href: site.ferramentas.fluxa,
      },
    ],
  },
  cta: ctaPadrao,
};
