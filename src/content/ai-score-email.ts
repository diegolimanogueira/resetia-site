/**
 * E-mails do RESET AI Score, enviados pela função supabase/functions/ai-score (provedor Resend):
 * o relatório completo para quem o pediu e o e-mail sobre a Reset IA que o admin envia a um lead.
 * Texto escrito em 28/10 a partir do conteúdo do site: revisar com o Diego.
 */
export const emailRelatorio = {
  assunto: (indice: number | null, nivel: string | null) =>
    indice === null ? "Seu RESET AI Score (resultado parcial)" : `Seu RESET AI Score: ${indice}/100, nível ${nivel}`,
  previa: "O relatório completo, com as dicas de evolução e o plano de 90 dias.",
  saudacao: (nome: string) => `Olá, ${nome.trim().split(/\s+/)[0]}.`,
  intro:
    "Aqui está o relatório completo do RESET AI Score que você pediu. Ele também fica disponível no link abaixo, em qualquer aparelho, para compartilhar com a liderança.",
  botao: "Ver o relatório completo",
  titulos: {
    dimensoes: "Resultado por dimensão",
    alertas: "O que o resultado revela",
    dicas: "Dicas para evoluir",
    plano: "Plano de 90 dias",
    solucoes: "Onde a Reset entra",
  },
  conversa: {
    titulo: "Quer ajuda para colocar o plano em prática?",
    texto: "Converse com um especialista da Reset sobre o seu resultado. A conversa é sem custo.",
    botao: "Conversar no WhatsApp",
  },
  rodape:
    "Você recebeu este e-mail porque pediu o relatório completo do RESET AI Score em resetia.com.br. Se não foi você, ignore esta mensagem.",
  privacidade: "Política de privacidade",
};

/** E-mail sobre a Reset IA que o admin envia ao lead, com assunto e texto editáveis antes do envio. */
export const emailReset = {
  assunto: (empresa: string | null) =>
    empresa
      ? `Reset IA: próximos passos de IA para a ${empresa}`
      : "Reset IA: próximos passos de IA para a sua empresa",
  corpo: (d: { nome: string; empresa: string | null; indice: number | null; nivel: string | null }) =>
    [
      `Olá, ${d.nome.trim().split(/\s+/)[0]}.`,
      d.indice === null
        ? "Obrigado por responder ao RESET AI Score."
        : `Obrigado por responder ao RESET AI Score, que mostrou ${d.empresa ? `a ${d.empresa}` : "a sua empresa"} no nível ${d.nivel}, com ${d.indice} de 100.`,
      "A Reset IA ajuda empresas a transformar inteligência artificial em resultado em Marketing, Vendas e Customer Success. Trabalhamos em cinco frentes: capacitação de lideranças e equipes, redesenho de processos com IA, criação de agentes inteligentes, governança do uso de IA e acompanhamento de resultados.",
      "Se fizer sentido, podemos conversar, sem custo, para entender o seu momento e indicar por onde começar. É só responder este e-mail ou chamar a gente no WhatsApp.",
      "Um abraço,\nEquipe Reset IA",
    ].join("\n\n"),
  assinatura: "Reset IA · IA sem hype. Resultado na prática.",
  whatsapp: "Falar no WhatsApp",
  site: "resetia.com.br",
};
