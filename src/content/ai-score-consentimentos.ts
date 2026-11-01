/**
 * Textos de consentimento e de finalidade, com a versão registrada junto de cada escolha (tabela `consentimentos`).
 * Receber o relatório, receber conteúdo e pedir uma análise com especialistas são escolhas distintas. Quem muda um
 * destes textos precisa subir CONSENTIMENTOS_VERSAO: um teste confere a impressão digital do texto contra a versão.
 */
export const CONSENTIMENTOS_VERSAO = "2026-11-01";

export const textosDeConsentimento = {
  /** Etapa 2: a empresa completa o relatório, que também vai para o e-mail informado. */
  relatorioEmail: "Usamos a empresa para completar o seu relatório, que também enviamos para o seu e-mail.",
  /** Caixa desmarcada por padrão, nas duas etapas. */
  conteudoEmail: "Quero receber conteúdos da Reset IA sobre IA nos negócios.",
  /** Caixa desmarcada por padrão; vale para e-mail e, se informado, WhatsApp e ligação. */
  contatoAnalise: "Quero que um especialista da Reset fale comigo sobre o resultado.",
  contatoAnaliseCanais: "Ligação ou WhatsApp de um especialista, só se você pedir.",
};
