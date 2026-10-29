"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CompositorEmail } from "@/components/admin/CompositorEmail";
import { BarrasDimensoes } from "@/components/sections/ai-score/Placar";
import { BotaoAcao } from "@/components/ui/botao";
import { classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import {
  dimensoes,
  escalaAreaCurta,
  modulosArea,
  perguntasCentrais,
  questionario,
} from "@/content/ai-score-questionario";
import type { StatusLead, TipoAtividade } from "@/content/types";
import { formatarNota } from "@/lib/ai-score/calcular";
import { alvosDasDicas, lerDicas, type Dicas } from "@/lib/ai-score/dicas";
import { atrasado, dataBr, rotulos, type LeadVisao } from "@/lib/ai-score/leads";
import { verComoAdmin } from "@/lib/ai-score/navegador";
import { asset } from "@/lib/asset";
import {
  enviarRelatorio,
  lerDicasDaAvaliacao,
  lerSessao,
  listarAtividades,
  listarEmails,
  registrarAtividade,
  sessao,
  type Atividade,
  type CamposCrm,
  type EmailEnviado,
} from "@/lib/supabase-admin";
import { cn } from "@/lib/utils";
import { waUrl } from "@/lib/whatsapp";

const d = admin.detalhe;
const ETAPAS = Object.keys(admin.status) as StatusLead[];
const TIPOS_MANUAIS: TipoAtividade[] = ["nota", "ligacao", "whatsapp", "email", "reuniao"];
const rotuloCampo = "mb-1.5 block text-[12px] font-semibold text-fg-2";
const sessaoAtual = () => lerSessao(sessao.ler());

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-line border-t pt-5">
      <h3 className="eyebrow text-fg-2 mb-4 text-[11px]">{titulo}</h3>
      {children}
    </section>
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
const acao =
  "border-line bg-escuro hover:border-verde inline-flex items-center gap-2 border px-3 py-2 text-[13px] font-semibold transition-colors";

/**
 * Gaveta do lead no mini CRM: ações (WhatsApp, ligar, e-mail, relatório), acompanhamento (etapa, responsável,
 * próximo contato, resumo), linha do tempo de atividades, e-mails enviados, dicas por IA, resultado,
 * respostas e origem. Cada mudança de etapa e cada contato pelo WhatsApp entram na linha do tempo.
 */
export function DetalheLead({
  visao: v,
  nomesSolucoes,
  emailAdmin,
  hoje,
  aoSalvar,
  aoFechar,
}: {
  visao: LeadVisao;
  nomesSolucoes: Record<string, string>;
  emailAdmin: string;
  hoje: string;
  aoSalvar: (campos: CamposCrm) => Promise<boolean>;
  aoFechar: () => void;
}) {
  const { lead: l, avaliacao: a, resultado, respostas } = v;
  const [status, setStatus] = useState<StatusLead>(l.status);
  const [responsavel, setResponsavel] = useState(l.responsavel ?? "");
  const [proximo, setProximo] = useState(l.proximo_contato ?? "");
  const [notas, setNotas] = useState(l.notas ?? "");
  const [estado, setEstado] = useState<"" | "salvando" | "salvo" | "erro">("");
  const [atividades, setAtividades] = useState<Atividade[] | null>(null);
  const [emails, setEmails] = useState<EmailEnviado[] | null>(null);
  const [dicas, setDicas] = useState<Dicas | null>(null);
  const [tipo, setTipo] = useState<TipoAtividade>("nota");
  const [texto, setTexto] = useState("");
  const [registrando, setRegistrando] = useState<"" | "registrando" | "erro">("");
  const [envioRelatorio, setEnvioRelatorio] = useState("");
  const [versao, setVersao] = useState(0);
  const compositor = useRef<HTMLDialogElement>(null);
  const alvos = useMemo(() => (resultado ? alvosDasDicas(resultado) : []), [resultado]);
  const recarregar = useCallback(() => setVersao((n) => n + 1), []);

  // Linha do tempo, e-mails e dicas: carregados ao abrir e depois de cada registro.
  useEffect(() => {
    const s = sessaoAtual();
    if (!s) return;
    let vivo = true;
    void Promise.all([listarAtividades(s, l.id), listarEmails(s, l.id), lerDicasDaAvaliacao(s, a.id)]).then(
      ([ats, ems, dic]) => {
        if (!vivo) return;
        setAtividades(Array.isArray(ats) ? ats : []);
        setEmails(Array.isArray(ems) ? ems : []);
        setDicas(lerDicas(dic, alvos));
      },
    );
    return () => {
      vivo = false;
    };
  }, [l.id, a.id, alvos, versao]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    const ok = await aoSalvar({
      status,
      notas: notas.trim() || null,
      responsavel: responsavel.trim() || null,
      proximo_contato: proximo || null,
    });
    setEstado(ok ? "salvo" : "erro");
    if (ok) recarregar();
  }

  async function registrar(e: FormEvent) {
    e.preventDefault();
    const s = sessaoAtual();
    if (!s || !texto.trim()) return;
    setRegistrando("registrando");
    const r = await registrarAtividade(s, l.id, tipo, texto.trim());
    setRegistrando(r === "ok" ? "" : "erro");
    if (r === "ok") {
      setTexto("");
      recarregar();
    }
  }

  function abriuWhatsapp() {
    const s = sessaoAtual();
    if (s) void registrarAtividade(s, l.id, "whatsapp", d.atividades.whatsappAberto).then(recarregar);
  }

  async function mandarRelatorio() {
    setEnvioRelatorio(d.acoes.relatorioEnviando);
    const st = await enviarRelatorio(a.id, l.id);
    setEnvioRelatorio(d.emails.status[st as keyof typeof d.emails.status] ?? admin.compositor.erro);
    recarregar();
  }

  const area = a.escopo !== "empresa";
  const vencido = atrasado(l, hoje);
  const whatsapp = l.whatsapp ? waUrl(admin.mensagem(l.nome, resultado?.indice ?? null), l.whatsapp) : null;

  return (
    <div className="p-[20px] md:p-[30px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="detalhe-lead-titulo" className="text-[26px] leading-[1.15] font-bold tracking-[-0.02em]">
            {l.nome}
          </h2>
          <p className="text-fg-2 mt-1 text-[15px]">{l.empresa ?? d.semEmpresa}</p>
          <p className="text-fg-2 mt-1 text-[13px]">
            {d.criadoEm} {dataBr(l.criado_em)} · {d.leadScore} <b className="text-fg">{v.leadScore}</b> ·{" "}
            {admin.colunas.aiScore} <b className="text-fg">{resultado?.indice ?? "–"}</b>{" "}
            {rotulos.nivel(resultado?.nivel ?? null)}
          </p>
          <p className="mt-2 flex flex-wrap gap-2">
            {l.pediu_contato ? <span className={cn(etiqueta, "border-verde text-verde")}>{d.pediuContato}</span> : null}
            {l.empresa ? <span className={etiqueta}>{d.relatorioCompleto}</span> : null}
            {l.relatorio_enviado_em ? <span className={etiqueta}>{d.relatorioEnviado}</span> : null}
            {l.consentimento_marketing ? <span className={etiqueta}>{d.marketing}</span> : null}
            {l.email_pessoal ? <span className={etiqueta}>{d.emailPessoal}</span> : null}
          </p>
        </div>
        <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={aoFechar}>
          {d.fechar}
        </BotaoAcao>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener"
            onClick={abriuWhatsapp}
            className={cn(acao, "border-verde text-verde")}
          >
            {d.acoes.whatsapp} +{l.whatsapp} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {l.whatsapp ? (
          <a href={`tel:+${l.whatsapp}`} className={acao}>
            {d.acoes.ligar}
          </a>
        ) : null}
        <button type="button" onClick={() => compositor.current?.showModal()} className={cn(acao, "cursor-pointer")}>
          {d.acoes.email}
        </button>
        {l.empresa && !l.relatorio_enviado_em ? (
          <button type="button" onClick={mandarRelatorio} className={cn(acao, "cursor-pointer")}>
            {d.acoes.relatorio}
          </button>
        ) : null}
        <span aria-live="polite" className="self-center text-[13px] font-semibold">
          {envioRelatorio}
        </span>
      </div>
      {l.whatsapp && !l.pediu_contato ? (
        <p className="border-fg text-fg-2 -mt-3 mb-6 border-l-2 pl-3 text-[13px]">{d.semPedido}</p>
      ) : null}

      <div className="grid gap-6">
        <form onSubmit={salvar} className="border-verde/40 grid gap-4 border p-4 sm:grid-cols-2">
          <h3 className="eyebrow text-verde text-[11px] sm:col-span-2">{d.crm}</h3>
          <div>
            <label htmlFor="detalhe-status" className={rotuloCampo}>
              {d.statusRotulo}
            </label>
            <select
              id="detalhe-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusLead)}
              className={classesEntrada}
            >
              {ETAPAS.map((s) => (
                <option key={s} value={s}>
                  {admin.status[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="detalhe-proximo" className={rotuloCampo}>
              {d.proximoContato}
              {vencido ? <span className="text-fg ml-2">· {d.atrasado}</span> : null}
            </label>
            <input
              id="detalhe-proximo"
              type="date"
              value={proximo}
              onChange={(e) => setProximo(e.target.value)}
              className={classesEntrada}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="detalhe-responsavel" className={rotuloCampo}>
              {d.responsavel}
            </label>
            <div className="flex gap-2">
              <input
                id="detalhe-responsavel"
                type="email"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className={classesEntrada}
              />
              <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={() => setResponsavel(emailAdmin)}>
                {d.assumir}
              </BotaoAcao>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="detalhe-notas" className={rotuloCampo}>
              {d.notas}
            </label>
            <textarea
              id="detalhe-notas"
              rows={3}
              maxLength={4000}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={classesEntrada}
            />
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <BotaoAcao type="submit" tamanho="sm" disabled={estado === "salvando"}>
              {estado === "salvando" ? d.salvando : d.salvar}
            </BotaoAcao>
            <span aria-live="polite" className="text-[13px] font-semibold">
              {estado === "salvo" ? d.salvo : estado === "erro" ? d.erroSalvar : ""}
            </span>
          </div>
        </form>

        <Bloco titulo={d.atividades.titulo}>
          <form onSubmit={registrar} className="mb-5 grid gap-3 sm:grid-cols-[150px_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="atividade-tipo" className={rotuloCampo}>
                {d.atividades.tipo}
              </label>
              <select
                id="atividade-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAtividade)}
                className={classesEntrada}
              >
                {TIPOS_MANUAIS.map((t) => (
                  <option key={t} value={t}>
                    {d.atividades.tipos[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="atividade-texto" className={rotuloCampo}>
                {d.atividades.texto}
              </label>
              <input
                id="atividade-texto"
                value={texto}
                maxLength={4000}
                onChange={(e) => setTexto(e.target.value)}
                className={classesEntrada}
              />
            </div>
            <BotaoAcao type="submit" tamanho="sm" disabled={registrando === "registrando" || !texto.trim()}>
              {registrando === "registrando" ? d.atividades.registrando : d.atividades.registrar}
            </BotaoAcao>
            {registrando === "erro" ? (
              <p className="text-[13px] font-semibold sm:col-span-3">{d.atividades.erro}</p>
            ) : null}
          </form>
          {atividades === null ? (
            <p className="text-[14px]">{admin.carregando}</p>
          ) : atividades.length ? (
            <ol className="border-line border-l pl-4">
              {atividades.map((at) => (
                <li key={at.id} className="relative pb-4 text-[14px] leading-[1.5]">
                  <span
                    aria-hidden="true"
                    className="bg-verde-vivo absolute top-[7px] -left-[21px] size-[9px] rounded-full"
                  />
                  <span className="text-fg-2 block text-[12px]">
                    {d.atividades.tipos[at.tipo]} ·{" "}
                    {new Date(at.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} · {at.autor}
                  </span>
                  {at.texto}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px]">{d.atividades.vazio}</p>
          )}
        </Bloco>

        <Bloco titulo={d.emails.titulo}>
          {emails === null ? (
            <p className="text-[14px]">{admin.carregando}</p>
          ) : emails.length ? (
            <ul className="grid gap-2">
              {emails.map((em) => (
                <li key={em.id} className="text-[14px] leading-[1.5]">
                  <span className="text-fg-2 block text-[12px]">
                    {d.emails.tipos[em.tipo]} · {dataBr(em.criado_em)} · {em.autor}
                  </span>
                  {em.assunto} · <b>{d.emails.status[em.status]}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px]">{d.emails.vazio}</p>
          )}
        </Bloco>

        <Bloco titulo={d.contato}>
          <dl>
            <Linha rotulo={d.email}>
              <a href={`mailto:${l.email}`} className="underline underline-offset-2">
                {l.email}
              </a>
            </Linha>
            {l.whatsapp ? <Linha rotulo={d.acoes.whatsapp}>+{l.whatsapp}</Linha> : null}
          </dl>
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
            <span className="text-[40px] leading-none font-bold">{resultado?.indice ?? "–"}</span>
            <span className="text-verde font-bold">{rotulos.nivel(resultado?.nivel ?? null)}</span>
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
            onClick={() => verComoAdmin.marcar()}
            className="text-verde mt-4 inline-block text-[14px] font-bold"
          >
            {d.verResultado} <span aria-hidden="true">↗</span>
          </a>
        </Bloco>

        <Bloco titulo={d.dicas}>
          {dicas ? (
            <div className="grid gap-4">
              {dicas.dimensoes.map((x) => (
                <div key={x.id}>
                  <p className="mb-1 text-[14px] font-bold">{dimensoes.find((dim) => dim.id === x.id)?.nome}</p>
                  <ul className="grid gap-1.5">
                    {x.dicas.map((t) => (
                      <li key={t} className="text-[13px] leading-[1.5]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px]">{d.semDicas}</p>
          )}
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

      <CompositorEmail
        refDialogo={compositor}
        lead={l}
        indice={resultado?.indice ?? null}
        nivel={resultado?.nivel ? rotulos.nivel(resultado.nivel) : null}
        aoEnviar={recarregar}
      />
    </div>
  );
}
