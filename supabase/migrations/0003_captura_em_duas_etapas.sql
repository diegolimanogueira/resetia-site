-- Captura em duas etapas (28/10): nome e e-mail abrem o resultado (o lead nasce aqui, sem empresa); a empresa,
-- o WhatsApp e o pedido de contato chegam depois, no relatório completo, pela função completar_lead.
-- O anônimo continua sem UPDATE e sem SELECT: só esta função mexe no lead, e só pelo id, que nasce no navegador
-- da pessoa (UUID aleatório, funciona como chave). Só preenche, nunca apaga, e só até 30 dias depois.

alter table public.leads alter column empresa drop not null;

create function public.completar_lead(
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
    empresa = coalesce(nullif(btrim(p_empresa), ''), empresa),
    whatsapp = coalesce(nullif(p_whatsapp, ''), whatsapp),
    pediu_contato = pediu_contato or coalesce(p_pediu_contato, false),
    consentimento_marketing = consentimento_marketing or coalesce(p_marketing, false)
  where id = p_id and criado_em > now() - interval '30 days';
  get diagnostics alterados = row_count;
  return alterados = 1;
end $$;

revoke execute on function public.completar_lead(uuid, text, text, boolean, boolean) from public;
grant execute on function public.completar_lead(uuid, text, text, boolean, boolean) to anon, authenticated;
