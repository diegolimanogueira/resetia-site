# Medição do RESET AI Score

O que medir, de onde vem cada número e qual é o denominador de cada taxa. **Hoje o analytics está desligado em produção** (`NEXT_PUBLIC_ANALYTICS_ID` vazio): nenhuma taxa que parta de visitas pode ser apresentada como medida. O painel mostra esse estado, e os números de lead a partir do banco continuam valendo.

## Como ligar

1. Escolha o provedor: `NEXT_PUBLIC_ANALYTICS_PROVIDER=umami` (padrão) ou `ga4`.
2. Defina `NEXT_PUBLIC_ANALYTICS_ID` (ID do site no Umami, ou o `G-…` do GA4) e, só para Umami próprio, `NEXT_PUBLIC_ANALYTICS_HOST`. No DigitalOcean, em `.do/app.yaml`, variável de build (`scope: BUILD_TIME`).
3. Publique e confira no painel do provedor que `ai_score_abertura` aparece ao abrir `/ai-score/avaliacao/`.

O link do resultado leva as respostas e, nos e-mails, um token no **hash** da URL. O hash nunca vai ao provedor: no Umami, o script é carregado com `data-exclude-hash`; no GA4, a visita de página é enviada à mão (`page_view` com `page_location` sem o hash, só com origem, caminho e parâmetros de campanha).

## O que um evento pode levar

Nenhum evento leva nome, e-mail, telefone, texto digitado, resposta privada, id de lead ou token. `track()` só aceita eventos do catálogo (`src/lib/analytics-eventos.ts`) e, de cada um, só as chaves declaradas, com valores curtos de vocabulário controlado (número, booleano ou texto de letras, números e `_ . : / + -`; qualquer valor que lembre e-mail, telefone, UUID ou token é descartado). Eventos marcados como únicos contam uma vez por sessão (ou uma vez por avaliação), mesmo que a tela renderize de novo.

A atribuição de origem (UTM, referrer, página de entrada) fica com o lead, no banco, com limite de tamanho, e não vai junto dos eventos.

## Eventos e denominadores

| Evento                           | O que mede                                                     | Denominador da taxa                |
| -------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| `ai_score_abertura`              | Abriu o questionário                                           | visitas de `/ai-score/` (provedor) |
| `ai_score_primeira_interacao`    | Respondeu a primeira pergunta de segmentação                   | aberturas                          |
| `ai_score_inicio`                | Concluiu a segmentação e foi para as perguntas                 | aberturas                          |
| `ai_score_etapa`                 | Avançou uma etapa (`etapa`, `total`)                           | segmentações concluídas            |
| `ai_score_concluido`             | Terminou o questionário (`escopo`, `nivel`, `indice`, `areas`) | segmentações concluídas            |
| `ai_score_contato`               | Contato (nome e e-mail) **aceito pelo servidor**               | questionários concluídos           |
| `ai_score_lead`                  | Pediu o relatório completo (empresa informada)                 | contatos aceitos                   |
| `ai_score_aprofundamento_inicio` | Começou o aprofundamento                                       | relatórios liberados               |
| `ai_score_aprofundamento_salvo`  | Salvou o aprofundamento (`camada`)                             | aprofundamentos iniciados          |
| `ai_score_aprofundamento_pulado` | Escolheu não responder agora                                   | relatórios liberados               |
| `ai_score_download`              | Baixou o PDF ou imprimiu (`formato`)                           | relatórios liberados               |
| `ai_score_email_aceito`          | O provedor de e-mail **aceitou** o relatório                   | relatórios liberados               |
| `ai_score_email_falhou`          | O envio por e-mail falhou (`estado`)                           | relatórios liberados               |

"Aceito" quer dizer que o servidor (ou o provedor de e-mail) aceitou; não quer dizer entregue na caixa de entrada, que nenhum desses sistemas confirma. Os cliques de conversa continuam como `cta_diagnostico_gratuito`, `cta_whatsapp`, `cta_pagina_diagnostico`, `cta_ai_score` e `cta_teste_spotlite`, sempre com a origem (`data-cta`) e a página.

## O funil comercial (visita → cliente)

Cada etapa tem uma fonte própria; só a primeira depende do analytics.

| Etapa                       | Fonte                                                                                                             | Observação                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Visita                      | provedor de analytics                                                                                             | desligado hoje                                  |
| Diagnóstico concluído       | tabela `avaliacoes` (inclui quem não deixou contato)                                                              | independe do analytics                          |
| Contato                     | tabela `leads`                                                                                                    | só o que o servidor aceitou                     |
| Pedido de conversa          | `leads.pediu_contato`, com o momento em `pedido_conversa_em`                                                      | leads anteriores a 01/11/2026 não têm o momento |
| Primeira resposta           | `leads.primeira_resposta_em` (primeira atividade humana da equipe: ligação, WhatsApp, e-mail ou reunião)          | nota interna e registro do sistema não contam   |
| Reunião, proposta, desfecho | tabela `marcos` (`reuniao-agendada`, `reuniao-realizada`, `proposta-enviada`, `ganho`, `perdido`, `sem-resposta`) | registrados pela equipe                         |
| Cliente                     | `leads.status = cliente` e marco `ganho`                                                                          |                                                 |

Receita nunca é deduzida de uma mudança de status: o `valor_informado` de um marco só existe se a equipe o digitar, só admin lê e o CSV não o leva.

### Como ler a conversão

O indicador "Conversão em cliente" mostra **n de N** sobre **todos os leads, descartados incluídos**. A taxa sobre os leads que não foram descartados aparece à parte, com esse nome. Antes de 01/11/2026 o painel dividia só pelos não descartados, o que escondia o descarte.

## Para quem lê os números

- Uma taxa só vale com o denominador ao lado. Lotes pequenos (dezenas de leads) mostram direção, não estatística.
- `ai_score_contato` conta contato aceito pelo servidor; a diferença para o que o navegador tentou enviar fica na fila local e no contador do painel.
- Quando o analytics está desligado, o painel diz isso e não calcula taxas de visita.
