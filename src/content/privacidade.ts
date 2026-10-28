import { site } from "./site";

/**
 * Política de privacidade do site: institucional, sem cookies próprios, com uma coleta de dados no RESET AI Score
 * (respostas anônimas e, para liberar o relatório, nome, e-mail, empresa e WhatsApp opcional), o relatório por
 * e-mail, as dicas por IA (sem dados de identificação) e o histórico do atendimento no admin.
 * Bases legais e textos do AI Score escritos em 28/10: revisar com o Diego (e o jurídico, se houver).
 */
export const privacidade = {
  titulo: "Política de privacidade",
  atualizadaEm: "28 de outubro de 2026",
  intro:
    "Esta política explica, em linguagem simples, quais dados a Reset IA trata quando você visita este site ou entra em contato conosco, por que tratamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).",
  secoes: [
    {
      titulo: "Quem somos",
      paragrafos: [
        `A Reset IA é uma consultoria de inteligência artificial para negócios, com atuação em ${site.cidades}. Para qualquer assunto sobre dados pessoais, fale com a gente em ${site.email}.`,
      ],
    },
    {
      titulo: "O que este site coleta",
      paragrafos: [
        "O site é informativo e não grava cookies. A única coleta de dados pessoais acontece no RESET AI Score, descrita na seção seguinte.",
        "Podemos usar uma ferramenta de métricas de audiência para entender quantas pessoas visitam cada página e de onde vêm. Esses dados são agregados e não identificam você. Quando a ferramenta usada depende de cookies, isso será informado nesta política.",
        "Os servidores que hospedam o site registram, como qualquer servidor, dados técnicos de acesso (endereço IP, navegador, data e página acessada) por tempo limitado, para segurança e estabilidade.",
      ],
    },
    {
      titulo: "RESET AI Score",
      paragrafos: [
        "Quando você conclui o questionário, gravamos as respostas sem identificação: papel, tamanho e segmento da empresa, as respostas de maturidade, os desafios e o prazo informados. Elas servem para calcular o seu resultado e para análises agregadas e anônimas sobre maturidade em IA.",
        "Enquanto você responde, as respostas ficam só no armazenamento local do seu navegador (não é cookie), para você poder continuar de onde parou. Elas saem dali quando você conclui ou começa de novo.",
        "Para ver o resultado, pedimos nome e e-mail; para o relatório completo, o nome da empresa e, se você quiser, WhatsApp. Usamos esses dados para registrar o seu resultado, entender o momento da sua empresa e, se você pedir, para que um especialista da Reset fale com você. A base legal é o nosso legítimo interesse em conhecer quem se interessa pelas soluções da Reset e, quando você pede contato, a execução de medidas pré-contratuais a seu pedido.",
        "Conteúdos da Reset IA sobre IA nos negócios só são enviados se você marcar essa opção, que vem desmarcada. Nesse caso a base legal é o consentimento, que você pode revogar a qualquer momento.",
        "Quando você pede o relatório completo, enviamos uma cópia para o e-mail informado, com um link que abre o relatório em qualquer aparelho. Registramos a data, o assunto e a situação de cada e-mail enviado. Depois disso, a equipe da Reset pode enviar a esse endereço um e-mail sobre os serviços da Reset ligado ao seu resultado; se não quiser receber, basta responder pedindo.",
        "As dicas de evolução do relatório são escritas por agentes de inteligência artificial (modelos Claude, da Anthropic) e conferidas por um agente revisor. A eles vão apenas as respostas de múltipla escolha, as notas, o porte, o segmento, o prazo e os desafios marcados: nome, e-mail, empresa e WhatsApp nunca são enviados ao provedor de IA. A nota do AI Score não é gerada por IA; é calculada por regras fixas.",
        "A equipe da Reset registra também o histórico do atendimento de cada contato (etapa, responsável, anotações e conversas realizadas), para dar continuidade ao que foi combinado.",
        "Os dados ficam no Supabase, provedor de banco de dados contratado pela Reset, em servidores em São Paulo, com acesso restrito à equipe da Reset.",
      ],
    },
    {
      titulo: "Quando você fala com a gente",
      paragrafos: [
        "Os botões do site abrem o WhatsApp ou o e-mail. O que você nos envia por esses canais (nome, empresa, telefone, e-mail e o conteúdo da conversa) é usado só para responder, entender a sua necessidade e preparar uma proposta. A base legal é a execução de medidas pré-contratuais a seu pedido e o nosso legítimo interesse em atender quem nos procura.",
        "O WhatsApp é um serviço da Meta e segue a política de privacidade da própria plataforma.",
      ],
    },
    {
      titulo: "Com quem compartilhamos",
      paragrafos: [
        "Não vendemos nem cedemos dados pessoais. Compartilhamos apenas com os provedores necessários para operar o site e os canais de contato (hospedagem, banco de dados, envio de e-mail, mensageria e métricas de audiência), que tratam os dados conforme nossas instruções e as leis aplicáveis.",
        "O provedor de inteligência artificial que escreve as dicas do RESET AI Score recebe só respostas sem identificação, como descrito acima. Alguns desses provedores processam dados fora do Brasil; nesses casos, a transferência segue as salvaguardas previstas na LGPD.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Conversas, propostas e os dados de contato do RESET AI Score ficam guardados enquanto durar a relação comercial ou enquanto houver interesse legítimo em manter o histórico, e depois são apagados ou anonimizados. Registros técnicos de acesso são mantidos por prazo curto.",
      ],
    },
    {
      titulo: "Seus direitos",
      paragrafos: [
        "Você pode pedir, a qualquer momento: confirmação de que tratamos seus dados, acesso a eles, correção, anonimização ou exclusão, portabilidade, informação sobre com quem compartilhamos e revogação de consentimento, quando ele for a base do tratamento.",
        `Para exercer qualquer direito, escreva para ${site.email}. Respondemos no prazo previsto em lei.`,
      ],
    },
    {
      titulo: "Spotlite e Fluxa BPM",
      paragrafos: [
        "A Spotlite e a Fluxa BPM são produtos da Reset IA com cadastro próprio e tratam dados de forma específica. Cada um tem a sua política de privacidade, publicada no próprio site do produto.",
      ],
      links: [
        { label: "Privacidade da Spotlite", href: site.ferramentas.spotlitePrivacidade },
        { label: "Privacidade da Fluxa BPM", href: site.ferramentas.fluxaPrivacidade },
      ],
    },
    {
      titulo: "Mudanças nesta política",
      paragrafos: [
        "Se mudarmos a forma como tratamos dados, atualizamos esta página e a data no topo. O uso continuado do site depois da mudança indica que você leu a nova versão.",
      ],
    },
  ],
};
