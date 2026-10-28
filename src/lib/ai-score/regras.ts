import type { DesafioId, DimensaoId, Escopo, HorizonteId, PapelId, PorteId } from "@/content/types";

/**
 * Regras numéricas do RESET AI Score: limites, mapa de recomendação e pesos do lead score.
 * Proposta inicial a calibrar com as primeiras aplicações. Mudar aqui muda o resultado de todo mundo,
 * inclusive de quem já respondeu (o resultado é recalculado a partir das respostas).
 */
export const regras = {
  /**
   * Escala progressiva (28/10, pedido do Diego: avaliação mais exigente). Pontos de cada alternativa, da 1ª à 5ª:
   * o que é individual ou pontual vale bem menos do que o que é estruturado e integrado. Linear seria 0, 25, 50, 75, 100.
   */
  pontos: [0, 15, 40, 70, 100] as const,
  /** A dimensão mais fraca conta este número de vezes no AI Score (1 = média simples das seis). */
  pesoMenorDimensao: 2,
  /** Resultado consolidado exige ao menos 10 das 12 respostas válidas e uma em cada dimensão. */
  minimoRespondidas: 10,
  /** Faixas da leitura por dimensão: abaixo de 40 "a estruturar", de 40 a 69 "em evolução", 70 ou mais "consolidada". */
  faixas: { mediaDesde: 40, altaDesde: 70 },
  /** Prioridade de cada dimensão no relatório: crítica abaixo de 20, alta abaixo de 40, média abaixo de 70. */
  prioridades: { critica: 20, alta: 40, media: 70 },
  /** Ponto forte só quando a maior dimensão chega a 50 e fica acima da menor. */
  forteMinimo: 50,

  /** Simulação de evolução: as dimensões abaixo do primeiro alvo sobem até ele (40, depois 70). */
  alvosSimulacao: [40, 70],
  /** Alertas: limites de cada padrão (ver analisar.ts) e quantos mostrar. */
  alertas: {
    avancou: 40,
    atrasou: 40,
    estrategiaForte: 55,
    semDirecao: 30,
    dadosFrageis: 30,
    pontosCegos: 2,
    desequilibrio: 50,
    inicio: 20,
    maximo: 3,
  },

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
    porte: { "ate-10": 3, "11-49": 10, "50-199": 15, "200-499": 15, "500-mais": 12 } satisfies Record<PorteId, number>,
    escopo: { empresa: 5, marketing: 0, vendas: 0, "customer-success": 0 } satisfies Record<Escopo, number>,
    temDesafio: 5,
    emailCorporativo: 5,
    whatsapp: 5,
    /** Pediu o relatório completo (informou a empresa). */
    relatorioCompleto: 5,
    pediuContato: 10,
  },
};
