import { cn } from "@/lib/utils";

const posicoes = {
  "superior-direita": "right-[-10vw] top-[-20vh]",
  "superior-direita-alta": "right-[-10vw] top-[-30vh]",
  "inferior-esquerda": "left-[-10vw] bottom-[-30vh]",
};

/** Único gradiente permitido pelo manual: glow radial verde a 14–16%, no canto, fora da borda. */
export function Glow({ posicao, opacidade = 0.16 }: { posicao: keyof typeof posicoes; opacidade?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-[60vw] max-h-[900px] w-[60vw] max-w-[900px] rounded-full",
        posicoes[posicao],
      )}
      style={{ background: `radial-gradient(circle, rgba(0,230,118,${opacidade}) 0%, rgba(0,230,118,0) 65%)` }}
    />
  );
}
