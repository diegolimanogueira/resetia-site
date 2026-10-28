"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, Marcador } from "@/components/ui/campo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { formulario as f } from "@/content/ai-score-questionario";
import { codificar } from "@/lib/ai-score/codificar";
import { emailPessoal, emailValido, normalizarWhatsapp } from "@/lib/ai-score/contato";
import { novoId, relatorio } from "@/lib/ai-score/navegador";
import { linhaAvaliacao, linhaLead } from "@/lib/ai-score/registro";
import type { RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { enviar } from "@/lib/supabase";

type Campos = { nome: string; email: string; empresa: string; whatsapp: string; site: string };
type Erros = Partial<Record<keyof Campos, string>>;

function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 2) e.nome = f.erros.obrigatorio;
  if (!emailValido(c.email)) e.email = c.email.trim() ? f.erros.email : f.erros.obrigatorio;
  if (!c.empresa.trim()) e.empresa = f.erros.obrigatorio;
  if (c.whatsapp.trim() && !normalizarWhatsapp(c.whatsapp)) e.whatsapp = f.erros.whatsapp;
  return e;
}

/**
 * Camada 2: nome, e-mail corporativo e empresa liberam o relatório completo na própria página (sem e-mail).
 * Grava a avaliação (de novo, idempotente) e o lead. Se o banco estiver fora, o lead fica na fila do navegador
 * e o relatório é liberado do mesmo jeito: a pessoa fez a parte dela.
 */
export function FormularioLead({
  respostas,
  resultado,
  codigo,
  aoLiberar,
}: {
  respostas: RespostasCompletas;
  resultado: Resultado;
  codigo: string;
  aoLiberar: () => void;
}) {
  const [c, setC] = useState<Campos>({ nome: "", email: "", empresa: "", whatsapp: "", site: "" });
  const [contato, setContato] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  const campo = (k: keyof Campos) => ({
    value: c[k],
    onChange: (e: { target: { value: string } }) => setC((atual) => ({ ...atual, [k]: e.target.value })),
  });

  async function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar(c);
    setErros(encontrados);
    const primeiro = (Object.keys(encontrados) as Array<keyof Campos>)[0];
    if (primeiro) return document.getElementById(`lead-${primeiro}`)?.focus();

    const id = respostas.id ?? novoId();
    const final = { ...respostas, id };
    const codigoFinal = respostas.id ? codigo : codificar(final);
    const dados = { nome: c.nome.trim(), empresa: c.empresa.trim() };
    setEnviando(true);

    // Só grava com a armadilha vazia: robôs preenchem todos os campos. Para eles, libera sem gravar nada.
    if (!c.site) {
      await enviar("avaliacoes", linhaAvaliacao(final, resultado, codigoFinal));
      await enviar(
        "leads",
        linhaLead(novoId(), id, {
          ...dados,
          email: c.email.trim().toLowerCase(),
          whatsapp: c.whatsapp.trim() ? normalizarWhatsapp(c.whatsapp) : null,
          emailPessoal: emailPessoal(c.email),
          pediuContato: contato,
          marketing,
        }),
      );
      track("ai_score_lead", { nivel: resultado.nivel ?? "parcial", contato, marketing });
    }

    relatorio.liberar(id, { ...dados, data: new Date().toLocaleDateString("pt-BR") });
    if (!respostas.id) window.location.replace(`#${codigoFinal}`);
    aoLiberar();
  }

  return (
    <div className="container-site grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-[80px]">
      <div>
        <Eyebrow>{f.kicker}</Eyebrow>
        <h2 className="display-h2 mb-6">
          <Linhas itens={f.titulo} />
        </h2>
        <p className="text-fg-2 max-w-[480px] text-[18px] leading-[1.7]">{f.texto}</p>
      </div>
      <form
        noValidate
        onSubmit={enviarFormulario}
        className="border-line bg-painel relative border p-[24px] md:p-[36px]"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="lead-nome"
            rotulo={f.campos.nome}
            autoComplete="name"
            required
            erro={erros.nome}
            {...campo("nome")}
          />
          <Campo
            id="lead-empresa"
            rotulo={f.campos.empresa}
            autoComplete="organization"
            required
            erro={erros.empresa}
            {...campo("empresa")}
          />
          <Campo
            id="lead-email"
            rotulo={f.campos.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            erro={erros.email}
            {...campo("email")}
          />
          <Campo
            id="lead-whatsapp"
            rotulo={f.campos.whatsapp}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            apoio={f.campos.whatsappApoio}
            erro={erros.whatsapp}
            {...campo("whatsapp")}
          />
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="lead-site">{f.campos.armadilha}</label>
          <input id="lead-site" name="site" tabIndex={-1} autoComplete="off" {...campo("site")} />
        </div>
        <div className="mt-6 grid gap-3">
          <Marcador rotulo={f.campos.contato} checked={contato} onChange={(e) => setContato(e.target.checked)} />
          <Marcador rotulo={f.campos.marketing} checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        </div>
        <p className="text-fg-2 mt-6 text-[13px] leading-[1.6]">
          {f.finalidade}{" "}
          <Link href={f.privacidade.href} className="text-fg underline underline-offset-2">
            {f.privacidade.label}
          </Link>
          .
        </p>
        <BotaoAcao type="submit" disabled={enviando} className="mt-6 w-full sm:w-auto">
          {enviando ? f.enviando : f.enviar}
        </BotaoAcao>
      </form>
    </div>
  );
}
