import type {
  AreaId,
  Desafio,
  Dimensao,
  Escopo,
  HorizonteId,
  ModuloArea,
  Nivel,
  Opcao,
  PapelId,
  PerguntaCentral,
  PorteId,
  SegmentoId,
} from "./types";

/**
 * RESET AI Score: perguntas, escalas, níveis e textos do questionário, do resultado e do relatório.
 * Este módulo vai para o navegador (questionário e resultado são client); a landing page fica em ai-score.ts.
 *
 * Perguntas, alternativas, níveis, desafios e horizontes vêm do documento do Diego (28/10).
 * Textos por dimensão (ponto forte, oportunidade, passos e leitura) foram escritos a partir das alternativas
 * de maior pontuação de cada dimensão: revisar com o Diego.
 */

export const dimensoes: Dimensao[] = [
  {
    id: "estrategia",
    num: "01",
    nome: "Estratégia e Liderança",
    resumo: "Prioridade e direcionamento de IA.",
    forte: "Há direcionamento estratégico e liderança para o uso de IA.",
    lacuna: "Definir objetivos, prioridades e responsáveis pelas iniciativas de IA.",
    passos: {
      estruturar: "Definir objetivos de IA ligados às metas do negócio, com prioridades e um responsável pelo tema.",
      evoluir:
        "Revisar periodicamente o portfólio de iniciativas e concentrar o investimento nas que geram mais valor.",
    },
    leitura: {
      baixa:
        "A IA ainda não tem objetivos nem responsáveis definidos. As iniciativas tendem a surgir de forma isolada, sem conexão com as metas do negócio.",
      media:
        "Já existem prioridades ou iniciativas, mas o direcionamento ainda é parcial. O próximo passo é formalizar objetivos, responsáveis e acompanhamento.",
      alta: "A liderança direciona o tema com objetivos e responsáveis claros. O desafio passa a ser manter as prioridades conectadas aos resultados.",
    },
  },
  {
    id: "pessoas",
    num: "02",
    nome: "Pessoas e Adoção",
    resumo: "Capacitação e uso cotidiano.",
    forte: "As equipes já incorporam a IA à rotina de trabalho.",
    lacuna: "Ampliar a capacitação e o uso estruturado da IA pelas equipes.",
    passos: {
      estruturar:
        "Capacitar lideranças e equipes com casos de uso do próprio trabalho e formar multiplicadores internos.",
      evoluir: "Manter a formação contínua e acompanhar a adoção para levar as boas práticas a novas equipes.",
    },
    leitura: {
      baixa:
        "O uso de IA é raro ou depende da iniciativa de poucas pessoas, sem orientação. O conhecimento fica concentrado e as ferramentas são pouco aproveitadas.",
      media:
        "Parte das equipes já usa IA com frequência, mas a adoção é desigual e a capacitação ainda acontece de forma pontual.",
      alta: "A IA faz parte da rotina de boa parte das equipes, com formação estruturada. O foco agora é sustentar a adoção e espalhar as boas práticas.",
    },
  },
  {
    id: "processos",
    num: "03",
    nome: "Processos e Aplicações",
    resumo: "Integração da IA ao trabalho.",
    forte: "A IA já participa da execução de processos da operação.",
    lacuna: "Mapear processos prioritários e integrar a IA às atividades recorrentes.",
    passos: {
      estruturar: "Mapear processos prioritários com oportunidades de IA, começando pelas atividades repetitivas.",
      evoluir:
        "Evoluir as automações existentes para agentes integrados aos processos, com monitoramento de qualidade.",
    },
    leitura: {
      baixa:
        "A IA ainda não faz parte dos processos. As atividades repetitivas não foram mapeadas e o uso, quando existe, é individual.",
      media:
        "Há prompts, modelos ou automações reutilizados, e alguns processos já foram mapeados. Falta redesenhar os fluxos para que a IA execute etapas com responsáveis e controles.",
      alta: "A IA executa etapas de processos recorrentes, com responsáveis e controles. O desafio é aprimorar continuamente e levar o modelo a novos fluxos.",
    },
  },
  {
    id: "dados",
    num: "04",
    nome: "Dados e Tecnologia",
    resumo: "Preparação e infraestrutura.",
    forte: "Dados e ferramentas de IA estão organizados para as aplicações prioritárias.",
    lacuna: "Organizar os dados e coordenar as ferramentas de IA em uso.",
    passos: {
      estruturar:
        "Levantar as ferramentas de IA em uso, eliminar sobreposições e organizar os dados das aplicações prioritárias.",
      evoluir: "Integrar dados e ferramentas em uma arquitetura coordenada, com controles de qualidade e de acesso.",
    },
    leitura: {
      baixa:
        "Os dados estão dispersos e cada pessoa escolhe as próprias ferramentas. Isso dificulta integrar a IA aos processos e controlar custos.",
      media:
        "Há dados estruturados e ferramentas contratadas, mas pouca integração entre eles. Organizar a base tecnológica destrava aplicações mais consistentes.",
      alta: "Dados confiáveis e ferramentas aprovadas e integradas sustentam as aplicações de IA. O foco é manter a arquitetura coordenada à medida que o uso cresce.",
    },
  },
  {
    id: "governanca",
    num: "05",
    nome: "Governança e Segurança",
    resumo: "Regras, controle e responsabilidades.",
    forte: "Existem regras e controles claros para o uso de IA.",
    lacuna: "Estruturar diretrizes de uso responsável e responsabilidades claras antes de ampliar a aplicação da IA.",
    passos: {
      estruturar: "Formalizar diretrizes básicas de governança, com responsáveis e critérios de revisão humana.",
      evoluir: "Revisar as políticas periodicamente e ajustar os controles ao risco de cada aplicação.",
    },
    leitura: {
      baixa:
        "Não há regras claras para o uso de IA, e a verificação das respostas depende de cada pessoa. Ampliar o uso sem diretrizes aumenta os riscos com dados e decisões.",
      media:
        "Existem regras básicas ou revisões ocasionais, mas ainda sem política formal comunicada às equipes nem controles proporcionais ao risco.",
      alta: "Políticas, responsáveis e controles estão definidos e aplicados. O desafio é manter a governança atualizada sem travar a inovação.",
    },
  },
  {
    id: "resultados",
    num: "06",
    nome: "Resultados e Escala",
    resumo: "Mensuração e impacto.",
    forte: "Os resultados das iniciativas de IA já são acompanhados.",
    lacuna: "Definir indicadores para medir os resultados das iniciativas de IA.",
    passos: {
      estruturar: "Definir indicadores e uma linha de base para medir os resultados das iniciativas.",
      evoluir: "Acompanhar eficiência, qualidade e indicadores de negócio para decidir onde escalar.",
    },
    leitura: {
      baixa:
        "Os ganhos com IA ainda não são acompanhados. Sem indicadores, fica difícil priorizar investimentos e mostrar valor.",
      media:
        "Há casos promissores e algum acompanhamento de uso ou produtividade, mas os resultados ainda são pouco documentados.",
      alta: "Os resultados são medidos e recorrentes em diferentes processos ou equipes. A próxima etapa é usar esses dados para escalar o que funciona.",
    },
  },
];

