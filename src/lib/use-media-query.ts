"use client";

import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

/** Media query reativa sem setState em efeito. No servidor retorna `padrao`. */
function useMediaQuery(query: string, padrao = false) {
  return useSyncExternalStore(
    (notificar) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notificar);
      return () => mq.removeEventListener("change", notificar);
    },
    () => window.matchMedia(query).matches,
    () => padrao,
  );
}

/** true só depois da hidratação (false no servidor e no primeiro render do cliente). */
export function useMontado() {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}

export const usePonteiroFino = () => useMediaQuery("(pointer: fine)");
