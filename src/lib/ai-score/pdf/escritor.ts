/**
 * Escritor de PDF mínimo, só com o que o relatório do AI Score precisa: texto em Helvetica (regular e negrito) com
 * quebra de linha e paginação, barras e linhas. PDF 1.4 com as fontes padrão, sem embutir fonte nem comprimir, e
 * o texto continua sendo texto (selecionável, pesquisável, lido por leitor de tela), nunca imagem.
 *
 * Codificação WinAnsi (CP-1252): cobre o português inteiro. Alguns caracteres fora dela têm substituto declarado
 * (→ vira ->); qualquer outro faz o PDF falhar com `GlifoSemMapa`, em vez de sair com um símbolo errado.
 */

export class GlifoSemMapa extends Error {
  constructor(readonly caractere: string) {
    super(`caractere sem mapa para o PDF: U+${caractere.codePointAt(0)!.toString(16).toUpperCase()} (${caractere})`);
  }
}

/** Substituições declaradas, para o que o texto do site usa e o WinAnsi não tem. */
const SUBSTITUICOES: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "✓": "-",
  "✔": "-",
  "≥": ">=",
  "≤": "<=",
  "≠": "!=",
  "−": "-",
  "‐": "-",
  "‑": "-",
  " ": " ",
  " ": " ",
  " ": " ",
  "​": "",
  "­": "",
  "\t": " ",
};

const CP1252: Record<string, number> = {
  "€": 0x80,
  "‚": 0x82,
  ƒ: 0x83,
  "„": 0x84,
  "…": 0x85,
  "†": 0x86,
  "‡": 0x87,
  ˆ: 0x88,
  "‰": 0x89,
  Š: 0x8a,
  "‹": 0x8b,
  Œ: 0x8c,
  Ž: 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "˜": 0x98,
  "™": 0x99,
  š: 0x9a,
  "›": 0x9b,
  œ: 0x9c,
  ž: 0x9e,
  Ÿ: 0x9f,
};

/** Texto → códigos WinAnsi. */
export function codificar(texto: string): number[] {
  const saida: number[] = [];
  for (const ch of texto) {
    const troca = SUBSTITUICOES[ch];
    if (troca !== undefined) {
      saida.push(...codificar(troca));
      continue;
    }
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff)) saida.push(cp);
    else if (CP1252[ch] !== undefined) saida.push(CP1252[ch]);
    else throw new GlifoSemMapa(ch);
  }
  return saida;
}

// Larguras (milésimos de em) da Helvetica e da Helvetica-Bold, dos códigos 32 a 126 ---------------------------------

const REGULAR =
  "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500 334 260 334 584"
    .split(" ")
    .map(Number);
const NEGRITO =
  "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 333 611 556 778 556 556 500 389 280 389 584"
    .split(" ")
    .map(Number);

/** Letra-base de cada acentuada de 0xC0 a 0xFF (os símbolos e as letras especiais ficam como estão). */
const BASE_LATIN1 = "AAAAAAÆCEEEEIIIIÐNOOOOO×ØUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷øuuuuyþy";
const ESPECIAL: Record<string, [number, number]> = {
  Æ: [1000, 1000],
  Ð: [722, 722],
  "×": [584, 584],
  Ø: [778, 778],
  Þ: [667, 667],
  ß: [611, 611],
  æ: [889, 889],
  ð: [556, 611],
  "÷": [584, 584],
  ø: [611, 611],
  þ: [556, 611],
};
/** Larguras de 0xA0 a 0xBF (regular, negrito). */
const SIMBOLOS_A0: Array<[number, number]> = [
  [278, 278],
  [333, 333],
  [556, 556],
  [556, 556],
  [556, 556],
  [556, 556],
  [260, 280],
  [556, 556],
  [333, 333],
  [737, 737],
  [370, 370],
  [556, 556],
  [584, 584],
  [333, 333],
  [737, 737],
  [333, 333],
  [400, 400],
  [584, 584],
  [333, 333],
  [333, 333],
  [333, 333],
  [556, 611],
  [537, 556],
  [278, 278],
  [333, 333],
  [333, 333],
  [365, 365],
  [556, 556],
  [834, 834],
  [834, 834],
  [834, 834],
  [611, 611],
];
const CP1252_LARGURAS: Record<number, [number, number]> = {
  0x80: [556, 556],
  0x85: [1000, 1000],
  0x91: [222, 278],
  0x92: [222, 278],
  0x93: [333, 500],
  0x94: [333, 500],
  0x95: [350, 350],
  0x96: [556, 556],
  0x97: [1000, 1000],
};

