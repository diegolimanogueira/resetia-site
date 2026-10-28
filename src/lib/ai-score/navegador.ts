/**
 * Estado do AI Score no navegador: rascunho do questionário, relatório liberado e a origem da visita.
 * Tudo protegido por try/catch (aba anônima, armazenamento bloqueado) e lido pelos componentes com
 * useSyncExternalStore, que assina `assinarArmazenamento` e `assinarHash`.
 */

const CHAVES = {
  rascunho: "resetia.ai-score.rascunho",
  relatorio: (id: string) => `resetia.ai-score.relatorio.${id}`,
  pendentes: "resetia.ai-score.pendentes",
  verComoAdmin: "resetia.ai-score.ver-como-admin",
  origem: "resetia.origem",
};

const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());

function ler(chave: string, onde: "local" | "sessao" = "local") {
  try {
    return (onde === "local" ? localStorage : sessionStorage).getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string | null, onde: "local" | "sessao" = "local") {
  try {
    const s = onde === "local" ? localStorage : sessionStorage;
    if (valor === null) s.removeItem(chave);
    else s.setItem(chave, valor);
  } catch {
    // Sem armazenamento, o questionário segue funcionando; só não dá para retomar.
  }
  avisar();
}

/** Para useSyncExternalStore: mudanças feitas nesta aba (avisar) e em outras abas (evento storage). */
export function assinarArmazenamento(notificar: () => void) {
  ouvintes.add(notificar);
  window.addEventListener("storage", notificar);
  return () => {
    ouvintes.delete(notificar);
    window.removeEventListener("storage", notificar);
  };
}

export function assinarHash(notificar: () => void) {
  window.addEventListener("hashchange", notificar);
  return () => window.removeEventListener("hashchange", notificar);
}

export const lerHash = () => window.location.hash.replace(/^#/, "");

/** Questionário em andamento: o texto codificado das respostas e a etapa em que a pessoa parou. */
export const rascunho = {
  ler: () => ler(CHAVES.rascunho),
  gravar: (codigo: string, passo: number) => gravar(CHAVES.rascunho, JSON.stringify({ codigo, passo })),
  apagar: () => gravar(CHAVES.rascunho, null),
};

export function lerRascunho(texto: string | null): { codigo: string; passo: number } | null {
  if (!texto) return null;
  try {
    const r = JSON.parse(texto) as { codigo?: unknown; passo?: unknown };
    return typeof r.codigo === "string" && typeof r.passo === "number" ? { codigo: r.codigo, passo: r.passo } : null;
  } catch {
    return null;
  }
}

/**
 * O que este navegador já liberou para uma avaliação: o resultado (etapa 1, nome e e-mail) e, com a empresa,
 * o relatório completo (etapa 2). `leadId` liga a etapa 2 ao lead criado na etapa 1.
 */
export interface Liberacao {
  leadId?: string;
  nome: string;
  email?: string;
  empresa?: string;
  data: string;
  completo: boolean;
}

export const relatorio = {
  ler: (id: string) => ler(CHAVES.relatorio(id)),
  liberar: (id: string, dados: Liberacao) => gravar(CHAVES.relatorio(id), JSON.stringify(dados)),
};

export function lerLiberacao(texto: string | null): Liberacao | null {
  if (!texto) return null;
  try {
    const l = JSON.parse(texto) as Partial<Liberacao>;
    if (typeof l.nome !== "string" || typeof l.data !== "string") return null;
    const empresa = typeof l.empresa === "string" ? l.empresa : undefined;
    return {
      leadId: typeof l.leadId === "string" ? l.leadId : undefined,
      nome: l.nome,
      email: typeof l.email === "string" ? l.email : undefined,
      empresa,
      data: l.data,
      // Liberações gravadas antes das duas etapas (28/10) já eram o relatório completo.
      completo: typeof l.completo === "boolean" ? l.completo : Boolean(empresa),
    };
  } catch {
    return null;
  }
}

/**
 * "Ver como o lead viu", no admin: marca por alguns minutos que este navegador pode abrir resultados sem as etapas
 * de captura (só leitura, nada é gravado). Quem forjar a marca só pula o formulário do próprio resultado.
 */
const VALIDADE_ADMIN = 5 * 60 * 1000;
export const verComoAdmin = {
  marcar: () => gravar(CHAVES.verComoAdmin, String(Date.now())),
  ler: () => ler(CHAVES.verComoAdmin),
};
export const marcaAdminValida = (texto: string | null, agora: number) =>
  texto !== null && agora - Number(texto) >= 0 && agora - Number(texto) < VALIDADE_ADMIN;

/** Gravações que falharam (rede, projeto pausado): reenviadas na próxima visita, na mesma ordem. */
export const pendentes = {
  ler: <T>(): T[] => {
    try {
      const v = JSON.parse(ler(CHAVES.pendentes) ?? "[]") as unknown;
      return Array.isArray(v) ? (v as T[]) : [];
    } catch {
      return [];
    }
  },
  gravar: (itens: unknown[]) => gravar(CHAVES.pendentes, itens.length ? JSON.stringify(itens) : null),
};

/** Origem da visita (UTM, referrer, página de entrada), gravada na primeira página da sessão. */
export interface Origem {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  entrada?: string;
}

export function registrarOrigem() {
  if (ler(CHAVES.origem, "sessao")) return;
  const q = new URLSearchParams(window.location.search);
  const origem: Origem = { entrada: window.location.pathname };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
    const v = q.get(k);
    if (v) origem[k] = v.slice(0, 120);
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin))
    origem.referrer = document.referrer.slice(0, 300);
  gravar(CHAVES.origem, JSON.stringify(origem), "sessao");
}

export function lerOrigem(): Origem {
  try {
    return JSON.parse(ler(CHAVES.origem, "sessao") ?? "{}") as Origem;
  } catch {
    return {};
  }
}

/** UUID v4 (o banco não devolve o id para o anônimo, então ele nasce aqui). */
export function novoId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
