# Evolução do RESET AI Score — progresso e continuidade

Documento de trabalho do pacote pedido em 31/10/2026 (prompt `prompt-claude-code-resetia.md`, motivado pela auditoria `analise-resetia.md`, ambos fora do repositório). Serve para retomar o trabalho se a sessão terminar. **Não substitui a implementação**: cada item só vira "feito" com código, teste e, quando houver, persistência e autorização.

- Branch: `feat/ai-score-evolucao` (a partir da `main` com o site claro, commit `dd5ef2e`).
- Plano aprovado: `~/.claude/plans/pasted-content-id-8b59-leia-e-moonlit-pine.md`.
- Regra do pedido: **nada em produção**. Sem publicar, sem aplicar migração em produção, sem enviar e-mail ou mensagem real, sem mexer em contato real. Tudo é validado localmente, com integrações simuladas; o que depende de produção fica listado abaixo como "confirmado em produção: não".

Legenda de evidência: **L** = simulado ou testado localmente; **P** = confirmado em produção (nenhum item até agora).

## Estado das fases

| Fase | Escopo                                                       | Estado                                                    |
| ---- | ------------------------------------------------------------ | --------------------------------------------------------- |
| 0    | Branch, documento de progresso                               | feita                                                     |
| 1    | Medir a base, protótipo do PDF, consultas de produção        | feita (PDF passa para a Fase 4, ver registro)             |
| 2    | Fidelidade, método, cobertura, versões, corte de peso        | feita (forte, lacuna, passos e plano ficam para a Fase 4) |
| 3    | Dados, captura confiável, aprofundamento                     | feita (L; produção: nada aplicado, ver registro)          |
| 4    | Prioridades, devolutiva, PDF, e-mail                         | feita (L; tokens e e-mail só validados com simulações)    |
| 5    | Painel, preferências, métricas, trava de publicação          | pendente                                                  |
| 6    | Home, celular, jornadas, serviços, agentes                   | pendente                                                  |
| 7    | Validação integrada, documentação de publicação e calibração | pendente                                                  |

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

### Fase 2 (31/10 a 01/11) — feita

**O que ficou pronto (L):**

- Método 1 congelado (`metodo/metodo-1.ts`), versões em `versoes.ts`, `calcular` recebe o método, cobertura das respostas (`cobertura.ts`).
- Codec com formato 1 congelado, formato 2 (`v=2&m=1&n=2&…`) e `lerLink`, que distingue vazio, inválido, formato desconhecido, método desconhecido e análise mais nova. Token e `&lead=` fora do código gravado.
- Leituras pelas duas respostas (`leituras.ts`), alertas por pergunta sem corte (`alertas.ts`), modelo de evidência (`evidencia.ts`) e textos (`ai-score-analise.ts`, a revisar).
- `Devolutiva` (`devolutiva.ts`) carregada sob demanda (`motor.ts`); a página de exemplo recebe a devolutiva calculada no build.
- Interface: nota com cobertura e aviso de nota estimada, aviso de versão (link anterior ao versionamento, análise mais nova), estados distintos do link, alertas (3 + "Ver mais N", todos na impressão), leitura de cada dimensão com a pergunta de validação.
- Metodologia publicada alinhada ao cálculo (fórmula, peso extra como escolha calibrável, "Não sei" vira estimativa, menos respostas podem subir a nota), amarrada por teste.
- `scripts/conferir-notas.mjs`: confere um export das avaliações contra a reprodução pelo método 1, só local. **Rodado apenas sobre um arquivo fictício.**

**Testes novos:** `versoes.test.ts` (16), `fidelidade.test.ts` (22: 216 leituras, alertas contra a especificação, exemplo e auditoria), `metodologia.test.ts` (6), mais 5 E2E (caso 86 × 100 na tela, link do formato 1, análise mais nova, estados do link) e ajustes nos existentes. Mutação: quatro defeitos injetados de propósito (o texto da auditoria, o lado do "à frente" trocado, limiar sem atualizar a declaração, pergunta de validação errada) foram todos detectados.

**Resultados (L):** unidade 151, banco OK, função 7 (núcleo regenerado), E2E 162 passando e 22 visuais pulados localmente (rodam no Docker/CI), HTML válido, 0 links quebrados, nenhuma pendência `[FALTA]`, lint e tipos limpos, knip limpo.

