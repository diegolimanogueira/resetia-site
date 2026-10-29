/**
 * Tema do site. "claro" (neutro, com o fecho em carvão) desde 29/10; "escuro" é o reset360 de antes. Vai como
 * data-tema no <html> e troca os tokens em globals.css, a logo, o ícone do hero e o tom do CTA final.
 */
export const tema: "claro" | "escuro" = "claro";

/** Sufixo dos arquivos da marca em public/brand: "-light" é a versão para fundo claro. */
export const varianteMarca = tema === "claro" ? "light" : "dark";

/** Cor de fundo da página, para o manifesto (barra do navegador e splash do app instalado). */
export const corFundo = tema === "claro" ? "#F6F7F5" : "#0B0F0E";
