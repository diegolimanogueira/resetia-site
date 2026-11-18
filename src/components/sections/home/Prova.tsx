import { Imagem } from "@/components/ui/imagem";
import { clientes } from "@/content/clientes";

/** Logos na faixa: 80% do tamanho de referência, para a faixa não competir com o hero. */
const ESCALA = 0.8;

/**
 * Quantas vezes a lista se repete na esteira. Cada grupo anda a própria largura e recomeça, então a soma dos
 * outros grupos precisa cobrir a janela: com cinco logos, quatro grupos cobrem até o container mais largo.
 */
const GRUPOS = 4;

/**
 * Faixa de credibilidade logo abaixo do hero: logos dos clientes em cinza, para o verde seguir como único acento,
 * passando em esteira (CSS em globals.css). Só o primeiro grupo é lido por leitores de tela; com movimento
 * reduzido, é o único que aparece, parado.
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
        <div className="esteira-janela w-full min-w-0 md:flex-1">
          <div className="esteira">
            {Array.from({ length: GRUPOS }, (_, grupo) => (
              <ul
                key={grupo}
                aria-hidden={grupo > 0 ? true : undefined}
                className={grupo > 0 ? "esteira-grupo esteira-copia" : "esteira-grupo"}
              >
                {clientes.lista.map((c) => (
                  <li key={c.id}>
                    <Imagem
                      base={c.logo.base}
                      alt={grupo === 0 ? c.nome : ""}
                      width={Math.round(c.logo.largura * ESCALA)}
                      height={Math.round(c.logo.altura * ESCALA)}
                      formatos={[]}
                      className="opacity-70 grayscale"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
