import type { DimensaoId } from "./types";

/**
 * Textos da ANÁLISE do RESET AI Score (versão 2): leituras por dimensão, alertas e rótulos de evidência.
 * Escritos para serem verdadeiros para todas as combinações de respostas em que aparecem: cada texto declara em
 * `afirma` (ou pelo padrão de leitura) as respostas que o sustentam, e os testes percorrem todas as combinações.
 * Texto novo é texto a revisar com o Diego.
 *
 * Este arquivo só entra no chunk sob demanda do motor de análise: a tela recebe os textos já montados.
 */

export type PadraoLeitura =
  "alinhado-inicial" | "alinhado-intermediario" | "alinhado-avancado" | "primeira-a-frente" | "segunda-a-frente";

interface Papel {
  nome: string;
  plural?: true;
}

/** O tema de cada uma das duas perguntas de uma dimensão, na ordem do questionário. */
const papeis: Record<DimensaoId, { primeira: Papel; segunda: Papel }> = {
  estrategia: {
    primeira: { nome: "os objetivos de IA", plural: true },
    segunda: { nome: "a liderança do tema" },
  },
  pessoas: {
    primeira: { nome: "o uso da IA pelas equipes" },
    segunda: { nome: "a capacitação dos profissionais" },
  },
  processos: {
    primeira: { nome: "o mapeamento dos processos" },
    segunda: { nome: "a participação da IA na execução" },
  },
  dados: {
    primeira: { nome: "a organização dos dados" },
    segunda: { nome: "a gestão das ferramentas de IA" },
  },
  governanca: {
    primeira: { nome: "as regras de uso", plural: true },
    segunda: { nome: "o controle da qualidade e dos riscos" },
  },
  resultados: {
    primeira: { nome: "o acompanhamento dos resultados" },
    segunda: { nome: "os resultados já obtidos", plural: true },
  },
};

/**
 * Quando uma das duas respostas está bem à frente da outra (duas ou mais posições), o que vale fazer. São sugestões:
 * não afirmam nada sobre a empresa, que já está dito (e provado pelas respostas) na frase do padrão.
 */
const acoes: Record<DimensaoId, { "primeira-a-frente": string; "segunda-a-frente": string }> = {
  estrategia: {
    "primeira-a-frente": "Vale definir quem responde pelas iniciativas e pelos objetivos e acompanha os resultados.",
    "segunda-a-frente": "Vale transformar essa liderança em prioridades e metas explícitas.",
  },
  pessoas: {
    "primeira-a-frente": "Vale estruturar a capacitação a partir do que as equipes já fazem com a IA.",
    "segunda-a-frente": "Vale levar o que foi aprendido para atividades reais e acompanhar a adoção.",
  },
  processos: {
    "primeira-a-frente":
      "Vale escolher um processo já identificado e levar a IA a executar etapas dele, com responsável e controle.",
    "segunda-a-frente": "Vale registrar e estruturar o que já funciona antes de ampliar o uso.",
  },
  dados: {
    "primeira-a-frente": "Vale coordenar as ferramentas de IA para aproveitar essa base de dados.",
    "segunda-a-frente": "Vale organizar os dados das aplicações prioritárias para que as ferramentas rendam.",
  },
  governanca: {
    "primeira-a-frente":
      "Vale transformar as regras em critérios de revisão das respostas e das decisões apoiadas por IA.",
    "segunda-a-frente": "Vale formalizar as regras de uso e comunicá-las às equipes.",
  },
  resultados: {
    "primeira-a-frente": "Vale concentrar as iniciativas em casos que esse acompanhamento consiga medir.",
    "segunda-a-frente": "Vale definir indicadores e uma linha de base para registrar esses resultados.",
  },
};

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const CONTRACAO = { o: "do", a: "da", os: "dos", as: "das" } as const;
/** "de" + o tema: "a liderança do tema" vira "da liderança do tema". */
const de = (tema: string) =>
  tema.replace(/^(os|as|o|a) /, (_, artigo: keyof typeof CONTRACAO) => `${CONTRACAO[artigo]} `);
const estao = (p: Papel) => (p.plural ? "estão" : "está");

/**
 * Respostas (níveis 0 a 4) em que cada padrão vale, para a primeira e a segunda pergunta. É a declaração de quando
 * o texto do padrão é verdadeiro; os testes conferem que o motor só o escolhe dentro dela.
 */
export const afirmaDoPadrao: Record<PadraoLeitura, readonly [readonly number[], readonly number[]]> = {
  "alinhado-inicial": [
    [0, 1],
    [0, 1],
  ],
  "alinhado-intermediario": [
    [1, 2, 3],
    [1, 2, 3],
  ],
  "alinhado-avancado": [
    [3, 4],
    [3, 4],
  ],
  "primeira-a-frente": [
    [2, 3, 4],
    [0, 1, 2],
  ],
  "segunda-a-frente": [
    [0, 1, 2],
    [2, 3, 4],
  ],
};

