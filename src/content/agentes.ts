import { ctaPadrao } from "./solucoes";
import type { Agente, AreaId } from "./types";

export const areas: Array<{ id: AreaId; nome: string }> = [
  { id: "marketing", nome: "Marketing" },
  { id: "vendas", nome: "Vendas" },
  { id: "customer-success", nome: "Customer Success" },
];

export const nomeDaArea = (id: AreaId) => areas.find((a) => a.id === id)!.nome;

const base: Array<Omit<Agente, "ficha">> = [
  {
    area: "marketing",
    nome: "Social Content",
    texto: "Pautas, legendas, roteiros, carrosséis e calendário editorial.",
  },
  {
    area: "marketing",
    nome: "Creative Studio",
    texto: "Conceitos visuais e variações criativas com revisão de marca.",
  },
  { area: "marketing", nome: "Campaign Builder", texto: "Briefings, campanhas, ofertas e mensagens por canal." },
  { area: "marketing", nome: "Market Intelligence", texto: "Concorrentes, tendências e oportunidades de mercado." },
  { area: "marketing", nome: "Performance Analyst", texto: "Leitura integrada de mídia, CRM e vendas." },
  { area: "marketing", nome: "SEO & Content", texto: "Pesquisa de temas, otimização e sugestões editoriais." },
  { area: "marketing", nome: "CRM & Segmentation", texto: "Segmentos e comunicações a partir do comportamento." },
  { area: "marketing", nome: "Brand Guardian", texto: "Consistência de tom de voz e diretrizes da marca." },
  { area: "marketing", nome: "Customer Insights", texto: "Análise de avaliações, comentários e pesquisas." },
  { area: "marketing", nome: "Marketing Planning", texto: "Planos, metas, campanhas e acompanhamento." },
  { area: "vendas", nome: "AI SDR", texto: "Qualificação inicial e encaminhamento de oportunidades." },
  { area: "vendas", nome: "Sales Prospecting", texto: "Pesquisa de contas e preparo de abordagens." },
  { area: "vendas", nome: "Follow-up", texto: "Cadências, lembretes e próximos passos comerciais." },
  { area: "vendas", nome: "Sales Proposal", texto: "Propostas apoiadas por dados e modelos aprovados." },
  { area: "vendas", nome: "CRM Intelligence", texto: "Identificação de negócios parados e lacunas no funil." },
  { area: "vendas", nome: "Sales Coach", texto: "Análise autorizada de interações e objeções." },
  { area: "vendas", nome: "Sales Forecast", texto: "Apoio a projeções baseado em histórico e pipeline." },
  { area: "vendas", nome: "Product Knowledge", texto: "Consulta a catálogos, condições e políticas." },
  { area: "vendas", nome: "Sales Opportunity", texto: "Sinais de cross-sell e upsell na carteira." },
  { area: "vendas", nome: "Sales Management", texto: "Painéis e recomendações para gestores comerciais." },
  { area: "customer-success", nome: "Customer Onboarding", texto: "Orientação e acompanhamento de novos clientes." },
  { area: "customer-success", nome: "Customer Support", texto: "Respostas assistidas e escalonamento de exceções." },
  { area: "customer-success", nome: "Churn Risk", texto: "Sinais de risco de cancelamento e ações preventivas." },
  { area: "customer-success", nome: "Customer Health", texto: "Visão consolidada da saúde da carteira." },
  { area: "customer-success", nome: "Retention", texto: "Planos de recuperação de clientes em risco." },
  { area: "customer-success", nome: "Expansion", texto: "Identificação de oportunidades de ampliação." },
  { area: "customer-success", nome: "Voice of Customer", texto: "Síntese de feedbacks, tickets e pesquisas." },
  { area: "customer-success", nome: "Renewal", texto: "Gestão de vencimentos e oportunidades de renovação." },
  { area: "customer-success", nome: "CS Copilot", texto: "Resumos, contexto e próximos passos para o time." },
  { area: "customer-success", nome: "Customer Journey", texto: "Gargalos e oportunidades na experiência do cliente." },
];

