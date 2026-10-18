import { cardExemplo } from "./spotlite";
import type { Bloco, Link, Passo, Ponto, ProgramaResumo } from "./types";

export const depois = {
  titulo: "Treinar é o começo.",
  tituloInterno: "Depois do treinamento",
  blocos: [
    {
      titulo: "Governança de IA",
      texto:
        "Política de uso, comitê multidisciplinar, rito de homologação de ferramentas e um painel de demandas. Tudo desenhado em processo, em linguagem que o jurídico, a TI e o negócio entendem. Montado junto com os Champions formados no treinamento.",
    },
    {
      titulo: "Fábrica de Agentes",
      texto:
        "Um portal interno onde cada colaborador acessa agentes de IA da própria empresa: triagem de demandas, políticas internas, suporte, processos. Construído sobre a governança, com guardrails e log de tudo.",
    },
  ] satisfies Bloco[],
  nota: "Essas frentes entram depois que a equipe está treinada. Nunca antes.",
};

export const home = {
  hero: {
    titulo: ["IA sem hype.", "Resultado na prática."],
    lead: "Treinamos equipes para usar inteligência artificial no trabalho de verdade. Diagnóstico antes, prática durante, medição depois.",
    ctaPrimario: "Falar com um especialista",
    ctaSecundario: { label: "Ver como funciona", href: "#como-funciona" } satisfies Link,
    manifesto: ["Estratégia", "Tecnologia", "Pessoas", "Resultados"],
    imagemAlt: "Corredor escuro com uma porta aberta de onde sai luz verde",
  },
  prova: {
    antes: "Equipes treinadas em empresas como",
    empresas: ["IEL", "Fortes Tecnologia", "FortesPay", "Longevidade Saudável"],
    depois: "entre outras.",
  },
  problema: {
    titulo: ["Sua empresa já usa IA.", "Só não sabe como."],
    pontos: [
      {
        destaque: "Licença parada.",
        texto: "O Gemini, o Copilot ou o ChatGPT corporativo estão contratados. Metade do time abriu uma vez.",
      },
      {
        destaque: "Uso escondido.",
        texto:
          "A outra metade usa IA no celular pessoal, com dado da empresa, sem ninguém saber. Isso tem nome: shadow AI.",
      },
      {
        destaque: "Prompt ruim, resultado ruim.",
        texto:
          'Quem tentou, pediu "faça um e-mail" e desistiu na segunda resposta. A ferramenta não é o problema. O método é.',
      },
    ] satisfies Ponto[],
    fecho: "Treinamento de IA não é mostrar ferramenta. É mudar o jeito que a equipe trabalha.",
  },
  comoFunciona: {
    titulo: ["Diagnóstico. Treino. Medição.", "Nessa ordem."],
    imagemAlt: "Bússola com a agulha verde apontando a direção",
    passos: [
      {
        numero: "01",
        titulo: "Diagnóstico com o Spotlite",
        texto:
          "Antes da primeira aula, cada pessoa responde ao Spotlite, nossa ferramenta de diagnóstico. Ela mede o nível de uso de IA, automação e processos de cada setor e aponta onde está o ganho. O treinamento é montado em cima desse resultado, não de uma ementa genérica.",
      },
      {
        numero: "02",
        titulo: "Treinamento direcionado",
        texto:
          "Sessões online de 90 minutos, 75% prática. Os exercícios usam documentos, planilhas e e-mails reais da própria área. Nada fictício. Toda sessão termina com algo pronto para usar no dia seguinte.",
      },
      {
        numero: "03",
        titulo: "Medição antes × depois",
        texto:
          "Ao final, o Spotlite roda de novo. O gestor recebe o comparativo: nota de maturidade, atividades que passaram a ser automatizadas e horas economizadas por mês. Resultado é número, não impressão.",
      },
    ] satisfies Passo[],
    link: { label: "Conhecer o Spotlite", href: "/spotlite" } satisfies Link,
  },
  treinamentos: {
    titulo: "Um programa para cada ponto da empresa.",
    colunas: ["Programa", "Para quem", "Formato"],
    programas: [
      {
        nome: "Letramento em IA",
        quem: "Equipes de qualquer área: RH, financeiro, marketing, suporte, operações",
        formato: "5 módulos · 11 sessões online · mentoria individual",
        desc: "Fundamentos e prompt, como as IAs funcionam, panorama de ferramentas, IA aplicada ao setor, uso seguro. Com os métodos próprios CLARO, CONFERE e PACEF.",
      },
      {
        nome: "Champions de IA",
        quem: "Líderes e multiplicadores que vão levar IA para o resto da empresa",
        formato: "7 módulos · projeto real apresentado à diretoria · certificação",
        desc: "Discovery de problemas, mapeamento de processos, prototipagem com IA, agentes dentro das plataformas e Claude Code em nível de uso, não de programação.",
      },
      {
        nome: "Workshops por ferramenta",
        quem: "Times que já têm Gemini Workspace, Claude ou ChatGPT contratado e usam pouco",
        formato: "3 a 6 encontros de 2h · 100% na ferramenta da casa",
        desc: "Gems, Gemini no Docs, Sheets e Gmail, Notebook. Ou Claude Projetos, Design e Cowork. O time sai sabendo criar o próprio agente.",
      },
      {
        nome: "Claude Code para times de tecnologia",
        quem: "Desenvolvedores e analistas que querem construir com agentes de código",
        formato: "Aulas guiadas · a equipe sai com a fundação de um projeto de pé",
        desc: "Setup, CLAUDE.md, skills, banco de dados e TDD, no ritmo real de produção de código.",
      },
      {
        nome: "Uso seguro de IA e LGPD",
        quem: "Toda a empresa, antes de assinar a política de IA",
        formato: "Encontro dedicado · guia de uso seguro da área",
        desc: "O que pode e o que não pode, pesquisa segura, dado pessoal, política de IA explicada em linguagem de negócio.",
      },
    ] satisfies ProgramaResumo[],
    link: { label: "Ver os programas em detalhe", href: "/solucoes" } satisfies Link,
  },
  spotlite: {
    titulo: ["Spotlite.", "O diagnóstico que direciona tudo."],
    texto:
      "Ferramenta própria da Reset IA. Mede, pessoa a pessoa e setor a setor, o nível real de uso de inteligência artificial, automação e processos. Entrega ao gestor uma nota de maturidade, a lista de atividades automatizáveis e a economia estimada em reais. Roda antes e depois do treinamento.",
    cta: "Pedir o diagnóstico do meu setor",
    card: cardExemplo,
  },
  depois,
  fecho: {
    linha1: "Reprogramar hoje",
    linha2Prefixo: "para um ",
    linha2Destaque: "amanhã maior.",
    apoio: "Um novo ciclo começa com uma conversa de 30 minutos.",
    cta: "Falar com um especialista",
  },
};
