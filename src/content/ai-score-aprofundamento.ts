import type { AreaId } from "./types";

/**
 * Aprofundamento opcional de uma dor operacional (depois da primeira entrega de valor). Camada 1: rotina, volume e
 * frequência, consequência. Camada 2, só para quem quiser aprofundar: tempo, ferramentas, dados, indicador e papel na
 * decisão. Tudo é opcional, pode ser pulado, editado e respondido com "Não sei". As respostas ficam só com a Reset
 * (nunca no link do resultado, nem na IA, nem no analytics). Texto novo é texto a revisar com o Diego.
 */

export interface OpcaoRotina {
  id: string;
  label: string;
  /** Unidade sugerida para o volume ("propostas"); a pessoa pode trocar. */
  unidade: string;
}

export const rotinas: Record<AreaId, readonly OpcaoRotina[]> = {
  marketing: [
    { id: "producao-conteudo", label: "Produção de conteúdo", unidade: "conteúdos" },
    { id: "campanhas", label: "Planejamento e execução de campanhas", unidade: "campanhas" },
    { id: "relatorios-marketing", label: "Relatórios e análise de resultados", unidade: "relatórios" },
    { id: "pesquisa-mercado", label: "Pesquisa de mercado e concorrência", unidade: "pesquisas" },
    { id: "redes-sociais", label: "Redes sociais e calendário editorial", unidade: "publicações" },
  ],
  vendas: [
    { id: "qualificacao", label: "Qualificação de leads", unidade: "leads" },
    { id: "propostas", label: "Elaboração de propostas", unidade: "propostas" },
    { id: "followup", label: "Follow-up e retorno a oportunidades", unidade: "contatos" },
    { id: "crm", label: "Atualização do CRM e relatórios comerciais", unidade: "registros" },
    { id: "prospeccao", label: "Prospecção e primeiro contato", unidade: "contatos" },
  ],
  "customer-success": [
    { id: "onboarding", label: "Onboarding de clientes", unidade: "clientes" },
    { id: "atendimento", label: "Atendimento e triagem de solicitações", unidade: "solicitações" },
    { id: "retencao", label: "Acompanhamento da saúde da conta e risco de cancelamento", unidade: "contas" },
    { id: "relatorios-cs", label: "Relatórios e reuniões de acompanhamento", unidade: "relatórios" },
    { id: "expansao", label: "Identificação de oportunidades de expansão", unidade: "contas" },
  ],
};

export const consequencias = [
  { id: "atraso", label: "Atraso nas entregas ou nas respostas" },
  { id: "retrabalho", label: "Retrabalho" },
  { id: "esforco", label: "Esforço excessivo da equipe" },
  { id: "falta-acompanhamento", label: "Falta de acompanhamento" },
  { id: "reclamacoes", label: "Reclamações de clientes" },
] as const;

export const periodos = [
  { id: "dia", label: "por dia", extenso: "dia" },
  { id: "semana", label: "por semana", extenso: "semana" },
  { id: "mes", label: "por mês", extenso: "mês" },
] as const;

export const dadosDisponiveis = [
  { id: "nao-tenho", label: "Não temos esses dados" },
  { id: "parcial", label: "Temos parte, em lugares diferentes" },
  { id: "estruturados", label: "Temos, estruturados e fáceis de acessar" },
  { id: "nao-sei", label: "Não sei" },
] as const;

export const papeisNaDecisao = [
  { id: "decido", label: "Eu decido" },
  { id: "influencio", label: "Eu influencio a decisão" },
  { id: "recomendo", label: "Eu recomendo a quem decide" },
  { id: "nao-participo", label: "Não participo dessa decisão" },
] as const;

export const OUTRA = "outra";