/** As 12 perguntas centrais, na ordem do questionário. Alternativas valem 0, 1, 2, 3 e 4 pontos, nessa ordem. */
export const perguntasCentrais: PerguntaCentral[] = [
  {
    id: "p1",
    dimensao: "estrategia",
    texto: {
      empresa: "Sua empresa possui objetivos definidos para utilizar inteligência artificial?",
      area: "Sua área possui objetivos definidos para utilizar inteligência artificial?",
    },
    alternativas: [
      "Ainda não discutimos o assunto de forma estruturada.",
      "Existe interesse, mas sem prioridades definidas.",
      "Temos iniciativas pontuais ou projetos em avaliação.",
      "Temos prioridades e objetivos claros para IA.",
      "Temos estratégia, responsáveis e acompanhamento periódico de resultados.",
    ],
  },
  {
    id: "p2",
    dimensao: "estrategia",
    texto: {
      empresa: "Quem lidera as iniciativas de IA na empresa?",
      area: "Quem lidera as iniciativas de IA na sua área?",
    },
    alternativas: [
      "Ninguém é responsável pelo tema.",
      "Alguns profissionais experimentam por iniciativa própria.",
      "Existem referências informais ou responsáveis por projetos isolados.",
      "Existe uma liderança formal com responsabilidades definidas.",
      "Existe uma estrutura de liderança que coordena investimentos, prioridades e evolução.",
    ],
  },
  {
    id: "p3",
    dimensao: "pessoas",
    texto: {
      empresa: "Como a inteligência artificial é utilizada pelas equipes atualmente?",
      area: "Como a inteligência artificial é utilizada pela sua equipe atualmente?",
    },
    alternativas: [
      "Praticamente não é utilizada.",
      "Alguns profissionais utilizam ocasionalmente.",
      "Pequenos grupos utilizam com frequência.",
      "A utilização já faz parte da rotina de boa parte da equipe.",
      "A IA está incorporada aos principais fluxos de trabalho, com uso estruturado.",
    ],
  },
  {
    id: "p4",
    dimensao: "pessoas",
    texto: {
      empresa: "Como a empresa prepara os profissionais para trabalhar com IA?",
      area: "Como sua área prepara os profissionais para trabalhar com IA?",
    },
    alternativas: [
      "Não existem iniciativas de capacitação.",
      "O aprendizado acontece individualmente, sem orientação formal.",
      "Já realizamos palestras ou workshops pontuais.",
      "Temos programas estruturados de capacitação.",
      "Temos formação contínua, multiplicadores internos e acompanhamento de adoção.",
    ],
  },
  {
    id: "p5",
    dimensao: "processos",
    texto: {
      empresa: "Em que estágio estão os processos que poderiam ser melhorados com IA?",
      area: "Em que estágio estão os processos da sua área que poderiam ser melhorados com IA?",
    },
    alternativas: [
      "Não temos clareza sobre os processos nem oportunidades.",
      "Conhecemos algumas atividades repetitivas, mas não as mapeamos.",
      "Já identificamos ou mapeamos processos com potencial de IA.",
      "Alguns processos foram redesenhados para incorporar IA.",
      "Temos processos integrados à IA e os aprimoramos continuamente.",
    ],
  },
  {
    id: "p6",
    dimensao: "processos",
    texto: {
      empresa: "Como a IA participa da execução das atividades?",
      area: "Como a IA participa da execução das atividades da sua área?",
    },
    alternativas: [
      "Ainda não participa.",
      "É usada individualmente para atividades como textos, pesquisas e análises.",
      "Temos prompts, modelos ou automações reutilizados pela equipe.",
      "A IA executa etapas de fluxos recorrentes, com responsáveis e controles.",
      "Temos agentes ou automações integrados aos processos, monitorados e aprimorados.",
    ],
  },
  {
    id: "p7",
    dimensao: "dados",
    texto: {
      empresa: "Como estão organizados os dados necessários para utilizar IA?",
      area: "Como estão organizados os dados que sua área precisa para utilizar IA?",
    },
    alternativas: [
      "Os dados estão dispersos e são difíceis de acessar.",
      "Existem dados disponíveis, mas estão fragmentados.",
      "Temos dados estruturados em ferramentas ou áreas específicas.",
      "Temos dados confiáveis e acessíveis para aplicações prioritárias.",
      "Temos dados integrados, com controles de qualidade e acesso adequados para IA.",
    ],
  },
  {
    id: "p8",
    dimensao: "dados",
    texto: {
      empresa: "Como sua empresa administra as ferramentas e soluções de IA?",
      area: "Como sua área administra as ferramentas e soluções de IA?",
    },
    alternativas: [
      "Não utilizamos ferramentas de IA.",
      "Cada profissional escolhe ferramentas individualmente.",
      "Existem ferramentas contratadas, mas sem muita integração ou coordenação.",
      "Temos ferramentas aprovadas e alguma integração com os sistemas.",
      "Temos uma arquitetura tecnológica coordenada, integrada e acompanhada.",
    ],
  },
  {
    id: "p9",
    dimensao: "governanca",
    texto: {
      empresa: "Existem regras claras para utilização de inteligência artificial?",
      area: "Existem regras claras para utilização de inteligência artificial na sua área?",
    },
    alternativas: [
      "Não existem regras ou diretrizes.",
      "Existem orientações informais.",
      "Temos regras básicas documentadas.",
      "Temos política formal, responsáveis e orientações comunicadas às equipes.",
      "Temos políticas aplicadas, mecanismos de controle e revisões periódicas.",
    ],
  },
  {
    id: "p10",
    dimensao: "governanca",
    texto: {
      empresa: "Como a empresa controla a qualidade e os riscos das respostas ou decisões apoiadas por IA?",
      area: "Como sua área controla a qualidade e os riscos das respostas ou decisões apoiadas por IA?",
    },
    alternativas: [
      "Não existe nenhum processo de verificação.",
      "Cada profissional verifica como considera necessário.",
      "Existem revisões ocasionais.",
      "Existem critérios definidos de revisão humana, acesso e validação.",
      "Temos testes, registros, monitoramento e controles proporcionais ao risco.",
    ],
  },
  {
    id: "p11",
    dimensao: "resultados",
    texto: {
      empresa: "Como a empresa acompanha os resultados das iniciativas de IA?",
      area: "Como sua área acompanha os resultados das iniciativas de IA?",
    },
    alternativas: [
      "Não acompanhamos resultados.",
      "Temos apenas percepções informais de ganho.",
      "Acompanhamos utilização ou produtividade de maneira pontual.",
      "Temos indicadores definidos e comparações com a situação anterior.",
      "Acompanhamos sistematicamente eficiência, qualidade e indicadores de negócio.",
    ],
  },
  {
    id: "p12",
    dimensao: "resultados",
    texto: {
      empresa: "Que resultados a empresa já conseguiu obter com IA?",
      area: "Que resultados sua área já conseguiu obter com IA?",
    },
    alternativas: [
      "Ainda não iniciamos aplicações com resultados observáveis.",
      "Estamos experimentando, sem evidências claras de ganhos.",
      "Temos casos promissores, mas os resultados ainda são pouco documentados.",
      "Já registramos melhorias mensuráveis em algumas atividades.",
      "Temos resultados mensurados e recorrentes em diferentes processos ou equipes.",
    ],
  },
];

