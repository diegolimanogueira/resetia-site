"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Barra } from "@/components/sections/ai-score/Placar";
import { Opcao } from "@/components/sections/ai-score/Opcao";
import { BotaoAcao } from "@/components/ui/botao";
import {
  aprofundar,
  desafios,
  desafiosPergunta,
  dimensoes,
  escalaArea,
  escalaAreaCurta,
  horizontes,
  modulosArea,
  perguntasCentrais,
  questionario as q,
  segmentacao,
} from "@/content/ai-score-questionario";
import type { AreaId, Escopo, Opcao as OpcaoTipo } from "@/content/types";
import { calcular } from "@/lib/ai-score/calcular";
import { codificar, completas, decodificar, respostasVazias } from "@/lib/ai-score/codificar";
import { assinarArmazenamento, lerRascunho, novoId, rascunho } from "@/lib/ai-score/navegador";
import { linhaAvaliacao } from "@/lib/ai-score/registro";
import type { Resposta, Respostas, Slot } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { enviar, reenviarPendentes } from "@/lib/supabase";

type Etapa =
  | { tipo: "segmentacao" }
  | { tipo: "central"; i: number }
  | { tipo: "aprofundar" }
  | { tipo: "area"; area: AreaId }
  | { tipo: "fechamento" };

const QUATRO = () => Array<Slot>(4).fill(undefined);

/** As etapas dependem das respostas: a visão empresa escolhe áreas; a visão por área tem a própria. */
function etapasDe(r: Respostas): Etapa[] {
  return [
    { tipo: "segmentacao" },
    ...perguntasCentrais.map((_, i): Etapa => ({ tipo: "central", i })),
    ...(r.escopo === "empresa" ? [{ tipo: "aprofundar" } as const] : []),
    ...r.areas.map((area): Etapa => ({ tipo: "area", area })),
    { tipo: "fechamento" },
  ];
}

function erroDa(etapa: Etapa, r: Respostas): string | null {
  switch (etapa.tipo) {
    case "segmentacao":
      return r.papel && r.escopo && r.porte && r.segmento ? null : q.erros.segmentacao;
    case "central":
      return r.centrais[etapa.i] === undefined ? q.erros.escolha : null;
    case "aprofundar":
      return null;
    case "area": {
      const s = r.porArea[etapa.area] ?? [];
      return s.length === 4 && !s.includes(undefined) ? null : q.erros.area;
    }
    case "fechamento":
      return r.desafios.length > 0 && r.horizonte ? null : q.erros.fechamento;
  }
}

const tituloEtapa = "focus:outline-none text-[clamp(26px,3.4vw,42px)] leading-[1.12] font-bold tracking-[-0.025em]";

/** Grupo de perguntas com legenda visível (html-validate: legend como primeiro filho do fieldset). */
function Grupo({
  legenda,
  apoio,
  children,
  compacto,
}: {
  legenda: string;
  apoio?: string;
  children: ReactNode;
  compacto?: boolean;
}) {
  return (
    <fieldset className="border-line border-t pt-6">
      <legend className="float-left mb-1 w-full text-[18px] font-bold">{legenda}</legend>
      {apoio ? <p className="text-fg-2 clear-both mb-4 text-[14px]">{apoio}</p> : <div className="clear-both mb-4" />}
      <div className={compacto ? "flex flex-wrap gap-2" : "grid gap-2.5 sm:grid-cols-2"}>{children}</div>
    </fieldset>
  );
}

/**
 * Questionário do RESET AI Score: segmentação, 12 perguntas (uma por tela), módulos por área (quatro perguntas
 * numa tela, com a escala padronizada) e qualificação. O progresso fica no localStorage; quem volta pode retomar.
 * Ao concluir, grava a avaliação (sem dados pessoais) e leva ao resultado, com as respostas no hash da URL.
 */