/**
 * Como cada agente funciona, em termos gerais: o que precisa receber, a tarefa, o que entrega, quem revisa e um
 * indicador possível. É descrição de oportunidade, não de integração entregue: dados, ferramentas, autonomia e
 * controles reais são definidos em cada projeto. Texto escrito pelo agente de código, a revisar com o Diego.
 */
const fichas: Record<string, Agente["ficha"]> = {
  "Social Content": {
    entrada: "Tema, público, tom de voz e calendário da marca.",
    tarefa: "Propor pautas, legendas, roteiros e carrosséis.",
    saida: "Rascunhos e calendário editorial.",
    revisao: "Quem responde pela marca aprova antes de publicar.",
    indicador: "Tempo de produção por peça e peças aprovadas sem retrabalho.",
  },
  "Creative Studio": {
    entrada: "Briefing e guia visual da marca.",
    tarefa: "Gerar conceitos e variações criativas.",
    saida: "Variações visuais para escolha.",
    revisao: "Quem responde pela marca revisa a marca e os direitos de imagem.",
    indicador: "Variações aproveitadas por briefing.",
  },
  "Campaign Builder": {
    entrada: "Objetivo, público, oferta e canais.",
    tarefa: "Montar briefings e mensagens por canal.",
    saida: "Plano de campanha e peças-base.",
    revisao: "O responsável de marketing valida oferta e promessas.",
    indicador: "Tempo do briefing ao plano aprovado.",
  },
  "Market Intelligence": {
    entrada: "Lista de concorrentes e fontes públicas autorizadas.",
    tarefa: "Reunir e resumir movimentos de mercado.",
    saida: "Resumo periódico com as fontes citadas.",
    revisao: "Quem decide confere as fontes antes de agir.",
    indicador: "Tempo de preparo do resumo e decisões que o usaram.",
  },
  "Performance Analyst": {
    entrada: "Dados de mídia, CRM e vendas, com acesso autorizado.",
    tarefa: "Cruzar os dados e destacar variações.",
    saida: "Leitura integrada, com perguntas para investigar.",
    revisao: "Análise confirmada por quem conhece as campanhas.",
    indicador: "Tempo para consolidar o relatório.",
  },
  "SEO & Content": {
    entrada: "Temas, palavras-chave e conteúdo existente.",
    tarefa: "Sugerir temas e otimizações.",
    saida: "Lista de temas e ajustes editoriais.",
    revisao: "O editor aprova o conteúdo e o tom.",
    indicador: "Temas aprovados por mês e tempo de pesquisa.",
  },
  "CRM & Segmentation": {
    entrada: "Base de contatos e histórico de comportamento, dentro do que a política permite.",
    tarefa: "Sugerir segmentos e mensagens.",
    saida: "Segmentos e rascunhos de comunicação.",
    revisao: "Uma pessoa confere o consentimento e a mensagem antes do envio.",
    indicador: "Segmentos usados e taxa de resposta por segmento.",
  },
  "Brand Guardian": {
    entrada: "Manual de marca e tom de voz.",
    tarefa: "Conferir peças contra as diretrizes.",
    saida: "Lista de desvios e sugestões de ajuste.",
    revisao: "A decisão final é de quem responde pela marca.",
    indicador: "Desvios apontados antes da publicação.",
  },
  "Customer Insights": {
    entrada: "Avaliações, comentários e pesquisas.",
    tarefa: "Agrupar temas e sentimentos recorrentes.",
    saida: "Síntese de temas com exemplos.",
    revisao: "Leitura conferida com uma amostra do material original.",
    indicador: "Tempo para sintetizar um lote de feedbacks.",
  },
  "Marketing Planning": {
    entrada: "Metas, orçamento e histórico de campanhas.",
    tarefa: "Montar o plano e o acompanhamento.",
    saida: "Plano com metas e rotina de acompanhamento.",
    revisao: "A liderança aprova metas e prioridades.",
    indicador: "Aderência do realizado ao plano.",
  },
  "AI SDR": {
    entrada: "Critérios de qualificação e canais de entrada dos contatos.",
    tarefa: "Fazer a qualificação inicial e encaminhar.",
    saida: "Contato qualificado, com resumo para o vendedor.",
    revisao: "O vendedor assume e confirma antes de avançar; exceções vão para uma pessoa.",
    indicador: "Tempo até a primeira resposta e contatos qualificados encaminhados.",
  },
  "Sales Prospecting": {
    entrada: "Perfil de cliente ideal e fontes autorizadas.",
    tarefa: "Pesquisar contas e preparar abordagens.",
    saida: "Lista de contas com um ponto de partida para a abordagem.",
    revisao: "O vendedor valida contas e mensagem.",
    indicador: "Tempo de preparo por conta.",
  },
  "Follow-up": {
    entrada: "Etapa do negócio e histórico de contatos.",
    tarefa: "Sugerir cadência e lembretes.",
    saida: "Próximo passo e rascunho de mensagem.",
    revisao: "O vendedor decide o que enviar.",
    indicador: "Negócios sem retorno marcado.",
  },
  "Sales Proposal": {
    entrada: "Modelos aprovados, condições e dados do cliente.",
    tarefa: "Montar a proposta a partir do modelo.",
    saida: "Rascunho de proposta.",
    revisao: "Condições e preços aprovados por quem responde pela venda.",
    indicador: "Tempo do pedido ao rascunho.",
  },
  "CRM Intelligence": {
    entrada: "Registros do CRM e regras do funil.",
    tarefa: "Apontar negócios parados e lacunas de registro.",
    saida: "Lista priorizada para revisão.",
    revisao: "O gestor confirma e distribui.",
    indicador: "Negócios parados sem responsável.",
  },
  "Sales Coach": {
    entrada: "Interações gravadas ou registradas, com autorização.",
    tarefa: "Destacar objeções e padrões.",
    saida: "Pontos de aprendizado por conversa.",
    revisao: "O gestor revisa, e só se usa com ciência e autorização de quem é analisado.",
    indicador: "Objeções recorrentes tratadas.",
  },
  "Sales Forecast": {
    entrada: "Histórico e pipeline.",
    tarefa: "Apoiar a projeção com cenários.",
    saida: "Projeção com as premissas visíveis.",
    revisao: "O gestor valida as premissas e decide.",
    indicador: "Diferença entre projetado e realizado.",
  },
  "Product Knowledge": {
    entrada: "Catálogo, condições e políticas atualizadas.",
    tarefa: "Responder consultas com base nesses documentos.",
    saida: "Resposta com a fonte citada.",
    revisao: "Dúvidas fora da base vão para uma pessoa.",
    indicador: "Consultas resolvidas sem escalonar.",
  },
  "Sales Opportunity": {
    entrada: "Carteira e histórico de compras.",
    tarefa: "Apontar sinais de cross-sell e upsell.",
    saida: "Lista de oportunidades com o sinal que as sustenta.",
    revisao: "O vendedor confirma antes de abordar.",
    indicador: "Oportunidades abordadas e convertidas.",
  },
  "Sales Management": {
    entrada: "Dados do funil e metas do time.",
    tarefa: "Montar painéis e recomendações.",
    saida: "Painel e pontos de atenção.",
    revisao: "O gestor interpreta e decide.",
    indicador: "Tempo de preparo da reunião de pipeline.",
  },
  "Customer Onboarding": {
    entrada: "Etapas de implantação e dados do cliente.",
    tarefa: "Orientar e acompanhar os passos.",
    saida: "Checklist de implantação e alertas de atraso.",
    revisao: "O responsável de CS acompanha as exceções.",
    indicador: "Tempo até o primeiro uso.",
  },
  "Customer Support": {
    entrada: "Base de conhecimento e histórico de atendimento.",
    tarefa: "Sugerir respostas e escalar exceções.",
    saida: "Resposta assistida ou encaminhamento.",
    revisao: "Exceções e respostas sensíveis passam por uma pessoa.",
    indicador: "Tempo de primeira resposta e escalonamentos.",
  },
  "Churn Risk": {
    entrada: "Sinais de uso, atendimento e financeiro.",
    tarefa: "Apontar contas com sinais de risco.",
    saida: "Lista de contas com o motivo.",
    revisao: "O CS confirma o risco com o cliente.",
    indicador: "Contas em risco acompanhadas.",
  },
  "Customer Health": {
    entrada: "Dados de uso, satisfação e relacionamento.",
    tarefa: "Consolidar uma visão da carteira.",
    saida: "Visão da saúde por conta.",
    revisao: "A definição de conta saudável é validada pelo time.",
    indicador: "Contas com a visão atualizada.",
  },
  Retention: {
    entrada: "Contas em risco e histórico.",
    tarefa: "Propor planos de recuperação.",
    saida: "Plano por conta.",
    revisao: "O CS aprova e conduz o contato.",
    indicador: "Contas com plano aprovado.",
  },
  Expansion: {
    entrada: "Uso e necessidades registradas.",
    tarefa: "Identificar oportunidades de ampliação.",
    saida: "Lista com o sinal e a próxima conversa.",
    revisao: "O CS confirma com o cliente.",
    indicador: "Oportunidades levadas à conversa.",
  },
  "Voice of Customer": {
    entrada: "Feedbacks, tickets e pesquisas.",
    tarefa: "Sintetizar temas e pedidos.",
    saida: "Resumo de temas com exemplos.",
    revisao: "Amostra conferida no original.",
    indicador: "Temas tratados pelo produto ou pelo time.",
  },
  Renewal: {
    entrada: "Datas de vencimento e histórico da conta.",
    tarefa: "Acompanhar vencimentos e sugerir a abordagem.",
    saida: "Agenda de renovações com o contexto.",
    revisao: "O responsável conduz a negociação.",
    indicador: "Renovações com contato antecipado.",
  },
  "CS Copilot": {
    entrada: "Histórico da conta e reuniões.",
    tarefa: "Resumir o contexto e propor próximos passos.",
    saida: "Resumo e rascunho de próximos passos.",
    revisao: "O CS revisa antes de registrar ou enviar.",
    indicador: "Tempo de preparo para reuniões com o cliente.",
  },
  "Customer Journey": {
    entrada: "Pontos de contato e dados de cada etapa.",
    tarefa: "Apontar gargalos e oportunidades.",
    saida: "Mapa da jornada com os pontos críticos.",
    revisao: "O time valida os pontos com clientes.",
    indicador: "Gargalos tratados.",
  },
};

