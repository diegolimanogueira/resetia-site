-- 0011 · PENDENTE (não aplicar junto das migrações 0005 a 0010).
--
-- O admin deixa de ler `leads.whatsapp` e `leads.chave_hash` direto da tabela. O número só chega ao painel por
-- `contatos_permitidos()`, que o devolve quando a pessoa escolheu ser contatada por WhatsApp ou por ligação. É o que
-- faz a regra "WhatsApp e ligação só a pedido" valer no BANCO, e não só nos botões da tela.
--
-- Condição para aplicar: o painel publicado já não seleciona `whatsapp` (ele passou a usar `tem_numero` e `telefone`
-- de `contatos_permitidos()`, desde o commit que introduziu esta pasta). Aplicar antes disso faz a lista do admin
-- falhar com "permission denied for column whatsapp". Ordem em docs/deploy.md.
--
-- Reversão: `grant select on public.leads to authenticated;` devolve a leitura da tabela inteira.

revoke select on public.leads from authenticated;

grant select (
  id, avaliacao_id, criado_em, atualizado_em, nome, email, email_pessoal, empresa, pediu_contato,
  consentimento_marketing, status, notas, ambiente, responsavel, proximo_contato, relatorio_enviado_em,
  pedido_conversa_em, primeira_resposta_em, canal
) on public.leads to authenticated;
