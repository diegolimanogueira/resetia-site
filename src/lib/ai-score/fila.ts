import { filaDeCaptura } from "./navegador";

/**
 * Fila de contingência da captura. A fila principal é o servidor: depois que ele aceita o contato, o e-mail e as dicas
 * são tarefas com estado próprio e não dependem de a pessoa voltar. Esta fila só cobre o trecho do navegador até o
 * servidor aceitar: o item é gravado ANTES da tentativa (se a aba fechar no meio, ele sobrevive), todo pedido é
 * idempotente no servidor (reenviar é seguro), e o item sai ao ser aceito ou recusado de vez.
 *
 * Honestidade: uma aplicação fechada antes da transmissão não permite garantir que o servidor recebeu o contato.
 * Os dados do item (inclusive nome e e-mail) ficam neste navegador até o servidor aceitar, a recusa definitiva ou
 * 7 dias, o que vier primeiro.
 */

export type TipoItem = "concluir" | "registrar" | "completar" | "aprofundar";
export type Veredito = "aceito" | "tentar-de-novo" | "recusado";

export interface Item {
  id: string;
  tipo: TipoItem;
  avaliacaoId: string;
  leadId?: string;
  /** Para `aprofundar`: só a revisão mais alta importa. */
  revisao?: number;
  /** O corpo exato do pedido à função (já com a ação). */
  corpo: Record<string, unknown>;
  criadoEm: number;
  tentativas: number;
  proximaEm: number;
}

export const VALIDADE_MS = 7 * 24 * 3600 * 1000;
const MAXIMO_DE_ITENS = 50;

/** Espera até a próxima tentativa: 5 s, 15 s, 45 s… até 1 hora, com um pouco de aleatoriedade. */
export function esperaAte(tentativas: number, aleatorio: () => number = Math.random) {
  const base = Math.min(3_600_000, 5_000 * 3 ** Math.max(tentativas - 1, 0));
  return Math.round(base * (0.8 + aleatorio() * 0.4));
}

const lerFila = () => filaDeCaptura.ler<Item>().filter((i) => i && typeof i.id === "string");

/** Um pedido só existe uma vez por tipo e lead (ou avaliação): o mais novo substitui o antigo. */
const mesmoPedido = (a: Item, b: Item) =>
  a.tipo === b.tipo && (a.leadId ?? a.avaliacaoId) === (b.leadId ?? b.avaliacaoId);

export function enfileirar(novo: Omit<Item, "tentativas" | "proximaEm">, agora = Date.now()) {
  const item: Item = { ...novo, tentativas: 0, proximaEm: agora };
  const fila = lerFila();
  const igual = fila.find((i) => mesmoPedido(i, item));
  // O aprofundamento mais novo (revisão maior) vence; um mais antigo que chega depois não o substitui.
  if (igual && item.tipo === "aprofundar" && (igual.revisao ?? 0) > (item.revisao ?? 0)) return igual;
  const resto = fila.filter((i) => !mesmoPedido(i, item));
  filaDeCaptura.gravar([...resto, item].slice(-MAXIMO_DE_ITENS));
  return item;
}

/**
 * Registra o resultado de uma tentativa. Relê a fila na hora de gravar: o que entrou enquanto o pedido estava no ar
 * (outra aba, outro clique) continua lá, em vez de ser sobrescrito por uma cópia antiga da fila.
 */
export function registrarVeredito(item: Item, veredito: Veredito, agora = Date.now()) {
  const fila = lerFila();
  if (veredito === "tentar-de-novo") {
    const tentativas = item.tentativas + 1;
    filaDeCaptura.gravar(
      fila.map((i) => (i.id === item.id ? { ...i, tentativas, proximaEm: agora + esperaAte(tentativas) } : i)),
    );
  } else filaDeCaptura.gravar(fila.filter((i) => i.id !== item.id));
}

/** Itens vencidos há mais de 7 dias saem da fila: contam como recusados (nunca chegaram ao servidor). */
export function expirados(agora = Date.now()) {
  const todos = lerFila();
  const vencidos = todos.filter((i) => agora - i.criadoEm > VALIDADE_MS);
  if (vencidos.length) filaDeCaptura.gravar(todos.filter((i) => agora - i.criadoEm <= VALIDADE_MS));
  return vencidos;
}

/** O próximo item que pode sair: já venceu a espera e não depende de um registro de contato ainda pendente. */
export function proximosPendentes(agora = Date.now(), emExecucao: ReadonlySet<string> = new Set()) {
  const fila = lerFila().sort((a, b) => a.criadoEm - b.criadoEm);
  const aguardandoRegistro = new Set(fila.filter((i) => i.tipo === "registrar" && i.leadId).map((i) => i.leadId));
  return fila.filter(
    (i) =>
      i.proximaEm <= agora &&
      !emExecucao.has(i.id) &&
      // Completar e aprofundar só depois de o registro do mesmo lead ser aceito (senão o servidor recusaria).
      !(i.tipo !== "registrar" && i.tipo !== "concluir" && i.leadId && aguardandoRegistro.has(i.leadId)),
  );
}

/** Quando a fila volta a ter algo a tentar, em milissegundos a partir de agora; `null` se não há nada pendente. */
export function proximaTentativaEm(agora = Date.now()) {
  const fila = lerFila();
  return fila.length ? Math.max(0, Math.min(...fila.map((i) => i.proximaEm)) - agora) : null;
}

export const pendentesNaFila = () => lerFila().length;
