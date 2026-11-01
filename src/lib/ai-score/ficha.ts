import { adminFicha as t } from "@/content/admin-conversas";
import { perguntasCentrais } from "@/content/ai-score-questionario";
import { leitura as textosDeLeitura } from "@/content/ai-score-analise";
import { nomesSolucoes } from "@/content/solucoes-nomes";
import { esforcoEstimado } from "./aprofundamento";
import { linhasDoResumo, textoDoEsforco } from "./aprofundamento-resumo";
import type { Devolutiva } from "./devolutiva";
import { comQuem } from "./quem";
import { hojeSp, rotulos, type LeadVisao } from "./leads";
import type { Marco, ContatoPermitido } from "@/lib/supabase-admin";

/**
 * Ficha de preparação da conversa, DETERMINÍSTICA: sai das respostas, do aprofundamento (quando existe), dos marcos e
 * dos canais permitidos, sem nova chamada de IA e sem enviar nada a ninguém. O que não vem de uma resposta aparece
 * como hipótese. Nomes, e-mails e telefones não vão para fora do painel.
 */

interface SecaoDaFicha {
  id: keyof typeof t.secoes;
  titulo: string;
  linhas: string[];
}

export interface Ficha {
  secoes: SecaoDaFicha[];
  /** O mesmo conteúdo em texto simples, para copiar para o CRM ou para uma nota. */
  texto: string;
}

export interface ContextoDaFicha {
  devolutiva: Devolutiva | null;
  marcos: Marco[];
  contato: ContatoPermitido | undefined;
  agora: Date;
}

