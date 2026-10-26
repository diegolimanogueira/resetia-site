"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redireciona no cliente (export estático não tem redirect de servidor). A query da rota antiga
 * (ex.: ?area=vendas) segue para o destino. A página mantém um link visível como fallback.
 */
export function Redirecionar({ para }: { para: string }) {
  const router = useRouter();
  useEffect(() => {
    const destino = new URL(para, window.location.origin);
    if (!destino.search) destino.search = window.location.search;
    router.replace(`${destino.pathname}${destino.search}${destino.hash}`);
  }, [router, para]);
  return null;
}
