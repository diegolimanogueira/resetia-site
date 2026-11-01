"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import { adminCanais, adminFicha, adminMarcos, adminTokens } from "@/content/admin-conversas";
import type { Devolutiva } from "@/lib/ai-score/devolutiva";
import { completas } from "@/lib/ai-score/codificar";
import { lerLink } from "@/lib/ai-score/codec";
import { fichaDaConversa } from "@/lib/ai-score/ficha";
import type { LeadVisao } from "@/lib/ai-score/leads";
import type { Pontuacao } from "@/lib/ai-score/lead-score";
import {
  lerSessao,
  registrarMarco,
  removerMarco,
  revogarConsentimento,
  revogarTokens,
  sessao,
  type ContatoPermitido,
  type Marco,
  type TipoMarco,
} from "@/lib/supabase-admin";

const rotulo = "mb-1.5 block text-[12px] font-semibold text-fg-2";
const sessaoAtual = () => lerSessao(sessao.ler());

function Bloco({ titulo, texto, children }: { titulo: string; texto?: string; children: ReactNode }) {
  return (
    <section className="border-line border-t pt-5">
      <h3 className="eyebrow text-fg-2 mb-2 text-[11px]">{titulo}</h3>
      {texto ? <p className="text-fg-2 mb-4 max-w-[640px] text-[13px] leading-[1.55]">{texto}</p> : null}
      {children}
    </section>
  );
}

