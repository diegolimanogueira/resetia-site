import { leitura as textosDeLeitura } from "@/content/ai-score-analise";
import {
  hipoteses,
  indicacoes as textosDeIndicacao,
  lacunas as textosDeLacuna,
  oportunidades as textosDeOportunidade,
  plano as textosDoPlano,
  resumo as textosDoResumo,
  type EtapaId,
} from "@/content/ai-score-sintese";
import { desafios, dimensoes, niveis, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DesafioId, DimensaoId } from "@/content/types";
import type { Analise } from "./analisar";
import { formatarNota } from "./calcular";
import type { Cobertura } from "./cobertura";
import type { Afirmacao } from "./evidencia";
import type { LeituraDaDimensao } from "./leituras";
import { condicoesDe } from "./recomendar";
import type { Condicao, CriterioDeDesempate, Recomendacao, RespostasCompletas, Resultado } from "./tipos";

/**
 * Síntese da avaliação: o resumo executivo, a leitura dos desafios como oportunidades a investigar, as indicações
 * com evidência e condições, e o roteiro de 90 dias ordenado por dependências. Tudo em dados simples (JSON), pronto
 * para a tela, o PDF, o e-mail e a ficha comercial. É determinística: as mesmas respostas dão sempre o mesmo texto.
 */

interface ItemDoResumo {
  id: keyof typeof textosDoResumo.rotulos;
  rotulo: string;
  texto: string;
  /** Itens em lista (o que validar). */
  lista?: string[];
  natureza: Afirmacao["natureza"];
}

interface OportunidadeTexto {
  id: DesafioId;
  titulo: string;
  situacao: "sustentado" | "contradiz" | "sem-resposta";
  rotuloSituacao: string;
  hipotese: string;
  perguntas: string[];
  /** Só quando a hipótese depende de condições (agentes, medir). */
  condicoes: Array<{ texto: string; situacao: Condicao["situacao"]; rotulo: string }>;
}

interface IndicacaoTexto {
  slug: string;
  forca: "indicada" | "investigar";
  rotuloForca: string;
  porque: string[];
  ressalva: string | null;
  condicoes: Array<{ texto: string; situacao: Condicao["situacao"]; rotulo: string }>;
  criterio: string | null;
}

interface EtapaDoPlano {
  id: EtapaId;
  fase: 1 | 2 | 3;
  periodo: string;
  nomeDaFase: string;
  titulo: string;
  acao: string;
  detalhe: string | null;
  responsavel: string;
  entrega: string;
  indicador: string;
  /** Ids das etapas anteriores de que esta depende. */
  depende: EtapaId[];
  dependeDe: string;
}

export interface Sintese {
  resumo: { titulo: string; itens: ItemDoResumo[] };
  lacunas: { vazio: string; criterios: Record<CriterioDeDesempate, string> };
  oportunidades: {
    titulo: string;
    nota: string;
    vazio: string;
    perguntas: string;
    condicoes: string;
    itens: OportunidadeTexto[];
  };
  indicacoes: { titulo: string; nota: string; condicoes: string; semIndicacao: string | null; itens: IndicacaoTexto[] };
  plano: { titulo: string; nota: string; rotulos: typeof textosDoPlano.rotulos; etapas: EtapaDoPlano[] };
}

const dimensao = (id: DimensaoId) => dimensoes.find((d) => d.id === id)!;
const rotuloDaSituacao = (c: Condicao, alternativa: string | undefined) =>
  c.situacao === "atendida"
    ? textosDeIndicacao.condicoes.atendida
    : c.situacao === "pendente"
      ? textosDeIndicacao.condicoes.pendente(alternativa ?? "")
      : textosDeIndicacao.condicoes["sem-resposta"];

/** Uma condição em texto: o tema da pergunta, o estágio exigido e a situação, citando a resposta quando existe. */
function condicaoEmTexto(c: Condicao, r: RespostasCompletas) {
  const i = perguntasCentrais.findIndex((p) => p.id === c.ref);
  const p = perguntasCentrais[i];
  const primeira = perguntasCentrais.findIndex((x) => x.dimensao === p.dimensao) === i;
  const papeis = textosDeLeitura.papeis[p.dimensao];
  const tema = (primeira ? papeis.primeira : papeis.segunda).nome;
  const valor = r.centrais[i];
  const alternativa = typeof valor === "number" ? p.alternativas[valor] : undefined;
  return {
    texto: textosDeIndicacao.condicoes.estagio(tema, c.minimo),
    situacao: c.situacao,
    rotulo: rotuloDaSituacao(c, alternativa),
  };
}

