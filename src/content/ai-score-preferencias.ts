import { textosDePreferencias } from "./ai-score-consentimentos";

/** Página de preferências de contato do RESET AI Score. Texto novo é texto a revisar com o Diego. */
export const preferencias = {
  kicker: "RESET AI Score",
  titulo: ["Suas preferências", "*de contato.*"],
  texto:
    "Aqui você escolhe como a Reset IA pode falar com você sobre o seu resultado. Cada escolha é registrada com a data e o texto que você viu, e você pode mudar quando quiser. Nada é enviado sem a sua escolha.",
  escolhas: [
    { finalidade: "relatorio-email", canal: "email", rotulo: textosDePreferencias.relatorioEmail },
    { finalidade: "conteudo-email", canal: "email", rotulo: textosDePreferencias.conteudoEmail },
    { finalidade: "contato-analise", canal: "email", rotulo: textosDePreferencias.contatoEmail },
    { finalidade: "contato-analise", canal: "whatsapp", rotulo: textosDePreferencias.contatoWhatsapp },
    { finalidade: "contato-analise", canal: "ligacao", rotulo: textosDePreferencias.contatoLigacao },
  ] as const,
  semNumero: "Você não informou um WhatsApp. Para escolher este canal, peça um novo relatório com o número.",
  salvar: "Salvar preferências",
  salvando: "Salvando…",
  semMudanca: "Nenhuma mudança para salvar.",
  salvo: "Preferências salvas. Elas valem a partir de agora.",
  carregando: "Carregando as suas preferências…",
  falhou: "Não foi possível falar com o servidor agora. Tente de novo em instantes.",
  salvarFalhou: "Não foi possível salvar. Suas escolhas anteriores continuam valendo.",
  semNumeroAoSalvar: "Para escolher WhatsApp ou ligação é preciso ter um número informado.",
  tentar: "Tentar de novo",
  link: {
    incompleto: {
      titulo: "Este link está incompleto.",
      texto: "Abra de novo o link do e-mail que você recebeu, inteiro.",
    },
    invalido: {
      titulo: "Este link não vale mais.",
      texto:
        "Ele pode ter expirado ou ter sido cancelado. Responda ao e-mail da Reset IA ou fale com a gente pelo WhatsApp para ajustar suas preferências.",
    },
  },
  privacidade: { texto: "Como tratamos seus dados:", label: "Política de privacidade", href: "/privacidade" },
};
