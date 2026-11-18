/**
 * Clientes que já passaram pela Reset e o que cada um fez (informado pelo Diego em 18/11/2026).
 * As logos saem de design/clientes por `npm run images` (scripts/logos-clientes.mjs), que também imprime a
 * largura e a altura de exibição de cada uma.
 */
export interface Cliente {
  id: string;
  nome: string;
  /** Caminho em /public sem extensão e tamanho de exibição em px (o arquivo tem o dobro). */
  logo: { base: string; largura: number; altura: number };
  entregas: string[];
}

const diagnostico = "Diagnóstico de maturidade de IA e processos";

export const clientes = {
  /** Rótulo da faixa de logos sob o hero. */
  faixa: "Clientes",
  kicker: "Quem já passou pela Reset",
  titulo: ["Empresas que já", "*colocaram a IA para trabalhar.*"],
  diagnostico,
  lista: [
    {
      id: "fortes-tecnologia",
      nome: "Fortes Tecnologia",
      logo: { base: "/clientes/fortes-tecnologia", largura: 136, altura: 45 },
      entregas: [
        diagnostico,
        "Treinamento de Champions para liderança",
        "Governança da IA",
        "Desenvolvimento de Fábrica de Agentes",
      ],
    },
    {
      id: "fortespay",
      nome: "FortesPay",
      logo: { base: "/clientes/fortespay", largura: 144, altura: 42 },
      entregas: [
        diagnostico,
        "Transformação digital completa da empresa com IA na operação",
        "Desenvolvimento de plataforma de indicação",
      ],
    },
    {
      id: "somapay",
      nome: "Somapay",
      logo: { base: "/clientes/somapay", largura: 168, altura: 36 },
      entregas: [diagnostico, "IA para o time de Marketing"],
    },
    {
      id: "longevidade-saudavel",
      nome: "Longevidade Saudável",
      logo: { base: "/clientes/longevidade-saudavel", largura: 147, altura: 41 },
      entregas: [
        "Treinamento de IA na operação com Gemini Enterprise",
        "Gerenciamento de projeto de desenvolvimento de CRM",
      ],
    },
    {
      id: "iel",
      nome: "IEL",
      logo: { base: "/clientes/iel", largura: 95, altura: 49 },
      entregas: ["Treinamentos de IA para negócios"],
    },
  ] satisfies Cliente[],
};
