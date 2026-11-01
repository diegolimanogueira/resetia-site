"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { preferencias as t } from "@/content/ai-score-preferencias";
import { assinarHash, lerHash, novoId } from "@/lib/ai-score/navegador";
import { chamarFuncao, supabase } from "@/lib/supabase";

type Escolhas = Record<string, boolean>;
const chave = (finalidade: string, canal: string) => `${finalidade}|${canal}`;
const TOKEN = /^[A-Za-z0-9_-]{20,200}$/;

type Estado =
  | { tipo: "carregando" }
  | { tipo: "invalido" }
  | { tipo: "falhou" }
  | { tipo: "pronto"; atuais: Escolhas; temNumero: boolean };

interface Resposta {
  tem_numero?: boolean;
  escolhas?: Array<{ finalidade: string; canal: string; concedido: boolean }>;
}
const deResposta = (d: Resposta | null): Estado =>
  d?.escolhas
    ? {
        tipo: "pronto",
        atuais: Object.fromEntries(d.escolhas.map((e) => [chave(e.finalidade, e.canal), e.concedido])),
        temNumero: d.tem_numero === true,
      }
    : { tipo: "falhou" };

/**
 * Preferências de contato, pelo link protegido do e-mail. O token (finalidade `preferencias`) fica no hash da URL e
 * só vai à função, nunca ao analytics. A pessoa lê o que escolheu antes e pode conceder ou revogar; cada mudança vira
 * um evento registrado, e o resultado mostrado é sempre o que o servidor devolveu.
 */
export function Preferencias() {
  const hash = useSyncExternalStore(assinarHash, lerHash, () => null);
  const token = useMemo(() => {
    const k = new URLSearchParams(hash ?? "").get("k");
    return k && TOKEN.test(k) ? k : null;
  }, [hash]);

  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [marcadas, setMarcadas] = useState<Escolhas | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [situacao, setSituacao] = useState<"" | "salvando" | "salvo" | "sem-mudanca" | "falhou" | "sem-numero">("");

  useEffect(() => {
    if (!token || !supabase.ativo) return;
    let vivo = true;
    void chamarFuncao<Resposta>({ acao: "preferencias", token }, { timeout: 20_000 }).then((r) => {
      if (!vivo) return;
      if (r.status === 403) return setEstado({ tipo: "invalido" });
      const e = r.ok ? deResposta(r.dados) : ({ tipo: "falhou" } as const);
      setEstado(e);
      if (e.tipo === "pronto") setMarcadas(e.atuais);
    });
    return () => {
      vivo = false;
    };
  }, [token, tentativa]);

  async function salvar() {
    if (!token || estado.tipo !== "pronto" || !marcadas) return;
    const mudadas = t.escolhas.filter(
      (e) => marcadas[chave(e.finalidade, e.canal)] !== estado.atuais[chave(e.finalidade, e.canal)],
    );
    if (!mudadas.length) return setSituacao("sem-mudanca");
    setSituacao("salvando");
    const r = await chamarFuncao<Resposta>(
      {
        acao: "preferencias",
        token,
        pedido: novoId(),
        escolhas: mudadas.map((e) => ({
          finalidade: e.finalidade,
          canal: e.canal,
          concedido: marcadas[chave(e.finalidade, e.canal)],
        })),
      },
      { timeout: 20_000 },
    );
    if (r.status === 422) return setSituacao("sem-numero");
    if (!r.ok) return setSituacao("falhou");
    const novo = deResposta(r.dados);
    setEstado(novo);
    if (novo.tipo === "pronto") setMarcadas(novo.atuais);
    setSituacao("salvo");
  }

  const mensagem =
    !token || hash === null
      ? hash === null
        ? null
        : t.link.incompleto
      : !supabase.ativo
        ? t.link.incompleto
        : estado.tipo === "invalido"
          ? t.link.invalido
          : null;

  return (
    <Section tom="carvao" className="pt-[50px] pb-[80px] md:pt-[80px]">
      <div className="container-site max-w-[760px]">
        <Eyebrow>{t.kicker}</Eyebrow>
        <h1 className="display-h2 mb-6">
          <Linhas itens={t.titulo} />
        </h1>
        {mensagem ? (
          <div data-preferencias="indisponivel" className="border-line bg-painel border p-[22px]">
            <p className="font-semibold">{mensagem.titulo}</p>
            <p className="text-fg-2 mt-1 text-[15px] leading-[1.6]">{mensagem.texto}</p>
          </div>
        ) : estado.tipo === "carregando" ? (
          <p aria-live="polite" data-preferencias="carregando" className="text-fg-2">
            {t.carregando}
          </p>
        ) : estado.tipo === "falhou" ? (
          <div data-preferencias="falhou">
            <p className="text-fg-2 mb-4">{t.falhou}</p>
            <BotaoAcao
              type="button"
              onClick={() => {
                setEstado({ tipo: "carregando" });
                setTentativa((n) => n + 1);
              }}
            >
              {t.tentar}
            </BotaoAcao>
          </div>
        ) : estado.tipo === "pronto" && marcadas ? (
          <div data-preferencias="pronto">
            <p className="text-fg-2 mb-8 max-w-[640px] text-[16px] leading-[1.65]">{t.texto}</p>
            <fieldset className="grid gap-3">
              <legend className="sr-only">{t.titulo.join(" ").replaceAll("*", "")}</legend>
              {t.escolhas.map((e) => {
                const k = chave(e.finalidade, e.canal);
                const semNumero = e.canal !== "email" && !estado.temNumero;
                return (
                  <label
                    key={k}
                    className="border-line bg-painel flex cursor-pointer items-start gap-4 border px-5 py-4 text-[16px] leading-[1.45] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                  >
                    <input
                      type="checkbox"
                      className="accent-verde mt-[3px] size-[18px] shrink-0"
                      checked={marcadas[k] === true}
                      disabled={semNumero || situacao === "salvando"}
                      onChange={(ev) => {
                        setSituacao("");
                        setMarcadas({ ...marcadas, [k]: ev.target.checked });
                      }}
                    />
                    <span>
                      {e.rotulo}
                      {semNumero ? <span className="text-fg-2 mt-1 block text-[13px]">{t.semNumero}</span> : null}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <BotaoAcao type="button" onClick={() => void salvar()} disabled={situacao === "salvando"}>
                {situacao === "salvando" ? t.salvando : t.salvar}
              </BotaoAcao>
              <p aria-live="polite" data-situacao={situacao} className="text-[14px] font-semibold">
                {situacao === "salvo"
                  ? t.salvo
                  : situacao === "sem-mudanca"
                    ? t.semMudanca
                    : situacao === "falhou"
                      ? t.salvarFalhou
                      : situacao === "sem-numero"
                        ? t.semNumeroAoSalvar
                        : ""}
              </p>
            </div>
          </div>
        ) : null}
        <p className="text-fg-2 mt-10 text-[14px]">
          {t.privacidade.texto}{" "}
          <Link href={t.privacidade.href} className="text-verde underline">
            {t.privacidade.label}
          </Link>
          .
        </p>
      </div>
    </Section>
  );
}