const lista: Agente[] = base.map((a) => ({ ...a, ficha: fichas[a.nome] }));

export const agentes = {
  hero: {
    kicker: "Agentes de IA",
    titulo: ["Seu time, com", "*novas capacidades.*"],
    lead: "30 aplicações possíveis de agentes em Marketing, Vendas e Customer Success. Não vendemos robôs genéricos: desenhamos soluções adequadas ao processo, aos dados e às metas de cada operação.",
    link: { label: "Entenda a Agent Factory", href: "/solucoes/agent-factory" },
  },
  filtro: {
    rotulo: "Explore por área",
    todos: "Todos",
    /** Anúncio para leitor de tela quando o filtro muda. */
    contagem: (n: number) => `${n} agentes`,
  },
  lista,
  /** Rótulos da ficha de cada agente e o aviso de que ela descreve uma possibilidade, não uma integração entregue. */
  ficha: {
    abrir: "Como funciona",
    rotulos: {
      entrada: "Entrada necessária",
      tarefa: "Tarefa",
      saida: "Saída",
      revisao: "Revisão humana",
      indicador: "Indicador possível",
    },
    aviso:
      "Cada ficha descreve, em termos gerais, o que o agente pode fazer. Dados, ferramentas, autonomia e controles reais são definidos em cada projeto: nada aqui significa uma integração já entregue.",
  },
  aviso:
    "As aplicações são oportunidades de solução, não produtos prontos e universalmente compatíveis. Autonomia, integrações, dados, segurança, qualidade e custos são definidos em cada projeto.",
  complexidade: {
    kicker: "Menos complexidade",
    titulo: ["Não é preciso somar", "*mais uma ferramenta.*"],
    texto:
      "Avaliamos licenças existentes, redundâncias e oportunidades de consolidação. Um agente pode complementar ou substituir tarefas de ferramentas específicas — desde que os testes comprovem qualidade, segurança e custo total vantajoso.",
    link: { label: "Conheça a Agent Factory", href: "/solucoes/agent-factory" },
  },
  cta: ctaPadrao,
};

