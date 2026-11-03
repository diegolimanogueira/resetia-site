-- Atualização dos consentimentos dos leads criados pelo caminho antigo depois da 0007.
--
-- A 0007 preencheu os consentimentos uma vez, na hora em que rodou. O site e a função antigos não gravam
-- consentimento, então todo lead criado por eles depois disso fica sem registro, e o painel novo (que só libera
-- contato com consentimento registrado) trataria como "não quer contato" quem marcou o pedido. Este script repete a
-- regra da 0007, só para leads que ainda NÃO têm nenhum registro: reflete o que a pessoa marcou, nada além. Pode
-- ser rodado mais de uma vez: quem já tem registro não é tocado.
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
select l.id, x.finalidade, x.canal, true, 'legado', 'legado-2026-10-28', gen_random_uuid()
from public.leads l
cross join lateral (values
  ('relatorio-email', 'email',    l.empresa is not null),
  ('conteudo-email',  'email',    l.consentimento_marketing),
  ('contato-analise', 'email',    l.pediu_contato),
  ('contato-analise', 'whatsapp', l.pediu_contato and l.whatsapp is not null),
  ('contato-analise', 'ligacao',  l.pediu_contato and l.whatsapp is not null)
) as x (finalidade, canal, vale)
where x.vale
  and l.canal = 'legado'
  and not exists (select 1 from public.consentimentos c where c.lead_id = l.id);