**Peso (antes → depois):** `/ai-score/resultado/` 222,6 → 221,5 kB (teto 225); avaliação 215,9 → 215,2; painel 225,6 → 225,7 (teto 240); motor sob demanda 5,3 kB (novo, teto 30); JS total 264,5 → 282,3 kB (teto 280 → 290, ver ADR). A causa do total é um terceiro chunk com o conteúdo do questionário que o Turbopack passou a duplicar; nenhuma página baixa duas cópias. Depois que o motor carrega, a página de resultado pesa 221,5 + 5,3 = 226,8 kB, 1,8 kB acima do teto de carregamento inicial, mas o motor chega enquanto a pessoa preenche nome e e-mail. Alavanca pronta se a Fase 4 apertar: carregar o `Relatorio` sob demanda só na rota de resultado.

**Achado novo:** o exemplo público tem 10 de 12 respostas válidas (duas "Não sei"), então ele mesmo é uma nota estimada, com Governança e Resultados calculados por uma resposta só. Passou a aparecer assim na página de exemplo, o que é honesto e mostra o recurso; a nota do exemplo (28) não mudou.

**Decisões e desvios:**

- A expectativa de `ai-score.spec` sobre o resumo do exemplo mudou de propósito ("…28 de 100 (nota estimada: 10 de 12 respostas).").
- Mantive a regra que sobe a nota quando uma resposta baixa vira "Não sei" (86 → 100): mudar pesos ou faixas está fora do pedido. A mitigação é mostrar a cobertura.
- `ai-score.spec` passou a imprimir o link em `v=2`; links `v=1` continuam abrindo.
- Limite de imagens da home 40 → 50 kB (o tema claro faz a home carregar três imagens da marca; o limite ainda apontava para os arquivos escuros).

**Pendências desta fase para as seguintes:**

- Fase 3: gravar `versao_metodo`, `versao_analise` e a devolutiva; migração 0005 amplia o CHECK de `versao` e **precisa ir antes do site** (o site grava `versao: "2"`).
- Fase 4: ponto forte, oportunidade, próximos passos e plano ainda saem por dimensão (um "já mapeamos" ainda pode ser seguido de um passo "mapear processos"); resumo executivo; PDF; e-mail a partir da devolutiva.
- Prints de referência da landing `/ai-score/` (texto da metodologia mudou) em regeneração.

### Fase 3 (01/11) — feita

**Banco (migrações 0005 a 0008, aditivas, só no Postgres local de teste):** versões do método e da análise, canal de entrada, `relatorios` (histórico append-only), `tarefas` com lease e `limites` atômicos, `consentimentos` append-only por finalidade e canal (com backfill dos leads antigos), `aprofundamentos` com revisão monotônica, `registrar_captura`/`completar_captura`/`registrar_avaliacao` (só `service_role`, numa transação). O INSERT anônimo ficou restrito às colunas que o site antigo enviava e o gatilho zera as colunas do CRM; `completar_lead` só preenche vazio, só para leads sem chave, em 7 dias. `scripts/testar-banco.sh` roda a cadeia 0001 a 0008 e o inventário de privilégios (109 asserções).

**Função `ai-score` (Deno, testada com mocks):** ações `concluir`, `registrar`, `completar`, `aprofundar`, `status` e `processar`, além das legadas. A nota é recalculada no servidor a partir do código (a do navegador é ignorada); a escrita no lead exige a `chave` (32 bytes aleatórios gerados no navegador; só o sha256 vai ao banco); ids públicos não autorizam nada. E-mail pelo Resend com `Idempotency-Key`, estados reais (pendente, aceito pelo provedor, nova tentativa, falhou) e classificação de falha transitória × definitiva. 32 testes, com mutação nos pontos de segurança e de classificação.

**Navegador:** a captura passa pela função (`captura.ts`, `fila.ts`): o pedido entra na fila antes da rede, sai ao ser aceito ou recusado de vez, vence em 7 dias, espera 5 s·3^n com variação até 1 h, deduplica por tipo e lead, respeita a dependência (completar só depois do registro) e mescla em vez de sobrescrever. A tela só diz "registrado" quando o servidor aceitou; sem confirmação mostra o aviso de contato pendente, e com recusa definitiva mostra que o contato não foi registrado. O estado do e-mail vem da ação `status`. `registro.ts` (gravação direta no banco) foi removido.

