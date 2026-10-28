import { desafios, dimensoes } from "@/content/ai-score-questionario";
import type { DesafioId, DimensaoId } from "@/content/types";
import { faixaDe } from "./calcular";
import { regras } from "./regras";
import type { Recomendacao, Resultado } from "./tipos";

/**
 * Recomendações por regra fixa (sem IA): ponto forte, principal oportunidade, três próximos passos e
 * no máximo duas soluções. As soluções saem das três menores dimensões e dos desafios informados,
 * com travas de estágio: quem ainda está no nível Inicial não recebe Performance nem Agent Factory.
 */

const ordem = dimensoes.map((d) => d.id);
const dimensao = (id: DimensaoId) => dimensoes.find((d) => d.id === id)!;

function passoDa(id: DimensaoId, nota: number) {
  const d = dimensao(id);
  return faixaDe(nota) === "alta" ? d.passos.evoluir : d.passos.estruturar;
}

export function recomendar(resultado: Resultado, escolhidos: readonly DesafioId[]): Recomendacao {
  const comNota = ordem.filter((id) => resultado.dimensoes[id] !== null);
  const nota = (id: DimensaoId) => resultado.dimensoes[id]!;
  // Ordenação estável: empates ficam na ordem das dimensões.
  const lacunas = [...comNota].sort((a, b) => nota(a) - nota(b));
  const maior = [...comNota].sort((a, b) => nota(b) - nota(a))[0];
  const forte = maior && nota(maior) >= regras.forteMinimo && nota(maior) > nota(lacunas[0]) ? maior : null;

  // Passos: as duas menores dimensões e o desafio principal (se for de outro tema); senão, a terceira menor.
  const passos = lacunas.slice(0, 2).map((id) => passoDa(id, nota(id)));
  const desafio = escolhidos
    .map((id) => desafios.find((d) => d.id === id)!)
    .find((d) => !lacunas.slice(0, 2).includes(d.dimensao));
  if (desafio) passos.push(desafio.passo);
  else if (lacunas[2]) passos.push(passoDa(lacunas[2], nota(lacunas[2])));

  return { forte, lacunas, passos, solucoes: indicarSolucoes(lacunas, escolhidos, resultado.media) };
}

function indicarSolucoes(lacunas: DimensaoId[], escolhidos: readonly DesafioId[], media: number | null) {
  if (media === null) return [];
  if (media < regras.inicialAbaixoDe) return [...regras.inicialSolucoes];

  const pontos = new Map<string, number>();
  const somar = (slug: string, p: number) => pontos.set(slug, (pontos.get(slug) ?? 0) + p);
  lacunas
    .slice(0, regras.pesosLacunas.length)
    .forEach((id, i) => somar(regras.dimensaoSolucao[id], regras.pesosLacunas[i]));
  for (const d of escolhidos) for (const slug of regras.desafioSolucoes[d]) somar(slug, regras.pesoDesafio);

  const bloqueada = (slug: string) =>
    (slug === "performance" && media < regras.minimoPerformance) ||
    (slug === "agent-factory" && media < regras.minimoAgentFactory && !escolhidos.includes("agentes"));

  const posicao = (slug: string) => regras.ordemSolucoes.indexOf(slug);
  return [...pontos.entries()]
    .filter(([slug, p]) => p > 0 && !bloqueada(slug))
    .sort(([a, pa], [b, pb]) => pb - pa || posicao(a) - posicao(b))
    .slice(0, regras.maxSolucoes)
    .map(([slug]) => slug);
}
