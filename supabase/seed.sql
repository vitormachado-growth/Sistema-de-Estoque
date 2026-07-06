-- ============================================================
-- GameStock - DADOS DE EXEMPLO (seed)
-- Rode no SQL Editor do Supabase DEPOIS da migration 0001_init.sql.
-- É seguro rodar mais de uma vez (não duplica).
-- ============================================================

-- ------------------------------------------------------------
-- Fornecedores de exemplo
-- ------------------------------------------------------------
insert into public.suppliers (name, contact, phone, email, notes)
select v.name, v.contact, v.phone, v.email, v.notes
from (values
  ('Sony Brasil Distribuidora', 'Central de Vendas', '(11) 4002-0022', 'vendas@sonydist.com.br', 'Jogos e consoles PlayStation'),
  ('Nintendo Games Import',      'Ricardo',           '(11) 3255-1010', 'ricardo@nintendoimport.com.br', 'Jogos e acessórios Switch'),
  ('GameStop Atacado',          'Fernanda',          '(21) 98888-1234', 'fernanda@gamestopatacado.com.br', 'Acessórios e gift cards')
) as v(name, contact, phone, email, notes)
where not exists (select 1 from public.suppliers s where s.name = v.name);

-- ------------------------------------------------------------
-- Produtos de exemplo (SKU único evita duplicar em re-execução)
-- ------------------------------------------------------------
insert into public.products
  (name, sku, platform, category, condition, cost_price, sale_price, min_stock, supplier_id)
select
  v.name, v.sku, v.platform, v.category, v.condition, v.cost, v.sale, v.minst,
  (select id from public.suppliers s where s.name = v.supplier limit 1)
from (values
  ('EA Sports FC 25',                         'PG-0001', 'PS5',        'Jogo',        'novo',    220.00, 299.90, 3, 'Sony Brasil Distribuidora'),
  ('God of War Ragnarök',                     'PG-0002', 'PS5',        'Jogo',        'novo',    180.00, 249.90, 3, 'Sony Brasil Distribuidora'),
  ('Marvel''s Spider-Man 2',                  'PG-0003', 'PS5',        'Jogo',        'novo',    200.00, 279.90, 2, 'Sony Brasil Distribuidora'),
  ('Elden Ring',                              'PG-0004', 'PS5',        'Jogo',        'novo',    150.00, 219.90, 2, 'Sony Brasil Distribuidora'),
  ('Grand Theft Auto V',                      'PG-0005', 'PS4',        'Jogo',        'usado',    70.00, 129.90, 4, 'GameStop Atacado'),
  ('The Legend of Zelda: Tears of the Kingdom','PG-0006','Switch',     'Jogo',        'novo',    260.00, 349.90, 2, 'Nintendo Games Import'),
  ('Mario Kart 8 Deluxe',                     'PG-0007', 'Switch',     'Jogo',        'novo',    230.00, 309.90, 3, 'Nintendo Games Import'),
  ('Super Mario Bros. Wonder',                'PG-0008', 'Switch',     'Jogo',        'novo',    240.00, 329.90, 2, 'Nintendo Games Import'),
  ('Controle DualSense (Branco)',             'PG-0009', 'PS5',        'Acessório',   'novo',    280.00, 399.90, 2, 'Sony Brasil Distribuidora'),
  ('Controle Joy-Con (Par) Neon',            'PG-0010', 'Switch',     'Acessório',   'novo',    360.00, 499.90, 2, 'Nintendo Games Import'),
  ('Headset Gamer HyperX Cloud II',           'PG-0011', 'PC',         'Acessório',   'novo',    320.00, 449.90, 2, 'GameStop Atacado'),
  ('Cartão PSN R$ 100',                       'PG-0012', 'PS5',        'Cartão/Gift', 'novo',     90.00,  100.00, 5, 'GameStop Atacado'),
  ('Console PlayStation 5 Slim',              'PG-0013', 'PS5',        'Console',     'novo',   3200.00, 3799.00, 1, 'Sony Brasil Distribuidora')
) as v(name, sku, platform, category, condition, cost, sale, minst, supplier)
on conflict (sku) do nothing;

-- ------------------------------------------------------------
-- Estoque inicial: entradas (o trigger atualiza products.quantity)
-- ------------------------------------------------------------
insert into public.stock_movements (product_id, type, quantity, unit_price, note)
select p.id, 'entrada', v.qty, p.cost_price, 'Estoque inicial (exemplo)'
from (values
  ('PG-0001', 12), ('PG-0002', 8),  ('PG-0003', 6),  ('PG-0004', 5),
  ('PG-0005', 10), ('PG-0006', 7),  ('PG-0007', 9),  ('PG-0008', 6),
  ('PG-0009', 4),  ('PG-0010', 3),  ('PG-0011', 5),  ('PG-0012', 20),
  ('PG-0013', 2)
) as v(sku, qty)
join public.products p on p.sku = v.sku
where not exists (
  select 1 from public.stock_movements m
  where m.product_id = p.id and m.note = 'Estoque inicial (exemplo)'
);

-- ------------------------------------------------------------
-- Algumas vendas de exemplo (para popular Dashboard e Relatórios)
-- quantidade negativa = saída de estoque
-- ------------------------------------------------------------
insert into public.stock_movements (product_id, type, quantity, unit_price, note)
select p.id, 'venda', -v.qty, p.sale_price, 'Venda exemplo'
from (values
  ('PG-0001', 3), ('PG-0002', 2), ('PG-0005', 4),
  ('PG-0007', 2), ('PG-0012', 6), ('PG-0006', 1)
) as v(sku, qty)
join public.products p on p.sku = v.sku
where not exists (
  select 1 from public.stock_movements m
  where m.product_id = p.id and m.note = 'Venda exemplo'
);

-- ------------------------------------------------------------
-- Capas reais (URLs verificadas: Steam CDN e Wikimedia).
-- Produtos sem URL aqui usam o ícone automático por plataforma.
-- ------------------------------------------------------------
update public.products p set image_url = v.url, updated_at = now()
from (values
  ('PG-0001', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/library_600x900.jpg'),
  ('PG-0002', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900.jpg'),
  ('PG-0003', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2651280/library_600x900.jpg'),
  ('PG-0004', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg'),
  ('PG-0005', 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg'),
  ('PG-0006', 'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg'),
  ('PG-0008', 'https://upload.wikimedia.org/wikipedia/en/a/a3/Mariowonder.png')
) as v(sku, url)
where p.sku = v.sku;

-- ------------------------------------------------------------
-- Exemplos de ESTOQUE BAIXO: ajuste que leva a quantidade a um alvo.
-- Robusto ao estoque atual e seguro para rodar mais de uma vez.
--   God of War -> 0 (esgotado) | Spider-Man 2 -> 1 | Elden Ring -> 2 (no mínimo)
-- ------------------------------------------------------------
insert into public.stock_movements (product_id, type, quantity, unit_price, note)
select p.id, 'ajuste', (v.target - p.quantity), 0, 'Ajuste demo estoque baixo'
from (values
  ('PG-0002', 0),
  ('PG-0003', 1),
  ('PG-0004', 2)
) as v(sku, target)
join public.products p on p.sku = v.sku
where (v.target - p.quantity) <> 0
  and not exists (
    select 1 from public.stock_movements m
    where m.product_id = p.id and m.note = 'Ajuste demo estoque baixo'
  );
