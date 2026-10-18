import { depois } from "./home";
import type { CtaFinal, FaqItem, ProgramaDetalhe } from "./types";

export const ctaPadrao: CtaFinal = {
  titulo: "Um novo ciclo começa com uma conversa de 30 minutos.",
  botao: "Falar com um especialista",
};

export const solucoes = {
  hero: {
    titulo: "Treinamentos que a equipe usa na segunda-feira.",
    lead: "Todos online, com exercícios sobre o trabalho real de cada pessoa. O conteúdo é definido pelo diagnóstico, não pela ementa.",
  },
  campos: {
    quem: "Para quem",
    como: "Como funciona",
    leva: "O que a equipe leva",
  },
  programas: [
    {
      num: "01",
      nome: "Letramento em IA",
      quem: "Pessoas escolhidas para aprender IA antes do resto da empresa. Não precisam ser líderes nem técnicas.",
      como: '5 módulos em 11 sessões online de 90 minutos, mais mentoria individual. Cada sessão tem três blocos: explicação curta, "acompanhe na tela" e exercício com material real da área.',
      leva: "Método de prompt que funciona (CLARO, CONFERE, PACEF), domínio da ferramenta da casa, um agente próprio criado pela pessoa, guia de uso seguro.",
    },
    {
      num: "02",
      nome: "Champions de IA",
      quem: "Gestores e multiplicadores que vão levar IA para as outras áreas.",
      como: "7 módulos, 75% prática, online. Começa com a devolutiva do diagnóstico e termina com um projeto real apresentado à diretoria. Certificação ao final.",
      leva: "Um caso de uso resolvido na própria área, capacidade de prototipar com IA, visão do que entra na governança.",
    },
    {
      num: "03",
      nome: "Workshops por ferramenta",
      quem: "Empresas que já pagam Gemini Workspace, Claude ou ChatGPT e usam pouco.",
      como: "3 a 6 encontros de 2h, tudo dentro da ferramenta contratada. Uma única história do começo ao fim: a mesma tarefa resolvida de três jeitos, do prompt ao agente.",
      leva: 'Cada pessoa sai dizendo "agora sei fazer um agente de IA".',
    },
    {
      num: "04",
      nome: "Claude Code para times de tecnologia",
      quem: "Desenvolvedores e analistas de TI que nunca usaram agentes de código.",
      como: "Aula guiada presencial ou remota. Todos fazem juntos: setup, CLAUDE.md, skills, banco, TDD. Depois cada um toca o próprio projeto com acompanhamento.",
      leva: "A fundação de um projeto real de pé e um fluxo de desenvolvimento para repetir.",
    },
    {
      num: "05",
      nome: "Uso seguro de IA e LGPD",
      quem: "Toda a empresa, de preferência antes de publicar a política de IA.",
      como: "Encontro dedicado por área, com exemplos do que acontece no dia a dia daquela área.",
      leva: "Guia de uso seguro de uma página e clareza sobre o que pode, o que não pode e por quê.",
    },
  ] satisfies ProgramaDetalhe[],
  depois,
  faq: {
    titulo: "Perguntas frequentes",
    itens: [
      {
        pergunta: "Os treinamentos são presenciais?",
        resposta: "Online por padrão, pelo Meet ou Teams. Presencial sob combinação.",
      },
      {
        pergunta: "Precisa ter licença de alguma IA?",
        resposta: "Não. Treinamos na ferramenta que a empresa já tem. Se não tiver, indicamos a melhor para o caso.",
      },
      {
        pergunta: "Quantas pessoas por turma?",
        resposta: "Letramento e workshops até 15. Champions até 10.",
      },
      {
        pergunta: "Qual o tempo de um programa?",
        resposta: "De 3 semanas (workshop) a 12 semanas (Letramento ou Champions).",
      },
      {
        pergunta: "O diagnóstico é obrigatório?",
        resposta:
          "É o que torna o treinamento direcionado. Sem ele, entregamos ementa genérica, e isso a gente não faz.",
      },
    ] satisfies FaqItem[],
  },
  cta: ctaPadrao,
};
