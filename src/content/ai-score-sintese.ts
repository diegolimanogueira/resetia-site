import { QUEM } from "@/lib/ai-score/quem";
import type { DesafioId, DimensaoId } from "./types";

/**
 * Textos da SÍNTESE do RESET AI Score (resumo executivo, lacunas, oportunidades a investigar, indicações e plano de
 * 90 dias). Montados no motor (`sintese.ts`) e entregues prontos na devolutiva, que é a mesma para a tela, o PDF, o
 * e-mail e a ficha comercial. Nada aqui afirma um fato sobre a empresa: o que não vem de uma resposta é hipótese,
 * e vem dito como hipótese. Sem nomes, prazos de implantação, metas ou valores. Texto novo é texto a revisar com o Diego.
 */

export const resumo = {
  titulo: "Resumo executivo",
  rotulos: {
    cenario: "Cenário identificado",
    atencao: "O que merece atenção",
    sustentacao: "Respostas que sustentam essa leitura",
    consequencia: "Consequência declarada e hipótese",
    "primeira-acao": "Primeira ação sugerida",
    validar: "O que validar antes de escolher uma solução",
  },
  cenario: {
    parcial: (validas: number, total: number) =>
      `${QUEM} tem um resultado parcial: ${validas} de ${total} respostas válidas, o que não basta para uma nota consolidada.`,
    nivel: (nivel: string, indice: number) => `${QUEM} está no nível ${nivel}, com AI Score ${indice} de 100.`,
    completa: (total: number) => `Nota calculada com ${total} de ${total} respostas.`,
    estimativa: (validas: number, total: number) =>
      `Nota estimada: ${validas} de ${total} respostas válidas, com "Não sei" fora da média.`,
  },
  atencao: {
    lacuna: (dimensao: string, nota: string) => `${dimensao} é a dimensão mais frágil, com nota ${nota} de 100.`,
    alerta: (titulo: string) => `Ponto de atenção: ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}.`,
    semLacunaComAlerta: (titulo: string) =>
      `Nenhuma dimensão ficou abaixo de 70, mas há um ponto de atenção: ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}.`,
    nenhuma:
      "Nenhuma fragilidade apareceu nas respostas: as dimensões com nota estão em 70 ou mais. Vale confirmar na prática.",
    parcial: (dimensao: string, nota: string) =>
      `Sem nota consolidada. Com o que foi respondido, a dimensão mais frágil é ${dimensao}, com nota ${nota} de 100.`,
    semNota:
      "Sem nota consolidada, não dá para apontar a dimensão mais frágil. Os pontos cegos mostram onde falta visibilidade.",
  },
  sustentacao: {
    nenhuma: "Sem respostas válidas para apontar.",
  },
  consequencia: {
    declarada: (desafio: string) => `Você apontou como desafio: ${desafio.charAt(0).toLowerCase()}${desafio.slice(1)}`,
    semDeclarada: "O questionário não registrou nenhuma consequência declarada.",
    hipotese: (texto: string) => `Hipótese, a validar: ${texto}`,
  },
  validar: {
    generico: "Confirmar com a equipe, na prática, as respostas que sustentam esta leitura.",
  },
};

/** O que a dimensão fraca pode estar custando. Sempre como hipótese: o questionário não mede consequências. */
export const hipoteses: Record<DimensaoId, string> = {
  estrategia:
    "sem prioridades e um responsável definidos, as iniciativas de IA tendem a se espalhar sem ligação com as metas do negócio.",
  pessoas: "sem capacitação e uso estruturado, o investimento em ferramentas tende a ficar subutilizado.",
  processos: "com processos pouco mapeados e pouca IA na execução, o esforço repetitivo tende a continuar manual.",
  dados: "com dados dispersos e ferramentas sem gestão, as aplicações de IA tendem a ser limitadas e pouco confiáveis.",
  governanca:
    "sem regras e controle de qualidade e de risco, o uso de IA pode expor dados sensíveis e gerar decisões sem verificação.",
  resultados: "sem acompanhamento, fica difícil saber o que funciona e onde vale investir.",
};

export const lacunas = {
  vazio:
    "Nenhuma dimensão ficou abaixo de 70: pelas respostas, não há lacuna de maturidade a corrigir agora. O foco passa a ser confirmar na prática e escolher a próxima iniciativa.",
  criterios: {
    desafio: "Empatadas na nota, vem antes a que você apontou como desafio.",
    "resposta-mais-baixa": "Empatadas na nota, vem antes a que tem a resposta mais baixa.",
    dependencia:
      "Empatadas em tudo o mais, vem antes a que serve de base para as outras: direção, regras, dados, processos, pessoas e resultados.",
    "evidencia-direta": "Empatadas nos pontos, vem antes a que tem mais evidência direta.",
  },
};

interface TextoDoDesafio {
  titulo: string;
  hipotese: string;
  perguntas: string[];
}