/** Aderência, intenção e oportunidade: três pontuações separadas, cada uma com os componentes e o máximo. */
export function PontuacoesDoLead({ visao }: { visao: LeadVisao }) {
  const p = admin.detalhe.pontuacoes;
  const blocos: Array<[string, Pontuacao]> = [
    [p.aderencia, visao.pontuacoes.aderencia],
    [p.intencao, visao.pontuacoes.intencao],
    [p.oportunidade, visao.pontuacoes.oportunidade],
  ];
  return (
    <Bloco titulo={p.titulo} texto={p.aviso}>
      <div className="grid gap-4 sm:grid-cols-3">
        {blocos.map(([titulo, x]) => (
          <div key={titulo} data-pontuacao={titulo} className="border-line bg-painel border p-4">
            <p className="text-[13px] font-semibold">{titulo}</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums">{p.de(x.pontos, x.maximo)}</p>
            <ul className="text-fg-2 mt-3 grid gap-1 text-[12px] leading-[1.45]">
              {x.itens.map((i) => (
                <li key={i.id} className={i.pontos ? "text-fg" : ""}>
                  {p.itens[i.id as keyof typeof p.itens]}: {i.pontos}/{i.maximo}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Bloco>
  );
}

/** A leitura (devolutiva) do lead, calculada aqui no painel a partir do código das respostas, sem IA. */
function useDevolutiva(codigo: string) {
  const [dv, setDv] = useState<Devolutiva | null>(null);
  useEffect(() => {
    let vivo = true;
    void import("@/lib/ai-score/devolutiva").then((m) => {
      const l = lerLink(codigo);
      if (vivo && l.tipo === "ok" && completas(l.respostas)) setDv(m.montarDevolutiva(l.respostas, l));
    });
    return () => {
      vivo = false;
    };
  }, [codigo]);
  return dv;
}

/** Ficha de preparação da conversa: determinística, sem IA e sem enviar nada a ninguém. */
export function FichaDaConversa({
  visao,
  marcos,
  contato,
  agora,
}: {
  visao: LeadVisao;
  marcos: Marco[];
  contato: ContatoPermitido | undefined;
  agora: Date;
}) {
  const devolutiva = useDevolutiva(visao.avaliacao.codigo);
  const ficha = useMemo(
    () => (devolutiva ? fichaDaConversa(visao, { devolutiva, marcos, contato, agora }) : null),
    [devolutiva, visao, marcos, contato, agora],
  );
  const [copiada, setCopiada] = useState(false);
  async function copiar() {
    if (!ficha) return;
    try {
      await navigator.clipboard.writeText(ficha.texto);
      setCopiada(true);
    } catch {
      setCopiada(false);
    }
  }
  return (
    <section data-ficha className="border-verde/40 border p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h3 className="eyebrow text-verde text-[11px]">{adminFicha.titulo}</h3>
        <span aria-live="polite" className="text-verde text-[12px] font-semibold">
          {copiada ? adminFicha.copiada : ""}
        </span>
        <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={copiar} disabled={!ficha}>
          {adminFicha.copiar}
        </BotaoAcao>
      </div>
      <p className="text-fg-2 mb-4 max-w-[640px] text-[13px] leading-[1.55]">{adminFicha.texto}</p>
      {ficha ? (
        <div className="grid gap-4">
          {ficha.secoes.map((s) => (
            <div key={s.id} data-ficha-secao={s.id}>
              <h4 className="mb-1 text-[13px] font-bold">{s.titulo}</h4>
              <ul className="grid gap-1 text-[13px] leading-[1.5]">
                {s.linhas.map((linha) => (
                  <li key={linha} className={linha.startsWith(" ") ? "text-fg-2 pl-4" : ""}>
                    {linha.trim()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[14px]">{admin.carregando}</p>
      )}
    </section>
  );
}

const TIPOS_DE_MARCO = Object.keys(adminMarcos.tipos) as TipoMarco[];

/** Marcos reais do funil (reunião, proposta, desfecho), registrados pela equipe. Valor só se informado. */
export function MarcosDoLead({ leadId, marcos, aoMudar }: { leadId: string; marcos: Marco[]; aoMudar: () => void }) {
  const [tipo, setTipo] = useState<TipoMarco>("reuniao-agendada");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [estado, setEstado] = useState<"" | "registrando" | "erro">("");
  const dele = marcos.filter((m) => m.lead_id === leadId);

  async function registrar(e: FormEvent) {
    e.preventDefault();
    const s = sessaoAtual();
    if (!s) return;
    const numero = valor.trim() === "" ? null : Number(valor.replace(/\./g, "").replace(",", "."));
    if (numero !== null && (!Number.isFinite(numero) || numero < 0)) return setEstado("erro");
    setEstado("registrando");
    const r = await registrarMarco(s, {
      lead_id: leadId,
      tipo,
      ...(data ? { ocorrido_em: data } : {}),
      valor_informado: numero,
      observacao: observacao.trim() || null,
    });
    setEstado(r === "ok" ? "" : "erro");
    if (r === "ok") {
      setValor("");
      setObservacao("");
      aoMudar();
    }
  }

  async function remover(id: string) {
    const s = sessaoAtual();
    if (s && (await removerMarco(s, id)) === "ok") aoMudar();
  }

  return (
    <Bloco titulo={adminMarcos.titulo} texto={adminMarcos.texto}>
      <form onSubmit={registrar} className="mb-4 grid gap-3 sm:grid-cols-4 sm:items-end">
        <div>
          <label htmlFor="marco-tipo" className={rotulo}>
            {adminMarcos.tipo}
          </label>
          <select
            id="marco-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoMarco)}
            className={classesEntrada}
          >
            {TIPOS_DE_MARCO.map((t) => (
              <option key={t} value={t}>
                {adminMarcos.tipos[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="marco-data" className={rotulo}>
            {adminMarcos.data}
          </label>
          <input
            id="marco-data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={classesEntrada}
          />
        </div>
        <div>
          <label htmlFor="marco-valor" className={rotulo}>
            {adminMarcos.valor}
          </label>
          <input
            id="marco-valor"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            aria-describedby="marco-valor-apoio"
            className={classesEntrada}
          />
        </div>
        <div>
          <label htmlFor="marco-observacao" className={rotulo}>
            {adminMarcos.observacao}
          </label>
          <input
            id="marco-observacao"
            maxLength={500}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className={classesEntrada}
          />
        </div>
        <p id="marco-valor-apoio" className="text-fg-2 text-[12px] sm:col-span-4">
          {adminMarcos.valorApoio}
        </p>
        <div className="flex items-center gap-3 sm:col-span-4">
          <BotaoAcao type="submit" tamanho="sm" disabled={estado === "registrando"}>
            {estado === "registrando" ? adminMarcos.registrando : adminMarcos.registrar}
          </BotaoAcao>
          <span role="status" className="text-[13px] font-semibold">
            {estado === "erro" ? adminMarcos.erro : ""}
          </span>
        </div>
      </form>
      {dele.length ? (
        <ul className="grid gap-2">
          {dele.map((m) => (
            <li key={m.id} data-marco={m.tipo} className="flex flex-wrap items-baseline gap-x-3 text-[14px]">
              <b>{adminMarcos.tipos[m.tipo]}</b>
              <span className="text-fg-2">{m.ocorrido_em.split("-").reverse().join("/")}</span>
              {m.valor_informado !== null ? (
                <span>{Number(m.valor_informado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              ) : null}
              {m.observacao ? <span className="text-fg-2">{m.observacao}</span> : null}
              <button
                type="button"
                onClick={() => void remover(m.id)}
                className="text-fg-2 hover:text-fg cursor-pointer text-[12px] underline"
              >
                {adminMarcos.remover}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px]">{adminMarcos.vazio}</p>
      )}
    </Bloco>
  );
}

/** Canais liberados para este lead, conferidos pelo banco; revogação registrada pela equipe e links do relatório. */
export function CanaisDoLead({
  leadId,
  contato,
  carregando,
  falhou,
  aoMudar,
}: {
  leadId: string;
  contato: ContatoPermitido | undefined;
  carregando: boolean;
  falhou: boolean;
  aoMudar: () => void;
}) {
  const [aviso, setAviso] = useState("");
  const [tokens, setTokens] = useState<"" | "revogando">("");
  const canais = [
    { canal: "email", rotulo: adminCanais.email, liberado: contato?.email === true },
    { canal: "whatsapp", rotulo: adminCanais.whatsapp, liberado: contato?.whatsapp === true },
    { canal: "ligacao", rotulo: adminCanais.ligacao, liberado: contato?.ligacao === true },
  ] as const;

  async function revogar(canal: string) {
    const s = sessaoAtual();
    if (!s) return;
    const r = await revogarConsentimento(s, leadId, "contato-analise", canal);
    setAviso(r === "ok" ? adminCanais.revogado : adminCanais.revogarErro);
    if (r === "ok") aoMudar();
  }

  async function revogarLinks() {
    const s = sessaoAtual();
    if (!s) return;
    setTokens("revogando");
    const n = await revogarTokens(s, leadId);
    setTokens("");
    setAviso(typeof n === "number" ? adminTokens.revogados(n) : adminTokens.erro);
  }

  return (
    <Bloco titulo={adminCanais.titulo} texto={adminCanais.texto}>
      {carregando ? (
        <p className="text-[14px]">{adminCanais.carregando}</p>
      ) : falhou ? (
        <p data-canais="falhou" className="border-fg border-l-2 pl-3 text-[14px] font-semibold">
          {adminCanais.falhou}
        </p>
      ) : (
        <>
          <ul className="grid gap-2">
            {canais.map((c) => (
              <li
                key={c.canal}
                data-canal={c.canal}
                data-liberado={c.liberado}
                className="flex flex-wrap items-center gap-3 text-[14px]"
              >
                <b className="w-[90px]">{c.rotulo}</b>
                <span className={c.liberado ? "text-verde font-semibold" : "text-fg-2"}>
                  {c.liberado ? adminCanais.liberado : adminCanais.bloqueado}
                </span>
                {c.liberado && c.canal !== "email" ? (
                  <button
                    type="button"
                    onClick={() => void revogar(c.canal)}
                    className="text-fg-2 hover:text-fg cursor-pointer text-[12px] underline"
                  >
                    {adminCanais.revogar}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {!contato?.email && !contato?.whatsapp && !contato?.ligacao ? (
            <p className="text-fg-2 mt-3 text-[13px]">{adminCanais.semNenhum}</p>
          ) : null}
        </>
      )}
      <div className="border-line mt-5 border-t pt-4">
        <h4 className="mb-1 text-[13px] font-bold">{adminTokens.titulo}</h4>
        <p className="text-fg-2 mb-3 max-w-[640px] text-[13px] leading-[1.55]">{adminTokens.texto}</p>
        <BotaoAcao
          type="button"
          variante="secundario"
          tamanho="sm"
          onClick={() => void revogarLinks()}
          disabled={tokens === "revogando"}
        >
          {tokens === "revogando" ? adminTokens.revogando : adminTokens.revogar}
        </BotaoAcao>
      </div>
      <p aria-live="polite" role="status" className="mt-3 min-h-[1.2em] text-[13px] font-semibold">
        {aviso}
      </p>
    </Bloco>
  );
}