/** Escala padronizada dos módulos por área (0 a 4 pontos, nessa ordem). */
export const escalaArea = [
  "Não utilizamos IA nessa atividade.",
  "Utilizamos ocasionalmente, por iniciativa individual.",
  "Temos testes ou aplicações pontuais.",
  "A IA já faz parte de uma rotina estruturada.",
  "Está integrada à operação, com monitoramento de qualidade e resultados.",
] as const;

/** Rótulos curtos da escala, usados nas opções; a legenda com o texto completo fica acima das perguntas. */
export const escalaAreaCurta = ["Não usamos", "Ocasional", "Pontual", "Rotina", "Integrada"] as const;

export const modulosArea: ModuloArea[] = [
  {
    area: "marketing",
    nome: "Marketing",
    perguntas: [
      {
        id: "m1",
        texto: "Em que estágio está o uso de IA para produzir conteúdo, roteiros, imagens e criativos de Marketing?",
      },
      {
        id: "m2",
        texto: "Em que estágio está o uso de IA para analisar campanhas, mídia paga e desempenho de Marketing?",
      },
      {
        id: "m3",
        texto: "Em que estágio está o uso de IA para segmentar clientes, personalizar comunicações e apoiar o CRM?",
      },
      {
        id: "m4",
        texto:
          "Em que estágio está o uso de IA para identificar oportunidades de mercado, gerar demanda e apoiar decisões de Marketing?",
      },
    ],
  },
  {
    area: "vendas",
    nome: "Vendas",
    perguntas: [
      {
        id: "v1",
        texto: "Em que estágio está o uso de IA para prospecção e qualificação de oportunidades comerciais?",
      },
      {
        id: "v2",
        texto: "Em que estágio está o uso de IA para propostas, abordagens e acompanhamento de negociações?",
      },
      {
        id: "v3",
        texto:
          "Em que estágio está o uso de IA para analisar o CRM, priorizar oportunidades e apoiar previsões de vendas?",
      },
      {
        id: "v4",
        texto:
          "Em que estágio está o uso de IA para melhorar a produtividade dos vendedores e acompanhar indicadores de conversão?",
      },
    ],
  },
  {
    area: "customer-success",
    nome: "Customer Success",
    perguntas: [
      {
        id: "c1",
        texto: "Em que estágio está o uso de IA para atendimento, suporte e resolução de dúvidas recorrentes?",
      },
      { id: "c2", texto: "Em que estágio está o uso de IA para onboarding e acompanhamento da jornada dos clientes?" },
      {
        id: "c3",
        texto:
          "Em que estágio está o uso de IA para identificar riscos de cancelamento, insatisfação e oportunidades de retenção?",
      },
      {
        id: "c4",
        texto: "Em que estágio está o uso de IA para identificar oportunidades de expansão, upsell e relacionamento?",
      },
    ],
  },
];

