/**
 * Textos de consentimento e de finalidade, com a versão registrada junto de cada escolha (tabela `consentimentos`).
 * Receber o relatório, receber conteúdo e pedir uma análise com especialistas são escolhas distintas. Quem muda um
 * destes textos precisa subir CONSENTIMENTOS_VERSAO: um teste confere a impressão digital do texto contra a versão.
 */
export const CONSENTIMENTOS_VERSAO = "2026-11-02";

export const textosDeConsentimento = {
  /** Etapa 2: a empresa completa o relatório, que também vai para o e-mail informado. */
  relatorioEmail: "Usamos a empresa para completar o seu relatório, que também enviamos para o seu e-mail.",
  /** Caixa desmarcada por padrão, nas duas etapas. */
  conteudoEmail: "Quero receber conteúdos da Reset IA sobre IA nos negócios.",
  /** Caixa desmarcada por padrão; vale para e-mail e, se informado, WhatsApp e ligação. */
  contatoAnalise: "Quero que um especialista da Reset fale comigo sobre o resultado.",
  contatoAnaliseCanais: "Ligação ou WhatsApp de um especialista, só se você pedir.",
};

/**
 * Texto de cada escolha na página de preferências (link do e-mail). A pessoa pode mudar o que escolheu antes;
 * cada mudança vira um evento com esta versão. A equipe só registra revogação, nunca concede.
 */
export const textosDePreferencias = {
  relatorioEmail: "Receber por e-mail o relatório do meu resultado.",
  conteudoEmail: textosDeConsentimento.conteudoEmail,
  contatoEmail: "Receber contato de um especialista da Reset por e-mail, sobre o meu resultado.",
  contatoWhatsapp: "Receber contato de um especialista da Reset por WhatsApp, sobre o meu resultado.",
  contatoLigacao: "Receber uma ligação de um especialista da Reset, sobre o meu resultado.",
};
