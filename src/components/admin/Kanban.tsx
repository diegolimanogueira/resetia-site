"use client";

import { useState } from "react";
import { admin } from "@/content/admin";
import type { StatusLead } from "@/content/types";
import { atrasado, dataBr, rotulos, type LeadVisao } from "@/lib/ai-score/leads";
import { cn } from "@/lib/utils";
import { waUrl } from "@/lib/whatsapp";

const ETAPAS = Object.keys(admin.status) as StatusLead[];
const selo = "border-line inline-block border px-1.5 py-0.5 text-[11px] font-semibold";

/** Card de um lead no funil: arrastável, com atalho para o WhatsApp e o seletor "Mover para" (teclado e celular). */
function CartaoLead({
  l,
  hoje,
  aoAbrir,
  aoMover,
  aoWhatsapp,
}: {
  l: LeadVisao;
  hoje: string;
  aoAbrir: (id: string) => void;
  aoMover: (id: string, status: StatusLead) => void;
  aoWhatsapp: (id: string) => void;
}) {
  const { lead, resultado } = l;
  const vencido = atrasado(lead, hoje);
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      data-lead={lead.id}
      className="border-line bg-painel hover:border-neutro/50 min-w-0 cursor-grab border p-3 transition-colors active:cursor-grabbing"
    >
      <button
        type="button"
        onClick={() => aoAbrir(lead.id)}
        aria-label={admin.funil.abrir(lead.nome)}
        className="hover:text-verde block w-full cursor-pointer text-left"
      >
        <span className="block text-[14px] leading-[1.3] font-bold">{lead.nome}</span>
        <span className="text-fg-2 block truncate text-[12px]">{lead.empresa ?? lead.email}</span>
      </button>
      <p className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={selo}>
          <b className="tabular-nums">{resultado?.indice ?? "–"}</b> {rotulos.nivel(resultado?.nivel ?? null)}
        </span>
        <span className={cn(selo, "tabular-nums")}>
          {admin.colunas.leadScore} {l.leadScore}
        </span>
        {lead.pediu_contato ? (
          <span className={cn(selo, "border-verde text-verde")}>{admin.detalhe.pediuContato}</span>
        ) : null}
      </p>
      {lead.proximo_contato || lead.responsavel ? (
        <p className="text-fg-2 mt-2 text-[11px] leading-[1.4]">
          {lead.proximo_contato ? (
            <span className={cn(vencido && "text-fg font-bold")}>
              {admin.detalhe.proximoContato}: {dataBr(`${lead.proximo_contato}T12:00:00`)}
              {vencido ? ` · ${admin.detalhe.atrasado}` : ""}
            </span>
          ) : null}
          {lead.responsavel ? <span className="block truncate">{lead.responsavel}</span> : null}
        </p>
      ) : null}
      <div className="mt-3 grid gap-2">
        <label className="block">
          <span className="sr-only">
            {admin.funil.mover} ({lead.nome})
          </span>
          <select
            value={lead.status}
            onChange={(e) => aoMover(lead.id, e.target.value as StatusLead)}
            className="border-line bg-escuro text-fg w-full border px-1.5 py-1 text-[12px]"
          >
            {ETAPAS.map((s) => (
              <option key={s} value={s}>
                {admin.status[s]}
              </option>
            ))}
          </select>
        </label>
        {lead.whatsapp ? (
          <a
            href={waUrl(admin.mensagem(lead.nome, resultado?.indice ?? null), lead.whatsapp)}
            target="_blank"
            rel="noopener"
            onClick={() => aoWhatsapp(lead.id)}
            className="text-verde text-[12px] font-bold"
          >
            {admin.detalhe.acoes.whatsapp} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}

/** Funil de vendas: uma coluna por etapa (status do lead). Soltar um card numa coluna muda a etapa. */
export function Kanban({
  leads,
  hoje,
  aoAbrir,
  aoMover,
  aoWhatsapp,
}: {
  leads: LeadVisao[];
  hoje: string;
  aoAbrir: (id: string) => void;
  aoMover: (id: string, status: StatusLead) => void;
  aoWhatsapp: (id: string) => void;
}) {
  const [sobre, setSobre] = useState<StatusLead | null>(null);
  return (
    <div>
      <p className="text-fg-2 mb-3 text-[13px]">{admin.funil.arraste}</p>
      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1180px] grid-cols-6 gap-3" role="list" aria-label={admin.funil.rotulo}>
          {ETAPAS.map((etapa) => {
            const itens = leads.filter((l) => l.lead.status === etapa);
            return (
              <div
                key={etapa}
                role="listitem"
                aria-label={`${admin.status[etapa]}: ${itens.length}`}
                data-etapa={etapa}
                onDragOver={(e) => {
                  e.preventDefault();
                  setSobre(etapa);
                }}
                onDragLeave={() => setSobre((atual) => (atual === etapa ? null : atual))}
                onDrop={(e) => {
                  e.preventDefault();
                  setSobre(null);
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) aoMover(id, etapa);
                }}
                className={cn(
                  "bg-escuro min-h-[320px] min-w-0 border p-2 transition-colors",
                  sobre === etapa ? "border-verde" : "border-line",
                )}
              >
                <h2 className="mb-2 flex items-baseline justify-between px-1 text-[13px] font-bold">
                  {admin.status[etapa]}
                  <span className="text-fg-2 tabular-nums">{itens.length}</span>
                </h2>
                {itens.length ? (
                  <ul className="grid gap-2">
                    {itens.map((l) => (
                      <CartaoLead
                        key={l.lead.id}
                        l={l}
                        hoje={hoje}
                        aoAbrir={aoAbrir}
                        aoMover={aoMover}
                        aoWhatsapp={aoWhatsapp}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-fg-2 px-1 py-3 text-[12px]">{admin.funil.vazio}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