/** Perguntas de segmentação, antes do questionário. Não entram no cálculo. */
export const segmentacao = {
  papel: {
    pergunta: "Qual é o seu papel na empresa?",
    opcoes: [
      { id: "ceo", label: "Empresário ou CEO" },
      { id: "diretor", label: "Diretor" },
      { id: "gestor", label: "Gestor" },
      { id: "coordenador", label: "Coordenador" },
      { id: "especialista", label: "Especialista" },
      { id: "outro", label: "Outro" },
    ] satisfies Opcao<PapelId>[],
  },
  escopo: {
    pergunta: "O que você deseja avaliar?",
    opcoes: [
      {
        id: "empresa",
        label: "Empresa como um todo",
        apoio: "Visão Empresa. Depois, você pode aprofundar Marketing, Vendas e Customer Success.",
      },
      { id: "marketing", label: "Marketing", apoio: "Visão por Área: a maturidade da sua área." },
      { id: "vendas", label: "Vendas", apoio: "Visão por Área: a maturidade da sua área." },
      { id: "customer-success", label: "Customer Success", apoio: "Visão por Área: a maturidade da sua área." },
    ] satisfies Opcao<Escopo>[],
  },
  porte: {
    pergunta: "Qual é o tamanho da empresa?",
    opcoes: [
      { id: "ate-10", label: "Até 10 colaboradores" },
      { id: "11-49", label: "11 a 49" },
      { id: "50-199", label: "50 a 199" },
      { id: "200-499", label: "200 a 499" },
      { id: "500-mais", label: "500 ou mais" },
    ] satisfies Opcao<PorteId>[],
  },
  segmento: {
    pergunta: "Qual é o segmento?",
    opcoes: [
      { id: "tecnologia", label: "Tecnologia" },
      { id: "industria", label: "Indústria" },
      { id: "servicos-b2b", label: "Serviços B2B" },
      { id: "varejo", label: "Varejo" },
      { id: "saude", label: "Saúde" },
      { id: "educacao", label: "Educação" },
      { id: "outros", label: "Outros" },
    ] satisfies Opcao<SegmentoId>[],
  },
};

/** Áreas que a visão empresa pode aprofundar (quatro perguntas cada). */
export const aprofundar = {
  pergunta: "Quer aprofundar alguma área?",
  apoio:
    "Quatro perguntas por área. Cada uma gera um Índice de Aplicação de IA na Área, separado do AI Score. Se preferir, siga sem aprofundar.",
  opcoes: modulosArea.map((m) => ({ id: m.area, label: m.nome })) satisfies Opcao<AreaId>[],
};

