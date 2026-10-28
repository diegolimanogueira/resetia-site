"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { BarrasDimensoes } from "@/components/sections/ai-score/Placar";
import { BotaoAcao } from "@/components/ui/botao";
import { classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import {
  escalaAreaCurta,
  modulosArea,
  perguntasCentrais,
  questionario,
  resultadoTextos,
} from "@/content/ai-score-questionario";
import type { StatusLead } from "@/content/types";
import { formatarNota } from "@/lib/ai-score/calcular";
import { dataBr, rotulos, type LeadVisao } from "@/lib/ai-score/leads";
import { asset } from "@/lib/asset";
import { waUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const d = admin.detalhe;

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="border-line border-t pt-5">
      <h3 className="eyebrow text-fg-2 mb-4 text-[11px]">{titulo}</h3>
      {children}
    </div>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1 text-[14px]">
      <dt className="text-fg-2">{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const etiqueta = "border-line inline-block border px-2 py-0.5 text-[12px] font-semibold";

/** Detalhe de um lead: contato, perfil, resultado recalculado, respostas, origem e o acompanhamento (status e notas). */
export function DetalheLead({
  visao: v,
  nomesSolucoes,
  aoSalvar,
  aoFechar,
}: {
  visao: LeadVisao;
  nomesSolucoes: Record<string, string>;
  aoSalvar: (campos: { status: StatusLead; notas: string | null }) => Promise<boolean>;
  aoFechar: () => void;
}) {
  const { lead: l, avaliacao: a, resultado, respostas } = v;
  const [status, setStatus] = useState<StatusLead>(l.status);
  const [notas, setNotas] = useState(l.notas ?? "");
  const [estado, setEstado] = useState<"" | "salvando" | "salvo" | "erro">("");

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    setEstado((await aoSalvar({ status, notas: notas.trim() || null })) ? "salvo" : "erro");
  }

  const area = a.escopo !== "empresa";

  return (
    <section id="detalhe-lead" aria-label={d.rotulo} className="border-line bg-painel border p-[22px] md:p-[30px]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] leading-[1.15] font-bold tracking-[-0.02em]">{l.nome}</h2>
          <p className="text-fg-2 mt-1 text-[15px]">{l.empresa}</p>
          <p className="text-fg-2 mt-1 text-[13px]">
            {d.criadoEm} {dataBr(l.criado_em)}
          </p>
        </div>
        <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={aoFechar}>
          {d.fechar}
        </BotaoAcao>
      </div>

      <div className="grid gap-6">
        <form onSubmit={salvar} className="border-verde/40 grid gap-4 border p-5">
          <h3 className="eyebrow text-verde text-[11px]">{d.crm}</h3>
          <div>
            <label htmlFor="detalhe-status" className="mb-2 block text-[14px] font-semibold">
              {d.statusRotulo}
            </label>
            <select
              id="detalhe-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusLead)}
              className={classesEntrada}
            >
              {(Object.keys(admin.status) as StatusLead[]).map((s) => (
                <option key={s} value={s}>
                  {admin.status[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="detalhe-notas" className="mb-2 block text-[14px] font-semibold">
              {d.notas}
            </label>
            <textarea
              id="detalhe-notas"
              rows={4}
              maxLength={4000}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={classesEntrada}
            />
          </div>
          <div className="flex items-center gap-4">
            <BotaoAcao type="submit" tamanho="sm" disabled={estado === "salvando"}>
              {estado === "salvando" ? d.salvando : d.salvar}
            </BotaoAcao>
            <span aria-live="polite" className="text-[13px] font-semibold">
              {estado === "salvo" ? d.salvo : estado === "erro" ? d.erroSalvar : ""}
            </span>
          </div>
        </form>

        <Bloco titulo={d.contato}>
          <dl>
            <Linha rotulo={d.email}>
              <a href={`mailto:${l.email}`} className="underline underline-offset-2">
                {l.email}
              </a>{" "}
              {l.email_pessoal ? <span className={etiqueta}>{d.emailPessoal}</span> : null}
            </Linha>
            {l.whatsapp ? (
              <Linha rotulo={d.whatsapp}>
                <a
                  href={waUrl(admin.mensagem(l.nome, a.indice), l.whatsapp)}
                  target="_blank"
                  rel="noopener"
                  className="text-verde font-semibold"
                >
                  +{l.whatsapp} <span aria-hidden="true">↗</span>
                </a>
              </Linha>
            ) : null}
            <Linha rotulo={d.leadScore}>
              <b>{v.leadScore}</b>
              <span className="text-fg-2">{resultadoTextos.de100}</span>
            </Linha>
          </dl>
          <p className="mt-3 flex flex-wrap gap-2">
            {l.pediu_contato ? <span className={cn(etiqueta, "border-verde text-verde")}>{d.pediuContato}</span> : null}
            {l.consentimento_marketing ? <span className={etiqueta}>{d.marketing}</span> : null}
          </p>
        </Bloco>

        <Bloco titulo={d.perfil}>
          <dl>
            <Linha rotulo={d.papel}>{rotulos.papel(a.papel)}</Linha>
            <Linha rotulo={d.porte}>{rotulos.porte(a.porte)}</Linha>
            <Linha rotulo={d.segmento}>{rotulos.segmento(a.segmento)}</Linha>
            <Linha rotulo={d.visao}>{rotulos.escopo(a.escopo)}</Linha>
            <Linha rotulo={d.horizonte}>{rotulos.horizonte(a.horizonte)}</Linha>
            <Linha rotulo={d.desafios}>{(respostas?.desafios ?? []).map(rotulos.desafio).join(" · ")}</Linha>
          </dl>
        </Bloco>

        <Bloco titulo={d.resultado}>
          <p className="mb-5 flex items-baseline gap-3">
            <span className="text-[40px] leading-none font-bold">{a.indice ?? "–"}</span>
            <span className="text-verde font-bold">{rotulos.nivel(a.nivel)}</span>
          </p>
          {resultado ? <BarrasDimensoes notas={resultado.dimensoes} /> : null}
          {resultado && Object.keys(resultado.areas).length ? (
            <p className="mt-5 text-[14px]">
              <span className="text-fg-2">{d.areas}: </span>
              {Object.entries(resultado.areas)
                .map(([ar, n]) => `${rotulos.area(ar)} ${n === null || n === undefined ? "–" : formatarNota(n)}`)
                .join(" · ")}
            </p>
          ) : null}
          {v.solucoes.length ? (
            <p className="mt-2 text-[14px]">
              <span className="text-fg-2">{d.solucoes}: </span>
              {v.solucoes.map((s) => nomesSolucoes[s] ?? s).join(" · ")}
            </p>
          ) : null}
          <a
            href={asset(`/ai-score/resultado/#${a.codigo}`)}
            target="_blank"
            rel="noopener"
            className="text-verde mt-4 inline-block text-[14px] font-bold"
          >
            {d.verResultado} <span aria-hidden="true">↗</span>
          </a>
        </Bloco>

        {respostas ? (
          <Bloco titulo={d.respostas}>
            <ol className="grid gap-3">
              {perguntasCentrais.map((p, i) => {
                const r = respostas.centrais[i];
                return (
                  <li key={p.id} className="text-[13px] leading-[1.5]">
                    <span className="text-fg-2 block">{area ? p.texto.area : p.texto.empresa}</span>
                    <span className="font-semibold">
                      {r === null || r === undefined ? questionario.naoSei : `${r} · ${p.alternativas[r]}`}
                    </span>
                  </li>
                );
              })}
              {respostas.areas.flatMap((ar) =>
                modulosArea
                  .find((m) => m.area === ar)!
                  .perguntas.map((p, i) => {
                    const r = respostas.porArea[ar]?.[i];
                    return (
                      <li key={p.id} className="text-[13px] leading-[1.5]">
                        <span className="text-fg-2 block">{p.texto}</span>
                        <span className="font-semibold">
                          {r === null || r === undefined ? questionario.naoSei : `${r} · ${escalaAreaCurta[r]}`}
                        </span>
                      </li>
                    );
                  }),
              )}
            </ol>
          </Bloco>
        ) : null}

        <Bloco titulo={d.origem}>
          {Object.keys(a.origem ?? {}).length ? (
            <dl>
              {Object.entries(a.origem).map(([k, valor]) => (
                <Linha key={k} rotulo={k}>
                  <span className="break-all">{valor}</span>
                </Linha>
              ))}
            </dl>
          ) : (
            <p className="text-[14px]">{d.semOrigem}</p>
          )}
        </Bloco>
      </div>
    </section>
  );
}
