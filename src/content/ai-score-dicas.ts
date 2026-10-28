/**
 * Dicas de evolução do RESET AI Score.
 *
 * `biblioteca`: uma dica por pergunta para cada estágio atual (a alternativa escolhida, de 0 a 3) e para
 * "Não sei responder". Cada dica é o passo concreto para chegar ao estágio seguinte da mesma pergunta.
 * Escritas com IA e revisadas por um agente revisor em 28/10 (49 de 60 aprovadas de primeira; 11 corrigidas, a maioria
 * para servir também a quem avalia só a própria área): sem números, marcas, promessas ou dados inventados.
 * Servem de reserva quando a geração por IA não está disponível e de referência de tom para o agente escritor.
 * As instruções dos agentes ficam em `ai-score-instrucoes.ts`, fora do JavaScript do navegador.
 */

type Dica = { naoSei: string; estagios: readonly [string, string, string, string] };

export type Biblioteca = Record<string, Dica>;

export const biblioteca: Biblioteca = {
  p1: {
    naoSei:
      "Pergunte à liderança se existem objetivos de IA definidos e onde estão registrados. Se ninguém souber responder, esse já é o primeiro ponto a resolver.",
    estagios: [
      "Reserve uma reunião da liderança só para IA e saia dela com uma lista curta de problemas do negócio em que a IA poderia ajudar.",
      "Escolha de dois a três casos de uso prioritários, ligados a metas que a empresa já acompanha, e registre o porquê de cada escolha.",
      "Defina objetivos claros para IA e priorize as iniciativas pontuais que servem a eles: para cada uma, registre o problema que resolve, quem responde por ela e como o resultado será avaliado.",
      "Crie uma rotina de acompanhamento dos objetivos de IA com a liderança, revendo o que avançou e o que precisa ser repriorizado.",
    ],
  },
  p2: {
    naoSei:
      "Descubra quem, na prática, responde pelas iniciativas de IA hoje. Se ninguém souber dizer, definir esse responsável é o primeiro passo.",
    estagios: [
      "Nomeie uma pessoa para coordenar o tema IA, mesmo em tempo parcial, com autonomia para reunir as iniciativas que já existem.",
      "Mapeie quem já experimenta IA por conta própria e reúna essas pessoas em um grupo de referência, com um coordenador definido.",
      "Formalize a liderança de IA: defina quem decide prioridades, quem aprova novas iniciativas e como as equipes levam demandas até ela.",
      "Amplie a liderança formal para uma estrutura que coordene investimentos, prioridades e evolução, com representantes das equipes que mais usam IA.",
    ],
  },
  p3: {
    naoSei:
      "Faça um levantamento rápido com as equipes sobre quem usa IA, para quê e com que frequência. Sem esse retrato, é difícil decidir o próximo passo.",
    estagios: [
      "Escolha um pequeno grupo piloto e uma atividade do dia a dia em que a IA possa ajudar, e acompanhe o uso por algumas semanas antes de ampliar.",
      "Peça a quem já usa IA para mostrar exemplos práticos às equipes e transforme esses exemplos em orientações simples de uso.",
      "Leve as práticas dos grupos que mais usam IA para o restante da equipe, com exemplos aplicados às atividades de cada função.",
      "Incorpore a IA aos principais fluxos de trabalho, definindo em que etapas ela entra e como o resultado é conferido.",
    ],
  },
  p4: {
    naoSei: "Verifique com o RH ou com os gestores quais capacitações em IA já aconteceram e quem participou delas.",
    estagios: [
      "Organize uma primeira capacitação prática sobre IA para gestores e equipes, com exemplos ligados às atividades reais do dia a dia.",
      "Dê orientação formal a quem já aprende sozinho: um material de referência, boas práticas e um canal para tirar dúvidas.",
      "Transforme palestras e workshops pontuais em um programa contínuo, com trilhas por função e prática nas atividades do dia a dia.",
      "Forme multiplicadores internos que apoiem as equipes no dia a dia e acompanhe a adoção depois de cada etapa de capacitação.",
    ],
  },
  p5: {
    naoSei:
      "Pergunte às equipes quais tarefas repetitivas consomem mais tempo e se algum processo já foi mapeado ou redesenhado com IA. Isso mostra o estágio atual.",
    estagios: [
      "Liste as atividades mais repetitivas de uma equipe, quem as executa e quanto esforço consomem, para enxergar onde a IA pode ajudar.",
      "Mapeie de ponta a ponta um processo repetitivo que você já conhece, registrando etapas, responsáveis e gargalos.",
      "Escolha um processo já mapeado e redesenhe as etapas em que a IA pode atuar, definindo quem confere o resultado.",
      "Estenda o redesenho a outros processos e crie uma rotina de revisão para aprimorar os fluxos que já usam IA.",
    ],
  },
  p6: {
    naoSei:
      "Peça às equipes exemplos concretos de como a IA entra nas tarefas hoje. Isso mostra se o uso é individual ou se já faz parte dos fluxos.",
    estagios: [
      "Comece por um uso simples e de baixo risco, como rascunhos de textos internos ou resumos, com a revisão de uma pessoa.",
      "Transforme os usos individuais que funcionam em modelos e instruções compartilhados, para que a equipe repita o que dá certo.",
      "Escolha um fluxo recorrente em que a IA possa executar uma etapa inteira e defina o responsável e o controle de qualidade.",
      "Avalie quais fluxos recorrentes podem ganhar agentes ou automações integrados aos sistemas, com monitoramento contínuo.",
    ],
  },
  p7: {
    naoSei:
      "Converse com quem cuida dos sistemas para entender onde ficam os dados de clientes e de operação e como eles são acessados.",
    estagios: [
      "Identifique onde estão os dados das atividades mais importantes e quem tem acesso a eles. Esse inventário é a base para qualquer uso de IA.",
      "Escolha os dados de uma aplicação prioritária e organize-os em um só lugar, com um responsável e regras de atualização.",
      "Defina critérios mínimos de qualidade e de acesso para os dados das aplicações prioritárias de IA.",
      "Integre as fontes de dados das aplicações prioritárias, com controles de qualidade e de acesso adequados ao uso com IA.",
    ],
  },
  p8: {
    naoSei:
      "Peça à área financeira ou de tecnologia a lista de ferramentas de IA contratadas. Sem esse inventário, é comum pagar por ferramentas repetidas.",
    estagios: [
      "Escolha uma ferramenta de IA de uso geral, aprovada pela empresa, para começar com segurança em vez de cada pessoa usar a sua.",
      "Levante quais ferramentas de IA as pessoas usam por conta própria e defina uma lista de ferramentas aprovadas.",
      "Revise as ferramentas contratadas para eliminar sobreposições e integrar as que ficam aos sistemas que a equipe já usa.",
      "Coordene as ferramentas de IA com acompanhamento de uso e de custos, evitando novas contratações sem avaliação.",
    ],
  },
  p9: {
    naoSei:
      "Verifique com o jurídico ou com a segurança da informação se existem regras para o uso de IA. Se não existirem, comece por elas.",
    estagios: [
      "Publique orientações básicas de uso de IA: que dados não podem ir para ferramentas externas e quando a revisão humana é obrigatória.",
      "Transforme as orientações informais em um documento curto, aprovado pela liderança e comunicado a todas as equipes.",
      "Evolua as regras básicas para uma política formal, com responsáveis definidos, considerando a LGPD e a segurança da informação.",
      "Aplique a política com mecanismos de controle e revise-a periodicamente, à medida que surgem novos usos de IA.",
    ],
  },
  p10: {
    naoSei:
      "Pergunte às equipes como conferem o que a IA produz. Se cada pessoa confere de um jeito, esse é um risco a tratar.",
    estagios: [
      "Defina que todo conteúdo ou decisão apoiada por IA passe pela revisão de uma pessoa antes de chegar a clientes.",
      "Combine critérios simples de verificação, como checar fatos, números e dados de clientes, para que todos revisem do mesmo jeito.",
      "Transforme as revisões ocasionais em critérios definidos de revisão humana, acesso e validação, proporcionais ao risco de cada uso.",
      "Registre e monitore os usos de maior risco, com testes antes de ampliar a aplicação da IA.",
    ],
  },
  p11: {
    naoSei:
      "Pergunte a quem lidera as iniciativas de IA como os resultados são acompanhados. Se não houver indicador, comece definindo um.",
    estagios: [
      "Escolha um indicador simples para uma iniciativa de IA, como o tempo gasto em uma tarefa, e registre como ele está hoje.",
      "Troque percepções informais por medição: nas iniciativas de IA mais usadas, acompanhe a utilização e o tempo gasto nas tarefas em que a IA entra.",
      "Defina indicadores para as iniciativas de IA e compare os resultados com a situação anterior, de forma periódica.",
      "Acompanhe de forma sistemática eficiência, qualidade e indicadores de negócio, para decidir onde ampliar o uso da IA.",
    ],
  },
  p12: {
    naoSei:
      "Reúna as equipes que usam IA para listar os resultados obtidos até aqui. Ganhos que não são registrados costumam se perder.",
    estagios: [
      "Escolha uma aplicação de IA pequena e de baixo risco, com começo, meio e fim, para gerar um primeiro resultado observável.",
      "Selecione o experimento mais promissor e defina como medir o ganho, para transformar a experiência em evidência.",
      "Documente os casos promissores com o antes e o depois, para que a liderança decida o que ampliar.",
      "Replique as aplicações com resultados já medidos em outras equipes ou processos parecidos, mantendo a mesma forma de medir.",
    ],
  },
};