/** Maior desafio (até dois). Cada um liga a uma dimensão e traz um próximo passo próprio. */
export const desafios: Desafio[] = [
  {
    id: "comecar",
    label: "Não sabemos por onde começar.",
    dimensao: "estrategia",
    passo: "Escolher dois ou três casos de uso prioritários, com responsável e meta, para começar com foco.",
  },
  {
    id: "pouco-uso",
    label: "Nossas equipes utilizam pouco as ferramentas que já contratamos.",
    dimensao: "pessoas",
    passo: "Levar as ferramentas já contratadas à rotina das equipes, com casos de uso práticos e acompanhamento.",
  },
  {
    id: "capacitar",
    label: "Precisamos capacitar gestores e colaboradores.",
    dimensao: "pessoas",
    passo: "Estruturar uma trilha de capacitação para gestores e equipes, ligada às atividades de cada área.",
  },
  {
    id: "repetitivas",
    label: "Temos muitas tarefas repetitivas e processos ineficientes.",
    dimensao: "processos",
    passo: "Priorizar as tarefas repetitivas de maior volume e redesenhar esses fluxos com IA.",
  },
  {
    id: "agentes",
    label: "Queremos criar agentes inteligentes.",
    dimensao: "processos",
    passo: "Avaliar a viabilidade, os custos e os riscos de um primeiro agente para uma dor específica.",
  },
  {
    id: "custo-ferramentas",
    label: "Estamos gastando muito com ferramentas diferentes.",
    dimensao: "dados",
    passo: "Mapear as ferramentas contratadas, as sobreposições e as oportunidades de consolidação.",
  },
  {
    id: "governanca",
    label: "Precisamos estruturar políticas e governança.",
    dimensao: "governanca",
    passo: "Definir uma política de uso de IA, com regras de dados, responsáveis e revisão humana.",
  },
  {
    id: "medir",
    label: "Já temos iniciativas, mas não conseguimos medir os resultados.",
    dimensao: "resultados",
    passo: "Estabelecer uma linha de base e indicadores para as iniciativas que já estão em andamento.",
  },
];

export const desafiosPergunta = {
  pergunta: "Qual é o maior desafio com IA hoje?",
  apoio: "Escolha até duas opções.",
};

export const horizontes = {
  pergunta: "Em quanto tempo pretende avançar com uma iniciativa de IA?",
  opcoes: [
    { id: "imediato", label: "Imediatamente ou nos próximos 30 dias." },
    { id: "3-meses", label: "Nos próximos 3 meses." },
    { id: "6-meses", label: "Nos próximos 6 meses." },
    { id: "explorando", label: "Ainda estamos explorando possibilidades." },
  ] satisfies Opcao<HorizonteId>[],
};

/** Cinco níveis: proposta inicial da Reset, não percentis de mercado. */
export const niveis: Nivel[] = [
  {
    id: "inicial",
    nome: "Inicial",
    min: 0,
    max: 19,
    descricao: "A empresa ainda não estruturou sua jornada de IA.",
    titulo: "O primeiro passo é dar direção à IA.",
    texto:
      "A jornada de IA ainda não foi estruturada. Com objetivos claros, pessoas preparadas e os primeiros processos mapeados, é possível começar com foco e segurança.",
  },
  {
    id: "explorando",
    nome: "Explorando",
    min: 20,
    max: 39,
    descricao: "Existem iniciativas, mas a adoção ainda é pontual.",
    titulo: "A jornada começou. Agora é hora de dar direção.",
    texto:
      "Já existem iniciativas, mas a adoção ainda é pontual. Definir prioridades e estruturar a capacitação ajuda a transformar experimentos em prática.",
  },
  {
    id: "desenvolvimento",
    nome: "Em desenvolvimento",
    min: 40,
    max: 59,
    descricao: "A empresa está avançando, mas precisa de integração e consistência.",
    titulo: "Sua jornada de IA já começou. Agora é hora de evoluir.",
    texto:
      "Já existem iniciativas de IA, mas ainda há oportunidades importantes de estruturar a adoção, reduzir riscos e transformar experiências em resultados consistentes.",
  },
  {
    id: "estruturada",
    nome: "Estruturada",
    min: 60,
    max: 79,
    descricao: "IA já participa de processos e possui direcionamento.",
    titulo: "A IA já faz parte da operação. Agora é hora de escalar.",
    texto:
      "A IA participa de processos e tem direcionamento. O desafio é integrar, medir e expandir com governança o que já funciona.",
  },
  {
    id: "avancada",
    nome: "Avançada",
    min: 80,
    max: 100,
    descricao: "Adoção ampla, governada e orientada por resultados.",
    titulo: "A IA já está no centro da operação.",
    texto:
      "A adoção é ampla, governada e orientada por resultados. O foco passa a ser a inovação contínua e novas fontes de valor.",
  },
];

/** Textos do questionário (/ai-score/avaliacao). */
export const questionario = {
  kicker: "RESET AI Score",
  titulo: "Avaliação de maturidade em IA",
  etapas: {
    segmentacao: "Antes de começar",
    aprofundar: "Aprofundar áreas",
    area: (nome: string) => `Índice de aplicação · ${nome}`,
    fechamento: "Para fechar",
    pergunta: (n: number, total: number) => `Pergunta ${n} de ${total}`,
  },
  segmentacaoApoio: "Quatro perguntas rápidas para adaptar o AI Score. Elas não entram no cálculo.",
  areaApoio: "Escala padronizada: do não uso à IA integrada à operação.",
  naoSei: "Não sei responder",
  naoSeiApoio: "Não conta como zero: a pergunta fica fora do cálculo.",
  progresso: "Progresso do AI Score",
  continuar: "Continuar",
  voltar: "Voltar",
  concluir: "Ver meu resultado",
  erros: {
    escolha: "Escolha uma alternativa para continuar.",
    segmentacao: "Responda às quatro perguntas para continuar.",
    area: "Responda às quatro perguntas para continuar.",
    fechamento: "Escolha ao menos um desafio e o prazo para continuar.",
    limiteDesafios: "Escolha no máximo duas opções.",
  },
  retomar: {
    titulo: "Você tem um AI Score em andamento.",
    texto: "As respostas ficaram salvas neste navegador. Continue de onde parou ou comece de novo.",
    continuar: "Continuar de onde parei",
    recomecar: "Começar de novo",
  },
  privacidade: "As respostas ficam salvas só neste navegador até você concluir.",
};