const maiuscula = (x: string) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`;

export function fichaDaConversa(v: LeadVisao, c: ContextoDaFicha): Ficha {
  const { lead: l, avaliacao: a, respostas, resultado, aprofundamento } = v;
  const dv = c.devolutiva;
  const quem = l.empresa ?? "A empresa";
  const secoes: SecaoDaFicha[] = [];
  const adicionar = (id: SecaoDaFicha["id"], linhas: string[]) => secoes.push({ id, titulo: t.secoes[id], linhas });

  // Perfil e escopo ----------------------------------------------------------------------------------------------
  adicionar("perfil", [
    `${t.rotulos.papel}: ${rotulos.papel(a.papel)}`,
    `${t.rotulos.porte}: ${rotulos.porte(a.porte)}`,
    `${t.rotulos.segmento}: ${rotulos.segmento(a.segmento)}`,
    `${t.rotulos.visao}: ${rotulos.escopo(a.escopo)}`,
    ...(l.empresa ? [`${t.rotulos.empresa}: ${l.empresa}`] : []),
    `${t.rotulos.nivel}: ${rotulos.nivel(resultado?.nivel ?? null)}${resultado?.indice === null || resultado?.indice === undefined ? "" : `, ${resultado.indice} de 100`}`,
  ]);

  // Dor e consequência declaradas --------------------------------------------------------------------------------
  const desafios = (respostas?.desafios ?? []).map(rotulos.desafio);
  const dor: string[] = [desafios.length ? `${t.rotulos.desafios}: ${desafios.join("; ")}` : t.rotulos.semDesafios];
  if (aprofundamento) dor.push(...linhasDoResumo(aprofundamento).map(([r, x]) => `${r}: ${x}`));
  else dor.push(t.rotulos.semAprofundamento);
  const consequencia = dv?.sintese.resumo.itens.find((i) => i.id === "consequencia");
  dor.push(
    aprofundamento?.consequencia || desafios.length
      ? `${t.rotulos.consequenciaDeclarada}: ${aprofundamento ? (linhasDoResumo(aprofundamento).find(([r]) => r === "Consequência")?.[1] ?? "") : desafios[0]}`
      : t.rotulos.semConsequencia,
  );
  if (consequencia) {
    const hip = comQuem(consequencia.texto, quem).split("Hipótese, a validar:")[1];
    if (hip) dor.push(`${t.rotulos.consequenciaHipotese}: ${hip.trim()}`);
  }
  adicionar("dor", dor);

  // Respostas que sustentam a leitura -------------------------------------------------------------------------------
  const sustentacao = dv?.sintese.resumo.itens.find((i) => i.id === "sustentacao");
  adicionar("sustentacao", sustentacao ? [comQuem(sustentacao.texto, quem)] : []);

  // Esforço (só com entradas suficientes) ---------------------------------------------------------------------------
  if (aprofundamento && aprofundamento.camada === 2) {
    const e = textoDoEsforco(esforcoEstimado(aprofundamento));
    adicionar("esforco", [e.titulo, ...(e.conta ? [e.conta] : []), ...e.itens]);
  }

  // Hipótese de oportunidade ----------------------------------------------------------------------------------------
  adicionar(
    "hipotese",
    dv?.sintese.oportunidades.itens.length
      ? dv.sintese.oportunidades.itens.map((o) => `${o.titulo}: ${o.hipotese} (${o.rotuloSituacao})`)
      : [t.rotulos.semHipoteses],
  );

  // O que falta saber -----------------------------------------------------------------------------------------------
  const faltam: string[] = [];
  if (dv) {
    for (const i of dv.analise.pontosCegos) {
      const p = perguntasCentrais[i];
      const papeis = textosDeLeitura.papeis[p.dimensao];
      const primeira = perguntasCentrais.findIndex((x) => x.dimensao === p.dimensao) === i;
      faltam.push(t.faltam.pontoCego((primeira ? papeis.primeira : papeis.segunda).nome));
    }
    for (const o of dv.sintese.oportunidades.itens)
      if (o.situacao === "contradiz") faltam.push(t.faltam.contradiz(o.titulo));
  }
  if (!aprofundamento) faltam.push(t.faltam.semAprofundamento);
  else {
    if (aprofundamento.volume === undefined) faltam.push(t.faltam.semVolume);
    if (aprofundamento.minutos === undefined && aprofundamento.camada === 2) faltam.push(t.faltam.semMinutos);
    if (aprofundamento.camada === 2) {
      if (!aprofundamento.indicador) faltam.push(t.faltam.semIndicador);
      if (!aprofundamento.dados || aprofundamento.dados === "nao-sei") faltam.push(t.faltam.semDados);
      if (!aprofundamento.papelDecisor) faltam.push(t.faltam.semPapel);
    }
  }
  adicionar("faltam", faltam.length ? faltam : [t.faltam.nada]);

  // Perguntas específicas para validar ---------------------------------------------------------------------------------
  const perguntas = [
    ...(dv?.sintese.resumo.itens.find((i) => i.id === "validar")?.lista ?? []),
    ...(dv?.sintese.oportunidades.itens.slice(0, 2).flatMap((o) => o.perguntas) ?? []),
  ];
  adicionar("perguntas", [...new Set(perguntas)].slice(0, 6));

  // Possível piloto ou serviço, com as condições -------------------------------------------------------------------------
  const piloto: string[] = [];
  for (const i of dv?.sintese.indicacoes.itens ?? []) {
    piloto.push(`${nomesSolucoes[i.slug as keyof typeof nomesSolucoes] ?? i.slug}: ${i.rotuloForca}.`);
    for (const x of i.condicoes) piloto.push(`  ${x.texto}: ${x.rotulo}`);
    if (i.ressalva) piloto.push(`  ${i.ressalva}`);
  }
  adicionar("piloto", piloto.length ? piloto : [t.rotulos.semIndicacao]);

  // Responsável, próxima ação, canal permitido e prazo ------------------------------------------------------------------
  const hoje = hojeSp(c.agora);
  const canais = c.contato
    ? [c.contato.email && "e-mail", c.contato.whatsapp && "WhatsApp", c.contato.ligacao && "ligação"].filter(Boolean)
    : [];
  const acao =
    l.status === "cliente" || l.status === "descartado"
      ? t.acao.encerrado
      : !l.pediu_contato
        ? t.acao.semPedido
        : !l.primeira_resposta_em
          ? t.acao.responder
          : l.proximo_contato && l.proximo_contato < hoje
            ? t.acao.atrasado
            : !l.proximo_contato
              ? t.acao.marcarRetorno
              : t.acao.seguir;
  adicionar("proximo", [
    `${t.rotulos.responsavel}: ${l.responsavel ?? t.rotulos.semResponsavel}`,
    `${t.rotulos.proximaAcao}: ${acao}`,
    `${t.rotulos.canal}: ${canais.length ? canais.join(", ") : t.rotulos.semCanal}`,
    `${t.rotulos.prazo}: ${l.proximo_contato ? l.proximo_contato.split("-").reverse().join("/") : t.rotulos.semPrazo}`,
  ]);

  const texto = secoes
    .filter((s) => s.linhas.length)
    .map((s) => `${maiuscula(s.titulo)}\n${s.linhas.map((x) => (x.startsWith("  ") ? x : `- ${x}`)).join("\n")}`)
    .join("\n\n");
  return { secoes, texto };
}
