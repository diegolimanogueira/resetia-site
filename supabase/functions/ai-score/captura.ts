// Ações públicas de captura: registrar (etapa 1), completar (etapa 2), aprofundar e status. O navegador manda as
// respostas (o código do link) e a chave que ele gerou; a função valida tudo, RECALCULA a nota (o que o navegador
// disser sobre a nota é ignorado) e grava pelas funções atômicas do banco. O id do lead, que é público, nunca
// autoriza escrita: quem escreve prova que conhece a chave. Dados pessoais nunca vão para os logs.
// @ts-types="./nucleo.d.ts"
import * as nucleo from "./nucleo.js";
import { agendar, limite, resposta, rest, rpc, UUID } from "./base.ts";
import { CHAVE, dentroDoLimite, ipDoPedido, sha256hex, uuidDeterministico } from "./seguranca.ts";

type Corpo = Record<string, unknown>;
const texto = (c: Corpo, k: string) => (typeof c[k] === "string" ? (c[k] as string) : "");
const booleano = (c: Corpo, k: string) => c[k] === true;
const limpar = (t: string) =>
  t
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const REGISTROS_POR_IP_HORA = limite("REGISTROS_POR_IP_HORA", 30);
const REGISTROS_POR_HORA = limite("REGISTROS_POR_HORA", 600);
const AMBIENTES = ["producao", "staging", "dev"];

/** Origem da visita: só as chaves conhecidas, cada texto com limite (o banco limita o conjunto a 1500 caracteres). */
function origemSegura(bruto: unknown) {
  const o = (bruto && typeof bruto === "object" ? bruto : {}) as Record<string, unknown>;
  const chaves: Array<[string, number]> = [
    ["utm_source", 120],
    ["utm_medium", 120],
    ["utm_campaign", 120],
    ["utm_content", 120],
    ["utm_term", 120],
    ["referrer", 300],
    ["entrada", 200],
  ];
  const saida: Record<string, string> = {};
  for (const [k, max] of chaves) if (typeof o[k] === "string" && o[k]) saida[k] = limpar(o[k] as string).slice(0, max);
  return saida;
}

const erroDoBanco = (r: { estado: string }) =>
  r.estado === "indisponivel" ? resposta({ erro: "banco" }, 502) : resposta({ erro: "dados" }, 422);

/**
 * A avaliação a partir do código do link: a nota é recalculada AQUI (o que o navegador diz sobre ela não entra), no
 * método e na análise do próprio código, e o código gravado é o canônico (sem token nem `&lead=`).
 */
async function montarAvaliacao(corpo: Corpo, avaliacaoId: string, ambiente: string) {
  const link = nucleo.lerLink(texto(corpo, "codigo"));
  if (link.tipo !== "ok" || !nucleo.completas(link.respostas) || link.respostas.id !== avaliacaoId)
    return { erro: resposta({ erro: "avaliacao" }, 422) };

  const devolutiva = nucleo.montarDevolutiva(link.respostas, link);
  const { resultado, cobertura, versoes } = devolutiva;
  const resumo = {
    indice: resultado.indice,
    nivel: resultado.nivel,
    parcial: resultado.parcial,
    respondidas: resultado.respondidas,
    situacao: cobertura.situacao,
    validas: cobertura.validas,
    total: cobertura.total,
    metodo: versoes.metodo,
  };
  const r = link.respostas;
  const avaliacao = {
    id: avaliacaoId,
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
    codigo: nucleo.codigoCanonico(link),
    versao: link.formato,
    versao_metodo: versoes.metodo,
    versao_analise: link.analise,
    resultado: resumo,
    origem: origemSegura(corpo.origem),
    ambiente,
  };
  // Impressão digital do relatório entregue (o mesmo repetido não vira duas linhas) e limite de tamanho do banco.
  const hash = await sha256hex(JSON.stringify({ resumo, devolutiva }));
  if (JSON.stringify(devolutiva).length > 60_000) {
    console.error("avaliação: devolutiva grande demais para o banco");
    return { erro: resposta({ erro: "interno" }, 500) };
  }
  return { link, devolutiva, resumo, avaliacao, hash };
}

/**
 * Terminou o questionário e ainda não deixou contato: grava só a avaliação (sem lead), para medir quem concluiu sem
 * deixar nome e e-mail. Idempotente; se a pessoa deixar o contato depois, `registrar` encontra esta avaliação.
 */
