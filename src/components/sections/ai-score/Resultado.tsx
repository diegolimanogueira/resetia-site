"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { EtapaContato } from "@/components/sections/ai-score/EtapaContato";
import { FormularioLead } from "@/components/sections/ai-score/FormularioLead";
import { Barra, BarrasDimensoes, Nota, Regua } from "@/components/sections/ai-score/Placar";
import { Relatorio } from "@/components/sections/ai-score/Relatorio";
import { Botao, BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import {
  alertas,
  dimensoes,
  exemplo as textosExemplo,
  modulosArea,
  niveis,
  relatorio as impresso,
  resultadoTextos as t,
} from "@/content/ai-score-questionario";
import { analisar } from "@/lib/ai-score/analisar";
import { calcular, formatarNota } from "@/lib/ai-score/calcular";
import { completas, decodificar } from "@/lib/ai-score/codificar";
import {
  assinarArmazenamento,
  assinarHash,
  lerHash,
  lerLiberacao,
  marcaAdminValida,
  relatorio,
  verComoAdmin,
} from "@/lib/ai-score/navegador";
import { recomendar } from "@/lib/ai-score/recomendar";
import type { RespostasCompletas } from "@/lib/ai-score/tipos";
import { reenviarPendentes, supabase } from "@/lib/supabase";
import { waUrl } from "@/lib/whatsapp";

const AVALIACAO = "/ai-score/avaliacao/";
const dimensao = (id: string) => dimensoes.find((d) => d.id === id)!;

const topo =
  "border-line overflow-hidden border-b bg-[radial-gradient(circle_at_85%_30%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[50px] pb-[60px] md:pt-[80px] md:pb-[90px]";

/** Exemplo fixo (/ai-score/exemplo): mostra tudo, sem etapas de captura nem gravação. */
export interface Exemplo {
  codigo: string;
  nome: string;
  empresa: string;
}

type Modo = { tipo: "publico" } | { tipo: "admin" } | ({ tipo: "exemplo" } & Exemplo);

/** Estado sem resultado (servidor, link vazio ou adulterado): o mesmo H1, com o convite para começar. */
function SemResultado({ carregando }: { carregando: boolean }) {
  return (
    <Section espaco="nenhum" className={topo}>
      <div className="container-site max-w-[760px]">
        <Eyebrow>{t.kicker}</Eyebrow>
        <h1 className="display-h2 mb-6">{t.titulo}</h1>
        {carregando ? (
          <p className="text-fg-2 text-[18px]" aria-live="polite">
            {t.carregando}
          </p>
        ) : (
          <>
            <p className="mb-2 text-[22px] font-bold">{t.vazio.titulo}</p>
            <p className="text-fg-2 mb-8 text-[18px] leading-[1.6]">{t.vazio.texto}</p>
            <Botao href={AVALIACAO} origem="ai-score-resultado-vazio">
              {t.vazio.cta}
            </Botao>
          </>
        )}
      </div>
    </Section>
  );
}

/**
 * Resultado do RESET AI Score em duas etapas de captura: nome e e-mail abrem o resultado (camada 1); a empresa
 * libera o relatório completo (camada 2); a Análise Estratégica fecha a página (camada 3). As respostas vêm do
 * hash da URL. `cartoes`: os cinco cards de solução, renderizados no servidor. `exemplo`: o caso fixo da página
 * de exemplo, com tudo aberto (renderizado já no servidor).
 */
export function Resultado({ cartoes, exemplo }: { cartoes: Record<string, ReactNode>; exemplo?: Exemplo }) {
  const hash = useSyncExternalStore(assinarHash, lerHash, () => null);
  const admin = useSyncExternalStore(
    assinarArmazenamento,
    () => marcaAdminValida(verComoAdmin.ler(), Date.now()),
    () => false,
  );
  const texto = exemplo ? exemplo.codigo : hash;
  const respostas = useMemo(() => (texto === null ? undefined : decodificar(texto)), [texto]);

  useEffect(() => {
    if (!exemplo) void reenviarPendentes();
  }, [exemplo]);

  if (respostas === undefined) return <SemResultado carregando />;
  if (!completas(respostas)) return <SemResultado carregando={false} />;
  const modo: Modo = exemplo ? { tipo: "exemplo", ...exemplo } : admin ? { tipo: "admin" } : { tipo: "publico" };
  return <Pronto respostas={respostas} codigo={texto!} cartoes={cartoes} modo={modo} />;
}

function Pronto({
  respostas: r,
  codigo,
  cartoes,
  modo,
}: {
  respostas: RespostasCompletas;
  codigo: string;
  cartoes: Record<string, ReactNode>;
  modo: Modo;
}) {
  const resultado = useMemo(() => calcular(r), [r]);
  const rec = useMemo(() => recomendar(resultado, r.desafios), [resultado, r.desafios]);
  const analise = useMemo(() => analisar(r, resultado, rec), [r, resultado, rec]);
  const chave = r.id ?? codigo;
  const liberadoTexto = useSyncExternalStore(
    assinarArmazenamento,
    () => relatorio.ler(chave),
    () => null,
  );
  const liberacao = useMemo(() => lerLiberacao(liberadoTexto), [liberadoTexto]);
  const [foco, setFoco] = useState<"" | "resultado" | "relatorio">("");
  const [copiado, setCopiado] = useState(false);
  const h1 = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (foco !== "resultado") return;
    window.scrollTo({ top: 0 });
    h1.current?.focus({ preventScroll: true });
  }, [foco]);

  const tudoAberto = modo.tipo !== "publico";
  const viuResultado = tudoAberto || liberacao !== null;
  const viuRelatorio = tudoAberto || liberacao?.completo === true;
  const nome = modo.tipo === "exemplo" ? modo.nome : liberacao?.nome;
  const empresa = modo.tipo === "exemplo" ? modo.empresa : liberacao?.empresa;

  if (!viuResultado)
    return <EtapaContato respostas={r} resultado={resultado} codigo={codigo} aoLiberar={() => setFoco("resultado")} />;

  const nivel = niveis.find((n) => n.id === resultado.nivel);
  const lacuna = rec.lacunas[0] ? dimensao(rec.lacunas[0]) : null;
  const mensagem = t.mensagem({
    indice: resultado.indice,
    nivel: nivel?.nome ?? null,
    lacunas: rec.lacunas.slice(0, 2).map((id) => dimensao(id).nome),
  });
  const moduloDaArea = modulosArea.find((m) => m.area === r.escopo)?.nome;
  const quem =
    r.escopo === "empresa"
      ? (empresa ?? impresso.resumo.suaEmpresa)
      : `${impresso.resumo.suaArea} (${moduloDaArea}${empresa ? `, ${empresa}` : ""})`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <>
      {modo.tipo === "exemplo" ? (
        <div data-nao-imprimir className="gutter border-line bg-painel border-b py-3">
          <div className="container-site flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <span>{textosExemplo.aviso}</span>
            <Botao href={AVALIACAO} tamanho="sm" origem="ai-score-exemplo-topo">
              {textosExemplo.cta}
            </Botao>
          </div>
        </div>
      ) : null}

      {viuRelatorio && nome && empresa ? (
        <div className="gutter hidden pt-2 pb-6 print:block">
          <div className="container-site">
            <p className="eyebrow text-verde mb-1">{impresso.impresso.titulo}</p>
            <p className="text-[14px]">{impresso.impresso.para(nome, empresa, liberacao?.data)}</p>
          </div>
        </div>
      ) : null}

      <Section espaco="nenhum" className={topo}>
        <div className="container-site grid gap-12 md:grid-cols-2 md:gap-[80px]">
          <div>
            <Eyebrow>{t.escopo(r.escopo)}</Eyebrow>
            <h1
              ref={h1}
              tabIndex={-1}
              className="mb-2 text-[clamp(30px,3.6vw,48px)] leading-[1.08] font-bold tracking-[-0.03em] focus:outline-none"
            >
              {t.titulo}
            </h1>
            {nome ? <p className="text-fg-2 mb-8 text-[16px]">{t.ola(nome)}</p> : <div className="mb-8" />}
            {resultado.indice !== null && resultado.nivel ? (
              <>
                <Nota indice={resultado.indice} nivel={resultado.nivel} />
                <div className="mt-8 max-w-[520px]">
                  <Regua indice={resultado.indice} nivel={resultado.nivel} />
                </div>
              </>
            ) : (
              <p className="text-verde text-[clamp(40px,5vw,64px)] leading-none font-bold tracking-[-0.03em]">
                {t.parcial.nome}
              </p>
            )}
            <h2 className="mt-9 text-[22px] leading-[1.3] font-bold">{nivel ? nivel.titulo : t.parcial.titulo}</h2>
            <p className="text-fg-2 mt-3 max-w-[560px] text-[17px] leading-[1.7]">
              {nivel ? nivel.texto : t.parcial.texto}
            </p>
          </div>
          <div className="border-line bg-painel self-start border p-[26px] md:p-[36px]">
            <h2 className="eyebrow text-fg-2 mb-6 text-[11px]">{t.dimensoes}</h2>
            <BarrasDimensoes notas={resultado.dimensoes} />
          </div>
        </div>
      </Section>

      <Section tom="escuro">
        <div className="container-site">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="border-line bg-painel break-inside-avoid border p-[26px] md:p-[32px]">
              <h2 className="eyebrow text-fg-2 mb-5 text-[11px]">{t.forte}</h2>
              {rec.forte ? (
                <>
                  <p className="text-verde mb-2 text-[14px] font-semibold">{dimensao(rec.forte).nome}</p>
                  <p className="text-[19px] leading-[1.45] font-semibold">{dimensao(rec.forte).forte}</p>
                </>
              ) : (
                <p className="text-[19px] leading-[1.45] font-semibold">{t.semForte}</p>
              )}
            </div>
            <div className="border-verde/40 break-inside-avoid border bg-[radial-gradient(circle_at_100%_0%,rgba(0,230,118,0.1)_0%,rgba(0,230,118,0)_60%)] p-[26px] md:p-[32px]">
              <h2 className="eyebrow text-fg-2 mb-5 text-[11px]">{t.lacuna}</h2>
              {lacuna ? (
                <>
                  <p className="text-verde mb-2 text-[14px] font-semibold">{lacuna.nome}</p>
                  <p className="text-[19px] leading-[1.45] font-semibold">{lacuna.lacuna}</p>
                </>
              ) : null}
            </div>
            <div className="border-line bg-painel break-inside-avoid border p-[26px] md:p-[32px]">
              <h2 className="eyebrow text-fg-2 mb-5 text-[11px]">{t.passos}</h2>
              <ol className="grid gap-4">
                {rec.passos.map((p, i) => (
                  <li key={p} className="grid grid-cols-[28px_1fr] gap-2 text-[15px] leading-[1.55]">
                    <span className="text-verde font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {analise.alertas.length ? (
            <div className="mt-14">
              <h2 className="mb-6 text-[24px] leading-[1.2] font-bold">{alertas.titulo}</h2>
              <ul className="grid gap-3 md:grid-cols-3">
                {analise.alertas.map((id) => (
                  <li
                    key={id}
                    className="border-line border-l-verde bg-painel break-inside-avoid border border-l-2 p-[22px]"
                  >
                    <p className="mb-2 text-[17px] leading-[1.3] font-bold">{alertas.itens[id].titulo}</p>
                    <p className="text-fg-2 text-[14px] leading-[1.6]">{alertas.itens[id].texto}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {r.areas.length ? (
            <div className="mt-14">
              <h2 className="mb-2 text-[24px] leading-[1.2] font-bold">{t.areas.titulo}</h2>
              <p className="text-fg-2 mb-6 max-w-[640px] text-[15px]">{t.areas.nota}</p>
              <ul className="grid gap-3 sm:grid-cols-3">
                {r.areas.map((a) => {
                  const v = resultado.areas[a] ?? null;
                  return (
                    <li key={a} className="border-line bg-painel break-inside-avoid border p-[24px]">
                      <span className="mb-3 flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-bold">{modulosArea.find((m) => m.area === a)!.nome}</span>
                        <span className="text-[22px] font-bold tabular-nums">
                          {v === null ? t.semResposta : formatarNota(v)}
                          {v === null ? null : <span className="text-fg-2 text-[13px] font-semibold">{t.de100}</span>}
                        </span>
                      </span>
                      <Barra valor={v} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="border-line mt-12 flex flex-col gap-5 border-t pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-fg-2 max-w-[620px] text-[13px] leading-[1.6]">{t.aviso}</p>
            {modo.tipo === "publico" ? (
              <div data-nao-imprimir className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={copiar}>
                  {t.compartilhar}
                </BotaoAcao>
                <Botao href={AVALIACAO} variante="secundario" tamanho="sm" origem="ai-score-refazer">
                  {t.refazer}
                </Botao>
                <span aria-live="polite" className="text-verde text-[13px] font-semibold">
                  {copiado ? t.copiado : ""}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      <Section id="relatorio" data-nao-imprimir={viuRelatorio ? undefined : ""}>
        {viuRelatorio ? (
          <Relatorio
            respostas={r}
            resultado={resultado}
            recomendacao={rec}
            analise={analise}
            cartoes={cartoes}
            quem={quem}
            focar={foco === "relatorio"}
            demo={modo.tipo === "publico" && !supabase.ativo}
          />
        ) : (
          <FormularioLead
            avaliacaoId={chave}
            liberacao={liberacao!}
            resultado={resultado}
            aoLiberar={() => setFoco("relatorio")}
          />
        )}
      </Section>

      <Section tom="contraste" data-nao-imprimir="" className="border-line border-t">
        <div className="container-site grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-[80px]">
          <div>
            <Eyebrow>{t.conversa.kicker}</Eyebrow>
            <h2 className="text-[clamp(32px,4vw,56px)] leading-[1.05] font-bold tracking-[-0.03em]">
              <Linhas itens={t.conversa.titulo} />
            </h2>
          </div>
          <div>
            <p className="text-fg-2 mb-7 text-[17px] leading-[1.7]">{t.conversa.texto}</p>
            <Botao href={waUrl(mensagem)} origem="diagnostico-resultado">
              {t.conversa.cta}
            </Botao>
          </div>
        </div>
      </Section>

      <div className="gutter hidden pt-6 print:block">
        <p className="container-site text-[11px]">{impresso.impresso.rodape}</p>
      </div>
    </>
  );
}
