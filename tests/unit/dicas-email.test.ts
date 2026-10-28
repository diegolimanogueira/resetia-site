import { describe, expect, it } from "vitest";
import { biblioteca } from "@/content/ai-score-dicas";
import { emailRelatorio, emailReset } from "@/content/ai-score-email";
import { perguntasCentrais, relatorio } from "@/content/ai-score-questionario";
import { nomesSolucoes } from "@/content/solucoes-nomes";
import type { DimensaoId } from "@/content/types";
import { analisar } from "@/lib/ai-score/analisar";
import { calcular } from "@/lib/ai-score/calcular";
import { completas, decodificar } from "@/lib/ai-score/codificar";
import { alvosDasDicas, dicasDaBiblioteca, lerDicas, montarDicas } from "@/lib/ai-score/dicas";
import { esquemaDicas, fatosParaDicas, validarDicas } from "@/lib/ai-score/dicas-ia";
import { escapar, montarEmailRelatorio, montarEmailReset } from "@/lib/ai-score/email";
import { recomendar } from "@/lib/ai-score/recomendar";
import type { RespostasCompletas, Resultado } from "@/lib/ai-score/tipos";

// Estratégia 70, Pessoas 40, Processos 27,5, Dados 40, Governança 15, Resultados 27,5.
const CODIGO =
  "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&am=&av=4323&d=comecar&h=imediato&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f";

function respostas(): RespostasCompletas {
  const r = decodificar(CODIGO);
  if (!completas(r)) throw new Error("fixture inválida");
  return r;
}

const comNotas = (dimensoes: Partial<Record<DimensaoId, number | null>>) => ({ dimensoes }) as unknown as Resultado;

describe("dicas: alvos", () => {
  it("dimensões abaixo de 40, na ordem das dimensões", () => {
    expect(alvosDasDicas(calcular(respostas()))).toEqual(["processos", "governanca", "resultados"]);
  });

  it("sem nota baixa, as duas menores abaixo de 70; sem nada abaixo de 70, nenhuma", () => {
    const medias = { estrategia: 65, pessoas: 50, processos: 60, dados: 80, governanca: 90, resultados: null };
    expect(alvosDasDicas(comNotas(medias))).toEqual(["pessoas", "processos"]);
    const altas = { estrategia: 70, pessoas: 85, processos: 70, dados: 100, governanca: 70, resultados: 70 };
    expect(alvosDasDicas(comNotas(altas))).toEqual([]);
  });
});

describe("dicas: fatos para os agentes", () => {
  it("só alternativas, notas e rótulos do conteúdo; nada digitado nem identificável", () => {
    const r = respostas();
    const fatos = fatosParaDicas(r, calcular(r));
    expect(fatos.dimensoes.map((d) => d.id)).toEqual(["processos", "governanca", "resultados"]);
    const gov = fatos.dimensoes.find((d) => d.id === "governanca")!;
    expect(gov.nota).toBe(15);
    const p9 = perguntasCentrais.find((p) => p.id === "p9")!;
    expect(gov.respostas[0]).toEqual({
      pergunta: p9.texto.empresa,
      hoje: p9.alternativas[1],
      proximo_estagio: p9.alternativas[2],
    });
    expect(Object.keys(fatos)).toEqual(["contexto", "dimensoes"]);
    expect(Object.keys(fatos.contexto)).toEqual(["visao", "porte", "segmento", "prazo", "desafios"]);
    expect(JSON.stringify(fatos)).not.toMatch(/3f1c2b9e|@/);
  });

  it("esquema restringe as dimensões às pedidas", () => {
    const esquema = esquemaDicas(["governanca"]);
    expect(esquema.properties.dimensoes.items.properties.id.enum).toEqual(["governanca"]);
    expect(esquema.additionalProperties).toBe(false);
  });
});

