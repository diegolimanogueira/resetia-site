// Lighthouse CI: audita o export estático (out/) em emulação mobile, 3 rodadas, e falha se as metas caírem.
// Orçamentos de recursos entram como asserts (o LHCI não aceita budgetsFile junto com assertions).
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./out",
      url: [
        "http://localhost/",
        "http://localhost/solucoes/",
        "http://localhost/solucoes/agent-factory/",
        "http://localhost/agentes-de-ia/",
        "http://localhost/tecnologias/",
        "http://localhost/sobre/",
        "http://localhost/diagnostico-gratuito/",
        "http://localhost/ai-score/",
      ],
      numberOfRuns: 3,
      settings: {
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // Orçamentos (bytes transferidos por página)
        // Medido em 25/10/2026: ~157 KB (React 19 + runtime Next 16; sem Motion, Lenis e Base UI). Teto com ~15% de folga.
        "resource-summary:script:size": ["error", { maxNumericValue: 185_000 }],
        "resource-summary:image:size": ["error", { maxNumericValue: 300_000 }],
        "resource-summary:font:size": ["error", { maxNumericValue: 150_000 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 30_000 }],
        "resource-summary:total:size": ["error", { maxNumericValue: 600_000 }],
        "resource-summary:third-party:count": ["error", { maxNumericValue: 2 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
