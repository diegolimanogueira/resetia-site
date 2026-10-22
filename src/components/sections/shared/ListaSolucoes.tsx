import Link from "next/link";
import { solucoes } from "@/content/solucoes";
import type { Solucao } from "@/content/types";

/**
 * Soluções em linhas de tabela, não cards. A linha inteira é o link; no hover acende o traço verde à esquerda.
 * `detalhada` troca a frase curta pelo "o que é" (página Soluções). Agnóstica ao tom.
 */
export function ListaSolucoes({ itens, detalhada = false }: { itens: Solucao[]; detalhada?: boolean }) {
  return (
    <ul className="border-line border-t">
      {itens.map((s) => (
        <li key={s.slug} className="border-line border-b">
          <Link
            href={`/solucoes/${s.slug}`}
            className="group relative grid gap-2 py-7 pl-6 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-baseline md:gap-8"
          >
            <span
              aria-hidden="true"
              className="group-hover:bg-verde absolute top-7 bottom-7 left-0 w-0.5 bg-transparent transition-colors duration-300"
            />
            <span aria-hidden="true" className="eyebrow text-fg-2">
              {s.num}
            </span>
            <h3 className="text-fg text-[22px] leading-[1.2] font-semibold tracking-[-0.02em]">{s.nome}</h3>
            <p className="text-fg-2 text-[16px] leading-[1.5]">{detalhada ? s.descricao : s.frase}</p>
            <span className="text-fg-2 group-hover:text-fg text-[15px] font-medium whitespace-nowrap transition-colors">
              {solucoes.explorar} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
