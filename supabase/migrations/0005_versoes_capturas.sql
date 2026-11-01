-- 0005 · Versões do método e da análise, canal de entrada, permissões por coluna e o histórico dos relatórios.
--
-- ADITIVA: nada é apagado nem reinterpretado. Avaliações e leads anteriores ficam com versao_metodo e versao_analise
-- nulos (o método 1 já valia, mas a versão da análise daquela época não foi registrada) e canal 'legado'.
-- Ordem de publicação: esta migração vem ANTES do site novo (o site passa a gravar versao '2').
-- Reversão: as colunas novas podem ficar sem uso; o CHECK de `versao` volta a ('1') só se não houver linhas com '2'.

-- Avaliações ------------------------------------------------------------------------------------------------------

alter table public.avaliacoes
  add column versao_metodo text check (versao_metodo ~ '^[1-9][0-9]{0,2}$'),
  add column versao_analise text check (versao_analise ~ '^[1-9][0-9]{0,2}$'),
  -- 'legado': gravada direto pelo navegador (versões antigas do site); 'funcao': gravada pela função, que recalcula a nota.
  add column canal text not null default 'legado' check (canal in ('legado', 'funcao')),
  -- Nota, nível e cobertura conforme calculados pela função naquele momento (o que o painel mostra como histórico).
  add column resultado jsonb check (resultado is null or length(resultado::text) <= 4000);

alter table public.avaliacoes drop constraint if exists avaliacoes_versao_check;
-- `versao` é o formato do link (`v=`), não a versão do método: '1' (até 31/10/2026) e '2'.
alter table public.avaliacoes add constraint avaliacoes_versao_check check (versao in ('1', '2'));

-- Leads -----------------------------------------------------------------------------------------------------------

alter table public.leads
  -- Hash (sha256, hexadecimal) da chave secreta que o navegador gera para este lead. Quem prova conhecer a chave pode
  -- completar o lead e gravar o aprofundamento; o id, que é público, não autoriza escrita.
  add column chave_hash text check (chave_hash is null or chave_hash ~ '^[0-9a-f]{64}$'),
  add column canal text not null default 'legado' check (canal in ('legado', 'funcao'));

-- O anônimo grava só as colunas que o site antigo enviava -------------------------------------------------------------
-- Antes, o INSERT valia para a tabela inteira e o anônimo podia preencher até relatorio_enviado_em (o que impedia o
-- envio do relatório), responsavel e proximo_contato. Agora só as colunas abaixo; as demais ficam com o padrão do
-- banco (ou do gatilho). Clientes antigos continuam funcionando, porque mandam exatamente estas colunas.

revoke insert on public.avaliacoes, public.leads from anon;
grant insert (
  id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, areas,
  codigo, versao, origem, ambiente
) on public.avaliacoes to anon;
grant insert (
  id, avaliacao_id, nome, email, email_pessoal, empresa, whatsapp, pediu_contato, consentimento_marketing, ambiente
) on public.leads to anon;

create or replace function public.lead_ao_gravar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_em := now();
    new.status := 'novo';
    new.notas := null;
    -- Campos do CRM e do envio do relatório são do servidor e da equipe, nunca de quem cria o lead.
    new.responsavel := null;
    new.proximo_contato := null;
    new.relatorio_enviado_em := null;
  end if;
  new.atualizado_em := now();
  return new;
end $$;

-- completar_lead (caminho dos clientes antigos): só preenche o que está vazio, só para leads criados pelo próprio
-- navegador (sem chave), por 7 dias (antes 30), e nunca sobrescreve empresa ou WhatsApp já informados.
create or replace function public.completar_lead(
  p_id uuid,
  p_empresa text,
  p_whatsapp text default null,
  p_pediu_contato boolean default false,
  p_marketing boolean default false
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  alterados integer;
begin
  update public.leads set
    empresa = coalesce(empresa, nullif(btrim(p_empresa), '')),
    whatsapp = coalesce(whatsapp, nullif(p_whatsapp, '')),
    pediu_contato = pediu_contato or coalesce(p_pediu_contato, false),
    consentimento_marketing = consentimento_marketing or coalesce(p_marketing, false)
  where id = p_id
    and chave_hash is null
    and canal = 'legado'
    and criado_em > now() - interval '7 days';
  get diagnostics alterados = row_count;
  return alterados = 1;
end $$;

-- Relatórios (histórico) ---------------------------------------------------------------------------------------------
-- A devolutiva é guardada como foi entregue, com as versões do método e da análise: o painel e o e-mail mostram este
-- registro, e uma nova leitura com as regras atuais é sempre identificada como nova. Só a função grava (service_role);
-- ninguém altera nem apaga por aqui (apagar um lead leva os relatórios junto, por cascata).

create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  avaliacao_id uuid not null references public.avaliacoes (id) on delete cascade,
  criado_em timestamptz not null default now(),
  motivo text not null check (motivo in ('registro', 'aprofundamento')),
  versao_metodo text not null check (versao_metodo ~ '^[1-9][0-9]{0,2}$'),
  versao_analise text not null check (versao_analise ~ '^[1-9][0-9]{0,2}$'),
  resultado jsonb not null check (length(resultado::text) <= 4000),
  devolutiva jsonb not null check (length(devolutiva::text) <= 65536),
  dicas jsonb check (dicas is null or length(dicas::text) <= 20000),
  -- sha256 do conteúdo canônico: o mesmo relatório reenviado não vira duas linhas.
  hash text not null check (hash ~ '^[0-9a-f]{64}$'),
  unique (lead_id, hash)
);

create index relatorios_lead on public.relatorios (lead_id, criado_em desc);

revoke all on public.relatorios from anon, authenticated;
grant select on public.relatorios to authenticated;
alter table public.relatorios enable row level security;
create policy "admin le relatorios" on public.relatorios for select to authenticated using ((select public.eh_admin()));
