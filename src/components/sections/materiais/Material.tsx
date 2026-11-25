"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Botao, BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkSeta } from "@/components/ui/link-seta";
import { Section } from "@/components/ui/section";
import { materiais as t } from "@/content/materiais";
import {
  buscarMaterial,
  palavraDaUrl,
  registrarMaterial,
  tamanhoLegivel,
  urlArquivo,
  type Material as Dados,
} from "@/lib/materiais";

const topo =
  "border-line overflow-hidden border-b bg-[radial-gradient(circle_at_85%_30%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[50px] pb-[70px] md:pt-[80px] md:pb-[110px]";

const assinarEndereco = (notificar: () => void) => {
  window.addEventListener("popstate", notificar);
  return () => window.removeEventListener("popstate", notificar);
};
const lerPalavra = () => palavraDaUrl(window.location.pathname, window.location.search);

/** Um acesso por material a cada carregamento da página (o efeito roda duas vezes em desenvolvimento). */
const contados = new Set<string>();

type Carga = { palavra: string; tentativa: number; dado: Dados | "ausente" | "erro" };

/**
 * A isca de um post: título, descrição e o botão do PDF. A palavra-chave vem do endereço e o material, do
 * Supabase; no HTML estático só existe o estado "carregando". Sem palavra, ou com uma que não está publicada,
 * mostra o aviso com o caminho para a home.
 */
export function Material() {
  const palavra = useSyncExternalStore(assinarEndereco, lerPalavra, () => null);
  const [carga, setCarga] = useState<Carga | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!palavra) return;
    let vivo = true;
    buscarMaterial(palavra).then((dado) => {
      if (!vivo) return;
      setCarga({ palavra, tentativa, dado });
      if (typeof dado === "object" && !contados.has(palavra)) {
        contados.add(palavra);
        void registrarMaterial(palavra, "acesso");
      }
    });
    return () => {
      vivo = false;
    };
  }, [palavra, tentativa]);

  const dado =
    palavra === null
      ? null
      : palavra === ""
        ? "ausente"
        : carga && carga.palavra === palavra && carga.tentativa === tentativa
          ? carga.dado
          : null;

  return (
    <Section espaco="nenhum" className={topo}>
      <div className="container-site max-w-[820px]" aria-live="polite" aria-busy={dado === null}>
        <Eyebrow>{t.kicker}</Eyebrow>
        {dado === null ? (
          <h1 className="text-fg-2 text-[22px] font-semibold">{t.carregando}</h1>
        ) : dado === "ausente" ? (
          <>
            <h1 className="display-h2 mb-6">{t.ausente.titulo}</h1>
            <p className="text-fg-2 mb-8 text-[18px] leading-[1.6]">{t.ausente.texto}</p>
            <LinkSeta href="/" seta="→">
              {t.ausente.link}
            </LinkSeta>
          </>
        ) : dado === "erro" ? (
          <>
            <h1 className="display-h2 mb-6">{t.erro.titulo}</h1>
            <p className="text-fg-2 mb-8 text-[18px] leading-[1.6]">{t.erro.texto}</p>
            <BotaoAcao type="button" variante="secundario" onClick={() => setTentativa((n) => n + 1)}>
              {t.erro.botao}
            </BotaoAcao>
          </>
        ) : (
          <>
            <h1 className="display-h2 mb-6">{dado.titulo}</h1>
            {dado.descricao ? (
              <p className="text-fg-2 mb-9 max-w-[640px] text-[19px] leading-[1.7] whitespace-pre-line">
                {dado.descricao}
              </p>
            ) : null}
            <Botao
              href={urlArquivo(dado.arquivo)}
              origem="material-baixar"
              seta="↓"
              onClick={() => void registrarMaterial(dado.palavra, "download")}
            >
              {t.baixar}
            </Botao>
            <p className="text-fg-2 mt-4 text-[13px]">{t.formato(tamanhoLegivel(dado.tamanho))}</p>
          </>
        )}
      </div>
    </Section>
  );
}