**Aprofundamento opcional (`Aprofundamento.tsx`, `aprofundamento-form.ts`):** aparece depois do relatório liberado. Camada 1: rotina da área, volume com unidade e período, consequência. Camada 2 (opcional): tempo por ocorrência, ferramentas, dados, indicador, papel na decisão. Dá para pular, voltar, corrigir e responder "Não sei"; o rascunho fica na sessão (sem dado pessoal: e-mail e telefone digitados são recusados), a revisão só cresce e o que foi salvo vai à função com a chave. Esforço = ocorrências × minutos ÷ 60, com entradas e premissas na tela e **nunca em dinheiro**; sem volume ou tempo a tela diz o que falta. Carrega sob demanda (`import()` no relatório).

**Testes novos:** `captura.test.ts` (20), `aprofundamento.test.ts`, `aprofundamento-form.test.ts` (12); `funcao.test.ts` (32); `captura.sql` e `seguranca.sql`; 11 E2E novos ou reescritos (fluxo completo com os pedidos à função, queda de rede com recarregar e reenvio idempotente, recusa definitiva, aprofundamento: camadas 1 e 2, 200 × 15 ÷ 60 = 50 h, validação, rascunho, pendente e recusado). **Resultados (L):** unidade 205, banco OK, função 32, E2E 178 passando e 2 pulados (Chromium desktop + WebKit celular), lint, tipos e knip limpos.

**Peso:** `/ai-score/resultado/` e exemplo 223,9 kB (teto 225), avaliação 217,7, painel 226,4 (teto 240); chunk sob demanda do aprofundamento 8,6 kB (teto 30). JS total 272,3 → 295,7 kB, teto 290 → 300 kB: o `import()` do aprofundamento faz o Turbopack criar mais uma cópia do conteúdo do questionário (mesmo fenômeno da Fase 2, medido com e sem o `import()`); cada visitante baixa uma cópia só. O `next/dynamic` custava 1,5 kB a mais na rota do que o `import()` direto, por isso o relatório usa o `import()` direto.

**Decisões e desvios:**

- O `Relatorio` sob demanda só na rota de resultado foi testado e **descartado**: piorou o peso total e do exemplo.
- A tela do relatório usa o `import()` direto e um elemento devolvido pelo módulo sob demanda (a regra de lint `static-components` não aceita componente vindo de um hook).
- "Não sei" no aprofundamento é um campo próprio (`naoSei`), nunca um valor zero; unidade e período são parte do volume.
- Nada do aprofundamento vai ao link do resultado, à IA ou ao analytics.

**Pendências desta fase:**

- Produção (P, nenhum item feito): aplicar as migrações 0005 a 0008 antes do site, publicar a função, definir `PROCESSADOR_SEGREDO`, habilitar pg_cron/pg_net/Vault e o agendamento, testar o envio real pelo Resend (aceito não é entregue).
- Prints de referência da landing `/ai-score/` ainda a regenerar no Docker (a memória da VM estava ocupada por outras pilhas do Supabase; tentar de novo com `--workers=1`).
- Eventos de analytics do aprofundamento ficam para a Fase 5.
- Textos novos a revisar com o Diego: `ai-score-aprofundamento.ts` (perguntas, opções, premissas do esforço), avisos de contato e de e-mail em `ai-score-questionario.ts`.

### Fase 4 (01/11) — feita

**Prioridades e indicações (`recomendar.ts`, `regras.ts`):** só dimensões abaixo de 70 são lacunas (tudo em 70 ou mais não vira lacuna); um desafio que as respostas contradizem (por exemplo, "não sabemos por onde começar" com Estratégia em 70) não soma pontos e vira validação; a prioridade de uma solução é a da dimensão mais frágil que aponta para ela (somar fazia soluções com duas dimensões passarem à frente de quem cobre a mais fraca); uma solução só é **indicada** com evidência direta e condições atendidas, senão fica **a investigar** (pedido de agentes sem processo mapeado, dados e regras; Performance sem nada em uso para medir; falta de liderança sem sinal de falta de capacitação); pode não haver nenhuma solução; no máximo duas. Empates se decidem por critério dito na tela (desafio declarado, resposta mais baixa, evidência direta, ordem de dependência), nunca pela posição na lista. A regra fixa para iniciantes saiu: a Governança, quando é a mais fraca, é a primeira.

