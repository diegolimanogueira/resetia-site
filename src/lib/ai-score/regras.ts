import type { DesafioId, DimensaoId, Escopo, HorizonteId, PapelId, PorteId } from "@/content/types";

/**
 * Parâmetros de ANÁLISE do RESET AI Score: faixas de leitura, limites dos alertas, mapa de recomendação e pesos do
 * lead score. Proposta inicial a calibrar com as primeiras aplicações.
 *
 * A regra numérica da NOTA (pontos de cada alternativa, peso da menor dimensão, mínimo de respostas, faixas dos
 * níveis) não mora aqui: está no método versionado e congelado, em `metodo/`. Mudar uma regra de análise exige subir
 * `ANALISE_ATUAL` em `versoes.ts`; as avaliações novas passam a trazer a versão nova e as antigas continuam
 * identificadas pela que tinham.
 */
export const regras = {
  /** Faixas da leitura por dimensão: abaixo de 40 "a estruturar", de 40 a 69 "em evolução", 70 ou mais "consolidada". */
  faixas: { mediaDesde: 40, altaDesde: 70 },
  /** Prioridade de cada dimensão no relatório: crítica abaixo de 20, alta abaixo de 40, média abaixo de 70. */
  prioridades: { critica: 20, alta: 40, media: 70 },
  /** Ponto forte só quando a maior dimensão chega a 50 e fica acima da menor. */
  forteMinimo: 50,
  /** Lacuna de maturidade: dimensão abaixo disto (o início da faixa "consolidada"). Tudo acima não é lacuna. */
  lacunaAbaixoDe: 70,
  /**
   * Ordem de dependência das dimensões, usada só como ÚLTIMO critério de desempate, nunca como ordem do array:
   * direção e responsáveis primeiro, depois as regras e os controles, os dados, os processos que os usam, as
   * pessoas que executam e, por fim, os resultados, que medem o que as demais produzem.
   */
  ordemDependencia: ["estrategia", "governanca", "dados", "processos", "pessoas", "resultados"] satisfies DimensaoId[],

  /** Simulação de evolução: as dimensões abaixo do primeiro alvo sobem até ele (40, depois 70). */
  alvosSimulacao: [40, 70],
  /** Alertas que dependem de contagem ou de diferença entre dimensões (os demais são decididos por perguntas). */
  alertas: {
    pontosCegos: 2,
    desequilibrio: 50,
  },

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
  /** Pontos para a solução da menor, da segunda e da terceira posição entre as lacunas (empatadas dividem a posição). */
  pesosLacunas: [3, 2, 1],
  /** Pontos por desafio informado, e só quando as respostas da dimensão do desafio não o contradizem. */
  pesoDesafio: 2,
  maxSolucoes: 2,
  /**
   * O que conta como evidência DIRETA para uma solução. Sem ela, a solução fica como "a investigar", nunca como
   * indicada: uma dimensão fraca em Estratégia, por exemplo, não prova que falte capacitação, e um pedido de agentes
   * não prova que existam dados, processos e controles para eles.
   */
  evidenciaDireta: {
    "ai-champions": { dimensoes: ["pessoas"], desafios: ["capacitar", "pouco-uso", "comecar"] },
    "processos-com-ia": { dimensoes: ["processos", "dados"], desafios: ["repetitivas"] },
    "agent-factory": { dimensoes: [], desafios: ["agentes", "custo-ferramentas", "repetitivas"] },
    governance: { dimensoes: ["governanca"], desafios: ["governanca"] },
    performance: { dimensoes: ["resultados"], desafios: ["medir"] },
  } satisfies Record<string, { dimensoes: DimensaoId[]; desafios: DesafioId[] }>,
  /**
   * Condições para a solução poder ser indicada (resposta mínima por pergunta). Resposta abaixo do mínimo é pendência;
   * "Não sei" é "sem resposta". Enquanto houver pendência, a solução sai como "a investigar".
   */
  prontidao: {
    "agent-factory": [
      { ref: "p5", minimo: 2 },
      { ref: "p7", minimo: 2 },
      { ref: "p9", minimo: 2 },
    ],
    performance: [{ ref: "p3", minimo: 1 }],
  } satisfies Record<string, Array<{ ref: string; minimo: number }>>,

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
