"use client";

import { useState } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { admin } from "@/content/admin";
import { adminFila, adminOperacao } from "@/content/admin-conversas";
import { analytics } from "@/lib/analytics";
import { dataBr, taxa, type LeadVisao } from "@/lib/ai-score/leads";
import { filaDeConversas, resumoDaFila } from "@/lib/ai-score/fila-conversas";
import { regras } from "@/lib/ai-score/regras";
import {
  lerSessao,
  processarPendencias,
  reprocessarTarefa,
  sessao,
  type ContatoPermitido,
  type Marco,
  type TarefaLinha,
} from "@/lib/supabase-admin";

const sessaoAtual = () => lerSessao(sessao.ler());
const tabela = "border-line overflow-x-auto border";
const cabecalho = "px-4 py-3 font-semibold";

/** Pedidos de conversa em aberto: há quanto tempo, quem respondeu, quem é o responsável e o que está pendente. */
function FilaDeConversas({
  leads,
  agora,
  hoje,
  contatos,
  aoAbrir,
}: {
  leads: LeadVisao[];
  agora: Date;
  hoje: string;
  contatos: Map<string, ContatoPermitido> | null;
  aoAbrir: (id: string) => void;
}) {
  const f = adminFila;
  const comCanal = contatos
    ? new Set([...contatos.values()].filter((c) => c.email || c.whatsapp || c.ligacao).map((c) => c.lead_id))
    : null;
  const itens = filaDeConversas(leads, agora, hoje, comCanal);
  const r = resumoDaFila(itens);
  const cartoes = [
    [f.resumo.pedidos, String(r.pedidos)],
    [f.resumo.aguardando, String(r.aguardando)],
    [f.resumo.passaramDoPrazo(regras.conversa.respostaEmHoras), String(r.passaramDoPrazo)],
    [f.resumo.semResponsavel, String(r.semResponsavel)],
    [
      f.resumo.mediana,
      r.medianaAtePrimeiraRespostaEmHoras === null ? "–" : f.horas(r.medianaAtePrimeiraRespostaEmHoras),
    ],
  ] as const;
  return (
    <section data-fila aria-labelledby="fila-titulo">
      <h2 id="fila-titulo" className="mb-2 text-[22px] font-bold">
        {f.titulo}
      </h2>
      <p className="text-fg-2 mb-5 max-w-[680px] text-[14px] leading-[1.6]">{f.texto}</p>
      <dl className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        {cartoes.map(([rotulo, valor]) => (
          <div key={rotulo} className="bg-painel border-line border p-4">
            <dt className="text-fg-2 text-[12px]">{rotulo}</dt>
            <dd className="mt-1 text-[22px] font-bold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
      <p data-fila-base className="text-fg-2 mb-1 text-[13px]">
        {r.comTempoMedido ? f.resumo.medianaBase(r.comTempoMedido) : f.resumo.semBase}
      </p>
      {r.semMomentoDoPedido ? (
        <p className="text-fg-2 mb-6 text-[13px]">{f.resumo.semMomento(r.semMomentoDoPedido)}</p>
      ) : (
        <div className="mb-6" />
      )}
      {itens.length === 0 ? (
        <p className="border-line border p-6 text-[14px]">{f.vazio}</p>
      ) : (
        <div className={tabela}>
          <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
            <thead className="text-fg-2 text-[12px]">
              <tr className="border-line border-b">
                {Object.values(f.colunas).map((c) => (
                  <th key={c} scope="col" className={cabecalho}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => {
                const l = i.visao.lead;
                const c = contatos?.get(l.id);
                return (
                  <tr key={l.id} data-fila-lead={l.id} className="border-line border-b align-top">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => aoAbrir(l.id)}
                        aria-haspopup="dialog"
                        className="hover:text-verde cursor-pointer text-left font-semibold"
                      >
                        {l.nome}
                      </button>
                      <span className="text-fg-2 block text-[12px]">{l.empresa ?? l.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {i.esperaEmHoras === null ? (
                        <span className="text-fg-2">{f.semMomento}</span>
                      ) : (
                        <>há {f.horas(i.esperaEmHoras)}</>
                      )}
                      <span className="text-fg-2 block text-[12px]">
                        {l.pedido_conversa_em ? dataBr(l.pedido_conversa_em) : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {i.respondido ? (
                        <>
                          {i.ateAPrimeiraRespostaEmHoras === null
                            ? dataBr(l.primeira_resposta_em!)
                            : f.horas(i.ateAPrimeiraRespostaEmHoras)}
                        </>
                      ) : (
                        <b>{f.naoRespondido}</b>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.responsavel ?? <span className="text-fg-2">{f.semResponsavel}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="grid gap-1 text-[12px]">
                        {i.pendencias.map((p) => (
                          <li key={p} className="font-semibold">
                            {f.pendencias[p]}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {c
                        ? [c.email && "e-mail", c.whatsapp && "WhatsApp", c.ligacao && "ligação"]
                            .filter(Boolean)
                            .join(", ") || "–"
                        : "…"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** O que o servidor faz por trás das telas: tarefas, falhas, reprocessamento, caminho antigo, analytics e funil. */
function Operacao({
  tarefas,
  legado,
  leads,
  marcos,
  carregando,
  aoMudar,
}: {
  tarefas: TarefaLinha[] | null;
  legado: { leads: number; avaliacoes: number } | null;
  leads: LeadVisao[];
  marcos: Marco[];
  carregando: boolean;
  aoMudar: () => void;
}) {
  const o = adminOperacao;
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function reprocessar(id: string) {
    const s = sessaoAtual();
    if (!s) return;
    setOcupado(true);
    const r = await reprocessarTarefa(s, id);
    setOcupado(false);
    setAviso(r === true ? o.tarefas.reprocessada : r === false ? o.tarefas.naoReprocessavel : o.tarefas.erro);
    if (r === true) aoMudar();
  }
  async function processar() {
    const s = sessaoAtual();
    if (!s) return;
    setOcupado(true);
    setAviso(o.tarefas.processando);
    const r = await processarPendencias(s);
    setOcupado(false);
    setAviso(typeof r === "object" ? o.tarefas.processado(r.processadas, r.falhas) : o.tarefas.erro);
    aoMudar();
  }

  const nomeDe = new Map(leads.map((l) => [l.lead.id, l.lead.nome]));
  const total = leads.length;
  const comMarco = (...tipos: string[]) =>
    new Set(marcos.filter((m) => tipos.includes(m.tipo)).map((m) => m.lead_id)).size;
  const pediram = leads.filter((l) => l.lead.pediu_contato).length;
  const responderam = leads.filter((l) => l.lead.primeira_resposta_em).length;
  const clientes = leads.filter((l) => l.lead.status === "cliente").length;
  const mostrar = (n: number, de: number) => admin.indicadores.taxa(n, de, taxa(n, de).percentual);
  const etapas: Array<[string, string]> = [
    [o.funil.etapas[0], analytics.ativo ? "no provedor" : o.funil.semAnalytics],
    [o.funil.etapas[1], String(new Set(leads.map((l) => l.avaliacao.id)).size)],
    [o.funil.etapas[2], String(total)],
    [o.funil.etapas[3], mostrar(pediram, total)],
    [o.funil.etapas[4], mostrar(responderam, pediram)],
    [o.funil.etapas[5], String(comMarco("reuniao-realizada"))],
    [o.funil.etapas[6], String(comMarco("proposta-enviada"))],
    [o.funil.etapas[7], mostrar(clientes, total)],
  ];

  return (
    <section data-operacao aria-labelledby="operacao-titulo">
      <h2 id="operacao-titulo" className="mb-2 text-[22px] font-bold">
        {o.titulo}
      </h2>
      <p className="text-fg-2 mb-5 max-w-[680px] text-[14px] leading-[1.6]">{o.texto}</p>

      <p
        data-analytics={analytics.ativo ? "ligado" : "desligado"}
        className="border-fg mb-6 border-l-2 pl-3 text-[14px] font-semibold"
      >
        {analytics.ativo ? o.analytics.ligado : o.analytics.desligado}
      </p>

      <h3 className="mb-2 text-[16px] font-bold">{o.funil.titulo}</h3>
      <p className="text-fg-2 mb-3 text-[13px]">{o.funil.texto}</p>
      <ol data-funil className="mb-8 grid gap-2 sm:grid-cols-4">
        {etapas.map(([nome, valor]) => (
          <li key={nome} className="bg-painel border-line border p-3">
            <span className="text-fg-2 block text-[12px]">{nome}</span>
            <b className="tabular-nums">{valor}</b>
          </li>
        ))}
      </ol>

      <h3 className="mb-2 text-[16px] font-bold">{o.legado.titulo}</h3>
      <p data-legado className="text-fg-2 mb-8 max-w-[680px] text-[13px] leading-[1.6]">
        {legado ? o.legado.texto(legado.leads, legado.avaliacoes) : admin.carregando}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="text-[16px] font-bold">{o.tarefas.titulo}</h3>
        <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={() => void processar()} disabled={ocupado}>
          {ocupado ? o.tarefas.processando : o.tarefas.processar}
        </BotaoAcao>
        <span aria-live="polite" className="text-[13px] font-semibold">
          {aviso}
        </span>
      </div>
      <p className="text-fg-2 mb-3 text-[12px]">{o.tarefas.aceitoAviso}</p>
      {carregando || tarefas === null ? (
        <p className="text-[14px]">{admin.carregando}</p>
      ) : tarefas.length === 0 ? (
        <p className="border-line border p-6 text-[14px]">{o.tarefas.vazio}</p>
      ) : (
        <div className={tabela}>
          <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
            <thead className="text-fg-2 text-[12px]">
              <tr className="border-line border-b">
                {Object.values(o.tarefas.colunas).map((c) => (
                  <th key={c} scope="col" className={cabecalho}>
                    {c}
                  </th>
                ))}
                <th scope="col" className={cabecalho}>
                  <span className="sr-only">Ação</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tarefas.map((t) => (
                <tr key={t.id} data-tarefa={t.status} className="border-line border-b align-top">
                  <td className="px-4 py-3">{o.tarefas.tipos[t.tipo]}</td>
                  <td className="px-4 py-3">{nomeDe.get(t.lead_id) ?? "–"}</td>
                  <td className="px-4 py-3 font-semibold">{o.tarefas.estados[t.status] ?? t.status}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {t.tentativas}/{t.max_tentativas}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t.status === "nova-tentativa" || t.status === "pendente"
                      ? new Date(t.tentar_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                      : "–"}
                  </td>
                  <td className="text-fg-2 px-4 py-3">{t.ultimo_erro ?? "–"}</td>
                  <td className="px-4 py-3">
                    {["falhou", "limite", "nao-configurado", "nova-tentativa"].includes(t.status) ? (
                      <button
                        type="button"
                        onClick={() => void reprocessar(t.id)}
                        disabled={ocupado}
                        className="text-verde cursor-pointer font-semibold underline"
                      >
                        {o.tarefas.reprocessar}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Elementos prontos, para quem carrega este módulo sob demanda (cada aba só carrega quando é aberta). */
export const telaFila = (props: Parameters<typeof FilaDeConversas>[0]) => <FilaDeConversas {...props} />;
export const telaOperacao = (props: Parameters<typeof Operacao>[0]) => <Operacao {...props} />;
