import { novoId } from "@/lib/ai-score/navegador";
import { BUCKET, TAMANHO_MAXIMO, caminhoArquivo } from "@/lib/materiais";
import { pedir, type Sessao } from "@/lib/supabase-admin";

/**
 * Materiais no /admin: lista, publicação, edição e exclusão, com o token do admin (o RLS barra quem não está em
 * public.admins). O PDF vai para o bucket "materiais" do Storage num caminho novo a cada envio ("<uuid>/<palavra>.pdf"),
 * então trocar o arquivo nunca deixa uma versão antiga em cache no mesmo endereço.
 */

export interface MaterialLinha {
  id: string;
  criado_em: string;
  atualizado_em: string;
  palavra: string;
  titulo: string;
  descricao: string | null;
  arquivo: string;
  tamanho: number | null;
  publicado: boolean;
  acessos: number;
  downloads: number;
}

export interface CamposMaterial {
  palavra: string;
  titulo: string;
  descricao: string | null;
  publicado: boolean;
}

type Falha = "sessao" | "erro";

/** O que dá para saber do arquivo antes de enviar. O Storage confere de novo (só PDF, até 20 MB). */
export function conferirArquivo(arquivo: { type: string; name: string; size: number }): "ok" | "tipo" | "tamanho" {
  const pdf = arquivo.type === "application/pdf" || (!arquivo.type && /\.pdf$/i.test(arquivo.name));
  if (!pdf) return "tipo";
  return arquivo.size > 0 && arquivo.size <= TAMANHO_MAXIMO ? "ok" : "tamanho";
}

export async function listarMateriais(s: Sessao): Promise<MaterialLinha[] | Falha> {
  try {
    const r = await pedir(s, "materiais?select=*&order=criado_em.desc&limit=500");
    if (r === "sessao") return r;
    return r.ok ? ((await r.json()) as MaterialLinha[]) : "erro";
  } catch {
    return "erro";
  }
}

async function enviarArquivo(
  s: Sessao,
  palavra: string,
  arquivo: File,
): Promise<{ arquivo: string; tamanho: number } | Falha> {
  const caminho = caminhoArquivo(novoId(), palavra);
  try {
    const r = await pedir(
      s,
      `object/${BUCKET}/${caminho}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/pdf", "cache-control": "max-age=3600" },
        body: arquivo,
      },
      "storage/v1",
    );
    if (r === "sessao") return r;
    return r.ok ? { arquivo: caminho, tamanho: arquivo.size } : "erro";
  } catch {
    return "erro";
  }
}

/** Apaga o PDF do bucket. Falha aqui não desfaz nada: sobra um arquivo sem material, invisível no site. */
async function apagarArquivo(s: Sessao, caminho: string) {
  try {
    await pedir(s, `object/${BUCKET}/${caminho}`, { method: "DELETE" }, "storage/v1");
  } catch {
    // Sem rede: o arquivo fica no bucket, sem nenhum material apontando para ele.
  }
}

const repetida = async (r: Response) =>
  r.status === 409 || ((await r.json().catch(() => ({}))) as { code?: string }).code === "23505";

/** Envia o PDF e cria o material. "palavra": já existe um material com essa palavra-chave. */
export async function criarMaterial(
  s: Sessao,
  campos: CamposMaterial,
  arquivo: File,
): Promise<MaterialLinha | Falha | "palavra" | "envio"> {
  const enviado = await enviarArquivo(s, campos.palavra, arquivo);
  if (enviado === "sessao") return enviado;
  if (enviado === "erro") return "envio";
  try {
    const r = await pedir(s, "materiais", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...campos, ...enviado }),
    });
    if (r === "sessao") return r;
    if (r.ok) {
      const [linha] = (await r.json()) as MaterialLinha[];
      if (linha) return linha;
    }
    await apagarArquivo(s, enviado.arquivo);
    return r.ok ? "erro" : (await repetida(r)) ? "palavra" : "erro";
  } catch {
    await apagarArquivo(s, enviado.arquivo);
    return "erro";
  }
}

/**
 * Atualiza os campos e, se vier um arquivo, troca o PDF (o antigo é apagado depois que o material já aponta
 * para o novo). Devolve os campos gravados.
 */
export async function atualizarMaterial(
  s: Sessao,
  atual: MaterialLinha,
  campos: Partial<CamposMaterial>,
  arquivo?: File,
): Promise<Partial<MaterialLinha> | Falha | "palavra" | "envio"> {
  const enviado = arquivo ? await enviarArquivo(s, campos.palavra ?? atual.palavra, arquivo) : null;
  if (enviado === "sessao") return enviado;
  if (enviado === "erro") return "envio";
  const mudancas = { ...campos, ...enviado };
  try {
    const r = await pedir(s, `materiais?id=eq.${encodeURIComponent(atual.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(mudancas),
    });
    if (r === "sessao") return r;
    if (!r.ok) {
      if (enviado) await apagarArquivo(s, enviado.arquivo);
      return (await repetida(r)) ? "palavra" : "erro";
    }
    if (enviado) await apagarArquivo(s, atual.arquivo);
    return mudancas;
  } catch {
    if (enviado) await apagarArquivo(s, enviado.arquivo);
    return "erro";
  }
}

/** Exclui o material e, em seguida, o PDF. */
export async function excluirMaterial(s: Sessao, m: MaterialLinha): Promise<"ok" | Falha> {
  try {
    const r = await pedir(s, `materiais?id=eq.${encodeURIComponent(m.id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    if (r === "sessao") return r;
    if (!r.ok) return "erro";
    await apagarArquivo(s, m.arquivo);
    return "ok";
  } catch {
    return "erro";
  }
}
