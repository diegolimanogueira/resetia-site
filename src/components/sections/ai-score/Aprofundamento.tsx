"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Opcao } from "@/components/sections/ai-score/Opcao";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, Marcador } from "@/components/ui/campo";
import { Linhas } from "@/components/ui/linhas";
import {
  aprofundar as t,
  consequencias,
  dadosDisponiveis,
  OUTRA,
  papeisNaDecisao,
  periodos,
  rotinas,
} from "@/content/ai-score-aprofundamento";
import type { AreaId } from "@/content/types";
import {
  esforcoEstimado,
  validarAprofundamento,
  type Aprofundamento as ValorAprofundamento,
  type Esforco,
} from "@/lib/ai-score/aprofundamento";
import {
  camposDe,
  camposVazios,
  entradaDe,
  lerRascunho,
  passoDoErro,
  passosDe,
  primeiroDaCamada2,
  type Campos,
  type NaoSei,
  type PassoId,
  type Rascunho,
} from "@/lib/ai-score/aprofundamento-form";
import { gravarAprofundamento } from "@/lib/ai-score/captura";
import {
  aprofundamentoRascunho,
  aprofundamentoSalvo,
  assinarArmazenamento,
  lerAprofundamentoSalvo,
} from "@/lib/ai-score/navegador";

const AREAS: readonly AreaId[] = ["marketing", "vendas", "customer-success"];
const numero = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const rotuloDe = (lista: ReadonlyArray<{ id: string; label: string }>, id: string | undefined) =>
  lista.find((o) => o.id === id)?.label;