/** Oportunidades de negócio a investigar: o que a pessoa apontou, como hipótese, com as perguntas que decidem. */
export const oportunidades = {
  titulo: "Oportunidades a investigar",
  nota: "O que você apontou como desafio, lido contra as suas respostas. São hipóteses para validar, não indicações.",
  vazio: "Nenhum desafio foi informado: não há oportunidade declarada para investigar.",
  situacoes: {
    sustentado: "As suas respostas sustentam este desafio.",
    contradiz: "As suas respostas apontam o contrário: validar antes de seguir.",
    "sem-resposta": "Sem respostas na dimensão deste desafio: validar.",
  },
  perguntas: "Perguntas que decidem:",
  condicoes: "O que precisa estar pronto:",
  itens: {
    comecar: {
      titulo: "Escolher por onde começar",
      hipotese: "Dois ou três casos de uso prioritários, cada um com responsável e meta, podem dar foco ao início.",
      perguntas: ["Quais processos mais consomem tempo ou geram retrabalho?", "Quem responderia por cada caso de uso?"],
    },
    "pouco-uso": {
      titulo: "Levar as ferramentas contratadas à rotina",
      hipotese: "O uso pode crescer com casos práticos em cada área e acompanhamento de quem usa.",
      perguntas: [
        "Quais ferramentas já estão contratadas e quantas pessoas as usam?",
        "Em quais atividades elas fariam diferença?",
      ],
    },
    capacitar: {
      titulo: "Capacitar gestores e equipes",
      hipotese: "Uma trilha ligada às atividades de cada área tende a funcionar melhor que um treinamento genérico.",
      perguntas: ["Quem precisa de qual nível de capacitação?", "Que atividades reais serviriam de exercício?"],
    },
    repetitivas: {
      titulo: "Reduzir tarefas repetitivas",
      hipotese: "As tarefas de maior volume e de regra mais clara costumam ser as melhores candidatas.",
      perguntas: [
        "Quais tarefas se repetem mais e quanto tempo tomam?",
        "As regras dessas tarefas estão claras e documentadas?",
      ],
    },
    agentes: {
      titulo: "Avaliar um primeiro agente",
      hipotese:
        "Um agente para uma dor específica pode ser viável, mas depende de processo mapeado, dados acessíveis e controles. O pedido sozinho não prova que existam.",
      perguntas: [
        "Qual dor específica o agente resolveria e como ela é tratada hoje?",
        "Os dados e os controles necessários estão disponíveis?",
      ],
    },
    "custo-ferramentas": {
      titulo: "Revisar ferramentas e custos",
      hipotese: "Pode haver ferramentas sobrepostas ou pouco usadas.",
      perguntas: ["Quais ferramentas existem, quanto custam e quem as usa?", "Quais delas têm resultado acompanhado?"],
    },
    governanca: {
      titulo: "Definir regras de uso",
      hipotese: "Regras mínimas sobre dados permitidos e revisão humana reduzem o risco com pouco esforço.",
      perguntas: ["Quais dados circulam nas ferramentas de IA hoje?", "Quem aprova novos usos?"],
    },
    medir: {
      titulo: "Passar a medir resultados",
      hipotese: "Sem indicador e linha de base, não dá para saber se uma iniciativa funcionou.",
      perguntas: ["Qual indicador importa e como é medido hoje?", "Existe um ponto de partida registrado?"],
    },
  } satisfies Record<DesafioId, TextoDoDesafio>,
};

export const indicacoes = {
  titulo: "Onde a Reset entra",
  nota: "Cada indicação mostra em que se apoia e o que ainda precisa ser confirmado. No máximo duas soluções principais.",
  forca: {
    indicada: "Indicada pelas respostas",
    investigar: "A investigar antes de indicar",
  },
  semIndicacao: {
    manutencao:
      "As respostas não mostram uma lacuna que justifique indicar uma solução agora. O mais útil é manter o acompanhamento e validar na prática. Se houver uma dor específica, a Análise Estratégica pode ajudar a testá-la.",
    parcial: "Sem nota consolidada, não indicamos soluções. Complete as respostas para ver a indicação.",
  },
  apoio: {
    dimensao: (nome: string, nota: string) => `${nome} está em ${nota}.`,
    desafio: (label: string) => `Você apontou: ${label.charAt(0).toLowerCase()}${label.slice(1)}`,
  },
  semApoioDireto:
    "As respostas não mostram evidência direta para esta solução. Vale confirmar se é este o problema antes de indicá-la.",
  condicoes: {
    titulo: "O que ainda precisa ser confirmado",
    atendida: "atendida",
    pendente: (alternativa: string) => `ainda não: você respondeu «${alternativa}»`,
    "sem-resposta": "sem resposta: validar",
    estagio: (tema: string, minimo: number) => `Resposta sobre ${tema} no ${minimo + 1}º estágio da escala ou além`,
  },
};