export const leitura = {
  papeis,
  padrao: (padrao: PadraoLeitura, dimensao: DimensaoId): string => {
    const { primeira, segunda } = papeis[dimensao];
    switch (padrao) {
      case "alinhado-inicial":
        return `${maiuscula(primeira.nome)} e ${segunda.nome} ficam nos primeiros estágios da escala.`;
      case "alinhado-intermediario":
        return `As respostas sobre ${primeira.nome} e ${segunda.nome} ficam em estágios próximos, no meio da escala.`;
      case "alinhado-avancado":
        return `${maiuscula(primeira.nome)} e ${segunda.nome} ficam entre os estágios mais avançados da escala.`;
      case "primeira-a-frente":
        return `${maiuscula(primeira.nome)} ${estao(primeira)} à frente ${de(segunda.nome)}. ${acoes[dimensao][padrao]}`;
      case "segunda-a-frente":
        return `${maiuscula(segunda.nome)} ${estao(segunda)} à frente ${de(primeira.nome)}. ${acoes[dimensao][padrao]}`;
    }
  },
  /** As duas respostas apontam estágios bem diferentes: a leitura pede para entender o porquê. */
  divergente:
    "As duas respostas apontam estágios bem diferentes. Vale entender o motivo antes de decidir o próximo passo.",
  /** Próximo estágio do tema mais baixo (cita a alternativa seguinte, literal). */
  proximo: (tema: string, alternativa: string) => `O próximo estágio ${de(tema)} seria: «${alternativa}»`,
  estagioMaisAlto: (tema?: string) =>
    tema
      ? `A resposta sobre ${tema} já está no estágio mais avançado da escala.`
      : "As duas respostas já estão no estágio mais avançado da escala.",
  /** Uma das duas respostas ficou como "Não sei responder". */
  umaResposta: (tema: string) =>
    `A resposta sobre ${tema} ficou como "Não sei responder": esta leitura se apoia em uma única resposta.`,
  semDados: "As duas perguntas desta dimensão ficaram sem resposta válida: não há leitura possível.",
};

/** Alertas: padrões entre respostas que merecem atenção. Cada um cita as respostas que o sustentam. */
export const alertas = {
  itens: {
    inicio: {
      titulo: "A jornada está por começar",
      texto:
        "Todas as suas respostas válidas ficaram nos dois primeiros estágios da escala. A vantagem é poder começar do jeito certo, com objetivos, pessoas preparadas e regras claras desde o início.",
    },
    "adocao-sem-governanca": {
      titulo: "O uso está à frente das regras",
      texto:
        "Suas respostas indicam uso de IA por grupos da equipe e regras ainda informais ou inexistentes. É nesse cenário que dados sensíveis e decisões sem verificação podem virar risco. Vale validar quais dados circulam nas ferramentas hoje.",
    },
    "uso-sem-direcao": {
      titulo: "O uso avança sem direção declarada",
      texto:
        "Suas respostas indicam uso de IA por grupos da equipe, sem prioridades definidas e sem quem lidere o tema. As iniciativas podem se espalhar sem conexão com as metas do negócio.",
    },
    "ferramentas-sem-resultado": {
      titulo: "Ferramentas sem acompanhamento de resultados",
      texto:
        "Suas respostas indicam ferramentas contratadas, mas nenhum acompanhamento de resultados além de percepções informais. Fica difícil saber o que funciona e onde vale investir.",
    },
    "estrategia-sem-execucao": {
      titulo: "Direção definida, pouca execução",
      texto:
        "Suas respostas indicam prioridades ou objetivos para a IA, mas a IA ainda não participa da execução das atividades de forma compartilhada. Sem ligar a direção a um processo concreto, a estratégia pode não virar resultado.",
    },
    "processos-sem-dados": {
      titulo: "A IA participa, mas os dados ainda não acompanham",
      texto:
        "Suas respostas indicam IA participando de atividades de forma compartilhada, com dados dispersos ou fragmentados. Sem dados organizados, as aplicações tendem a ficar limitadas e pouco confiáveis.",
    },
    "lideranca-a-frente": {
      titulo: "Liderança à frente das equipes",
      texto:
        "Suas respostas indicam uma liderança formal para o tema, mas pouca ou nenhuma capacitação das equipes. A capacitação costuma ser o que transforma a intenção em prática.",
    },
    "pontos-cegos": {
      titulo: "Pouca visibilidade sobre o próprio cenário",
      texto:
        "Várias respostas ficaram como Não sei responder. Elas ficam fora da média e a nota passa a ser uma estimativa. Quando a liderança não enxerga como a IA é usada, controlar riscos e medir ganhos fica difícil.",
    },
    desequilibrio: {
      titulo: "Maturidade desigual entre as dimensões",
      texto:
        "Algumas dimensões estão bem à frente de outras. Pela metodologia da Reset, a dimensão mais fraca pesa mais no AI Score e, na prática, a evolução tende a ficar presa a ela.",
    },
  },
} as const;
