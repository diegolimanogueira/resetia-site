-- 0008 · Captura atômica e idempotente, e o aprofundamento de uma dor.
--
-- A função `ai-score` (service_role) valida tudo, RECALCULA a nota a partir do código das respostas (o banco não aceita
-- a nota que o navegador enviou) e chama estas funções, que gravam avaliação, lead, consentimentos, relatório e tarefas
-- numa transação só: sem órfãos e sem duplicação, e reenviar o mesmo pedido devolve o mesmo resultado. Quem escreve num
-- lead prova que conhece a chave que o navegador gerou (o hash dela está em leads.chave_hash); o id, que é público,
-- não autoriza escrita. ADITIVA. Reversão: as funções e a tabela podem ficar sem uso.

-- Aprofundamento ---------------------------------------------------------------------------------------------------
-- Uma dor operacional, em duas camadas: a camada 1 (rotina, volume e frequência, consequência) e a camada 2, que o
-- visitante só responde se quiser aprofundar (tempo, ferramentas, dados, indicador e papel na decisão). Dado privado:
-- nunca vai para o link do resultado, nem para a IA, nem para o analytics. Texto aberto tem limite de tamanho.

create table public.aprofundamentos (
  lead_id uuid primary key references public.leads (id) on delete cascade,
  avaliacao_id uuid not null references public.avaliacoes (id) on delete cascade,
  area text not null check (area in ('marketing', 'vendas', 'customer-success')),
  camada smallint not null check (camada in (1, 2)),
  -- Número crescente por lead: uma gravação atrasada (rede, fila) não sobrescreve uma mais nova.
  revisao integer not null check (revisao >= 1),
  rotina text check (rotina is null or rotina ~ '^[a-z0-9-]{1,40}$'),
  rotina_outra text check (rotina_outra is null or char_length(rotina_outra) <= 120),
  volume numeric(9, 2) check (volume is null or (volume > 0 and volume <= 100000)),
  unidade text check (unidade is null or char_length(unidade) between 1 and 40),
  periodo text check (periodo is null or periodo in ('dia', 'semana', 'mes')),
  consequencia text check (consequencia is null or consequencia in ('atraso', 'retrabalho', 'esforco', 'falta-acompanhamento', 'reclamacoes', 'outra')),
  consequencia_outra text check (consequencia_outra is null or char_length(consequencia_outra) <= 200),
  minutos numeric(6, 1) check (minutos is null or (minutos > 0 and minutos <= 600)),
  ferramentas text[] not null default '{}' check (cardinality(ferramentas) <= 8),
  dados text check (dados is null or dados in ('nao-tenho', 'parcial', 'estruturados', 'nao-sei')),
  indicador text check (indicador is null or char_length(indicador) <= 200),
  papel_decisor text check (papel_decisor is null or papel_decisor in ('decido', 'influencio', 'recomendo', 'nao-participo')),
  -- Campos respondidos com "Não sei" (rotina, volume, consequencia, minutos, dados): diferente de não ter respondido.
  nao_sei text[] not null default '{}' check (cardinality(nao_sei) <= 8),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

revoke all on public.aprofundamentos from anon, authenticated;
grant select on public.aprofundamentos to authenticated;
alter table public.aprofundamentos enable row level security;
create policy "admin le aprofundamentos" on public.aprofundamentos for select to authenticated using ((select public.eh_admin()));

-- Funções de captura (só service_role) ------------------------------------------------------------------------------

-- A avaliação sozinha, quando a pessoa termina o questionário e ainda não deixou contato: mede quem concluiu sem
-- deixar nome e e-mail, sem criar lead. O mesmo código repetido é idempotente; outro código com o mesmo id é conflito.
create function public.registrar_avaliacao(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_av uuid := (p ->> 'id')::uuid;
  codigo_atual text;
  ja_existia boolean := false;
begin
  select codigo into codigo_atual from public.avaliacoes where id = v_av;
  if found then
    if codigo_atual <> p ->> 'codigo' then
      return jsonb_build_object('status', 'conflito', 'motivo', 'avaliacao');
    end if;
    ja_existia := true;
  end if;
  insert into public.avaliacoes (
    id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, areas,
    codigo, versao, versao_metodo, versao_analise, canal, resultado, origem, ambiente
  ) values (
    v_av, p ->> 'escopo', p ->> 'papel', p ->> 'porte', p ->> 'segmento', p -> 'respostas',
    array(select jsonb_array_elements_text(p -> 'desafios')), p ->> 'horizonte',
    (p ->> 'indice')::smallint, p ->> 'nivel', (p ->> 'parcial')::boolean, p -> 'dimensoes', p -> 'areas',
    p ->> 'codigo', p ->> 'versao', p ->> 'versao_metodo', p ->> 'versao_analise', 'funcao', p -> 'resultado',
    coalesce(p -> 'origem', '{}'::jsonb), p ->> 'ambiente'
  ) on conflict (id) do nothing;
  return jsonb_build_object('status', case when ja_existia then 'ja-registrado' else 'registrado' end);
end $$;

create function public.registrar_captura(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  av jsonb := p -> 'avaliacao';
  ld jsonb := p -> 'lead';
  rel jsonb := p -> 'relatorio';
  v_av uuid := (av ->> 'id')::uuid;
  v_ld uuid := (ld ->> 'id')::uuid;
  v_hash text := p ->> 'chave_hash';
  codigo_atual text;
  hash_atual text;
  ja_existia boolean := false;
begin
  select codigo into codigo_atual from public.avaliacoes where id = v_av;
  if found and codigo_atual <> av ->> 'codigo' then
    return jsonb_build_object('status', 'conflito', 'motivo', 'avaliacao');
  end if;

  insert into public.avaliacoes (
    id, escopo, papel, porte, segmento, respostas, desafios, horizonte, indice, nivel, parcial, dimensoes, areas,
    codigo, versao, versao_metodo, versao_analise, canal, resultado, origem, ambiente
  ) values (
    v_av, av ->> 'escopo', av ->> 'papel', av ->> 'porte', av ->> 'segmento', av -> 'respostas',
    array(select jsonb_array_elements_text(av -> 'desafios')), av ->> 'horizonte',
    (av ->> 'indice')::smallint, av ->> 'nivel', (av ->> 'parcial')::boolean, av -> 'dimensoes', av -> 'areas',
    av ->> 'codigo', av ->> 'versao', av ->> 'versao_metodo', av ->> 'versao_analise', 'funcao', av -> 'resultado',
    coalesce(av -> 'origem', '{}'::jsonb), av ->> 'ambiente'
  ) on conflict (id) do nothing;

  select chave_hash into hash_atual from public.leads where id = v_ld;
  if found then
    if hash_atual is distinct from v_hash then
      return jsonb_build_object('status', 'conflito', 'motivo', 'lead');
    end if;
    ja_existia := true;
  else
    insert into public.leads (id, avaliacao_id, nome, email, email_pessoal, consentimento_marketing, ambiente, chave_hash, canal)
    values (
      v_ld, v_av, ld ->> 'nome', ld ->> 'email', (ld ->> 'email_pessoal')::boolean,
      coalesce((ld ->> 'consentimento_marketing')::boolean, false), ld ->> 'ambiente', v_hash, 'funcao'
    );
  end if;

  insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
  select v_ld, e ->> 'finalidade', e ->> 'canal', (e ->> 'concedido')::boolean, e ->> 'fonte', e ->> 'texto_versao', (e ->> 'evento_id')::uuid
  from jsonb_array_elements(coalesce(p -> 'consentimentos', '[]'::jsonb)) as e
  on conflict (evento_id) do nothing;

  insert into public.relatorios (lead_id, avaliacao_id, motivo, versao_metodo, versao_analise, resultado, devolutiva, hash)
  values (
    v_ld, v_av, 'registro', rel ->> 'versao_metodo', rel ->> 'versao_analise', rel -> 'resultado', rel -> 'devolutiva', rel ->> 'hash'
  ) on conflict (lead_id, hash) do nothing;

  return jsonb_build_object('status', case when ja_existia then 'ja-registrado' else 'registrado' end);
end $$;

-- Etapa 2: empresa, WhatsApp e pedidos. Exige a chave do lead. Registra os consentimentos desta etapa e enfileira o
-- envio do relatório e as dicas (uma tarefa de cada por lead, mesmo que o pedido chegue repetido).
create function public.completar_captura(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ld uuid := (p ->> 'lead_id')::uuid;
  l public.leads;
  pediu boolean := coalesce((p ->> 'pediu_contato')::boolean, false);
  marketing boolean := coalesce((p ->> 'marketing')::boolean, false);
begin
  select * into l from public.leads
  where id = v_ld and avaliacao_id = (p ->> 'avaliacao_id')::uuid and chave_hash = p ->> 'chave_hash';
  if not found then
    return jsonb_build_object('status', 'nao-autorizado');
  end if;

  update public.leads set
    empresa = nullif(btrim(p ->> 'empresa'), ''),
    whatsapp = nullif(p ->> 'whatsapp', ''),
    pediu_contato = pediu_contato or pediu,
    consentimento_marketing = consentimento_marketing or marketing,
    pedido_conversa_em = case when pediu and pedido_conversa_em is null then now() else pedido_conversa_em end
  where id = v_ld;

  insert into public.consentimentos (lead_id, finalidade, canal, concedido, fonte, texto_versao, evento_id)
  select v_ld, e ->> 'finalidade', e ->> 'canal', (e ->> 'concedido')::boolean, e ->> 'fonte', e ->> 'texto_versao', (e ->> 'evento_id')::uuid
  from jsonb_array_elements(coalesce(p -> 'consentimentos', '[]'::jsonb)) as e
  on conflict (evento_id) do nothing;

  insert into public.tarefas (tipo, lead_id, chave) values
    ('email-relatorio', v_ld, 'email-relatorio:' || v_ld),
    ('dicas', v_ld, 'dicas:' || v_ld)
  on conflict (chave) do nothing;

  return jsonb_build_object('status', 'completado');
end $$;

create function public.gravar_aprofundamento(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ld uuid := (p ->> 'lead_id')::uuid;
  v_rev integer := (p ->> 'revisao')::integer;
  l public.leads;
  atual integer;
begin
  select * into l from public.leads where id = v_ld and chave_hash = p ->> 'chave_hash';
  if not found then
    return jsonb_build_object('status', 'nao-autorizado');
  end if;

  select revisao into atual from public.aprofundamentos where lead_id = v_ld;
  if atual is not null and atual >= v_rev then
    return jsonb_build_object('status', 'ignorado', 'revisao', atual);
  end if;

  insert into public.aprofundamentos (
    lead_id, avaliacao_id, area, camada, revisao, rotina, rotina_outra, volume, unidade, periodo, consequencia,
    consequencia_outra, minutos, ferramentas, dados, indicador, papel_decisor, nao_sei
  ) values (
    v_ld, l.avaliacao_id, p ->> 'area', (p ->> 'camada')::smallint, v_rev, p ->> 'rotina', p ->> 'rotina_outra',
    (p ->> 'volume')::numeric, p ->> 'unidade', p ->> 'periodo', p ->> 'consequencia', p ->> 'consequencia_outra',
    (p ->> 'minutos')::numeric, array(select jsonb_array_elements_text(coalesce(p -> 'ferramentas', '[]'::jsonb))),
    p ->> 'dados', p ->> 'indicador', p ->> 'papel_decisor',
    array(select jsonb_array_elements_text(coalesce(p -> 'nao_sei', '[]'::jsonb)))
  )
  on conflict (lead_id) do update set
    area = excluded.area, camada = excluded.camada, revisao = excluded.revisao, rotina = excluded.rotina,
    rotina_outra = excluded.rotina_outra, volume = excluded.volume, unidade = excluded.unidade, periodo = excluded.periodo,
    consequencia = excluded.consequencia, consequencia_outra = excluded.consequencia_outra, minutos = excluded.minutos,
    ferramentas = excluded.ferramentas, dados = excluded.dados, indicador = excluded.indicador,
    papel_decisor = excluded.papel_decisor, nao_sei = excluded.nao_sei, atualizado_em = now()
  where public.aprofundamentos.revisao < excluded.revisao;

  return jsonb_build_object('status', 'gravado', 'revisao', v_rev);
end $$;

revoke execute on function
  public.registrar_avaliacao(jsonb),
  public.registrar_captura(jsonb),
  public.completar_captura(jsonb),
  public.gravar_aprofundamento(jsonb)
from public, anon, authenticated;
