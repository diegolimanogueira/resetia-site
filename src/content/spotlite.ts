import type { CardSpotlite, CtaFinal, Passo } from "./types";

export const cardExemplo: CardSpotlite = {
  setor: "Setor: Financeiro",
  tag: "exemplo",
  nota: 7.1,
  notaLabel: "nota de maturidade",
  antesLabel: "antes: 3,4",
  barras: [
    { label: "Conciliação bancária", nivel: "alto ganho", pct: 92 },
    { label: "Relatórios mensais", nivel: "médio", pct: 64 },
    { label: "Respostas a fornecedores", nivel: "médio", pct: 48 },
  ],
  atividades: { valor: 11, label: "atividades automatizáveis" },
  economia: { valor: 46, unidade: "h/mês", label: "economia estimada" },
};

export const spotlite = {
  hero: {
    titulo: "Spotlite.",
    lead: "Diagnóstico de inteligência artificial, automação e processos. Por pessoa, por setor, antes e depois.",
    imagemAlt: "Bússola com a agulha verde apontando a direção",
  },
  comoFunciona: {
    titulo: "Como funciona",
    passos: [
      {
        numero: "01",
        titulo: "Criamos a empresa e os setores.",
        texto: "Você recebe um link por setor.",
      },
      {
        numero: "02",
        titulo: "A equipe responde.",
        texto: "Cada pessoa leva poucos minutos. Ninguém vê a resposta do outro.",
      },
      {
        numero: "03",
        titulo: "A IA gera o relatório do setor.",
        texto:
          "Nota de maturidade, atividades automatizáveis, economia estimada em reais. Um consultor revisa antes de chegar ao gestor.",
      },
      {
        numero: "04",
        titulo: "Antes e depois.",
        texto: "Ao fim do treinamento, a rodada roda de novo e o comparativo mostra o que mudou.",
      },
    ] satisfies Passo[],
  },
  recebe: {
    titulo: "O que o gestor recebe",
    itens: [
      {
        destaque: "Nota de maturidade",
        texto: " de 0 a 10. A régua é exigente: 10 é um setor que já opera com IA e automação no dia a dia.",
        verde: true,
      },
      { destaque: "Atividades automatizáveis", texto: ", ranqueadas por ganho.", verde: true },
      { destaque: "Economia estimada", texto: " em horas e reais por mês.", verde: true },
      {
        destaque: "",
        texto: "Uso escondido de IA aparece de forma agregada, sem expor ninguém.",
        verde: false,
      },
    ],
  },
  cardExemplo,
  paraQuem: {
    titulo: "Para quem",
    itens: [
      "Gestor que quer saber por onde começar.",
      "Empresa que vai contratar treinamento e não quer ementa genérica.",
      "Área que já treinou e quer medir se mudou alguma coisa.",
    ],
  },
  cta: {
    titulo: "Comece pelo diagnóstico.",
    botao: "Pedir o diagnóstico do meu setor",
  } satisfies CtaFinal,
};