/** Textos da tela de resultado (/ai-score/resultado). */
export const resultadoTextos = {
  kicker: "RESET AI Score · Resultado",
  titulo: "Seu RESET AI Score",
  ola: (nome: string) => `${nome.trim().split(/\s+/)[0]}, este é o seu resultado.`,
  de100: "/100",
  nivelDe: (n: number) => `Nível ${n} de 5`,
  escopo: (escopo: Escopo) =>
    escopo === "empresa"
      ? "Visão Empresa"
      : `Visão por Área · ${modulosArea.find((m) => m.area === escopo)?.nome ?? ""}`,
  parcial: {
    nome: "Resultado parcial",
    titulo: "Informações insuficientes para uma nota consolidada.",
    texto:
      "Para calcular o AI Score, responda a pelo menos 10 das 12 perguntas, com uma resposta válida em cada dimensão. As notas por dimensão abaixo usam apenas o que foi respondido.",
  },
  dimensoes: "Seu resultado por dimensão",
  semResposta: "Sem resposta",
  forte: "Ponto forte identificado",
  semForte: "Nenhuma dimensão se destaca ainda. É um bom momento para escolher por onde começar.",
  lacuna: "Principal oportunidade de evolução",
  passos: "Seus próximos passos recomendados",
  areas: {
    titulo: "Índice de Aplicação de IA na Área",
    nota: "Mede o uso de IA nas atividades da área. É um indicador separado e não altera o AI Score.",
  },
  aviso:
    "Autoavaliação indicativa, baseada na metodologia própria da Reset IA. Não é certificação nem comparação com o mercado.",
  compartilhar: "Copiar link do resultado",
  copiado: "Link copiado.",
  refazer: "Refazer o AI Score",
  carregando: "Carregando seu resultado…",
  vazio: {
    titulo: "Nenhum resultado neste link.",
    texto: "O link está incompleto. Responda ao AI Score para ver o seu resultado.",
    cta: "Descobrir meu AI Score",
  },
  conversa: {
    kicker: "Análise Estratégica RESET",
    titulo: ["Seu AI Score mostrou onde você está.", "*Vamos identificar como evoluir?*"],
    texto:
      "Solicite uma avaliação estratégica com nossos especialistas para explorar oportunidades de redução de custos, produtividade e geração de receita.",
    cta: "Conversar com um especialista da Reset",
  },
  /** Mensagem do WhatsApp com o resultado, para a conversa começar do ponto certo. */
  mensagem: (r: { indice: number | null; nivel: string | null; lacunas: string[] }) =>
    r.indice === null
      ? "Olá! Fiz o RESET AI Score (resultado parcial) e quero conversar com um especialista sobre a Análise Estratégica RESET."
      : `Olá! Fiz o RESET AI Score: ${r.indice}/100, nível ${r.nivel}. Principais oportunidades: ${r.lacunas.join(" e ")}. Quero conversar com um especialista sobre a Análise Estratégica RESET.`,
};

/**
 * Etapa 1 da captura (pedido do Diego, 28/10): nome e e-mail abrem o resultado. Fica no fim, depois que a pessoa
 * já respondeu, para não criar atrito no começo. O resultado abre na própria página; o relatório completo (etapa 2)
 * também vai para o e-mail informado.
 */
export const contato = {
  kicker: "Seu resultado está pronto",
  titulo: ["Seu AI Score", "*está pronto.*"],
  texto: "Informe seu nome e e-mail para ver a nota, o nível de maturidade e os próximos passos.",
  incluido: "O que você vai ver",
  itens: [
    "Nota de 0 a 100 e o nível de maturidade em IA.",
    "Resultado em cada uma das seis dimensões.",
    "Ponto forte, principal oportunidade e próximos passos.",
    "Alertas sobre riscos e lacunas que merecem atenção.",
  ],
  campos: {
    nome: "Nome",
    email: "E-mail",
    emailApoio: "De preferência o da empresa.",
    marketing: "Quero receber conteúdos da Reset IA sobre IA nos negócios.",
  },
  enviar: "Ver meu resultado",
  enviando: "Abrindo…",
  finalidade: "Usamos seu nome e e-mail para registrar o seu resultado e falar sobre ele. Sem spam.",
};

