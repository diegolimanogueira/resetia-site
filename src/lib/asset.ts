/** Prefixa um caminho de /public com o basePath (staging no GitHub Pages). Em produção devolve o caminho igual. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (caminho: string) => `${BASE_PATH}${caminho}`;
export const STAGING = process.env.NEXT_PUBLIC_STAGING === "true";