function larguraDoCodigo(codigo: number, negrito: boolean): number {
  const i = negrito ? 1 : 0;
  if (codigo >= 32 && codigo <= 126) return (negrito ? NEGRITO : REGULAR)[codigo - 32];
  if (codigo >= 0xa0 && codigo <= 0xbf) return SIMBOLOS_A0[codigo - 0xa0][i];
  if (codigo >= 0xc0 && codigo <= 0xff) {
    const base = BASE_LATIN1[codigo - 0xc0];
    return ESPECIAL[base]?.[i] ?? larguraDoCodigo(base.charCodeAt(0), negrito);
  }
  return CP1252_LARGURAS[codigo]?.[i] ?? 556;
}

/** Largura do texto, em pontos, no tamanho dado. */
export function medir(texto: string, tamanho: number, negrito = false): number {
  return (codificar(texto).reduce((soma, c) => soma + larguraDoCodigo(c, negrito), 0) * tamanho) / 1000;
}

// Documento -------------------------------------------------------------------------------------------------------

export type Cor = readonly [number, number, number];
export const CORES = {
  texto: [0.043, 0.059, 0.055] as Cor,
  apoio: [0.294, 0.322, 0.314] as Cor,
  linha: [0.89, 0.902, 0.894] as Cor,
  verde: [0.039, 0.478, 0.259] as Cor,
  verdeVivo: [0, 0.902, 0.463] as Cor,
};

export interface Estilo {
  tamanho?: number;
  negrito?: boolean;
  cor?: Cor;
  /** Recuo à esquerda, em pontos. */
  recuo?: number;
  /** Espaço antes e depois do bloco. */
  antes?: number;
  depois?: number;
  /** Entrelinha, como múltiplo do tamanho. */
  entrelinha?: number;
  /** Mantém este bloco junto do próximo (títulos). */
  mantemComOProximo?: boolean;
}

export const PAGINA = { largura: 595.28, altura: 841.89, margemX: 48, topo: 56, base: 64 };
const larguraUtil = PAGINA.largura - 2 * PAGINA.margemX;

const num = (n: number) => (Math.round(n * 100) / 100).toString();
const cor = (c: Cor) => `${num(c[0])} ${num(c[1])} ${num(c[2])}`;
/** Texto em WinAnsi como literal de PDF, só com ASCII: o que passa de 0x7E vai em escape octal. */
const literal = (codigos: number[]) =>
  `(${codigos
    .map((c) =>
      c === 0x28 || c === 0x29 || c === 0x5c
        ? `\\${String.fromCharCode(c)}`
        : c > 0x7e
          ? `\\${c.toString(8).padStart(3, "0")}`
          : String.fromCharCode(c),
    )
    .join("")})`;
/** Título do documento em UTF-16BE com marca de ordem, para os acentos sobreviverem no leitor. */
const utf16 = (texto: string) =>
  `<FEFF${[...texto].map((ch) => ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")).join("")}>`;

interface Pagina {
  ops: string[];
}

export interface OpcoesDoDocumento {
  titulo: string;
  autor: string;
  idioma: string;
  /** Rodapé de cada página (à esquerda) e a nota que o acompanha. */
  rodape: string;
  nota: string;
  /** Texto do contador: recebe a página e o total. */
  pagina: (n: number, total: number) => string;
}

export class Documento {
  private paginas: Pagina[] = [];
  /** Distância do topo da página até o cursor, em pontos. */
  private y = PAGINA.topo;

  constructor(private readonly opcoes: OpcoesDoDocumento) {
    this.nova();
  }

  private get atual() {
    return this.paginas[this.paginas.length - 1];
  }

  private nova() {
    this.paginas.push({ ops: [] });
    this.y = PAGINA.topo;
  }

  get numeroDePaginas() {
    return this.paginas.length;
  }

  /** Garante `altura` pontos livres; se não couber, abre outra página. */
  garantir(altura: number) {
    if (this.y + altura > PAGINA.altura - PAGINA.base && this.y > PAGINA.topo) this.nova();
  }

  espaco(pontos: number) {
    this.y += pontos;
  }

  quebraDePagina() {
    if (this.y > PAGINA.topo) this.nova();
  }

