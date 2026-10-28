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
  pediuContato: boolean;
}

/**
 * Lead score de 0 a 100: potencial comercial, não maturidade. Uma nota baixa no AI Score não faz um lead ruim
 * (pode ser justamente uma oportunidade de AI Champions ou Processos com IA).
 */
export function leadScore(l: DadosLead): number {
  const p = regras.leadScore;
  const total =
    p.papel[l.papel] +
    p.horizonte[l.horizonte] +
    p.porte[l.porte] +
    p.escopo[l.escopo] +
    (l.desafios > 0 ? p.temDesafio : 0) +
    (l.emailPessoal ? 0 : p.emailCorporativo) +
    (l.whatsapp ? p.whatsapp : 0) +
    (l.pediuContato ? p.pediuContato : 0);
  return Math.min(100, total);
}
