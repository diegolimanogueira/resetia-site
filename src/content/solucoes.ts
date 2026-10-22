import type { CtaFinal, Solucao } from "./types";

/** Fecho de todas as páginas: o mesmo convite do estudo RESET 360. */
export const ctaPadrao: CtaFinal = {
  kicker: "O próximo ciclo começa aqui",
  titulo: "Sua empresa está pronta para resetar o futuro?",
  apoio: "Comece identificando onde IA pode criar eficiência, liberar capacidade e acelerar crescimento.",
  botao: "Conversar sobre meu negócio",
};

const lista: Solucao[] = [
  {
    slug: "scan",
    num: "01",
    nome: "RESET Scan",
    frase: "Diagnóstico que encontra onde a IA realmente gera valor.",
    descricao:
      "Mapeamos maturidade, uso de ferramentas, processos, oportunidades de receita e eficiência para criar um plano de implantação realista.",
    paraQuem: "Diretores, gestores e empresas que querem definir prioridades antes de investir.",
    entregas: [
      "Diagnóstico por área com Spotlite",
      "Inventário de ferramentas e custos",
      "Mapa de oportunidades priorizadas",
      "Roadmap executivo de 90 dias",
    ],
    medimos: "Maturidade de IA, oportunidades priorizadas, custos identificados e plano de execução.",
    ferramenta: "spotlite",
  },
  {
    slug: "workshops",
    num: "02",
    nome: "RESET Workshops",
    frase: "Transforme licenças contratadas em capacidade instalada.",
    descricao:
      "Workshops sob medida para equipes que já utilizam ChatGPT, Gemini Workspace ou Claude, mas ainda exploram pouco o potencial dessas plataformas.",
    paraQuem: "Equipes e líderes de Marketing, Vendas, CS e áreas de apoio.",
    entregas: [
      "Levantamento de casos reais",
      "Trilhas por função",
      "Exercícios com materiais autorizados",
      "Bibliotecas de prompts e assistentes",
      "Plano de adoção",
    ],
    medimos: "Adoção ativa, tarefas aceleradas e satisfação dos participantes.",
  },
  {
    slug: "ai-champions",
    num: "03",
    nome: "RESET AI Champions",
    frase: "Forme os líderes que vão multiplicar a transformação.",
    descricao:
      "Desenvolvemos gestores e multiplicadores internos capazes de identificar oportunidades, conduzir experimentos e disseminar IA com segurança.",
    paraQuem: "Lideranças e talentos que serão referência de IA na organização.",
    entregas: [
      "Seleção dos Champions",
      "Formação aplicada",
      "Discovery de problemas",
      "Protótipos",
      "Projeto final",
      "Ritual de acompanhamento 30/60/90 dias",
    ],
    medimos: "Projetos implantados, engajamento e adoção sustentada.",
  },
  {
    slug: "processos-com-ia",
    num: "04",
    nome: "RESET Processos com IA",
    frase: "Antes de automatizar, redesenhe o trabalho.",
    descricao:
      "Diagnosticamos processos, eliminamos etapas desnecessárias e redesenhamos fluxos para colaboração entre pessoas, IA e automações, com apoio da Fluxa BPM quando aplicável.",
    paraQuem: "Empresas com retrabalho, gargalos operacionais ou processos pouco padronizados.",
    entregas: [
      "Mapa AS-IS",
      "Gargalos e riscos",
      "Desenho TO-BE",
      "Responsabilidades",
      "Backlog de automações e indicadores",
    ],
    medimos: "Tempo de ciclo, retrabalho, capacidade e economia validada.",
    ferramenta: "fluxa",
  },
  {
    slug: "agent-factory",
    num: "05",
    nome: "RESET Agent Factory",
    frase: "Agentes inteligentes feitos para desafios reais.",
    descricao:
      "Planejamos, prototipamos, testamos e implementamos agentes para Marketing, Vendas e Customer Success, com integrações e supervisão adequadas.",
    paraQuem: "Empresas que precisam escalar produção, atendimento, prospecção e análises.",
    entregas: [
      "Casos priorizados",
      "Design de agentes",
      "Integrações",
      "Testes e guardrails",
      "Documentação",
      "Capacitação e evolução",
    ],
    medimos: "Qualidade de respostas, utilização, horas poupadas e impacto no funil de receita.",
    relacionado: {
      titulo: "Explore a Fábrica de Agentes por área",
      texto: "Conheça 30 possibilidades de agentes aplicados a Marketing, Vendas e Customer Success.",
      link: { label: "Ver catálogo de agentes", href: "/agentes" },
    },
  },
  {
    slug: "governance",
    num: "06",
    nome: "RESET Governance",
    frase: "Inovação com clareza, responsabilidade e controle.",
    descricao:
      "Estruturamos as regras, ritos e responsabilidades necessárias para o uso confiável de IA e para a expansão responsável das iniciativas.",
    paraQuem: "Empresas que querem escalar IA com segurança, conformidade e alinhamento entre áreas.",
    entregas: [
      "Política de uso",
      "Comitê multidisciplinar",
      "Matriz de riscos",
      "Fluxo de aprovação",
      "Critérios de acesso",
      "Plano de treinamento",
    ],
    medimos: "Aderência às políticas, riscos tratados e projetos avaliados.",
  },
  {
    slug: "performance",
    num: "07",
    nome: "RESET Performance",
    frase: "Implantar é o começo. Evoluir é o diferencial.",
    descricao:
      "Acompanhamos a adoção, a performance dos agentes e os resultados financeiros e operacionais dos projetos para sustentar a melhoria contínua.",
    paraQuem: "Empresas que desejam transformar implantação em resultados contínuos.",
    entregas: [
      "Baseline",
      "Painel de indicadores",
      "Rituais de performance",
      "Experimentação",
      "Backlog de evolução",
      "Relatórios executivos",
    ],
    medimos: "Adoção, custo total, retenção, produtividade e receita incremental validada.",
    ferramenta: "spotlite",
  },
];

export const solucoes = {
  hero: {
    kicker: "Portfólio Reset",
    titulo: ["Sete soluções.", "Uma transformação."],
    lead: "Contrate uma capacidade específica ou combine soluções em uma jornada integrada. Cada produto tem escopo e entregáveis próprios.",
  },
  lista,
  /** Rótulo do link em cada linha da lista. */
  explorar: "Explorar solução",
  detalhe: {
    voltar: { label: "Voltar para soluções", href: "/solucoes" },
    kicker: "Solução RESET 360",
    oQueE: "O que é",
    titulo: ["Desenhado para gerar", "mudança real."],
    campos: {
      paraQuem: "Para quem",
      entregas: "Principais entregas",
      medimos: "Como medimos",
      ferramenta: "Tecnologia própria",
    },
    cta: "Falar sobre esta solução",
    continuar: {
      kicker: "Continue explorando",
      titulo: ["Uma solução conecta", "a próxima."],
    },
  },
  cta: ctaPadrao,
};

export const solucaoPorSlug = (slug: string) => lista.find((s) => s.slug === slug);

export const seoSolucao = (s: Solucao) => ({ title: `${s.nome} | Reset IA`, description: s.descricao });
