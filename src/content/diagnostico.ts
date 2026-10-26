import type { Passo, Pergunta } from "./types";

/**
 * RESET Scan: diagnóstico inicial gratuito, conduzido pela Reset (entrada comercial, não é um dos cinco produtos).
 * O teste de IA da Spotlite fica como opção secundária, para quem prefere começar sozinho.
 */
export const diagnostico = {
  hero: {
    kicker: "RESET Scan · Diagnóstico gratuito",
    titulo: ["Por onde sua empresa", "*deveria começar com IA?*"],
    lead: "Descubra oportunidades de aplicação da inteligência artificial, identifique desafios de adoção e entenda quais iniciativas podem gerar mais valor para o seu negócio.",
    nota: "Pelo WhatsApp, sem formulário.",
  },
  avaliamos: {
    kicker: "O que olhamos",
    titulo: ["Um retrato inicial", "*do seu cenário.*"],
    itens: [
      "Área de atuação da empresa.",
      "Ferramentas de IA utilizadas hoje.",
      "Principais desafios operacionais.",
      "Maturidade da adoção de IA.",
      "Necessidades de Marketing, Vendas e Customer Success.",
      "Oportunidades preliminares de capacitação, processos e agentes.",
    ],
  },
  etapas: {
    kicker: "Como funciona",
    titulo: ["Simples,", "*sem barreiras.*"],
    passos: [
      {
        numero: "01",
        titulo: "Você chama a Reset",
        texto: "Pelo WhatsApp, com a mensagem pronta. Sem formulário.",
      },
      {
        numero: "02",
        titulo: "Conversa inicial",
        texto: "Entendemos a empresa, as ferramentas em uso e os desafios de Marketing, Vendas e Customer Success.",
      },
      {
        numero: "03",
        titulo: "Leitura preliminar",
        texto: "Apontamos oportunidades de capacitação, processos e agentes e os desafios de adoção.",
      },
      {
        numero: "04",
        titulo: "Próximos passos",
        texto: "Você recebe a indicação de por onde começar e de qual solução faz mais sentido para a sua maturidade.",
      },
    ] satisfies Passo[],
  },
  escopo: {
    titulo: ["Diagnóstico inicial,", "*não projeto completo.*"],
    texto:
      "O RESET Scan é o ponto de partida: um diagnóstico inicial, gratuito, conduzido pela Reset para compreender o seu cenário e indicar próximos passos. Ele não substitui um projeto completo de diagnóstico organizacional. Quando o cenário pede uma avaliação aprofundada, a Spotlite, tecnologia própria da Reset, potencializa o diagnóstico conforme o escopo acordado.",
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
    titulo: ["Antes de", "*chamar a Reset.*"],
    itens: [
      {
        pergunta: "O diagnóstico é gratuito mesmo?",
        resposta:
          "Sim. O RESET Scan é uma conversa inicial, sem custo, para entender o seu cenário e indicar os próximos passos.",
      },
      {
        pergunta: "Preciso preencher um formulário?",
        resposta: "Não. Você chama a Reset no WhatsApp, com a mensagem pronta, e a conversa começa por lá.",
      },
      {
        pergunta: "O diagnóstico gratuito é um projeto de diagnóstico completo?",
        resposta:
          "Não. É um diagnóstico inicial. Quando o cenário pede uma avaliação aprofundada da organização, ela é proposta à parte, com escopo próprio, e pode ser potencializada pela Spotlite.",
      },
      {
        pergunta: "O que é bom ter em mãos?",
        resposta:
          "Nada formal. Ajuda saber quais ferramentas de IA a empresa já usa e quais desafios de Marketing, Vendas ou Customer Success mais pesam hoje.",
      },
    ] satisfies Pergunta[],
  },
};
