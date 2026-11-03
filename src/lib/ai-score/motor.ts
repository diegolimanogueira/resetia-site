import { useSyncExternalStore } from "react";

/**
 * Carrega o motor da devolutiva (cálculo das leituras, alertas, recomendações e plano, com todos os textos) sob
 * demanda. A página de resultado só traz o necessário para pedir nome e e-mail; o motor chega enquanto a pessoa
 * preenche, sem pesar no carregamento da página. O estado fica num store externo (`useSyncExternalStore`), sem
 * `setState` em efeito.
 */
type Motor = typeof import("./devolutiva");
interface Estado {
  motor: Motor | null;
  falhou: boolean;
}

const INICIAL: Estado = { motor: null, falhou: false };
let estado: Estado = INICIAL;
let pedido: Promise<void> | null = null;
const ouvintes = new Set<() => void>();

const mudar = (novo: Estado) => {
  estado = novo;
  ouvintes.forEach((f) => f());
};

function carregar(): Promise<void> {
  pedido ??= import("./devolutiva").then(
    (motor) => mudar({ motor, falhou: false }),
    () => {
      // Falha de rede: libera para uma nova tentativa e deixa a tela avisar.
      pedido = null;
      mudar({ motor: null, falhou: true });
    },
  );
  return pedido;
}

const assinarEPedir = (f: () => void) => {
  ouvintes.add(f);
  void carregar();
  return () => {
    ouvintes.delete(f);
  };
};
const naoAssinar = () => () => {};

/** `ativo` falso (a página de exemplo, que já recebe a devolutiva pronta) não baixa o motor. */
export function useMotor(ativo: boolean): Estado {
  return useSyncExternalStore(
    ativo ? assinarEPedir : naoAssinar,
    () => estado,
    () => INICIAL,
  );
}

/** Nova tentativa depois de uma falha de carregamento. */
export const tentarCarregarMotor = () => {
  mudar(INICIAL);
  void carregar();
};