export async function concluir(req: Request, corpo: Corpo) {
  const avaliacaoId = texto(corpo, "avaliacao_id");
  const ambiente = texto(corpo, "ambiente");
  if (!UUID.test(avaliacaoId) || !AMBIENTES.includes(ambiente)) return resposta({ erro: "campos" }, 400);
  if (texto(corpo, "codigo").length > 400) return resposta({ erro: "campos", campo: "codigo" }, 413);
  const ip = await sha256hex(ipDoPedido(req));
  if (
    !(await dentroDoLimite(`concluir:ip:${ip}`, 3600, REGISTROS_POR_IP_HORA * 2)) ||
    !(await dentroDoLimite("concluir:global", 3600, REGISTROS_POR_HORA * 2))
  ) {
    console.warn("concluir: limite atingido");
    return resposta({ erro: "limite" }, 429);
  }
  const calculo = await montarAvaliacao(corpo, avaliacaoId, ambiente);
  if (calculo.erro) return calculo.erro;
  const sql = await rpc<{ status: string; motivo?: string }>("registrar_avaliacao", { p: calculo.avaliacao });
  if (sql.estado !== "ok" || !sql.dados) return erroDoBanco(sql);
  if (sql.dados.status === "conflito") return resposta({ erro: "conflito", motivo: sql.dados.motivo }, 409);
  return resposta({ status: sql.dados.status, nota: calculo.devolutiva.resultado.indice });
}

/** Etapa 1: nome e e-mail abrem o resultado e criam o lead, junto com a avaliação e o relatório entregue. */
export async function registrar(req: Request, corpo: Corpo) {
  const avaliacaoId = texto(corpo, "avaliacao_id");
  const leadId = texto(corpo, "lead_id");
  const chave = texto(corpo, "chave");
  const codigo = texto(corpo, "codigo");
  const nome = limpar(texto(corpo, "nome"));
  const email = texto(corpo, "email").trim().toLowerCase();
  const ambiente = texto(corpo, "ambiente");
  if (!UUID.test(avaliacaoId) || !UUID.test(leadId) || !CHAVE.test(chave) || !AMBIENTES.includes(ambiente))
    return resposta({ erro: "campos" }, 400);
  if (codigo.length > 400) return resposta({ erro: "campos", campo: "codigo" }, 413);
  if (nome.length < 2 || nome.length > 120) return resposta({ erro: "campos", campo: "nome" }, 422);
  if (email.length > 200 || !nucleo.emailValido(email)) return resposta({ erro: "campos", campo: "email" }, 422);

  const ip = await sha256hex(ipDoPedido(req));
  if (
    !(await dentroDoLimite(`registrar:ip:${ip}`, 3600, REGISTROS_POR_IP_HORA)) ||
    !(await dentroDoLimite("registrar:global", 3600, REGISTROS_POR_HORA))
  ) {
    console.warn("registrar: limite atingido");
    return resposta({ erro: "limite" }, 429);
  }

  const calculo = await montarAvaliacao(corpo, avaliacaoId, ambiente);
  if (calculo.erro) return calculo.erro;
  const { link, devolutiva, resumo, hash, avaliacao } = calculo;
  const { resultado, versoes } = devolutiva;

  const marketing = booleano(corpo, "marketing");
  const consentimentos = marketing
    ? [
        {
          finalidade: "conteudo-email",
          canal: "email",
          concedido: true,
          fonte: "formulario",
          texto_versao: nucleo.CONSENTIMENTOS_VERSAO,
          evento_id: await uuidDeterministico(leadId, "conteudo-email", "email", "etapa1"),
        },
      ]
    : [];
  const sql = await rpc<{ status: string; motivo?: string }>("registrar_captura", {
    p: {
      avaliacao,
      lead: {
        id: leadId,
        nome,
        email,
        email_pessoal: nucleo.emailPessoal(email),
        consentimento_marketing: marketing,
        ambiente,
      },
      chave_hash: await sha256hex(chave),
      consentimentos,
      relatorio: {
        versao_metodo: versoes.metodo,
        versao_analise: versoes.analiseAtual,
        resultado: resumo,
        devolutiva,
        hash,
      },
    },
  });
  if (sql.estado !== "ok" || !sql.dados) return erroDoBanco(sql);
  if (sql.dados.status === "conflito") return resposta({ erro: "conflito", motivo: sql.dados.motivo }, 409);
  return resposta({
    status: sql.dados.status,
    nota: resultado.indice,
    versoes: { metodo: versoes.metodo, analise: versoes.analiseAtual },
  });
}

