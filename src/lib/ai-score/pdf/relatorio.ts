import { pdf as p } from "@/content/ai-score-pdf";
import {
  dimensoes,
  escalaAreaCurta,
  exemplo as textosDoExemplo,
  modulosArea,
  niveis,
  perguntasCentrais,
  questionario,
  relatorio as t,
  resultadoTextos,
} from "@/content/ai-score-questionario";
import { assinatura, dicas as textosDeDicas } from "@/content/ai-score-sintese";
import { nomesSolucoes } from "@/content/solucoes-nomes";
import { esforcoEstimado, type Aprofundamento } from "../aprofundamento";
import { linhasDoResumo, textoDoEsforco } from "../aprofundamento-resumo";
import { formatarNota } from "../calcular";
import type { Devolutiva } from "../devolutiva";
import type { Dicas } from "../dicas";
import { comQuem } from "../quem";
import type { RespostasCompletas } from "../tipos";
import { CORES, Documento } from "./escritor";

/**
 * O PDF do relatório, montado da MESMA devolutiva da tela e do e-mail (nota, nível, cobertura, resumo, lacunas,
 * roteiro e indicações saem dela, na versão com que a avaliação foi feita). Só texto: nada é imagem.
 */

export interface EntradaDoPdf {
  devolutiva: Devolutiva;
  respostas: RespostasCompletas;
  nome: string | null;
  empresa: string | null;
  /** Data já formatada ("01/11/2026"). */
  data: string;
  dicas?: Dicas | null;
  /** O aprofundamento, quando a pessoa o respondeu. */
  aprofundamento?: Aprofundamento | null;
  /** Página de exemplo: leva o aviso de que o caso é fictício. */
  exemplo?: boolean;
}

const dimensao = (id: string) => dimensoes.find((d) => d.id === id)!;
const nomeDoNivel = (id: string | null) => niveis.find((n) => n.id === id)?.nome ?? null;

function quemDoPdf(r: RespostasCompletas, empresa: string | null) {
  if (r.escopo === "empresa") return empresa ?? t.resumo.suaEmpresa;
  const modulo = modulosArea.find((m) => m.area === r.escopo)?.nome;
  return `${t.resumo.suaArea} (${modulo}${empresa ? `, ${empresa}` : ""})`;
}