function montarResumo(
  r: RespostasCompletas,
  resultado: Resultado,
  cobertura: Cobertura,
  rec: Recomendacao,
  analise: Analise,
  leituras: Record<DimensaoId, LeituraDaDimensao>,
  etapas: EtapaDoPlano[],
  oportunidades: OportunidadeTexto[],
  indicacoes: IndicacaoTexto[],
): ItemDoResumo[] {
  const t = textosDoResumo;
  const nivel = niveis.find((n) => n.id === resultado.nivel)?.nome ?? "";
  const alerta = analise.alertas[0]?.titulo;
  const lacuna = rec.lacunas[0];

  const cenario =
    resultado.indice === null
      ? t.cenario.parcial(cobertura.validas, cobertura.total)
      : `${t.cenario.nivel(nivel, resultado.indice)} ${
          cobertura.situacao === "completa"
            ? t.cenario.completa(cobertura.total)
            : t.cenario.estimativa(cobertura.validas, cobertura.total)
        }`;

  const atencao =
    resultado.indice === null
      ? lacuna
        ? t.atencao.parcial(dimensao(lacuna).nome, formatarNota(resultado.dimensoes[lacuna]!))
        : t.atencao.semNota
      : lacuna
        ? [
            t.atencao.lacuna(dimensao(lacuna).nome, formatarNota(resultado.dimensoes[lacuna]!)),
            alerta ? t.atencao.alerta(alerta) : "",
          ]
            .filter(Boolean)
            .join(" ")
        : alerta
          ? t.atencao.semLacunaComAlerta(alerta)
          : t.atencao.nenhuma;

  // As respostas que sustentam: as declaradas na dimensão em foco (a mais frágil ou, sem lacuna, a mais forte).
  const foco = lacuna ?? rec.forte;
  const declaradas = foco
    ? leituras[foco].afirmacoes.filter((a) => a.id.includes(".declarado.")).map((a) => a.texto)
    : [];

  const desafio = r.desafios.map((id) => desafios.find((d) => d.id === id)!)[0];
  const consequencia = [
    desafio ? t.consequencia.declarada(desafio.label) : t.consequencia.semDeclarada,
    lacuna ? t.consequencia.hipotese(hipoteses[lacuna]) : "",
  ]
    .filter(Boolean)
    .join(" ");

  const validar = [
    ...oportunidades.filter((o) => o.situacao === "contradiz").map((o) => `${o.titulo}: ${o.rotuloSituacao}`),
    ...indicacoes.flatMap((i) =>
      i.condicoes.filter((c) => c.situacao !== "atendida").map((c) => `${c.texto} (${c.rotulo})`),
    ),
    ...(lacuna
      ? leituras[lacuna].afirmacoes.filter((a) => a.natureza === "validar" && a.pergunta).map((a) => a.pergunta!)
      : []),
  ].slice(0, 3);

  return [
    { id: "cenario", rotulo: t.rotulos.cenario, texto: cenario, natureza: "derivado" },
    { id: "atencao", rotulo: t.rotulos.atencao, texto: atencao, natureza: "derivado" },
    {
      id: "sustentacao",
      rotulo: t.rotulos.sustentacao,
      texto: declaradas.length ? declaradas.join(" ") : t.sustentacao.nenhuma,
      natureza: "declarado",
    },
    { id: "consequencia", rotulo: t.rotulos.consequencia, texto: consequencia, natureza: "hipotese" },
    { id: "primeira-acao", rotulo: t.rotulos["primeira-acao"], texto: etapas[0].acao, natureza: "derivado" },
    {
      id: "validar",
      rotulo: t.rotulos.validar,
      texto: validar.length ? "" : t.validar.generico,
      ...(validar.length ? { lista: validar } : {}),
      natureza: "validar",
    },
  ];
}

