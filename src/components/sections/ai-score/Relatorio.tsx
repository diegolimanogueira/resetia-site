"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Barra } from "@/components/sections/ai-score/Placar";
import { BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  alertas,
  desafios,
  dimensoes,
  escalaAreaCurta,
  formulario,
  modulosArea,
  niveis,
  perguntasCentrais,
  questionario,
  relatorio as t,
  resultadoTextos,
} from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import type { Analise } from "@/lib/ai-score/analisar";
import { faixaDe, formatarNota } from "@/lib/ai-score/calcular";
import type { Recomendacao, RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const dimensao = (id: DimensaoId) => dimensoes.find((d) => d.id === id)!;
const nomeNivel = (id: string | null) => niveis.find((n) => n.id === id)?.nome ?? null;

/** Bloco do relatório: rótulo pequeno e o conteúdo. Fica inteiro na mesma página do PDF quando cabe. */
function Bloco({
  titulo,
  nota,
  children,
  className,
}: {
  titulo: string;
  nota?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-14", className)}>
      <h3 className="mb-2 text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">{titulo}</h3>
      {nota ? (
        <p className="text-fg-2 mb-6 max-w-[720px] text-[14px] leading-[1.6]">{nota}</p>
      ) : (
        <div className="mb-6" />
      )}
      {children}
    </div>
  );
}

const corPrioridade = {
  critica: "border-verde bg-verde text-carvao print:text-white",
  alta: "border-verde text-verde",
  media: "border-line text-fg",
  baixa: "border-line text-fg-2",
} as const;

/**
 * Camada 2 liberada: o relatório completo, por regra fixa a partir das respostas. "Baixar" abre a impressão do
 * navegador (Salvar como PDF); o CSS de impressão em globals.css troca o fundo escuro por branco.
 */
export function Relatorio({
  respostas: r,
  resultado,
  recomendacao: rec,
  analise: a,
  cartoes,
  quem,
  focar,
  demo,
}: {
  respostas: RespostasCompletas;
  resultado: Resultado;
  recomendacao: Recomendacao;
  analise: Analise;
  cartoes: Record<string, ReactNode>;
  /** Como o resumo chama a empresa ou a área ("A Empresa X", "Sua empresa"). */
  quem: string;
  focar: boolean;
  /** Supabase desligado (staging, testes): avisa que nada foi enviado. */
  demo: boolean;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focar) titulo.current?.focus();
  }, [focar]);

  const baixar = () => {
    track("ai_score_download", { nivel: resultado.nivel ?? "parcial" });
    window.print();
  };

  const area = r.escopo !== "empresa";
  const alertaPrincipal = a.alertas[0] ? alertas.itens[a.alertas[0]].titulo : null;
  const fases = t.plano.fases.map((f, i) => ({
    ...f,
    acoes: i === t.plano.fases.length - 1 ? [...a.plano[i], t.plano.reavaliar] : a.plano[i],
  }));

  return (
    <div className="container-site">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>{formulario.kicker}</Eyebrow>
          <h2 ref={titulo} tabIndex={-1} className="display-h2 focus:outline-none">
            {t.titulo}
          </h2>
          {demo ? (
            <p data-nao-imprimir className="text-fg-2 border-neutro mt-4 border-l-2 pl-3 text-[13px]">
              {formulario.demo}
            </p>
          ) : null}
        </div>
        <div data-nao-imprimir className="md:max-w-[340px]">
          <BotaoAcao type="button" onClick={baixar} className="w-full md:w-auto">
            {t.baixar}
          </BotaoAcao>
          <p className="text-fg-2 mt-3 text-[13px] leading-[1.5]">{t.baixarApoio}</p>
        </div>
      </div>

      <div className="border-verde/40 break-inside-avoid border bg-[radial-gradient(circle_at_0%_0%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_55%)] p-[24px] md:p-[36px]">
        <p className="eyebrow text-verde mb-4 text-[11px]">{t.resumo.titulo}</p>
        <p className="max-w-[900px] text-[clamp(19px,2vw,24px)] leading-[1.5] font-semibold">
          {t.resumo.texto({
            quem,
            indice: resultado.indice,
            nivel: nomeNivel(resultado.nivel),
            forte: rec.forte ? dimensao(rec.forte).nome : null,
            lacuna: rec.lacunas[0] ? dimensao(rec.lacunas[0]).nome : null,
            alerta: alertaPrincipal,
          })}
        </p>
      </div>

      {a.simulacao ? (
        <Bloco
          titulo={t.simulacao.titulo}
          nota={t.simulacao.texto(a.simulacao.alvo, a.simulacao.de, a.simulacao.para, nomeNivel(a.simulacao.nivel)!)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { rotulo: t.simulacao.hoje, valor: a.simulacao.de, nivel: resultado.nivel },
              { rotulo: t.simulacao.depois, valor: a.simulacao.para, nivel: a.simulacao.nivel },
            ].map((x, i) => (
              <div
                key={x.rotulo}
                className={cn("break-inside-avoid border p-[22px]", i ? "border-verde/50" : "border-line bg-painel")}
              >
                <p className="text-fg-2 mb-3 text-[13px]">{x.rotulo}</p>
                <p className="mb-1 flex items-baseline gap-2">
                  <span className="text-[44px] leading-none font-bold tracking-[-0.03em] tabular-nums">{x.valor}</span>
                  <span className="text-fg-2 text-[14px] font-semibold">{resultadoTextos.de100}</span>
                </p>
                <p className={cn("mb-4 text-[15px] font-bold", i ? "text-verde" : "text-fg")}>{nomeNivel(x.nivel)}</p>
                <Barra valor={x.valor} />
              </div>
            ))}
          </div>
          <p className="text-fg-2 mt-4 text-[14px]">
            <span className="text-fg font-semibold">{t.simulacao.sobem(a.simulacao.alvo)}</span>{" "}
            {a.simulacao.dimensoes.map((id) => dimensao(id).nome).join(" · ")}
          </p>
        </Bloco>
      ) : null}

      <Bloco titulo={t.prioridades.titulo} nota={t.prioridades.nota}>
        <ol className="border-line border-t">
          {a.prioridades.map((p, i) => (
            <li
              key={p.dimensao}
              className="border-line grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b py-4 sm:grid-cols-[28px_minmax(0,1.2fr)_minmax(0,1fr)_110px]"
            >
              <span className="text-fg-2 col-start-1 row-start-1 text-[13px] font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-start-2 row-start-1">
                <span className="block text-[16px] font-semibold">{dimensao(p.dimensao).nome}</span>
                {p.desafio ? (
                  <span className="text-verde mt-0.5 block text-[12px] font-semibold">{t.prioridades.desafio}</span>
                ) : null}
              </span>
              <span className="col-span-3 col-start-1 row-start-2 flex items-center gap-3 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                <span className="w-[44px] text-[15px] font-bold tabular-nums">{formatarNota(p.nota)}</span>
                <Barra valor={p.nota} />
              </span>
              <span
                className={cn(
                  "col-start-3 row-start-1 justify-self-end border px-2.5 py-1 text-[12px] font-bold sm:col-start-4",
                  corPrioridade[p.prioridade],
                )}
                data-imprimir-cor
              >
                {t.prioridades.rotulos[p.prioridade]}
              </span>
            </li>
          ))}
        </ol>
      </Bloco>

      <Bloco titulo={t.leitura}>
        <div className="grid gap-3">
          {dimensoes.map((d) => {
            const nota = resultado.dimensoes[d.id];
            const faixa = nota === null ? null : faixaDe(nota);
            const perguntas = a.respostas.filter((x) => x.dimensao === d.id);
            return (
              <article key={d.id} className="border-line bg-painel break-inside-avoid border p-[22px] md:p-[30px]">
                <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
                  <div>
                    <p className="mb-3 flex items-baseline justify-between gap-4">
                      <span className="text-[19px] leading-[1.2] font-bold">
                        <span className="text-verde mr-2 text-[13px]">{d.num}</span>
                        {d.nome}
                      </span>
                      <span className="text-[22px] font-bold tabular-nums">
                        {nota === null ? questionario.naoSei : formatarNota(nota)}
                      </span>
                    </p>
                    <Barra valor={nota} />
                    {faixa ? (
                      <>
                        <p className="text-verde eyebrow mt-4 mb-2 text-[11px]">{t.faixas[faixa]}</p>
                        <p className="text-fg-2 text-[15px] leading-[1.65]">{d.leitura[faixa]}</p>
                      </>
                    ) : null}
                  </div>
                  <ul className="grid content-start gap-4">
                    {perguntas.map((x) => {
                      const p = perguntasCentrais[x.indice];
                      return (
                        <li key={p.id} className="border-line border-t pt-4 text-[14px] leading-[1.55]">
                          <span className="text-fg-2 block">{area ? p.texto.area : p.texto.empresa}</span>
                          <span className="mt-2 grid grid-cols-[110px_1fr] gap-2">
                            <span className="text-fg-2 text-[12px] font-semibold tracking-[.06em] uppercase">
                              {t.hoje}
                            </span>
                            <span className="font-semibold">
                              {x.atual === null || x.atual === undefined
                                ? questionario.naoSei
                                : p.alternativas[x.atual]}
                            </span>
                          </span>
                          {x.atual === null ? (
                            <span className="mt-1 grid grid-cols-[110px_1fr] gap-2">
                              <span className="text-verde text-[12px] font-semibold tracking-[.06em] uppercase">
                                {t.pontosCegos.titulo}
                              </span>
                              <span>{t.pontosCegos.nota}</span>
                            </span>
                          ) : (
                            <span className="mt-1 grid grid-cols-[110px_1fr] gap-2">
                              <span className="text-verde text-[12px] font-semibold tracking-[.06em] uppercase">
                                {t.proximo}
                              </span>
                              <span>{x.proximo ?? t.topo}</span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </Bloco>

      <Bloco titulo={t.pontosCegos.titulo} nota={t.pontosCegos.nota}>
        {a.pontosCegos.length ? (
          <ul className="grid gap-2">
            {a.pontosCegos.map((i) => {
              const p = perguntasCentrais[i];
              return (
                <li key={p.id} className="border-line bg-painel flex gap-3 border px-5 py-4 text-[15px] leading-[1.5]">
                  <span className="text-verde shrink-0 text-[13px] font-bold">{dimensao(p.dimensao).nome}</span>
                  <span>{area ? p.texto.area : p.texto.empresa}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[15px]">{t.pontosCegos.nenhum}</p>
        )}
      </Bloco>

      <Bloco titulo={t.plano.titulo} nota={t.plano.nota}>
        <ol className="grid gap-3 md:grid-cols-3">
          {fases.map((f, i) => (
            <li key={f.periodo} className="border-line bg-painel break-inside-avoid border p-[22px]">
              <p className="text-verde text-[12px] font-bold tracking-[.08em] uppercase">{f.periodo}</p>
              <p className="mt-1 mb-4 text-[19px] font-bold">
                <span className="text-fg-2 mr-2 text-[13px]">{String(i + 1).padStart(2, "0")}</span>
                {f.nome}
              </p>
              <ul className="grid gap-3">
                {f.acoes.map((acao) => (
                  <li key={acao} className="border-line border-t pt-3 text-[14px] leading-[1.55]">
                    {acao}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Bloco>

      {r.areas.length ? (
        <Bloco titulo={t.areas}>
          <div className="grid gap-3 md:grid-cols-2">
            {r.areas.map((ar) => {
              const m = modulosArea.find((x) => x.area === ar)!;
              const indice = resultado.areas[ar] ?? null;
              return (
                <div key={ar} className="border-line bg-painel break-inside-avoid border p-[22px] md:p-[30px]">
                  <p className="mb-4 flex items-baseline justify-between gap-4 text-[19px] font-bold">
                    <span>{m.nome}</span>
                    <span className="tabular-nums">{indice === null ? questionario.naoSei : formatarNota(indice)}</span>
                  </p>
                  <Barra valor={indice} />
                  <ul className="mt-5 grid gap-3">
                    {m.perguntas.map((p, i) => {
                      const v = r.porArea[ar]?.[i];
                      return (
                        <li key={p.id} className="border-line border-t pt-3 text-[14px] leading-[1.5]">
                          <span className="text-fg-2 block">{p.texto}</span>
                          <span className="mt-1 block font-semibold">
                            {v === null || v === undefined ? questionario.naoSei : escalaAreaCurta[v]}
                            {typeof v === "number" && v < 4 ? (
                              <span className="text-verde font-normal">
                                {" "}
                                · {t.proximo}: {escalaAreaCurta[v + 1]}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </Bloco>
      ) : null}

      {rec.solucoes.length ? (
        <Bloco titulo={t.solucoes} nota={t.solucoesNota}>
          <div className="grid gap-[14px] sm:grid-cols-2">
            {rec.solucoes.map((slug) => {
              const pq = a.porque[slug];
              const motivos = [
                ...(pq?.dimensoes ?? []).map((x) => t.porque.dimensao(dimensao(x.id).nome, formatarNota(x.nota))),
                ...(pq?.desafios ?? []).map((id) => t.porque.desafio(desafios.find((d) => d.id === id)!.label)),
              ];
              return (
                <div key={slug} className="break-inside-avoid">
                  <ul className="mb-3 grid gap-1.5">
                    {(motivos.length ? motivos : [t.porque.inicio]).map((m) => (
                      <li key={m} className="flex gap-2 text-[14px] leading-[1.5]">
                        <span aria-hidden="true" className="text-verde">
                          ✓
                        </span>
                        {m}
                      </li>
                    ))}
                  </ul>
                  {cartoes[slug]}
                </div>
              );
            })}
          </div>
        </Bloco>
      ) : null}
    </div>
  );
}
