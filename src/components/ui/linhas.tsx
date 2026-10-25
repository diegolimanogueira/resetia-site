import { Fragment, type ReactNode } from "react";

/** Trechos entre asteriscos viram <em> (verde nos títulos). Ex.: "Uma visão *360°.*". */
function comDestaque(texto: string): ReactNode {
  return texto.split(/\*(.+?)\*/).map((parte, i) => (i % 2 ? <em key={i}>{parte}</em> : parte));
}

/** Tira as marcas de destaque: o texto que o leitor de tela e os testes enxergam. */
export const semMarcas = (texto: string) => texto.replace(/\*/g, "");

/**
 * Título em linhas (como no reset360). O espaço antes do <br> mantém as palavras separadas
 * no nome acessível e no textContent.
 */
export function Linhas({ itens }: { itens: readonly string[] }) {
  return itens.map((linha, i) => (
    <Fragment key={linha}>
      {i > 0 ? (
        <>
          {" "}
          <br />
        </>
      ) : null}
      {comDestaque(linha)}
    </Fragment>
  ));
}
