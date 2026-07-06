-- ============================================================
-- GameStock - Acesso direto (sem login)
-- Libera as tabelas para o papel público (anon + authenticated),
-- já que o app entra direto, sem autenticação.
--
-- ATENÇÃO: com isso, qualquer pessoa com o endereço do app e a
-- chave anon (que fica embutida no frontend) pode ler e gravar.
-- Use apenas em ambiente interno/privado. Para voltar a exigir
-- login, recrie as policies com "to authenticated".
-- ============================================================

-- Remove as policies restritas (só autenticados)
drop policy if exists suppliers_auth_all on public.suppliers;
drop policy if exists products_auth_all  on public.products;
drop policy if exists movements_auth_all on public.stock_movements;

-- Recria como acesso público (papel "public" = anon + authenticated)
do $$
begin
  if not exists (select 1 from pg_policies where tablename='suppliers' and policyname='suppliers_public_all') then
    create policy suppliers_public_all on public.suppliers
      for all to public using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='products' and policyname='products_public_all') then
    create policy products_public_all on public.products
      for all to public using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='stock_movements' and policyname='movements_public_all') then
    create policy movements_public_all on public.stock_movements
      for all to public using (true) with check (true);
  end if;
end$$;
