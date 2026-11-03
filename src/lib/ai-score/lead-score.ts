import type { Escopo, HorizonteId, PapelId, PorteId } from "@/content/types";
import { regras } from "./regras";

export interface DadosLead {
  papel: PapelId;
  porte: PorteId;
  horizonte: HorizonteId;
  escopo: Escopo;
  desafios: number;
  emailPessoal: boolean;
  whatsapp: boolean;
  relatorioCompleto: boolean;
  pediuContato: boolean;
  /** Há alguma solução com evidência direta e condições atendidas (não só "a investigar")? */
  solucaoIndicada: boolean;
  /** Até onde o aprofundamento foi: 0 (não respondeu), 1 ou 2. */
  aprofundamento: 0 | 1 | 2;
}

interface Item {
  id: string;
  pontos: number;
  maximo: number;
}

export interface Pontuacao {
  pontos: number;
  maximo: number;
  itens: Item[];
}

export interface Pontuacoes {
  /** Quem é e onde trabalha: está no perfil que a Reset atende? Não prova orçamento nem autoridade. */
  aderencia: Pontuacao;
  /** O que a pessoa fez e pediu: quer conversar? */
  intencao: Pontuacao;
  /** O que já existe de concreto para conversar: desafio, solução com evidência, dor aprofundada. */
  oportunidade: Pontuacao;
}

const soma = (itens: Item[]): Pontuacao => ({
  itens,
  pontos: itens.reduce((t, i) => t + i.pontos, 0),
  maximo: itens.reduce((t, i) => t + i.maximo, 0),
});
const maiorDe = (m: Record<string, number>) => Math.max(...Object.values(m));

/**
 * Três pontuações separadas, cada uma com os componentes e o máximo possível. Não há nota única: uma soma esconderia
 * se o lead é bom pelo perfil, pelo pedido ou pelo que já se sabe da dor. Nenhuma tem a ver com a maturidade (uma
 * nota baixa no AI Score pode ser justamente uma oportunidade).
 */
export function pontuacoes(l: DadosLead): Pontuacoes {
  const a = regras.leadScore.aderencia;
  const i = regras.leadScore.intencao;
  const o = regras.leadScore.oportunidade;
  return {
    aderencia: soma([
      { id: "papel", pontos: a.papel[l.papel], maximo: maiorDe(a.papel) },
      { id: "porte", pontos: a.porte[l.porte], maximo: maiorDe(a.porte) },
      { id: "escopo", pontos: a.escopo[l.escopo], maximo: maiorDe(a.escopo) },
      { id: "emailCorporativo", pontos: l.emailPessoal ? 0 : a.emailCorporativo, maximo: a.emailCorporativo },
    ]),
    intencao: soma([
      { id: "horizonte", pontos: i.horizonte[l.horizonte], maximo: maiorDe(i.horizonte) },
      { id: "pediuContato", pontos: l.pediuContato ? i.pediuContato : 0, maximo: i.pediuContato },
      { id: "whatsapp", pontos: l.whatsapp ? i.whatsapp : 0, maximo: i.whatsapp },
      { id: "relatorioCompleto", pontos: l.relatorioCompleto ? i.relatorioCompleto : 0, maximo: i.relatorioCompleto },
    ]),
    oportunidade: soma([
      { id: "desafio", pontos: l.desafios > 0 ? o.desafio : 0, maximo: o.desafio },
      { id: "solucaoIndicada", pontos: l.solucaoIndicada ? o.solucaoIndicada : 0, maximo: o.solucaoIndicada },
      {
        id: "aprofundamentoCamada1",
        pontos: l.aprofundamento >= 1 ? o.aprofundamentoCamada1 : 0,
        maximo: o.aprofundamentoCamada1,
      },
      {
        id: "aprofundamentoCamada2",
        pontos: l.aprofundamento >= 2 ? o.aprofundamentoCamada2 : 0,
        maximo: o.aprofundamentoCamada2,
      },
    ]),
  };
}
