import { describe, expect, it } from "vitest";
import { lerLink } from "@/lib/ai-score/codec";
import { montarDevolutiva } from "@/lib/ai-score/devolutiva";
import { filaDeConversas, resumoDaFila } from "@/lib/ai-score/fila-conversas";
import { fichaDaConversa } from "@/lib/ai-score/ficha";
import { montarLeads } from "@/lib/ai-score/leads";
import { completas } from "@/lib/ai-score/codificar";
import type { Aprofundamento } from "@/lib/ai-score/aprofundamento";
import type { AvaliacaoLinha, ContatoPermitido, LeadLinha } from "@/lib/supabase-admin";

const CODIGO =
  "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=322221211x1x&a=vendas&av=4323&d=repetitivas,governanca&h=imediato&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f";

const lead = (id: string, extra: Partial<LeadLinha> = {}): LeadLinha => ({
  id,
  avaliacao_id: "a1",
  criado_em: "2026-11-01T10:00:00Z",
  atualizado_em: "2026-11-01T10:00:00Z",
  nome: `Pessoa ${id}`,
  email: `${id}@empresa.com.br`,
  email_pessoal: false,
  empresa: `Empresa ${id}`,
  pediu_contato: true,
  consentimento_marketing: false,
  status: "novo",
  notas: null,
  responsavel: null,
  proximo_contato: null,
  relatorio_enviado_em: null,
  pedido_conversa_em: null,
  primeira_resposta_em: null,
  canal: "funcao",
  ambiente: "producao",
  ...extra,
});

const avaliacao = (leads: LeadLinha[]): AvaliacaoLinha => ({
  id: "a1",
  criada_em: "2026-11-01T09:00:00Z",
  escopo: "empresa",
  papel: "ceo",
  porte: "50-199",
  segmento: "tecnologia",
  horizonte: "imediato",
  indice: 28,
  nivel: "explorando",
  parcial: false,
  codigo: CODIGO,
  origem: {},
  ambiente: "producao",
  leads,
});

const AGORA = new Date("2026-11-03T12:00:00Z");
const HOJE = "2026-11-03";
const visoes = (leads: LeadLinha[]) => montarLeads([avaliacao(leads)]);

