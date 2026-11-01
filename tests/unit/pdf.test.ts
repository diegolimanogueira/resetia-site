// @vitest-environment node
import { resolve } from "node:path";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { aiScore } from "@/content/ai-score";
import { relatorio } from "@/content/ai-score-questionario";
import type { Aprofundamento } from "@/lib/ai-score/aprofundamento";
import { lerLink } from "@/lib/ai-score/codec";
import { montarDevolutiva } from "@/lib/ai-score/devolutiva";
import { codificar, Documento, GlifoSemMapa, medir, PAGINA } from "@/lib/ai-score/pdf/escritor";
import { gerarPdf, nomeDoArquivo, type EntradaDoPdf } from "@/lib/ai-score/pdf/relatorio";
import type { RespostasCompletas } from "@/lib/ai-score/tipos";

const link = lerLink(aiScore.exemplo.codigo);
if (link.tipo !== "ok") throw new Error("o código do exemplo precisa ser válido");
const respostas = link.respostas as RespostasCompletas;
const devolutiva = montarDevolutiva(respostas, link);

const entrada = (extra: Partial<EntradaDoPdf> = {}): EntradaDoPdf => ({
  devolutiva,
  respostas,
  nome: "Maria Teste",
  empresa: "Empresa Exemplo",
  data: "01/11/2026",
  ...extra,
});

interface Item {
  str: string;
  x: number;
  y: number;
  largura: number;
  tamanho: number;
  negrito: boolean;
}

/** Lê o PDF como um leitor de verdade (pdf.js): metadados, texto e a posição de cada trecho. */
async function ler(bytes: Uint8Array) {
  const doc = await pdfjs.getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
    isEvalSupported: false,
    standardFontDataUrl: `${resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts")}/`,
  }).promise;
  const meta = await doc.getMetadata();
  const paginas: Item[][] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    paginas.push(
      conteudo.items
        .filter((i): i is (typeof conteudo.items)[number] & { str: string } => "str" in i && i.str.trim() !== "")
        .map((i) => ({
          str: i.str,
          x: i.transform[4],
          y: i.transform[5],
          largura: i.width,
          tamanho: Math.abs(i.transform[3]),
          negrito: /Bold/i.test(String(conteudo.styles[i.fontName]?.fontFamily ?? "")) || /bold/i.test(i.fontName),
        })),
    );
  }
  return {
    doc,
    info: meta.info as Record<string, string>,
    paginas,
    texto: paginas
      .flat()
      .map((i) => i.str)
      .join(" "),
  };
}

describe("escritor de PDF: codificação", () => {
  it("o português inteiro cabe no WinAnsi; os símbolos declarados são trocados; o resto falha", () => {
    const acentuado = "áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇüñ“”‘’–—…•º×÷«»·";
    expect(codificar(acentuado)).toHaveLength([...acentuado].length);
    expect(codificar("a → b")).toEqual(codificar("a -> b"));
    expect(codificar("✓ ok")).toEqual(codificar("- ok"));
    expect(() => codificar("emoji 😀")).toThrow(GlifoSemMapa);
    expect(() => codificar("≈")).toThrow(/U\+2248/);
    expect(() => codificar("日本")).toThrow(GlifoSemMapa);
  });

  it("um glifo sem mapa no relatório faz o PDF falhar, em vez de sair com um símbolo errado", () => {
    expect(() => gerarPdf(entrada({ nome: "Maria 😀" }))).toThrow(GlifoSemMapa);
  });
});

