"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redireciona no cliente (export estático não tem redirect de servidor). A página mantém um link visível como fallback. */
export function Redirecionar({ para }: { para: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(para);
  }, [router, para]);
  return null;
}
