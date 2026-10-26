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
export const categoriasAgentes: Array<{ area: AreaId; nome: string; agentes: Array<{ nome: string; texto: string }> }> =
  [
    {
      area: "marketing",
      nome: "Marketing Intelligence",
      agentes: [
        { nome: "Social Content Agent", texto: "Produção de conteúdo para redes sociais." },
        { nome: "Creative Studio Agent", texto: "Criação de conceitos e peças criativas." },
        { nome: "Campaign Agent", texto: "Planejamento e estruturação de campanhas." },
        { nome: "Market Intelligence Agent", texto: "Análise de concorrência e mercado." },
        { nome: "Performance Agent", texto: "Análise de resultados de campanhas." },
        { nome: "CRM Agent", texto: "Segmentação e personalização de comunicações." },
      ],
    },
    {
      area: "vendas",
      nome: "Sales Intelligence",
      agentes: [
        { nome: "AI SDR Agent", texto: "Qualificação inicial de oportunidades." },
        { nome: "Prospecting Agent", texto: "Inteligência para prospecção." },
        { nome: "Follow-up Agent", texto: "Acompanhamento comercial." },
        { nome: "Proposal Agent", texto: "Apoio à criação de propostas." },
        { nome: "CRM Intelligence Agent", texto: "Análise de oportunidades e pipeline." },
        { nome: "Sales Coach Agent", texto: "Apoio à evolução comercial." },
      ],
    },
    {
      area: "customer-success",
      nome: "Customer Intelligence",
      agentes: [
        { nome: "Customer Support Agent", texto: "Atendimento inteligente." },
        { nome: "Onboarding Agent", texto: "Apoio à integração de clientes." },
        { nome: "Customer Health Agent", texto: "Análise da saúde da carteira." },
        { nome: "Retention Agent", texto: "Identificação de riscos de cancelamento." },
        { nome: "Expansion Agent", texto: "Oportunidades de upsell e cross-sell." },
        { nome: "Voice of Customer Agent", texto: "Inteligência a partir de feedbacks." },
      ],
    },
  ];

/** Seção comercial da Agent Factory sobre ferramentas redundantes. Sem promessa de economia. */
export const consolidacao = {
  kicker: "Ferramentas redundantes",
  titulo: ["Sua empresa pode estar pagando por mais ferramentas", "*do que realmente precisa.*"],
  paragrafos: [
    "Mapeamos as licenças e assinaturas em uso, as funcionalidades que se repetem entre ferramentas e as soluções subutilizadas. Onde faz sentido, um agente personalizado concentra tarefas que hoje estão espalhadas.",
    "A recomendação considera o custo total: implementação, infraestrutura, modelos de IA e manutenção. Não prometemos substituição integral de ferramentas nem economia garantida; cada consolidação é validada com testes de qualidade, segurança e custo.",
  ],
  passos: ["Funcionalidades redundantes", "Soluções subutilizadas", "Oportunidades de consolidação"],
  categorias: { kicker: "Casos de uso por área", titulo: ["Três frentes,", "*uma jornada de receita.*"] },
  catalogo: { label: "Ver os 30 agentes do catálogo", href: "/agentes-de-ia" },
};
