import type { EventoAiScore } from "@/lib/analytics-eventos";

/**
 * O que cada evento do RESET AI Score mede e o denominador natural da taxa. Fica fora do código do site (só testes,
 * o painel e a documentação leem): a página não precisa carregar descrições para registrar um evento.
 */
export const descricaoDosEventos: Record<EventoAiScore, { mede: string; denominador: string }> = {
  ai_score_abertura: { mede: "Abriu o questionário", denominador: "visitas da página do AI Score" },
  ai_score_primeira_interacao: {
    mede: "Respondeu a primeira pergunta de segmentação",
    denominador: "aberturas do questionário",
  },
  ai_score_inicio: { mede: "Concluiu a segmentação e foi para as perguntas", denominador: "aberturas do questionário" },
  ai_score_etapa: { mede: "Avançou uma etapa", denominador: "segmentações concluídas" },
  ai_score_concluido: { mede: "Terminou o questionário", denominador: "segmentações concluídas" },
  ai_score_contato: { mede: "Contato aceito pelo servidor (nome e e-mail)", denominador: "questionários concluídos" },
  ai_score_lead: { mede: "Pediu o relatório completo (empresa informada)", denominador: "contatos aceitos" },
  ai_score_aprofundamento_inicio: { mede: "Começou o aprofundamento", denominador: "relatórios liberados" },
  ai_score_aprofundamento_salvo: { mede: "Salvou o aprofundamento", denominador: "aprofundamentos iniciados" },
  ai_score_aprofundamento_pulado: { mede: "Escolheu não responder agora", denominador: "relatórios liberados" },
  ai_score_download: { mede: "Baixou o PDF ou imprimiu", denominador: "relatórios liberados" },
  ai_score_email_aceito: { mede: "Provedor de e-mail aceitou o relatório", denominador: "relatórios liberados" },
  ai_score_email_falhou: { mede: "Envio do relatório por e-mail falhou", denominador: "relatórios liberados" },
};
