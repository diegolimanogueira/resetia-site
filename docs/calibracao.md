# Calibração do RESET AI Score

Os números abaixo são **propostas iniciais**, escolhidas por julgamento e por teste de coerência. Nenhum foi calibrado contra resultado de cliente: não há, no material do projeto, caso medido nem entrevista (`docs/provas.md`). Este documento diz o que cada número decide, onde ele mora, como mudá-lo sem reescrever a história das avaliações já gravadas e que evidência justificaria mudá-lo.

## Três coisas que mudam de formas diferentes

| O que                       | Onde mora                                                 | Para mudar                                                                 | O que acontece com o que já foi gravado                                                                                     |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Método** (a nota)         | `src/lib/ai-score/metodo/metodo-1.ts`, congelado          | Criar `metodo-2.ts` e subir `METODO_ATUAL`. Nunca editar o método 1.       | Cada avaliação guarda a versão do método e continua com a nota que teve. Só notas do mesmo método se comparam.              |
| **Análise** (texto e regra) | `src/lib/ai-score/regras.ts`, `src/content/ai-score-*.ts` | Mudar e subir `ANALISE_ATUAL` em `versoes.ts`                              | O relatório entregue fica como foi entregue (snapshot em `relatorios`); links antigos mostram a leitura atual, com rótulo.  |
| **Pontuação comercial**     | `regras.ts` → `leadScore`                                 | Mudar o número. Não há versão: ela é recalculada sempre que o painel abre. | Muda o que o painel mostra nos cartões e na gaveta do lead; a pontuação é calculada na tela e nada dela é gravado no banco. |

Depois de mexer em `src/lib/ai-score` ou em `src/content/ai-score*`, rode `npm run funcao:nucleo` (o CI confere) e republique a função (`docs/deploy.md`).

## Método 1 (a nota; congelado)

| Parâmetro              | Valor                                                                                        | O que decide                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pontos por alternativa | 0, 15, 40, 70, 100                                                                           | A distância entre "nada" e "consolidado". Não é linear de propósito: o último degrau pesa mais que o primeiro.                                            |
| Peso da menor dimensão | 2 (a menor conta em dobro: nota = (soma das seis + menor) ÷ 7)                               | Quanto uma dimensão fraca puxa a nota para baixo. É uma escolha de método (maturidade é limitada pelo elo mais fraco), publicada como tal na metodologia. |
| Mínimo de respostas    | 10 de 12                                                                                     | Abaixo disso não há nota, só leitura parcial. Com 10 ou 11 respostas a nota é **estimada** e a tela diz.                                                  |
| "Não sei"              | vira estimativa, não zero                                                                    | `[4,0,…]` dá 86 completo; `[4,null,…]` dá 100 como estimativa, com cobertura incompleta à vista. Teste de regressão obrigatório.                          |
| Níveis                 | 0–19 inicial; 20–39 explorando; 40–59 em desenvolvimento; 60–79 estruturada; 80–100 avançada | Os cortes do rótulo. O texto de cada nível está em `ai-score-questionario.ts`.                                                                            |

Uma nota não é uma medida física: dois pontos de diferença não significam diferença real de maturidade. A tela e o PDF mostram faixa e cobertura para isso.

## Análise (`regras.ts`)

| Parâmetro                  | Valor                                                              | O que decide                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `faixas`                   | média desde 40, alta desde 70                                      | Se a leitura de uma dimensão é "a estruturar", "em evolução" ou "consolidada".                                                                                     |
| `prioridades`              | crítica < 20, alta < 40, média < 70                                | O rótulo de prioridade de cada dimensão.                                                                                                                           |
| `lacunaAbaixoDe`           | 70                                                                 | **Só dimensão abaixo disto é lacuna.** Com tudo em 70 ou mais, não há lacuna e nenhuma solução é indicada por lacuna.                                              |
| `forteMinimo`              | 50                                                                 | Ponto forte só com a maior dimensão em 50 ou mais e acima da menor.                                                                                                |
| `alertas.pontosCegos`      | 2                                                                  | Quantas das 12 respostas centrais precisam ser "Não sei" (no total, não por dimensão) para o alerta de pontos cegos.                                               |
| `alertas.desequilibrio`    | 50                                                                 | Diferença, em pontos, entre a maior e a menor dimensão para o alerta de desequilíbrio.                                                                             |
| `ordemDependencia`         | estratégia → governança → dados → processos → pessoas → resultados | **Último** critério de desempate entre lacunas iguais, dito na tela. Nunca é a ordem do array.                                                                     |
| `pesosLacunas`             | 3, 2, 1                                                            | Pontos de uma solução pela posição da lacuna que ela atende (empates dividem a posição).                                                                           |
| `pesoDesafio`              | 2                                                                  | Pontos por desafio informado, **só se as respostas da dimensão não o contradisserem**. Desafio contradito não soma e vira pergunta de validação.                   |
| `maxSolucoes`              | 2                                                                  | Máximo de soluções indicadas. Pode haver nenhuma.                                                                                                                  |
| `evidenciaDireta`          | mapa solução → dimensões e desafios                                | Uma solução só é **indicada** com evidência direta e condições atendidas; senão fica "a investigar". Um pedido de agentes não prova dados, processos ou controles. |
| `prontidao`                | agent-factory: p5, p7, p9 ≥ 2; performance: p3 ≥ 1                 | A resposta mínima por pergunta para indicar a solução. Abaixo é pendência.                                                                                         |
| `conversa.respostaEmHoras` | 24                                                                 | Quando a fila do painel marca um pedido de conversa como atrasado. Não é compromisso publicado no site.                                                            |

