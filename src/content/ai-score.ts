import type { Passo, Pergunta } from "./types";

/**
 * Landing page do RESET AI Score (/ai-score). Copy do documento do Diego (28/10): três camadas
 * (resultado grátis na tela, relatório completo com os dados, Análise Estratégica com especialistas).
 * As perguntas, os níveis e as dimensões ficam em ai-score-questionario.ts.
 */
export const aiScore = {
  hero: {
    kicker: "RESET AI Score",
    titulo: ["Qual é o nível de maturidade da sua empresa", "em *inteligência artificial?*"],
    lead: "Descubra sua pontuação de 0 a 100, identifique oportunidades de evolução e entenda como transformar IA em produtividade, eficiência e resultados.",
    nota: "Gratuito • 5 minutos • Resultado imediato",
  },
  visoes: {
    kicker: "Duas visões",
    titulo: ["Para quem decide", "*e para quem executa.*"],
    itens: [
      {
        nome: "Visão Empresa",
        publico: "Para empresários, CEOs e diretores.",
        texto:
          "Avalia a organização como um todo e permite aprofundar Marketing, Vendas e Customer Success, com quatro perguntas por área.",
      },
      {
        nome: "Visão por Área",
        publico: "Para gestores de Marketing, Vendas e CS.",
        texto:
          "Avalia a maturidade da sua área e como a IA já participa das atividades dela, com um índice de aplicação próprio.",
      },
    ],
  },
  dimensoes: {
    kicker: "O que o AI Score avalia",
    titulo: ["Seis dimensões.", "*O mesmo peso.*"],
    lead: "Usar ferramentas não é o mesmo que ter maturidade. O índice olha para estratégia, pessoas, processos, dados, governança e resultados.",
  },
  camadas: {
    kicker: "O que você recebe",
    titulo: ["Valor antes", "*de qualquer conversa.*"],
    itens: [
      {
        etiqueta: "Na hora, sem cadastro",
        nome: "Seu AI Score",
        texto:
          "Nota de 0 a 100, nível de maturidade, resultado por dimensão, ponto forte, principal oportunidade e próximos passos.",
      },
      {
        etiqueta: "Gratuito, com seus dados",
        nome: "Relatório completo",
        texto:
          "Leitura de cada dimensão, soluções indicadas para o seu momento e o relatório para salvar em PDF e compartilhar com a liderança.",
      },
      {
        etiqueta: "Mediante contato",
        nome: "Análise Estratégica RESET",
        texto:
          "Conversa com especialistas da Reset para validar as respostas e explorar processos, agentes, ferramentas e prioridades.",
      },
    ],
  },
  exemplo: {
    kicker: "Exemplo de resultado",
    titulo: ["Uma leitura clara", "*do seu momento.*"],
    lead: "O resultado mostra a nota, o nível e onde estão as maiores oportunidades de evolução, dimensão por dimensão.",
    /** Respostas hipotéticas das 12 perguntas (0 a 4), na ordem: geram o exemplo do documento. */
    respostas: [3, 3, 2, 2, 2, 1, 2, 2, 1, 1, 2, 1],
    aviso: "Simulação ilustrativa com respostas hipotéticas; não representa uma empresa real.",
  },
  etapas: {
    kicker: "Como funciona",
    titulo: ["Cinco minutos.", "*Resultado na hora.*"],
    passos: [
      {
        numero: "01",
        titulo: "Conte sobre você",
        texto: "Seu papel, o que deseja avaliar, o tamanho e o segmento da empresa.",
      },
      {
        numero: "02",
        titulo: "Responda 12 perguntas",
        texto: "Duas por dimensão. Se não souber, marque Não sei responder: a pergunta fica fora do cálculo.",
      },
      {
        numero: "03",
        titulo: "Aprofunde as áreas",
        texto: "Quatro perguntas sobre o uso de IA em Marketing, Vendas ou Customer Success.",
      },
      {
        numero: "04",
        titulo: "Veja seu AI Score",
        texto: "Nota, nível e próximos passos na hora. O relatório completo é liberado com seus dados.",
      },
    ] satisfies Passo[],
  },
  metodologia: {
    kicker: "Metodologia própria",
    titulo: ["Cálculo fixo,", "*sem caixa-preta.*"],
    paragrafos: [
      "Cada dimensão tem duas perguntas com alternativas de 0 a 4 pontos. A média de cada dimensão vira uma nota de 0 a 100, e o AI Score é a média das seis. A nota não é gerada por IA: as mesmas respostas dão sempre o mesmo resultado.",
      "O RESET AI Score é uma autoavaliação indicativa, baseada em metodologia própria da Reset IA. Não é certificação nem comparação com o mercado: cada resultado é comparado apenas com a escala da metodologia.",
    ],
    niveis: "Os cinco níveis",
  },
  perguntas: {
    kicker: "Perguntas frequentes",
    titulo: ["Antes de", "*começar.*"],
    itens: [
      {
        pergunta: "É gratuito mesmo?",
        resposta:
          "Sim. O AI Score e o relatório completo são gratuitos. O resultado aparece na hora, sem cadastro; para liberar o relatório completo, pedimos nome, e-mail corporativo e empresa.",
      },
      {
        pergunta: "Quanto tempo leva?",
        resposta:
          "Cerca de 5 minutos. As respostas ficam salvas neste navegador enquanto você responde, e dá para continuar de onde parou.",
      },
      {
        pergunta: "Vou precisar falar com um vendedor?",
        resposta:
          "Não. A conversa com especialistas, a Análise Estratégica RESET, só acontece se você pedir, pelo WhatsApp ou no formulário do relatório.",
      },
      {
        pergunta: "E se eu não souber responder alguma pergunta?",
        resposta:
          "Marque Não sei responder. A pergunta fica fora do cálculo, sem contar como zero. Para uma nota consolidada, são necessárias ao menos 10 das 12 respostas, com pelo menos uma em cada dimensão.",
      },
      {
        pergunta: "Qual é a diferença entre a Visão Empresa e a Visão por Área?",
        resposta:
          "A Visão Empresa avalia a organização inteira e pode aprofundar Marketing, Vendas e Customer Success. A Visão por Área avalia só a sua área. O índice de cada área é separado e não altera o AI Score.",
      },
      {
        pergunta: "O que acontece com os meus dados?",
        resposta:
          "As respostas servem para calcular o resultado e entender o seu momento. Os dados de contato só são pedidos para liberar o relatório, e o uso está descrito na política de privacidade.",
      },
    ] satisfies Pergunta[],
  },
  ctaFinal: {
    kicker: "RESET AI Score",
    titulo: ["Descubra onde sua empresa está.", "*E para onde ela pode ir.*"],
    apoio: "Cerca de 5 minutos, resultado imediato e um relatório para compartilhar com a liderança.",
  },
};