/** As três frentes da Agent Factory, com exemplos por área (página da solução). */
export const categoriasAgentes: Array<{
  area: AreaId;
  nome: string;
  descricao: string;
  agentes: Array<{ nome: string; texto: string }>;
}> = [
  {
    area: "marketing",
    nome: "Marketing Intelligence",
    descricao: "Agentes para transformar a forma como sua empresa planeja, cria e executa Marketing.",
    agentes: [
      {
        nome: "Social Content Agent",
        texto: "Criação de pautas, calendários, legendas, roteiros e conteúdos para redes sociais.",
      },
      {
        nome: "Creative Studio Agent",
        texto: "Apoio à produção de conceitos visuais, criativos e variações de campanhas.",
      },
      { nome: "Campaign Agent", texto: "Planejamento de campanhas, mensagens e ofertas." },
      { nome: "Market Intelligence Agent", texto: "Análise de concorrentes, tendências e oportunidades." },
      {
        nome: "Performance Agent",
        texto: "Análise de resultados de campanhas e identificação de oportunidades de otimização.",
      },
      { nome: "CRM Agent", texto: "Segmentação de clientes e apoio à personalização de comunicações." },
    ],
  },
  {
    area: "vendas",
    nome: "Sales Intelligence",
    descricao: "Agentes para apoiar times comerciais, reduzir atividades operacionais e melhorar conversão.",
    agentes: [
      { nome: "AI SDR Agent", texto: "Qualificação inicial de oportunidades." },
      { nome: "Prospecting Agent", texto: "Pesquisa de contas e preparação de abordagens." },
      { nome: "Follow-up Agent", texto: "Organização e execução supervisionada de cadências comerciais." },
      { nome: "Proposal Agent", texto: "Elaboração de propostas comerciais." },
      { nome: "CRM Intelligence Agent", texto: "Análise de pipeline, oportunidades paradas e prioridades comerciais." },
      { nome: "Sales Coach Agent", texto: "Apoio à capacitação e evolução da equipe de vendas." },
    ],
  },
  {
    area: "customer-success",
    nome: "Customer Intelligence",
    descricao: "Agentes para fortalecer o relacionamento com clientes e desenvolver a receita existente.",
    agentes: [
      { nome: "Customer Support Agent", texto: "Atendimento inicial e resolução de demandas recorrentes." },
      { nome: "Onboarding Agent", texto: "Apoio à jornada de entrada de novos clientes." },
      { nome: "Customer Health Agent", texto: "Acompanhamento de sinais de saúde e engajamento da carteira." },
      { nome: "Retention Agent", texto: "Identificação de riscos e apoio a estratégias de retenção." },
      { nome: "Expansion Agent", texto: "Identificação de oportunidades de cross-sell e upsell." },
      { nome: "Voice of Customer Agent", texto: "Análise de feedbacks e identificação de melhorias na experiência." },
    ],
  },
];

