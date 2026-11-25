import { site } from "@/content/site";
import { cabecalhos, chamar, supabase } from "@/lib/supabase";

/**
 * Materiais para baixar: um PDF por palavra-chave, publicado pelo /admin (tabela public.materiais e bucket
 * "materiais" do Storage). O site é estático, então a página é uma só (/materiais/) e a palavra vem do endereço:
 * depois da interrogação (/materiais/?brabo), que funciona em qualquer hospedagem, ou no caminho (/materiais/brabo),
 * que depende de a hospedagem devolver a página de materiais para caminhos que não existem.
 */

/** O que a página pública lê de um material publicado. */
export interface Material {
  palavra: string;
  titulo: string;
  descricao: string | null;
  /** Caminho dentro do bucket. */
  arquivo: string;
  tamanho: number | null;
}

export const BUCKET = "materiais";
export const TAMANHO_MAXIMO = 20 * 1024 * 1024;
export const PALAVRA_MAXIMA = 40;
const PALAVRA = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Palavra-chave no formato do banco: minúsculas, sem acento, só letras, números e hífen. */
export function normalizarPalavra(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PALAVRA_MAXIMA)
    .replace(/-+$/, "");
}

export const palavraValida = (palavra: string) => palavra.length >= 2 && PALAVRA.test(palavra);

const comoPalavra = (texto: string | null | undefined) => {
  let cru = texto ?? "";
  try {
    cru = decodeURIComponent(cru);
  } catch {
    // Endereço mal codificado: segue com o texto como veio.
  }
  const palavra = normalizarPalavra(cru);
  return palavraValida(palavra) ? palavra : "";
};

/**
 * A palavra-chave do endereço, ou "" se não houver. Aceita /materiais/brabo, /materiais/?brabo e
 * /materiais/?m=brabo, com ou sem os parâmetros que redes sociais penduram no link (fbclid, utm_…).
 */
export function palavraDaUrl(caminho: string, busca: string): string {
  const partes = caminho.split("/").filter(Boolean);
  const depois = partes[partes.lastIndexOf("materiais") + 1];
  if (partes.includes("materiais") && depois && depois !== "index.html") return comoPalavra(depois);
  const q = new URLSearchParams(busca);
  if (q.get("m")) return comoPalavra(q.get("m"));
  // "?brabo": uma chave sem valor. Parâmetros de rastreio sempre trazem valor.
  for (const [chave, valor] of q) if (valor === "") return comoPalavra(chave);
  return "";
}

/** O link que vai para o post, o direct ou o ManyChat. */
export const linkMaterial = (palavra: string) => `${site.dominio}/materiais/?${palavra}`;

/** Endereço público do PDF (o bucket é público; o caminho leva um UUID). */
export const urlArquivo = (arquivo: string) => `${supabase.url}/storage/v1/object/public/${BUCKET}/${arquivo}`;

export const caminhoArquivo = (id: string, palavra: string) => `${id}/${palavra}.pdf`;

/** "340 KB", "2,3 MB". */
export function tamanhoLegivel(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Material publicado com esta palavra. "ausente" também quando o Supabase não está configurado no build. */
export async function buscarMaterial(palavra: string): Promise<Material | "ausente" | "erro"> {
  if (!supabase.ativo || !palavraValida(palavra)) return "ausente";
  try {
    const r = await fetch(
      `${supabase.url}/rest/v1/materiais?palavra=eq.${encodeURIComponent(palavra)}&select=palavra,titulo,descricao,arquivo,tamanho&limit=1`,
      { headers: cabecalhos() },
    );
    if (!r.ok) return "erro";
    const [m] = (await r.json()) as Array<Partial<Material>>;
    if (!m) return "ausente";
    if (typeof m.palavra !== "string" || typeof m.titulo !== "string" || typeof m.arquivo !== "string") return "erro";
    return {
      palavra: m.palavra,
      titulo: m.titulo,
      descricao: typeof m.descricao === "string" && m.descricao.trim() ? m.descricao : null,
      arquivo: m.arquivo,
      tamanho: typeof m.tamanho === "number" ? m.tamanho : null,
    };
  } catch {
    return "erro";
  }
}

/** Soma um acesso ou um download ao material (função do banco; não devolve nem expõe os contadores). */
export const registrarMaterial = (palavra: string, evento: "acesso" | "download") =>
  chamar("registrar_material", { p_palavra: palavra, p_evento: evento });
