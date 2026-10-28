/**
 * CSV para Excel em português: separador ";", BOM UTF-8 e aspas quando preciso.
 * Valores que começam com = + - @ ganham um apóstrofo (evita fórmula injetada por quem preencheu o formulário).
 */
export type Celula = string | number | boolean | null | undefined;

export function celula(v: Celula): string {
  if (v === null || v === undefined) return "";
  let t = typeof v === "boolean" ? (v ? "sim" : "não") : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function paraCsv(cabecalho: string[], linhas: Celula[][]): string {
  return `﻿${[cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n")}\r\n`;
}