describe("dicas: validador", () => {
  const boa = "Defina quem aprova novos usos de IA e registre as decisões num documento simples e acessível.";
  const alvos: DimensaoId[] = ["governanca", "processos"];

  it("aceita dicas boas, limpa espaços, tira repetidas e corta em três", () => {
    const r = validarDicas(
      {
        dimensoes: [
          {
            id: "governanca",
            dicas: [
              `  ${boa}  `,
              boa.toUpperCase(),
              "Combine com as equipes quais dados de clientes nunca podem ser colados em ferramentas abertas.",
              "Revise as respostas geradas antes de enviá-las a clientes, com um critério simples de conferência.",
              "Mantenha uma lista curta das ferramentas aprovadas e de quem responde por cada uma delas.",
            ],
          },
        ],
      },
      alvos,
    );
    expect(r.governanca).toHaveLength(3);
    expect(r.governanca![0]).toBe(boa);
  });

  it("descarta números, porcentagens, valores, links, marcas, promessas, a própria Reset e falsa autoridade", () => {
    const ruins = [
      "Reduza em 30 dias o tempo gasto com tarefas repetitivas usando automações simples.",
      "Equipes que adotam IA ganham cerca de vinte por cento, ou seja 20% de produtividade.",
      "Invista R$ mil por mês em ferramentas para acelerar o uso de IA nas equipes.",
      "Veja o guia completo em https://exemplo.com.br para começar com o pé direito.",
      "Adote o ChatGPT como ferramenta oficial da empresa para todas as equipes.",
      "Use o HubSpot para organizar os dados de clientes antes de aplicar IA.",
      "Esta prática garante resultados para a empresa já no primeiro mês de uso.",
      "Contrate a Reset IA para estruturar a governança de inteligência artificial.",
      "Estudos mostram que equipes treinadas adotam IA com mais facilidade e consistência.",
      "Curta demais.",
      "- Defina quem aprova novos usos de IA e registre as decisões num documento.",
      "• Defina quem aprova novos usos de IA e registre as decisões num documento.",
    ];
    expect(validarDicas({ dimensoes: [{ id: "governanca", dicas: ruins }] }, alvos)).toEqual({ governanca: [] });
  });

  it("LGPD só na dimensão de governança", () => {
    const lgpd = "Confira com o jurídico se o uso de dados de clientes nas ferramentas de IA segue a LGPD.";
    const r = validarDicas(
      {
        dimensoes: [
          { id: "governanca", dicas: [lgpd] },
          { id: "processos", dicas: [lgpd] },
        ],
      },
      alvos,
    );
    expect(r).toEqual({ governanca: [lgpd], processos: [] });
  });

  it("ignora dimensões não pedidas e formatos inválidos", () => {
    expect(validarDicas(null, alvos)).toEqual({});
    expect(validarDicas({ dimensoes: "x" }, alvos)).toEqual({});
    expect(
      validarDicas({ dimensoes: [{ id: "dados", dicas: [boa] }, { id: "governanca", dicas: "x" }, 7] }, alvos),
    ).toEqual({});
    expect(validarDicas({ dimensoes: [{ id: "governanca", dicas: [boa, 42, null] }] }, alvos)).toEqual({
      governanca: [boa],
    });
  });

  it("toda dica da biblioteca passa nas mesmas regras das dicas da IA", () => {
    for (const p of perguntasCentrais) {
      const b = biblioteca[p.id];
      for (const dica of [...b.estagios, b.naoSei]) {
        expect(
          validarDicas({ dimensoes: [{ id: p.dimensao, dicas: [dica] }] }, [p.dimensao]),
          `${p.id}: ${dica}`,
        ).toEqual({
          [p.dimensao]: [dica],
        });
      }
    }
  });
});

