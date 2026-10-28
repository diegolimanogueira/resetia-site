import { admin } from "@/content/admin";
import { desafios, dimensoes, horizontes, modulosArea, niveis, segmentacao } from "@/content/ai-score-questionario";
import type { Escopo, NivelId, StatusLead } from "@/content/types";
import type { AvaliacaoLinha, LeadLinha } from "@/lib/supabase-admin";
import { calcular, formatarNota } from "./calcular";
import { decodificar } from "./codificar";
import { paraCsv } from "./csv";
import { leadScore } from "./lead-score";
import { recomendar } from "./recomendar";
import type { Respostas, Resultado } from "./tipos";

/**
 * Visão do admin: cada lead com a avaliação dele, o resultado recalculado a partir do código (regras atuais),
 * as soluções indicadas e o lead score. Filtros, ordenação, resumo e CSV são funções puras.
 */

export interface LeadVisao {
  lead: LeadLinha;
  avaliacao: AvaliacaoLinha;
  respostas: Respostas | null;
  resultado: Resultado | null;
  solucoes: string[];
  leadScore: number;
}

export function montarLeads(avaliacoes: AvaliacaoLinha[]): LeadVisao[] {
  return avaliacoes.flatMap((a) => {
    const respostas = decodificar(a.codigo);
    const resultado = respostas ? calcular(respostas) : null;
    const solucoes = respostas && resultado ? recomendar(resultado, respostas.desafios).solucoes : [];
    return (a.leads ?? []).map((lead) => ({
      lead,
      avaliacao: a,
      respostas,
      resultado,
      solucoes,
      leadScore: leadScore({
        papel: a.papel,
        porte: a.porte,
        horizonte: a.horizonte,
        escopo: a.escopo,
        desafios: respostas?.desafios.length ?? 0,
        emailPessoal: lead.email_pessoal,
        whatsapp: Boolean(lead.whatsapp),
        relatorioCompleto: Boolean(lead.empresa),
        pediuContato: lead.pediu_contato,
      }),
    }));
  });
}

export interface Filtros {
  busca: string;
  status: StatusLead | "";
  escopo: Escopo | "";
  nivel: NivelId | "parcial" | "";
  ambiente: string;
  ordem: "recentes" | "leadScore" | "aiScore";
}

export const filtrosIniciais: Filtros = {
  busca: "",
  status: "",
  escopo: "",
  nivel: "",
  ambiente: "producao",
  ordem: "recentes",
};

const normal = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filtrarLeads(leads: LeadVisao[], f: Filtros): LeadVisao[] {
  const busca = normal(f.busca.trim());
  return leads
    .filter(
      (l) =>
        (!f.ambiente || l.lead.ambiente === f.ambiente) &&
        (!f.status || l.lead.status === f.status) &&
        (!f.escopo || l.avaliacao.escopo === f.escopo) &&
        (!f.nivel || (f.nivel === "parcial" ? !l.resultado?.nivel : l.resultado?.nivel === f.nivel)) &&
        (!busca || normal(`${l.lead.nome} ${l.lead.email} ${l.lead.empresa ?? ""}`).includes(busca)),
    )
    .sort((a, b) =>
      f.ordem === "leadScore"
        ? b.leadScore - a.leadScore
        : f.ordem === "aiScore"
          ? (b.resultado?.indice ?? -1) - (a.resultado?.indice ?? -1)
          : b.lead.criado_em.localeCompare(a.lead.criado_em),
    );
}

export function resumir(avaliacoes: AvaliacaoLinha[], ambiente: string) {
  const doAmbiente = avaliacoes.filter((a) => !ambiente || a.ambiente === ambiente);
  const leads = doAmbiente.flatMap((a) => a.leads ?? []);
  return {
    avaliacoes: doAmbiente.length,
    leads: leads.length,
    semLead: doAmbiente.filter((a) => !a.leads?.length).length,
    pediram: leads.filter((l) => l.pediu_contato).length,
    ultima: doAmbiente[0]?.criada_em ?? null,
  };
}

const rotulo = <T extends string>(lista: ReadonlyArray<{ id: T; label: string }>, id: T | undefined) =>
  lista.find((o) => o.id === id)?.label ?? id ?? "";

export const rotulos = {
  papel: (id: string) => rotulo(segmentacao.papel.opcoes, id as never),
  porte: (id: string) => rotulo(segmentacao.porte.opcoes, id as never),
  segmento: (id: string) => rotulo(segmentacao.segmento.opcoes, id as never),
  escopo: (id: string) => rotulo(segmentacao.escopo.opcoes, id as never),
  horizonte: (id: string) => rotulo(horizontes.opcoes, id as never),
  desafio: (id: string) => rotulo(desafios, id as never),
  nivel: (id: string | null) => niveis.find((n) => n.id === id)?.nome ?? admin.parcial,
  area: (id: string) => modulosArea.find((m) => m.area === id)?.nome ?? id,
};

export const dataBr = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

export function csvLeads(leads: LeadVisao[], solucaoNome: (slug: string) => string): string {
  const c = admin.csv;
  const cabecalho = [
    c.data,
    c.nome,
    c.email,
    c.emailPessoal,
    c.empresa,
    c.whatsapp,
    c.papel,
    c.porte,
    c.segmento,
    c.visao,
    c.aiScore,
    c.nivel,
    ...dimensoes.map((d) => d.nome),
    c.areas,
    c.desafios,
    c.horizonte,
    c.solucoes,
    c.leadScore,
    c.status,
    c.pediuContato,
    c.marketing,
    c.ambiente,
    "utm_source",
    "utm_medium",
    "utm_campaign",
    c.notas,
  ];
  const linhas = leads.map(({ lead: l, avaliacao: a, resultado, respostas, solucoes, leadScore: ls }) => [
    dataBr(l.criado_em),
    l.nome,
    l.email,
    l.email_pessoal,
    l.empresa,
    l.whatsapp,
    rotulos.papel(a.papel),
    rotulos.porte(a.porte),
    rotulos.segmento(a.segmento),
    rotulos.escopo(a.escopo),
    resultado?.indice ?? null,
    rotulos.nivel(resultado?.nivel ?? null),
    ...dimensoes.map((d) => {
      const n = resultado?.dimensoes[d.id];
      return n === null || n === undefined ? "" : formatarNota(n);
    }),
    Object.entries(resultado?.areas ?? {})
      .map(([area, n]) => `${rotulos.area(area)} ${n === null || n === undefined ? "-" : formatarNota(n)}`)
      .join(" | "),
    (respostas?.desafios ?? []).map(rotulos.desafio).join(" | "),
    rotulos.horizonte(a.horizonte),
    solucoes.map(solucaoNome).join(" | "),
    ls,
    admin.status[l.status],
    l.pediu_contato,
    l.consentimento_marketing,
    l.ambiente,
    a.origem?.utm_source,
    a.origem?.utm_medium,
    a.origem?.utm_campaign,
    l.notas,
  ]);
  return paraCsv(cabecalho, linhas);
}
