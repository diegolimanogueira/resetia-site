-- 0007 · Consentimentos por finalidade e canal, só acrescentando eventos.
--
-- Receber o relatório, receber conteúdo e pedir uma análise com especialistas são escolhas diferentes, e cada uma vale
-- para um canal. Cada escolha é um evento que nunca é editado nem apagado (a mais recente de cada finalidade e canal
-- vale), com a versão do texto que a pessoa viu. A equipe só consegue registrar revogação; conceder, nunca.
-- ADITIVA. Reversão: a tabela pode ficar sem uso; nada nas outras tabelas depende dela.

create table public.consentimentos (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads (id) on delete cascade,
  finalidade text not null check (finalidade in ('relatorio-email', 'conteudo-email', 'contato-analise')),
  canal text not null check (canal in ('email', 'whatsapp', 'ligacao')),
  concedido boolean not null,
  -- formulario: marcou ou desmarcou no site; preferencias: mudou depois, pelo link do e-mail; admin-revogacao: a
  -- equipe registrou que a pessoa pediu para parar; legado: gravado antes deste registro, a partir das marcações da época.
  fonte text not null check (fonte in ('formulario', 'preferencias', 'admin-revogacao', 'legado')),
  -- Versão do texto mostrado na hora (src/content/ai-score-consentimentos.ts).
  texto_versao text not null check (char_length(texto_versao) between 1 and 60),
  -- Identificador do evento, gerado por quem o registra: reenviar o mesmo evento não o duplica.
  evento_id uuid not null unique,
  criado_em timestamptz not null default now(),
  -- Só a finalidade 'contato-analise' passa por ligação e WhatsApp.
  check (canal = 'email' or finalidade = 'contato-analise')
);

create index consentimentos_lead on public.consentimentos (lead_id, finalidade, canal, criado_em desc);

-- A pessoa pode ser contatada por esta finalidade e canal? A escolha mais recente vale; sem registro, não. WhatsApp e
-- ligação exigem também que exista um número informado.
create function public.elegivel(p_lead uuid, p_finalidade text, p_canal text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (
      select c.concedido
      from public.consentimentos c
      where c.lead_id = p_lead and c.finalidade = p_finalidade and c.canal = p_canal
      order by c.criado_em desc, c.id desc
      limit 1
    ),
    false
  )
  and (p_canal = 'email' or exists (select 1 from public.leads l where l.id = p_lead and l.whatsapp is not null));
$$;

-- Leads anteriores: só o que a pessoa de fato marcou ou pediu, nada além. O "relatório por e-mail" vale para quem
-- completou a etapa 2 (o formulário dizia que o relatório também ia para o e-mail); quem só viu o resultado na tela
-- não tem registro. Contato por WhatsApp e ligação, só para quem marcou o pedido e informou o número.
insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
select id, 'relatorio-email', 'email', true, 'legado', 'legado-2026-10-28', gen_random_uuid()
from public.leads where empresa is not null;

insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
select id, 'conteudo-email', 'email', true, 'legado', 'legado-2026-10-28', gen_random_uuid()
from public.leads where consentimento_marketing;

insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
select id, 'contato-analise', 'email', true, 'legado', 'legado-2026-10-28', gen_random_uuid()
from public.leads where pediu_contato;

insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
select l.id, 'contato-analise', c.canal, true, 'legado', 'legado-2026-10-28', gen_random_uuid()
from public.leads l cross join (values ('whatsapp'), ('ligacao')) as c (canal)
where l.pediu_contato and l.whatsapp is not null;

-- Quando a pessoa pediu a conversa. Nos leads anteriores o momento exato não foi guardado: fica nulo, sem inventar.
alter table public.leads add column pedido_conversa_em timestamptz;

-- Permissões: a equipe lê e só registra revogação; a função grava os eventos do formulário e das preferências.

revoke all on public.consentimentos from anon, authenticated;
grant select on public.consentimentos to authenticated;
grant insert (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id) on public.consentimentos to authenticated;
alter table public.consentimentos enable row level security;
create policy "admin le consentimentos" on public.consentimentos for select to authenticated using ((select public.eh_admin()));
create policy "admin so registra revogacao" on public.consentimentos for insert to authenticated
  with check ((select public.eh_admin()) and concedido = false and fonte = 'admin-revogacao');

-- `elegivel` é só da função (service_role): aberta a qualquer usuário logado, permitiria sondar leads por id. O painel
-- consulta pela função própria de contatos permitidos (0010), que confere se quem pergunta é admin.
revoke execute on function public.elegivel(uuid, text, text) from public, anon, authenticated;
