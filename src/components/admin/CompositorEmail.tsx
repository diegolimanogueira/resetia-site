"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import { emailReset } from "@/content/ai-score-email";
import { lerSessao, sessao, enviarEmailReset, type LeadLinha } from "@/lib/supabase-admin";

const c = admin.compositor;

/**
 * Compositor do e-mail sobre a Reset IA: assunto e texto já preenchidos com o nome, a empresa e o AI Score,
 * editáveis antes do envio. Envia pela função ai-score; sem e-mail configurado, oferece o envio pelo cliente
 * de e-mail de quem está usando o admin.
 */
export function CompositorEmail({
  refDialogo,
  lead,
  indice,
  nivel,
  aoEnviar,
}: {
  refDialogo: RefObject<HTMLDialogElement | null>;
  lead: LeadLinha;
  indice: number | null;
  nivel: string | null;
  aoEnviar: () => void;
}) {
  const [assunto, setAssunto] = useState(() => emailReset.assunto(lead.empresa));
  const [corpo, setCorpo] = useState(() => emailReset.corpo({ nome: lead.nome, empresa: lead.empresa, indice, nivel }));
  const [estado, setEstado] = useState<"" | "enviando" | "enviado" | "nao-configurado" | "erro">("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const s = lerSessao(sessao.ler());
    if (!s) return;
    setEstado("enviando");
    const r = await enviarEmailReset(s, lead.id, assunto.trim(), corpo.trim());
    setEstado(r === "enviado" ? "enviado" : r === "nao-configurado" ? "nao-configurado" : "erro");
    aoEnviar();
  }

  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

  return (
    <dialog
      ref={refDialogo}
      aria-labelledby="compositor-titulo"
      className="border-line bg-carvao text-fg backdrop:bg-carvao/80 m-auto w-[min(680px,calc(100vw-24px))] border p-0"
    >
      <form onSubmit={enviar} className="grid gap-4 p-[22px] md:p-[30px]">
        <h2 id="compositor-titulo" className="text-[22px] font-bold">
          {c.titulo}
        </h2>
        <p className="text-[14px]">
          <span className="text-fg-2">{c.para}: </span>
          {lead.nome} &lt;{lead.email}&gt;
        </p>
        <div>
          <label htmlFor="compositor-assunto" className="mb-2 block text-[13px] font-semibold">
            {c.assunto}
          </label>
          <input
            id="compositor-assunto"
            value={assunto}
            maxLength={200}
            required
            onChange={(e) => setAssunto(e.target.value)}
            className={classesEntrada}
          />
        </div>
        <div>
          <label htmlFor="compositor-mensagem" className="mb-2 block text-[13px] font-semibold">
            {c.mensagem}
          </label>
          <textarea
            id="compositor-mensagem"
            rows={12}
            maxLength={6000}
            required
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            className={classesEntrada}
          />
        </div>
        <p aria-live="polite" className="text-[14px] font-semibold">
          {estado === "enviado" ? c.enviado : estado === "erro" ? c.erro : ""}
          {estado === "nao-configurado" ? (
            <>
              {c.naoConfigurado}{" "}
              <a href={mailto} className="text-verde underline underline-offset-2">
                {c.abrirEmail}
              </a>
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-3">
          <BotaoAcao type="submit" disabled={estado === "enviando" || estado === "enviado"}>
            {estado === "enviando" ? c.enviando : c.enviar}
          </BotaoAcao>
          <BotaoAcao type="button" variante="secundario" onClick={() => refDialogo.current?.close()}>
            {c.cancelar}
          </BotaoAcao>
        </div>
      </form>
    </dialog>
  );
}
