import type { CtaFinal, Pergunta, Solucao } from "./types";

/** Fecho de todas as páginas: o convite do RESET 360, agora levando ao diagnóstico gratuito. */
export const ctaPadrao: CtaFinal = {
  kicker: "O próximo ciclo começa aqui",
  titulo: ["Sua empresa está pronta", "para *resetar o futuro?*"],
  apoio:
    "Comece pelo diagnóstico gratuito: identificamos onde a IA pode criar eficiência, liberar capacidade e acelerar crescimento.",
  botao: "Solicitar diagnóstico gratuito",
};

const lista: Solucao[] = [
  {
    slug: "ai-champions",
    num: "01",
    nome: "RESET AI Champions",
    icone: "champions",
    frase: "Forme os líderes e as equipes que vão multiplicar a IA na empresa.",
    headline: [
      "Sua empresa não precisa apenas de pessoas que usam IA.",
      "*Precisa de pessoas que sabem o que fazer com ela.*",
    ],
    descricao: [
      "Formamos líderes, gestores e multiplicadores capazes de transformar inteligência artificial em uma nova forma de trabalhar.",
      "O programa combina formação executiva, workshops personalizados, capacitação prática e desenvolvimento de multiplicadores internos.",
    ],
    problemas: [
      "A empresa paga ChatGPT, Claude, Gemini ou outras ferramentas e utiliza pouco.",
      "Gestores sem preparo para liderar a adoção de IA.",
      "Equipes que não sabem como aplicar IA às suas atividades.",
      "Conhecimento restrito a profissionais isolados.",
      "Ausência de uma estratégia prática de capacitação.",
    ],
    beneficios: [
      "Maior produtividade.",
      "Melhor aproveitamento das ferramentas contratadas.",
      "Formação de lideranças.",
      "Desenvolvimento de multiplicadores.",
      "Adoção prática e estruturada da IA.",
    ],
    entregaveis: [
      "Trilhas de formação",
      "Workshops personalizados por área e ferramenta",
      "Capacitação de líderes e multiplicadores",
      "Exercícios aplicados ao trabalho real",
      "Desenvolvimento de casos de uso",
      "Plano de adoção",
      "Indicadores de evolução",
    ],
    paraQuem:
      "Lideranças, gestores e equipes de Marketing, Vendas, Customer Success e áreas de apoio, além dos talentos que serão referência de IA na organização.",
    etapas: [
      {
        numero: "01",
        titulo: "Leitura do time",
        texto: "Entendemos funções, ferramentas contratadas e o nível de uso de IA de cada área.",
      },
      {
        numero: "02",
        titulo: "Trilhas e formatos",
        texto: "Desenhamos as trilhas e escolhemos os formatos: formação executiva, workshops e capacitação prática.",
      },
      {
        numero: "03",
        titulo: "Formação aplicada",
        texto: "Exercícios com materiais autorizados e tarefas reais, que viram casos de uso da própria empresa.",
      },
      {
        numero: "04",
        titulo: "Multiplicadores e adoção",
        texto:
          "Champions internos, plano de adoção e indicadores de evolução para a IA não depender de poucas pessoas.",
      },
    ],
    medimos:
      "Adoção ativa das ferramentas, tarefas aceleradas, casos de uso implantados e engajamento dos multiplicadores.",
    cta: {
      label: "Quero preparar meu time para IA",
      mensagem: "Olá! Conheci a Reset pelo site e quero preparar meu time para IA com o RESET AI Champions.",
    },
    relacionadas: ["processos-com-ia", "agent-factory", "governance"],
    seo: {
      title: "RESET AI Champions: líderes e equipes prontos para IA | Reset IA",
      description:
        "Formação executiva, workshops personalizados e multiplicadores internos para transformar a IA em uma nova forma de trabalhar na sua empresa.",
    },
    formatos: {
      kicker: "Workshops fazem parte do programa",
      titulo: ["Formatos que se combinam", "*conforme o seu time.*"],
      itens: [
        {
          titulo: "Formação executiva",
          texto:
            "Lideranças e gestores preparados para decidir onde a IA entra e para conduzir a adoção nas suas áreas.",
        },
        {
          titulo: "Workshops personalizados",
          texto:
            "Por área e por ferramenta, para equipes que já utilizam ChatGPT, Gemini Workspace ou Claude, mas ainda exploram pouco o potencial dessas plataformas.",
        },
        {
          titulo: "Capacitação prática",
          texto: "Exercícios aplicados ao trabalho real, bibliotecas de prompts e assistentes para o dia a dia.",
        },
        {
          titulo: "Multiplicadores internos",
          texto: "Champions que identificam oportunidades, conduzem experimentos e disseminam IA com segurança.",
        },
      ],
    },
  },
  {
    slug: "processos-com-ia",
    num: "02",
    nome: "RESET Processos com IA",
    icone: "processos",
    frase: "Antes de automatizar, redesenhe o trabalho.",
    headline: ["Automatizar processos ruins não é transformação.", "*É acelerar a ineficiência.*"],
    descricao: [
      "Redesenhamos processos para que pessoas, tecnologia e inteligência artificial trabalhem de maneira mais inteligente.",
      "Identificamos gargalos, atividades redundantes e oportunidades de eficiência antes de recomendar automações ou agentes.",
    ],
    problemas: [
      "Retrabalho e etapas que se repetem sem agregar valor.",
      "Gargalos na passagem entre áreas, como de Marketing para Vendas e de Vendas para Customer Success.",
      "Processos pouco padronizados, que dependem de quem executa.",
      "Automações feitas em cima de fluxos que já não funcionavam.",
      "Dificuldade de saber onde a IA realmente ajuda.",
    ],
    beneficios: [
      "Redução de retrabalho.",
      "Mais eficiência operacional.",
      "Integração entre áreas.",
      "Identificação de oportunidades de automação.",
      "Processos preparados para crescimento.",
    ],
    entregaveis: [
      "Mapeamento de processos atuais",
      "Identificação de gargalos",
      "Redesenho de fluxos futuros",
      "Identificação de aplicações de IA",
      "Priorização de melhorias",
      "Documentação de processos",
      "Roadmap de evolução operacional",
    ],
    paraQuem: "Empresas com retrabalho, gargalos operacionais ou processos pouco padronizados.",
    etapas: [
      {
        numero: "01",
        titulo: "Processo atual",
        texto: "Mapeamos como o trabalho acontece hoje, com quem executa e com os dados reais do processo.",
      },
      {
        numero: "02",
        titulo: "Gargalos e redundâncias",
        texto: "Evidenciamos etapas desnecessárias, esperas, retrabalho e riscos.",
      },
      {
        numero: "03",
        titulo: "Fluxo futuro",
        texto: "Redesenhamos o processo e marcamos onde entram pessoas, automações, IA e agentes.",
      },
      {
        numero: "04",
        titulo: "Prioridades e roadmap",
        texto: "Priorizamos as melhorias, documentamos o processo e montamos o roadmap de evolução operacional.",
      },
    ],
    medimos: "Tempo de ciclo, retrabalho, capacidade e economia validada.",
    cta: {
      label: "Quero transformar meus processos",
      mensagem: "Olá! Conheci a Reset pelo site e quero transformar meus processos com o RESET Processos com IA.",
    },
    relacionadas: ["agent-factory", "ai-champions", "performance"],
    seo: {
      title: "RESET Processos com IA: redesenho de processos | Reset IA",
      description:
        "Mapeamos processos, eliminamos gargalos e redesenhamos fluxos para que pessoas, tecnologia e IA trabalhem melhor, com apoio da Fluxa BPM.",
    },
    tecnologia: {
      ferramenta: "fluxa",
      texto:
        "A Fluxa BPM é a tecnologia própria da Reset para mapear, documentar e redesenhar processos com IA. Ela apoia os projetos de Processos com IA, mas é uma ferramenta independente, com proposta própria: não é um sexto produto de consultoria.",
    },
  },
  {
    slug: "agent-factory",
    num: "03",
    nome: "RESET Agent Factory",
    icone: "agentes",
    frase: "Agentes inteligentes feitos para desafios reais.",
    headline: ["Agentes inteligentes", "*feitos para desafios reais.*"],
    descricao: [
      "Crie agentes de IA personalizados para transformar a produtividade, reduzir desperdícios e ampliar os resultados de Marketing, Vendas e Customer Success.",
      "Planejamos, prototipamos, testamos e implementamos cada agente com integrações e supervisão adequadas ao processo, aos dados e às metas da operação.",
    ],
    problemas: [
      "Equipes presas em atividades manuais e repetitivas.",
      "Produção de conteúdo, atendimento, prospecção e análises que não escalam com o time atual.",
      "Ferramentas contratadas que se sobrepõem e são pouco usadas.",
      "Soluções genéricas que não conversam com o processo nem com os dados da empresa.",
    ],
    beneficios: [
      "Redução de atividades manuais.",
      "Maior produtividade das equipes.",
      "Automação inteligente.",
      "Possibilidade de consolidar ferramentas redundantes.",
      "Soluções personalizadas.",
      "Aplicações conectadas à geração de receita.",
    ],
    entregaveis: [
      "Identificação de oportunidades",
      "Desenho da arquitetura dos agentes",
      "Desenvolvimento e configuração",
      "Integrações, quando tecnicamente viáveis",
      "Testes de qualidade e segurança",
      "Implantação",
      "Capacitação dos usuários",
      "Acompanhamento inicial e evolução",
    ],
    paraQuem: "Empresas que precisam escalar produção, atendimento, prospecção e análises.",
    etapas: [
      {
        numero: "01",
        titulo: "Oportunidades",
        texto: "Priorizamos os casos em que um agente gera mais valor, com o processo e os dados disponíveis.",
      },
      {
        numero: "02",
        titulo: "Arquitetura e protótipo",
        texto: "Desenhamos o agente, as fontes de informação, as integrações e os pontos de supervisão humana.",
      },
      {
        numero: "03",
        titulo: "Desenvolvimento e testes",
        texto: "Configuramos, integramos quando é viável e testamos qualidade, segurança e custo.",
      },
      {
        numero: "04",
        titulo: "Implantação e evolução",
        texto: "Colocamos em uso, capacitamos quem vai operar e acompanhamos a evolução.",
      },
    ],
    medimos: "Qualidade de respostas, utilização, horas poupadas e impacto no funil de receita.",
    cta: {
      label: "Quero criar agentes para minha empresa",
      mensagem:
        "Olá! Conheci a Reset pelo site e quero criar agentes de IA para minha empresa com o RESET Agent Factory.",
    },
    relacionadas: ["processos-com-ia", "governance", "performance"],
    seo: {
      title: "RESET Agent Factory: agentes de IA personalizados | Reset IA",
      description:
        "Agentes de IA sob medida para Marketing, Vendas e Customer Success: menos trabalho manual, mais produtividade e ferramentas consolidadas.",
    },
  },
  {
    slug: "governance",
    num: "04",
    nome: "RESET Governance",
    icone: "governanca",
    frase: "Inovação com clareza, responsabilidade e controle.",
    headline: ["Inovação com clareza,", "*responsabilidade e controle.*"],
    descricao: [
      "Apoiamos empresas na estruturação de políticas, diretrizes, responsabilidades e mecanismos de governança para adoção segura e responsável da inteligência artificial.",
    ],
    problemas: [
      "Uso de IA sem regras claras, cada área de um jeito.",
      "Dúvidas sobre o que pode e o que não pode ser compartilhado com ferramentas de IA.",
      "Iniciativas que surgem sem avaliação de riscos.",
      "Falta de responsáveis e de critérios para aprovar novas soluções.",
    ],
    beneficios: [
      "Uso responsável de IA.",
      "Maior clareza institucional.",
      "Segurança na utilização de informações.",
      "Redução de riscos.",
      "Decisões coordenadas.",
      "Evolução sustentável.",
    ],
    entregaveis: [
      "Política corporativa de uso de IA",
      "Diretrizes de segurança e privacidade",
      "Estruturação do comitê multidisciplinar",
      "Papéis e responsabilidades",
      "Critérios de avaliação de soluções",
      "Processo de aprovação de iniciativas",
      "Orientações sobre supervisão humana",
      "Inventário de aplicações e ferramentas",
      "Recomendações de acompanhamento",
    ],
    paraQuem: "Empresas que querem escalar IA com segurança, conformidade e alinhamento entre áreas.",
    etapas: [
      {
        numero: "01",
        titulo: "Uso atual",
        texto: "Levantamos as aplicações e ferramentas de IA em uso e como as informações circulam.",
      },
      {
        numero: "02",
        titulo: "Política e diretrizes",
        texto: "Definimos a política de uso, as diretrizes de segurança e privacidade e a supervisão humana.",
      },
      {
        numero: "03",
        titulo: "Comitê e aprovação",
        texto: "Estruturamos o comitê, os papéis e o fluxo de aprovação de novas iniciativas.",
      },
      {
        numero: "04",
        titulo: "Acompanhamento",
        texto: "Deixamos critérios de avaliação e recomendações para a governança evoluir com a empresa.",
      },
    ],
    medimos: "Aderência às políticas, riscos tratados e projetos avaliados.",
    cta: {
      label: "Quero estruturar nossa governança de IA",
      mensagem:
        "Olá! Conheci a Reset pelo site e quero estruturar a governança de IA da minha empresa com o RESET Governance.",
    },
    relacionadas: ["ai-champions", "agent-factory", "performance"],
    seo: {
      title: "RESET Governance: governança de IA | Reset IA",
      description:
        "Política de uso, diretrizes de segurança e privacidade, comitê, papéis e aprovação de iniciativas para adotar IA com responsabilidade e velocidade.",
    },
    destaque: {
      titulo: ["Governança que acelera,", "*não que trava.*"],
      texto:
        "Regras claras dão segurança para as áreas experimentarem: cada iniciativa sabe o que pode fazer, quem aprova e como será acompanhada. Menos dúvida no caminho, mais inovação com responsabilidade.",
    },
  },
  {
    slug: "performance",
    num: "05",
    nome: "RESET Performance",
    icone: "performance",
    frase: "Implantar é o começo. Evoluir é o diferencial.",
    headline: ["Implantar IA é o começo.", "*Evoluir é o diferencial.*"],
    descricao: [
      "Acompanhamos a adoção, a eficiência e os resultados das soluções implementadas para transformar iniciativas isoladas em uma jornada contínua de evolução.",
    ],
    problemas: [
      "Projetos de IA implantados sem linha de base para comparar.",
      "Dificuldade de mostrar o retorno do que foi investido.",
      "Adoção que cai depois da implantação.",
      "Agentes e processos sem acompanhamento de qualidade.",
    ],
    beneficios: [
      "Visibilidade sobre os resultados.",
      "Melhor aproveitamento dos investimentos.",
      "Otimização contínua.",
      "Acompanhamento da adoção.",
      "Identificação de novas oportunidades.",
      "Decisões orientadas por indicadores.",
    ],
    entregaveis: [
      "Definição de indicadores",
      "Estruturação de linha de base",
      "Monitoramento de adoção",
      "Acompanhamento de eficiência",
      "Análise do desempenho de agentes e processos",
      "Relatórios executivos",
      "Recomendações de melhoria",
      "Roadmap de evolução",
      "Reuniões periódicas de performance",
    ],
    paraQuem: "Empresas que desejam transformar implantação em resultados contínuos.",
    etapas: [
      {
        numero: "01",
        titulo: "Indicadores e linha de base",
        texto: "Escolhemos o que medir e registramos o ponto de partida antes de qualquer comparação.",
      },
      {
        numero: "02",
        titulo: "Monitoramento",
        texto: "Acompanhamos adoção, eficiência e o desempenho de agentes e processos.",
      },
      {
        numero: "03",
        titulo: "Rituais e relatórios",
        texto: "Reuniões periódicas de performance e relatórios executivos para quem decide.",
      },
      {
        numero: "04",
        titulo: "Evolução",
        texto: "Recomendações de melhoria, novas oportunidades e o roadmap do próximo ciclo.",
      },
    ],
    medimos: "Adoção, custo total, retenção, produtividade e receita incremental validada.",
    cta: {
      label: "Quero evoluir meus resultados com IA",
      mensagem: "Olá! Conheci a Reset pelo site e quero evoluir meus resultados com IA com o RESET Performance.",
    },
    relacionadas: ["agent-factory", "processos-com-ia", "ai-champions"],
    seo: {
      title: "RESET Performance: resultados de IA medidos | Reset IA",
      description:
        "Indicadores, linha de base, monitoramento de adoção e relatórios executivos para transformar iniciativas de IA em uma jornada contínua de evolução.",
    },
    indicadores: {
      kicker: "Indicadores possíveis",
      titulo: ["O que acompanhamos,", "*área por área.*"],
      itens: [
        { area: "Marketing", texto: "Conversão, produtividade e geração de oportunidades." },
        { area: "Vendas", texto: "Tempo de resposta, taxa de conversão, produtividade e pipeline." },
        { area: "Customer Success", texto: "Retenção, churn, satisfação e expansão." },
        { area: "Eficiência", texto: "Tempo operacional, redução de desperdícios, utilização e custos." },
      ],
      aviso:
        "Impacto financeiro só é apresentado com linha de base e método de mensuração acordados. Os indicadores de cada projeto são definidos com a empresa.",
    },
  },
];

