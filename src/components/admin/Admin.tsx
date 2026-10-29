"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { DetalheLead } from "@/components/admin/DetalheLead";
import { Kanban } from "@/components/admin/Kanban";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import { niveis, segmentacao } from "@/content/ai-score-questionario";
import type { StatusLead } from "@/content/types";
import {
  atrasado,
  csvLeads,
  dataBr,
  filtrarLeads,
  filtrosIniciais,
  hojeSp,
  indicadores,
  montarLeads,
  resumir,
  rotulos,
  type Filtros,
} from "@/lib/ai-score/leads";
import { supabase } from "@/lib/supabase";
import {
  atualizarLead,
  eAdmin,
  entrar,
  lerSessao,
  listar,
  registrarAtividade,
  sessao,
  type AvaliacaoLinha,
  type CamposCrm,
  type Sessao,
} from "@/lib/supabase-admin";
import { cn } from "@/lib/utils";

const caixa = "gutter text-fg pt-[40px] pb-[90px] md:pt-[60px]";

/** /admin: login e o mini CRM dos leads. Sem Supabase configurado, avisa que é modo demonstração. */
export function Admin({ nomesSolucoes }: { nomesSolucoes: Record<string, string> }) {
  const texto = useSyncExternalStore(sessao.assinar, sessao.ler, () => null);
  const s = useMemo(() => lerSessao(texto), [texto]);

  if (!supabase.ativo)
    return (
      <section className={caixa}>
        <div className="container-site">
          <h1 className="eyebrow text-verde mb-5">{admin.kicker}</h1>
          <p className="text-[18px]">{admin.login.desligado}</p>
        </div>
      </section>
    );
  return s ? <Painel email={s.email} nomesSolucoes={nomesSolucoes} /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setErro(null);
    const r = await entrar(email.trim(), senha);
    setEntrando(false);
    if (r === "credenciais") setErro(admin.login.erro);
    else if (r === "erro") setErro(admin.login.falha);
    else sessao.gravar(r);
  }

  return (
    <section className={caixa}>
      <div className="mx-auto w-full max-w-[440px]">
        <p className="eyebrow text-verde mb-5">{admin.kicker}</p>
        <h1 className="mb-8 text-[36px] leading-[1.1] font-bold tracking-[-0.03em]">{admin.login.titulo}</h1>
        <form onSubmit={enviar} className="border-line bg-painel grid gap-5 border p-[26px]">
          <Campo
            id="admin-email"
            rotulo={admin.login.email}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Campo
            id="admin-senha"
            rotulo={admin.login.senha}
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <p role="alert" className="min-h-[1.2em] text-[14px] font-semibold">
            {erro}
          </p>
          <BotaoAcao type="submit" disabled={entrando}>
            {entrando ? admin.login.entrando : admin.login.entrar}
          </BotaoAcao>
        </form>
      </div>
    </section>
  );
}

