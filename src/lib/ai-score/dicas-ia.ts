import {
  desafios,
  dimensoes,
  horizontes,
  perguntasCentrais,
  questionario,
  segmentacao,
} from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import { alvosDasDicas } from "./dicas";
import type { RespostasCompletas, Resultado } from "./tipos";

/**
 * Geração das dicas por IA (só na função supabase/functions/ai-score): os fatos que vão para os agentes escritor e
 * revisor, o esquema da resposta e o validador determinístico que limpa o que eles devolvem.
 */

const MAX_DICAS = 3;

const rotulo = <T extends string>(lista: ReadonlyArray<{ id: T; label: string }>, id: T) =>
  lista.find((o) => o.id === id)?.label ?? id;

/** Fatos estruturados para os agentes: só alternativas, notas e rótulos do próprio conteúdo. Nada digitado. */
export function fatosParaDicas(r: RespostasCompletas, resultado: Resultado, alvos = alvosDasDicas(resultado)) {
  const area = r.escopo !== "empresa";
  return {
    contexto: {
      visao: rotulo(segmentacao.escopo.opcoes, r.escopo),
      porte: rotulo(segmentacao.porte.opcoes, r.porte),
      segmento: rotulo(segmentacao.segmento.opcoes, r.segmento),
      prazo: rotulo(horizontes.opcoes, r.horizonte),
      desafios: r.desafios.map((id) => rotulo(desafios, id)),
    },
    dimensoes: alvos.map((id) => ({
      id,
      nome: dimensoes.find((d) => d.id === id)!.nome,
      nota: Math.round(resultado.dimensoes[id] ?? 0),
      respostas: perguntasCentrais
        .map((p, i) => ({ p, atual: r.centrais[i] }))
        .filter(({ p }) => p.dimensao === id)
        .map(({ p, atual }) => ({
          pergunta: area ? p.texto.area : p.texto.empresa,
          hoje: atual === null || atual === undefined ? questionario.naoSei : p.alternativas[atual],
          proximo_estagio: typeof atual === "number" && atual < 4 ? p.alternativas[atual + 1] : null,
        })),
    })),
  };
}

/** Esquema JSON da resposta dos dois agentes (saída estruturada). */
export function esquemaDicas(alvos: DimensaoId[]) {
  return {
    type: "object",
    properties: {
      dimensoes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", enum: alvos },
            dicas: { type: "array", items: { type: "string" } },
          },
          required: ["id", "dicas"],
          additionalProperties: false,
        },
      },
    },
    required: ["dimensoes"],
    additionalProperties: false,
  };
}

/** Palavras que denunciam dado inventado, marca ou promessa: a dica é descartada. */
const PROIBIDAS = [
  /\d/,
  /%/,
  /R\$/i,
  /https?:|www\./i,
  /\b(garant\w*|com certeza|sem riscos?|imediatament\w*)\b/i,
  /\b(chat\s?gpt|openai|gpt|gemini|copilot|claude|anthropic|llama|mistral|deepseek|perplexity)\b/i,
  /\b(microsoft|google|amazon|aws|meta|notion|zapier|n8n|make\.com|salesforce|hubspot|rd station|pipedrive|power bi)\b/i,
  /\breset\s?ia\b/i,
  /\b(estudos?|pesquisas?) (mostram|apontam|indicam)\b/i,
];

const LGPD = /\blgpd\b/i;

function dicaValida(texto: string, id: DimensaoId) {
  if (texto.length < 20 || texto.length > 260) return false;
  if (/[\n\r•]/.test(texto) || /^[-*]/.test(texto)) return false;
  if (LGPD.test(texto) && id !== "governanca") return false;
  return !PROIBIDAS.some((p) => p.test(texto));
}

/** Limpa a resposta dos agentes: só dimensões pedidas, só dicas que passam nas regras, sem repetição, no máximo três. */
export function validarDicas(bruto: unknown, alvos: DimensaoId[]): Partial<Record<DimensaoId, string[]>> {
  const saida: Partial<Record<DimensaoId, string[]>> = {};
  const lista = (bruto as { dimensoes?: unknown })?.dimensoes;
  if (!Array.isArray(lista)) return saida;
  for (const item of lista) {
    const id = (item as { id?: unknown })?.id;
    const dicas = (item as { dicas?: unknown })?.dicas;
    if (typeof id !== "string" || !alvos.includes(id as DimensaoId) || !Array.isArray(dicas)) continue;
    const vistas = new Set<string>();
    const limpas = dicas
      .filter((d): d is string => typeof d === "string")
      .map((d) => d.trim().replace(/\s+/g, " "))
      .filter((d) => dicaValida(d, id as DimensaoId))
      .filter((d) => !vistas.has(d.toLowerCase()) && vistas.add(d.toLowerCase()));
    saida[id as DimensaoId] = [...(saida[id as DimensaoId] ?? []), ...limpas].slice(0, MAX_DICAS);
  }
  return saida;
}
