import { METODO_ATUAL } from "../versoes";
import { metodo1, type Metodo } from "./metodo-1";

export type { Metodo };

/** Todos os métodos que já calcularam uma nota. Nunca remova um: links e registros antigos dependem dele. */
export const METODOS: Readonly<Record<string, Metodo>> = Object.freeze({ "1": metodo1 });

/** O método de uma versão, ou `undefined` quando a versão é desconhecida (link de uma versão futura, por exemplo). */
export const metodoDe = (versao: string): Metodo | undefined =>
  Object.hasOwn(METODOS, versao) ? METODOS[versao] : undefined;

/** O método que calcula as avaliações novas. */
export const metodoAtual: Metodo = METODOS[METODO_ATUAL];