export const plano = {
  titulo: "Roteiro de 90 dias",
  nota: "Roteiro inicial, para validar com a sua equipe. A ordem importa mais que as datas: cada etapa depende das anteriores. Não é promessa de prazo de implantação nem de resultado.",
  rotulos: {
    responsavel: "Responsável sugerido",
    entrega: "Entrega verificável",
    indicador: "Indicador",
    depende: "Depende de",
    semDependencia: "Pode começar já",
  },
  fases: {
    1: { periodo: "Dias 1 a 30", nome: "Organizar a base" },
    2: { periodo: "Dias 31 a 60", nome: "Executar com controle" },
    3: { periodo: "Dias 61 a 90", nome: "Medir e decidir" },
  },
  desafio: (label: string, passo: string) => `Você apontou: ${label.charAt(0).toLowerCase()}${label.slice(1)} ${passo}`,
  /** Cada etapa: o que fazer, quem (um papel, nunca um nome), o que se entrega, como se mede e do que depende. */
  etapas: {
    revisar: {
      fase: 1,
      titulo: "Confirmar o que já funciona",
      acao: "Rever os controles, os indicadores e o uso atual para confirmar que as respostas valem na prática.",
      responsavel: "Quem lidera o tema de IA na empresa",
      entrega: "Lista do que foi confirmado e do que mudou",
      indicador: "Quais respostas foram confirmadas na prática, e quais não",
    },
    problema: {
      fase: 1,
      titulo: "Definir o problema, o responsável e o indicador",
      acao: "Escolher um processo ou uma dor específica, nomear quem responde por ele e definir o indicador que mostrará se melhorou.",
      responsavel: "Quem lidera o tema de IA, com o gestor da área (a definir pela empresa)",
      entrega: "Uma página com o problema, o responsável e o indicador escolhidos",
      indicador: "Definido nesta etapa: sem ele, o roteiro não segue",
    },
    "linha-de-base": {
      fase: 1,
      titulo: "Registrar a situação de hoje (linha de base)",
      acao: "Medir o indicador escolhido como a rotina funciona hoje, antes de qualquer mudança.",
      responsavel: "Gestor do processo",
      entrega: "Valores atuais do indicador, com data e fonte da medição",
      indicador: "O indicador definido na etapa anterior",
    },
    controles: {
      fase: 1,
      titulo: "Definir regras mínimas de uso",
      acao: "Combinar quais dados podem ou não ir para ferramentas de IA, quem aprova novos usos e como a revisão humana acontece.",
      responsavel: "Quem lidera o tema de IA, com jurídico ou TI, se houver",
      entrega: "Regras de uso divulgadas a quem vai participar",
      indicador: "Se as regras foram divulgadas e se há registro de quem aprova novos usos",
    },
    capacitacao: {
      fase: 2,
      titulo: "Preparar quem vai executar e quem vai decidir",
      acao: "Capacitar as pessoas envolvidas com exemplos do próprio trabalho, antes de ampliar o uso.",
      responsavel: "Quem lidera o tema de IA, com a liderança da área",
      entrega: "Participantes preparados e exemplos de uso do próprio trabalho registrados",
      indicador: "Quem participou e quem já usa na rotina",
    },
    dados: {
      fase: 2,
      titulo: "Organizar os dados mínimos do processo",
      acao: "Reunir e organizar os dados de que o processo escolhido precisa, em um lugar acessível e com um responsável.",
      responsavel: "Gestor do processo, com a área de TI ou de dados",
      entrega: "Os dados do processo em um lugar acessível, com responsável definido",
      indicador: "Se os dados necessários estão disponíveis para o piloto, por fonte",
    },
    piloto: {
      fase: 2,
      titulo: "Executar um piloto controlado",
      acao: "Aplicar a IA no processo escolhido por um período curto, com revisão humana e registro do que acontece.",
      responsavel: "Gestor do processo, com apoio de quem lidera o tema",
      entrega: "Registro do piloto: o que foi feito, onde a IA errou e o que precisou de revisão",
      indicador: "O indicador escolhido, medido durante o piloto",
    },
    avaliacao: {
      fase: 3,
      titulo: "Comparar com a linha de base e decidir",
      acao: "Comparar o indicador do piloto com a linha de base e decidir se amplia, ajusta ou encerra.",
      responsavel: "Quem lidera o tema, com o gestor do processo e a liderança",
      entrega: "Uma decisão registrada, com os números e as razões",
      indicador: "O indicador do piloto contra a linha de base",
    },
    expansao: {
      fase: 3,
      titulo: "Ampliar com controle, se a avaliação sustentar",
      acao: "Se a avaliação sustentar, levar o que funcionou a outra equipe ou processo, mantendo as regras e a capacitação.",
      responsavel: "Quem lidera o tema, com as áreas envolvidas",
      entrega: "Plano de ampliação com responsável e indicador por área",
      indicador: "O mesmo indicador, medido em cada nova área",
    },
    reavaliar: {
      fase: 3,
      titulo: "Refazer o AI Score",
      acao: "Refazer o AI Score para medir a evolução, na mesma metodologia.",
      responsavel: "Quem lidera o tema de IA",
      entrega: "Novo resultado, comparável com este (mesmo método)",
      indicador: "AI Score e notas por dimensão, comparados",
    },
  },
};

export type EtapaId = keyof typeof plano.etapas;