function Selecao({
  id,
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: Array<{ id: string; label: string }>;
  aoMudar: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-fg-2 mb-1.5 block text-[12px] font-semibold">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={cn(classesEntrada, "py-2.5 text-[14px]")}
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const nadaAssinar = () => () => {};
const ETAPAS = Object.keys(admin.status) as StatusLead[];

function Painel({ email, nomesSolucoes }: { email: string; nomesSolucoes: Record<string, string> }) {
  const [dados, setDados] = useState<AvaliacaoLinha[] | null>(null);
  const [falha, setFalha] = useState<string | null>(null);
  const [erroMover, setErroMover] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [f, setF] = useState<Filtros>(filtrosIniciais);
  const [vista, setVista] = useState<"funil" | "lista">("funil");
  const [aberto, setAberto] = useState<string | null>(null);
  const gaveta = useRef<HTMLDialogElement>(null);
  // Data de hoje (fuso de São Paulo) lida fora do render, para marcar retornos atrasados.
  const hoje = useSyncExternalStore(nadaAssinar, hojeSp, () => "");

  // Carrega a cada login e a cada "Atualizar". A sessão é lida na hora (o token pode ter sido renovado).
  useEffect(() => {
    let vivo = true;
    const s = lerSessao(sessao.ler());
    if (!s) return;
    Promise.all([eAdmin(s), listar(s)]).then(([ok, r]) => {
      if (!vivo || r === "sessao") return;
      if (ok === false) return setFalha(admin.semPermissao);
      if (r === "erro") return setFalha(admin.erroCarga);
      setFalha(null);
      setDados(r);
    });
    return () => {
      vivo = false;
    };
  }, [email, versao]);

  const leads = useMemo(() => montarLeads(dados ?? []), [dados]);
  const lista = useMemo(() => filtrarLeads(leads, f), [leads, f]);
  const resumo = useMemo(() => resumir(dados ?? [], f.ambiente), [dados, f.ambiente]);
  const numeros = useMemo(
    () =>
      indicadores(
        leads.filter((l) => !f.ambiente || l.lead.ambiente === f.ambiente),
        hoje,
      ),
    [leads, f.ambiente, hoje],
  );
  const selecionado = leads.find((l) => l.lead.id === aberto) ?? null;
  const temSelecionado = selecionado !== null;

  // A gaveta do lead é um <dialog> modal nativo: foco preso, Esc fecha e o fundo fica inerte.
  useEffect(() => {
    const d = gaveta.current;
    if (!d) return;
    if (temSelecionado && !d.open) d.showModal();
    if (!temSelecionado && d.open) d.close();
  }, [aberto, temSelecionado]);

  const mudarFiltro = (k: keyof Filtros) => (v: string) => setF((atual) => ({ ...atual, [k]: v }));
  const todos = { id: "", label: admin.filtros.todos };

  function aplicar(id: string, campos: CamposCrm) {
    setDados((atual) =>
      (atual ?? []).map((a) => ({ ...a, leads: a.leads.map((l) => (l.id === id ? { ...l, ...campos } : l)) })),
    );
  }

  const registrarEtapa = (s: Sessao, id: string, de: StatusLead, para: StatusLead) =>
    registrarAtividade(s, id, "status", admin.detalhe.atividades.statusAlterado(admin.status[de], admin.status[para]));

  async function salvar(id: string, campos: CamposCrm) {
    const s = lerSessao(sessao.ler());
    const antes = leads.find((l) => l.lead.id === id)?.lead.status;
    if (!s) return false;
    const r = await atualizarLead(s, id, campos);
    if (r !== "ok") return false;
    if (antes && campos.status && campos.status !== antes) await registrarEtapa(s, id, antes, campos.status);
    aplicar(id, campos);
    return true;
  }

  // Mudança de etapa pelo funil: otimista, volta atrás se o banco recusar, e entra na linha do tempo do lead.
  async function mover(id: string, para: StatusLead) {
    const de = leads.find((l) => l.lead.id === id)?.lead.status;
    const s = lerSessao(sessao.ler());
    if (!s || !de || de === para) return;
    setErroMover(null);
    aplicar(id, { status: para });
    const r = await atualizarLead(s, id, { status: para });
    if (r !== "ok") {
      aplicar(id, { status: de });
      setErroMover(admin.funil.erroMover);
      return;
    }
    void registrarEtapa(s, id, de, para);
  }

  function abriuWhatsapp(id: string) {
    const s = lerSessao(sessao.ler());
    if (s) void registrarAtividade(s, id, "whatsapp", admin.detalhe.atividades.whatsappAberto);
  }

  function exportar() {
    const blob = new Blob([csvLeads(lista, (slug) => nomesSolucoes[slug] ?? slug)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${admin.csv.arquivo}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const ind = admin.indicadores;
  const cartoes = [
    [ind.leads, numeros.leads, false],
    [ind.emNegociacao, numeros.emNegociacao, false],
    [ind.clientes, numeros.clientes, false],
    [ind.conversao, `${numeros.conversao}%`, false],
    [ind.atrasados, numeros.atrasados, numeros.atrasados > 0],
    [ind.pediram, numeros.pediram, numeros.pediram > 0],
    [ind.avaliacoes, resumo.avaliacoes, false],
    [ind.semLead, resumo.semLead, false],
  ] as const;

  return (
    <section className={caixa}>
      <div className="container-site">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-verde mb-3">{admin.kicker}</p>
            <h1 className="text-[40px] leading-none font-bold tracking-[-0.03em]">{admin.titulo}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-fg-2 text-[13px]">{email}</span>
            <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={() => setVersao((n) => n + 1)}>
              {admin.atualizar}
            </BotaoAcao>
            <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={exportar} disabled={!lista.length}>
              {admin.exportar}
            </BotaoAcao>
            <BotaoAcao type="button" tamanho="sm" onClick={() => sessao.gravar(null)}>
              {admin.sair}
            </BotaoAcao>
          </div>
        </div>

        {falha || erroMover ? (
          <p role="alert" className="border-fg mb-6 border-l-2 pl-3 font-semibold">
            {falha ?? erroMover}
          </p>
        ) : null}

        <dl className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {cartoes.map(([rotulo, valor, alerta]) => (
            <div key={rotulo} className={cn("bg-painel border p-4", alerta ? "border-verde" : "border-line")}>
              <dt className="text-fg-2 text-[12px]">{rotulo}</dt>
              <dd className="mt-1 text-[24px] font-bold tabular-nums">{dados ? valor : "–"}</dd>
            </div>
          ))}
        </dl>
        <p className="text-fg-2 mb-8 text-[13px]">
          {dados ? (resumo.ultima ? ind.ultima(dataBr(resumo.ultima)) : ind.nenhuma) : null}
        </p>

        <fieldset className="mb-6 grid gap-3 md:grid-cols-[2fr_repeat(5,1fr)]">
          <legend className="sr-only">{admin.filtros.rotulo}</legend>
          <div>
            <label htmlFor="filtro-busca" className="text-fg-2 mb-1.5 block text-[12px] font-semibold">
              {admin.filtros.busca}
            </label>
            <input
              id="filtro-busca"
              type="search"
              value={f.busca}
              onChange={(e) => mudarFiltro("busca")(e.target.value)}
              className={cn(classesEntrada, "py-2.5 text-[14px]")}
            />
          </div>
          <Selecao
            id="filtro-status"
            rotulo={admin.filtros.status}
            valor={f.status}
            aoMudar={mudarFiltro("status")}
            opcoes={[todos, ...ETAPAS.map((s) => ({ id: s, label: admin.status[s] }))]}
          />
          <Selecao
            id="filtro-escopo"
            rotulo={admin.filtros.escopo}
            valor={f.escopo}
            aoMudar={mudarFiltro("escopo")}
            opcoes={[todos, ...segmentacao.escopo.opcoes]}
          />
          <Selecao
            id="filtro-nivel"
            rotulo={admin.filtros.nivel}
            valor={f.nivel}
            aoMudar={mudarFiltro("nivel")}
            opcoes={[
              todos,
              ...niveis.map((n) => ({ id: n.id, label: n.nome })),
              { id: "parcial", label: admin.parcial },
            ]}
          />
          <Selecao
            id="filtro-ambiente"
            rotulo={admin.filtros.ambiente}
            valor={f.ambiente}
            aoMudar={mudarFiltro("ambiente")}
            opcoes={[todos, ...Object.entries(admin.ambientes).map(([id, label]) => ({ id, label }))]}
          />
          <Selecao
            id="filtro-ordem"
            rotulo={admin.filtros.ordem}
            valor={f.ordem}
            aoMudar={mudarFiltro("ordem")}
            opcoes={[
              { id: "recentes", label: admin.filtros.recentes },
              { id: "leadScore", label: admin.filtros.leadScore },
              { id: "aiScore", label: admin.filtros.aiScore },
            ]}
          />
        </fieldset>

        <div role="group" aria-label={admin.vistas.rotulo} className="border-line mb-5 inline-flex border">
          {(["funil", "lista"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={cn(
                "cursor-pointer px-4 py-2 text-[13px] font-semibold transition-colors",
                vista === v ? "bg-verde-vivo text-carvao" : "text-fg-2 hover:text-fg",
              )}
            >
              {admin.vistas[v]}
            </button>
          ))}
        </div>

        {!dados && !falha ? (
          <p className="border-line border p-6 text-[14px]" aria-live="polite">
            {admin.carregando}
          </p>
        ) : vista === "funil" ? (
          <Kanban leads={lista} hoje={hoje} aoAbrir={setAberto} aoMover={mover} aoWhatsapp={abriuWhatsapp} />
        ) : lista.length === 0 ? (
          <p className="border-line border p-6 text-[14px]">{admin.vazio}</p>
        ) : (
          <div className="border-line overflow-x-auto border">
            <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
              <thead className="text-fg-2 text-[12px]">
                <tr className="border-line border-b">
                  {Object.values(admin.colunas).map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((l) => (
                  <tr key={l.lead.id} className="border-line border-b align-top">
                    <td className="text-fg-2 px-4 py-3 whitespace-nowrap tabular-nums">{dataBr(l.lead.criado_em)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setAberto(l.lead.id)}
                        aria-haspopup="dialog"
                        className="hover:text-verde cursor-pointer text-left font-semibold"
                      >
                        {l.lead.nome}
                      </button>
                      <span className="text-fg-2 block text-[12px]">
                        {l.lead.empresa ? `${l.lead.empresa} · ` : ""}
                        {l.lead.email}
                      </span>
                      {l.lead.pediu_contato ? (
                        <span className="text-verde mt-1 block text-[11px] font-bold">
                          {admin.detalhe.pediuContato}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{rotulos.papel(l.avaliacao.papel)}</td>
                    <td className="px-4 py-3">{rotulos.escopo(l.avaliacao.escopo)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <b className="tabular-nums">{l.resultado?.indice ?? "–"}</b>{" "}
                      <span className="text-fg-2 text-[12px]">{rotulos.nivel(l.resultado?.nivel ?? null)}</span>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums">{l.leadScore}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {l.lead.proximo_contato ? (
                        <span className={cn(atrasado(l.lead, hoje) && "font-bold")}>
                          {dataBr(`${l.lead.proximo_contato}T12:00:00`)}
                          {atrasado(l.lead, hoje) ? (
                            <span className="block text-[11px]">{admin.detalhe.atrasado}</span>
                          ) : null}
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-4 py-3">{admin.status[l.lead.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <dialog
          ref={gaveta}
          id="detalhe-lead"
          aria-labelledby="detalhe-lead-titulo"
          onClose={(e) => {
            // O compositor de e-mail é outro <dialog> dentro da gaveta; o close dele também chega aqui.
            if (e.target === e.currentTarget) setAberto(null);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) e.currentTarget.close();
          }}
          className="border-line bg-fundo text-fg backdrop:bg-carvao/70 fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(780px,100vw)] max-w-none overflow-y-auto border-l p-0"
        >
          {selecionado ? (
            <DetalheLead
              key={selecionado.lead.id}
              visao={selecionado}
              nomesSolucoes={nomesSolucoes}
              emailAdmin={email}
              hoje={hoje}
              aoSalvar={(campos) => salvar(selecionado.lead.id, campos)}
              aoFechar={() => gaveta.current?.close()}
            />
          ) : null}
        </dialog>
      </div>
    </section>
  );
}
