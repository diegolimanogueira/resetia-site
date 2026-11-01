import { afirmaDoPadrao, leitura, type PadraoLeitura } from "@/content/ai-score-analise";
import { perguntasCentrais } from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import { dimensoesDo } from "./calcular";
import { daResposta, type Afirmacao } from "./evidencia";
import { metodoAtual, type Metodo } from "./metodo";
import type { Slot } from "./tipos";

/**
 * Leitura de cada dimensão a partir das DUAS respostas, não da média. A média misturava situações diferentes
 * (um 2 com um 0 dá a mesma média que dois 1) e escolhia um texto categórico que podia negar o que a pessoa
 * tinha respondido. Aqui a leitura:
 *  1. reconhece o que foi declarado (a alternativa escolhida, literal);
 *  2. classifica a relação entre as duas respostas (alinhadas ou uma bem à frente da outra);
 *  3. propõe o próximo estágio do tema mais baixo, citando a alternativa seguinte;
 *  4. quando falta uma resposta ("Não sei"), diz que a leitura se apoia em uma só e propõe uma pergunta de validação.
 */

export type Visao = "empresa" | "area";
type Padrao = PadraoLeitura | "incompleto" | "sem-dados";

export interface LeituraDaDimensao {
  dimensao: DimensaoId;
  padrao: Padrao;
  afirmacoes: Afirmacao[];
}

/**
 * Relação entre as duas respostas (níveis 0 a 4). "À frente" exige duas ou mais posições de diferença; abaixo
 * disso as respostas contam como alinhadas, e a posição delas na escala dá o estágio.
 */
export function padraoDe(a: number, b: number): PadraoLeitura {
  if (a - b >= 2) return "primeira-a-frente";
  if (b - a >= 2) return "segunda-a-frente";
  if (Math.max(a, b) <= 1) return "alinhado-inicial";
  if (Math.min(a, b) >= 3) return "alinhado-avancado";
  return "alinhado-intermediario";
}

const valida = (s: Slot): s is 0 | 1 | 2 | 3 | 4 => typeof s === "number";

export function leituraDaDimensao(
  dimensao: DimensaoId,
  centrais: readonly Slot[],
  visao: Visao = "empresa",
  metodo: Metodo = metodoAtual,
): LeituraDaDimensao {
  const [i1, i2] = metodo.dimensaoDaPergunta.flatMap((d, i) => (d === dimensao ? [i] : []));
  const q = [perguntasCentrais[i1], perguntasCentrais[i2]] as const;
  const s = [centrais[i1], centrais[i2]] as const;
  const { primeira, segunda } = leitura.papeis[dimensao];
  const tema = [primeira.nome, segunda.nome] as const;
  const id = (parte: string) => `leitura.${dimensao}.${parte}`;
  const afirmacoes: Afirmacao[] = [];

  // 1. O que foi declarado: a alternativa escolhida, literal.
  ([0, 1] as const).forEach((k) => {
    const nivel = s[k];
    if (!valida(nivel)) return;
    afirmacoes.push({
      id: id(`declarado.${q[k].id}`),
      natureza: "declarado",
      texto: q[k].alternativas[nivel],
      evidencias: [daResposta(q[k].id, nivel)],
      afirma: { [q[k].id]: [nivel] },
    });
  });

  const [a, b] = s;
  if (valida(a) && valida(b)) {
    // 2. Relação entre as duas respostas.
    const padrao = padraoDe(a, b);
    const [afirmaA, afirmaB] = afirmaDoPadrao[padrao];
    afirmacoes.push({
      id: id("padrao"),
      natureza: "derivado",
      texto: leitura.padrao(padrao, dimensao),
      evidencias: [daResposta(q[0].id, a), daResposta(q[1].id, b)],
      afirma: { [q[0].id]: afirmaA, [q[1].id]: afirmaB },
    });
    if (padrao === "primeira-a-frente" || padrao === "segunda-a-frente") {
      const baixa = padrao === "primeira-a-frente" ? 1 : 0;
      afirmacoes.push({
        id: id("divergencia"),
        natureza: "validar",
        texto: leitura.divergente,
        evidencias: [daResposta(q[0].id, a), daResposta(q[1].id, b)],
        pergunta: q[baixa].texto[visao],
      });
    }
    // 3. Próximo estágio do tema mais baixo (os dois, em caso de empate).
    const menor = Math.min(a, b);
    if (menor === 4) {
      afirmacoes.push({
        id: id("estagio-mais-alto"),
        natureza: "derivado",
        texto: leitura.estagioMaisAlto(),
        evidencias: [daResposta(q[0].id, a), daResposta(q[1].id, b)],
      });
    } else {
      ([0, 1] as const).forEach((k) => {
        const nivel = s[k] as number;
        if (nivel !== menor) return;
        afirmacoes.push({
          id: id(`proximo.${q[k].id}`),
          natureza: "derivado",
          texto: leitura.proximo(tema[k], q[k].alternativas[nivel + 1]),
          evidencias: [daResposta(q[k].id, nivel as 0 | 1 | 2 | 3)],
          afirma: { [q[k].id]: [nivel] },
        });
      });
    }
    return { dimensao, padrao, afirmacoes };
  }

  if (!valida(a) && !valida(b)) {
    afirmacoes.push({
      id: id("sem-dados"),
      natureza: "validar",
      texto: leitura.semDados,
      evidencias: ([0, 1] as const).filter((k) => s[k] === null).map((k) => daResposta(q[k].id, null)),
      pergunta: q[0].texto[visao],
    });
    return { dimensao, padrao: "sem-dados", afirmacoes };
  }

  // Uma resposta válida e uma sem resposta: a leitura se apoia em uma só.
  const k = valida(a) ? 0 : 1;
  const faltou = 1 - k;
  const nivel = s[k] as 0 | 1 | 2 | 3 | 4;
  afirmacoes.push({
    id: id(`validar.${q[faltou].id}`),
    natureza: "validar",
    texto: leitura.umaResposta(tema[faltou]),
    evidencias: [daResposta(q[faltou].id, null)],
    pergunta: q[faltou].texto[visao],
  });
  afirmacoes.push(
    nivel === 4
      ? {
          id: id("estagio-mais-alto"),
          natureza: "derivado",
          texto: leitura.estagioMaisAlto(tema[k]),
          evidencias: [daResposta(q[k].id, nivel)],
        }
      : {
          id: id(`proximo.${q[k].id}`),
          natureza: "derivado",
          texto: leitura.proximo(tema[k], q[k].alternativas[nivel + 1]),
          evidencias: [daResposta(q[k].id, nivel)],
          afirma: { [q[k].id]: [nivel] },
        },
  );
  return { dimensao, padrao: "incompleto", afirmacoes };
}

/** Leitura das seis dimensões. */
export function leituras(
  centrais: readonly Slot[],
  visao: Visao = "empresa",
  metodo: Metodo = metodoAtual,
): Record<DimensaoId, LeituraDaDimensao> {
  return Object.fromEntries(
    dimensoesDo(metodo).map((d) => [d, leituraDaDimensao(d, centrais, visao, metodo)]),
  ) as Record<DimensaoId, LeituraDaDimensao>;
}