/** Perguntas frequentes do site (home e página de soluções). */
export const perguntas: Pergunta[] = [
  {
    pergunta: "Preciso contratar as cinco soluções?",
    resposta:
      "Não. Cada solução pode ser contratada individualmente ou combinada em um programa de transformação mais amplo. A empresa entra pela solução adequada à sua maturidade e à sua necessidade.",
  },
  {
    pergunta: "Por onde devemos começar?",
    resposta:
      "Pelo diagnóstico gratuito, o RESET Scan: uma conversa inicial para entender o cenário da sua empresa, as ferramentas de IA em uso e os principais desafios, e indicar os próximos passos.",
  },
  {
    pergunta: "A Reset é uma escola de IA, uma consultoria ou uma fábrica de software?",
    resposta:
      "A combinação das três. Capacitamos pessoas, redesenhamos processos e desenvolvemos agentes inteligentes, com governança e acompanhamento de resultados, em uma proposta integrada de transformação.",
  },
  {
    pergunta: "Os agentes substituem as ferramentas que já usamos?",
    resposta:
      "Nem sempre. Avaliamos as ferramentas existentes, as redundâncias e as oportunidades de consolidação. Um agente pode complementar ou substituir tarefas específicas quando os testes comprovam qualidade, segurança e custo total vantajoso, considerando implementação, infraestrutura, modelos e manutenção.",
  },
  {
    pergunta: "Vocês atuam só em Marketing, Vendas e Customer Success?",
    resposta:
      "Esse é o nosso território de especialização, com uma visão integrada de toda a jornada de receita. Capacitação, processos e governança costumam envolver também as áreas de apoio que sustentam essa jornada.",
  },
  {
    pergunta: "O que são Spotlite e Fluxa BPM?",
    resposta:
      "Tecnologias próprias da Reset, com propostas independentes. A Spotlite apoia diagnósticos e análises de maturidade e oportunidades de IA; a Fluxa BPM apoia o mapeamento, a documentação e o redesenho de processos. Elas podem entrar nos projetos, conforme o escopo.",
  },
  {
    pergunta: "Como vocês medem os resultados?",
    resposta:
      "Com indicadores e linha de base definidos antes de qualquer promessa de ganho. O RESET Performance acompanha a adoção, a eficiência e os resultados das soluções implantadas.",
  },
];

