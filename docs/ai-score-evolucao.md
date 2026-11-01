# Evolução do RESET AI Score — progresso e continuidade

Documento de trabalho do pacote pedido em 31/10/2026 (prompt `prompt-claude-code-resetia.md`, motivado pela auditoria `analise-resetia.md`, ambos fora do repositório). Serve para retomar o trabalho se a sessão terminar. **Não substitui a implementação**: cada item só vira "feito" com código, teste e, quando houver, persistência e autorização.

- Branch: `feat/ai-score-evolucao` (a partir da `main` com o site claro, commit `dd5ef2e`).
- Plano aprovado: `~/.claude/plans/pasted-content-id-8b59-leia-e-moonlit-pine.md`.
- Regra do pedido: **nada em produção**. Sem publicar, sem aplicar migração em produção, sem enviar e-mail ou mensagem real, sem mexer em contato real. Tudo é validado localmente, com integrações simuladas; o que depende de produção fica listado abaixo como "confirmado em produção: não".

Legenda de evidência: **L** = simulado ou testado localmente; **P** = confirmado em produção (nenhum item até agora).

## Estado das fases

| Fase | Escopo                                                       | Estado                                        |
| ---- | ------------------------------------------------------------ | --------------------------------------------- |
| 0    | Branch, documento de progresso                               | feita                                         |
| 1    | Medir a base, protótipo do PDF, consultas de produção        | feita (PDF passa para a Fase 4, ver registro) |
| 2    | Fidelidade, método, cobertura, versões, corte de peso        | pendente                                      |
| 3    | Dados, captura confiável, aprofundamento                     | pendente                                      |
| 4    | Prioridades, devolutiva, PDF, e-mail                         | pendente                                      |
| 5    | Painel, preferências, métricas, trava de publicação          | pendente                                      |
| 6    | Home, celular, jornadas, serviços, agentes                   | pendente                                      |
| 7    | Validação integrada, documentação de publicação e calibração | pendente                                      |

## Achados confirmados no código (31/10/2026)

Conferidos contra o código atual, não só contra a auditoria.

