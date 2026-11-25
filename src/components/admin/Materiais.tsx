"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BotaoAcao } from "@/components/ui/botao";
import { Campo, Marcador, classesEntrada } from "@/components/ui/campo";
import { admin } from "@/content/admin";
import { PALAVRA_MAXIMA, linkMaterial, normalizarPalavra, palavraValida, tamanhoLegivel } from "@/lib/materiais";
import {
  atualizarMaterial,
  conferirArquivo,
  criarMaterial,
  excluirMaterial,
  listarMateriais,
  type MaterialLinha,
} from "@/lib/materiais-admin";
import { eAdmin, lerSessao, sessao } from "@/lib/supabase-admin";
import { cn } from "@/lib/utils";

const t = admin.materiais;
const acaoLinha = "hover:text-verde cursor-pointer text-[13px] font-semibold underline-offset-4 hover:underline";
const semProtocolo = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

type Erros = Partial<Record<"palavra" | "titulo" | "arquivo" | "geral", string>>;

/**
 * Formulário de um material: novo (com o PDF obrigatório) ou a edição de um existente (o PDF só muda se vier outro).
 * O pai troca a `key` para limpar os campos depois de salvar.
 */
function Formulario({
  atual,
  aoCriar,
  aoAtualizar,
  aoCancelar,
}: {
  atual: MaterialLinha | null;
  aoCriar: (linha: MaterialLinha) => void;
  aoAtualizar: (id: string, campos: Partial<MaterialLinha>) => void;
  aoCancelar: () => void;
}) {
  const [palavra, setPalavra] = useState(atual?.palavra ?? "");
  const [titulo, setTitulo] = useState(atual?.titulo ?? "");
  const [descricao, setDescricao] = useState(atual?.descricao ?? "");
  const [publicado, setPublicado] = useState(atual?.publicado ?? true);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const pronta = normalizarPalavra(palavra);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Erros = {};
    if (!palavraValida(pronta)) novos.palavra = t.erros.palavra;
    if (titulo.trim().length < 2) novos.titulo = t.erros.titulo;
    if (!arquivo && !atual) novos.arquivo = t.erros.arquivoFalta;
    if (arquivo) {
      const conferido = conferirArquivo(arquivo);
      if (conferido === "tipo") novos.arquivo = t.erros.arquivoTipo;
      if (conferido === "tamanho") novos.arquivo = t.erros.arquivoTamanho;
    }
    setErros(novos);
    const s = lerSessao(sessao.ler());
    if (Object.keys(novos).length || !s) return;

    const campos = { palavra: pronta, titulo: titulo.trim(), descricao: descricao.trim() || null, publicado };
    setSalvando(true);
    const r = atual
      ? await atualizarMaterial(s, atual, campos, arquivo ?? undefined)
      : await criarMaterial(s, campos, arquivo!);
    setSalvando(false);
    if (r === "sessao") return;
    if (r === "palavra") return setErros({ palavra: t.erros.palavraRepetida });
    if (r === "envio") return setErros({ arquivo: t.erros.envio });
    if (r === "erro") return setErros({ geral: t.erros.salvar });
    if (atual) aoAtualizar(atual.id, r);
    else aoCriar(r as MaterialLinha);
  }

  return (
    <form
      id="material-formulario"
      onSubmit={enviar}
      noValidate
      className="border-line bg-painel mb-10 grid scroll-mt-[110px] gap-5 border p-[26px]"
    >
      <h2 className="text-[20px] font-bold tracking-[-0.02em]">{atual ? t.form.editar(atual.palavra) : t.form.novo}</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Campo
          id="material-palavra"
          rotulo={t.form.palavra}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={PALAVRA_MAXIMA}
          value={palavra}
          onChange={(e) => setPalavra(e.target.value)}
          onBlur={() => setPalavra(pronta)}
          apoio={
            palavraValida(pronta) ? t.form.palavraApoio(semProtocolo(linkMaterial(pronta))) : t.form.palavraApoioVazio
          }
          erro={erros.palavra}
        />
        <Campo
          id="material-titulo"
          rotulo={t.form.titulo}
          maxLength={120}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          erro={erros.titulo}
        />
      </div>
      <div>
        <label htmlFor="material-descricao" className="mb-2 block text-[14px] font-semibold">
          {t.form.descricao}
        </label>
        <textarea
          id="material-descricao"
          rows={3}
          maxLength={600}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className={classesEntrada}
        />
      </div>
      <Campo
        id="material-arquivo"
        rotulo={t.form.arquivo}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
        apoio={atual ? t.form.arquivoApoioEdicao : t.form.arquivoApoio}
        erro={erros.arquivo}
      />
      <Marcador rotulo={t.form.publicado} checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
      <p role="alert" className="min-h-[1.2em] text-[14px] font-semibold">
        {erros.geral}
      </p>
      <div className="flex flex-wrap gap-3">
        <BotaoAcao type="submit" disabled={salvando}>
          {salvando ? t.form.salvando : atual ? t.form.salvarEdicao : publicado ? t.form.salvar : t.form.salvarRascunho}
        </BotaoAcao>
        {atual ? (
          <BotaoAcao type="button" variante="secundario" onClick={aoCancelar} disabled={salvando}>
            {t.form.cancelar}
          </BotaoAcao>
        ) : null}
      </div>
    </form>
  );
}