/** Esforço informado: a conta com as entradas e as premissas, ou o que falta para poder calculá-lo. */
function BlocoEsforco({ esforco }: { esforco: Esforco }) {
  const e = t.esforco;
  const extenso = (id: string) => periodos.find((p) => p.id === id)?.extenso ?? id;
  return (
    <div data-esforco={esforco.calculavel ? "calculado" : "incompleto"} className="border-line mt-6 border p-5">
      {esforco.calculavel ? (
        <>
          <p className="eyebrow text-verde mb-2 text-[11px]">{e.titulo}</p>
          <p className="text-[18px] font-bold" data-esforco-conta>
            {e.formula(
              numero(esforco.volume),
              esforco.unidade,
              extenso(esforco.periodo),
              numero(esforco.minutos),
              numero(esforco.horas),
            )}
          </p>
          <ul className="text-fg-2 mt-3 grid gap-1.5 text-[14px] leading-[1.55]">
            {e.premissas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="font-semibold">{e.falta.titulo}</p>
          <ul className="text-fg-2 mt-2 grid gap-1 text-[14px]">
            {esforco.falta.map((f) => (
              <li key={f}>{e.falta[f]}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Resumo({ valor }: { valor: ValorAprofundamento }) {
  const r = t.resumo;
  const sei = (campo: NaoSei) => valor.naoSei.includes(campo);
  const linhas: Array<[string, string]> = [
    [r.area, t.area.nomes[valor.area]],
    [
      r.rotina,
      sei("rotina")
        ? r.naoSei
        : valor.rotina === OUTRA
          ? (valor.rotinaOutra ?? r.naoRespondido)
          : (rotinas[valor.area].find((o) => o.id === valor.rotina)?.label ?? r.naoRespondido),
    ],
    [
      r.volume,
      sei("volume")
        ? r.naoSei
        : valor.volume !== undefined && valor.unidade && valor.periodo
          ? t.volume.resumo(
              numero(valor.volume),
              valor.unidade,
              periodos.find((p) => p.id === valor.periodo)?.extenso ?? valor.periodo,
            )
          : r.naoRespondido,
    ],
    [
      r.consequencia,
      sei("consequencia")
        ? r.naoSei
        : valor.consequencia === OUTRA
          ? (valor.consequenciaOutra ?? r.naoRespondido)
          : (rotuloDe(consequencias, valor.consequencia) ?? r.naoRespondido),
    ],
  ];
  if (valor.camada === 2)
    linhas.push(
      [
        r.minutos,
        sei("minutos")
          ? r.naoSei
          : valor.minutos !== undefined
            ? r.minutosValor(numero(valor.minutos))
            : r.naoRespondido,
      ],
      [r.ferramentas, valor.ferramentas.length ? valor.ferramentas.join(", ") : r.naoRespondido],
      [r.dados, rotuloDe(dadosDisponiveis, valor.dados) ?? r.naoRespondido],
      [r.indicador, valor.indicador ?? r.naoRespondido],
      [r.papel, rotuloDe(papeisNaDecisao, valor.papelDecisor) ?? r.naoRespondido],
    );
  return (
    <dl className="mt-4 grid gap-3 text-[15px] md:grid-cols-[200px_1fr] md:gap-x-6">
      {linhas.map(([rotulo, texto]) => (
        <div key={rotulo} className="contents">
          <dt className="text-fg-2">{rotulo}</dt>
          <dd className="font-semibold">{texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Aprofundamento opcional de uma dor operacional, oferecido depois que a pessoa já recebeu o relatório. Camada 1
 * (rotina, volume com unidade e período, consequência) e, se a pessoa quiser, camada 2 (tempo, ferramentas, dados,
 * indicador e papel na decisão). Tudo pode ser pulado, corrigido e respondido com "Não sei". O rascunho fica na sessão
 * do navegador; o que foi salvo vai à função com a chave do lead e nunca entra no link, na IA ou no analytics.
 */
interface Props {
  avaliacaoId: string;
  leadId: string;
  chave: string;
  areasEscolhidas: AreaId[];
}

/** O elemento pronto, para quem carrega este módulo sob demanda (o componente em si não precisa ser exposto). */
export const aprofundamento = (props: Props) => <Aprofundamento {...props} />;

function Aprofundamento({ avaliacaoId, leadId, chave, areasEscolhidas }: Props) {
  const areaFixa = areasEscolhidas.length === 1 ? areasEscolhidas[0] : undefined;
  const perguntarArea = !areaFixa;

  const textoRascunho = useSyncExternalStore(
    assinarArmazenamento,
    () => aprofundamentoRascunho.ler(avaliacaoId),
    () => null,
  );
  const textoSalvo = useSyncExternalStore(
    assinarArmazenamento,
    () => aprofundamentoSalvo.ler(avaliacaoId),
    () => null,
  );
  const rascunho = useMemo(() => lerRascunho(textoRascunho), [textoRascunho]);
  const salvo = useMemo(() => {
    const registro = lerAprofundamentoSalvo(textoSalvo);
    if (!registro) return null;
    const v = validarAprofundamento(registro.valor);
    return v.ok ? { situacao: registro.situacao, revisao: registro.revisao, valor: v.valor } : null;
  }, [textoSalvo]);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const montado = useRef(false);
  const passoAtual = rascunho?.fase === "perguntas" ? rascunho.passo : null;
  useEffect(() => {
    if (montado.current) titulo.current?.focus();
    montado.current = true;
  }, [passoAtual]);

  const gravarRascunho = (r: Rascunho | null) => aprofundamentoRascunho.gravar(avaliacaoId, r && JSON.stringify(r));
  const novo = (parte: Partial<Rascunho>): Rascunho => ({
    fase: "perguntas",
    camada: 1,
    passo: passosDe(1, perguntarArea)[0],
    campos: camposVazios(areaFixa ?? ""),
    naoSei: [],
    ...parte,
  });
  const comecar = () => gravarRascunho(novo({}));
  const adiar = () => gravarRascunho(rascunho ? { ...rascunho, fase: "adiado" } : novo({ fase: "adiado" }));
  const retomar = () => gravarRascunho(rascunho ? { ...rascunho, fase: "perguntas" } : novo({}));
  const dosSalvos = (camada: 1 | 2, passo?: PassoId) =>
    salvo
      ? novo({
          camada,
          campos: camposDe(salvo.valor),
          naoSei: salvo.valor.naoSei,
          passo: passo ?? passosDe(camada, perguntarArea)[0],
        })
      : novo({ camada });
  const corrigir = () => {
    setErros({});
    gravarRascunho(dosSalvos(salvo?.valor.camada ?? 1));
  };
  const aprofundarMais = () => {
    setErros({});
    gravarRascunho(dosSalvos(2, primeiroDaCamada2));
  };

  const editar = (r: Rascunho, parte: Partial<Campos>, naoSei: NaoSei[] = r.naoSei) => {
    gravarRascunho({ ...r, campos: { ...r.campos, ...parte }, naoSei });
    setErros({});
  };
  const passos = rascunho ? passosDe(rascunho.camada, perguntarArea) : [];

  const validar = (r: Rascunho) => validarAprofundamento(entradaDe(r, (salvo?.revisao ?? 0) + 1));
  const errosDoPasso = (r: Rascunho, passo: PassoId) => {
    const v = validar(r);
    return v.ok ? {} : Object.fromEntries(Object.entries(v.erros).filter(([campo]) => passoDoErro(campo) === passo));
  };

  function avancar(r: Rascunho) {
    const aqui = errosDoPasso(r, r.passo);
    if (Object.keys(aqui).length) return setErros(aqui);
    const i = passos.indexOf(r.passo);
    const proximo = passos[i + 1];
    // Ao chegar no volume, a unidade da rotina escolhida já vem sugerida (a pessoa pode trocá-la).
    const sugerida =
      proximo === "volume" && !r.campos.unidade && r.campos.rotina && r.campos.rotina !== OUTRA
        ? rotinas[r.campos.area as AreaId]?.find((o) => o.id === r.campos.rotina)?.unidade
        : undefined;
    setErros({});
    gravarRascunho({ ...r, passo: proximo, campos: sugerida ? { ...r.campos, unidade: sugerida } : r.campos });
  }

  function voltar(r: Rascunho) {
    const anterior = passos[passos.indexOf(r.passo) - 1];
    if (!anterior) return;
    setErros({});
    gravarRascunho({ ...r, passo: anterior });
  }

  async function salvar(r: Rascunho) {
    const v = validar(r);
    if (!v.ok) {
      const primeiro = passos.find((p) => Object.keys(v.erros).some((campo) => passoDoErro(campo) === p));
      setErros(v.erros);
      if (primeiro) gravarRascunho({ ...r, passo: primeiro });
      return;
    }
    setErros({});
    setSalvando(true);
    const situacao = await gravarAprofundamento({
      avaliacaoId,
      leadId,
      chave,
      aprofundamento: { ...v.valor },
    });
    aprofundamentoSalvo.gravar(avaliacaoId, {
      revisao: v.valor.revisao,
      valor: { ...v.valor },
      situacao: situacao === "aceito" ? "aceito" : situacao === "recusado" ? "recusado" : "pendente",
    });
    gravarRascunho(null);
    setSalvando(false);
  }

  // O que mostrar: o rascunho em andamento, o resumo do que foi salvo ou o convite.
  const vista =
    rascunho?.fase === "perguntas" ? "perguntas" : rascunho?.fase === "adiado" ? "adiado" : salvo ? "salvo" : "convite";

  const moldura = (filhos: ReactNode) => (
    <section
      aria-labelledby="aprofundamento-titulo"
      data-nao-imprimir
      data-aprofundamento={vista}
      data-aprofundamento-situacao={salvo?.situacao}
      className="border-line mt-16 border p-[22px] md:p-[30px]"
    >
      {filhos}
    </section>
  );

  const cabecalho = (
    <>
      <p className="eyebrow text-verde mb-3 text-[11px]">{t.kicker}</p>
      <h3 id="aprofundamento-titulo" className="mb-3 text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">
        <Linhas itens={t.titulo} />
      </h3>
    </>
  );

  if (vista === "convite")
    return moldura(
      <>
        {cabecalho}
        <p className="text-fg-2 max-w-[720px] text-[15px] leading-[1.6]">{t.texto}</p>
        <p className="text-fg-2 mt-3 max-w-[720px] text-[14px] leading-[1.6]">{t.privacidade}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BotaoAcao type="button" onClick={comecar}>
            {t.comecar}
          </BotaoAcao>
          <BotaoAcao type="button" variante="secundario" onClick={adiar}>
            {t.pular}
          </BotaoAcao>
        </div>
      </>,
    );

  if (vista === "adiado")
    return moldura(
      <>
        {cabecalho}
        <p className="text-fg-2 text-[15px]">{t.adiado}</p>
        <div className="mt-5">
          <BotaoAcao type="button" tamanho="sm" onClick={retomar}>
            {t.retomar}
          </BotaoAcao>
        </div>
      </>,
    );

  if (vista === "salvo" && salvo)
    return moldura(
      <>
        {cabecalho}
        <p className="font-semibold" data-salvo-estado={salvo.situacao}>
          {t.salvo.titulo}
        </p>
        {salvo.situacao !== "aceito" ? (
          <p className="text-fg-2 mt-1 max-w-[720px] text-[14px] leading-[1.6]">{t.salvo[salvo.situacao]}</p>
        ) : null}
        <h4 className="mt-6 text-[16px] font-bold">{t.resumo.titulo}</h4>
        <Resumo valor={salvo.valor} />
        {salvo.valor.camada === 2 ? <BlocoEsforco esforco={esforcoEstimado(salvo.valor)} /> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {salvo.valor.camada === 1 ? (
            <BotaoAcao type="button" onClick={aprofundarMais}>
              {t.aprofundarMais}
            </BotaoAcao>
          ) : null}
          <BotaoAcao type="button" variante="secundario" onClick={corrigir}>
            {t.editar}
          </BotaoAcao>
        </div>
      </>,
    );

  if (!rascunho) return null;
  const r = rascunho;
  const c = r.campos;
  const ultimo = r.passo === passos[passos.length - 1];
  const nao = (campo: NaoSei) => r.naoSei.includes(campo);
  const erro = (...campos: string[]) => campos.map((k) => erros[k]).find(Boolean);

  const escolher = (campo: "rotina" | "consequencia" | "dados" | "papelDecisor", valor: string) =>
    editar(
      r,
      { [campo]: valor },
      r.naoSei.filter((n) => n !== campo),
    );
  const marcarNaoSei = (campo: NaoSei, marcado: boolean) =>
    editar(
      r,
      marcado
        ? ({
            [campo]: "",
            ...(campo === "rotina" ? { rotinaOutra: "" } : {}),
            ...(campo === "consequencia" ? { consequenciaOutra: "" } : {}),
          } as Partial<Campos>)
        : {},
      marcado ? [...r.naoSei.filter((n) => n !== campo), campo] : r.naoSei.filter((n) => n !== campo),
    );

  const grupo = (
    nome: string,
    opcoes: ReadonlyArray<{ id: string; label: string }>,
    atual: string,
    aoEscolher: (id: string) => void,
    extra?: ReactNode,
    mensagem?: string,
  ) => (
    <div
      role="radiogroup"
      aria-labelledby="aprofundamento-pergunta"
      aria-describedby={mensagem ? `${nome}-erro` : undefined}
      className="grid gap-3"
    >
      {opcoes.map((o) => (
        <Opcao
          key={o.id}
          name={nome}
          value={o.id}
          checked={atual === o.id}
          onChange={() => aoEscolher(o.id)}
          rotulo={o.label}
        />
      ))}
      {extra}
      {mensagem ? (
        <p id={`${nome}-erro`} className="border-fg border-l-2 pl-2.5 text-[13px] font-semibold">
          {mensagem}
        </p>
      ) : null}
    </div>
  );

  const naoSeiRadio = (campo: NaoSei, nome: string) => (
    <Opcao
      key="nao-sei"
      name={nome}
      value="nao-sei"
      checked={nao(campo)}
      onChange={() => marcarNaoSei(campo, true)}
      rotulo={t.naoSei}
      discreta
    />
  );

  let pergunta = "";
  let apoio: string | undefined;
  let corpo: ReactNode = null;
  const areaAtual = AREAS.includes(c.area as AreaId) ? (c.area as AreaId) : undefined;

  switch (r.passo) {
    case "area":
      pergunta = t.area.pergunta;
      apoio = t.area.apoio;
      corpo = grupo(
        "aprofundamento-area",
        AREAS.map((a) => ({ id: a, label: t.area.nomes[a] })),
        c.area,
        (id) => editar(r, { area: id, rotina: "", rotinaOutra: "", unidade: "" }),
        undefined,
        erro("area"),
      );
      break;
    case "rotina": {
      pergunta = t.rotina.pergunta;
      const lista = areaAtual ? rotinas[areaAtual].map((o) => ({ id: o.id, label: o.label })) : [];
      corpo = (
        <>
          {grupo(
            "aprofundamento-rotina",
            [...lista, { id: OUTRA, label: t.rotina.outra }],
            nao("rotina") ? "nao-sei" : c.rotina,
            (id) => escolher("rotina", id),
            naoSeiRadio("rotina", "aprofundamento-rotina"),
            erro("rotina"),
          )}
          {c.rotina === OUTRA && !nao("rotina") ? (
            <Campo
              id="aprofundamento-rotina-outra"
              className="mt-4"
              rotulo={t.rotina.outraRotulo}
              value={c.rotinaOutra}
              maxLength={120}
              onChange={(e) => editar(r, { rotinaOutra: e.target.value })}
              erro={erro("rotinaOutra")}
              autoComplete="off"
            />
          ) : null}
        </>
      );
      break;
    }
    case "volume":
      pergunta = t.volume.pergunta;
      apoio = t.volume.apoio;
      corpo = (
        <div className="grid gap-4 md:max-w-[520px]">
          <Campo
            id="aprofundamento-volume"
            rotulo={t.volume.quantidade}
            inputMode="decimal"
            autoComplete="off"
            maxLength={12}
            value={nao("volume") ? "" : c.volume}
            disabled={nao("volume")}
            onChange={(e) => editar(r, { volume: e.target.value })}
            erro={erro("volume")}
          />
          <Campo
            id="aprofundamento-unidade"
            rotulo={t.volume.unidade}
            autoComplete="off"
            maxLength={40}
            value={nao("volume") ? "" : c.unidade}
            disabled={nao("volume")}
            onChange={(e) => editar(r, { unidade: e.target.value })}
            erro={erro("unidade")}
          />
          <div role="radiogroup" aria-label={t.volume.periodo} className="flex flex-wrap gap-3">
            {periodos.map((p) => (
              <Opcao
                key={p.id}
                compacta
                name="aprofundamento-periodo"
                value={p.id}
                checked={!nao("volume") && c.periodo === p.id}
                disabled={nao("volume")}
                onChange={() => editar(r, { periodo: p.id })}
                rotulo={p.label}
              />
            ))}
          </div>
          {erro("periodo") ? (
            <p className="border-fg border-l-2 pl-2.5 text-[13px] font-semibold">{erro("periodo")}</p>
          ) : null}
          <Marcador
            rotulo={t.naoSei}
            checked={nao("volume")}
            onChange={(e) => marcarNaoSei("volume", e.target.checked)}
          />
        </div>
      );
      break;
    case "consequencia":
      pergunta = t.consequencia.pergunta;
      corpo = (
        <>
          {grupo(
            "aprofundamento-consequencia",
            [...consequencias, { id: OUTRA, label: t.consequencia.outra }],
            nao("consequencia") ? "nao-sei" : c.consequencia,
            (id) => escolher("consequencia", id),
            naoSeiRadio("consequencia", "aprofundamento-consequencia"),
            erro("consequencia"),
          )}
          {c.consequencia === OUTRA && !nao("consequencia") ? (
            <Campo
              id="aprofundamento-consequencia-outra"
              className="mt-4"
              rotulo={t.consequencia.outraRotulo}
              value={c.consequenciaOutra}
              maxLength={200}
              onChange={(e) => editar(r, { consequenciaOutra: e.target.value })}
              erro={erro("consequenciaOutra")}
              autoComplete="off"
            />
          ) : null}
        </>
      );
      break;
    case "minutos": {
      pergunta = t.camada2.minutos.pergunta;
      const v = validar(r);
      const previa = v.ok ? esforcoEstimado(v.valor) : null;
      corpo = (
        <div className="grid gap-4 md:max-w-[520px]">
          <Campo
            id="aprofundamento-minutos"
            rotulo={t.camada2.minutos.rotulo}
            inputMode="decimal"
            autoComplete="off"
            maxLength={8}
            value={nao("minutos") ? "" : c.minutos}
            disabled={nao("minutos")}
            onChange={(e) => editar(r, { minutos: e.target.value })}
            erro={erro("minutos")}
          />
          <Marcador
            rotulo={t.naoSei}
            checked={nao("minutos")}
            onChange={(e) => marcarNaoSei("minutos", e.target.checked)}
          />
          {previa ? <BlocoEsforco esforco={previa} /> : null}
        </div>
      );
      break;
    }
    case "ferramentas":
      pergunta = t.camada2.ferramentas.pergunta;
      apoio = t.camada2.ferramentas.apoio;
      corpo = (
        <Campo
          id="aprofundamento-ferramentas"
          className="md:max-w-[520px]"
          rotulo={t.camada2.ferramentas.rotulo}
          autoComplete="off"
          value={c.ferramentas}
          onChange={(e) => editar(r, { ferramentas: e.target.value })}
          erro={erro("ferramentas")}
        />
      );
      break;
    case "dados":
      pergunta = t.camada2.dados.pergunta;
      corpo = grupo(
        "aprofundamento-dados",
        dadosDisponiveis,
        c.dados,
        (id) => escolher("dados", id),
        undefined,
        erro("dados"),
      );
      break;
    case "indicador":
      pergunta = t.camada2.indicador.pergunta;
      apoio = t.camada2.indicador.apoio;
      corpo = (
        <Campo
          id="aprofundamento-indicador"
          className="md:max-w-[520px]"
          rotulo={t.camada2.indicador.rotulo}
          autoComplete="off"
          maxLength={200}
          value={c.indicador}
          onChange={(e) => editar(r, { indicador: e.target.value })}
          erro={erro("indicador")}
        />
      );
      break;
    case "papel":
      pergunta = t.camada2.papel.pergunta;
      corpo = grupo(
        "aprofundamento-papel",
        papeisNaDecisao,
        c.papelDecisor,
        (id) => escolher("papelDecisor", id),
        undefined,
        erro("papelDecisor"),
      );
      break;
  }

  const posicao = passos.indexOf(r.passo) + 1;
  return moldura(
    <div data-passo={r.passo}>
      <p className="eyebrow text-verde mb-3 text-[11px]">
        {r.camada === 2 && posicao > passosDe(1, perguntarArea).length ? t.camada2.kicker : t.kicker}
        <span className="text-fg-2 ml-3 normal-case">{t.passo(posicao, passos.length)}</span>
      </p>
      <h3 id="aprofundamento-titulo" className="sr-only">
        {t.navegacao}
      </h3>
      <h4
        ref={titulo}
        tabIndex={-1}
        id="aprofundamento-pergunta"
        className="mb-2 text-[22px] leading-[1.2] font-bold tracking-[-0.02em] outline-none"
      >
        {pergunta}
      </h4>
      <p className="text-fg-2 mb-5 max-w-[720px] text-[14px] leading-[1.6]">
        {apoio ? `${apoio} ` : ""}
        {t.opcional}
      </p>
      {corpo}
      {erros.geral || erros.revisao ? (
        <p role="alert" className="border-fg mt-5 border-l-2 pl-2.5 text-[13px] font-semibold">
          {erros.geral ?? t.erros.geral}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {posicao > 1 ? (
          <BotaoAcao type="button" variante="secundario" onClick={() => voltar(r)}>
            {t.voltar}
          </BotaoAcao>
        ) : null}
        {ultimo ? (
          <BotaoAcao type="button" disabled={salvando} onClick={() => void salvar(r)}>
            {salvando ? t.salvando : t.salvar}
          </BotaoAcao>
        ) : (
          <BotaoAcao type="button" onClick={() => avancar(r)}>
            {t.proxima}
          </BotaoAcao>
        )}
        <BotaoAcao type="button" variante="secundario" onClick={adiar}>
          {t.pular}
        </BotaoAcao>
      </div>
    </div>,
  );
}