| #   | Achado                                                                                                                                                                                                                                                                  | Onde                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| A1  | A leitura de cada dimensão é escolhida pela faixa da **média** das duas respostas; duas situações diferentes recebem o mesmo texto.                                                                                                                                     | `Relatorio.tsx:296`, `ai-score-questionario.ts:80-102`        |
| A2  | Contradições reproduzíveis: p5=2 ("já mapeamos") com p6=0 recebe "não foram mapeadas"; p7=2 ("dados estruturados") com p8=0 recebe "dados dispersos"; o alerta `processos-sem-dados` repete "dados dispersos".                                                          | idem, `:782`                                                  |
| A3  | A landing diz "Seis dimensões. O mesmo peso.", mas a regra conta a menor dimensão em dobro: `(soma + menor) ÷ 7`.                                                                                                                                                       | `ai-score.ts:35,108`, `regras.ts:15`, `calcular.ts:24-27`     |
| A4  | Desconhecimento pode subir a nota: `[4,0,4,4,4,4,4,4,4,4,4,4]` dá 86 e `[4,null,…]` dá 100.                                                                                                                                                                             | `calcular.ts`                                                 |
| A5  | Tela, painel e função recalculam tudo com as regras atuais; a nota gravada nunca é lida. Só existe `v=1`.                                                                                                                                                               | `leads.ts`, `registro.ts`, `codificar.ts`, `index.ts`         |
| A6  | Prioridades vêm da ordem das notas; empates seguem a ordem fixa das dimensões; o plano de 90 dias é fatiado por posição; iniciantes recebem sempre as mesmas duas soluções; com tudo 100 ainda se indicam soluções.                                                     | `analisar.ts`, `recomendar.ts`, `regras.ts`                   |
| A7  | O banco guarda a nota que o navegador enviou, sem conferir com o código.                                                                                                                                                                                                | `registro.ts`, `0001_ai_score.sql`                            |
| A8  | O anônimo insere todas as colunas de `leads`, inclusive `relatorio_enviado_em`, `responsavel` e `proximo_contato`; marcar `relatorio_enviado_em` faz a função responder `ja-enviado` e o relatório nunca sai.                                                           | `0001`, `0004`, `index.ts`                                    |
| A9  | `completar_lead(id)` sobrescreve empresa e WhatsApp por 30 dias, sem limite; o id do lead vai no link do e-mail. `lead_liberado` não expira.                                                                                                                            | `0003`, `0004`                                                |
| A10 | As ações `dicas` e `enviar-relatorio` autorizam só pelo par de ids; JWT desligado e CORS `*`.                                                                                                                                                                           | `index.ts`                                                    |
| A11 | Uma exceção depois da reserva do envio deixa `relatorio_enviado_em` marcado, sem e-mail e sem registro. O Resend é chamado sem chave de idempotência nem tempo limite.                                                                                                  | `index.ts:302-317`                                            |
| A12 | O resultado é liberado mesmo quando a gravação falha; erro definitivo (por exemplo nome com mais de 120 caracteres) perde o lead sem aviso. Os formulários não têm limite de tamanho.                                                                                   | `EtapaContato.tsx`, `FormularioLead.tsx`, `campo.tsx`         |
| A13 | A fila local guarda a linha completa do lead (nome e e-mail), sem validade nem espera entre tentativas, é regravada ao fim do replay (perde o que entrou durante) e só roda ao montar a tela. Um `completar_lead` de lead com mais de 30 dias fica na fila para sempre. | `supabase.ts`, `navegador.ts`                                 |
| A14 | WhatsApp e Ligar ficam ativos no painel para qualquer lead com número; só a gaveta tem aviso e o cartão do funil não. O servidor não confere nada; `email-reset` ignora os consentimentos.                                                                              | `DetalheLead.tsx`, `Kanban.tsx`, `index.ts`                   |
| A15 | A conversão do painel usa `clientes ÷ (total − descartados)`, sem mostrar o denominador.                                                                                                                                                                                | `leads.ts:114-126`                                            |
| A16 | Analytics desligado em produção (`NEXT_PUBLIC_ANALYTICS_ID` vazio). O Umami não exclui o hash, que leva o id da avaliação e, nos links do e-mail, o do lead. O evento `ai_score_inicio` dispara ao avançar a segmentação, não ao abrir.                                 | `.do/app.yaml`, `Analytics.tsx`, `Avaliacao.tsx`              |
| A17 | Nada falha o build quando o Supabase falta; o smoke só confere o atributo `data-ai-score-modo`.                                                                                                                                                                         | `next.config.ts`, `smoke.yml`                                 |
| A18 | "Baixar relatório" é `window.print()`; não há biblioteca de PDF. A página de resultado está em 222,6 de 225 kB de JS e o total em 265 de 280 kB.                                                                                                                        | `Relatorio.tsx:135`, `check-js-rotas.mjs`, `.size-limit.json` |
| A19 | O compartilhamento do resultado mantém `id=<avaliacao>` no link; quem o recebe pode inserir lead para essa avaliação.                                                                                                                                                   | `Resultado.tsx`, `codificar.ts`                               |
| A20 | A política de privacidade afirma coisas que o código não faz: "respostas sem identificação" e dados locais que "saem dali" ao concluir (nome, e-mail e empresa ficam no navegador); pedido de parar de receber "basta responder" (não há registro).                     | `privacidade.ts:32-36`                                        |

## Critérios de aceite (do pedido, resumidos)

1. O diagnóstico não contradiz as respostas e mostra seus limites de informação.
2. Versão e resultado histórico ficam reproduzíveis dentro da informação disponível.
3. A dor opcional chega à devolutiva e ao painel, com cálculo transparente.
4. O visitante reconhece o diagnóstico e sua utilidade, sobretudo no celular.
5. As recomendações mostram evidências, condições e próximos passos executáveis.
6. O contato chega ao servidor de forma consistente; falhas e pendências são tratadas com honestidade.
7. Dados privados e preferências de contato são protegidos no cliente e no servidor.
8. O PDF é baixado e inspecionado; tela, PDF e e-mail não divergem.
9. Os testes necessários passam, ou os bloqueios externos estão identificados com evidência.
10. A documentação permite publicar e validar com segurança, preservando dados e links existentes.