export const aprofundar = {
  kicker: "Aprofundamento opcional",
  titulo: ["Quer aprofundar *uma dor da sua operação?*"],
  texto:
    "Três perguntas curtas sobre a rotina que mais pesa hoje. Servem para preparar uma conversa melhor com a Reset. Você pode pular, voltar, corrigir e responder Não sei: nada disso é necessário para ver o seu resultado.",
  privacidade:
    "As respostas ficam só com a Reset: não vão no link do resultado, não são enviadas à IA nem à ferramenta de análise de visitas. Não coloque e-mails nem telefones nos campos de texto.",
  comecar: "Responder as três perguntas",
  pular: "Agora não",
  voltar: "Voltar",
  proxima: "Continuar",
  salvar: "Salvar respostas",
  salvando: "Salvando…",
  naoSei: "Não sei",
  naoSeiApoio: "Não sei informar",
  editar: "Corrigir respostas",
  aprofundarMais: "Responder mais cinco perguntas (opcional)",
  passo: (n: number, total: number) => `Pergunta ${n} de ${total}`,
  area: {
    pergunta: "De qual área é a rotina?",
    apoio: "Escolha a área em que a dor mais pesa.",
    nomes: { marketing: "Marketing", vendas: "Vendas", "customer-success": "Customer Success" } as Record<
      AreaId,
      string
    >,
  },
  rotina: {
    pergunta: "Qual rotina ou processo mais precisa melhorar?",
    outra: "Outro processo",
    outraRotulo: "Qual processo?",
  },
  volume: {
    pergunta: "Qual o volume aproximado e com que frequência?",
    apoio: "Um número aproximado já ajuda. A unidade e o período fazem parte da resposta.",
    quantidade: "Quantidade",
    unidade: "Unidade",
    periodo: "Período",
    resumo: (volume: string, unidade: string, periodo: string) => `Cerca de ${volume} ${unidade} por ${periodo}.`,
  },
  consequencia: {
    pergunta: "Qual a principal consequência dessa rotina hoje?",
    outra: "Outra consequência",
    outraRotulo: "Qual consequência?",
  },
  camada2: {
    kicker: "Aprofundamento",
    titulo: "Mais cinco perguntas, só se quiser",
    texto: "Ajudam a estimar o esforço atual e a ver se há condições para um piloto. Também são opcionais.",
    minutos: {
      pergunta: "Quanto tempo leva, em média, cada ocorrência?",
      rotulo: "Minutos por ocorrência",
    },
    ferramentas: {
      pergunta: "Quais ferramentas participam dessa rotina?",
      apoio: "Separe por vírgula (até 8). Ex.: CRM, planilha, WhatsApp.",
      rotulo: "Ferramentas",
    },
    dados: { pergunta: "Os dados dessa rotina estão disponíveis?" },
    indicador: {
      pergunta: "Qual indicador você quer melhorar?",
      apoio: "Ex.: tempo de resposta, propostas enviadas por semana, retrabalho.",
      rotulo: "Indicador",
    },
    papel: { pergunta: "Qual o seu papel na decisão de mudar essa rotina?" },
  },
  erros: {
    obrigatorio: "Preencha este campo ou marque Não sei.",
    numero: "Informe um número maior que zero.",
    numeroLimite: (max: number) => `Use um número de até ${max.toLocaleString("pt-BR")}.`,
    decimais: "Use no máximo duas casas decimais.",
    texto: (min: number, max: number) => `Use entre ${min} e ${max} caracteres.`,
    contato: "Não coloque e-mail nem telefone aqui.",
    ferramentas: "Use até 8 ferramentas, de até 40 caracteres cada.",
    opcao: "Escolha uma das opções.",
    geral: "Revise os campos marcados.",
  },
  salvo: {
    titulo: "Respostas salvas",
    pendente:
      "Ainda não conseguimos confirmar que as respostas chegaram à Reset. Vamos tentar de novo quando a conexão voltar. Se você fechar a página antes, elas podem não chegar.",
    recusado: "Não foi possível salvar as respostas. Revise os campos e tente de novo.",
    desligado: "Esta é uma demonstração: nada é enviado.",
  },
  esforco: {
    titulo: "Esforço atual estimado",
    formula: (volume: string, unidade: string, periodo: string, minutos: string, horas: string) =>
      `${volume} ${unidade} por ${periodo} × ${minutos} min ÷ 60 = ${horas} h por ${periodo}`,
    premissas: [
      "É o esforço que você informou, não uma economia garantida.",
      "Não considera o custo da hora nem o que a rotina deixa de render. Sem esses dados validados, não convertemos em dinheiro.",
      "Um piloto mede quanto desse tempo pode mesmo mudar, incluindo a revisão humana e a operação da solução.",
    ],
    falta: {
      titulo: "Para calcular o esforço, falta:",
      volume: "o volume aproximado, com unidade e período",
      minutos: "o tempo médio de cada ocorrência",
    },
  },
};