describe("escritor de PDF: arquivo", () => {
  const d = new Documento({
    titulo: "Teste",
    autor: "Reset IA",
    idioma: "pt-BR",
    rodape: "rodapé",
    nota: "nota",
    pagina: (n, t) => `${n}/${t}`,
  });
  d.texto("Acentuação: ação, coração, não, é, à, ü, ç — «aspas» “duplas”, 50 × 3 ÷ 2 …");
  d.texto("Parênteses (aninhados (assim)) e barra invertida \\ não quebram o arquivo.");
  const bytes = d.bytes();

  it("é um PDF 1.4 bem formado, com título e idioma", async () => {
    expect(new TextDecoder("latin1").decode(bytes.slice(0, 8))).toBe("%PDF-1.4");
    expect(new TextDecoder("latin1").decode(bytes.slice(-6))).toBe("%%EOF\n");
    const { doc, info } = await ler(bytes);
    expect(doc.numPages).toBe(1);
    expect(info.Title).toBe("Teste");
    expect(info.Language).toBe("pt-BR");
  });

  it("o texto sai como texto, com os acentos e os parênteses de volta", async () => {
    const { texto } = await ler(bytes);
    expect(texto).toContain("Acentuação: ação, coração, não, é, à, ü, ç — «aspas» “duplas”, 50 × 3 ÷ 2 …");
    expect(texto).toContain("Parênteses (aninhados (assim)) e barra invertida \\ não quebram o arquivo.");
  });

  it("a tabela de referências cruzadas aponta para os objetos (o leitor abre o arquivo sem reconstruir)", () => {
    const texto = new TextDecoder("latin1").decode(bytes);
    const inicio = Number(/startxref\n(\d+)\n%%EOF/.exec(texto)![1]);
    expect(texto.slice(inicio, inicio + 4)).toBe("xref");
    const linhas = texto.slice(inicio).split("\n").slice(3);
    for (const [i, linha] of linhas.slice(0, 5).entries()) {
      const deslocamento = Number(linha.slice(0, 10));
      expect(texto.slice(deslocamento, deslocamento + 8), `objeto ${i + 1}`).toMatch(new RegExp(`^${i + 1} 0 obj`));
    }
  });

  it("a medida de largura coincide com a do leitor, em regular e em negrito (tabelas de largura conferidas)", async () => {
    const amostra = "Governança e Segurança: a organização dos dados, os resultados já obtidos — 50 × 3 ÷ 2";
    const doc = new Documento({ titulo: "T", autor: "A", idioma: "pt-BR", rodape: "r", nota: "n", pagina: () => "" });
    doc.texto(amostra, { tamanho: 10 });
    doc.texto(amostra, { tamanho: 10, negrito: true });
    const { paginas } = await ler(doc.bytes());
    const corpo = paginas[0].filter((i) => i.str === amostra);
    expect(corpo).toHaveLength(2);
    for (const [i, item] of corpo.entries()) {
      const meu = medir(amostra, 10, i === 1);
      expect(
        Math.abs(meu - item.largura),
        `${i ? "negrito" : "regular"}: meu ${meu}, leitor ${item.largura}`,
      ).toBeLessThan(meu * 0.01 + 0.3);
    }
  });
});