/** Etapa 2 (camada 2): empresa e WhatsApp opcional liberam o relatório completo e o PDF. */
export const formulario = {
  kicker: "Relatório completo",
  titulo: ["Quer o diagnóstico completo", "*da sua empresa?*"],
  texto:
    "A análise de cada resposta, dicas para evoluir, o plano de 90 dias, a simulação de evolução, os pontos cegos e as soluções indicadas, em PDF e no seu e-mail. Gratuito.",
  incluido: "O relatório completo traz",
  itens: [
    "Resumo executivo para compartilhar com a liderança.",
    "Cada resposta com o estágio de hoje e o próximo estágio.",
    "Prioridades por dimensão, pontos cegos e dicas para evoluir.",
    "Simulação: quanto o AI Score sobe ao fechar as lacunas.",
    "Plano de 90 dias e as soluções indicadas, com o porquê.",
  ],
  campos: {
    nome: "Nome",
    email: "E-mail corporativo",
    empresa: "Empresa",
    whatsapp: "WhatsApp (opcional)",
    whatsappApoio: "Com DDD. Usado só se você pedir contato.",
    contato: "Quero que um especialista da Reset fale comigo sobre o resultado.",
    marketing: "Quero receber conteúdos da Reset IA sobre IA nos negócios.",
    armadilha: "Deixe este campo em branco",
  },
  finalidade:
    "Usamos a empresa para completar o seu relatório, que também enviamos para o seu e-mail. Ligação ou WhatsApp de um especialista, só se você pedir.",
  privacidade: { label: "Política de privacidade", href: "/privacidade" },
  enviar: "Liberar relatório completo",
  enviando: "Liberando…",
  erros: {
    obrigatorio: "Preencha este campo.",
    email: "Informe um e-mail válido.",
    whatsapp: "Informe o WhatsApp com DDD.",
  },
  demo: "Modo demonstração: os dados não foram enviados.",
};

/** Régua de níveis e alertas da tela de resultado. */
export const regua = {
  titulo: "Sua posição na escala",
  faltam: (pontos: number, nivel: string) => `Faltam ${pontos} pontos para o nível ${nivel}.`,
  topo: "Você está no nível mais alto da escala.",
  voceAqui: "Você está aqui",
};

/** Padrões que o cruzamento das dimensões revela (regras em src/lib/ai-score/analisar.ts). */
export const alertas = {
  titulo: "O que o resultado revela",
  itens: {
    "adocao-sem-governanca": {
      titulo: "A adoção está à frente das regras",
      texto:
        "As equipes já usam IA, mas sem diretrizes claras de uso, dados e revisão. É o cenário em que informações sensíveis e decisões sem verificação viram risco.",
    },
    "estrategia-sem-execucao": {
      titulo: "Direção definida, pouca execução",
      texto:
        "A liderança já tem objetivos para IA, mas os processos ainda não mudaram. Sem levar a IA para o fluxo de trabalho, a estratégia não vira resultado.",
    },
    "uso-sem-direcao": {
      titulo: "O uso cresce sem direção",
      texto:
        "Há uso de IA no dia a dia, mas sem objetivos nem responsáveis. As iniciativas tendem a se espalhar sem prioridade e sem conexão com as metas.",
    },
    "ferramentas-sem-resultado": {
      titulo: "Ferramentas sem medição de retorno",
      texto:
        "Já existem dados e ferramentas, mas os resultados não são medidos. Fica difícil saber o que funciona e onde vale investir.",
    },
    "lideranca-a-frente": {
      titulo: "A liderança está à frente das equipes",
      texto:
        "A direção existe, mas as pessoas ainda não foram preparadas para usar IA na rotina. A capacitação é o que transforma a intenção em prática.",
    },
    "processos-sem-dados": {
      titulo: "Processos sem base de dados",
      texto:
        "A IA começa a entrar nos processos, mas os dados estão dispersos. Sem dados organizados, as aplicações ficam limitadas e pouco confiáveis.",
    },
    "pontos-cegos": {
      titulo: "Pouca visibilidade sobre o próprio cenário",
      texto:
        "Várias respostas ficaram como Não sei. Quando a liderança não enxerga como a IA está sendo usada, controlar riscos e medir ganhos fica difícil.",
    },
    desequilibrio: {
      titulo: "Maturidade desigual entre as dimensões",
      texto: "Algumas dimensões avançaram muito mais que outras. Na prática, a evolução fica presa ao elo mais fraco.",
    },
    inicio: {
      titulo: "A jornada está por começar",
      texto:
        "Ainda não há uma base estruturada para IA. A vantagem: dá para começar do jeito certo, com objetivos, pessoas preparadas e regras claras desde o início.",
    },
  },
};