**Regras que não são parâmetros e não devem virar:** nota nunca gerada por IA; nenhuma regra fixa por nível (a "regra do iniciante" saiu); o plano de 90 dias sai de dependências e nunca inventa prazo, meta ou valor.

## Pontuação comercial (`leadScore`)

Três pontuações, nunca somadas numa nota única: **aderência** (quem é), **intenção** (o que pediu) e **oportunidade** (o que já existe de concreto). Cada uma mostra os componentes e o máximo no painel.

| Pontuação        | Componentes e valores                                                                                                                                                                       | Máximo |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Aderência**    | papel (CEO e diretor 10, gestor 9, coordenador 8, especialista 5, outro 2) · porte (até 10: 3; 11–49: 7; 50–199 e 200–499: 10; 500+: 9) · escopo (empresa 5; área 2) · e-mail corporativo 5 | 30     |
| **Intenção**     | horizonte (imediato 15, 3 meses 10, 6 meses 5, explorando 0) · pediu contato 30 · WhatsApp 5 · relatório completo 5                                                                         | 55     |
| **Oportunidade** | desafio informado 5 · solução indicada com evidência 10 · aprofundamento camada 1: 10 · camada 2: 10                                                                                        | 35     |

Limites que a calibração não pode apagar: cargo, porte e e-mail corporativo dizem se a pessoa está no perfil que a Reset atende, **não** provam orçamento nem autoridade (gestores e coordenadores costumam ser patrocinadores internos relevantes). Nota baixa de maturidade pode ser a melhor oportunidade; por isso a maturidade não entra em nenhuma das três.

## Como calibrar: que evidência justifica mudar um número

Hoje não há evidência para mudar nenhum. O que coletar, em ordem de valor:

1. **Entrevistas de 20 a 30 minutos com 8 a 12 respondentes** (de perfis diferentes, pelo menos três de empresas fora do círculo da Reset): pedir que descrevam a operação sem ver a nota e comparar com a leitura entregue. Perguntas: a leitura de cada dimensão bate? Alguma recomendação foi surpresa, e por quê? O que faltou?
2. **Contradições de resposta**: quantos relatórios saem com alerta de divergência entre as duas perguntas da mesma dimensão (diferença de 2 ou mais pontos de alternativa). Muitas contradições indicam pergunta ambígua, e não que a pessoa errou; a correção é reescrever a pergunta (análise ou método novo), nunca esconder o alerta.
3. **Distribuição das notas**: se quase tudo cair numa faixa (por exemplo, quase todos "explorando"), os pontos ou cortes não discriminam. Só vale olhar com um lote que o analytics e o banco sustentem (ver o aviso abaixo).
4. **Concordância das indicações com a conversa**: nas conversas feitas, a solução indicada era a que o especialista também indicaria? Registrar acertos e erros, com o motivo, antes de mexer em `evidenciaDireta` ou `prontidao`.
5. **Conversão por pontuação** (só depois de dezenas de conversas com desfecho): se a intenção e a oportunidade ordenam bem quem vira reunião e proposta. Aderência é a que mais tende a estar errada.

**Aviso de amostra.** Com poucas dezenas de avaliações os números mostram direção, não estatística: uma taxa só vale com o denominador ao lado (`docs/medicao.md`). Com o analytics desligado, nenhuma taxa que parta de visitas pode ser apresentada como medida.

## Procedimento para mudar um número

1. Registre a evidência (entrevista, lote, conversa) e a hipótese no `docs/decisions.md` (ADR curto: o que muda, por quê, o que se espera).
2. **Nota (método):** crie `metodo-2.ts`, suba `METODO_ATUAL`, mantenha o método 1 e seus códigos golden (`tests/unit/versoes.test.ts` falha se o método 1 mudar). Atualize a metodologia publicada e o texto que explica a fórmula. A reavaliação só compara notas do mesmo método.
3. **Análise:** mude `regras.ts` ou o conteúdo, **suba `ANALISE_ATUAL`**, atualize os testes de fidelidade e os oráculos que citam o número, e rode `npm run funcao:nucleo`.
4. **Pontuação comercial:** mude `leadScore`, ajuste os máximos citados no painel e os testes de `lead-score`.
5. Rode `npm run test`, `npm run test:funcao` e `npm run e2e`; republique a função e o site na ordem de `docs/deploy.md`.
6. Registre no ADR o que foi medido depois da mudança, para saber se ela ajudou.

## O que não está calibrado e precisa de decisão do Diego

- O peso 2 da menor dimensão e os pontos 0/15/40/70/100 (ver acima): são escolhas de método publicadas, mas nenhuma entrevista as sustenta.
- Os cortes dos níveis e o corte de lacuna em 70.
- A meta de 24 h para a primeira resposta a um pedido de conversa: depende de quem atende e de quantos pedidos chegam.
- Todo o texto das leituras (`ai-score-analise.ts`), da síntese e do plano (`ai-score-sintese.ts`), do aprofundamento e das fichas dos agentes foi escrito sem revisão de especialista; entra como "a revisar" nos ADRs.