  private linhas(texto: string, tamanho: number, negrito: boolean, largura: number): string[] {
    const saida: string[] = [];
    for (const paragrafo of texto.split("\n")) {
      let linha = "";
      for (const palavra of paragrafo.split(" ").filter((p) => p !== "")) {
        const tentativa = linha ? `${linha} ${palavra}` : palavra;
        if (medir(tentativa, tamanho, negrito) <= largura) {
          linha = tentativa;
          continue;
        }
        if (linha) saida.push(linha);
        // Palavra maior que a linha: quebra por caractere.
        let resto = palavra;
        while (medir(resto, tamanho, negrito) > largura) {
          let corte = resto.length;
          while (corte > 1 && medir(resto.slice(0, corte), tamanho, negrito) > largura) corte--;
          saida.push(resto.slice(0, corte));
          resto = resto.slice(corte);
        }
        linha = resto;
      }
      saida.push(linha);
    }
    return saida;
  }

  /** Parágrafo com quebra de linha, sem deixar uma linha sozinha no fim ou no começo de uma página. */
  texto(conteudo: string, e: Estilo = {}) {
    const tamanho = e.tamanho ?? 10.5;
    const negrito = e.negrito ?? false;
    const recuo = e.recuo ?? 0;
    const passo = tamanho * (e.entrelinha ?? 1.45);
    const linhas = this.linhas(conteudo, tamanho, negrito, larguraUtil - recuo);
    this.y += e.antes ?? 0;
    // Títulos e rótulos andam com o que vem depois: reserva mais duas linhas, para não ficarem sozinhos no pé da página.
    this.garantir(passo * (e.mantemComOProximo ? linhas.length + 2 : Math.min(linhas.length, 3)));
    linhas.forEach((linha, i) => {
      // Uma linha órfã vai para a página seguinte junto da anterior.
      if (i > 0 && i === linhas.length - 1 && linhas.length > 2) this.garantir(passo * 2);
      else this.garantir(passo);
      if (linha) {
        const x = PAGINA.margemX + recuo;
        const base = PAGINA.altura - this.y - tamanho * 0.95;
        this.atual.ops.push(
          `BT /${negrito ? "F2" : "F1"} ${num(tamanho)} Tf ${cor(e.cor ?? CORES.texto)} rg ${num(x)} ${num(base)} Td ${literal(codificar(linha))} Tj ET`,
        );
      }
      this.y += passo;
    });
    this.y += e.depois ?? 4;
  }

  titulo(conteudo: string, nivel: 1 | 2 | 3 = 2) {
    const tamanho = nivel === 1 ? 22 : nivel === 2 ? 15 : 12;
    this.texto(conteudo, { tamanho, negrito: true, antes: nivel === 1 ? 0 : 16, depois: 6, mantemComOProximo: true });
  }

  /** Lista com marcador e recuo pendurado. */
  lista(itens: string[], e: Estilo = {}) {
    const tamanho = e.tamanho ?? 10.5;
    const recuo = (e.recuo ?? 0) + 12;
    for (const item of itens) {
      const linhas = this.linhas(item, tamanho, false, larguraUtil - recuo);
      const passo = tamanho * (e.entrelinha ?? 1.45);
      this.garantir(passo * Math.min(linhas.length, 2));
      this.atual.ops.push(
        `BT /F1 ${num(tamanho)} Tf ${cor(CORES.verde)} rg ${num(PAGINA.margemX + (e.recuo ?? 0))} ${num(PAGINA.altura - this.y - tamanho * 0.95)} Td ${literal([0x95])} Tj ET`,
      );
      this.texto(item, { ...e, recuo, antes: 0, depois: 2 });
    }
    this.y += 2;
  }

  /** Barra de 0 a 100: trilho cinza e preenchimento verde, na largura útil (ou na dada). */
  barra(valor: number | null, largura = larguraUtil, altura = 4) {
    this.garantir(altura + 6);
    const x = PAGINA.margemX;
    const topo = PAGINA.altura - this.y - altura;
    this.atual.ops.push(`${cor(CORES.linha)} rg ${num(x)} ${num(topo)} ${num(largura)} ${num(altura)} re f`);
    if (valor !== null && valor > 0)
      this.atual.ops.push(
        `${cor(CORES.verdeVivo)} rg ${num(x)} ${num(topo)} ${num((largura * Math.min(valor, 100)) / 100)} ${num(altura)} re f`,
      );
    this.y += altura + 6;
  }

