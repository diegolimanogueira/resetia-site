import { desafios, dimensoes, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DesafioId, DimensaoId, NivelId } from "@/content/types";
import { detectarAlertas, type Alerta } from "./alertas";
import { dimensoesDo, faixaDe, indiceDe, nivelDe } from "./calcular";
import { metodoAtual, type Metodo } from "./metodo";
import { regras } from "./regras";
import type { Recomendacao, Resposta, Respostas, Resultado } from "./tipos";

/**
 * Leitura detalhada do resultado para o relatório completo, por regra fixa (sem IA): próximo nível, prioridades,
 * cada resposta com o estágio de hoje e o próximo, pontos cegos, alertas (padrões entre respostas, em ./alertas),
 * simulação de evolução, plano de 90 dias e o porquê de cada solução indicada.
 */

type Prioridade = "critica" | "alta" | "media" | "baixa";

export interface Analise {
  proximoNivel: { nivel: NivelId; faltam: number } | null;
  prioridades: Array<{ dimensao: DimensaoId; nota: number; prioridade: Prioridade; desafio: boolean }>;
  respostas: Array<{ indice: number; dimensao: DimensaoId; atual: Resposta | undefined; proximo: string | null }>;
  pontosCegos: number[];
  alertas: Alerta[];
  simulacao: { alvo: number; de: number; para: number; nivel: NivelId; dimensoes: DimensaoId[] } | null;
  plano: string[][];
  porque: Record<string, { dimensoes: Array<{ id: DimensaoId; nota: number }>; desafios: DesafioId[] }>;
}

const dimensao = (id: DimensaoId) => dimensoes.find((d) => d.id === id)!;

function prioridadeDe(nota: number): Prioridade {
  const p = regras.prioridades;
  return nota < p.critica ? "critica" : nota < p.alta ? "alta" : nota < p.media ? "media" : "baixa";
}

function passoDa(id: DimensaoId, nota: number) {
  const d = dimensao(id);
  return faixaDe(nota) === "alta" ? d.passos.evoluir : d.passos.estruturar;
}

/** Simulação matemática da escala: não prevê produtividade, receita nem retorno financeiro. */
function simular(n: Record<DimensaoId, number | null>, indice: number | null, metodo: Metodo): Analise["simulacao"] {
  if (indice === null) return null;
  const ordem = dimensoesDo(metodo);
  const notas = ordem.map((id) => n[id]!);
  const alvo = regras.alvosSimulacao.find((x) => notas.some((nota) => nota < x));
  if (alvo === undefined) return null;
  const sobem = ordem.filter((id) => n[id]! < alvo);
  const para = indiceDe(
    notas.map((nota) => Math.max(nota, alvo)),
    metodo,
  );
  return { alvo, de: indice, para, nivel: nivelDe(para, metodo), dimensoes: sobem };
}

export function analisar(r: Respostas, resultado: Resultado, rec: Recomendacao, metodo: Metodo = metodoAtual): Analise {
  const n = resultado.dimensoes;
  const escolhidos = r.desafios;
  const temaDesafio = new Set(escolhidos.map((id) => desafios.find((d) => d.id === id)!.dimensao));

  // Próximo nível a partir do AI Score.
  let proximoNivel: Analise["proximoNivel"] = null;
  if (resultado.indice !== null && resultado.nivel) {
    const i = metodo.niveis.findIndex((x) => x.id === resultado.nivel);
    const prox = metodo.niveis[i + 1];
    if (prox) proximoNivel = { nivel: prox.id, faltam: prox.min - resultado.indice };
  }

  const prioridades = rec.lacunas.map((id) => ({
    dimensao: id,
    nota: n[id]!,
    prioridade: prioridadeDe(n[id]!),
    desafio: temaDesafio.has(id),
  }));

  const respostas = perguntasCentrais.map((p, i) => {
    const atual = r.centrais[i];
    const proximo = typeof atual === "number" && atual < 4 ? p.alternativas[atual + 1] : null;
    return { indice: i, dimensao: p.dimensao, atual, proximo };
  });
  const pontosCegos = respostas.filter((x) => x.atual === null).map((x) => x.indice);

  // Plano de 90 dias: ações das dimensões mais fracas, com o desafio principal logo depois da primeira,
  // sem repetir tema; duas por fase e, na última, a reavaliação.
  const acoes: Array<{ tema: DimensaoId; texto: string }> = [];
  const incluir = (tema: DimensaoId, texto: string) => {
    if (!acoes.some((a) => a.tema === tema)) acoes.push({ tema, texto });
  };
  const [primeira, ...demais] = rec.lacunas;
  if (primeira) incluir(primeira, passoDa(primeira, n[primeira]!));
  const desafio = escolhidos.map((id) => desafios.find((d) => d.id === id)!)[0];
  if (desafio) incluir(desafio.dimensao, desafio.passo);
  for (const id of demais) incluir(id, passoDa(id, n[id]!));
  const textos = acoes.map((a) => a.texto);
  const plano = [textos.slice(0, 2), textos.slice(2, 4), textos.slice(4, 5)];

  // Por que cada solução: as dimensões fracas e os desafios que levaram a ela.
  const porque: Analise["porque"] = {};
  for (const slug of rec.solucoes)
    porque[slug] = {
      dimensoes: rec.lacunas
        .slice(0, regras.pesosLacunas.length)
        .filter((id) => regras.dimensaoSolucao[id] === slug)
        .map((id) => ({ id, nota: n[id]! })),
      desafios: escolhidos.filter((d) => (regras.desafioSolucoes[d] as readonly string[]).includes(slug)),
    };

  return {
    proximoNivel,
    prioridades,
    respostas,
    pontosCegos,
    alertas: detectarAlertas(r.centrais, resultado, metodo),
    simulacao: simular(n, resultado.indice, metodo),
    plano,
    porque,
  };
}
