import { useEffect, useState } from "react";

/**
 * Carrega um módulo sob demanda (um `import()` declarado fora do componente, para a referência não mudar) quando
 * `ativo` fica verdadeiro, e o devolve depois de carregado. Serve às partes grandes que só aparecem num clique
 * (uma aba, uma gaveta): o JavaScript delas não pesa no carregamento da página.
 */
export function useModulo<T>(carregar: () => Promise<T>, ativo: boolean): T | null {
  const [modulo, setModulo] = useState<T | null>(null);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    void carregar().then((m) => {
      if (vivo) setModulo(m);
    });
    return () => {
      vivo = false;
    };
  }, [carregar, ativo]);
  return modulo;
}
