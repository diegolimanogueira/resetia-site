"use client";

import { useSyncExternalStore } from "react";

const naoAssinar = () => () => {};

/**
 * Marca no HTML que o React já assumiu a página (hidratação concluída). Sem isso, um clique logo depois do
 * carregamento cai num botão que ainda não tem comportamento. Os testes esperam por este sinal em vez de esperas fixas.
 */
export function SinalDePronto() {
  const pronto = useSyncExternalStore(
    naoAssinar,
    () => true,
    () => false,
  );
  return pronto ? <span hidden data-pronto="sim" /> : null;
}
