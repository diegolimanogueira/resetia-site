"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { FormularioLead } from "@/components/sections/ai-score/FormularioLead";
import { Barra, BarrasDimensoes, Nota } from "@/components/sections/ai-score/Placar";
import { Relatorio } from "@/components/sections/ai-score/Relatorio";
import { Botao, BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import {
  dimensoes,
  modulosArea,
  niveis,
  relatorio as impresso,
  resultadoTextos as t,
} from "@/content/ai-score-questionario";
import { calcular, formatarNota } from "@/lib/ai-score/calcular";
import { completas, decodificar } from "@/lib/ai-score/codificar";
import { assinarArmazenamento, assinarHash, lerHash, lerLiberacao, relatorio } from "@/lib/ai-score/navegador";
import { recomendar } from "@/lib/ai-score/recomendar";
import type { RespostasCompletas } from "@/lib/ai-score/tipos";
import { reenviarPendentes } from "@/lib/supabase";
import { waUrl } from "@/lib/whatsapp";

const AVALIACAO = "/ai-score/avaliacao/";
const dimensao = (id: string) => dimensoes.find((d) => d.id === id)!;

const topo =
  "border-line overflow-hidden border-b bg-[radial-gradient(circle_at_85%_30%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[50px] pb-[60px] md:pt-[80px] md:pb-[90px]";

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
 * Tela de resultado (camada 1, grátis e sem cadastro), o formulário ou o relatório completo (camada 2)
 * e o convite para a Análise Estratégica (camada 3). As respostas vêm do hash da URL.
 * `cartoes`: os cinco cards de solução, renderizados no servidor (o conteúdo das soluções não vem para o cliente).
 */
export function Resultado({ cartoes }: { cartoes: Record<string, ReactNode> }) {
  const hash = useSyncExternalStore(assinarHash, lerHash, () => null);
  const respostas = useMemo(() => (hash === null ? undefined : decodificar(hash)), [hash]);

  useEffect(() => {
    void reenviarPendentes();
  }, []);

  if (respostas === undefined) return <SemResultado carregando />;
  if (!completas(respostas)) return <SemResultado carregando={false} />;
  return <Pronto respostas={respostas} codigo={hash!} cartoes={cartoes} />;
}

function Pronto({
  respostas: r,
  codigo,
  cartoes,
}: {
  respostas: RespostasCompletas;
  codigo: string;
  cartoes: Record<string, ReactNode>;
}) {
  const resultado = useMemo(() => calcular(r), [r]);
  const rec = useMemo(() => recomendar(resultado, r.desafios), [resultado, r.desafios]);
  const chave = r.id ?? codigo;
  const liberadoTexto = useSyncExternalStore(
    assinarArmazenamento,
    () => relatorio.ler(chave),
    () => null,
  );
  const liberacao = useMemo(() => lerLiberacao(liberadoTexto), [liberadoTexto]);
  const [acabouDeLiberar, setAcabouDeLiberar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const nivel = niveis.find((n) => n.id === resultado.nivel);
  const lacuna = rec.lacunas[0] ? dimensao(rec.lacunas[0]) : null;
  const mensagem = t.mensagem({
    indice: resultado.indice,
    nivel: nivel?.nome ?? null,
    lacunas: rec.lacunas.slice(0, 2).map((id) => dimensao(id).nome),
  });

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
      {liberacao ? (
        <div className="gutter hidden pt-2 pb-6 print:block">
          <div className="container-site">
            <p className="eyebrow text-verde mb-1">{impresso.impresso.titulo}</p>
            <p className="text-[14px]">{impresso.impresso.para(liberacao.nome, liberacao.empresa, liberacao.data)}</p>
          </div>
        </div>
      ) : null}

      <Section espaco="nenhum" className={topo}>
        <div className="container-site grid gap-12 md:grid-cols-2 md:gap-[80px]">
          <div>
            <Eyebrow>{t.escopo(r.escopo)}</Eyebrow>
            <h1 className="mb-8 text-[clamp(30px,3.6vw,48px)] leading-[1.08] font-bold tracking-[-0.03em]">
              {t.titulo}
            </h1>
            {resultado.indice !== null && resultado.nivel ? (
              <Nota indice={resultado.indice} nivel={resultado.nivel} />
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
          </div>
        </div>
      </Section>

      <Section id="relatorio" data-nao-imprimir={liberacao ? undefined : ""}>
        {liberacao ? (
          <Relatorio respostas={r} resultado={resultado} recomendacao={rec} cartoes={cartoes} focar={acabouDeLiberar} />
        ) : (
          <FormularioLead
            respostas={r}
            resultado={resultado}
            codigo={codigo}
            aoLiberar={() => setAcabouDeLiberar(true)}
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