/** Relatório completo (liberado depois da etapa 2) e a versão impressa. */
export const relatorio = {
  titulo: "Seu relatório completo",
  resumo: {
    titulo: "Resumo executivo",
    texto: (r: {
      quem: string;
      indice: number | null;
      nivel: string | null;
      forte: string | null;
      lacuna: string | null;
      alerta: string | null;
    }) =>
      [
        r.indice === null
          ? `${r.quem} tem um resultado parcial: faltaram respostas para uma nota consolidada.`
          : `${r.quem} está no nível ${r.nivel}, com AI Score ${r.indice} de 100.`,
        r.forte ? `A maior força está em ${r.forte}.` : "Nenhuma dimensão se destaca ainda.",
        r.lacuna ? `A principal lacuna está em ${r.lacuna}.` : "",
        r.alerta ? `Ponto de atenção: ${r.alerta.charAt(0).toLowerCase()}${r.alerta.slice(1)}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    suaEmpresa: "Sua empresa",
    suaArea: "Sua área",
  },
  simulacao: {
    titulo: "Simulação de evolução",
    texto: (alvo: number, de: number, para: number, nivel: string) =>
      `Se todas as dimensões abaixo de ${alvo} chegarem a ${alvo}, o AI Score vai de ${de} para ${para} (${nivel}).`,
    hoje: "Hoje",
    depois: "Com as lacunas fechadas",
    sobem: (alvo: number) => `Dimensões que sobem até ${alvo}:`,
  },
  prioridades: {
    titulo: "Prioridades por dimensão",
    nota: "Da menor para a maior nota. Os desafios que você apontou aparecem marcados.",
    rotulos: { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" },
    desafio: "Você apontou como desafio",
  },
  leitura: "Análise por dimensão",
  hoje: "Hoje",
  proximo: "Próximo estágio",
  topo: "Estágio mais alto da escala.",
  faixas: { baixa: "A estruturar", media: "Em evolução", alta: "Consolidada" },
  pontosCegos: {
    titulo: "Pontos cegos",
    nota: "Perguntas respondidas com Não sei. Elas ficam fora da nota, mas mostram onde falta visibilidade.",
    nenhum: "Nenhum: todas as perguntas foram respondidas.",
  },
  plano: {
    titulo: "Plano de 90 dias",
    nota: "Sequência sugerida a partir das prioridades e dos desafios informados.",
    fases: [
      { periodo: "Dias 1 a 30", nome: "Organizar a base" },
      { periodo: "Dias 31 a 60", nome: "Executar" },
      { periodo: "Dias 61 a 90", nome: "Medir e escalar" },
    ],
    reavaliar: "Refazer o AI Score para medir a evolução.",
  },
  dicas: {
    titulo: "Dicas para evoluir",
    nota: "Para cada dimensão de nota baixa, ações concretas para chegar ao próximo estágio, a partir das suas respostas.",
    carregando: "Os agentes de IA estão escrevendo e revisando as suas dicas…",
    nenhuma: "Nenhuma dimensão ficou com nota baixa. O plano de 90 dias mostra como seguir evoluindo.",
    fonte: {
      ia: "Escritas por um agente de IA a partir das suas respostas e conferidas por um agente revisor.",
      biblioteca:
        "Da biblioteca de dicas da Reset, escrita com IA e revisada por um agente revisor, escolhidas pelas suas respostas.",
      misto:
        "Escritas por um agente de IA e conferidas por um agente revisor; onde a revisão descartou dicas, entram as da biblioteca da Reset.",
    },
  },
  enviado: (email: string) => `Uma cópia deste relatório foi enviada para ${email}.`,
  assinatura: {
    titulo: "Relatório gerado por um squad multiagente de IA",
    paragrafos: [
      "Este relatório foi produzido por um squad de agentes de inteligência artificial da Reset IA, cada um com uma função: um motor de regras calcula a nota, o nível, as prioridades e o plano a partir das suas respostas; um agente escreve as dicas de evolução; e um agente revisor confere cada dica contra as suas respostas e descarta o que não se apoia nelas.",
      "A nota não é gerada por IA: as mesmas respostas dão sempre o mesmo resultado, pela metodologia própria da Reset.",
      "Por ser uma autoavaliação, e por envolver IA, o resultado deve ser conferido: valide as conclusões com a sua equipe antes de decidir. Ele não substitui a análise de um especialista nem é certificação.",
    ],
  },
  solucoes: "Onde a Reset entra",
  solucoesNota: "Indicação baseada nas dimensões com menor nota e nos desafios informados.",
  porque: {
    dimensao: (nome: string, nota: string) => `${nome} está em ${nota}.`,
    desafio: (label: string) => `Você apontou: ${label.charAt(0).toLowerCase()}${label.slice(1)}`,
    inicio: "Indicada para quem está começando a jornada de IA.",
  },
  areas: "Aplicação de IA por atividade",
  baixar: "Baixar relatório (salvar como PDF)",
  baixarApoio: "Abre a impressão do navegador: escolha Salvar como PDF. No celular, use Compartilhar.",
  impresso: {
    titulo: "Relatório RESET AI Score",
    para: (nome: string, empresa: string, data?: string) =>
      data ? `Preparado para ${nome}, ${empresa}, em ${data}.` : `Preparado para ${nome}, ${empresa}.`,
    rodape: "resetia.com.br · Autoavaliação indicativa, baseada na metodologia própria da Reset IA.",
  },
};

/** Página de exemplo (/ai-score/exemplo): o relatório completo com respostas hipotéticas. */
export const exemplo = {
  aviso: "Exemplo ilustrativo com respostas hipotéticas; não representa uma empresa real.",
  cta: "Fazer o meu AI Score",
};
