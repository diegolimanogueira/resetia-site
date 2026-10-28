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
        etiqueta: "Na hora, com nome e e-mail",
        nome: "Seu AI Score",
        texto:
          "Nota de 0 a 100, nível de maturidade, resultado por dimensão, ponto forte, principal oportunidade, próximos passos e alertas.",
      },
      {
        etiqueta: "Gratuito, com a empresa",
        nome: "Relatório completo",
        texto:
          "Cada resposta com o próximo estágio, prioridades, pontos cegos, dicas para evoluir, simulação de evolução, plano de 90 dias e soluções indicadas, em PDF e no seu e-mail.",
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
    /**
     * Respostas hipotéticas (o mesmo formato do link do resultado): a landing page e /ai-score/exemplo usam este
     * caso. Empresa de serviços B2B com direção definida, uso crescendo, governança fraca e dois pontos cegos.
     */
    codigo:
      "v=1&e=empresa&p=ceo&t=50-199&s=servicos-b2b&r=322221211x1x&a=marketing,vendas&am=2112&av=1201&d=repetitivas,governanca&h=3-meses&id=00000000-0000-4000-8000-000000000000",
    nome: "Maria",
    empresa: "Empresa Exemplo",
    aviso: "Simulação ilustrativa com respostas hipotéticas; não representa uma empresa real.",
    link: { label: "Ver um relatório completo de exemplo", href: "/ai-score/exemplo" },
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
        texto:
          "Com nome e e-mail, você vê nota, nível e próximos passos na hora. O relatório completo sai com o nome da empresa e chega também no seu e-mail.",
      },
    ] satisfies Passo[],
  },
  metodologia: {
    kicker: "Metodologia própria",
    titulo: ["Cálculo fixo,", "*sem caixa-preta.*"],
    paragrafos: [
      "Cada dimensão tem duas perguntas. As alternativas valem pontos progressivos (0, 15, 40, 70 e 100): o que é pontual vale bem menos do que o que é estruturado e integrado. A nota da dimensão é a média das suas respostas, e o AI Score é a média das seis, com a dimensão mais fraca contando em dobro, porque a maturidade se sustenta pelo elo mais fraco. A nota não é gerada por IA: as mesmas respostas dão sempre o mesmo resultado.",
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
          "Sim. O AI Score e o relatório completo são gratuitos. Para ver o resultado, pedimos só nome e e-mail; para o relatório completo, o nome da empresa.",
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
          "Marque Não sei responder. A pergunta fica fora do cálculo, sem contar como zero, e aparece no relatório como ponto cego. Para uma nota consolidada, são necessárias ao menos 10 das 12 respostas, com pelo menos uma em cada dimensão.",
      },
      {
        pergunta: "Qual é a diferença entre a Visão Empresa e a Visão por Área?",
        resposta:
          "A Visão Empresa avalia a organização inteira e pode aprofundar Marketing, Vendas e Customer Success. A Visão por Área avalia só a sua área. O índice de cada área é separado e não altera o AI Score.",
      },
      {
        pergunta: "A nota é gerada por IA?",
        resposta:
          "Não. A nota vem de regras fixas: as mesmas respostas dão sempre o mesmo resultado. A IA entra só nas dicas para evoluir do relatório completo, escritas por um agente e conferidas por um agente revisor a partir das suas respostas, sem receber seu nome, e-mail ou empresa. Como em toda autoavaliação, confira as conclusões com a sua equipe.",
      },
      {
        pergunta: "O que acontece com os meus dados?",
        resposta:
          "As respostas servem para calcular o resultado e entender o seu momento. Nome, e-mail e empresa registram o seu resultado; o uso está descrito na política de privacidade.",
      },
    ] satisfies Pergunta[],
  },
  ctaFinal: {
    kicker: "RESET AI Score",
    titulo: ["Descubra onde sua empresa está.", "*E para onde ela pode ir.*"],
    apoio: "Cerca de 5 minutos, resultado imediato e um relatório para compartilhar com a liderança.",
  },
};
