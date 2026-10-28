import { describe, expect, it } from "vitest";
import { celula, paraCsv } from "@/lib/ai-score/csv";
import {
  atrasado,
  csvLeads,
  filtrarLeads,
  filtrosIniciais,
  hojeSp,
  indicadores,
  montarLeads,
  resumir,
} from "@/lib/ai-score/leads";
import type { AvaliacaoLinha, LeadLinha } from "@/lib/supabase-admin";

const lead = (extra: Partial<LeadLinha>): LeadLinha => ({
  id: "l1",
  avaliacao_id: "a1",
  criado_em: "2026-10-28T13:00:00Z",
  atualizado_em: "2026-10-28T13:00:00Z",
  nome: "Maria Teste",
  email: "maria@empresa.com.br",
  email_pessoal: false,
  empresa: "Empresa Ágil",
  whatsapp: "5585999990000",
  pediu_contato: true,
  consentimento_marketing: false,
  status: "novo",
  notas: null,
  responsavel: null,
  proximo_contato: null,
  relatorio_enviado_em: null,
  ambiente: "producao",
  ...extra,
});

const avaliacao = (extra: Partial<AvaliacaoLinha>): AvaliacaoLinha => ({
  id: "a1",
  criada_em: "2026-10-28T12:59:00Z",
  escopo: "empresa",
  papel: "ceo",
  porte: "50-199",
  segmento: "tecnologia",
  horizonte: "imediato",
  indice: 46,
  nivel: "desenvolvimento",
  parcial: false,
  codigo:
    "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=vendas&av=4323&d=comecar&h=imediato&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
  origem: { utm_source: "linkedin" },
  ambiente: "producao",
  leads: [lead({})],
  ...extra,
});

const dados: AvaliacaoLinha[] = [
  avaliacao({}),
  avaliacao({
    id: "a2",
    criada_em: "2026-10-27T10:00:00Z",
    papel: "especialista",
    codigo:
      "v=1&e=empresa&p=especialista&t=50-199&s=tecnologia&r=000000000000&d=comecar&h=explorando&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e70",
    indice: 20,
    nivel: "explorando",
    horizonte: "explorando",
    leads: [
      lead({
        id: "l2",
        avaliacao_id: "a2",
        nome: "João",
        empresa: "Outra",
        criado_em: "2026-10-27T10:05:00Z",
        pediu_contato: false,
        status: "contatado",
        whatsapp: null,
        email_pessoal: true,
      }),
    ],
  }),
  avaliacao({ id: "a3", criada_em: "2026-10-26T10:00:00Z", leads: [] }),
  avaliacao({ id: "a4", ambiente: "staging", leads: [lead({ id: "l4", avaliacao_id: "a4", ambiente: "staging" })] }),
];