/** Agent Factory: exemplos por frente e a seção sobre ferramentas redundantes (sem promessa de economia). */
export const consolidacao = {
  exemplos: {
    kicker: "Exemplos de agentes",
    titulo: ["Uma fábrica.", "*Múltiplas possibilidades.*"],
    aviso:
      "Os exemplos representam possibilidades de aplicação. Cada solução é definida conforme os processos, dados, integrações e necessidades do cliente.",
  },
  kicker: "Reduza complexidade. Extraia mais valor.",
  titulo: ["Sua empresa pode estar pagando por mais tecnologia", "*do que realmente precisa.*"],
  paragrafos: [
    "Avaliamos as ferramentas utilizadas pelas equipes para identificar funcionalidades redundantes, assinaturas subutilizadas e atividades que podem ser atendidas por soluções inteligentes personalizadas.",
    "Nosso objetivo não é substituir ferramentas indiscriminadamente. É encontrar a combinação mais eficiente entre agentes, plataformas existentes e necessidades reais do negócio.",
    "Consideramos os custos de implementação, operação e manutenção para identificar oportunidades de economia sustentável.",
  ],
  passos: ["Funcionalidades redundantes", "Assinaturas subutilizadas", "Atividades para agentes personalizados"],
  catalogo: { label: "Ver os 30 agentes do catálogo", href: "/agentes-de-ia" },
};