export function gerarPdf(e: EntradaDoPdf): Uint8Array<ArrayBuffer> {
  const { devolutiva: dv, respostas: r } = e;
  const { resultado, cobertura, analise: a, leituras, sintese, versoes } = dv;
  const area = r.escopo !== "empresa";
  const quem = quemDoPdf(r, e.empresa);
  const nivel = nomeDoNivel(resultado.nivel);

  const d = new Documento({
    titulo: `${t.impresso.titulo}${e.empresa ? `, ${e.empresa}` : ""}`,
    autor: p.autor,
    idioma: "pt-BR",
    rodape: p.rodape,
    nota: t.impresso.rodape,
    pagina: p.pagina,
  });

  // Cabeçalho ---------------------------------------------------------------------------------------------------
  d.titulo(t.impresso.titulo, 1);
  if (e.exemplo) d.texto(textosDoExemplo.aviso, { negrito: true, cor: CORES.verde });
  if (e.nome && e.empresa) d.texto(t.impresso.para(e.nome, e.empresa, e.data), { cor: CORES.apoio });
  d.texto(p.versao(versoes.metodo, versoes.analiseDoLink ?? versoes.analiseAtual), { tamanho: 9, cor: CORES.apoio });
  if (versoes.anteriorAoVersionamento)
    d.texto(resultadoTextos.versao.anterior(versoes.metodo, versoes.analiseAtual), { tamanho: 9, cor: CORES.apoio });
  d.regua();

  // Nota, nível e cobertura ---------------------------------------------------------------------------------------
  d.numeroGrande(
    resultado.indice === null ? resultadoTextos.parcial.nome : String(resultado.indice),
    resultado.indice === null ? "" : p.de100,
  );
  if (nivel) d.texto(nivel, { tamanho: 14, negrito: true, depois: 2 });
  d.texto(
    cobertura.situacao === "completa"
      ? resultadoTextos.cobertura.completa(cobertura.validas, cobertura.total)
      : cobertura.situacao === "estimativa"
        ? resultadoTextos.cobertura.estimativa.texto(cobertura.validas, cobertura.total)
        : resultadoTextos.cobertura.parcial(cobertura.validas, cobertura.total),
    { cor: CORES.apoio, depois: 6 },
  );
  d.barra(resultado.indice);

  // Resumo executivo ----------------------------------------------------------------------------------------------
  d.titulo(sintese.resumo.titulo);
  for (const item of sintese.resumo.itens) {
    d.texto(item.rotulo.toUpperCase(), {
      tamanho: 8.5,
      negrito: true,
      cor: CORES.apoio,
      antes: 4,
      depois: 1,
      mantemComOProximo: true,
    });
    if (item.texto) d.texto(comQuem(item.texto, quem), { depois: 5 });
    if (item.lista) d.lista(item.lista);
  }

  // Alertas -------------------------------------------------------------------------------------------------------
  if (a.alertas.length) {
    d.titulo(p.secoes.alertas);
    for (const x of a.alertas) {
      d.texto(x.titulo, { negrito: true, depois: 1, mantemComOProximo: true });
      d.texto(x.texto, { cor: CORES.apoio, depois: 6 });
    }
  }

  // Simulação (matemática da escala, separada de produtividade ou retorno) -----------------------------------------
  if (a.simulacao) {
    d.titulo(p.secoes.simulacao);
    d.texto(t.simulacao.texto(a.simulacao.alvo, a.simulacao.de, a.simulacao.para, nomeDoNivel(a.simulacao.nivel)!));
    d.texto(
      `${t.simulacao.sobem(a.simulacao.alvo)} ${a.simulacao.dimensoes.map((id) => dimensao(id).nome).join(" · ")}`,
      {
        cor: CORES.apoio,
      },
    );
  }

  // Lacunas de maturidade -----------------------------------------------------------------------------------------
  d.titulo(p.secoes.lacunas);
  d.texto(t.prioridades.nota, { cor: CORES.apoio, depois: 6 });
  if (a.prioridades.length)
    a.prioridades.forEach((x, i) => {
      d.duasColunas(
        `${i + 1}. ${dimensao(x.dimensao).nome}`,
        `${formatarNota(x.nota)} · ${t.prioridades.rotulos[x.prioridade]}`,
        {
          negrito: true,
        },
      );
      d.barra(x.nota);
      if (x.desafio) d.texto(t.prioridades.desafio, { tamanho: 9, cor: CORES.verde, depois: 1 });
      if (x.criterio) d.texto(sintese.lacunas.criterios[x.criterio], { tamanho: 9, cor: CORES.apoio, depois: 4 });
    });
  else d.texto(sintese.lacunas.vazio);

  // Oportunidades a investigar ------------------------------------------------------------------------------------
  d.titulo(sintese.oportunidades.titulo);
  d.texto(sintese.oportunidades.nota, { cor: CORES.apoio, depois: 6 });
  if (sintese.oportunidades.itens.length)
    for (const o of sintese.oportunidades.itens) {
      d.texto(o.titulo, { negrito: true, depois: 1, mantemComOProximo: true });
      d.texto(o.rotuloSituacao, {
        tamanho: 9.5,
        cor: o.situacao === "sustentado" ? CORES.verde : CORES.texto,
        depois: 2,
      });
      d.texto(o.hipotese, { cor: CORES.apoio, depois: 3 });
      d.texto(sintese.oportunidades.perguntas, { tamanho: 9.5, negrito: true, depois: 1, mantemComOProximo: true });
      d.lista(o.perguntas, { tamanho: 10 });
      if (o.condicoes.length) {
        d.texto(sintese.oportunidades.condicoes, { tamanho: 9.5, negrito: true, depois: 1, mantemComOProximo: true });
        d.lista(
          o.condicoes.map((c) => `${c.texto}: ${c.rotulo}`),
          { tamanho: 10 },
        );
      }
      d.espaco(4);
    }
  else d.texto(sintese.oportunidades.vazio);

  // Dicas ---------------------------------------------------------------------------------------------------------
  if (e.dicas?.dimensoes.length) {
    d.titulo(p.secoes.dicas);
    d.texto(textosDeDicas.fonte[e.dicas.fonte], { tamanho: 9.5, cor: CORES.apoio, depois: 6 });
    for (const x of e.dicas.dimensoes) {
      d.duasColunas(dimensao(x.id).nome, formatarNota(resultado.dimensoes[x.id] ?? 0), { negrito: true });
      d.lista(x.dicas);
    }
  }

  // Análise por dimensão ------------------------------------------------------------------------------------------
  d.titulo(p.secoes.dimensoes);
  for (const dim of dimensoes) {
    const nota = resultado.dimensoes[dim.id];
    const sobre = cobertura.porDimensao[dim.id];
    d.duasColunas(`${dim.num}  ${dim.nome}`, nota === null ? questionario.naoSei : formatarNota(nota), {
      negrito: true,
      tamanho: 11.5,
    });
    d.barra(nota);
    d.texto(p.dimensao.respostas(sobre.validas, sobre.total), { tamanho: 9, cor: CORES.verde, depois: 2 });
    for (const x of leituras[dim.id].afirmacoes.filter(
      (x) => !x.id.includes(".declarado.") && !x.id.includes(".proximo."),
    )) {
      d.texto(x.texto, { cor: CORES.apoio, depois: x.pergunta ? 1 : 4 });
      if (x.pergunta) d.texto(`${p.dimensao.validar} ${x.pergunta}`, { tamanho: 9.5, negrito: true, depois: 4 });
    }
    for (const resp of a.respostas.filter((x) => x.dimensao === dim.id)) {
      const q = perguntasCentrais[resp.indice];
      d.texto(area ? q.texto.area : q.texto.empresa, {
        tamanho: 9.5,
        cor: CORES.apoio,
        depois: 1,
        mantemComOProximo: true,
      });
      d.texto(
        `${p.dimensao.hoje} ${resp.atual === null || resp.atual === undefined ? questionario.naoSei : q.alternativas[resp.atual]}`,
        {
          tamanho: 9.5,
          negrito: true,
          recuo: 10,
          depois: 1,
        },
      );
      d.texto(
        resp.atual === null
          ? `${t.pontosCegos.titulo}: ${t.pontosCegos.nota}`
          : `${p.dimensao.proximo} ${resp.proximo ?? p.dimensao.topo}`,
        { tamanho: 9.5, recuo: 10, depois: 5 },
      );
    }
    d.espaco(6);
  }

  // Pontos cegos --------------------------------------------------------------------------------------------------
  d.titulo(p.secoes.pontosCegos);
  d.texto(t.pontosCegos.nota, { cor: CORES.apoio, depois: 4 });
  if (a.pontosCegos.length)
    d.lista(
      a.pontosCegos.map(
        (i) =>
          `${dimensao(perguntasCentrais[i].dimensao).nome}: ${area ? perguntasCentrais[i].texto.area : perguntasCentrais[i].texto.empresa}`,
      ),
    );
  else d.texto(t.pontosCegos.nenhum);

  // Roteiro de 90 dias --------------------------------------------------------------------------------------------
  d.titulo(sintese.plano.titulo);
  d.texto(sintese.plano.nota, { cor: CORES.apoio, depois: 6 });
  let fase = 0;
  sintese.plano.etapas.forEach((etapa, i) => {
    if (etapa.fase !== fase) {
      fase = etapa.fase;
      d.texto(`${etapa.periodo} · ${etapa.nomeDaFase}`.toUpperCase(), {
        tamanho: 9,
        negrito: true,
        cor: CORES.verde,
        antes: 6,
        depois: 2,
        mantemComOProximo: true,
      });
    }
    d.texto(`${String(i + 1).padStart(2, "0")}  ${etapa.titulo}`, {
      negrito: true,
      depois: 1,
      mantemComOProximo: true,
    });
    d.texto(etapa.acao, { recuo: 18, depois: 2 });
    if (etapa.detalhe) d.texto(etapa.detalhe, { recuo: 18, tamanho: 9.5, cor: CORES.apoio, depois: 2 });
    for (const [rotulo, texto] of [
      [sintese.plano.rotulos.responsavel, etapa.responsavel],
      [sintese.plano.rotulos.entrega, etapa.entrega],
      [sintese.plano.rotulos.indicador, etapa.indicador],
      [sintese.plano.rotulos.depende, etapa.dependeDe],
    ])
      d.texto(`${rotulo}: ${texto}`, { recuo: 18, tamanho: 9.5, cor: CORES.apoio, depois: 1 });
    d.espaco(5);
  });

  // Aplicação por atividade ---------------------------------------------------------------------------------------
  if (r.areas.length) {
    d.titulo(p.secoes.areas);
    for (const ar of r.areas) {
      const m = modulosArea.find((x) => x.area === ar)!;
      const indice = resultado.areas[ar] ?? null;
      d.duasColunas(m.nome, indice === null ? questionario.naoSei : formatarNota(indice), { negrito: true });
      d.barra(indice);
      m.perguntas.forEach((q, i) => {
        const v = r.porArea[ar]?.[i];
        d.texto(`${q.texto} ${v === null || v === undefined ? questionario.naoSei : escalaAreaCurta[v]}`, {
          tamanho: 9.5,
          cor: CORES.apoio,
          depois: 1,
        });
      });
      d.espaco(4);
    }
  }

  // Indicações ----------------------------------------------------------------------------------------------------
  d.titulo(sintese.indicacoes.titulo);
  d.texto(sintese.indicacoes.nota, { cor: CORES.apoio, depois: 6 });
  if (sintese.indicacoes.itens.length)
    for (const i of sintese.indicacoes.itens) {
      d.texto(nomesSolucoes[i.slug as keyof typeof nomesSolucoes] ?? i.slug, {
        negrito: true,
        depois: 1,
        mantemComOProximo: true,
      });
      d.texto(i.rotuloForca, { tamanho: 9.5, cor: i.forca === "indicada" ? CORES.verde : CORES.texto, depois: 2 });
      d.lista(i.porque, { tamanho: 10 });
      if (i.ressalva) d.texto(i.ressalva, { tamanho: 9.5, cor: CORES.apoio, depois: 2 });
      if (i.criterio) d.texto(i.criterio, { tamanho: 9.5, cor: CORES.apoio, depois: 2 });
      const pendentes = i.condicoes;
      if (pendentes.length) {
        d.texto(sintese.indicacoes.condicoes, { tamanho: 9.5, negrito: true, depois: 1, mantemComOProximo: true });
        d.lista(
          pendentes.map((c) => `${c.texto}: ${c.rotulo}`),
          { tamanho: 10 },
        );
      }
      d.espaco(4);
    }
  else d.texto(sintese.indicacoes.semIndicacao ?? "");

  // Aprofundamento (só quando existe) -----------------------------------------------------------------------------
  if (e.aprofundamento) {
    d.titulo(p.secoes.aprofundamento);
    d.texto(p.aprofundamento.privacidade, { tamanho: 9.5, cor: CORES.apoio, depois: 6 });
    for (const [rotulo, texto] of linhasDoResumo(e.aprofundamento)) d.texto(`${rotulo}: ${texto}`, { depois: 2 });
    if (e.aprofundamento.camada === 2) {
      const esforco = textoDoEsforco(esforcoEstimado(e.aprofundamento));
      d.texto(esforco.titulo, { negrito: true, antes: 6, depois: 2, mantemComOProximo: true });
      if (esforco.conta) d.texto(esforco.conta, { negrito: true, depois: 3 });
      d.lista(esforco.itens, { tamanho: 10 });
    }
  }

  // Assinatura e avisos -------------------------------------------------------------------------------------------
  // O bloco final não se parte entre páginas: ou cabe inteiro, ou vai inteiro para a seguinte.
  d.garantir(150);
  d.titulo(assinatura.titulo, 3);
  for (const paragrafo of assinatura.paragrafos) d.texto(paragrafo, { tamanho: 9.5, cor: CORES.apoio, depois: 4 });

  return d.bytes();
}

/** Nome do arquivo: só letras e números, sem acento. */
export function nomeDoArquivo(empresa: string | null, base: string) {
  const limpo = (empresa ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base}${limpo ? `-${limpo}` : ""}.pdf`;
}
