import { site } from "./site";
import type { Passo, Ponto } from "./types";

/**
 * Fluxa BPM, conforme fluxabpm.com.br: gestão de processos com IA, em português.
 * Tudo aqui é o que o produto diz de si mesmo; o exemplo de reembolso é o exemplo público do próprio site.
 */
export const fluxa = {
  eyebrow: "Gestão de processos com IA",
  titulo: "Conte como o trabalho é feito. A IA desenha o processo e mostra onde ele trava.",
  lead: "O desenho sai em cerca de um minuto. Depois vêm o passo a passo, os pontos de atenção e a proposta de melhoria, em PDF e Word. Em português, com custo e economia estimados em reais.",
  valor:
    "Processo claro é onde a IA para de ser demonstração e vira rotina. A Fluxa desenha o hoje, mostra o gargalo e prova em reais se o redesenho vale a pena.",
  entregasTitulo: "Descreva uma vez. Receba quatro respostas.",
  entregas: [
    {
      numero: "01",
      titulo: "Hoje.",
      texto:
        "Como o trabalho acontece: o fluxo por área, com decisões e caminhos alternativos. Corrija clicando ou pedindo ao assistente.",
    },
    {
      numero: "02",
      titulo: "Passo a passo.",
      texto: "Como ensinar quem chega amanhã: resumo do processo, procedimento das etapas e quem faz o quê.",
    },
    {
      numero: "03",
      titulo: "Pontos de atenção.",
      texto:
        "Onde trava, se repete ou corre risco, e o que fazer. Dores que ninguém confirmou vêm marcadas para validar com a equipe.",
    },
    {
      numero: "04",
      titulo: "Proposta.",
      texto:
        "O processo redesenhado comparado com o de hoje, com as mudanças marcadas e o impacto e o esforço de cada uma.",
    },
  ] satisfies Passo[],
  vemJuntoTitulo: "Tudo o que vem junto",
  vemJunto: [
    {
      destaque: "Custo em reais.",
      texto:
        "Volume, tempo e custo por hora viram o custo do processo por mês, o gargalo e a economia estimada da proposta.",
    },
    {
      destaque: "Entrevista por link.",
      texto: "Quem executa o processo responde a um roteiro guiado, sem criar conta.",
    },
    {
      destaque: "Documentos.",
      texto: "Dossiê em Word ou PDF, relatório executivo e o desenho em PNG, SVG e BPMN 2.0.",
    },
    { destaque: "Governança.", texto: "Setores, dono de cada processo e versões completas com autor e data." },
    {
      destaque: "Segurança.",
      texto:
        "Cada organização só enxerga os próprios dados, com política de privacidade e direitos do titular previstos na LGPD.",
    },
  ] satisfies Ponto[],
  planos: "Comece grátis, sem cartão. Planos Pro e Team sem fidelidade; Enterprise sob consulta.",
  servico: {
    titulo: "Prefere que a Reset IA faça?",
    texto:
      "Numa conversa de 90 minutos com quem executa o processo, levantamos como ele acontece, desenhamos na Fluxa e entregamos o dossiê completo em até 15 dias úteis.",
    cta: site.ctaFluxaServico,
  },
  exemplo: {
    rotulo: "Processo: Reembolso de despesas",
    tag: "exemplo ilustrativo",
    fluxo: ["Preencher solicitação", "Anexar recibos", "Acima de R$ 500?", "Aprovar", "Conferir política", "Pagar"],
    gargalo: "Gargalo apontado: pagamento em até 20 dias.",
    saidas: "Sai em PDF, Word e BPMN 2.0",
  },
  links: {
    site: { label: site.ctaFluxaSite, href: site.ferramentas.fluxa },
    gratis: { label: site.ctaFluxaGratis, href: site.ferramentas.fluxaGratis },
  },
};