describe("fila de pedidos de conversa", () => {
  it("só entra quem pediu para falar com um especialista e ainda não foi encerrado", () => {
    const fila = filaDeConversas(
      visoes([
        lead("pediu", { pedido_conversa_em: "2026-11-03T08:00:00Z" }),
        lead("so-concluiu", { pediu_contato: false }),
        lead("cliente", { status: "cliente", pedido_conversa_em: "2026-11-01T08:00:00Z" }),
        lead("descartado", { status: "descartado" }),
      ]),
      AGORA,
      HOJE,
    );
    expect(fila.map((i) => i.visao.lead.id)).toEqual(["pediu"]);
  });

  it("os sem resposta vêm primeiro, o mais antigo na frente; depois os já respondidos", () => {
    const fila = filaDeConversas(
      visoes([
        lead("respondido", {
          pedido_conversa_em: "2026-11-01T08:00:00Z",
          primeira_resposta_em: "2026-11-01T10:00:00Z",
        }),
        lead("novo", { pedido_conversa_em: "2026-11-03T11:00:00Z" }),
        lead("antigo", { pedido_conversa_em: "2026-11-01T08:00:00Z" }),
        lead("sem-momento"),
      ]),
      AGORA,
      HOJE,
    );
    expect(fila.map((i) => i.visao.lead.id)).toEqual(["antigo", "novo", "sem-momento", "respondido"]);
  });

  it("mede a espera e o tempo até a primeira resposta só quando os dois momentos existem", () => {
    const [i] = filaDeConversas(
      visoes([lead("a", { pedido_conversa_em: "2026-11-01T08:00:00Z", primeira_resposta_em: "2026-11-01T14:30:00Z" })]),
      AGORA,
      HOJE,
    );
    expect(i.respondido).toBe(true);
    expect(i.ateAPrimeiraRespostaEmHoras).toBe(6.5);
    expect(i.esperaEmHoras).toBe(52);
    // Lead anterior a 01/11/2026: sem o momento do pedido, nada é inventado.
    const [antigo] = filaDeConversas(
      visoes([lead("b", { primeira_resposta_em: "2026-11-01T14:30:00Z" })]),
      AGORA,
      HOJE,
    );
    expect(antigo.esperaEmHoras).toBeNull();
    expect(antigo.ateAPrimeiraRespostaEmHoras).toBeNull();
  });

  it("as pendências: responsável, resposta, retorno e canal", () => {
    const [i] = filaDeConversas(
      visoes([lead("a", { pedido_conversa_em: "2026-11-01T08:00:00Z", proximo_contato: "2026-11-02" })]),
      AGORA,
      HOJE,
      new Set(),
    );
    expect(i.pendencias).toEqual(["sem-responsavel", "sem-resposta", "retorno-atrasado", "sem-canal"]);
    const [ok] = filaDeConversas(
      visoes([
        lead("b", {
          pedido_conversa_em: "2026-11-03T10:00:00Z",
          responsavel: "elida@resetia.com.br",
          proximo_contato: "2026-11-05",
        }),
      ]),
      AGORA,
      HOJE,
      new Set(["b"]),
    );
    // Dentro do prazo, com responsável, retorno marcado e canal liberado: nada pendente.
    expect(ok.pendencias).toEqual([]);
    // Sem retorno marcado também é pendência.
    const [semRetorno] = filaDeConversas(
      visoes([lead("c", { pedido_conversa_em: "2026-11-03T10:00:00Z", responsavel: "x@y.com" })]),
      AGORA,
      HOJE,
    );
    expect(semRetorno.pendencias).toEqual(["sem-retorno-marcado"]);
  });

  it("resumo: aguardando, fora do prazo, sem responsável e a mediana do tempo até a primeira resposta", () => {
    const itens = filaDeConversas(
      visoes([
        lead("r1", { pedido_conversa_em: "2026-11-01T08:00:00Z", primeira_resposta_em: "2026-11-01T10:00:00Z" }),
        lead("r2", { pedido_conversa_em: "2026-11-01T08:00:00Z", primeira_resposta_em: "2026-11-01T14:00:00Z" }),
        lead("r3", { pedido_conversa_em: "2026-11-01T08:00:00Z", primeira_resposta_em: "2026-11-01T18:00:00Z" }),
        lead("espera", { pedido_conversa_em: "2026-11-03T08:00:00Z" }),
        lead("atrasado", { pedido_conversa_em: "2026-11-01T08:00:00Z" }),
        lead("antigo"),
      ]),
      AGORA,
      HOJE,
    );
    expect(resumoDaFila(itens)).toEqual({
      pedidos: 6,
      aguardando: 3,
      passaramDoPrazo: 1,
      semResponsavel: 6,
      comTempoMedido: 3,
      medianaAtePrimeiraRespostaEmHoras: 6,
      semMomentoDoPedido: 1,
    });
    // Sem nenhum pedido respondido com o momento guardado, não há mediana (não é zero).
    expect(
      resumoDaFila(filaDeConversas(visoes([lead("a")]), AGORA, HOJE)).medianaAtePrimeiraRespostaEmHoras,
    ).toBeNull();
  });
});

