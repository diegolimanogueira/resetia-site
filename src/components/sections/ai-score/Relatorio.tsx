"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Barra } from "@/components/sections/ai-score/Placar";
import { BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
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
import type { Devolutiva } from "@/lib/ai-score/devolutiva";
import { formatarNota } from "@/lib/ai-score/calcular";
import type { EmailEstado } from "@/lib/ai-score/navegador";
import type { Biblioteca } from "@/content/ai-score-dicas";
import { alvosDasDicas, lerDicas, montarDicas, type Dicas } from "@/lib/ai-score/dicas";
import type { RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { chamarFuncao } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * O aprofundamento é opcional e vem depois do relatório: o código só é baixado quando ele vai aparecer, fora do peso
 * da página de resultado. (Um `import()` direto pesa menos que `next/dynamic` nesta rota, que está no limite.)
 */
function useAprofundamento(ativo: boolean) {
  const [modulo, setModulo] = useState<typeof import("@/components/sections/ai-score/Aprofundamento") | null>(null);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    void import("@/components/sections/ai-score/Aprofundamento").then((m) => {
      if (vivo) setModulo(m);
    });
    return () => {
      vivo = false;
    };
  }, [ativo]);
  return modulo?.aprofundamento ?? null;
}

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

/** O que precisa estar pronto, com a situação de cada condição (atendida, pendente ou sem resposta). */
function Condicoes({
  titulo,
  itens,
}: {
  titulo: string;
  itens: Devolutiva["sintese"]["indicacoes"]["itens"][number]["condicoes"];
}) {
  if (!itens.length) return null;
  return (
    <div className="mb-3">
      <p className="text-[13px] font-semibold">{titulo}</p>
      <ul className="mt-1 grid gap-1">
        {itens.map((c) => (
          <li key={c.texto} data-condicao={c.situacao} className="text-[14px] leading-[1.5]">
            {c.texto}: <span className={c.situacao === "atendida" ? "text-verde" : "font-semibold"}>{c.rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const corPrioridade = {
  critica: "border-verde-vivo bg-verde-vivo text-carvao print:text-white",
  alta: "border-verde text-verde",
  media: "border-line text-fg",
} as const;

/**
 * Camada 2 liberada: o relatório completo, por regra fixa a partir das respostas. "Baixar" abre a impressão do
 * navegador (Salvar como PDF); o CSS de impressão em globals.css troca o fundo escuro por branco.
 */
export function Relatorio({
  respostas: r,
  resultado,
  devolutiva,
  contexto,
  cartoes,
  focar,
  demo,
  avaliacaoId,
  leadId,
  buscarDicas = false,
  chave,
  email,
}: {
  respostas: RespostasCompletas;
  resultado: Resultado;
  /** A devolutiva inteira: a mesma da tela, do PDF e do e-mail. */
  devolutiva: Devolutiva;
  /** Para o PDF: quem é, de que empresa, a data, e se é a página de exemplo. */
  contexto: { nome: string | null; empresa: string | null; data: string; exemplo: boolean };
  cartoes: Record<string, ReactNode>;
  focar: boolean;
  /** Supabase desligado (staging, testes): avisa que nada foi enviado. */
  demo: boolean;
  avaliacaoId?: string;
  leadId?: string;
  /** Pede as dicas à função (IA); sem isso, ou se ela falhar, usa a biblioteca. */
  buscarDicas?: boolean;
  /** Chave do lead (leads novos): sem ela as dicas por IA não são entregues. */
  chave?: string;
  /** Estado real do envio do relatório por e-mail e o endereço, como o servidor informa. */
  email?: { estado: EmailEstado; endereco: string };
}) {
  const { analise: a, leituras, cobertura, sintese } = devolutiva;
  const titulo = useRef<HTMLHeadingElement>(null);
  const podeAprofundar = !demo && Boolean(avaliacaoId && leadId && chave);
  const aprofundamento = useAprofundamento(podeAprofundar);
  useEffect(() => {
    if (focar) titulo.current?.focus();
  }, [focar]);

  // Dicas: com a função disponível, as dicas da IA (escritor + revisor); sem ela, ou se falhar, a biblioteca,
  // carregada só quando o relatório aparece (fica fora do JavaScript inicial da página).
  const alvos = useMemo(() => alvosDasDicas(resultado), [resultado]);
  const [biblioteca, setBiblioteca] = useState<Biblioteca | null>(null);
  useEffect(() => {
    let vivo = true;
    void import("@/content/ai-score-dicas").then((m) => {
      if (vivo) setBiblioteca(m.biblioteca);
    });
    return () => {
      vivo = false;
    };
  }, []);
  const reserva = useMemo(() => (biblioteca ? montarDicas(biblioteca, r, alvos) : null), [biblioteca, r, alvos]);
  const pedir = buscarDicas && Boolean(avaliacaoId && leadId) && alvos.length > 0;
  const [daFuncao, setDaFuncao] = useState<Dicas | "falhou" | null>(null);
  useEffect(() => {
    if (!pedir) return;
    let vivo = true;
    void chamarFuncao(
      { acao: "dicas", avaliacao_id: avaliacaoId, lead_id: leadId, ...(chave ? { chave } : {}) },
      { timeout: 90_000 },
    ).then((res) => {
      if (vivo) setDaFuncao((res.ok && lerDicas(res.dados, alvos)) || "falhou");
    });
    return () => {
      vivo = false;
    };
  }, [pedir, avaliacaoId, leadId, chave, alvos]);
  const dicas: Dicas | null = !pedir ? reserva : daFuncao === null ? null : daFuncao === "falhou" ? reserva : daFuncao;

  // O PDF é gerado aqui, no navegador, e só então o código dele é baixado.
  const [pdf, setPdf] = useState<"" | "gerando" | "falhou">("");
  const baixar = () => {
    setPdf("gerando");
    track("ai_score_download", { nivel: resultado.nivel ?? "parcial", formato: "pdf" });
    void import("@/lib/ai-score/pdf/baixar")
      .then((m) => m.baixarPdf({ devolutiva, respostas: r, ...contexto, avaliacaoId, dicas }))
      .then(
        () => setPdf(""),
        () => setPdf("falhou"),
      );
  };
  const imprimir = () => {
    track("ai_score_download", { nivel: resultado.nivel ?? "parcial", formato: "impressao" });
    window.print();
  };

  const area = r.escopo !== "empresa";
  return (
    <div className="container-site">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>{formulario.kicker}</Eyebrow>
          <h2 ref={titulo} tabIndex={-1} className="display-h2 focus:outline-none">
            {t.titulo}
          </h2>
          {demo ? (
            <p data-nao-imprimir className="text-fg-2 border-fg mt-4 border-l-2 pl-3 text-[13px]">
              {formulario.demo}
            </p>
          ) : null}
          {email ? (
            <p
              data-nao-imprimir
              data-email-estado={email.estado}
              className={cn("mt-4 text-[14px] font-semibold", email.estado === "aceito" ? "text-verde" : "text-fg-2")}
            >
              {t.email[email.estado](email.endereco)}
            </p>
          ) : null}
        </div>
        <div data-nao-imprimir className="md:max-w-[340px]">
          <div className="flex flex-wrap gap-3">
            <BotaoAcao type="button" onClick={baixar} disabled={pdf === "gerando"} className="w-full md:w-auto">
              {pdf === "gerando" ? t.gerandoPdf : t.baixar}
            </BotaoAcao>
            <BotaoAcao type="button" variante="secundario" onClick={imprimir} className="w-full md:w-auto">
              {t.imprimir}
            </BotaoAcao>
          </div>
          <p aria-live="polite" className="text-fg-2 mt-3 text-[13px] leading-[1.5]">
            {pdf === "falhou" ? t.pdfFalhou : t.baixarApoio}
          </p>
        </div>
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
        {a.prioridades.length ? (
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
                  {p.criterio ? (
                    <span className="text-fg-2 mt-0.5 block text-[12px]">{sintese.lacunas.criterios[p.criterio]}</span>
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
        ) : (
          <p className="text-[15px]">{sintese.lacunas.vazio}</p>
        )}
      </Bloco>

      <Bloco titulo={sintese.oportunidades.titulo} nota={sintese.oportunidades.nota}>
        {sintese.oportunidades.itens.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {sintese.oportunidades.itens.map((o) => (
              <li
                key={o.id}
                data-oportunidade={o.id}
                data-situacao={o.situacao}
                className="border-line bg-painel break-inside-avoid border p-[22px]"
              >
                <p className="text-[17px] font-bold">{o.titulo}</p>
                <p
                  className={cn(
                    "mt-1 text-[13px] font-semibold",
                    o.situacao === "sustentado" ? "text-verde" : "text-fg",
                  )}
                >
                  {o.rotuloSituacao}
                </p>
                <p className="text-fg-2 mt-3 text-[14px] leading-[1.6]">{o.hipotese}</p>
                <p className="mt-3 text-[13px] font-semibold">{sintese.oportunidades.perguntas}</p>
                <ul className="mt-1 mb-3 grid gap-1 text-[14px]">
                  {o.perguntas.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
                <Condicoes titulo={sintese.oportunidades.condicoes} itens={o.condicoes} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px]">{sintese.oportunidades.vazio}</p>
        )}
      </Bloco>

      <Bloco titulo={sintese.dicas.titulo} nota={sintese.dicas.nota}>
        {!alvos.length ? (
          <p className="text-[15px]">{sintese.dicas.nenhuma}</p>
        ) : !dicas ? (
          <p aria-live="polite" className="border-line bg-painel border p-[22px] text-[15px]">
            {sintese.dicas.carregando}
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {dicas.dimensoes.map((x) => (
                <article
                  key={x.id}
                  className="border-line border-l-verde bg-painel break-inside-avoid border border-l-2 p-[22px]"
                >
                  <p className="mb-4 flex items-baseline justify-between gap-4">
                    <span className="text-[18px] font-bold">{dimensao(x.id).nome}</span>
                    <span className="text-[17px] font-bold tabular-nums">
                      {formatarNota(resultado.dimensoes[x.id] ?? 0)}
                    </span>
                  </p>
                  <ol className="grid gap-3">
                    {x.dicas.map((d, i) => (
                      <li key={d} className="grid grid-cols-[24px_1fr] gap-2 text-[15px] leading-[1.55]">
                        <span className="text-verde font-bold tabular-nums">{i + 1}.</span>
                        {d}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
            <p className="text-fg-2 mt-4 text-[13px]" data-fonte-dicas={dicas.fonte}>
              {sintese.dicas.fonte[dicas.fonte]}
            </p>
          </>
        )}
      </Bloco>

      <Bloco titulo={t.leitura}>
        <div className="grid gap-3">
          {dimensoes.map((d) => {
            const nota = resultado.dimensoes[d.id];
            const sobre = cobertura.porDimensao[d.id];
            const perguntas = a.respostas.filter((x) => x.dimensao === d.id);
            // A citação da resposta e o próximo estágio já aparecem por pergunta, ao lado; aqui vai a leitura.
            const leitura = leituras[d.id].afirmacoes.filter(
              (x) => !x.id.includes(".declarado.") && !x.id.includes(".proximo."),
            );
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
                    <p className="text-verde eyebrow mt-4 mb-2 text-[11px]">
                      {resultadoTextos.cobertura.naDimensao(sobre.validas, sobre.total)}
                    </p>
                    <div className="grid gap-3">
                      {leitura.map((x) => (
                        <p key={x.id} className="text-fg-2 text-[15px] leading-[1.65]">
                          {x.texto}
                          {x.pergunta ? (
                            <span className="text-fg mt-1 block text-[14px] font-semibold">
                              {t.validar} {x.pergunta}
                            </span>
                          ) : null}
                        </p>
                      ))}
                    </div>
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

      <Bloco titulo={sintese.plano.titulo} nota={sintese.plano.nota}>
        <ol className="grid gap-3">
          {sintese.plano.etapas.map((e, i) => (
            <li
              key={e.id}
              data-etapa={e.id}
              data-fase={e.fase}
              className="border-line bg-painel break-inside-avoid border p-[22px]"
            >
              <p className="text-verde text-[12px] font-bold tracking-[.08em] uppercase">
                {e.periodo} · {e.nomeDaFase}
              </p>
              <p className="mt-1 text-[18px] font-bold">
                <span className="text-fg-2 mr-2 text-[13px]">{String(i + 1).padStart(2, "0")}</span>
                {e.titulo}
              </p>
              <p className="mt-2 text-[15px] leading-[1.6]">{e.acao}</p>
              {e.detalhe ? <p className="text-fg-2 mt-2 text-[14px] leading-[1.6]">{e.detalhe}</p> : null}
              <dl className="mt-4 grid gap-x-4 gap-y-2 text-[14px] leading-[1.55] sm:grid-cols-[170px_1fr]">
                {(
                  [
                    [sintese.plano.rotulos.responsavel, e.responsavel],
                    [sintese.plano.rotulos.entrega, e.entrega],
                    [sintese.plano.rotulos.indicador, e.indicador],
                    [sintese.plano.rotulos.depende, e.dependeDe],
                  ] as const
                ).map(([rotulo, texto]) => (
                  <div key={rotulo} className="contents">
                    <dt className="text-fg-2">{rotulo}</dt>
                    <dd>{texto}</dd>
                  </div>
                ))}
              </dl>
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

      <Bloco titulo={sintese.indicacoes.titulo} nota={sintese.indicacoes.nota}>
        {sintese.indicacoes.itens.length ? (
          <div className="grid gap-[14px] sm:grid-cols-2">
            {sintese.indicacoes.itens.map((i) => (
              <div key={i.slug} data-indicacao={i.slug} data-forca={i.forca} className="break-inside-avoid">
                <p className={cn("mb-2 text-[13px] font-bold", i.forca === "indicada" ? "text-verde" : "text-fg")}>
                  {i.rotuloForca}
                </p>
                <ul className="mb-3 grid gap-1.5">
                  {i.porque.map((m) => (
                    <li key={m} className="flex gap-2 text-[14px] leading-[1.5]">
                      <span aria-hidden="true" className="text-verde">
                        ✓
                      </span>
                      {m}
                    </li>
                  ))}
                </ul>
                {i.ressalva ? <p className="text-fg-2 mb-3 text-[13px] leading-[1.5]">{i.ressalva}</p> : null}
                {i.criterio ? <p className="text-fg-2 mb-3 text-[13px] leading-[1.5]">{i.criterio}</p> : null}
                <Condicoes titulo={sintese.indicacoes.condicoes} itens={i.condicoes} />
                {cartoes[i.slug]}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px]">{sintese.indicacoes.semIndicacao}</p>
        )}
      </Bloco>

      {aprofundamento && avaliacaoId && leadId && chave
        ? aprofundamento({ avaliacaoId, leadId, chave, areasEscolhidas: r.areas })
        : null}

      <div className="border-line mt-16 break-inside-avoid border p-[22px] md:p-[30px]" data-assinatura>
        <p className="eyebrow text-verde mb-3 text-[11px]">{sintese.assinatura.titulo}</p>
        {sintese.assinatura.paragrafos.map((paragrafo) => (
          <p key={paragrafo} className="text-fg-2 mb-3 text-[14px] leading-[1.65] last:mb-0">
            {paragrafo}
          </p>
        ))}
      </div>
    </div>
  );
}