describe("dicas: biblioteca e montagem", () => {
  it("uma dica por pergunta, do estágio atual; não sei tem dica própria; estágio máximo não tem", () => {
    const r = respostas();
    expect(dicasDaBiblioteca(biblioteca, r, "governanca")).toEqual([
      biblioteca.p9.estagios[1],
      biblioteca.p10.estagios[1],
    ]);
    const outra = { ...r, centrais: r.centrais.map((v, i) => (i === 8 ? null : i === 9 ? 4 : v)) };
    expect(dicasDaBiblioteca(biblioteca, outra, "governanca")).toEqual([biblioteca.p9.naoSei]);
  });

  it("fonte ia, biblioteca ou misto; o modelo só aparece quando a IA escreveu", () => {
    const r = respostas();
    const alvos: DimensaoId[] = ["processos", "governanca"];
    const dica = "Defina quem aprova novos usos de IA e registre as decisões num documento simples.";
    expect(montarDicas(biblioteca, r, alvos)).toMatchObject({ fonte: "biblioteca", modelo: undefined });
    const misto = montarDicas(biblioteca, r, alvos, { governanca: [dica] }, "claude-opus-5-5");
    expect(misto.fonte).toBe("misto");
    expect(misto.modelo).toBe("claude-opus-5-5");
    expect(misto.dimensoes).toEqual([
      { id: "processos", dicas: dicasDaBiblioteca(biblioteca, r, "processos"), fonte: "biblioteca" },
      { id: "governanca", dicas: [dica], fonte: "ia" },
    ]);
    expect(montarDicas(biblioteca, r, alvos, { processos: [dica], governanca: [dica] }, "m").fonte).toBe("ia");
  });

  it("lerDicas aceita só o formato certo e as dimensões pedidas", () => {
    const r = respostas();
    const alvos: DimensaoId[] = ["processos", "governanca"];
    const dicas = montarDicas(biblioteca, r, alvos);
    expect(lerDicas(JSON.parse(JSON.stringify(dicas)), alvos)).toEqual(dicas);
    expect(lerDicas(dicas, ["processos"])!.dimensoes.map((d) => d.id)).toEqual(["processos"]);
    expect(lerDicas({ dimensoes: [{ id: "processos", dicas: [1], fonte: "ia" }] }, alvos)).toBeNull();
    expect(lerDicas("lixo", alvos)).toBeNull();
    expect(lerDicas(null, alvos)).toBeNull();
  });
});

describe("e-mails", () => {
  it("escapa HTML", () => {
    expect(escapar(`<b a="1">'&'</b>`)).toBe("&lt;b a=&quot;1&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;");
  });

  it("relatório: assunto com a nota, dados digitados escapados, dicas, link e assinatura do squad", () => {
    const r = respostas();
    const resultado = calcular(r);
    const rec = recomendar(resultado, r.desafios);
    const dicas = montarDicas(biblioteca, r, alvosDasDicas(resultado));
    const email = montarEmailRelatorio({
      nome: "Maria <script>alert(1)</script> Teste",
      quem: "Empresa & Cia",
      resultado,
      recomendacao: rec,
      analise: analisar(r, resultado, rec),
      dicas,
      link: "https://www.resetia.com.br/ai-score/resultado/#v=1&lead=x",
      whatsapp: "https://wa.me/5585999990000?text=oi",
      site: "https://www.resetia.com.br",
      nomesSolucoes,
    });
    expect(email.assunto).toBe(emailRelatorio.assunto(resultado.indice, "Explorando"));
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("Empresa &amp; Cia");
    expect(email.html).toContain("#v=1&amp;lead=x");
    expect(email.html).toContain(escapar(dicas.dimensoes[0].dicas[0]));
    expect(email.html).toContain(escapar(relatorio.assinatura.titulo));
    expect(email.texto).not.toMatch(/<[a-z]/i);
    expect(email.texto).toContain(relatorio.assinatura.paragrafos[0]);
    expect(email.texto).toContain("https://www.resetia.com.br/ai-score/resultado/#v=1&lead=x");
  });

  it("e-mail da Reset: parágrafos, quebras de linha e texto do admin escapado", () => {
    const email = montarEmailReset({
      assunto: "Assunto",
      corpo: "Olá, Maria.\nTudo bem?\n\n<b>Segundo</b> parágrafo.",
      whatsapp: "https://wa.me/558500000000",
      site: "https://www.resetia.com.br",
    });
    expect(email.html).toContain('<p style="margin:0 0 14px;">Olá, Maria.<br>Tudo bem?</p>');
    expect(email.html).toContain("&lt;b&gt;Segundo&lt;/b&gt; parágrafo.");
    expect(email.html).toContain(emailReset.assinatura);
    expect(email.texto).toContain(`${emailReset.whatsapp}: https://wa.me/558500000000`);
  });
});