**Síntese (`sintese.ts`, `ai-score-sintese.ts`):** resumo executivo com as seis perguntas (cenário e cobertura; o que merece atenção; respostas que sustentam, citando o tema e a alternativa literal; consequência declarada × hipótese; primeira ação; o que validar), oportunidades a investigar (cada desafio como hipótese, com perguntas, condições e a situação frente às respostas), indicações com evidência e condições, e o **roteiro de 90 dias por dependências** (problema, responsável e indicador → linha de base → controles, capacitação e dados quando há lacuna → piloto → avaliação → ampliação, com reavaliação). Cada etapa tem ação, responsável sugerido (um papel, nunca um nome), entrega verificável, indicador e dependência; nenhuma meta, prazo de implantação ou valor é inventado. Tudo vai na devolutiva (JSON, ~25 kB), que alimenta tela, PDF, e-mail e a mensagem do WhatsApp.

**Tela:** o resumo executivo abre o resultado (no lugar dos três cartões por dimensão, que repetiam frases fixas por dimensão); lacunas, alertas e oportunidades são saídas separadas; roteiro e indicações mostram fases, campos, evidências e condições. O convite à Análise Estratégica reconhece o resultado, diz para que serve a conversa e mostra, antes do clique, o texto exato da mensagem do WhatsApp (só nota, nível, lacunas e soluções em avaliação).

**PDF (`pdf/escritor.ts`, `pdf/relatorio.ts`, `pdf/baixar.ts`):** download direto, gerado no navegador, carregado só no clique (10,2 kB gzip); PDF 1.4 com Helvetica em WinAnsi, texto de verdade, quebra de linha, paginação, rodapé e contador por página. Falha com erro para qualquer glifo sem mapa (há uma tabela de substituição declarada). Verificado com `pdfjs-dist` (dependência só de teste): as larguras batem exatamente com as do leitor, nada passa da margem, acentos voltam, bytes iguais para o mesmo relatório; olhei as oito páginas do PDF do exemplo renderizadas. A impressão segue como alternativa.

**Acesso (migração 0009, `captura.sql`):** tabela `tokens` (só o hash), `ler_relatorio` (anônimo, só leitura, devolve nome, empresa e a avaliação a que o token pertence), `revogar_tokens` (admin), `lead_liberado` restrita aos leads antigos sem chave e com menos de 180 dias. O e-mail leva um token de leitura (180 dias) e outro de preferências (365), sem o id do lead; o site lê o token, confere a avaliação, tira o token da barra, não o guarda e não o compartilha.

**Testes novos:** `sintese.test.ts` (18, inclui varredura de 300 vetores para a topologia do roteiro), `pdf.test.ts` (16, com mutação na tabela de larguras e na margem do rodapé), reescrita das recomendações e das análises em `ai-score.test.ts`, 9 asserções de banco para tokens, 1 teste de função para o token e o 503, e E2E (download real do PDF em Chromium e WebKit celular, token no link, convite com prévia, roteiro e indicações). **Resultados (L):** unidade 242, banco OK (129 asserções), função 33, E2E 178 passando e 2 pulados, lint, tipos e knip limpos.

**Peso:** `/ai-score/resultado/` e exemplo 224,2 kB (teto 225); avaliação 216,9; painel 226,8 (teto 240); chunks sob demanda: motor 10,8, PDF 10,2, aprofundamento 9,2 (teto 30 cada). JS total 312,8 kB, teto 290 → 320 kB (o total soma todos os chunks, inclusive os sob demanda e as cópias do conteúdo do questionário; o que vale para o visitante é o teto por página e por chunk).

**Decisões e desvios:**

- Mantive `ANALISE_ATUAL = "2"`: a versão 2 nunca foi publicada (só a v1 está em produção), então as regras novas da Fase 4 entram nela.
- Não indico solução em resultado parcial (menos de 10 respostas, ou dimensão vazia).
- O texto das lacunas empatadas aparece nas duas dimensões do empate; o critério vale para as duas.
- O texto `ai-score-sintese.ts` (hipóteses, perguntas, etapas, responsáveis) é novo e fica a revisar com o Diego.

**Pendências desta fase para as seguintes:**

- Página de preferências (`/ai-score/preferencias/`) e botão de revogar o link no painel: Fase 5.
- Aplicar a migração 0009 e o código da função em produção, e confirmar o envio real: ver `docs/deploy.md` (Fase 7).
- Prints de referência (visuais) a regenerar no Docker depois das mudanças de tela das Fases 4 e 6.
