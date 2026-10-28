import type { Passo, Pergunta } from "./types";

/**
 * Análise Estratégica RESET (/diagnostico-gratuito, URL mantida): a conversa com especialistas, camada 3 do
 * RESET AI Score. O AI Score mostra onde a empresa está; a análise aprofunda processos, agentes, ferramentas e
 * prioridades. O teste de IA da Spotlite fica como opção secundária, para quem prefere começar sozinho.
 * Texto escrito a partir do documento do Diego (28/10): revisar.
 */
export const diagnostico = {
  hero: {
    kicker: "Análise Estratégica RESET",
    titulo: ["Seu AI Score mostrou onde sua empresa está.", "*Vamos construir o caminho.*"],
    lead: "Uma conversa com especialistas da Reset para validar o seu resultado e identificar oportunidades de produtividade, eficiência e geração de receita com IA.",
    nota: "Pelo WhatsApp. Ainda não fez o AI Score? Comece por ele: leva cerca de 5 minutos.",
  },
  avaliamos: {
    kicker: "O que aprofundamos",
    titulo: ["Das respostas", "*às prioridades.*"],
    itens: [
      "Validação das respostas do AI Score com quem conhece a operação.",
      "Processos prioritários para transformar primeiro.",
      "Oportunidades de agentes inteligentes em Marketing, Vendas e Customer Success.",
      "Ferramentas em uso, sobreposições e oportunidades de consolidação.",
      "Regras, riscos e governança necessários antes de ampliar o uso.",
      "Indicadores para acompanhar os resultados das iniciativas.",
    ],
  },
  etapas: {
    kicker: "Como funciona",
    titulo: ["Do AI Score", "*ao plano de prioridades.*"],
    passos: [
      {
        numero: "01",
        titulo: "Faça o AI Score",
        texto: "Em cerca de 5 minutos, você recebe a nota, o nível de maturidade e o relatório completo.",
      },
      {
        numero: "02",
        titulo: "Fale com a Reset",
        texto: "Pelo WhatsApp, com o resultado na mensagem. A conversa começa do seu momento.",
      },
      {
        numero: "03",
        titulo: "Análise com especialistas",
        texto: "Validamos as respostas e aprofundamos processos, ferramentas, dados e oportunidades de IA.",
      },
      {
        numero: "04",
        titulo: "Plano de prioridades",
        texto: "Você recebe a indicação de por onde começar e de quais soluções fazem sentido para a sua maturidade.",
      },
    ] satisfies Passo[],
  },
  escopo: {
    titulo: ["Ponto de partida,", "*não projeto completo.*"],
    texto:
      "A Análise Estratégica começa com uma conversa sem custo, conduzida pela Reset, para entender o seu cenário e indicar próximos passos. Ela não substitui um projeto completo de diagnóstico organizacional. Quando o cenário pede uma avaliação aprofundada, propomos um projeto com escopo próprio, que pode ser potencializado pela Spotlite, tecnologia própria da Reset.",
    link: { label: "Conhecer a Spotlite", href: "/tecnologias" },
  },
  /** Texto do próprio teste em spotlite.com.br/descoberta/ia-negocios. */
  teste: {
    kicker: "Prefere começar sozinho?",
    titulo: ["Teste de IA", "*para negócios.*"],
    lead: "Em 5 a 7 minutos, você descobre o seu perfil de aplicação de IA, a sua nota nas competências de IA para negócios e três próximos passos para o seu trabalho.",
    paraQuem: "Para empresários e líderes, colaboradores de empresa e profissionais individuais.",
    etapas: [
      { numero: "01", texto: "Sobre você" },
      { numero: "02", texto: "Preferências" },
      { numero: "03", texto: "Situações" },
      { numero: "04", texto: "Seu resultado" },
    ],
    cta: "Fazer o teste na Spotlite",
    nota: "Começa sem cadastro; no fim, você informa nome, e-mail e WhatsApp para ver a devolutiva.",
    aviso: "Diagnóstico educacional: orienta o seu desenvolvimento e não é certificação.",
  },
  perguntas: {
    kicker: "Perguntas frequentes",
    titulo: ["Antes de", "*falar com a Reset.*"],
    itens: [
      {
        pergunta: "A conversa tem custo?",
        resposta:
          "Não. A Análise Estratégica começa com uma conversa sem custo para entender o seu cenário. Se fizer sentido aprofundar, propomos um projeto com escopo próprio.",
      },
      {
        pergunta: "Preciso fazer o AI Score antes?",
        resposta:
          "Não é obrigatório, mas ajuda: com o resultado em mãos, a conversa começa do seu momento e vai direto ao que importa.",
      },
      {
        pergunta: "Qual é a diferença entre o AI Score e a Análise Estratégica?",
        resposta:
          "O AI Score é uma autoavaliação gratuita que mostra onde a empresa está. A Análise Estratégica é a conversa com especialistas da Reset que valida o resultado e indica como evoluir.",
      },
      {
        pergunta: "O que é bom ter em mãos?",
        resposta:
          "O resultado do AI Score, se já tiver feito, e uma ideia das ferramentas de IA em uso e dos desafios de Marketing, Vendas ou Customer Success que mais pesam hoje.",
      },
    ] satisfies Pergunta[],
  },
};
