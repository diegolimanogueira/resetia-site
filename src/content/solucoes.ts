import type { CtaFinal, Pergunta, Solucao } from "./types";

/** Fecho de todas as páginas: o convite do RESET 360, levando ao RESET AI Score (WhatsApp como segundo caminho). */
export const ctaPadrao: CtaFinal = {
  kicker: "O próximo ciclo começa aqui",
  titulo: ["Sua empresa está pronta", "para *resetar o futuro?*"],
  apoio:
    "Comece pelo RESET AI Score: em cerca de 5 minutos, descubra o nível de maturidade em IA da sua empresa e por onde evoluir.",
  botao: "Descobrir meu AI Score",
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
      "Da capacitação prática à aplicação no dia a dia, ajudamos sua empresa a desenvolver as competências necessárias para incorporar IA aos processos, à gestão e à geração de resultados.",
    ],
    cta: {
      label: "Quero preparar meu time",
      mensagem: "Olá! Conheci a Reset pelo site e quero preparar meu time para IA com o RESET AI Champions.",
    },
    ctaSecundario: { label: "Conhecer o programa", href: "#sobre" },
    sobre: {
      titulo: ["A transformação com IA", "*começa pelas pessoas.*"],
      paragrafos: [
        "Ter acesso às melhores ferramentas não significa, necessariamente, saber utilizá-las para gerar resultados.",
        "Muitas empresas já investem em ChatGPT, Gemini, Claude e outras soluções, mas enfrentam o mesmo desafio: profissionais que utilizam apenas uma pequena parte do potencial dessas tecnologias.",
        "O RESET AI Champions foi desenvolvido para mudar esse cenário.",
        "Criamos programas de formação personalizados, que combinam capacitação, workshops práticos e desenvolvimento de multiplicadores internos.",
        "Nossa metodologia conecta tecnologia, estratégia e desafios reais da operação para preparar gestores e equipes para trabalhar com IA de forma estruturada, produtiva e orientada ao negócio.",
        "Não ensinamos apenas a utilizar ferramentas. Preparamos profissionais para repensar suas atividades, identificar oportunidades e liderar novas formas de trabalhar.",
      ],
    },
    beneficios: {
      titulo: ["Sua equipe preparada para", "*uma nova era de trabalho.*"],
      itens: [
        {
          titulo: "Mais produtividade",
          texto:
            "Capacite profissionais para reduzir tarefas repetitivas, acelerar entregas e concentrar esforços em atividades de maior valor.",
        },
        {
          titulo: "Melhor aproveitamento das ferramentas",
          texto:
            "Extraia mais valor das tecnologias de IA que sua empresa já contrata, reduzindo subutilização e desperdício.",
        },
        {
          titulo: "Lideranças preparadas",
          texto:
            "Desenvolva gestores capazes de identificar oportunidades, orientar equipes e incorporar IA às decisões e rotinas de trabalho.",
        },
        {
          titulo: "Conhecimento que se multiplica",
          texto:
            "Forme profissionais de referência que disseminam boas práticas e impulsionam a adoção da IA em diferentes áreas.",
        },
        {
          titulo: "Aplicação prática desde o início",
          texto: "Transforme o aprendizado em casos de uso reais, conectados aos processos e objetivos da organização.",
        },
      ],
    },
    entregaveis: {
      titulo: ["Uma jornada de capacitação feita", "*para a realidade da sua empresa.*"],
      itens: [
        "Diagnóstico inicial de necessidades de capacitação e maturidade das equipes.",
        "Workshops personalizados em ChatGPT, Gemini, Claude e outras ferramentas relevantes.",
        "Formação de gestores e lideranças para atuação com IA.",
        "Desenvolvimento de multiplicadores internos, os AI Champions.",
        "Capacitação aplicada aos processos de Marketing, Vendas e Customer Success.",
        "Exercícios práticos e desafios de aplicação.",
        "Biblioteca inicial de casos de uso, prompts e boas práticas.",
        "Plano de adoção com prioridades e orientações para continuidade.",
        "Indicadores de participação, adoção e aplicação prática.",
      ],
    },
    paraQuem: {
      titulo: ["Ideal para empresas", "*que querem:*"],
      itens: [
        "Preparar seus times para trabalhar com inteligência artificial.",
        "Aproveitar melhor licenças e ferramentas já contratadas.",
        "Formar líderes para conduzir a transformação.",
        "Desenvolver uma cultura de inovação e aprendizado contínuo.",
        "Levar IA para diferentes áreas de forma estruturada.",
        "Sair de treinamentos genéricos e avançar para aplicações reais.",
      ],
    },
    etapas: [
      {
        numero: "01",
        titulo: "Entendemos o negócio",
        texto: "Identificamos o perfil dos profissionais, os desafios da operação e as oportunidades de aplicação.",
      },
      {
        numero: "02",
        titulo: "Personalizamos a formação",
        texto: "Desenhamos workshops e trilhas de aprendizado adequados ao nível de maturidade de cada grupo.",
      },
      {
        numero: "03",
        titulo: "Colocamos a IA em prática",
        texto: "Desenvolvemos exercícios e aplicações conectados ao trabalho real dos participantes.",
      },
      {
        numero: "04",
        titulo: "Formamos multiplicadores",
        texto: "Preparamos profissionais para disseminar conhecimento e apoiar a evolução da empresa.",
      },
      {
        numero: "05",
        titulo: "Medimos a evolução",
        texto: "Acompanhamos a adoção, as aplicações desenvolvidas e as oportunidades de continuidade.",
      },
    ],
    ctaFinal: {
      titulo: ["O futuro da sua empresa depende das competências", "*que seu time desenvolve hoje.*"],
      texto: "Prepare suas lideranças e transforme o potencial da IA em capacidade real de execução.",
      botao: "Quero desenvolver meu time com IA",
    },
    relacionadas: ["processos-com-ia", "agent-factory", "governance"],
    seo: {
      title: "RESET AI Champions: líderes e equipes prontos para IA | Reset IA",
      description:
        "Formação de líderes, workshops personalizados e multiplicadores internos para transformar a IA em uma nova forma de trabalhar na sua empresa.",
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
      "Redesenhamos processos para que pessoas, tecnologia e inteligência artificial trabalhem de forma mais inteligente.",
      "Identificamos gargalos, eliminamos desperdícios e estruturamos operações preparadas para ganhar produtividade, escalar resultados e incorporar IA com propósito.",
    ],
    cta: {
      label: "Quero transformar meus processos",
      mensagem: "Olá! Conheci a Reset pelo site e quero transformar meus processos com o RESET Processos com IA.",
    },
    ctaSecundario: { label: "Entender como funciona", href: "#como-funciona" },
    sobre: {
      titulo: ["Antes de implementar IA,", "*é preciso entender como o trabalho acontece.*"],
      paragrafos: [
        "Processos fragmentados, atividades manuais, retrabalho e falta de integração ainda limitam o desempenho de muitas empresas.",
        "Quando a inteligência artificial é implementada sem uma revisão da operação, esses problemas não desaparecem. Muitas vezes, apenas ganham uma nova camada tecnológica.",
        "O RESET Processos com IA propõe um caminho diferente.",
        "Analisamos como o trabalho acontece hoje, identificamos oportunidades de melhoria e redesenhamos fluxos mais eficientes, integrados e preparados para incorporar agentes e automações inteligentes.",
        "Nossa atuação combina visão de negócio, gestão de processos e tecnologia para criar operações mais simples, produtivas e escaláveis.",
      ],
    },
    beneficios: {
      titulo: ["Processos mais simples.", "*Operações mais inteligentes.*"],
      itens: [
        {
          titulo: "Menos retrabalho",
          texto:
            "Identifique atividades duplicadas, etapas desnecessárias e falhas de comunicação que prejudicam a produtividade.",
        },
        {
          titulo: "Mais eficiência operacional",
          texto: "Redesenhe fluxos para reduzir esforço manual, atrasos e desperdícios.",
        },
        {
          titulo: "Clareza sobre onde aplicar IA",
          texto:
            "Descubra quais atividades realmente podem se beneficiar de agentes inteligentes, automações ou outras tecnologias.",
        },
        {
          titulo: "Melhor integração entre áreas",
          texto: "Conecte Marketing, Vendas, CS e demais funções envolvidas na jornada do cliente.",
        },
        {
          titulo: "Estrutura preparada para crescer",
          texto: "Crie processos documentados, mensuráveis e preparados para evoluir conforme o negócio ganha escala.",
        },
      ],
    },
    entregaveis: {
      titulo: ["Do entendimento da operação", "*ao desenho do futuro.*"],
      itens: [
        "Mapeamento dos processos atuais.",
        "Identificação de gargalos e oportunidades de eficiência.",
        "Análise de atividades manuais e repetitivas.",
        "Redesenho dos processos futuros com IA.",
        "Identificação de casos de uso de agentes e automações.",
        "Definição de etapas, responsáveis e pontos de decisão.",
        "Priorização das oportunidades conforme impacto e viabilidade.",
        "Desenho de indicadores para acompanhar eficiência.",
        "Roadmap de implantação e evolução operacional.",
        "Documentação dos fluxos e recomendações de melhoria.",
      ],
    },
    tecnologia: {
      ferramenta: "fluxa",
      kicker: "Tecnologia que potencializa a transformação",
      titulo: ["Conheça o", "*Fluxa BPM.*"],
      paragrafos: [
        "Para apoiar o desenho e a organização dos processos, contamos com o Fluxa BPM, uma tecnologia de mapeamento de processos com inteligência artificial.",
        "O Fluxa BPM pode ser utilizado como acelerador dos projetos conduzidos pela Reset, ajudando a estruturar e visualizar processos com maior agilidade.",
        "Além de apoiar nossos serviços, a ferramenta possui uma proposta de valor independente.",
      ],
      cta: "Conhecer o Fluxa BPM",
    },
    paraQuem: {
      titulo: ["Ideal para", "*empresas que:*"],
      itens: [
        "Precisam organizar e melhorar seus processos.",
        "Possuem atividades manuais ou excesso de retrabalho.",
        "Desejam implementar IA, mas não sabem por onde começar.",
        "Querem integrar melhor diferentes áreas.",
        "Precisam aumentar produtividade e escalabilidade.",
        "Buscam reduzir custos operacionais e desperdícios.",
      ],
    },
    etapas: [
      {
        numero: "01",
        titulo: "Mapeamos",
        texto: "Entendemos os processos atuais, os responsáveis e os principais desafios.",
      },
      {
        numero: "02",
        titulo: "Identificamos",
        texto: "Localizamos gargalos, desperdícios e oportunidades de melhoria.",
      },
      {
        numero: "03",
        titulo: "Redesenhamos",
        texto: "Estruturamos fluxos mais inteligentes, considerando pessoas, processos e tecnologia.",
      },
      { numero: "04", titulo: "Priorizamos", texto: "Definimos onde a IA e a automação podem gerar maior valor." },
      {
        numero: "05",
        titulo: "Preparamos a evolução",
        texto: "Entregamos processos futuros, documentação e um plano de implantação.",
      },
    ],
    ctaFinal: {
      titulo: ["O próximo salto de produtividade da sua empresa", "*pode começar pelos processos.*"],
      texto: "Antes de investir em novas tecnologias, descubra como sua operação pode trabalhar melhor.",
      botao: "Quero redesenhar minha operação",
    },
    relacionadas: ["agent-factory", "ai-champions", "performance"],
    seo: {
      title: "RESET Processos com IA: redesenho de processos | Reset IA",
      description:
        "Mapeamos processos, eliminamos gargalos e redesenhamos fluxos para que pessoas, tecnologia e IA trabalhem melhor, com apoio do Fluxa BPM.",
    },
  },
  {
    slug: "agent-factory",
    num: "03",
    nome: "RESET Agent Factory",
    icone: "agentes",
    frase: "Agentes inteligentes feitos para desafios reais.",
    headline: ["E se sua empresa pudesse fazer mais,", "*sem precisar multiplicar ferramentas e tarefas?*"],
    descricao: [
      "Criamos agentes inteligentes que trabalham com seus times, automatizam atividades e ampliam a capacidade de gerar resultados.",
      "Da criação de conteúdo à inteligência comercial, desenvolvemos soluções de IA personalizadas para os desafios de Marketing, Vendas e Customer Success.",
    ],
    cta: {
      label: "Quero criar agentes para minha empresa",
      mensagem:
        "Olá! Conheci a Reset pelo site e quero criar agentes de IA para minha empresa com o RESET Agent Factory.",
    },
    ctaSecundario: { label: "Explorar aplicações", href: "#casos-de-uso" },
    sobre: {
      titulo: ["Menos trabalho operacional.", "*Mais inteligência para o negócio.*"],
      paragrafos: [
        "A maioria das empresas não precisa apenas de mais ferramentas. Precisa de soluções que resolvam problemas reais.",
        "Hoje, equipes convivem com múltiplas plataformas, atividades repetitivas, informações fragmentadas e processos que consomem tempo sem necessariamente gerar mais valor.",
        "O RESET Agent Factory foi criado para transformar esse cenário.",
        "Nossa Fábrica de Agentes desenha e desenvolve soluções inteligentes adaptadas à operação da empresa, conectando tecnologias de IA, dados, processos e objetivos de negócio.",
        "Os agentes podem apoiar profissionais na execução de atividades, realizar análises, produzir materiais, organizar informações e automatizar etapas de fluxos de trabalho, conforme os limites definidos para cada solução.",
        "O resultado é uma operação com mais capacidade produtiva, menos complexidade e novas possibilidades de crescimento.",
      ],
    },
    beneficios: {
      titulo: ["Agentes que trabalham", "*para o seu negócio.*"],
      itens: [
        {
          titulo: "Menos ferramentas redundantes",
          texto: "Identifique oportunidades de consolidar funcionalidades e reduzir custos com soluções subutilizadas.",
        },
        {
          titulo: "Mais produtividade para os times",
          texto: "Automatize atividades repetitivas e libere profissionais para decisões e ações de maior valor.",
        },
        {
          titulo: "Soluções personalizadas",
          texto: "Tenha agentes desenhados para os processos, necessidades e particularidades da sua operação.",
        },
        {
          titulo: "Mais velocidade de execução",
          texto: "Acelere análises, produção de materiais, atendimento e fluxos comerciais.",
        },
        {
          titulo: "Potencial de crescimento de receita",
          texto: "Apoie atividades que influenciam aquisição, conversão, retenção e expansão de clientes.",
        },
        {
          titulo: "Evolução contínua",
          texto: "Aprimore os agentes conforme a operação evolui, com monitoramento de qualidade e desempenho.",
        },
      ],
    },
    entregaveis: {
      titulo: ["Do desafio de negócio", "*ao agente em operação.*"],
      itens: [
        "Identificação e priorização de oportunidades.",
        "Desenho da solução e definição de funcionalidades.",
        "Arquitetura dos agentes e escolha das tecnologias.",
        "Configuração ou desenvolvimento personalizado.",
        "Integração com ferramentas, bases e sistemas disponíveis, quando viável.",
        "Definição de limites de autonomia e critérios de segurança.",
        "Testes funcionais e validação dos resultados.",
        "Implantação e capacitação dos usuários.",
        "Documentação e orientações de utilização.",
        "Acompanhamento inicial e recomendações de evolução.",
      ],
    },
    paraQuem: {
      titulo: ["Ideal para", "*empresas que:*"],
      itens: [
        "Querem incorporar agentes inteligentes à operação.",
        "Precisam acelerar a produtividade de Marketing, Vendas e CS.",
        "Possuem processos repetitivos e intensivos em informação.",
        "Desejam reduzir dependência de ferramentas fragmentadas.",
        "Precisam de aplicações de IA personalizadas.",
        "Querem transformar tecnologia em eficiência e oportunidades de receita.",
      ],
    },
    etapas: [
      {
        numero: "01",
        titulo: "Descobrimos a oportunidade",
        texto: "Analisamos o problema de negócio e os resultados esperados.",
      },
      {
        numero: "02",
        titulo: "Desenhamos a solução",
        texto: "Definimos o papel do agente, suas funcionalidades, integrações e limites de atuação.",
      },
      {
        numero: "03",
        titulo: "Construímos e testamos",
        texto: "Desenvolvemos a solução e validamos qualidade, segurança e funcionamento.",
      },
      {
        numero: "04",
        titulo: "Implantamos",
        texto: "Integramos o agente ao fluxo de trabalho e orientamos os usuários.",
      },
      {
        numero: "05",
        titulo: "Evoluímos",
        texto: "Acompanhamos resultados e identificamos oportunidades de melhoria.",
      },
    ],
    ctaFinal: {
      titulo: ["Seus times têm desafios reais.", "*Seus agentes também deveriam ter.*"],
      texto: "Descubra o que a inteligência artificial pode executar, simplificar e transformar na sua operação.",
      botao: "Quero desenvolver meus agentes",
    },
    relacionadas: ["processos-com-ia", "governance", "performance"],
    seo: {
      title: "RESET Agent Factory: agentes de IA personalizados | Reset IA",
      description:
        "Agentes de IA sob medida para Marketing, Vendas e Customer Success: menos trabalho operacional, mais produtividade e menos ferramentas redundantes.",
    },
  },
  {
    slug: "governance",
    num: "04",
    nome: "RESET Governance",
    icone: "governanca",
    frase: "Inovação com clareza, responsabilidade e controle.",
    headline: ["Quanto mais a IA avança, mais importante é saber", "*quem decide, como utiliza e o que pode fazer.*"],
    descricao: [
      "Estruturamos a governança de inteligência artificial para que sua empresa inove com segurança, responsabilidade e clareza.",
      "Políticas, comitês, diretrizes e processos de decisão para transformar o uso de IA em uma prática organizada e sustentável.",
    ],
    cta: {
      label: "Quero estruturar a governança de IA",
      mensagem:
        "Olá! Conheci a Reset pelo site e quero estruturar a governança de IA da minha empresa com o RESET Governance.",
    },
    ctaSecundario: { label: "Conhecer a solução", href: "#sobre" },
    sobre: {
      titulo: ["Inovar com inteligência também significa", "*estabelecer limites.*"],
      paragrafos: [
        "A inteligência artificial já faz parte da rotina de muitas empresas, frequentemente antes mesmo de existir uma estratégia institucional para sua utilização.",
        "Profissionais compartilham informações com ferramentas externas, áreas desenvolvem iniciativas independentes e decisões passam a contar com o apoio de sistemas inteligentes.",
        "Sem direcionamento, esse movimento pode gerar riscos, conflitos, desperdícios e falta de visibilidade.",
        "O RESET Governance ajuda sua empresa a estruturar um modelo de governança adequado ao seu nível de maturidade, estabelecendo regras, responsabilidades e mecanismos de acompanhamento para o uso de IA.",
        "Criamos as condições para que a inovação avance de forma responsável, coordenada e alinhada aos objetivos do negócio.",
      ],
    },
    beneficios: {
      titulo: ["Mais segurança para inovar.", "*Mais clareza para evoluir.*"],
      itens: [
        {
          titulo: "Uso responsável da IA",
          texto:
            "Estabeleça diretrizes claras sobre privacidade, proteção de informações e uso adequado das tecnologias.",
        },
        {
          titulo: "Responsabilidades definidas",
          texto: "Organize quem pode propor, aprovar, implementar e acompanhar iniciativas de inteligência artificial.",
        },
        {
          titulo: "Decisões mais consistentes",
          texto: "Crie critérios para priorizar projetos conforme valor de negócio, viabilidade e nível de risco.",
        },
        {
          titulo: "Menos iniciativas dispersas",
          texto: "Conecte tecnologia, negócio, pessoas e processos sob uma estratégia de evolução compartilhada.",
        },
        {
          titulo: "Mais confiança organizacional",
          texto: "Desenvolva um ambiente de inovação com transparência, controle e supervisão humana.",
        },
      ],
    },
    entregaveis: {
      titulo: ["Uma estrutura de governança", "*adaptada à realidade da empresa.*"],
      itens: [
        "Avaliação inicial de práticas e riscos relacionados à IA.",
        "Elaboração de política corporativa de uso de IA.",
        "Diretrizes para utilização de ferramentas e tratamento de informações.",
        "Definição de papéis e responsabilidades.",
        "Estruturação de comitê multidisciplinar de IA.",
        "Critérios para avaliação, priorização e aprovação de iniciativas.",
        "Orientações para revisão humana e controle de qualidade.",
        "Modelo de inventário de ferramentas e aplicações de IA.",
        "Recomendações para acompanhamento de riscos e incidentes.",
        "Plano de comunicação e sensibilização das equipes.",
      ],
      nota: "A governança é desenvolvida em conjunto com as áreas responsáveis da empresa, incluindo Jurídico, Segurança da Informação e Privacidade quando aplicável.",
    },
    paraQuem: {
      titulo: ["Ideal para", "*empresas que:*"],
      itens: [
        "Já utilizam IA em diferentes áreas, mas não possuem diretrizes claras.",
        "Desejam formalizar políticas internas.",
        "Precisam organizar iniciativas e responsabilidades.",
        "Querem evitar o uso descontrolado de ferramentas e informações.",
        "Buscam escalar a adoção da IA com maior segurança.",
        "Precisam alinhar tecnologia, negócio e gestão de riscos.",
      ],
    },
    etapas: [
      {
        numero: "01",
        titulo: "Avaliamos o cenário",
        texto: "Entendemos como a empresa utiliza IA e quais são seus principais riscos e necessidades.",
      },
      {
        numero: "02",
        titulo: "Estabelecemos diretrizes",
        texto: "Desenhamos princípios, políticas e critérios de utilização.",
      },
      {
        numero: "03",
        titulo: "Organizamos a governança",
        texto: "Estruturamos papéis, responsabilidades e o modelo de comitê.",
      },
      {
        numero: "04",
        titulo: "Orientamos a adoção",
        texto: "Apoiamos a comunicação e a implementação das diretrizes.",
      },
      {
        numero: "05",
        titulo: "Preparamos o acompanhamento",
        texto: "Definimos rotinas para revisar iniciativas, riscos e evolução da governança.",
      },
    ],
    ctaFinal: {
      titulo: ["Sua empresa pode acelerar a inovação", "*sem abrir mão do controle.*"],
      texto:
        "Crie uma estrutura que permita adotar inteligência artificial com confiança, responsabilidade e visão de futuro.",
      botao: "Quero construir nossa governança de IA",
    },
    relacionadas: ["ai-champions", "agent-factory", "performance"],
    seo: {
      title: "RESET Governance: governança de IA | Reset IA",
      description:
        "Políticas, comitê, diretrizes e processos de decisão para sua empresa inovar com IA com segurança, responsabilidade e clareza.",
    },
  },
  {
    slug: "performance",
    num: "05",
    nome: "RESET Performance",
    icone: "performance",
    frase: "Implantar é o começo. Evoluir é o diferencial.",
    headline: ["Sua empresa já implementou IA.", "*Agora é hora de provar o valor que ela gera.*"],
    descricao: [
      "Transformamos iniciativas de inteligência artificial em uma jornada contínua de acompanhamento, otimização e resultados.",
      "Monitoramos adoção, produtividade, eficiência e indicadores de negócio para ajudar sua empresa a evoluir com inteligência.",
    ],
    cta: {
      label: "Quero evoluir meus resultados com IA",
      mensagem: "Olá! Conheci a Reset pelo site e quero evoluir meus resultados com IA com o RESET Performance.",
    },
    ctaSecundario: { label: "Conhecer o acompanhamento", href: "#como-funciona" },
    sobre: {
      titulo: ["Implementar IA é uma conquista.", "*Fazer ela gerar valor continuamente é o verdadeiro desafio.*"],
      paragrafos: [
        "Muitas empresas investem em capacitação, agentes inteligentes e automações, mas encontram dificuldades para responder a perguntas essenciais:",
        "As equipes estão utilizando as soluções? O tempo operacional diminuiu? Os processos melhoraram? Houve impacto nos indicadores de Marketing, Vendas e relacionamento com clientes?",
        "O RESET Performance foi criado para responder a essas perguntas.",
        "Atuamos no acompanhamento e na evolução das iniciativas de IA, conectando indicadores de adoção e eficiência aos resultados esperados pelo negócio.",
        "Nossa proposta é transformar projetos isolados em uma prática contínua de melhoria, aprendizado e geração de valor.",
      ],
    },
    beneficios: {
      titulo: ["IA não pode ser apenas uma iniciativa.", "*Precisa fazer parte do resultado.*"],
      itens: [
        {
          titulo: "Visibilidade sobre o impacto",
          texto: "Acompanhe o uso das soluções e os resultados observados na operação.",
        },
        {
          titulo: "Maior aproveitamento do investimento",
          texto: "Identifique soluções subutilizadas e oportunidades de melhorar o retorno sobre a tecnologia.",
        },
        {
          titulo: "Otimização contínua",
          texto: "Evolua agentes, processos e rotinas a partir de dados, feedbacks e necessidades reais.",
        },
        {
          titulo: "Decisões orientadas por evidências",
          texto: "Priorize novas iniciativas com base em indicadores, impacto esperado e viabilidade.",
        },
        {
          titulo: "Evolução sustentável",
          texto: "Crie uma dinâmica de melhoria contínua para acompanhar as mudanças da tecnologia e do negócio.",
        },
      ],
    },
    entregaveis: {
      titulo: ["Inteligência aplicada", "*ao acompanhamento dos resultados.*"],
      itens: [
        "Definição de indicadores e metas para cada iniciativa.",
        "Estruturação da linha de base para comparação.",
        "Acompanhamento da adoção de IA pelas equipes.",
        "Monitoramento de indicadores de produtividade e eficiência.",
        "Avaliação de qualidade e desempenho dos agentes.",
        "Identificação de problemas, oportunidades e necessidades de ajuste.",
        "Recomendações para otimização das soluções implantadas.",
        "Relatórios executivos de evolução e resultados.",
        "Reuniões periódicas de acompanhamento.",
        "Roadmap de novas oportunidades e melhorias.",
      ],
    },
    medicao: {
      kicker: "O que podemos medir",
      titulo: ["Indicadores", "*conectados ao negócio.*"],
      itens: [
        {
          area: "Produtividade e eficiência",
          texto: "Tempo de execução, horas operacionais, redução de retrabalho e volume de atividades processadas.",
        },
        {
          area: "Adoção de IA",
          texto: "Utilização das soluções, participação das equipes, frequência de uso e aplicação em processos.",
        },
        {
          area: "Marketing",
          texto: "Produtividade de campanhas, geração de leads, conversão e eficiência das iniciativas.",
        },
        { area: "Vendas", texto: "Tempo de resposta, produtividade comercial, conversão e evolução do pipeline." },
        {
          area: "Customer Success",
          texto: "Tempo de atendimento, retenção, satisfação e oportunidades de expansão de receita.",
        },
        {
          area: "Eficiência financeira",
          texto: "Custos de ferramentas, despesas operacionais, economia efetiva e custo de manutenção das soluções.",
        },
      ],
      aviso:
        "Os indicadores serão definidos conforme a realidade de cada projeto e a disponibilidade dos dados. Sempre que possível, utilizamos comparações estruturadas para distinguir resultados observados de impactos efetivamente atribuíveis à IA.",
    },
    paraQuem: {
      titulo: ["Ideal para", "*empresas que:*"],
      itens: [
        "Já implantaram soluções de IA e desejam acompanhar resultados.",
        "Precisam justificar investimentos em tecnologia.",
        "Querem aumentar a adoção e a utilização das soluções.",
        "Buscam evolução contínua de processos e agentes.",
        "Desejam identificar novas oportunidades de crescimento.",
        "Precisam de uma parceria para sustentar a transformação no longo prazo.",
      ],
    },
    etapas: [
      {
        numero: "01",
        titulo: "Definimos o sucesso",
        texto: "Alinhamos os objetivos e os indicadores que serão acompanhados.",
      },
      {
        numero: "02",
        titulo: "Estruturamos a mensuração",
        texto: "Estabelecemos a linha de base e organizamos as fontes de informação.",
      },
      {
        numero: "03",
        titulo: "Monitoramos",
        texto: "Acompanhamos utilização, desempenho e resultados das iniciativas.",
      },
      {
        numero: "04",
        titulo: "Otimizamos",
        texto: "Recomendamos ajustes e melhorias para ampliar o valor das soluções.",
      },
      {
        numero: "05",
        titulo: "Evoluímos",
        texto: "Priorizamos novas oportunidades para manter a operação em transformação.",
      },
    ],
    ctaFinal: {
      titulo: [
        "O valor da IA não está apenas no que ela consegue fazer.",
        "*Está no resultado que sua empresa consegue alcançar.*",
      ],
      texto: "Transforme o investimento em inteligência artificial em uma jornada contínua de evolução.",
      botao: "Quero acompanhar e evoluir meus resultados",
    },
    relacionadas: ["agent-factory", "processos-com-ia", "ai-champions"],
    seo: {
      title: "RESET Performance: resultados de IA medidos | Reset IA",
      description:
        "Acompanhamento de adoção, produtividade, eficiência e indicadores de negócio para transformar iniciativas de IA em evolução contínua.",
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
      "Pelo RESET AI Score: em cerca de 5 minutos, você descobre o nível de maturidade em IA da empresa, as maiores oportunidades e os próximos passos. Para aprofundar, a Análise Estratégica RESET é uma conversa com especialistas sobre o seu resultado.",
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
      "Algumas empresas começam preparando lideranças; outras precisam primeiro redesenhar um processo crítico, criar um agente para uma dor específica ou organizar as regras de uso. O RESET AI Score ajuda a escolher o melhor ponto de partida.",
  },
  perguntas: {
    kicker: "Perguntas frequentes",
    titulo: ["O que as empresas", "*perguntam antes de começar.*"],
  },
  detalhe: {
    voltar: { label: "Todas as soluções", href: "/solucoes" },
    sobre: "Sobre a solução",
    beneficios: "Benefícios",
    entregaveis: "O que entregamos",
    paraQuem: "Para quem é",
    etapas: "Como funciona",
    relacionadas: { kicker: "Soluções relacionadas", titulo: ["Uma solução conecta", "*a próxima.*"] },
    diagnostico: {
      titulo: "Ainda não sabe se é por aqui que sua empresa deve começar?",
      texto: "O RESET AI Score indica as soluções mais adequadas à sua maturidade, em cerca de 5 minutos.",
    },
  },
  cta: ctaPadrao,
};

export const solucaoPorSlug = (slug: string) => lista.find((s) => s.slug === slug);

export const seoSolucao = (s: Solucao) => s.seo;
