import type { Pendencia } from "@/lib/ai-score/fila-conversas";
import type { TipoMarco } from "@/lib/supabase-admin";

/**
 * Textos do /admin para a fila de pedidos de conversa, a operação do servidor, a ficha de preparação, os marcos do
 * funil e os canais permitidos. Texto novo é texto a revisar com o Diego.
 */

export const adminFila = {
  titulo: "Pedidos de conversa",
  texto:
    "Quem pediu para falar com um especialista. Quem apenas concluiu a avaliação não entra aqui nem em nenhuma cadência de mensagens.",
  vazio: "Nenhum pedido de conversa em aberto.",
  resumo: {
    pedidos: "Pedidos em aberto",
    aguardando: "Sem primeira resposta",
    passaramDoPrazo: (horas: number) => `Sem resposta há mais de ${horas} h`,
    semResponsavel: "Sem responsável",
    mediana: "Tempo mediano até a primeira resposta",
    medianaBase: (n: number) =>
      `Calculado sobre ${n} pedido${n === 1 ? "" : "s"} respondido${n === 1 ? "" : "s"} com o momento do pedido guardado.`,
    semBase: "Ainda sem pedidos respondidos com o momento do pedido guardado: sem base para calcular.",
    semMomento: (n: number) =>
      `${n} pedido${n === 1 ? "" : "s"} anterior${n === 1 ? "" : "es"} a 01/11/2026 sem o momento do pedido guardado: aparece${n === 1 ? "" : "m"} na fila, mas fora de qualquer média.`,
  },
  colunas: {
    lead: "Lead",
    pedido: "Pedido",
    resposta: "Primeira resposta",
    responsavel: "Responsável",
    pendencias: "Pendências",
    canais: "Canais liberados",
  },
  horas: (h: number) => (h < 1 ? "menos de 1 h" : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} dias`),
  semMomento: "Momento não guardado",
  naoRespondido: "Ainda sem resposta",
  semResponsavel: "Sem responsável",
  pendencias: {
    "sem-responsavel": "Sem responsável",
    "sem-resposta": "Sem resposta",
    "sem-retorno-marcado": "Sem retorno marcado",
    "retorno-atrasado": "Retorno atrasado",
    "sem-canal": "Nenhum canal liberado",
  } satisfies Record<Pendencia, string>,
  abrir: (nome: string) => `Abrir ${nome}`,
};

export const adminCanais = {
  titulo: "Canais liberados",
  texto: "Só aparece o que a pessoa escolheu. Quem não pediu contato não recebe WhatsApp nem ligação.",
  email: "E-mail",
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  liberado: "liberado",
  bloqueado: "não liberado",
  carregando: "Conferindo as escolhas da pessoa…",
  falhou: "Não foi possível conferir as escolhas agora. Por segurança, nenhum canal foi liberado.",
  revogar: "Registrar que a pessoa pediu para parar",
  revogado: "Revogação registrada.",
  revogarErro: "Não foi possível registrar a revogação.",
  semNenhum: "Nenhum canal liberado: a pessoa não pediu contato. O que vale é o relatório que ela mesma pediu.",
};

export const adminMarcos = {
  titulo: "Marcos do funil",
  texto:
    "Registros reais, digitados pela equipe. Mudar o status do lead não cria reunião, proposta nem valor, e o valor nunca é calculado.",
  vazio: "Nenhum marco registrado.",
  tipos: {
    "reuniao-agendada": "Reunião agendada",
    "reuniao-realizada": "Reunião realizada",
    "proposta-enviada": "Proposta enviada",
    ganho: "Fechou (ganho)",
    perdido: "Perdido",
    "sem-resposta": "Sem resposta",
  } satisfies Record<TipoMarco, string>,
  tipo: "Marco",
  data: "Data",
  valor: "Valor informado (opcional)",
  valorApoio: "Só se a equipe quiser registrar. Fica restrito ao admin e fora do CSV.",
  observacao: "Observação (opcional)",
  registrar: "Registrar marco",
  registrando: "Registrando…",
  remover: "Remover",
  erro: "Não foi possível registrar.",
};

export const adminTokens = {
  titulo: "Links do relatório",
  texto: "Os links enviados por e-mail valem por tempo limitado. Revogar encerra todos os links deste lead.",
  revogar: "Revogar os links deste lead",
  revogando: "Revogando…",
  revogados: (n: number) =>
    n === 0 ? "Nenhum link ativo para revogar." : `${n} link${n === 1 ? "" : "s"} revogado${n === 1 ? "" : "s"}.`,
  erro: "Não foi possível revogar agora.",
};

export const adminOperacao = {
  titulo: "Operação do servidor",
  texto:
    "O que o servidor está fazendo por trás das telas: envio do relatório por e-mail e dicas. Nada aqui mostra contato ou resposta de ninguém.",
  analytics: {
    ligado: "Analytics ligado.",
    desligado:
      "Analytics desligado neste build: visitas e taxas a partir de visitas não são medidas. O funil abaixo do diagnóstico concluído vem do banco e continua valendo (docs/medicao.md).",
  },
  legado: {
    titulo: "Caminho antigo de gravação",
    texto: (leads: number, avaliacoes: number) =>
      `Nos últimos 7 dias: ${leads} lead${leads === 1 ? "" : "s"} e ${avaliacoes} avaliaç${avaliacoes === 1 ? "ão" : "ões"} gravados direto do navegador por versões antigas do site. Quando zerar por um bom tempo, o caminho antigo pode ser fechado.`,
  },
  tarefas: {
    titulo: "Tarefas",
    vazio: "Nenhuma tarefa registrada.",
    colunas: {
      tipo: "Tarefa",
      lead: "Lead",
      estado: "Estado",
      tentativas: "Tentativas",
      proxima: "Próxima tentativa",
      erro: "Último erro",
    },
    tipos: { "email-relatorio": "E-mail do relatório", dicas: "Dicas" },
    estados: {
      pendente: "Pendente",
      processando: "Processando",
      aceito: "Aceito pelo provedor",
      concluida: "Concluída",
      "nova-tentativa": "Nova tentativa",
      falhou: "Falhou",
      "nao-configurado": "E-mail não configurado",
      limite: "Limite atingido",
      cancelada: "Cancelada (sem consentimento)",
    } as Record<string, string>,
    reprocessar: "Reprocessar",
    reprocessando: "Reprocessando…",
    reprocessada: "Voltou para a fila.",
    naoReprocessavel: "Esta tarefa não pode ser reprocessada.",
    processar: "Processar pendências agora",
    processando: "Processando…",
    processado: (processadas: number, falhas: number) =>
      `${processadas} processada${processadas === 1 ? "" : "s"}, ${falhas} com falha.`,
    erro: "Não foi possível falar com o servidor.",
    aceitoAviso:
      "“Aceito” quer dizer que o provedor de e-mail aceitou a mensagem, não que ela chegou à caixa de entrada.",
  },
  funil: {
    titulo: "Funil comercial",
    texto: "Cada etapa vem de uma fonte própria; só a primeira depende do analytics.",
    etapas: [
      "Visita",
      "Diagnóstico concluído",
      "Contato aceito",
      "Pedido de conversa",
      "Primeira resposta",
      "Reunião realizada",
      "Proposta enviada",
      "Cliente",
    ],
    semAnalytics: "sem analytics",
  },
};

/** Ficha de preparação da conversa: montada por regra a partir do que a pessoa respondeu, sem nova chamada de IA. */
export const adminFicha = {
  titulo: "Ficha de preparação da conversa",
  texto:
    "Montada das respostas da pessoa, sem IA. Tudo o que não veio de uma resposta está marcado como hipótese e precisa ser validado na conversa.",
  copiar: "Copiar a ficha",
  copiada: "Ficha copiada.",
  secoes: {
    perfil: "Perfil e escopo avaliado",
    dor: "Dor e consequência declaradas",
    sustentacao: "Respostas que sustentam a leitura",
    esforco: "Esforço calculado",
    hipotese: "Hipótese de oportunidade (a validar)",
    faltam: "O que ainda falta saber",
    perguntas: "Perguntas para validar o cenário",
    piloto: "Possível piloto ou serviço, e as condições",
    proximo: "Próximo passo",
  },
  rotulos: {
    papel: "Papel",
    porte: "Porte",
    segmento: "Segmento",
    visao: "Visão avaliada",
    empresa: "Empresa",
    nivel: "Nível e nota",
    desafios: "Desafios declarados",
    semDesafios: "Nenhum desafio declarado.",
    consequenciaDeclarada: "Consequência declarada",
    consequenciaHipotese: "Hipótese de consequência",
    semAprofundamento: "A pessoa não respondeu o aprofundamento da dor.",
    semConsequencia: "Nenhuma consequência declarada.",
    responsavel: "Responsável",
    proximaAcao: "Próxima ação",
    canal: "Canal permitido",
    prazo: "Prazo",
    semResponsavel: "Sem responsável",
    semPrazo: "Sem prazo marcado",
    semCanal: "Nenhum canal liberado",
    semIndicacao: "As respostas não pedem uma solução agora: a conversa serve para entender a dor.",
    semHipoteses: "Sem desafio declarado, não há hipótese a investigar.",
  },
  faltam: {
    pontoCego: (tema: string) => `Resposta sobre ${tema} ficou como "Não sei responder".`,
    semAprofundamento: "A dor operacional não foi aprofundada (rotina, volume, consequência).",
    semMinutos: "Tempo por ocorrência: sem ele não dá para estimar o esforço.",
    semVolume: "Volume com unidade e período: sem eles não dá para estimar o esforço.",
    semIndicador: "Indicador que a pessoa quer melhorar.",
    semDados: "Se os dados da rotina estão disponíveis.",
    semPapel: "Papel da pessoa na decisão de mudar a rotina.",
    contradiz: (titulo: string) => `${titulo}: as respostas apontam o contrário do que a pessoa declarou.`,
    nada: "Nada importante em aberto nas respostas.",
  },
  acao: {
    responder: "Responder ao pedido de conversa (ainda sem primeira resposta).",
    marcarRetorno: "Registrar a conversa e marcar o próximo retorno.",
    atrasado: "Retorno atrasado: retomar o contato.",
    semPedido:
      "A pessoa não pediu para falar com um especialista: não iniciar contato por WhatsApp ou ligação. Se for o caso, enviar só o que ela pediu (o relatório).",
    encerrado: "Lead encerrado.",
    seguir: "Seguir o combinado e registrar o resultado da conversa.",
  },
};
