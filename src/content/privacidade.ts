import { site } from "./site";

/** Política de privacidade geral de um site institucional sem cadastro, formulário ou cookies próprios. */
export const privacidade = {
  titulo: "Política de privacidade",
  atualizadaEm: "19 de outubro de 2026",
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
        "O site é informativo. Não há cadastro, login, formulário nem área restrita, e o site em si não grava cookies.",
        "Podemos usar uma ferramenta de métricas de audiência para entender quantas pessoas visitam cada página e de onde vêm. Esses dados são agregados e não identificam você. Quando a ferramenta usada depende de cookies, isso será informado nesta política.",
        "Os servidores que hospedam o site registram, como qualquer servidor, dados técnicos de acesso (endereço IP, navegador, data e página acessada) por tempo limitado, para segurança e estabilidade.",
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
        "Não vendemos nem cedemos dados pessoais. Compartilhamos apenas com os provedores necessários para operar o site e os canais de contato (hospedagem, e-mail, mensageria e métricas de audiência), que tratam os dados conforme nossas instruções e as leis aplicáveis.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Conversas e propostas ficam guardadas enquanto durar a relação comercial ou enquanto houver interesse legítimo em manter o histórico, e depois são apagadas ou anonimizadas. Registros técnicos de acesso são mantidos por prazo curto.",
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
