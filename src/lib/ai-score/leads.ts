import { admin } from "@/content/admin";
import { desafios, dimensoes, horizontes, modulosArea, niveis, segmentacao } from "@/content/ai-score-questionario";
import type { Escopo, NivelId, StatusLead } from "@/content/types";
import type { AprofundamentoLinha, AvaliacaoLinha, ContatoPermitido, LeadLinha } from "@/lib/supabase-admin";
import { calcular, formatarNota } from "./calcular";
import { decodificar } from "./codificar";
import { paraCsv } from "./csv";
import { pontuacoes, type Pontuacoes } from "./lead-score";
import { validarAprofundamento, type Aprofundamento } from "./aprofundamento";
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
  /** Aderência ao perfil, intenção de conversar e oportunidade investigada, separadas e com os componentes. */
  pontuacoes: Pontuacoes;
  /** O aprofundamento que a pessoa respondeu, validado (nulo se não respondeu). */
  aprofundamento: Aprofundamento | null;
}

/** Uma linha do banco (colunas em snake_case) no formato do aprofundamento, validado: o que não passa vira nulo. */
export function aprofundamentoDaLinha(l: AprofundamentoLinha): Aprofundamento | null {
  const v = validarAprofundamento({
    area: l.area,
    camada: l.camada,
    revisao: l.revisao,
    rotina: l.rotina ?? undefined,
    rotinaOutra: l.rotina_outra ?? undefined,
    volume: l.volume === null ? undefined : Number(l.volume),
    unidade: l.unidade ?? undefined,
    periodo: l.periodo ?? undefined,
    consequencia: l.consequencia ?? undefined,
    consequenciaOutra: l.consequencia_outra ?? undefined,
    minutos: l.minutos === null ? undefined : Number(l.minutos),
    ferramentas: l.ferramentas,
    dados: l.dados ?? undefined,
    indicador: l.indicador ?? undefined,
    papelDecisor: l.papel_decisor ?? undefined,
    naoSei: l.nao_sei,
  });
  return v.ok ? v.valor : null;
}

export function montarLeads(
  avaliacoes: AvaliacaoLinha[],
  aprofundamentos: ReadonlyMap<string, Aprofundamento> = new Map(),
  contatos: ReadonlyMap<string, ContatoPermitido> = new Map(),
): LeadVisao[] {
  return avaliacoes.flatMap((a) => {
    const respostas = decodificar(a.codigo);
    const resultado = respostas ? calcular(respostas) : null;
    const rec = respostas && resultado ? recomendar(resultado, respostas.desafios, respostas.centrais) : null;
    return (a.leads ?? []).map((lead) => {
      const aprofundamento = aprofundamentos.get(lead.id) ?? null;
      return {
        lead,
        avaliacao: a,
        respostas,
        resultado,
        solucoes: rec?.solucoes ?? [],
        aprofundamento,
        pontuacoes: pontuacoes({
          papel: a.papel,
          porte: a.porte,
          horizonte: a.horizonte,
          escopo: a.escopo,
          desafios: respostas?.desafios.length ?? 0,
          emailPessoal: lead.email_pessoal,
          whatsapp: contatos.get(lead.id)?.tem_numero === true,
          relatorioCompleto: Boolean(lead.empresa),
          pediuContato: lead.pediu_contato,
          solucaoIndicada: rec?.indicacoes.some((i) => i.forca === "indicada") ?? false,
          aprofundamento: aprofundamento?.camada ?? 0,
        }),
      };
    });
  });
}

export interface Filtros {
  busca: string;
  status: StatusLead | "";
  escopo: Escopo | "";
  nivel: NivelId | "parcial" | "";
  ambiente: string;
  ordem: "recentes" | "intencao" | "aderencia" | "aiScore";
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
      f.ordem === "intencao"
        ? b.pontuacoes.intencao.pontos - a.pontuacoes.intencao.pontos
        : f.ordem === "aderencia"
          ? b.pontuacoes.aderencia.pontos - a.pontuacoes.aderencia.pontos
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

/** Etapas em aberto: retorno atrasado só conta nelas. */
const EM_ABERTO: StatusLead[] = ["novo", "contatado", "qualificado", "oportunidade"];

/** Data de hoje no fuso de São Paulo, AAAA-MM-DD (o mesmo formato do campo próximo contato). */
export const hojeSp = (agora = new Date()) => agora.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

export const atrasado = (l: LeadLinha, hoje: string) =>
  Boolean(l.proximo_contato && l.proximo_contato < hoje && EM_ABERTO.includes(l.status));

/** Uma taxa com o numerador e o denominador à vista: nunca um percentual solto. */
export interface Taxa {
  n: number;
  de: number;
  /** Percentual inteiro; `null` quando não há denominador (não é 0%: é "sem base"). */
  percentual: number | null;
}
export const taxa = (n: number, de: number): Taxa => ({
  n,
  de,
  percentual: de > 0 ? Math.round((n / de) * 100) : null,
});

/**
 * Números do topo do funil. A conversão em cliente é sobre TODOS os leads, descartados incluídos; a taxa sobre os que
 * não foram descartados existe, mas tem nome próprio e mostra o próprio denominador.
 */
export function indicadores(leads: LeadVisao[], hoje: string) {
  const total = leads.length;
  const clientes = leads.filter((l) => l.lead.status === "cliente").length;
  const descartados = leads.filter((l) => l.lead.status === "descartado").length;
  return {
    leads: total,
    emNegociacao: leads.filter((l) => l.lead.status === "qualificado" || l.lead.status === "oportunidade").length,
    clientes,
    descartados,
    conversao: taxa(clientes, total),
    conversaoSemDescartados: taxa(clientes, total - descartados),
    atrasados: leads.filter((l) => atrasado(l.lead, hoje)).length,
    pediram: leads.filter((l) => l.lead.pediu_contato).length,
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

/** O número só entra na planilha quando a pessoa escolheu ser contatada por WhatsApp ou por ligação. */
export function csvLeads(
  leads: LeadVisao[],
  solucaoNome: (slug: string) => string,
  contatos: ReadonlyMap<string, ContatoPermitido> = new Map(),
): string {
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
    c.aderencia,
    c.intencao,
    c.oportunidade,
    c.status,
    c.pediuContato,
    c.marketing,
    c.responsavel,
    c.proximoContato,
    c.relatorioEnviado,
    c.ambiente,
    "utm_source",
    "utm_medium",
    "utm_campaign",
    c.notas,
  ];
  const linhas = leads.map(({ lead: l, avaliacao: a, resultado, respostas, solucoes, pontuacoes: p }) => [
    dataBr(l.criado_em),
    l.nome,
    l.email,
    l.email_pessoal,
    l.empresa,
    contatos.get(l.id)?.telefone ?? null,
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
    p.aderencia.pontos,
    p.intencao.pontos,
    p.oportunidade.pontos,
    admin.status[l.status],
    l.pediu_contato,
    l.consentimento_marketing,
    l.responsavel,
    l.proximo_contato ? dataBr(`${l.proximo_contato}T12:00:00`) : null,
    l.relatorio_enviado_em ? dataBr(l.relatorio_enviado_em) : null,
    l.ambiente,
    a.origem?.utm_source,
    a.origem?.utm_medium,
    a.origem?.utm_campaign,
    l.notas,
  ]);
  return paraCsv(cabecalho, linhas);
}
