import { ctaPadrao } from "./solucoes";
import type { Agente, AreaId } from "./types";

export const areas: Array<{ id: AreaId; nome: string }> = [
  { id: "marketing", nome: "Marketing" },
  { id: "vendas", nome: "Vendas" },
  { id: "customer-success", nome: "Customer Success" },
];

export const nomeDaArea = (id: AreaId) => areas.find((a) => a.id === id)!.nome;

const lista: Agente[] = [
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