  /** Nome à esquerda e valor à direita, na mesma linha (uma linha de tabela de duas colunas). */
  duasColunas(esquerda: string, direita: string, e: Estilo = {}) {
    const tamanho = e.tamanho ?? 10.5;
    const passo = tamanho * 1.45;
    this.garantir(passo);
    const base = PAGINA.altura - this.y - tamanho * 0.95;
    const negrito = e.negrito ?? false;
    const fonte = negrito ? "F2" : "F1";
    this.atual.ops.push(
      `BT /${fonte} ${num(tamanho)} Tf ${cor(e.cor ?? CORES.texto)} rg ${num(PAGINA.margemX)} ${num(base)} Td ${literal(codificar(esquerda))} Tj ET`,
      `BT /${fonte} ${num(tamanho)} Tf ${cor(e.cor ?? CORES.texto)} rg ${num(PAGINA.largura - PAGINA.margemX - medir(direita, tamanho, negrito))} ${num(base)} Td ${literal(codificar(direita))} Tj ET`,
    );
    this.y += passo;
  }

  regua() {
    this.garantir(8);
    this.atual.ops.push(
      `${cor(CORES.linha)} RG 0.6 w ${num(PAGINA.margemX)} ${num(PAGINA.altura - this.y)} m ${num(PAGINA.largura - PAGINA.margemX)} ${num(PAGINA.altura - this.y)} l S`,
    );
    this.y += 8;
  }

  /** Número grande (a nota) com o complemento ao lado. */
  numeroGrande(valor: string, complemento: string) {
    this.garantir(52);
    const base = PAGINA.altura - this.y - 40;
    this.atual.ops.push(
      `BT /F2 44 Tf ${cor(CORES.texto)} rg ${num(PAGINA.margemX)} ${num(base)} Td ${literal(codificar(valor))} Tj ET`,
      `BT /F2 14 Tf ${cor(CORES.apoio)} rg ${num(PAGINA.margemX + medir(valor, 44, true) + 6)} ${num(base)} Td ${literal(codificar(complemento))} Tj ET`,
    );
    this.y += 52;
  }

  /** Monta o arquivo: páginas com rodapé e contador, catálogo com idioma e título, e a tabela de referências cruzadas. */
  bytes(): Uint8Array<ArrayBuffer> {
    const o = this.opcoes;
    const total = this.paginas.length;
    this.paginas.forEach((p, i) => {
      const y = 38;
      p.ops.push(
        `${cor(CORES.linha)} RG 0.6 w ${num(PAGINA.margemX)} ${num(y + 14)} m ${num(PAGINA.largura - PAGINA.margemX)} ${num(y + 14)} l S`,
        `BT /F1 8 Tf ${cor(CORES.apoio)} rg ${num(PAGINA.margemX)} ${num(y)} Td ${literal(codificar(o.rodape))} Tj ET`,
        `BT /F1 8 Tf ${cor(CORES.apoio)} rg ${num(PAGINA.largura - PAGINA.margemX - medir(o.pagina(i + 1, total), 8))} ${num(y)} Td ${literal(codificar(o.pagina(i + 1, total)))} Tj ET`,
        `BT /F1 7 Tf ${cor(CORES.apoio)} rg ${num(PAGINA.margemX)} ${num(y - 10)} Td ${literal(codificar(o.nota))} Tj ET`,
      );
    });

    // 1 catálogo, 2 páginas, 3 e 4 fontes, 5 informações; depois (página, conteúdo) para cada página.
    const objetos: string[] = [];
    const idPagina = (i: number) => 6 + i * 2;
    objetos[1] = `<< /Type /Catalog /Pages 2 0 R /Lang ${literal(codificar(o.idioma))} /ViewerPreferences << /DisplayDocTitle true >> >>`;
    objetos[2] = `<< /Type /Pages /Kids [${this.paginas.map((_, i) => `${idPagina(i)} 0 R`).join(" ")}] /Count ${total} >>`;
    objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objetos[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    objetos[5] = `<< /Title ${utf16(o.titulo)} /Author ${utf16(o.autor)} /Creator ${utf16(o.autor)} /Producer ${utf16(o.autor)} >>`;
    this.paginas.forEach((p, i) => {
      const conteudo = p.ops.join("\n");
      objetos[idPagina(i)] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGINA.largura} ${PAGINA.altura}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idPagina(i) + 1} 0 R >>`;
      objetos[idPagina(i) + 1] = `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`;
    });

    // Tudo é ASCII (o que passa de 0x7E está em escape octal), então cada caractere é um byte e os deslocamentos batem.
    let saida = "%PDF-1.4\n%âãÏÓ\n";
    const deslocamentos: number[] = [];
    for (let id = 1; id < objetos.length; id++) {
      deslocamentos[id] = saida.length;
      saida += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
    }
    const xref = saida.length;
    saida += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objetos.length; id++) saida += `${String(deslocamentos[id]).padStart(10, "0")} 00000 n \n`;
    saida += `trailer\n<< /Size ${objetos.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return Uint8Array.from(saida, (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
  }
}
