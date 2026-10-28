"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Barra } from "@/components/sections/ai-score/Placar";
import { BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  dimensoes,
  escalaAreaCurta,
  formulario,
  modulosArea,
  questionario,
  relatorio as t,
} from "@/content/ai-score-questionario";
import { faixaDe, formatarNota } from "@/lib/ai-score/calcular";
import type { Recomendacao, RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

/**
 * Camada 2 liberada: leitura de cada dimensão, aplicação por atividade nas áreas avaliadas e as soluções
 * indicadas (cards prontos do servidor). "Baixar" abre a impressão do navegador (Salvar como PDF);
 * o CSS de impressão em globals.css troca o fundo escuro por branco.
 */
export function Relatorio({
  respostas,
  resultado,
  recomendacao,
  cartoes,
  focar,
}: {
  respostas: RespostasCompletas;
  resultado: Resultado;
  recomendacao: Recomendacao;
  cartoes: Record<string, ReactNode>;
  focar: boolean;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focar) titulo.current?.focus();
  }, [focar]);

  const baixar = () => {
    track("ai_score_download", { nivel: resultado.nivel ?? "parcial" });
    window.print();
  };

  return (
    <div className="container-site">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>{formulario.kicker}</Eyebrow>
          <h2 ref={titulo} tabIndex={-1} className="display-h2 focus:outline-none">
            {t.titulo}
          </h2>
          {!supabase.ativo ? (
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

      <h3 className="eyebrow text-fg-2 mb-5 text-[11px]">{t.leitura}</h3>
      <ol className="grid gap-3 md:grid-cols-2">
        {dimensoes.map((d) => {
          const nota = resultado.dimensoes[d.id];
          const faixa = nota === null ? null : faixaDe(nota);
          return (
            <li key={d.id} className="border-line bg-painel break-inside-avoid border p-[24px] md:p-[30px]">
              <p className="mb-4 flex items-baseline justify-between gap-4">
                <span className="text-[19px] leading-[1.2] font-bold">
                  <span className="text-verde mr-2 text-[13px]">{d.num}</span>
                  {d.nome}
                </span>
                <span className="text-[19px] font-bold tabular-nums">
                  {nota === null ? questionario.naoSei : formatarNota(nota)}
                </span>
              </p>
              <Barra valor={nota} />
              {faixa ? (
                <>
                  <p className="text-verde eyebrow mt-5 mb-2 text-[11px]">{t.faixas[faixa]}</p>
                  <p className="text-fg-2 text-[15px] leading-[1.65]">{d.leitura[faixa]}</p>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>

      {respostas.areas.length ? (
        <>
          <h3 className="eyebrow text-fg-2 mt-14 mb-5 text-[11px]">{t.areas}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {respostas.areas.map((a) => {
              const m = modulosArea.find((x) => x.area === a)!;
              const indice = resultado.areas[a] ?? null;
              return (
                <div key={a} className="border-line bg-painel break-inside-avoid border p-[24px] md:p-[30px]">
                  <p className="mb-4 flex items-baseline justify-between gap-4 text-[19px] font-bold">
                    <span>{m.nome}</span>
                    <span className="tabular-nums">{indice === null ? questionario.naoSei : formatarNota(indice)}</span>
                  </p>
                  <Barra valor={indice} />
                  <ul className="mt-5 grid gap-3">
                    {m.perguntas.map((p, i) => {
                      const v = respostas.porArea[a]?.[i];
                      return (
                        <li key={p.id} className="border-line border-t pt-3 text-[14px] leading-[1.5]">
                          <span className="text-fg-2 block">{p.texto}</span>
                          <span className="mt-1 block font-semibold">
                            {v === null || v === undefined ? questionario.naoSei : escalaAreaCurta[v]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {recomendacao.solucoes.length ? (
        <>
          <h3 className="eyebrow text-fg-2 mt-14 mb-2 text-[11px]">{t.solucoes}</h3>
          <p className="text-fg-2 mb-6 text-[14px]">{t.solucoesNota}</p>
          <div className="grid gap-[14px] sm:grid-cols-2">
            {recomendacao.solucoes.map((slug) => (
              <div key={slug} className="break-inside-avoid">
                {cartoes[slug]}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