## Decisões

Decisões de arquitetura estão no plano aprovado e viram ADR em `docs/decisions.md` ao fim de cada fase. Este quadro registra desvios do plano.

| Data  | Decisão                                                              | Motivo                         |
| ----- | -------------------------------------------------------------------- | ------------------------------ |
| 31/10 | Branch `feat/ai-score-evolucao` parte da `main` já com o site claro. | O PR #4 foi mesclado em 30/10. |

## Verificação

Comandos que cada fase usa (os de banco e função exigem Postgres local e `npx deno`):

```
npm run build && npm run lint && npm run typecheck && npm run test
npm run test:banco
npm run test:funcao          # depois de npm run funcao:nucleo
npm run e2e                  # servidor: npx serve out -l 4173 (o do projeto)
npm run check:html && npm run check:links && npm run check:size && npm run check:rotas
npm run lhci
```

## Pendências externas (nada disso foi feito)

Preenchido ao longo do trabalho; ver a seção final de cada fase. Itens previstos: aplicar migrações, publicar a função e seus segredos, ligar o agendador, ID de analytics, envio real pelo Resend, renderização do e-mail em clientes reais, Lighthouse em produção, casos de clientes autorizados, entrevistas de calibração.

## Consultas de produção (somente leitura)

Para o Diego rodar no editor SQL do Supabase **antes** de aplicar qualquer migração nova. Nenhuma altera dados. Nada disto foi executado por mim.

```sql
-- Q1. Volume por ambiente
select ambiente, count(*) avaliacoes, min(criada_em) primeira, max(criada_em) ultima
from public.avaliacoes group by ambiente;

-- Q2. Avaliações gravadas enquanto a regra de notas ainda era a anterior.
-- O commit 1371422 (28/10 13:03 -03, 16:03 UTC) usava pontos lineares 0/25/50/75/100 e média simples; o ee9782f
-- (14:32 -03, 17:32 UTC) passou a 0/15/40/70/100 com a menor dimensão em dobro. A hora em que cada versão foi ao ar
-- está no histórico de deploys da DigitalOcean; a janela abaixo é larga de propósito.
select id, criada_em, indice, nivel, parcial, codigo
from public.avaliacoes
where ambiente = 'producao'
  and criada_em >= '2026-10-28 16:03:00+00' and criada_em < '2026-10-28 20:00:00+00'
order by criada_em;

-- Q3. Exportar tudo para conferir a nota gravada contra a reprodução pelo método 1
-- (o script scripts/conferir-notas.mjs, da Fase 2, lê este export e lista as divergências, só localmente).
select id, criada_em, indice, nivel, parcial, codigo
from public.avaliacoes where ambiente = 'producao' order by criada_em;

-- Q4. Relatório marcado como enviado sem e-mail registrado: falha depois da reserva ou valor forjado pelo anônimo (A8, A11).
select l.id, l.criado_em, l.relatorio_enviado_em, l.responsavel, l.proximo_contato
from public.leads l
where (l.relatorio_enviado_em is not null or l.responsavel is not null or l.proximo_contato is not null)
  and not exists (select 1 from public.emails e where e.lead_id = l.id and e.tipo = 'relatorio' and e.status = 'enviado');

-- Q5. Contatos e preferências registradas
select count(*) total,
       count(*) filter (where whatsapp is not null) com_whatsapp,
       count(*) filter (where whatsapp is not null and not pediu_contato) whatsapp_sem_pedido,
       count(*) filter (where pediu_contato) pediram_conversa,
       count(*) filter (where consentimento_marketing) aceitam_conteudo
from public.leads where ambiente = 'producao';

-- Q6. Avaliações sem lead (concluíram sem deixar contato ou perderam a gravação)
select count(*) from public.avaliacoes a
where a.ambiente = 'producao' and not exists (select 1 from public.leads l where l.avaliacao_id = a.id);

-- Q7. Situação real dos e-mails
select tipo, status, count(*) from public.emails group by 1, 2 order by 1, 2;

-- Q8. Privilégios efetivos de anon e authenticated (confirma o que o teste local assume)
select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated') order by 1, 2, 3;
select routine_name, grantee from information_schema.routine_privileges
where routine_schema = 'public' and grantee in ('anon', 'authenticated', 'PUBLIC') order by 1, 2;
```

