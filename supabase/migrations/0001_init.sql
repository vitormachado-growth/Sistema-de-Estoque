-- ============================================================
-- GameStock - Sistema de Estoque
-- Migration inicial: tabelas, trigger de saldo e RLS
-- ============================================================

-- Extensão para gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- FORNECEDORES
-- ------------------------------------------------------------
create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  contact     text,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUTOS
-- ------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  sku          text unique,
  barcode      text,
  platform     text,                       -- PS5, PS4, Xbox, Switch, PC, etc.
  category     text,                       -- Jogo, Acessório, Console, etc.
  condition    text not null default 'novo' check (condition in ('novo','usado','seminovo')),
  description  text,
  image_url    text,
  cost_price   numeric(12,2) not null default 0,   -- preço de compra
  sale_price   numeric(12,2) not null default 0,   -- preço de venda
  quantity     integer not null default 0,          -- saldo atual (mantido por trigger)
  min_stock    integer not null default 0,          -- alerta de estoque baixo
  supplier_id  uuid references public.suppliers(id) on delete set null,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_supplier_idx on public.products(supplier_id);
create index if not exists products_active_idx on public.products(active);

-- ------------------------------------------------------------
-- MOVIMENTAÇÕES DE ESTOQUE (entrada, saída, venda, ajuste)
-- ------------------------------------------------------------
create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  type        text not null check (type in ('entrada','saida','venda','ajuste')),
  quantity    integer not null check (quantity <> 0),  -- positivo = soma, negativo = subtrai
  unit_price  numeric(12,2) not null default 0,         -- preço unitário no momento (venda/compra)
  note        text,
  created_by  uuid references auth.users(id) default auth.uid(),
  created_at  timestamptz not null default now()
);

create index if not exists movements_product_idx on public.stock_movements(product_id);
create index if not exists movements_type_idx on public.stock_movements(type);
create index if not exists movements_created_idx on public.stock_movements(created_at desc);

-- ------------------------------------------------------------
-- TRIGGER: mantém products.quantity sincronizado
-- Convenção: movement.quantity já vem com o sinal correto.
--   entrada/ajuste+ => quantity positiva
--   saida/venda     => quantity negativa
-- ------------------------------------------------------------
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.products
      set quantity = quantity + new.quantity,
          updated_at = now()
      where id = new.product_id;
    return new;

  elsif (tg_op = 'DELETE') then
    update public.products
      set quantity = quantity - old.quantity,
          updated_at = now()
      where id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_apply_stock_movement on public.stock_movements;
create trigger trg_apply_stock_movement
  after insert or delete on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ------------------------------------------------------------
-- RLS: qualquer usuário autenticado (funcionário da loja) tem acesso
-- ------------------------------------------------------------
alter table public.suppliers       enable row level security;
alter table public.products        enable row level security;
alter table public.stock_movements enable row level security;

do $$
begin
  -- suppliers
  if not exists (select 1 from pg_policies where tablename='suppliers' and policyname='suppliers_auth_all') then
    create policy suppliers_auth_all on public.suppliers
      for all to authenticated using (true) with check (true);
  end if;
  -- products
  if not exists (select 1 from pg_policies where tablename='products' and policyname='products_auth_all') then
    create policy products_auth_all on public.products
      for all to authenticated using (true) with check (true);
  end if;
  -- stock_movements
  if not exists (select 1 from pg_policies where tablename='stock_movements' and policyname='movements_auth_all') then
    create policy movements_auth_all on public.stock_movements
      for all to authenticated using (true) with check (true);
  end if;
end$$;