/** Etapa 2: empresa e WhatsApp completam o lead, registram os consentimentos e enfileiram o relatório por e-mail. */
export async function completar(corpo: Corpo, processarDoLead: (leadId: string) => Promise<unknown>) {
  const leadId = texto(corpo, "lead_id");
  const avaliacaoId = texto(corpo, "avaliacao_id");
  const chave = texto(corpo, "chave");
  const empresa = limpar(texto(corpo, "empresa"));
  const whatsappBruto = texto(corpo, "whatsapp");
  if (!UUID.test(leadId) || !UUID.test(avaliacaoId) || !CHAVE.test(chave)) return resposta({ erro: "campos" }, 400);
  if (empresa.length < 1 || empresa.length > 160) return resposta({ erro: "campos", campo: "empresa" }, 422);
  if (whatsappBruto && !/^55\d{10,11}$/.test(whatsappBruto))
    return resposta({ erro: "campos", campo: "whatsapp" }, 422);
  if (!(await dentroDoLimite(`completar:${leadId}`, 3600, 20))) return resposta({ erro: "limite" }, 429);

  const whatsapp = whatsappBruto || null;
  const pediu = booleano(corpo, "pediu_contato");
  const marketing = booleano(corpo, "marketing");
  const evento = async (finalidade: string, canal: string) => ({
    finalidade,
    canal,
    concedido: true,
    fonte: "formulario",
    texto_versao: nucleo.CONSENTIMENTOS_VERSAO,
    evento_id: await uuidDeterministico(leadId, finalidade, canal, "etapa2"),
  });
  const consentimentos = [await evento("relatorio-email", "email")];
  if (pediu) {
    consentimentos.push(await evento("contato-analise", "email"));
    if (whatsapp)
      consentimentos.push(await evento("contato-analise", "whatsapp"), await evento("contato-analise", "ligacao"));
  }
  if (marketing) consentimentos.push(await evento("conteudo-email", "email"));

  const sql = await rpc<{ status: string }>("completar_captura", {
    p: {
      lead_id: leadId,
      avaliacao_id: avaliacaoId,
      chave_hash: await sha256hex(chave),
      empresa,
      whatsapp,
      pediu_contato: pediu,
      marketing,
      consentimentos,
    },
  });
  if (sql.estado !== "ok" || !sql.dados) return erroDoBanco(sql);
  if (sql.dados.status === "nao-autorizado") return resposta({ erro: "nao-autorizado" }, 403);

  // O e-mail sai em segundo plano: a resposta não espera por IA nem pelo provedor. O estado real fica na tarefa.
  const espera = agendar(processarDoLead(leadId));
  if (espera) await espera;
  return resposta({ status: sql.dados.status });
}

/** Grava o aprofundamento (camada 1 ou 2) de um lead que prova conhecer a chave. */
export async function aprofundar(corpo: Corpo) {
  const leadId = texto(corpo, "lead_id");
  const chave = texto(corpo, "chave");
  if (!UUID.test(leadId) || !CHAVE.test(chave)) return resposta({ erro: "campos" }, 400);
  const v = nucleo.validarAprofundamento(corpo.aprofundamento);
  if (!v.ok) return resposta({ erro: "campos", campos: v.erros }, 422);
  if (!(await dentroDoLimite(`aprofundar:${leadId}`, 3600, 60))) return resposta({ erro: "limite" }, 429);

  const sql = await rpc<{ status: string; revisao?: number }>("gravar_aprofundamento", {
    p: { lead_id: leadId, chave_hash: await sha256hex(chave), ...nucleo.paraLinha(v.valor) },
  });
  if (sql.estado !== "ok" || !sql.dados) return erroDoBanco(sql);
  if (sql.dados.status === "nao-autorizado") return resposta({ erro: "nao-autorizado" }, 403);
  return resposta({
    status: sql.dados.status,
    revisao: sql.dados.revisao ?? v.valor.revisao,
    esforco: nucleo.esforcoEstimado(v.valor),
  });
}

type Tarefa = { tipo: string; status: string; tentativas: number; max_tentativas: number; tentar_em: string };
const publico = (s: string) => (s === "processando" ? "pendente" : s);

/** O que de fato aconteceu com o envio do relatório (sem texto de erro): é o que a tela mostra com honestidade. */
export async function status(corpo: Corpo) {
  const leadId = texto(corpo, "lead_id");
  const chave = texto(corpo, "chave");
  if (!UUID.test(leadId) || !CHAVE.test(chave)) return resposta({ erro: "campos" }, 400);
  const hash = await sha256hex(chave);
  const dono = await rest(`leads?id=eq.${leadId}&chave_hash=eq.${hash}&select=id`);
  if (!dono.ok || !((await dono.json()) as unknown[]).length) return resposta({ erro: "nao-autorizado" }, 403);
  const r = await rest(`tarefas?lead_id=eq.${leadId}&select=tipo,status,tentativas,max_tentativas,tentar_em`);
  const tarefas = r.ok ? ((await r.json()) as Tarefa[]) : [];
  const email = tarefas.find((t) => t.tipo === "email-relatorio");
  return resposta({
    relatorio_email: email
      ? {
          estado: publico(email.status),
          tentativas: email.tentativas,
          maximo: email.max_tentativas,
          proxima_em: email.status === "nova-tentativa" ? email.tentar_em : null,
        }
      : { estado: "nao-pedido" },
  });
}
