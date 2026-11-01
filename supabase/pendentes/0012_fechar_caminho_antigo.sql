-- 0012 · PENDENTE (não aplicar enquanto houver gravação pelo caminho antigo).
--
-- Fecha o caminho dos clientes antigos: o anônimo deixa de inserir direto em `avaliacoes` e `leads` e de chamar
-- `completar_lead` e `lead_liberado`. Tudo passa pela função `ai-score`, que recalcula a nota e autoriza pela chave.
--
-- Condição para aplicar: o contador "caminho antigo de gravação" do painel (aba Operação) fica em zero por um período
-- que a equipe considere seguro (sugestão: 30 dias), depois de o cache dos navegadores com o site antigo expirar.
-- Antes disso, quem tem o site antigo aberto perderia o contato sem aviso.
--
-- Reversão: os `grant` abaixo, ao contrário, devolvem o caminho antigo.

revoke insert on public.avaliacoes, public.leads from anon;
revoke execute on function public.completar_lead(uuid, text, text, boolean, boolean) from anon, authenticated;
revoke execute on function public.lead_liberado(uuid, uuid) from anon, authenticated;
