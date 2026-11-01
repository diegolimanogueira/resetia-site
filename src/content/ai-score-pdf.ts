/**
 * Textos próprios do PDF do relatório do RESET AI Score. O conteúdo (resumo, lacunas, roteiro, indicações) vem da
 * mesma devolutiva da tela e do e-mail; aqui só ficam os rótulos que o PDF acrescenta. Carregado sob demanda, com
 * o gerador. Texto novo é texto a revisar com o Diego.
 */
export const pdf = {
  autor: "Reset IA",
  rodape: "Relatório RESET AI Score · resetia.com.br",
  pagina: (n: number, total: number) => `Página ${n} de ${total}`,
  versao: (metodo: string, analise: string) => `Método ${metodo} da nota · análise ${analise} da leitura`,
  arquivo: (empresa: string | null) => `RESET-AI-Score${empresa ? `-${empresa}` : ""}`,
  nota: "Nota de 0 a 100",
  de100: "de 100",
  secoes: {
    alertas: "O que o resultado revela",
    simulacao: "Simulação de evolução",
    lacunas: "Lacunas de maturidade",
    dicas: "Dicas para evoluir",
    dimensoes: "Análise por dimensão",
    pontosCegos: "Pontos cegos",
    areas: "Aplicação de IA por atividade",
    aprofundamento: "Dor operacional informada",
  },
  dimensao: {
    respostas: (validas: number, total: number) => `${validas} de ${total} respostas`,
    hoje: "Hoje:",
    proximo: "Próximo estágio:",
    topo: "Estágio mais alto da escala.",
    validar: "Para validar internamente:",
  },
  aprofundamento: {
    privacidade: "Respostas dadas por você; ficam só com a Reset e não alteram a nota.",
  },
};
