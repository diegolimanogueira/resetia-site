import { emailRelatorio as er, emailReset } from "@/content/ai-score-email";
import { dimensoes, niveis, relatorio } from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import type { Analise } from "./analisar";
import { formatarNota } from "./calcular";
import type { Dicas } from "./dicas";
import { comQuem } from "./quem";
import type { Sintese } from "./sintese";
import type { Resultado } from "./tipos";

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
  /** Resumo, indicações e roteiro: a mesma síntese da tela e do PDF. */
  sintese: Sintese;
  analise: Analise;
  dicas: Dicas;
  link: string;
  /** Página de preferências de contato (token próprio); opcional nos e-mails do caminho antigo. */
  preferencias?: string;
  whatsapp: string;
  site: string;
  nomesSolucoes: Record<string, string>;
}

export function montarEmailRelatorio(d: DadosEmailRelatorio) {
  const { resultado: res, sintese, analise: a } = d;
  const nivel = niveis.find((n) => n.id === res.nivel)?.nome ?? null;
  const itensDoResumo = sintese.resumo.itens.map((i) => ({
    rotulo: i.rotulo,
    texto: comQuem(i.texto, d.quem),
    lista: i.lista ?? [],
  }));
  const fases = ([1, 2, 3] as const)
    .map((fase) => ({
      fase,
      etapas: sintese.plano.etapas.filter((e) => e.fase === fase),
    }))
    .filter((f) => f.etapas.length);
  const assunto = er.assunto(res.indice, nivel);

  const html = [
    p(er.saudacao(d.nome), "font-size:17px;font-weight:700;"),
    p(er.intro),
    res.indice !== null
      ? `<p style="margin:20px 0 4px;${FONTE}font-size:48px;font-weight:800;line-height:1;color:${COR.texto};">${res.indice}<span style="font-size:18px;color:${COR.apoio};">/100</span></p>
<p style="margin:0 0 16px;font-size:16px;font-weight:700;">${escapar(nivel ?? "")}</p>`
      : "",
    `<div style="border:1px solid ${COR.linha};border-left:4px solid ${COR.verde};padding:16px 18px;margin:0 0 16px;">${itensDoResumo
      .map(
        (i) =>
          `<p style="margin:0 0 2px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${COR.apoio};">${escapar(i.rotulo)}</p>` +
          (i.texto ? `<p style="margin:0 0 12px;font-size:15px;">${escapar(i.texto)}</p>` : "") +
          (i.lista.length
            ? `<ul style="margin:0 0 12px;padding-left:20px;">${i.lista.map((t) => `<li style="margin:0 0 4px;">${escapar(t)}</li>`).join("")}</ul>`
            : ""),
      )
      .join("")}</div>`,
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
          .map((x) => p(x.titulo, "font-weight:700;margin-bottom:2px;") + p(x.texto, `color:${COR.apoio};`))
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
    h2(sintese.plano.titulo) +
      p(sintese.plano.nota, `color:${COR.apoio};font-size:13px;`) +
      fases
        .map(
          (f) =>
            p(`${f.etapas[0].periodo} · ${f.etapas[0].nomeDaFase}`, "font-weight:700;margin:14px 0 6px;") +
            `<ul style="margin:0 0 8px;padding-left:20px;">${f.etapas
              .map(
                (e) =>
                  `<li style="margin:0 0 10px;"><strong>${escapar(e.titulo)}.</strong> ${escapar(e.acao)}<br><span style="color:${COR.apoio};font-size:13px;">${escapar(sintese.plano.rotulos.entrega)}: ${escapar(e.entrega)}. ${escapar(sintese.plano.rotulos.depende)}: ${escapar(e.dependeDe)}.</span></li>`,
              )
              .join("")}</ul>`,
        )
        .join(""),
    sintese.indicacoes.itens.length
      ? h2(sintese.indicacoes.titulo) +
        sintese.indicacoes.itens
          .map(
            (i) =>
              `<p style="margin:14px 0 4px;"><a href="${escapar(`${d.site}/solucoes/${i.slug}/`)}" style="color:${COR.texto};font-weight:700;">${escapar(d.nomesSolucoes[i.slug] ?? i.slug)}</a> <span style="color:${COR.apoio};font-size:13px;">· ${escapar(i.rotuloForca)}</span></p>` +
              `<ul style="margin:0 0 8px;padding-left:20px;">${[
                ...i.porque,
                ...i.condicoes.filter((c) => c.situacao !== "atendida").map((c) => `${c.texto}: ${c.rotulo}`),
                ...(i.ressalva ? [i.ressalva] : []),
              ]
                .map((t) => `<li style="margin:0 0 4px;">${escapar(t)}</li>`)
                .join("")}</ul>`,
          )
          .join("")
      : h2(sintese.indicacoes.titulo) + p(sintese.indicacoes.semIndicacao ?? ""),
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
    ...itensDoResumo.flatMap((i) => [i.rotulo, i.texto, ...i.lista.map((t) => `- ${t}`)].filter(Boolean)),
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
    sintese.plano.titulo.toUpperCase(),
    ...fases.flatMap((f) => [
      `${f.etapas[0].periodo} · ${f.etapas[0].nomeDaFase}`,
      ...f.etapas.map((e) => `- ${e.titulo}. ${e.acao} (${sintese.plano.rotulos.depende}: ${e.dependeDe})`),
    ]),
    "",
    sintese.indicacoes.titulo.toUpperCase(),
    ...(sintese.indicacoes.itens.length
      ? sintese.indicacoes.itens.map((i) => `- ${d.nomesSolucoes[i.slug] ?? i.slug} (${i.rotuloForca})`)
      : [sintese.indicacoes.semIndicacao ?? ""]),
    "",
    `${er.conversa.titulo} ${d.whatsapp}`,
    "",
    ...relatorio.assinatura.paragrafos,
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");

  const rodape = `${escapar(er.rodape)} <a href="${escapar(`${d.site}/privacidade/`)}" style="color:${COR.apoio};">${escapar(er.privacidade)}</a>.${
    d.preferencias
      ? ` <a href="${escapar(d.preferencias)}" style="color:${COR.apoio};">${escapar(er.preferencias)}</a>.`
      : ""
  }`;
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