export function Avaliacao() {
  const router = useRouter();
  const salvo = useSyncExternalStore(assinarArmazenamento, rascunho.ler, () => null);
  const [r, setR] = useState<Respostas>(respostasVazias);
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [decidiu, setDecidiu] = useState(false);
  const [concluindo, setConcluindo] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const moveu = useRef(false);

  const retomavel = useMemo(() => {
    const s = lerRascunho(salvo);
    const respostas = s ? decodificar(s.codigo) : null;
    return s && respostas ? { respostas, passo: s.passo } : null;
  }, [salvo]);

  const etapas = useMemo(() => etapasDe(r), [r]);
  const etapa = etapas[Math.min(passo, etapas.length - 1)];
  const ultima = passo >= etapas.length - 1;

  useEffect(() => {
    void reenviarPendentes();
  }, []);

  // Depois de avançar ou voltar: topo da avaliação e foco no título da etapa (leitor de tela anuncia).
  useEffect(() => {
    if (!moveu.current) return;
    moveu.current = false;
    document.getElementById("avaliacao")?.scrollIntoView({ block: "start" });
    titulo.current?.focus({ preventScroll: true });
  }, [passo]);

  function mudar(novo: Respostas) {
    setDecidiu(true);
    setErro(null);
    setR(novo);
    rascunho.gravar(codificar(novo), passo);
  }

  function irPara(n: number) {
    moveu.current = true;
    setDecidiu(true);
    setErro(null);
    setPasso(n);
    rascunho.gravar(codificar(r), n);
  }

  function retomar() {
    if (!retomavel) return;
    moveu.current = true;
    setDecidiu(true);
    setR(retomavel.respostas);
    setPasso(Math.min(retomavel.passo, etapasDe(retomavel.respostas).length - 1));
  }

  function recomecar() {
    rascunho.apagar();
    setDecidiu(true);
  }

  function mudarEscopo(escopo: Escopo) {
    const porArea = escopo === "empresa" ? {} : { [escopo]: r.porArea[escopo] ?? QUATRO() };
    mudar({ ...r, escopo, areas: escopo === "empresa" ? [] : [escopo], porArea });
  }

  function alternarArea(area: AreaId) {
    const tem = r.areas.includes(area);
    const areas = tem
      ? r.areas.filter((a) => a !== area)
      : modulosArea.map((m) => m.area).filter((a) => a === area || r.areas.includes(a));
    mudar({ ...r, areas, porArea: { ...r.porArea, [area]: r.porArea[area] ?? QUATRO() } });
  }

  function responderArea(area: AreaId, i: number, v: Resposta) {
    const s = [...(r.porArea[area] ?? QUATRO())];
    s[i] = v;
    mudar({ ...r, porArea: { ...r.porArea, [area]: s } });
  }

  function alternarDesafio(id: (typeof desafios)[number]["id"]) {
    const tem = r.desafios.includes(id);
    if (!tem && r.desafios.length >= 2) return setErro(q.erros.limiteDesafios);
    mudar({ ...r, desafios: tem ? r.desafios.filter((d) => d !== id) : [...r.desafios, id] });
  }

  function avancar(e: FormEvent) {
    e.preventDefault();
    const msg = erroDa(etapa, r);
    if (msg) return setErro(msg);
    if (passo === 0) track("ai_score_inicio", { escopo: r.escopo, papel: r.papel });
    if (!ultima) {
      track("ai_score_etapa", { etapa: passo + 2, total: etapas.length });
      return irPara(passo + 1);
    }
    if (!completas(r)) return setErro(q.erros.escolha);
    const final = { ...r, id: r.id ?? novoId() };
    const codigo = codificar(final);
    const resultado = calcular(final);
    setConcluindo(true);
    track("ai_score_concluido", {
      escopo: final.escopo,
      nivel: resultado.nivel ?? "parcial",
      indice: resultado.indice ?? -1,
      areas: final.areas.length,
    });
    void enviar("avaliacoes", linhaAvaliacao(final, resultado, codigo));
    rascunho.apagar();
    router.push(`/ai-score/resultado/#${codigo}`);
  }

  const total = etapas.length;
  const rotuloEtapa =
    etapa.tipo === "segmentacao"
      ? q.etapas.segmentacao
      : etapa.tipo === "central"
        ? `${q.etapas.pergunta(etapa.i + 1, perguntasCentrais.length)} · ${dimensoes.find((d) => d.id === perguntasCentrais[etapa.i].dimensao)!.nome}`
        : etapa.tipo === "aprofundar"
          ? q.etapas.aprofundar
          : etapa.tipo === "area"
            ? q.etapas.area(modulosArea.find((m) => m.area === etapa.area)!.nome)
            : q.etapas.fechamento;

  const radios = <T extends string>(
    opcoes: OpcaoTipo<T>[],
    name: string,
    atual: T | undefined,
    aoEscolher: (v: T) => void,
    compacta = true,
  ) =>
    opcoes.map((o) => (
      <Opcao
        key={o.id}
        name={name}
        value={o.id}
        checked={atual === o.id}
        onChange={() => aoEscolher(o.id)}
        rotulo={o.label}
        apoio={o.apoio}
        compacta={compacta}
      />
    ));

  function conteudo() {
    switch (etapa.tipo) {
      case "segmentacao":
        return (
          <>
            <h2 ref={titulo} tabIndex={-1} className={`${tituloEtapa} mb-3`}>
              {q.etapas.segmentacao}
            </h2>
            <p className="text-fg-2 mb-8 text-[16px]">{q.segmentacaoApoio}</p>
            <div className="grid gap-8">
              <Grupo legenda={segmentacao.papel.pergunta} compacto>
                {radios(segmentacao.papel.opcoes, "papel", r.papel, (papel) => mudar({ ...r, papel }))}
              </Grupo>
              <Grupo legenda={segmentacao.escopo.pergunta}>
                {radios(segmentacao.escopo.opcoes, "escopo", r.escopo, mudarEscopo, false)}
              </Grupo>
              <Grupo legenda={segmentacao.porte.pergunta} compacto>
                {radios(segmentacao.porte.opcoes, "porte", r.porte, (porte) => mudar({ ...r, porte }))}
              </Grupo>
              <Grupo legenda={segmentacao.segmento.pergunta} compacto>
                {radios(segmentacao.segmento.opcoes, "segmento", r.segmento, (segmento) => mudar({ ...r, segmento }))}
              </Grupo>
            </div>
          </>
        );
      case "central": {
        const p = perguntasCentrais[etapa.i];
        const atual = r.centrais[etapa.i];
        const responder = (v: Resposta) => {
          const centrais = [...r.centrais];
          centrais[etapa.i] = v;
          mudar({ ...r, centrais });
        };
        return (
          <fieldset aria-describedby="erro-etapa">
            <legend className="mb-8">
              <h2 ref={titulo} tabIndex={-1} className={tituloEtapa}>
                {r.escopo && r.escopo !== "empresa" ? p.texto.area : p.texto.empresa}
              </h2>
            </legend>
            <div className="grid gap-2.5">
              {p.alternativas.map((alt, v) => (
                <Opcao
                  key={alt}
                  name={p.id}
                  value={String(v)}
                  checked={atual === v}
                  onChange={() => responder(v as Resposta)}
                  rotulo={alt}
                />
              ))}
              <Opcao
                name={p.id}
                value="x"
                checked={atual === null}
                onChange={() => responder(null)}
                rotulo={q.naoSei}
                apoio={q.naoSeiApoio}
                discreta
              />
            </div>
          </fieldset>
        );
      }
      case "aprofundar":
        return (
          <fieldset>
            <legend className="mb-3">
              <h2 ref={titulo} tabIndex={-1} className={tituloEtapa}>
                {aprofundar.pergunta}
              </h2>
            </legend>
            <p className="text-fg-2 mb-8 max-w-[640px] text-[16px] leading-[1.6]">{aprofundar.apoio}</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {aprofundar.opcoes.map((o) => (
                <Opcao
                  key={o.id}
                  tipo="checkbox"
                  name="areas"
                  value={o.id}
                  checked={r.areas.includes(o.id)}
                  onChange={() => alternarArea(o.id)}
                  rotulo={o.label}
                />
              ))}
            </div>
          </fieldset>
        );
      case "area": {
        const m = modulosArea.find((x) => x.area === etapa.area)!;
        const s = r.porArea[etapa.area] ?? QUATRO();
        return (
          <>
            <h2 ref={titulo} tabIndex={-1} className={`${tituloEtapa} mb-3`}>
              {m.nome}
            </h2>
            <p className="text-fg-2 mb-6 text-[16px]">{q.areaApoio}</p>
            <ol className="border-line bg-painel mb-8 grid gap-1.5 border p-5 text-[14px] leading-[1.5] sm:grid-cols-2">
              {escalaArea.map((texto, i) => (
                <li key={texto}>
                  <b className="text-verde mr-1.5">{escalaAreaCurta[i]}:</b>
                  {texto}
                </li>
              ))}
            </ol>
            <div className="grid gap-8">
              {m.perguntas.map((p, i) => (
                <Grupo key={p.id} legenda={p.texto} compacto>
                  {escalaAreaCurta.map((rotulo, v) => (
                    <Opcao
                      key={rotulo}
                      name={p.id}
                      value={String(v)}
                      checked={s[i] === v}
                      onChange={() => responderArea(etapa.area, i, v as Resposta)}
                      rotulo={rotulo}
                      compacta
                    />
                  ))}
                  <Opcao
                    name={p.id}
                    value="x"
                    checked={s[i] === null}
                    onChange={() => responderArea(etapa.area, i, null)}
                    rotulo={q.naoSei}
                    compacta
                    discreta
                  />
                </Grupo>
              ))}
            </div>
          </>
        );
      }
      case "fechamento":
        return (
          <>
            <h2 ref={titulo} tabIndex={-1} className={`${tituloEtapa} mb-8`}>
              {q.etapas.fechamento}
            </h2>
            <div className="grid gap-8">
              <Grupo legenda={desafiosPergunta.pergunta} apoio={desafiosPergunta.apoio}>
                {desafios.map((d) => (
                  <Opcao
                    key={d.id}
                    tipo="checkbox"
                    name="desafios"
                    value={d.id}
                    checked={r.desafios.includes(d.id)}
                    onChange={() => alternarDesafio(d.id)}
                    rotulo={d.label}
                    compacta
                    disabled={!r.desafios.includes(d.id) && r.desafios.length >= 2}
                  />
                ))}
              </Grupo>
              <Grupo legenda={horizontes.pergunta}>
                {radios(horizontes.opcoes, "horizonte", r.horizonte, (horizonte) => mudar({ ...r, horizonte }))}
              </Grupo>
            </div>
          </>
        );
    }
  }

  return (
    <section
      id="avaliacao"
      data-tom="carvao"
      className="gutter text-fg bg-(--bg) pt-[40px] pb-[90px] md:pt-[60px] md:pb-[120px]"
    >
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="eyebrow text-verde mb-5">
          {q.kicker} · {q.titulo}
        </h1>

        {!decidiu && retomavel ? (
          <div className="border-verde/40 mb-10 border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_60%)] p-[26px] md:p-[34px]">
            <h2 className="mb-2 text-[24px] leading-[1.2] font-bold">{q.retomar.titulo}</h2>
            <p className="text-fg-2 mb-6 text-[15px]">{q.retomar.texto}</p>
            <div className="flex flex-wrap gap-3">
              <BotaoAcao type="button" onClick={retomar}>
                {q.retomar.continuar}
              </BotaoAcao>
              <BotaoAcao type="button" variante="secundario" onClick={recomecar}>
                {q.retomar.recomecar}
              </BotaoAcao>
            </div>
          </div>
        ) : null}

        <div className="mb-10">
          <p className="text-fg-2 mb-3 flex justify-between gap-4 text-[13px]">
            <span>{rotuloEtapa}</span>
            <span className="tabular-nums">
              {Math.min(passo, total - 1) + 1}/{total}
            </span>
          </p>
          <div
            role="progressbar"
            aria-label={q.progresso}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={Math.min(passo, total - 1) + 1}
          >
            <Barra valor={((Math.min(passo, total - 1) + 1) / total) * 100} />
          </div>
        </div>

        <form noValidate onSubmit={avancar}>
          {conteudo()}
          <p id="erro-etapa" aria-live="assertive" className="mt-6 min-h-[1.5em] text-[14px] font-semibold">
            {erro}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BotaoAcao type="submit" disabled={concluindo}>
              {ultima ? q.concluir : q.continuar}
            </BotaoAcao>
            {passo > 0 ? (
              <BotaoAcao type="button" variante="secundario" onClick={() => irPara(passo - 1)} disabled={concluindo}>
                {q.voltar}
              </BotaoAcao>
            ) : null}
          </div>
          <p className="text-fg-2 mt-8 text-[13px]">{q.privacidade}</p>
        </form>
      </div>
    </section>
  );
}
