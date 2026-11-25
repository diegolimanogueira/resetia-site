/**
 * Textos da página de materiais (/materiais/?palavra): a isca de um post, um PDF por palavra-chave, publicada
 * pelo /admin. Título e descrição de cada material vêm do banco; aqui ficam só os rótulos fixos da página.
 * Fora do menu, do sitemap e do índice. O fecho da página usa o CTA padrão do site (`ctaPadrao`).
 */
export const materiais = {
  seo: {
    title: "Materiais | Reset IA",
    description: "Materiais da Reset IA para baixar.",
  },
  kicker: "Material Reset IA",
  carregando: "Carregando o material…",
  baixar: "Baixar o PDF",
  /** Linha discreta sob o botão: formato e tamanho do arquivo. */
  formato: (tamanho: string | null) => (tamanho ? `PDF · ${tamanho}` : "PDF"),
  ausente: {
    titulo: "Material não encontrado",
    texto: "O link pode estar incompleto ou o material saiu do ar.",
    link: "Ir para o site da Reset IA",
  },
  erro: {
    titulo: "Não foi possível carregar o material",
    texto: "Confira a conexão e tente de novo.",
    botao: "Tentar de novo",
  },
} as const;
