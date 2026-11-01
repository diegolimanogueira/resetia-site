# Provas, casos e demonstrações

Regra do projeto e do pacote da fase 6: o site não inventa cliente, depoimento, caso, métrica, certificação, integração entregue nem garantia de ganho. Onde não há prova publicável, há uma demonstração **rotulada como ilustrativa**. Este documento lista o que o site afirma hoje, de onde vem, o que ele **não** afirma, e o que só o proprietário pode fornecer para o site passar a mostrar casos reais.

Pesquisa feita em 01/11/2026 no repositório (`docs/`, `design/handoff/`, `src/content/`): **não há caso com resultado medido, depoimento autorizado nem métrica de cliente**. O que existe de prova está no inventário abaixo.

## O que o site afirma hoje

| Afirmação                                                                                                   | Onde aparece                                                      | Origem                                                                                                                                    | O que ela diz, e o que não diz                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Equipes treinadas em empresas como IEL, Fortes Tecnologia, FortesPay, Longevidade Saudável, entre outras." | Faixa de prova da home (`home.prova`)                             | Material do proprietário: `design/handoff/home.dc.html`, `docs/decisions.md`; o comentário em `home.prova` registra "validada pelo Diego" | Diz que houve **treinamento**. Não diz ganho, economia, adoção nem resultado. Os nomes só aparecem nessa faixa e não são usados como prova de resultado operacional.      |
| Exemplo do AI Score (nota, leitura, plano)                                                                  | Home (bloco de demonstração), `/ai-score/` e `/ai-score/exemplo/` | Respostas hipotéticas em `src/content/ai-score.ts` (`exemplo`), calculadas no build com o mesmo motor da avaliação                        | Rotulado: "Exemplo ilustrativo, com respostas hipotéticas: não é uma empresa real." A nota é a do motor, mas a empresa não existe.                                        |
| Fichas dos 30 agentes (entrada, tarefa, saída, revisão humana, indicador)                                   | `/agentes-de-ia/` (`<details>` por agente)                        | Desenho da Reset (campo `ficha` de cada agente em `src/content/agentes.ts`)                                                               | Descreve como o agente **seria desenhado**. O aviso na página diz que nada ali significa uma integração já entregue. O indicador é uma medida possível, não um resultado. |
| "Para começar" das cinco soluções (problema, entrega, pré-requisitos, próximo passo)                        | `/solucoes/<slug>/`                                               | Desenho da Reset (`solucoes.lista[].comecar`)                                                                                             | Sem prazo, ganho ou garantia; um teste (`content.test.ts`) barra "garantia", "100%", "em N dias" e "economia de".                                                         |

O teste `não há métricas, depoimentos ou promessas de economia inventados` (`tests/unit/content.test.ts`) vigia o conteúdo; ele não substitui a revisão do proprietário.

## O que o proprietário precisa confirmar hoje

1. **Nomes na faixa de prova.** Confirmar por escrito que IEL, Fortes Tecnologia, FortesPay e Longevidade Saudável autorizam aparecer no site como empresas em que houve treinamento, e que "entre outras" é verdadeiro. Sem a autorização, a alternativa é a frase sem nomes ("Equipes treinadas em empresas de diferentes setores").
2. **Certificações e formação (não estão no site).** O protótipo de design (`design/handoff/sobre.dc.html`) cita Oracle AI, CSPO, ACSM, FIAP e IBMEC, mas o conteúdo publicado (`src/content/sobre.ts`) não repete nada disso. Se forem entrar no site, ter à mão os certificados e os comprovantes de matrícula ou conclusão antes, e só então escrever a copy.
3. **Região do Supabase.** A política de privacidade afirma "servidores em São Paulo" (texto de 28/10). Conferir no painel do projeto `site_resetia` e, se for outra, corrigir `src/content/privacidade.ts`.
4. **Prazo de guarda dos dados.** A política diz que **não há prazo automático de apagamento** (é o que o sistema faz). Se houver decisão de prazo, ela precisa virar rotina (função SQL agendada) antes de virar texto.
5. **Revisão jurídica da política.** Bases legais por finalidade (legítimo interesse no registro e na análise; atendimento ao pedido no relatório; consentimento no contato e nos conteúdos) foram escritas por nós e não passaram por advogado.
6. **Antes de ligar o GA4.** A política promete avisar quando a ferramenta de métricas depender de cookies. Se for usar GA4 em vez do Umami, atualizar a seção "O que este site coleta" **antes** de definir `NEXT_PUBLIC_ANALYTICS_ID` (`docs/medicao.md`).

## O que o proprietário pode fornecer para termos casos reais

Um caso só entra no site com **todos** os campos abaixo. Falta um campo, o caso não entra (nem como "resumo").

| Campo                 | O que precisa vir                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Autorização           | Aceite por escrito da empresa para usar nome, logo e o texto do caso, com a data e quem autorizou                    |
| Contexto              | Segmento, porte e área envolvida (Marketing, Vendas ou Customer Success), no nível de detalhe que a empresa permitir |
| Problema              | O que a empresa queria resolver, nas palavras dela                                                                   |
| O que a Reset fez     | Qual das cinco soluções, o escopo, o período e o que foi entregue (sem listar integração que não existiu)            |
| Medição               | Indicador, valor **antes** e **depois**, período, como foi medido e quem mediu. Número sem fonte não entra           |
| Limites               | O que não foi medido, o que mudou ao mesmo tempo e o que não se pode atribuir à Reset                                |
| Depoimento (opcional) | Frase literal, nome e cargo de quem a disse, autorização para citar                                                  |
| Restrições            | O que a empresa pediu para não aparecer                                                                              |

Proposta de implementação quando houver o primeiro caso (não existe hoje, nada foi criado): `src/content/casos.ts`, com os campos acima como obrigatórios no tipo (`autorizadoEm`, `fonteDoNumero`, `limites`), uma seção de casos que só renderiza o que existir, e um teste que reprova um caso sem autorização ou sem fonte do número. Enquanto não houver caso, a faixa de prova e as demonstrações ilustrativas continuam como estão.

## Depoimentos e logos

Não há depoimento no site e nenhum foi criado. Logo de cliente só com a mesma autorização do caso. O que a faixa de prova usa hoje são **nomes em texto**, não logos.
