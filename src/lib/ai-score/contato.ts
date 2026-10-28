/** Validação e normalização dos dados de contato do formulário do relatório. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Provedores gratuitos: o e-mail é aceito, mas o lead fica sinalizado como e-mail pessoal. */
const PESSOAIS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "outlook.com.br",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.br",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
  "globomail.com",
  "r7.com",
  "zipmail.com.br",
  "protonmail.com",
  "proton.me",
  "gmx.com",
]);

export const emailValido = (email: string) => EMAIL.test(email.trim());

export const emailPessoal = (email: string) => PESSOAIS.has(email.trim().split("@").pop()?.toLowerCase() ?? "");

/**
 * Só dígitos, com o 55 do Brasil: "(11) 91234-5678" → "5511912345678".
 * Aceita 10 ou 11 dígitos (DDD + número) ou 12 e 13 começando por 55. Fora disso, `null`.
 */
export function normalizarWhatsapp(texto: string): string | null {
  const d = texto.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null;
}
