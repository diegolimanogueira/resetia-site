import { desafios, dimensoes, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DesafioId, DimensaoId } from "@/content/types";
import { regras } from "./regras";
import type {
  Apoio,
  Condicao,
  CriterioDeDesempate,
  Indicacao,
  LeituraDoDesafio,
  Recomendacao,
  Resultado,
  Slot,
} from "./tipos";

/**
 * Prioridades e indicações por regra fixa (sem IA). A menor nota identifica uma fragilidade, mas não escolhe um
 * projeto: aqui só dimensões abaixo do limite são lacunas (com tudo alto não há lacuna), um desafio declarado só pesa
 * se as respostas não o contradizem, e uma solução só é indicada com evidência direta e condições atendidas; sem isso
 * ela sai "a investigar". Empates se decidem por critério substantivo, e o critério fica registrado; a posição no
 * array nunca desempata. Pode não haver solução nenhuma.
 */

const dependencia = (id: DimensaoId) => regras.ordemDependencia.indexOf(id);
const SEM_RESPOSTA = 5;

/** A menor resposta válida (0 a 4) entre as perguntas da dimensão; 5 se nenhuma foi respondida. */
function menorResposta(id: DimensaoId, centrais: readonly Slot[]) {
  const validas = perguntasCentrais
    .map((p, i) => (p.dimensao === id ? centrais[i] : undefined))
    .filter((v): v is 0 | 1 | 2 | 3 | 4 => typeof v === "number");
  return validas.length ? Math.min(...validas) : SEM_RESPOSTA;
}

interface Medidas {
  nota: number;
  desafio: 0 | 1;
  resposta: number;
  dependencia: number;
}

const CRITERIOS_DA_LACUNA: Array<[keyof Medidas, CriterioDeDesempate | null]> = [
  ["nota", null],
  ["desafio", "desafio"],
  ["resposta", "resposta-mais-baixa"],
  ["dependencia", "dependencia"],
];

/** Ordena lacunas: nota, depois desafio declarado, depois a menor resposta, por fim a ordem de dependência. */
export function ordenarLacunas(
  ids: readonly DimensaoId[],
  medidas: (id: DimensaoId) => Medidas,
): { ordem: DimensaoId[]; desempate: Partial<Record<DimensaoId, CriterioDeDesempate>> } {
  const m = new Map(ids.map((id) => [id, medidas(id)]));
  const ordem = [...ids].sort((a, b) => {
    for (const [chave] of CRITERIOS_DA_LACUNA) {
      const d = m.get(a)![chave] - m.get(b)![chave];
      if (d !== 0) return d;
    }
    return 0;
  });
  const desempate: Partial<Record<DimensaoId, CriterioDeDesempate>> = {};
  for (let i = 0; i + 1 < ordem.length; i++) {
    const [a, b] = [m.get(ordem[i])!, m.get(ordem[i + 1])!];
    if (a.nota !== b.nota) continue;
    const decidiu = CRITERIOS_DA_LACUNA.find(([chave]) => chave !== "nota" && a[chave] !== b[chave])?.[1];
    if (!decidiu) continue;
    desempate[ordem[i]] ??= decidiu;
    desempate[ordem[i + 1]] ??= decidiu;
  }
  return { ordem, desempate };
}

export function condicoesDe(slug: string, centrais: readonly Slot[]): Condicao[] {
  const exigidas: ReadonlyArray<{ ref: string; minimo: number }> =
    (regras.prontidao as Record<string, Array<{ ref: string; minimo: number }>>)[slug] ?? [];
  return exigidas.map(({ ref, minimo }) => {
    const valor = centrais[perguntasCentrais.findIndex((p) => p.id === ref)];
    return {
      ref,
      minimo,
      situacao: typeof valor === "number" ? (valor >= minimo ? "atendida" : "pendente") : "sem-resposta",
    };
  });
}

export function recomendar(
  resultado: Resultado,
  escolhidos: readonly DesafioId[],
  centrais: readonly Slot[] = [],
): Recomendacao {
  const comNota = dimensoes.map((d) => d.id).filter((id) => resultado.dimensoes[id] !== null);
  const nota = (id: DimensaoId) => resultado.dimensoes[id]!;
  const temaDoDesafio = new Set(escolhidos.map((id) => desafios.find((d) => d.id === id)!.dimensao));

  // Lacunas: só o que está abaixo do limite.
  const { ordem: lacunas, desempate } = ordenarLacunas(
    comNota.filter((id) => nota(id) < regras.lacunaAbaixoDe),
    (id) => ({
      nota: nota(id),
      desafio: temaDoDesafio.has(id) ? 0 : 1,
      resposta: menorResposta(id, centrais),
      dependencia: dependencia(id),
    }),
  );

  // Ponto forte: a maior nota, se chega ao mínimo e se destaca; empatadas, todas contam.
  const maior = comNota.length ? Math.max(...comNota.map(nota)) : null;
  const menor = comNota.length ? Math.min(...comNota.map(nota)) : null;
  const fortes =
    maior !== null && menor !== null && maior >= regras.forteMinimo && maior > menor
      ? comNota.filter((id) => nota(id) === maior).sort((a, b) => dependencia(a) - dependencia(b))
      : [];

  // Cada desafio frente às respostas da dimensão dele.
  const leituraDosDesafios: LeituraDoDesafio[] = escolhidos.map((id) => {
    const dimensao = desafios.find((d) => d.id === id)!.dimensao;
    const n = resultado.dimensoes[dimensao];
    return {
      id,
      dimensao,
      nota: n,
      situacao: n === null ? "sem-resposta" : n < regras.lacunaAbaixoDe ? "sustentado" : "contradiz",
    };
  });
  const compativel = (id: DesafioId) => leituraDosDesafios.find((d) => d.id === id)!.situacao !== "contradiz";

  return {
    forte: fortes[0] ?? null,
    fortes,
    lacunas,
    desempate,
    ...indicar(resultado, lacunas, escolhidos.filter(compativel), centrais),
    desafios: leituraDosDesafios,
  };
}

