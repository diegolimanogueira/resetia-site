"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, Marcador } from "@/components/ui/campo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { formulario as f } from "@/content/ai-score-questionario";
import { completarContato, type Situacao } from "@/lib/ai-score/captura";
import { LIMITES_CONTATO, normalizarWhatsapp } from "@/lib/ai-score/contato";
import { atualizarLiberacao, relatorio, type Liberacao } from "@/lib/ai-score/navegador";
import type { Resultado } from "@/lib/ai-score/tipos";
import { track } from "@/lib/analytics";
import { enviarChamada, pedirEnvioDoRelatorio } from "@/lib/supabase";

/** Quanto esperar a resposta do servidor antes de liberar o relatório. */
const ESPERA_MAXIMA_MS = 8000;

/**
 * Etapa 2 (camada 2): a empresa, o WhatsApp opcional e os pedidos completam o lead criado na etapa 1 e liberam o
 * relatório completo. Com a chave do lead (leads novos), a função completa o lead, registra cada consentimento e
 * enfileira o e-mail; o estado do envio aparece depois, como o servidor informa. Lead criado antes desta versão
 * (sem chave) segue o caminho antigo. Se o servidor não responde, o pedido fica na fila e o relatório é liberado
 * do mesmo jeito, sem dizer que o contato foi registrado.
 */
export function FormularioLead({
  avaliacaoId,
  liberacao,
  resultado,
  aoLiberar,
}: {
  avaliacaoId: string;
  liberacao: Liberacao;
  resultado: Resultado;
  aoLiberar: () => void;
}) {
  const [empresa, setEmpresa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contato, setContato] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [erros, setErros] = useState<{ empresa?: string; whatsapp?: string }>({});
  const [enviando, setEnviando] = useState(false);

  async function liberar(e: FormEvent) {
    e.preventDefault();
    const encontrados = {
      empresa: empresa.trim() ? undefined : f.erros.obrigatorio,
      whatsapp: whatsapp.trim() && !normalizarWhatsapp(whatsapp) ? f.erros.whatsapp : undefined,
    };
    setErros(encontrados);
    if (encontrados.empresa) return document.getElementById("lead-empresa")?.focus();
    if (encontrados.whatsapp) return document.getElementById("lead-whatsapp")?.focus();

    setEnviando(true);
    const numero = whatsapp.trim() ? normalizarWhatsapp(whatsapp) : null;
    let situacao: Situacao = "desligado";
    if (liberacao.leadId && liberacao.chave) {
      situacao = await Promise.race([
        completarContato({
          avaliacaoId,
          leadId: liberacao.leadId,
          chave: liberacao.chave,
          empresa: empresa.trim(),
          whatsapp: numero,
          pediuContato: contato,
          marketing,
        }),
        new Promise<Situacao>((ok) => setTimeout(() => ok("pendente"), ESPERA_MAXIMA_MS)),
      ]);
    } else if (liberacao.leadId) {
      // Lead criado antes da chave: caminho antigo (função completar_lead e pedido do e-mail ao servidor).
      const antiga = await enviarChamada("completar_lead", {
        p_id: liberacao.leadId,
        p_empresa: empresa.trim(),
        p_whatsapp: numero,
        p_pediu_contato: contato,
        p_marketing: marketing,
      });
      void pedirEnvioDoRelatorio(avaliacaoId, liberacao.leadId, antiga === "tentar-de-novo").then((status) => {
        if (status === "enviado" || status === "ja-enviado") atualizarLiberacao(avaliacaoId, { emailEnviado: true });
      });
    }
    track("ai_score_lead", { nivel: resultado.nivel ?? "parcial", contato, marketing });
    // Mescla com o que já está guardado: o estado do contato e do e-mail pode ter mudado enquanto isso.
    if (relatorio.ler(avaliacaoId)) atualizarLiberacao(avaliacaoId, { empresa: empresa.trim(), completo: true });
    else relatorio.liberar(avaliacaoId, { ...liberacao, empresa: empresa.trim(), completo: true });
    if (situacao === "recusado") atualizarLiberacao(avaliacaoId, { contato: "recusado" });
    aoLiberar();
  }

  return (
    <div className="container-site grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-[80px]">
      <div>
        <Eyebrow>{f.kicker}</Eyebrow>
        <h2 className="display-h2 mb-6">
          <Linhas itens={f.titulo} />
        </h2>
        <p className="text-fg-2 mb-8 max-w-[480px] text-[18px] leading-[1.7]">{f.texto}</p>
        <p className="eyebrow text-fg-2 mb-4 text-[11px]">{f.incluido}</p>
        <ul className="grid gap-2.5">
          {f.itens.map((item) => (
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
        onSubmit={liberar}
        className="border-line bg-painel grid content-start gap-5 self-start border p-[24px] md:p-[36px]"
      >
        <Campo
          id="lead-empresa"
          rotulo={f.campos.empresa}
          autoComplete="organization"
          required
          maxLength={LIMITES_CONTATO.empresa}
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          erro={erros.empresa}
        />
        <Campo
          id="lead-whatsapp"
          rotulo={f.campos.whatsapp}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          apoio={f.campos.whatsappApoio}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          erro={erros.whatsapp}
        />
        <Marcador rotulo={f.campos.contato} checked={contato} onChange={(e) => setContato(e.target.checked)} />
        <Marcador rotulo={f.campos.marketing} checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <BotaoAcao type="submit" disabled={enviando} className="w-full sm:w-auto">
          {enviando ? f.enviando : f.enviar}
        </BotaoAcao>
        <p className="text-fg-2 text-[13px] leading-[1.6]">
          {f.finalidade}{" "}
          <Link href={f.privacidade.href} className="text-fg underline underline-offset-2">
            {f.privacidade.label}
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
