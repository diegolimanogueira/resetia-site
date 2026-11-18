import { Imagem } from "@/components/ui/imagem";
import { clientes } from "@/content/clientes";

/** Logos na faixa: 80% do tamanho dos cards, para a faixa não competir com o hero. */
const ESCALA = 0.8;

/**
 * Faixa de credibilidade logo abaixo do hero: logos dos clientes em cinza, para o verde seguir como único acento.
 * O que cada cliente fez está na seção Clientes, mais abaixo.
 */
export function Prova() {
  return (
    <section
      data-tom="escuro"
      aria-label={clientes.faixa}
      className="gutter border-line text-fg border-y bg-(--bg) py-7"
    >
      <div className="container-site flex flex-col items-center gap-x-12 gap-y-6 md:flex-row">
        <p className="eyebrow text-fg-2 shrink-0 text-[11px]">{clientes.faixa}</p>
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-6 md:justify-between">
          {clientes.lista.map((c) => (
            <li key={c.id}>
              <Imagem
                base={c.logo.base}
                alt={c.nome}
                width={Math.round(c.logo.largura * ESCALA)}
                height={Math.round(c.logo.altura * ESCALA)}
                formatos={[]}
                className="opacity-70 grayscale"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