interface Candidata {
  slug: string;
  pontos: number;
  apoios: Apoio[];
  diretas: number;
  dimensoes: DimensaoId[];
}

function indicar(
  resultado: Resultado,
  lacunas: DimensaoId[],
  desafiosCompativeis: readonly DesafioId[],
  centrais: readonly Slot[],
): Pick<Recomendacao, "indicacoes" | "solucoes"> {
  // Sem nota consolidada, não há base para indicar uma solução.
  if (resultado.parcial || resultado.media === null) return { indicacoes: [], solucoes: [] };
  const nota = (id: DimensaoId) => resultado.dimensoes[id]!;
  const candidatas = new Map<string, Candidata>();
  const candidata = (slug: string) => {
    if (!candidatas.has(slug)) candidatas.set(slug, { slug, pontos: 0, apoios: [], diretas: 0, dimensoes: [] });
    return candidatas.get(slug)!;
  };
  const direta = (slug: string) =>
    (regras.evidenciaDireta as Record<string, { dimensoes: DimensaoId[]; desafios: DesafioId[] }>)[slug];

  // A prioridade de uma solução é a da dimensão mais frágil que aponta para ela (somar faria uma solução com duas
  // dimensões ultrapassar a que cobre a mais fraca de todas). Lacunas empatadas dividem a posição da primeira do grupo.
  lacunas.forEach((id) => {
    const inicioDoGrupo = lacunas.findIndex((x) => nota(x) === nota(id));
    const peso = regras.pesosLacunas[inicioDoGrupo] ?? 0;
    const c = candidata(regras.dimensaoSolucao[id]);
    c.dimensoes.push(id);
    if (peso === 0) return;
    c.pontos = Math.max(c.pontos, peso);
    c.apoios.push({ tipo: "dimensao", id, nota: nota(id) });
    if (direta(c.slug).dimensoes.includes(id)) c.diretas += 1;
  });
  // Dimensões que só entram para registrar a evidência (sem peso) não criam candidata sozinhas.
  for (const [slug, c] of candidatas) if (c.pontos === 0) candidatas.delete(slug);

  for (const d of desafiosCompativeis)
    for (const slug of regras.desafioSolucoes[d]) {
      const c = candidata(slug);
      c.pontos += regras.pesoDesafio;
      c.apoios.push({ tipo: "desafio", id: d });
      if (direta(slug).desafios.includes(d)) c.diretas += 1;
    }

  const medidas = (c: Candidata) => ({
    forca: 0,
    pontos: -c.pontos,
    diretas: -c.diretas,
    resposta: c.dimensoes.length ? Math.min(...c.dimensoes.map((id) => menorResposta(id, centrais))) : SEM_RESPOSTA,
    dependencia: c.dimensoes.length ? Math.min(...c.dimensoes.map((id) => regras.ordemDependencia.indexOf(id))) : 99,
  });
  const montadas = [...candidatas.values()].map((c) => {
    const condicoes = condicoesDe(c.slug, centrais);
    const indicada = c.diretas > 0 && condicoes.every((x) => x.situacao === "atendida");
    return { c, condicoes, indicada, m: { ...medidas(c), forca: indicada ? 0 : 1 } };
  });
  const chaves = ["forca", "pontos", "diretas", "resposta", "dependencia"] as const;
  const criterios: Record<(typeof chaves)[number], CriterioDeDesempate | null> = {
    forca: null,
    pontos: null,
    diretas: "evidencia-direta",
    resposta: "resposta-mais-baixa",
    dependencia: "dependencia",
  };
  montadas.sort((a, b) => {
    for (const k of chaves) {
      const d = a.m[k] - b.m[k];
      if (d !== 0) return d;
    }
    return 0;
  });

  const indicacoes: Indicacao[] = montadas.slice(0, regras.maxSolucoes).map((x, i) => {
    // O critério fica registrado quando a posição foi decidida contra uma vizinha com a mesma força e os mesmos pontos.
    const vizinhas = [montadas[i - 1], montadas[i + 1]].filter(Boolean);
    let criterio: CriterioDeDesempate | undefined;
    for (const v of vizinhas) {
      if (v.m.forca !== x.m.forca || v.m.pontos !== x.m.pontos) continue;
      const decidiu = chaves.slice(2).find((k) => v.m[k] !== x.m[k]);
      if (decidiu) criterio ??= criterios[decidiu] ?? undefined;
    }
    return {
      slug: x.c.slug,
      forca: x.indicada ? "indicada" : "investigar",
      apoios: x.c.apoios,
      direta: x.c.diretas > 0,
      condicoes: x.condicoes,
      ...(criterio ? { criterio } : {}),
    };
  });
  return { indicacoes, solucoes: indicacoes.map((x) => x.slug) };
}