/** Área Materiais do /admin: publica um PDF por palavra-chave e mostra o link, os acessos e os downloads. */
export function Materiais({ email }: { email: string }) {
  const [dados, setDados] = useState<MaterialLinha[] | null>(null);
  const [falha, setFalha] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [formulario, setFormulario] = useState(0);
  const [editando, setEditando] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  // Carrega a cada login e a cada "Atualizar". A sessão é lida na hora (o token pode ter sido renovado).
  useEffect(() => {
    let vivo = true;
    const s = lerSessao(sessao.ler());
    if (!s) return;
    Promise.all([eAdmin(s), listarMateriais(s)]).then(([ok, r]) => {
      if (!vivo || r === "sessao") return;
      if (ok === false) return setFalha(admin.semPermissao);
      if (r === "erro") return setFalha(t.erroCarga);
      setFalha(null);
      setDados(r);
    });
    return () => {
      vivo = false;
    };
  }, [email, versao]);

  const atual = dados?.find((m) => m.id === editando) ?? null;
  const aplicar = (id: string, campos: Partial<MaterialLinha>) =>
    setDados((lista) => (lista ?? []).map((m) => (m.id === id ? { ...m, ...campos } : m)));

  function concluir(mensagem: string) {
    setFalha(null);
    setAviso(mensagem);
    setEditando(null);
    setFormulario((n) => n + 1);
  }

  async function alternar(m: MaterialLinha) {
    const s = lerSessao(sessao.ler());
    if (!s) return;
    const r = await atualizarMaterial(s, m, { publicado: !m.publicado });
    if (r === "sessao") return;
    if (typeof r === "string") return setFalha(t.erros.salvar);
    setFalha(null);
    aplicar(m.id, r);
  }

  async function excluir(m: MaterialLinha) {
    if (confirmando !== m.id) return setConfirmando(m.id);
    const s = lerSessao(sessao.ler());
    if (!s) return;
    setConfirmando(null);
    const r = await excluirMaterial(s, m);
    if (r === "sessao") return;
    if (r === "erro") return setFalha(t.erros.excluir);
    setDados((lista) => (lista ?? []).filter((x) => x.id !== m.id));
    concluir(t.avisos.excluido);
  }

  async function copiar(m: MaterialLinha) {
    try {
      await navigator.clipboard.writeText(linkMaterial(m.palavra));
      setCopiado(m.id);
    } catch {
      // Sem permissão de área de transferência: o link está escrito na linha, dá para selecionar.
    }
  }

  return (
    <section className="gutter text-fg pt-[40px] pb-[90px] md:pt-[60px]">
      <div className="container-site">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-verde mb-3">{t.kicker}</p>
            <h1 className="text-[40px] leading-none font-bold tracking-[-0.03em]">{t.titulo}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-fg-2 text-[13px]">{email}</span>
            <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={() => setVersao((n) => n + 1)}>
              {admin.atualizar}
            </BotaoAcao>
            <BotaoAcao type="button" tamanho="sm" onClick={() => sessao.gravar(null)}>
              {admin.sair}
            </BotaoAcao>
          </div>
        </div>

        {falha ? (
          <p role="alert" className="border-fg mb-6 border-l-2 pl-3 font-semibold">
            {falha}
          </p>
        ) : null}
        <p role="status" className={cn("text-verde text-[14px] font-semibold", aviso && "mb-6")}>
          {aviso}
        </p>

        <Formulario
          key={`${editando ?? "novo"}-${formulario}`}
          atual={atual}
          aoCriar={(linha) => {
            setDados((lista) => [linha, ...(lista ?? [])]);
            concluir(t.avisos.criado);
          }}
          aoAtualizar={(id, campos) => {
            aplicar(id, campos);
            concluir(t.avisos.atualizado);
          }}
          aoCancelar={() => setEditando(null)}
        />

        {!dados && !falha ? (
          <p className="border-line border p-6 text-[14px]" aria-live="polite">
            {admin.carregando}
          </p>
        ) : !dados?.length ? (
          <p className="border-line border p-6 text-[14px]">{t.vazio}</p>
        ) : (
          <div className="border-line overflow-x-auto border">
            <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
              <thead className="text-fg-2 text-[12px]">
                <tr className="border-line border-b">
                  {Object.values(t.colunas).map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.map((m) => (
                  <tr key={m.id} data-material={m.palavra} className="border-line border-b align-top">
                    <td className="px-4 py-3">
                      <span className="font-semibold">{m.titulo}</span>
                      <span className="text-fg-2 block text-[12px]">
                        {[m.palavra, tamanhoLegivel(m.tamanho)].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-[13px] break-all">{semProtocolo(linkMaterial(m.palavra))}</span>
                      <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                        <button
                          type="button"
                          onClick={() => copiar(m)}
                          aria-label={t.de(copiado === m.id ? t.copiado : t.copiar, m.palavra)}
                          className={acaoLinha}
                        >
                          {copiado === m.id ? t.copiado : t.copiar}
                        </button>
                        {m.publicado ? (
                          <Link
                            href={`/materiais/?${m.palavra}`}
                            target="_blank"
                            aria-label={t.de(t.abrir, m.palavra)}
                            className={acaoLinha}
                          >
                            {t.abrir}
                          </Link>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums">{m.acessos}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{m.downloads}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.publicado ? t.publicado : t.rascunho}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-x-4 gap-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAviso(null);
                            setEditando(m.id);
                            document.getElementById("material-formulario")?.scrollIntoView({ block: "start" });
                          }}
                          aria-label={t.de(t.editar, m.palavra)}
                          className={acaoLinha}
                        >
                          {t.editar}
                        </button>
                        <button
                          type="button"
                          onClick={() => alternar(m)}
                          aria-label={t.de(m.publicado ? t.despublicar : t.publicar, m.palavra)}
                          className={acaoLinha}
                        >
                          {m.publicado ? t.despublicar : t.publicar}
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(m)}
                          onBlur={() => setConfirmando(null)}
                          aria-label={t.de(confirmando === m.id ? t.confirmarExclusao : t.excluir, m.palavra)}
                          className={acaoLinha}
                        >
                          {confirmando === m.id ? t.confirmarExclusao : t.excluir}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