function montarPlano(rec: Recomendacao, analise: Analise) {
  const temLacuna = (id: DimensaoId) => rec.lacunas.includes(id);
  const compativeis = rec.desafios.filter((d) => d.situacao !== "contradiz").map((d) => d.id);
  const semLacunas = rec.lacunas.length === 0;
  const controles = temLacuna("governanca") || analise.alertas.some((a) => a.alerta === "adocao-sem-governanca");
  const capacitacao = temLacuna("pessoas") || compativeis.some((d) => d === "capacitar" || d === "pouco-uso");
  const dados = temLacuna("dados");

  const ids: EtapaId[] = [
    ...(semLacunas ? (["revisar"] as const) : []),
    "problema",
    "linha-de-base",
    ...(controles ? (["controles"] as const) : []),
    ...(capacitacao ? (["capacitacao"] as const) : []),
    ...(dados ? (["dados"] as const) : []),
    "piloto",
    "avaliacao",
    "expansao",
    "reavaliar",
  ];
  const tem = (id: EtapaId) => ids.includes(id);
  const depende = (id: EtapaId): EtapaId[] => {
    const base: Record<EtapaId, EtapaId[]> = {
      revisar: [],
      problema: ["revisar"],
      "linha-de-base": ["problema"],
      controles: ["problema"],
      capacitacao: ["problema"],
      dados: ["problema"],
      piloto: ["linha-de-base", "controles", "capacitacao", "dados"],
      avaliacao: ["piloto"],
      expansao: ["avaliacao", "controles", "capacitacao"],
      reavaliar: ["avaliacao"],
    };
    return base[id].filter(tem);
  };

  const desafio = rec.desafios.find((d) => d.situacao !== "contradiz");
  const detalhes: Partial<Record<EtapaId, string>> = {
    problema: desafio
      ? textosDoPlano.desafio(
          desafios.find((d) => d.id === desafio.id)!.label,
          desafios.find((d) => d.id === desafio.id)!.passo,
        )
      : rec.lacunas[0]
        ? dimensao(rec.lacunas[0]).passos.estruturar
        : undefined,
    controles: dimensao("governanca").passos.estruturar,
    capacitacao: dimensao("pessoas").passos.estruturar,
    dados: dimensao("dados").passos.estruturar,
  };

  const titulo = (id: EtapaId) => textosDoPlano.etapas[id].titulo;
  return ids.map((id): EtapaDoPlano => {
    const e = textosDoPlano.etapas[id];
    const fase = e.fase as 1 | 2 | 3;
    const deps = depende(id);
    return {
      id,
      fase,
      periodo: textosDoPlano.fases[fase].periodo,
      nomeDaFase: textosDoPlano.fases[fase].nome,
      titulo: e.titulo,
      acao: e.acao,
      detalhe: detalhes[id] ?? null,
      responsavel: e.responsavel,
      entrega: e.entrega,
      indicador: e.indicador,
      depende: deps,
      dependeDe: deps.length ? deps.map(titulo).join("; ") : textosDoPlano.rotulos.semDependencia,
    };
  });
}

export function montarSintese(
  r: RespostasCompletas,
  resultado: Resultado,
  cobertura: Cobertura,
  rec: Recomendacao,
  analise: Analise,
  leituras: Record<DimensaoId, LeituraDaDimensao>,
): Sintese {
  const oportunidades: OportunidadeTexto[] = rec.desafios.map((d) => {
    const t = textosDeOportunidade.itens[d.id];
    const prontidao = d.id === "agentes" ? condicoesDe("agent-factory", r.centrais) : [];
    return {
      id: d.id,
      titulo: t.titulo,
      situacao: d.situacao,
      rotuloSituacao: textosDeOportunidade.situacoes[d.situacao],
      hipotese: t.hipotese,
      perguntas: t.perguntas,
      condicoes: prontidao.map((c) => condicaoEmTexto(c, r)),
    };
  });

  const itensDeIndicacao: IndicacaoTexto[] = rec.indicacoes.map((i) => ({
    slug: i.slug,
    forca: i.forca,
    rotuloForca: textosDeIndicacao.forca[i.forca],
    porque: i.apoios.map((a) =>
      a.tipo === "dimensao"
        ? textosDeIndicacao.apoio.dimensao(dimensao(a.id).nome, formatarNota(a.nota))
        : a.tipo === "desafio"
          ? textosDeIndicacao.apoio.desafio(desafios.find((d) => d.id === a.id)!.label)
          : "",
    ),
    ressalva: i.direta ? null : textosDeIndicacao.semApoioDireto,
    condicoes: i.condicoes.map((c) => condicaoEmTexto(c, r)),
    criterio: i.criterio ? textosDeLacuna.criterios[i.criterio] : null,
  }));

  const etapas = montarPlano(rec, analise);
  return {
    resumo: {
      titulo: textosDoResumo.titulo,
      itens: montarResumo(r, resultado, cobertura, rec, analise, leituras, etapas, oportunidades, itensDeIndicacao),
    },
    lacunas: { vazio: textosDeLacuna.vazio, criterios: textosDeLacuna.criterios },
    oportunidades: {
      titulo: textosDeOportunidade.titulo,
      nota: textosDeOportunidade.nota,
      vazio: textosDeOportunidade.vazio,
      perguntas: textosDeOportunidade.perguntas,
      condicoes: textosDeOportunidade.condicoes,
      itens: oportunidades,
    },
    indicacoes: {
      titulo: textosDeIndicacao.titulo,
      nota: textosDeIndicacao.nota,
      condicoes: textosDeIndicacao.condicoes.titulo,
      semIndicacao: rec.indicacoes.length
        ? null
        : resultado.parcial || resultado.media === null
          ? textosDeIndicacao.semIndicacao.parcial
          : textosDeIndicacao.semIndicacao.manutencao,
      itens: itensDeIndicacao,
    },
    plano: { titulo: textosDoPlano.titulo, nota: textosDoPlano.nota, rotulos: textosDoPlano.rotulos, etapas },
  };
}
