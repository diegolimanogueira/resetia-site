import { site } from "./site";
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
        titulo: "Diagnóstico com a Spotlite",
        texto:
          "Antes da primeira aula, a equipe inteira responde à Spotlite, nossa ferramenta de diagnóstico com IA. Ela mapeia onde as horas da semana estão indo, o que cabe em IA ou automação e quanto isso vale, em reais estimados. O treinamento é montado em cima desse resultado, não de uma ementa genérica.",
      },
      {
        numero: "02",
        titulo: "Treinamento direcionado",
        texto:
          "Sessões online e práticas. Os exercícios usam documentos, planilhas e e-mails reais da própria área. Nada fictício. Toda sessão termina com algo pronto para usar no dia seguinte.",
      },
      {
        numero: "03",
        titulo: "Medição antes × depois",
        texto:
          "Ao final, a Spotlite roda de novo. O gestor recebe o comparativo: nota de maturidade por dimensão, atividades que passaram a ser automatizadas e horas economizadas por mês. Resultado é número, não impressão.",
      },
    ] satisfies Passo[],
    link: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite } satisfies Link,
  },
  treinamentos: {
    titulo: "Um programa para cada ponto da empresa.",
    colunas: ["Programa", "Para quem", "O que a equipe leva"],
    programas: [
      {
        nome: "Letramento em IA",
        quem: "Equipes de qualquer área: RH, financeiro, marketing, suporte, operações",
        leva: "Método de prompt, domínio da ferramenta da casa e um agente próprio",
        desc: "Fundamentos e prompt, como as IAs funcionam, panorama de ferramentas, IA aplicada ao setor, uso seguro. Com os métodos próprios CLARO, CONFERE e PACEF.",
      },
      {
        nome: "Champions de IA",
        quem: "Líderes e multiplicadores que vão levar IA para o resto da empresa",
        leva: "Um caso de uso resolvido na própria área e um projeto real apresentado à diretoria",
        desc: "Discovery de problemas, mapeamento de processos, prototipagem com IA, agentes dentro das plataformas e Claude Code em nível de uso, não de programação.",
      },
      {
        nome: "Workshops por ferramenta",
        quem: "Times que já têm Gemini Workspace, Claude ou ChatGPT contratado e usam pouco",
        leva: "Cada pessoa sai sabendo criar o próprio agente na ferramenta da casa",
        desc: "Gems, Gemini no Docs, Sheets e Gmail, Notebook. Ou Claude Projetos, Design e Cowork. O time sai sabendo criar o próprio agente.",
      },
      {
        nome: "Claude Code para times de tecnologia",
        quem: "Desenvolvedores e analistas que querem construir com agentes de código",
        leva: "A fundação de um projeto real de pé",
        desc: "Setup, CLAUDE.md, skills, banco de dados e TDD, no ritmo real de produção de código.",
      },
      {
        nome: "Uso seguro de IA e LGPD",
        quem: "Toda a empresa, antes de assinar a política de IA",
        leva: "Guia de uso seguro da área, em uma página",
        desc: "O que pode e o que não pode, pesquisa segura, dado pessoal, política de IA explicada em linguagem de negócio.",
      },
    ] satisfies ProgramaResumo[],
    link: { label: "Ver os programas em detalhe", href: "/solucoes" } satisfies Link,
  },
  spotlite: {
    titulo: ["Spotlite.", "O diagnóstico que direciona tudo."],
    texto:
      "Ferramenta própria da Reset IA. A equipe inteira responde pelo link da rodada; a IA mapeia onde as horas da semana estão indo, o que cabe em IA ou automação e quanto isso vale, em reais estimados. A nota de 0 a 10 sai por regra fixa, em cinco dimensões, e a Reset IA revisa cada relatório antes de ele chegar à gestão.",
    valor:
      "Feita para empresas e para quem trabalha nelas. Mede retorno e geração de valor antes de qualquer promessa.",
    ctaSite: { label: site.ctaSpotliteSite, href: site.ferramentas.spotlite } satisfies Link,
    ctaWhatsapp: site.ctaSpotlite,
    card: cardExemplo,
    fluxa: {
      nome: "Fluxa BPM",
      texto:
        "Nossa outra ferramenta: gestão de processos com IA, em português. Você conta como o trabalho é feito; a IA desenha o processo, escreve o passo a passo, mostra onde ele trava e propõe a melhoria, com custo e economia estimados em reais. Sai em PDF e Word. Comece grátis, sem cartão.",
      link: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa } satisfies Link,
    },
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
