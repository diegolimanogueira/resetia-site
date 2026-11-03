import { site } from "./site";

/**
 * Política de privacidade do site: institucional, sem cookies próprios, com uma coleta de dados no RESET AI Score
 * (respostas sem identificação; nome, e-mail, empresa e WhatsApp opcional para o relatório completo; aprofundamento
 * opcional), o relatório por e-mail com links de acesso, as dicas por IA (só fatos estruturados), as escolhas de
 * contato por finalidade e canal e o histórico do atendimento no admin.
 * Reescrita em 01/11/2026 para refletir o que o sistema faz hoje (consentimento por canal, tokens, aprofundamento).
 * Bases legais e prazos: revisar com o Diego (e o jurídico, se houver). Não há prazo automático de apagamento; a
 * política diz isso em vez de prometer um (docs/provas.md lista o que o proprietário precisa decidir).
 */
export const privacidade = {
  titulo: "Política de privacidade",
  atualizadaEm: "1 de novembro de 2026",
  intro:
    "Esta política explica, em linguagem simples, quais dados a Reset IA trata quando você visita este site, faz o RESET AI Score ou entra em contato conosco, por que tratamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).",
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
        "O site é informativo e não grava cookies. A coleta de dados pessoais acontece no RESET AI Score, descrita nas seções seguintes. O que o site guarda no seu navegador está na seção sobre o navegador e os links.",
        "Podemos usar uma ferramenta de métricas de audiência para entender quantas pessoas visitam cada página e de onde vêm. Os eventos que ela recebe não levam nome, e-mail, telefone, texto digitado, respostas nem códigos de acesso, e a parte do endereço depois do # não é enviada a ela. Quando a ferramenta usada depender de cookies, isso será informado nesta política antes de ela ser ligada.",
        "Os servidores que hospedam o site registram, como qualquer servidor, dados técnicos de acesso (endereço IP, navegador, data e página acessada) por tempo limitado, para segurança e estabilidade.",
      ],
    },
    {
      titulo: "RESET AI Score: respostas e resultado",
      paragrafos: [
        "Quando você conclui o questionário, gravamos as respostas sem identificação: papel, tamanho e segmento da empresa, as respostas de maturidade, os desafios e o prazo informados. Elas servem para calcular o seu resultado e para análises agregadas e anônimas sobre maturidade em IA. A nota é calculada por regras fixas, nunca por inteligência artificial.",
        "Guardamos também a origem da visita, para saber de onde as pessoas chegam: a página de entrada, o endereço de onde você veio e os parâmetros de campanha do link (UTM), com tamanho limitado.",
      ],
    },
    {
      titulo: "RESET AI Score: nome, e-mail, empresa e WhatsApp",
      paragrafos: [
        "Para ver o resultado, pedimos nome e e-mail; para o relatório completo, o nome da empresa e, se você quiser, o WhatsApp. Usamos esses dados para registrar o seu resultado, entender o momento da sua empresa e enviar o relatório para o e-mail informado. A base legal é o atendimento ao seu pedido e o nosso legítimo interesse em conhecer quem se interessa pelas soluções da Reset.",
        "O contato de um especialista e os conteúdos da Reset IA são escolhas suas, em caixas que vêm desmarcadas. Para cada escolha registramos o canal (e-mail, WhatsApp ou ligação), a data e a versão do texto que você viu; a base legal é o seu consentimento, que você pode mudar ou revogar a qualquer momento. A equipe só envia e-mail comercial, liga ou chama no WhatsApp para quem fez essa escolha, e só usa o número de telefone de quem o informou e pediu esse canal.",
        "Quem usou o RESET AI Score antes de novembro de 2026 teve as escolhas registradas a partir do que marcou na época, sem nada além disso.",
      ],
    },
    {
      titulo: "RESET AI Score: aprofundamento opcional",
      paragrafos: [
        "Depois do resultado, você pode aprofundar uma dor da sua operação. É opcional e você pode pular, voltar e editar. Pedimos, por exemplo, a área e a rotina, quantas vezes acontece, quanto tempo leva, as consequências, as ferramentas e os dados usados, o indicador que acompanha e quem decide. Algumas perguntas têm campo de texto livre.",
        "Usamos essas respostas para estimar o esforço envolvido, mostrar isso no seu relatório e, se você pedir contato, para a equipe da Reset chegar à conversa já sabendo o que você descreveu. A equipe da Reset consegue ver essas respostas no painel interno. Não escreva dados pessoais de outras pessoas nos campos livres.",
      ],
    },
    {
      titulo: "RESET AI Score: o que fica no seu navegador e nos links",
      paragrafos: [
        "Enquanto você responde, as respostas ficam no armazenamento local do seu navegador (não é cookie), para você poder continuar de onde parou. Depois do resultado, o navegador guarda também o acesso ao seu relatório, incluindo uma chave que prova que este aparelho pode completar o seu registro, e o que ainda não foi confirmado pelo servidor, como um contato que não chegou por falta de conexão. As respostas do aprofundamento ficam salvas aqui também, e o rascunho de um texto que você está escrevendo e a origem da visita ficam só enquanto a aba está aberta.",
        "O link do resultado leva as suas respostas depois do # do endereço, e o link do relatório enviado por e-mail leva também um código de acesso. Essa parte do endereço o navegador não envia a nenhum servidor. Quem tiver o link consegue abrir o relatório, então não o encaminhe a quem não deve vê-lo. Tiramos o código da barra de endereço depois de abrir o relatório.",
      ],
    },
    {
      titulo: "RESET AI Score: relatório por e-mail",
      paragrafos: [
        "Quando você pede o relatório completo, enviamos uma cópia para o e-mail informado, com um link que abre o relatório em qualquer aparelho e outro para corrigir as suas escolhas de contato. Registramos a data, o assunto e a situação de cada e-mail: aceito pelo provedor de e-mail, nova tentativa ou falhou. Aceito significa que o provedor recebeu a mensagem, não que ela chegou à sua caixa de entrada.",
        "Os links de acesso ao relatório deixam de valer em 180 dias e os de preferências, em 365 dias. Um relatório novo gera um link novo, e a equipe consegue revogar um link a seu pedido.",
      ],
    },
    {
      titulo: "RESET AI Score: dicas por inteligência artificial",
      paragrafos: [
        "As dicas de evolução do relatório são escritas por agentes de inteligência artificial (modelos Claude, da Anthropic) e conferidas por um agente revisor. A eles vão apenas fatos estruturados: as respostas de múltipla escolha, as notas, o porte, o segmento, o prazo e os desafios marcados. Nome, e-mail, empresa, WhatsApp e qualquer texto que você digitou, incluindo o aprofundamento, nunca são enviados ao provedor de IA.",
      ],
    },
    {
      titulo: "O atendimento e o painel da equipe",
      paragrafos: [
        "A equipe da Reset registra o histórico do atendimento de cada contato (etapa, responsável, anotações, conversas realizadas e os marcos da negociação, como reunião e proposta), para dar continuidade ao que foi combinado. Esse registro é interno e só a equipe da Reset tem acesso.",
        "Você pode corrigir ou retirar as suas escolhas de contato pelo link de preferências do e-mail do relatório, ou pedindo por e-mail. Quando você pede para parar, a equipe registra o pedido e deixa de usar aquele canal.",
        "Os dados do RESET AI Score ficam no Supabase, provedor de banco de dados contratado pela Reset, em servidores em São Paulo, com acesso restrito à equipe da Reset. O endereço IP não é gravado junto das respostas: ele entra apenas em forma de resumo (hash) num contador que limita o uso abusivo do serviço.",
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
        "Não vendemos nem cedemos dados pessoais. Compartilhamos apenas com os provedores necessários para operar o site e os canais de contato: hospedagem do site, o Supabase (banco de dados), o Resend (envio de e-mail), a Anthropic (dicas do RESET AI Score), o WhatsApp (mensageria) e, se ligada, uma ferramenta de métricas de audiência. Eles tratam os dados conforme nossas instruções e as leis aplicáveis.",
        "O provedor de inteligência artificial recebe só fatos estruturados, sem identificação, como descrito acima. Alguns desses provedores processam dados fora do Brasil; nesses casos, a transferência segue as salvaguardas previstas na LGPD.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Conversas, propostas e os dados do RESET AI Score ficam guardados enquanto durar a relação comercial ou enquanto houver interesse legítimo em manter o histórico. Hoje não há um prazo automático de apagamento: apagamos ou anonimizamos os seus dados quando você pede, e quando deixamos de ter motivo para guardá-los. Registros técnicos de acesso são mantidos por prazo curto.",
        "O seu histórico de escolhas de contato (o que você marcou, desmarcou ou revogou, com a data) é mantido sem edição, porque é ele que prova o que você pediu. Se você pedir a exclusão dos seus dados, ele sai junto com o seu registro.",
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
