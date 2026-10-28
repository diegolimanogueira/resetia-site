import { ambiente } from "@/lib/supabase";
import { lerOrigem } from "./navegador";
import type { RespostasCompletas, Resultado } from "./tipos";

/**
 * Linhas gravadas no Supabase (tabelas `avaliacoes` e `leads`, ver supabase/migrations).
 * As notas vão junto para análises em SQL; o admin recalcula tudo a partir de `codigo` com as regras atuais.
 */

export function linhaAvaliacao(r: RespostasCompletas & { id: string }, resultado: Resultado, codigo: string) {
  return {
    id: r.id,
    escopo: r.escopo,
    papel: r.papel,
    porte: r.porte,
    segmento: r.segmento,
    respostas: { centrais: r.centrais, areas: r.porArea },
    desafios: r.desafios,
    horizonte: r.horizonte,
    indice: resultado.indice,
    nivel: resultado.nivel,
    parcial: resultado.parcial,
    dimensoes: resultado.dimensoes,
    areas: resultado.areas,
    codigo,
    versao: "1",
    origem: lerOrigem(),
    ambiente,
  };
}

export interface DadosContato {
  nome: string;
  email: string;
  /** Vazia na etapa 1 (só nome e e-mail); vem na etapa 2, pela função completar_lead. */
  empresa: string | null;
  whatsapp: string | null;
  emailPessoal: boolean;
  pediuContato: boolean;
  marketing: boolean;
}

export function linhaLead(id: string, avaliacaoId: string, c: DadosContato) {
  return {
    id,
    avaliacao_id: avaliacaoId,
    nome: c.nome,
    email: c.email,
    email_pessoal: c.emailPessoal,
    empresa: c.empresa,
    whatsapp: c.whatsapp,
    pediu_contato: c.pediuContato,
    consentimento_marketing: c.marketing,
    ambiente,
  };
}