describe("ficha de preparação da conversa", () => {
  const link = lerLink(CODIGO);
  if (link.tipo !== "ok" || !completas(link.respostas)) throw new Error("código inválido");
  const devolutiva = montarDevolutiva(link.respostas, link);
  const todos: ContatoPermitido = {
    lead_id: "x",
    email: true,
    whatsapp: true,
    ligacao: true,
    telefone: "5585999990000",
    tem_numero: true,
  };
  const aprofundamento: Aprofundamento = {
    area: "vendas",
    camada: 2,
    revisao: 1,
    rotina: "propostas",
    volume: 200,
    unidade: "propostas",
    periodo: "mes",
    consequencia: "retrabalho",
    minutos: 15,
    ferramentas: ["CRM"],
    dados: "parcial",
    indicador: "tempo de resposta",
    papelDecisor: "decido",
    naoSei: [],
  };
  const ficha = (l: LeadLinha, extra: Partial<Parameters<typeof fichaDaConversa>[1]> = {}, ap?: Aprofundamento) => {
    const [v] = montarLeads([avaliacao([l])], ap ? new Map([[l.id, ap]]) : undefined);
    return fichaDaConversa(v, { devolutiva, marcos: [], contato: todos, agora: AGORA, ...extra });
  };
  const linhas = (f: ReturnType<typeof ficha>, id: string) => f.secoes.find((s) => s.id === id)?.linhas ?? [];

  it("traz as nove partes pedidas, na ordem, sem chamar IA (é uma função pura e síncrona)", () => {
    const f = ficha(lead("a", { pedido_conversa_em: "2026-11-03T08:00:00Z" }));
    expect(f.secoes.map((s) => s.id)).toEqual([
      "perfil",
      "dor",
      "sustentacao",
      "hipotese",
      "faltam",
      "perguntas",
      "piloto",
      "proximo",
    ]);
    expect(f.texto).toContain("Perfil e escopo avaliado");
    expect(ficha(lead("a"))).toEqual(ficha(lead("a")));
  });

  it("sem aprofundamento, diz o que falta e não calcula esforço; com os dados, mostra a conta e as premissas", () => {
    const sem = ficha(lead("a"));
    expect(linhas(sem, "dor").join(" ")).toContain("não respondeu o aprofundamento");
    expect(sem.secoes.some((s) => s.id === "esforco")).toBe(false);
    expect(linhas(sem, "faltam").join(" ")).toContain("A dor operacional não foi aprofundada");
    const com = ficha(lead("a"), {}, aprofundamento);
    expect(linhas(com, "esforco").join(" ")).toContain("200 propostas por mês × 15 min ÷ 60 = 50 h por mês");
    expect(linhas(com, "esforco").join(" ")).toContain("não uma economia garantida");
    expect(com.texto).not.toMatch(/R\$|reais/);
  });

  it("a consequência é declarada ou hipótese, nunca misturadas", () => {
    const f = ficha(lead("a"));
    const dor = linhas(f, "dor").join("\n");
    expect(dor).toContain("Consequência declarada:");
    expect(dor).toContain("Hipótese de consequência:");
    expect(linhas(f, "hipotese").join(" ")).toContain("(As suas respostas sustentam este desafio.)");
  });

  it("os pontos cegos e os desafios que as respostas contradizem entram no que falta saber", () => {
    const f = ficha(lead("a"));
    const faltam = linhas(f, "faltam").join("\n");
    expect(faltam).toContain('ficou como "Não sei responder"');
  });

  it("responsável, próxima ação, canal permitido e prazo, conforme o estado real do lead", () => {
    const pediu = ficha(lead("a", { pedido_conversa_em: "2026-11-03T08:00:00Z" }));
    expect(linhas(pediu, "proximo")).toEqual([
      "Responsável: Sem responsável",
      "Próxima ação: Responder ao pedido de conversa (ainda sem primeira resposta).",
      "Canal permitido: e-mail, WhatsApp, ligação",
      "Prazo: Sem prazo marcado",
    ]);
    const semPedido = ficha(lead("b", { pediu_contato: false }), {
      contato: { ...todos, whatsapp: false, ligacao: false, telefone: null, email: false, tem_numero: false },
    });
    expect(linhas(semPedido, "proximo").join(" ")).toContain("não iniciar contato por WhatsApp ou ligação");
    expect(linhas(semPedido, "proximo").join(" ")).toContain("Canal permitido: Nenhum canal liberado");
    const atrasado = ficha(
      lead("c", {
        primeira_resposta_em: "2026-11-02T10:00:00Z",
        proximo_contato: "2026-11-01",
        responsavel: "x@y.com",
      }),
    );
    expect(linhas(atrasado, "proximo")[1]).toContain("Retorno atrasado");
    expect(linhas(atrasado, "proximo")[3]).toBe("Prazo: 01/11/2026");
    expect(linhas(ficha(lead("d", { status: "cliente" })), "proximo")[1]).toContain("encerrado");
  });

  it("o texto da ficha nunca leva o e-mail nem o telefone da pessoa", () => {
    const f = ficha(lead("a", { pedido_conversa_em: "2026-11-03T08:00:00Z" }), {}, aprofundamento);
    expect(f.texto).not.toContain("@empresa.com.br");
    expect(f.texto).not.toContain("5585999990000");
  });

  it("o piloto cita a solução, a força da indicação e as condições pendentes", () => {
    const f = ficha(lead("a"));
    const piloto = linhas(f, "piloto").join("\n");
    expect(piloto).toMatch(
      /RESET (Governance|Processos com IA): (Indicada pelas respostas|A investigar antes de indicar)\./,
    );
  });
});
