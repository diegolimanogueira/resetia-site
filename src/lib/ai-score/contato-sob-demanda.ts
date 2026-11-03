/**
 * Um `import()` só, declarado fora de qualquer componente (a referência não muda): o `Resultado` carrega o contato
 * quando precisa dele, e a avaliação o pré-carrega enquanto a pessoa responde, para que o formulário já esteja no
 * navegador quando ela chegar ao resultado.
 */
export const carregarContato = () => import("@/components/sections/ai-score/Contato");