## Registro das fases

### Fase 0 e 1 (31/10) — feitas

**Base medida (L, na `main` com o site claro):**

| Verificação                                                       | Resultado                                                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run test`                                                    | 107 testes, 10 arquivos, passando                                                                     |
| `npm run test:banco`                                              | passando (RLS, permissões, CHECKs, gatilhos)                                                          |
| `npm run test:funcao` (Deno, mocks)                               | 7 testes passando                                                                                     |
| `npm run build`                                                   | passando                                                                                              |
| `check:rotas` (JS gzip por página, teto 225 kB; `/admin/` 240 kB) | resultado e exemplo 222,6; avaliação 215,9; painel 225,6; demais 198 a 202                            |
| `check:size`                                                      | JS total 264,5 kB de 280; CSS 9,6 kB de 20                                                            |
| E2E do AI Score, Chromium e WebKit                                | 113 execuções (4 rodadas, até 14 processos, com 10 processos de carga de CPU) sem falha               |
| Lighthouse (mobile, 3 rodadas, mediana)                           | desempenho 96–97, acessibilidade 98–100, boas práticas 100, SEO 100; LCP 2,5–2,8 s; TBT ≤ 4 ms; CLS 0 |
| Lighthouse, JS transferido                                        | home 162 kB; `/ai-score/` **181 kB de 185 kB (teto)**; demais 162–170 kB                              |

**Duas decisões de método, para o registro:**

1. **Instabilidade dos E2E (auditoria): não reproduzida.** Os testes clicam logo após o carregamento, sem esperar a hidratação do React; isso é uma corrida possível em tese. Em 113 execuções, mesmo sob carga, nenhuma falhou. Não vou aumentar esperas nem relaxar verificações. Ao reescrever a captura (Fase 3) entra um sinal determinístico de hidratação (`data-pronto`, via `useSyncExternalStore`) e os testes passam a esperá-lo.
2. **Lighthouse sem envio.** O `lighthouserc.js` do projeto termina o `lhci autorun` enviando o relatório ao armazenamento público temporário do Google. Iniciei o `autorun` por engano, notei antes da etapa de envio (o log parou na verificação inicial) e o encerrei. Refiz a medição com `lhci collect` + `lhci assert`, só local. **Para o Diego decidir:** trocar `upload.target` por `filesystem` em `lighthouserc.js` ou manter o envio no CI.

**Confirmado nas documentações oficiais:** o Resend aceita `Idempotency-Key` (24 h, até 256 caracteres; mesma chave e mesmo conteúdo devolvem a mesma resposta sem reenviar; conteúdo diferente dá 409 `invalid_idempotent_request`). O Umami tem `data-exclude-hash` e `data-exclude-search`. **Confirmado em produção (P): não.**

**Desvio do plano:** o protótipo do escritor de PDF fica para a Fase 4. Ele só faz sentido com a estrutura da `Devolutiva` e o risco que ele cobria (tamanho) depende do que entrar no JS total, hoje com 15,5 kB de folga. O tamanho será medido lá, e o teto do `size-limit` só sobe com justificativa registrada, como já aconteceu em 28/10.

**Riscos que mudam o desenho da Fase 2:** a página de resultado tem 2,4 kB de folga, o exemplo é o mesmo bundle e a landing `/ai-score/` tem 4 kB de folga no Lighthouse. O motor novo de leituras e seus textos entram em chunk sob demanda, não por importação direta.