describe("admin: visão dos leads", () => {
  it("recalcula o resultado a partir do código (regras atuais, não a nota gravada) e soma o lead score", () => {
    const [maria] = montarLeads(dados);
    expect(maria.avaliacao.indice).toBe(46);
    expect(maria.resultado?.indice).toBe(34);
    expect(maria.resultado?.areas).toEqual({ vendas: 70 });
    expect(maria.solucoes).toEqual(["governance", "ai-champions"]);
    // CEO 25 + imediato 25 + 50-199 15 + empresa 5 + desafio 5 + e-mail corporativo 5 + WhatsApp 5
    // + relatório completo 5 + pediu contato 10
    expect(maria.leadScore).toBe(100);
  });

  it("lead só da etapa 1 (sem empresa) entra na lista e perde os pontos do relatório completo", () => {
    const so = montarLeads([avaliacao({ leads: [lead({ empresa: null })] })])[0];
    expect(so.leadScore).toBe(95);
    expect(filtrarLeads([so], { ...filtrosIniciais, busca: "maria" })).toHaveLength(1);
  });

  it("filtra por ambiente (produção por padrão), status, nível e busca sem acento", () => {
    const leads = montarLeads(dados);
    expect(filtrarLeads(leads, filtrosIniciais).map((l) => l.lead.id)).toEqual(["l1", "l2"]);
    expect(filtrarLeads(leads, { ...filtrosIniciais, ambiente: "" })).toHaveLength(3);
    expect(filtrarLeads(leads, { ...filtrosIniciais, status: "contatado" }).map((l) => l.lead.id)).toEqual(["l2"]);
    expect(filtrarLeads(leads, { ...filtrosIniciais, nivel: "inicial" }).map((l) => l.lead.id)).toEqual(["l2"]);
    expect(filtrarLeads(leads, { ...filtrosIniciais, ordem: "aiScore" })[0].lead.id).toBe("l1");
    expect(filtrarLeads(leads, { ...filtrosIniciais, busca: "agil" }).map((l) => l.lead.id)).toEqual(["l1"]);
    expect(filtrarLeads(leads, { ...filtrosIniciais, ordem: "leadScore" })[0].lead.id).toBe("l1");
  });

  it("resumo do funil: avaliações, leads, sem lead e pedidos de contato", () => {
    expect(resumir(dados, "producao")).toEqual({
      avaliacoes: 3,
      leads: 2,
      semLead: 1,
      pediram: 1,
      ultima: "2026-10-28T12:59:00Z",
    });
  });

  it("CSV para Excel: BOM, ponto e vírgula, aspas e proteção contra fórmula", () => {
    expect(celula("=SOMA(A1)")).toBe("'=SOMA(A1)");
    expect(celula('Diz "oi"; tchau')).toBe('"Diz ""oi""; tchau"');
    expect(celula(true)).toBe("sim");
    expect(celula(null)).toBe("");
    expect(paraCsv(["a", "b"], [[1, "x"]])).toBe("﻿a;b\r\n1;x\r\n");

    const csv = csvLeads(filtrarLeads(montarLeads(dados), filtrosIniciais), (s) => s.toUpperCase());
    const [cabecalho, primeira] = csv.replace("﻿", "").split("\r\n");
    expect(cabecalho.split(";")).toContain("Estratégia e Liderança");
    expect(primeira).toContain("Maria Teste;maria@empresa.com.br;não;Empresa Ágil;5585999990000;Empresário ou CEO");
    expect(primeira).toContain(";34;Explorando;70;40;27,5;40;15;27,5;Vendas 70;");
    expect(primeira).toContain("GOVERNANCE | AI-CHAMPIONS;100;Novo;sim;não;;;;producao;linkedin");
  });

  it("CSV leva responsável, próximo contato e envio do relatório", () => {
    const comCrm = [
      avaliacao({
        leads: [
          lead({
            responsavel: "elida@resetia.com.br",
            proximo_contato: "2026-11-03",
            relatorio_enviado_em: "2026-10-28T13:05:00Z",
          }),
        ],
      }),
    ];
    const csv = csvLeads(montarLeads(comCrm), (s) => s);
    expect(csv).toContain(";elida@resetia.com.br;03/11/2026;28/10/2026;producao;");
  });

  it("hoje no fuso de São Paulo, no formato do campo de data", () => {
    // 01:30 UTC do dia 29 ainda é dia 28 em São Paulo (UTC-3).
    expect(hojeSp(new Date("2026-10-29T01:30:00Z"))).toBe("2026-10-28");
    expect(hojeSp(new Date("2026-10-29T03:30:00Z"))).toBe("2026-10-29");
  });

  it("retorno atrasado só para etapas em aberto e data passada", () => {
    const hoje = "2026-10-28";
    expect(atrasado(lead({ proximo_contato: "2026-10-27" }), hoje)).toBe(true);
    expect(atrasado(lead({ proximo_contato: "2026-10-28" }), hoje)).toBe(false);
    expect(atrasado(lead({ proximo_contato: null }), hoje)).toBe(false);
    expect(atrasado(lead({ proximo_contato: "2026-10-01", status: "cliente" }), hoje)).toBe(false);
    expect(atrasado(lead({ proximo_contato: "2026-10-01", status: "descartado" }), hoje)).toBe(false);
    expect(atrasado(lead({ proximo_contato: "2026-10-01", status: "oportunidade" }), hoje)).toBe(true);
  });

  it("indicadores do funil: negociação, clientes, conversão sem descartados, atrasados e pedidos", () => {
    const comStatus = [
      avaliacao({
        leads: [
          lead({ id: "a", status: "qualificado", proximo_contato: "2026-10-01" }),
          lead({ id: "b", status: "oportunidade", pediu_contato: false }),
          lead({ id: "c", status: "cliente", pediu_contato: false }),
          lead({ id: "d", status: "descartado", pediu_contato: false }),
          lead({ id: "e", status: "novo", pediu_contato: false }),
        ],
      }),
    ];
    expect(indicadores(montarLeads(comStatus), "2026-10-28")).toEqual({
      leads: 5,
      emNegociacao: 2,
      clientes: 1,
      conversao: 25,
      atrasados: 1,
      pediram: 1,
    });
    expect(indicadores([], "2026-10-28")).toMatchObject({ leads: 0, conversao: 0 });
  });
});