export const solucoes = {
  hero: {
    kicker: "Soluções RESET 360",
    titulo: ["Cinco soluções.", "*Uma transformação.*"],
    lead: "Contrate uma capacidade específica ou combine soluções em um programa de transformação mais amplo. Cada empresa entra pela solução adequada à sua maturidade e à sua necessidade.",
  },
  lista,
  /** Rótulo do link em cada card. */
  explorar: "Conhecer solução",
  entrada: {
    kicker: "Sem sequência obrigatória",
    titulo: ["Não existe um único", "*caminho de entrada.*"],
    texto:
      "Algumas empresas começam preparando lideranças; outras precisam primeiro redesenhar um processo crítico, criar um agente para uma dor específica ou organizar as regras de uso. O diagnóstico gratuito ajuda a escolher o melhor ponto de partida.",
  },
  perguntas: {
    kicker: "Perguntas frequentes",
    titulo: ["O que as empresas", "*perguntam antes de começar.*"],
  },
  detalhe: {
    voltar: { label: "Todas as soluções", href: "/solucoes" },
    kicker: "Solução RESET 360",
    problemas: { kicker: "O que resolve", titulo: ["Os desafios que", "*esta solução enfrenta.*"] },
    beneficios: { kicker: "Benefícios", titulo: ["O que muda", "*na prática.*"] },
    entregaveis: { kicker: "Entregáveis", titulo: ["O que você", "*recebe.*"] },
    paraQuem: "Para quem é",
    medimos: "Como medimos",
    etapas: { kicker: "Como funciona", titulo: ["Do primeiro passo", "*à evolução.*"] },
    tecnologia: "Tecnologia relacionada",
    relacionadas: { kicker: "Soluções relacionadas", titulo: ["Uma solução conecta", "*a próxima.*"] },
    diagnostico: {
      titulo: "Ainda não sabe se é por aqui que sua empresa deve começar?",
      texto: "O diagnóstico gratuito indica a solução mais adequada à sua maturidade.",
    },
  },
  cta: ctaPadrao,
};

export const solucaoPorSlug = (slug: string) => lista.find((s) => s.slug === slug);

export const seoSolucao = (s: Solucao) => s.seo;
