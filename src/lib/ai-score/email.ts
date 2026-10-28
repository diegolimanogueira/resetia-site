import { emailRelatorio as er, emailReset } from "@/content/ai-score-email";
import { alertas, dimensoes, niveis, relatorio } from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import type { Analise } from "./analisar";
import { formatarNota } from "./calcular";
import type { Dicas } from "./dicas";
import type { Recomendacao, Resultado } from "./tipos";

/**
 * HTML dos e-mails (tabelas e estilos inline, fundo branco, verde só em traços e botões). Todo dado digitado
 * por alguém (nome, empresa, texto do admin) passa por `escapar`. Também gera a versão em texto puro.
 */

export const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const COR = { texto: "#0b0f0e", apoio: "#4b5250", linha: "#e3e6e4", verde: "#00e676", fundo: "#f6f7f5" };
const FONTE = "font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;";

function casca(conteudo: string, previa: string, site: string, rodape: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset IA</title></head>
<body style="margin:0;padding:0;background:${COR.fundo};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapar(previa)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COR.fundo};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid ${COR.linha};">
<tr><td style="padding:28px 32px 8px;"><img src="${site}/brand/logo-light.png" width="150" alt="Reset IA" style="display:block;border:0;"></td></tr>
<tr><td style="padding:8px 32px 32px;${FONTE}color:${COR.texto};font-size:15px;line-height:1.6;">${conteudo}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${COR.linha};${FONTE}color:${COR.apoio};font-size:12px;line-height:1.6;">${rodape}</td></tr>
</table></td></tr></table></body></html>`;
}

const h2 = (t: string) =>
  `<h2 style="${FONTE}font-size:18px;line-height:1.3;margin:32px 0 12px;color:${COR.texto};">${escapar(t)}</h2>`;
const p = (t: string, estilo = "") => `<p style="margin:0 0 14px;${estilo}">${escapar(t)}</p>`;
const botao = (texto: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="background:${COR.verde};border-radius:999px;"><a href="${escapar(href)}" style="display:inline-block;padding:13px 24px;${FONTE}font-size:15px;font-weight:700;color:${COR.texto};text-decoration:none;">${escapar(texto)}</a></td></tr></table>`;
const barra = (valor: number | null) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0;"><tr><td style="background:${COR.linha};height:4px;line-height:4px;font-size:0;"><div style="width:${Math.max(0, Math.min(100, valor ?? 0))}%;background:${COR.verde};height:4px;line-height:4px;font-size:0;">&nbsp;</div></td></tr></table>`;

const nomeDimensao = (id: DimensaoId) => dimensoes.find((d) => d.id === id)!.nome;

export interface DadosEmailRelatorio {
  nome: string;
  quem: string;
  resultado: Resultado;
  recomendacao: Recomendacao;
  analise: Analise;
  dicas: Dicas;
  link: string;
  whatsapp: string;
  site: string;
  nomesSolucoes: Record<string, string>;
}

export function montarEmailRelatorio(d: DadosEmailRelatorio) {
  const { resultado: res, recomendacao: rec, analise: a } = d;
  const nivel = niveis.find((n) => n.id === res.nivel)?.nome ?? null;
  const resumo = relatorio.resumo.texto({
    quem: d.quem,
    indice: res.indice,
    nivel,
    forte: rec.forte ? nomeDimensao(rec.forte) : null,
    lacuna: rec.lacunas[0] ? nomeDimensao(rec.lacunas[0]) : null,
    alerta: a.alertas[0] ? alertas.itens[a.alertas[0]].titulo : null,
  });
  const fases = relatorio.plano.fases.map((f, i) => ({
    ...f,
    acoes: i === relatorio.plano.fases.length - 1 ? [...a.plano[i], relatorio.plano.reavaliar] : a.plano[i],
  }));
  const assunto = er.assunto(res.indice, nivel);

  const html = [
    p(er.saudacao(d.nome), "font-size:17px;font-weight:700;"),
    p(er.intro),
    res.indice !== null
      ? `<p style="margin:20px 0 4px;${FONTE}font-size:48px;font-weight:800;line-height:1;color:${COR.texto};">${res.indice}<span style="font-size:18px;color:${COR.apoio};">/100</span></p>
<p style="margin:0 0 16px;font-size:16px;font-weight:700;">${escapar(nivel ?? "")}</p>`
      : "",
    `<div style="border:1px solid ${COR.linha};border-left:4px solid ${COR.verde};padding:16px 18px;margin:0 0 16px;font-size:15px;font-weight:600;">${escapar(resumo)}</div>`,
    botao(er.botao, d.link),
    h2(er.titulos.dimensoes),
    dimensoes
      .map((dim) => {
        const n = res.dimensoes[dim.id];
        return `<div style="margin:0 0 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:14px;font-weight:600;">${escapar(dim.nome)}</td><td align="right" style="font-size:14px;font-weight:700;">${n === null ? "–" : escapar(formatarNota(n))}</td></tr></table>${barra(n)}</div>`;
      })
      .join(""),
    a.alertas.length
      ? h2(er.titulos.alertas) +
        a.alertas
          .map(
            (id) =>
              p(alertas.itens[id].titulo, "font-weight:700;margin-bottom:2px;") +
              p(alertas.itens[id].texto, `color:${COR.apoio};`),
          )
          .join("")
      : "",
    d.dicas.dimensoes.length
      ? h2(er.titulos.dicas) +
        d.dicas.dimensoes
          .map(
            (x) =>
              p(
                `${nomeDimensao(x.id)} (${formatarNota(res.dimensoes[x.id] ?? 0)})`,
                "font-weight:700;margin:16px 0 6px;",
              ) +
              `<ul style="margin:0 0 8px;padding-left:20px;">${x.dicas.map((t) => `<li style="margin:0 0 6px;">${escapar(t)}</li>`).join("")}</ul>`,
          )
          .join("")
      : "",
    h2(er.titulos.plano) +
      fases
        .map(
          (f) =>
            p(`${f.periodo} · ${f.nome}`, "font-weight:700;margin:14px 0 6px;") +
            `<ul style="margin:0 0 8px;padding-left:20px;">${f.acoes.map((t) => `<li style="margin:0 0 6px;">${escapar(t)}</li>`).join("")}</ul>`,
        )
        .join(""),
    rec.solucoes.length
      ? h2(er.titulos.solucoes) +
        `<ul style="margin:0 0 8px;padding-left:20px;">${rec.solucoes
          .map(
            (s) =>
              `<li style="margin:0 0 6px;"><a href="${escapar(`${d.site}/solucoes/${s}/`)}" style="color:${COR.texto};font-weight:700;">${escapar(d.nomesSolucoes[s] ?? s)}</a></li>`,
          )
          .join("")}</ul>`
      : "",
    h2(er.conversa.titulo),
    p(er.conversa.texto),
    botao(er.conversa.botao, d.whatsapp),
    h2(relatorio.assinatura.titulo),
    relatorio.assinatura.paragrafos.map((t) => p(t, `color:${COR.apoio};font-size:13px;`)).join(""),
  ].join("\n");

  const texto = [
    er.saudacao(d.nome),
    er.intro,
    res.indice !== null ? `AI Score: ${res.indice}/100 (${nivel})` : "",
    resumo,
    `${er.botao}: ${d.link}`,
    "",
    er.titulos.dimensoes.toUpperCase(),
    ...dimensoes.map(
      (dim) => `- ${dim.nome}: ${res.dimensoes[dim.id] === null ? "–" : formatarNota(res.dimensoes[dim.id]!)}`,
    ),
    "",
    er.titulos.dicas.toUpperCase(),
    ...d.dicas.dimensoes.flatMap((x) => [nomeDimensao(x.id), ...x.dicas.map((t) => `- ${t}`)]),
    "",
    er.titulos.plano.toUpperCase(),
    ...fases.flatMap((f) => [`${f.periodo} · ${f.nome}`, ...f.acoes.map((t) => `- ${t}`)]),
    "",
    `${er.conversa.titulo} ${d.whatsapp}`,
    "",
    ...relatorio.assinatura.paragrafos,
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");

  const rodape = `${escapar(er.rodape)} <a href="${escapar(`${d.site}/privacidade/`)}" style="color:${COR.apoio};">${escapar(er.privacidade)}</a>.`;
  return { assunto, html: casca(html, er.previa, d.site, rodape), texto };
}

/** E-mail sobre a Reset IA: o texto (editável pelo admin) vira parágrafos, com o WhatsApp e o site no fim. */
export function montarEmailReset(d: { assunto: string; corpo: string; whatsapp: string; site: string }) {
  const paragrafos = d.corpo
    .split(/\n{2,}/)
    .map((bloco) => `<p style="margin:0 0 14px;">${escapar(bloco.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const html = casca(
    paragrafos + botao(emailReset.whatsapp, d.whatsapp),
    d.assunto,
    d.site,
    `${escapar(emailReset.assinatura)} · <a href="${escapar(d.site)}" style="color:${COR.apoio};">${escapar(emailReset.site)}</a>`,
  );
  return { assunto: d.assunto, html, texto: `${d.corpo}\n\n${emailReset.whatsapp}: ${d.whatsapp}\n${d.site}` };
}