describe("relatório em PDF", () => {
  it("mostra a nota, o nível, a cobertura e a versão da avaliação, os mesmos da devolutiva", async () => {
    const { texto, info } = await ler(gerarPdf(entrada()));
    expect(info.Title).toBe("Relatório RESET AI Score, Empresa Exemplo");
    expect(texto).toContain(String(devolutiva.resultado.indice));
    expect(texto).toContain("Explorando");
    expect(texto).toContain("Preparado para Maria Teste, Empresa Exemplo, em 01/11/2026.");
    expect(texto).toContain(
      `Método ${devolutiva.versoes.metodo} da nota · análise ${devolutiva.versoes.analiseDoLink} da leitura`,
    );
    // Cobertura: o exemplo tem duas respostas "Não sei".
    expect(devolutiva.cobertura.situacao).toBe("estimativa");
    expect(texto).toContain("esta nota é uma estimativa");
  });

  it("traz o resumo, as lacunas, as oportunidades, o roteiro e as indicações da mesma síntese da tela", async () => {
    const { texto } = await ler(gerarPdf(entrada()));
    const s = devolutiva.sintese;
    for (const item of s.resumo.itens) expect(texto).toContain(item.rotulo.toUpperCase());
    // O primeiro item do resumo e a primeira ação são os da tela, com o nome da empresa.
    expect(texto).toContain("Empresa Exemplo está no nível Explorando, com AI Score 28 de 100.");
    expect(texto).toContain(s.plano.etapas[0].acao);
    for (const etapa of s.plano.etapas) expect(texto).toContain(etapa.titulo);
    for (const i of s.indicacoes.itens) expect(texto).toContain(i.rotuloForca);
    for (const a of devolutiva.analise.alertas) expect(texto).toContain(a.titulo);
    // Cada dimensão e a resposta literal.
    expect(texto).toContain("Governança e Segurança");
    expect(texto).toContain("Hoje:");
  });

  it("tem várias páginas, cada uma com o rodapé e o contador certos", async () => {
    const { paginas } = await ler(gerarPdf(entrada()));
    expect(paginas.length).toBeGreaterThanOrEqual(4);
    paginas.forEach((p, i) => {
      const texto = p.map((x) => x.str).join(" ");
      expect(texto, `página ${i + 1}`).toContain(`Página ${i + 1} de ${paginas.length}`);
      expect(texto).toContain("Relatório RESET AI Score · resetia.com.br");
      // Nenhuma página fica só com o rodapé.
      expect(p.filter((x) => x.y > 60).length, `página ${i + 1} vazia`).toBeGreaterThan(3);
    });
  });

  it("nada passa da margem nem invade o rodapé: sem texto cortado", async () => {
    const { paginas } = await ler(
      gerarPdf(
        entrada({
          dicas: {
            fonte: "biblioteca",
            dimensoes: [
              {
                id: "governanca",
                fonte: "biblioteca",
                dicas: [
                  "Defina quem aprova novos usos de IA e registre as decisões num documento simples e acessível a todos.",
                ],
              },
            ],
          } as never,
        }),
      ),
    );
    paginas.forEach((p, i) => {
      for (const x of p) {
        expect(x.x, `${x.str} (p. ${i + 1})`).toBeGreaterThanOrEqual(PAGINA.margemX - 1);
        expect(x.x + x.largura, `${x.str} (p. ${i + 1})`).toBeLessThanOrEqual(PAGINA.largura - PAGINA.margemX + 1);
        expect(x.y, `${x.str} (p. ${i + 1})`).toBeLessThan(PAGINA.altura - PAGINA.topo + 12);
      }
      // O corpo termina acima da faixa do rodapé (as três linhas do rodapé ficam abaixo de 52 pt).
      for (const x of p.filter((y) => y.tamanho > 8))
        expect(x.y, `${x.str} (p. ${i + 1})`).toBeGreaterThan(PAGINA.base - 8);
    });
  });

  it("a página de exemplo leva o aviso de caso fictício; o relatório real não", async () => {
    expect((await ler(gerarPdf(entrada({ exemplo: true })))).texto).toContain(
      "Exemplo ilustrativo com respostas hipotéticas",
    );
    expect((await ler(gerarPdf(entrada()))).texto).not.toContain("Exemplo ilustrativo");
  });

  it("o aprofundamento entra só quando existe, com o esforço e as premissas, sem dinheiro", async () => {
    const aprofundamento: Aprofundamento = {
      area: "vendas",
      camada: 2,
      revisao: 1,
      rotina: "propostas",
      volume: 200,
      unidade: "propostas",
      periodo: "mes",
      consequencia: "retrabalho",
      minutos: 15,
      ferramentas: ["CRM", "planilha"],
      naoSei: [],
    };
    const com = (await ler(gerarPdf(entrada({ aprofundamento })))).texto;
    expect(com).toContain("Dor operacional informada");
    expect(com).toContain("200 propostas por mês × 15 min ÷ 60 = 50 h por mês");
    expect(com).toContain("É o esforço que você informou, não uma economia garantida.");
    expect(com).not.toMatch(/R\$|reais/);
    const sem = (await ler(gerarPdf(entrada()))).texto;
    expect(sem).not.toContain("Dor operacional informada");
    expect(sem).not.toContain("50 h por mês");
  });

  it("o mesmo relatório gera sempre os mesmos bytes (nada de data ou aleatoriedade no arquivo)", () => {
    expect(Buffer.from(gerarPdf(entrada())).equals(Buffer.from(gerarPdf(entrada())))).toBe(true);
  });

  it("tamanho razoável para baixar e abrir no celular", () => {
    expect(gerarPdf(entrada()).length).toBeLessThan(160_000);
  });

  it("resultado parcial: diz que não há nota e não inventa indicação", async () => {
    const parcial = {
      ...respostas,
      centrais: respostas.centrais.map((_, i) => (i < 8 ? null : respostas.centrais[i])),
    } as RespostasCompletas;
    const dv = montarDevolutiva(parcial);
    const { texto } = await ler(gerarPdf(entrada({ devolutiva: dv, respostas: parcial })));
    expect(texto).toContain("Resultado parcial");
    expect(texto).toContain(relatorio.pontosCegos.titulo);
    expect(dv.sintese.indicacoes.itens).toEqual([]);
  });

  it("nome do arquivo sem acento nem espaço", () => {
    expect(nomeDoArquivo("Empresa Ágil & Cia. Ltda", "RESET-AI-Score")).toBe(
      "RESET-AI-Score-Empresa-Agil-Cia-Ltda.pdf",
    );
    expect(nomeDoArquivo(null, "RESET-AI-Score")).toBe("RESET-AI-Score.pdf");
  });
});
