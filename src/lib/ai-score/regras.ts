import type { DesafioId, DimensaoId, Escopo, HorizonteId, PapelId, PorteId } from "@/content/types";

/**
 * Regras numéricas do RESET AI Score: limites, mapa de recomendação e pesos do lead score.
 * Proposta inicial a calibrar com as primeiras aplicações. Mudar aqui muda o resultado de todo mundo,
 * inclusive de quem já respondeu (o resultado é recalculado a partir das respostas).
 */
export const regras = {
  /** Resultado consolidado exige ao menos 10 das 12 respostas válidas e uma em cada dimensão. */
  minimoRespondidas: 10,
  /** Faixas da leitura por dimensão: abaixo de 40 "a estruturar", de 40 a 74 "em evolução", 75 ou mais "consolidada". */
  faixas: { mediaDesde: 40, altaDesde: 75 },
  /** Ponto forte só quando a maior dimensão chega a 50 e fica acima da menor. */
  forteMinimo: 50,

  /** Soluções na ordem de desempate (a mesma do portfólio). */
  ordemSolucoes: ["ai-champions", "processos-com-ia", "agent-factory", "governance", "performance"],
  dimensaoSolucao: {
    estrategia: "ai-champions",
    pessoas: "ai-champions",
    processos: "processos-com-ia",
    dados: "processos-com-ia",
    governanca: "governance",
    resultados: "performance",
  } satisfies Record<DimensaoId, string>,
  desafioSolucoes: {
    comecar: ["ai-champions"],
    "pouco-uso": ["ai-champions"],
    capacitar: ["ai-champions"],
    repetitivas: ["processos-com-ia", "agent-factory"],
    agentes: ["agent-factory"],
    "custo-ferramentas": ["agent-factory"],
    governanca: ["governance"],
    medir: ["performance"],
  } satisfies Record<DesafioId, string[]>,
  /** Pontos para a solução da menor, da segunda e da terceira menor dimensão. */
  pesosLacunas: [3, 2, 1],
  /** Pontos por desafio informado. */
  pesoDesafio: 2,
  maxSolucoes: 2,
  /** Abaixo disso (nível Inicial) a indicação é fixa: capacitação e mapeamento de oportunidades. */
  inicialAbaixoDe: 20,
  inicialSolucoes: ["ai-champions", "processos-com-ia"],
  /** Performance só faz sentido com iniciativas em andamento. */
  minimoPerformance: 40,
  /** Agent Factory só a partir de alguma maturidade, ou quando a pessoa já quer criar agentes. */
  minimoAgentFactory: 40,

  /**
   * Lead score (0 a 100), separado do AI Score: aderência ao público, papel, intenção e interesse no contato.
   * Calculado no admin a partir das respostas, então recalibrar aqui vale para todos os leads.
   */
  leadScore: {
    papel: { ceo: 25, diretor: 20, gestor: 15, coordenador: 8, especialista: 4, outro: 0 } satisfies Record<
      PapelId,
      number
    >,
    horizonte: { imediato: 25, "3-meses": 16, "6-meses": 8, explorando: 0 } satisfies Record<HorizonteId, number>,
    porte: { "ate-10": 4, "11-49": 12, "50-199": 20, "200-499": 20, "500-mais": 16 } satisfies Record<PorteId, number>,
    escopo: { empresa: 5, marketing: 0, vendas: 0, "customer-success": 0 } satisfies Record<Escopo, number>,
    temDesafio: 5,
    emailCorporativo: 5,
    whatsapp: 5,
    pediuContato: 10,
  },
};
