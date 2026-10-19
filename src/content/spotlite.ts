import { site } from "./site";
import type { CardSpotlite, CtaFinal, Passo, Ponto } from "./types";

/**
 * Mockup do relatório. Espelha a estrutura real do relatório da Spotlite (spotlite.com.br):
 * nota do setor de 0 a 10, mapa de atividades em horas por semana, oportunidade em reais (estimativa)
 * e quantas pessoas responderam. Dados fictícios, rotulados como exemplo.
 */
export const cardExemplo: CardSpotlite = {
  setor: "Setor Comercial · empresa fictícia",
  tag: "exemplo ilustrativo",
  nota: 3.6,
  notaLabel: "nota do setor",
  notaApoio: "de 10 · diagnóstico inicial",
  barrasTitulo: "Mapa de atividades · horas por semana",
  barras: [
    { label: "Automação", valor: "31 h", pct: 92 },
    { label: "IA", valor: "22 h", pct: 65 },
    { label: "Ajuste de processo", valor: "12 h", pct: 36 },
  ],
  destaque: { prefixo: "R$", valor: 4200, sufixo: "/mês", label: "economia estimada · oportunidade 1 de 5" },
  respondentes: { valor: 9, de: 12, label: "pessoas responderam" },
};

export const spotlite = {
  hero: {
    titulo: "Spotlite.",
    lead: "Diagnóstico com IA, exclusivo da Reset IA. Mostra onde o tempo da equipe está indo e onde IA e automação entram no trabalho do seu setor, em horas e em reais estimados. Para empresas e para quem trabalha nelas.",
    ctaSite: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite },
    imagemAlt: "Bússola com a agulha verde apontando a direção",
  },
  comoFunciona: {
    titulo: "Como funciona",
    passos: [
      {
        numero: "01",
        titulo: "Criamos a empresa, os setores e a rodada.",
        texto: "Você recebe um link por setor.",
      },
      {
        numero: "02",
        titulo: "A equipe inteira responde.",
        texto:
          "Gestor e time, pelo link da rodada, no celular ou no computador. O relatório mostra quantas pessoas responderam, sempre como x de n.",
      },
      {
        numero: "03",
        titulo: "A IA organiza, a regra calcula.",
        texto:
          "A IA agrupa onde as horas da semana estão indo e separa o que cabe em IA, automação, ajuste de processo ou demanda para TI. A nota de 0 a 10 sai de uma regra fixa, a mesma para todos os setores.",
      },
      {
        numero: "04",
        titulo: "A Reset IA revisa, você compara.",
        texto:
          "Nenhum relatório chega à gestão sem revisão. Ao fim do treinamento, uma nova rodada mostra o que mudou.",
      },
    ] satisfies Passo[],
  },
  recebe: {
    titulo: "O que o gestor recebe",
    itens: [
      {
        destaque: "Nota de 0 a 10 em cinco dimensões:",
        texto:
          " Processos, Automação, Uso de IA, Conhecimento do time e Governança. A régua é exigente: 10 é IA e automação em produção no dia a dia, com governança.",
        verde: true,
      },
      {
        destaque: "Mapa de atividades.",
        texto: " Horas por semana que cabem em IA, automação, ajuste de processo ou demanda para TI.",
        verde: true,
      },
      {
        destaque: "Oportunidades em reais.",
        texto:
          " Economia estimada por mês, a partir das horas informadas e do custo da função, sempre marcada como estimativa e ao lado do esforço para começar.",
        verde: true,
      },
      {
        destaque: "Shadow AI só no agregado.",
        texto:
          " O uso de IA fora das ferramentas aprovadas aparece somado para o setor, nunca com o nome de quem respondeu. Os nomes ficam fora da IA.",
        verde: true,
      },
      {
        destaque: "",
        texto: "Relatório em PDF, revisado pela Reset IA, com prioridades e um roteiro de 30, 60 e 90 dias.",
        verde: false,
      },
    ],
  },
  cardExemplo,
  metodo: {
    titulo: "O método",
    passos: [
      {
        numero: "01",
        titulo: "O 10 é IA em produção.",
        texto:
          "Nota 10 é um setor que já usa IA e automação em produção no dia a dia, com governança. A régua é exigente de propósito.",
      },
      {
        numero: "02",
        titulo: "A IA interpreta, a regra calcula.",
        texto:
          "A IA organiza as atividades e redige o relatório; a nota sai de uma regra fixa, a mesma para todos. O número mostrado é sempre o calculado.",
      },
      {
        numero: "03",
        titulo: "Reais são sempre estimativa.",
        texto:
          "A economia vem das horas informadas pela equipe, do custo da função e da parte da atividade que pode ser automatizada. Serve para priorizar; não é promessa de ganho.",
      },
      {
        numero: "04",
        titulo: "Nomes ficam fora da IA.",
        texto:
          "Os nomes são mascarados antes de qualquer envio à IA. O Shadow AI é medido por perguntas indiretas e aparece só agregado por setor.",
      },
    ] satisfies Passo[],
    referencias:
      "Método construído sobre referências públicas de Gartner, MIT CISR, BCG, NIST AI RMF 1.0 e ISO/IEC 42001:2023. A Spotlite e a Reset IA não são afiliadas a essas organizações.",
  },
  paraQuem: {
    titulo: "Para quem",
    valor:
      "Feita para empresas e para quem trabalha nelas. O foco é retorno e geração de valor: horas e reais, não impressão. Queremos ser pioneiros em diagnóstico de IA orientado a resultado.",
    itens: [
      "Gestor que quer saber por onde começar e quanto vale.",
      "Empresa que vai contratar treinamento e quer medir retorno, não ementa genérica.",
      "Área que já treinou e quer provar o que mudou, em horas e reais.",
    ],
    nota: "Em breve: diagnóstico individual gratuito, direto em spotlite.com.br.",
  },
  fluxa: {
    titulo: "Também da Reset IA: Fluxa BPM",
    texto:
      "Gestão de processos com IA, em português. Você conta como o trabalho é feito; a IA desenha o processo, escreve o passo a passo, mostra onde ele trava e propõe a melhoria, com custo e economia estimados em reais. Sai em PDF e Word. Comece grátis, sem cartão.",
    pontos: [
      { destaque: "Hoje.", texto: "O fluxo por área, com decisões e caminhos alternativos." },
      { destaque: "Passo a passo.", texto: "Resumo do processo, procedimento das etapas e quem faz o quê." },
      { destaque: "Pontos de atenção.", texto: "Onde trava, se repete ou corre risco, e o que fazer." },
      { destaque: "Proposta.", texto: "O processo redesenhado, com impacto e esforço de cada mudança." },
    ] satisfies Ponto[],
    link: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa },
  },
  cta: {
    titulo: "Comece pelo diagnóstico.",
    botao: site.ctaSpotlite,
  } satisfies CtaFinal,
};
