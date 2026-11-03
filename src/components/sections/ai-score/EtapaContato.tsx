"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, Marcador } from "@/components/ui/campo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { contato as c, formulario } from "@/content/ai-score-questionario";
import { registrarContato, type Situacao } from "@/lib/ai-score/captura";
import { codificar } from "@/lib/ai-score/codificar";
import { emailValido, LIMITES_CONTATO } from "@/lib/ai-score/contato";
import { novaChave, novoId, relatorio } from "@/lib/ai-score/navegador";
import type { RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";

/** Quanto esperar a resposta do servidor antes de abrir o resultado: a pessoa não fica presa a uma rede ruim. */
const ESPERA_MAXIMA_MS = 8000;

/**
 * Etapa 1 da captura: nome e e-mail abrem o resultado. Fica depois do questionário (a pessoa já investiu os
 * cinco minutos), com dois campos só. A função registra a avaliação e o lead (recalculando a nota) numa transação só;
 * a etapa 2 completa o mesmo lead com a chave que o navegador gerou aqui. O resultado abre de qualquer jeito, mas a
 * tela só diz que o contato foi registrado quando o servidor confirmou.
 */
export function EtapaContato({
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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [site, setSite] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [erros, setErros] = useState<{ nome?: string; email?: string }>({});
  const [enviando, setEnviando] = useState(false);

  async function abrir(e: FormEvent) {
    e.preventDefault();
    const encontrados = {
      nome: nome.trim().length < 2 ? formulario.erros.obrigatorio : undefined,
      email: emailValido(email) ? undefined : email.trim() ? formulario.erros.email : formulario.erros.obrigatorio,
    };
    setErros(encontrados);
    if (encontrados.nome) return document.getElementById("contato-nome")?.focus();
    if (encontrados.email) return document.getElementById("contato-email")?.focus();

    setEnviando(true);
    const id = respostas.id ?? novoId();
    const final = { ...respostas, id };
    const codigoFinal = respostas.id ? codigo : codificar(final);
    const leadId = novoId();
    const chave = novaChave();
    // Só registra com a armadilha vazia: robôs preenchem todos os campos. Para eles, abre sem registrar nada.
    let situacao: Situacao = "desligado";
    if (!site) {
      situacao = await Promise.race([
        registrarContato({
          avaliacaoId: id,
          leadId,
          chave,
          codigo: codigoFinal,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          marketing,
        }),
        new Promise<Situacao>((ok) => setTimeout(() => ok("pendente"), ESPERA_MAXIMA_MS)),
      ]);
      if (situacao === "aceito") track("ai_score_contato", { nivel: resultado.nivel ?? "parcial", marketing }, id);
    }
    relatorio.liberar(id, {
      leadId,
      chave,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      data: new Date().toLocaleDateString("pt-BR"),
      completo: false,
      contato: situacao,
    });
    if (!respostas.id) window.location.replace(`#${codigoFinal}`);
    aoLiberar();
  }

  return (
    <Section
      espaco="nenhum"
      className="border-line border-b bg-[radial-gradient(circle_at_85%_30%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[50px] pb-[70px] md:pt-[80px] md:pb-[100px]"
    >
      <div className="container-site grid gap-10 md:grid-cols-[1fr_1fr] md:gap-[80px]">
        <div>
          <Eyebrow>{c.kicker}</Eyebrow>
          <h1 className="display-h2 mb-6">
            <Linhas itens={c.titulo} />
          </h1>
          <p className="text-fg-2 mb-8 max-w-[480px] text-[18px] leading-[1.7]">{c.texto}</p>
          <p className="eyebrow text-fg-2 mb-4 text-[11px]">{c.incluido}</p>
          <ul className="grid gap-2.5">
            {c.itens.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-[1.5]">
                <span aria-hidden="true" className="text-verde">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <form
          noValidate
          onSubmit={abrir}
          className="border-verde/40 bg-painel relative grid content-start gap-5 self-start border p-[24px] md:p-[36px]"
        >
          <Campo
            id="contato-nome"
            rotulo={c.campos.nome}
            autoComplete="name"
            required
            maxLength={LIMITES_CONTATO.nome}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            erro={erros.nome}
          />
          <Campo
            id="contato-email"
            rotulo={c.campos.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITES_CONTATO.email}
            apoio={c.campos.emailApoio}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erros.email}
          />
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contato-site">{formulario.campos.armadilha}</label>
            <input
              id="contato-site"
              name="site"
              tabIndex={-1}
              autoComplete="off"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          </div>
          <Marcador rotulo={c.campos.marketing} checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <BotaoAcao type="submit" disabled={enviando} className="w-full">
            {enviando ? c.enviando : c.enviar}
          </BotaoAcao>
          <p className="text-fg-2 text-[13px] leading-[1.6]">
            {c.finalidade}{" "}
            <Link href={formulario.privacidade.href} className="text-fg underline underline-offset-2">
              {formulario.privacidade.label}
            </Link>
            .
          </p>
        </form>
      </div>
    </Section>
  );
}
