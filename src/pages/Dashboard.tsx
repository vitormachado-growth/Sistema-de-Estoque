import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product, StockMovement } from '../types/database'
import { brl, formatDateTime, movementLabel } from '../lib/format'
import { Badge, Card, Spinner, EmptyState } from '../components/ui'
import PageHeader from '../components/PageHeader'

interface MovementWithProduct extends StockMovement {
  products: { name: string } | null
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<MovementWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [{ data: prods }, { data: movs }] = await Promise.all([
        supabase.from('products').select('*').eq('active', true),
        supabase
          .from('stock_movements')
          .select('*, products(name)')
          .order('created_at', { ascending: false })
          .limit(8),
      ])
      setProducts(prods ?? [])
      setMovements((movs as MovementWithProduct[]) ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <Spinner />

  const totalProducts = products.length
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0)
  const stockCost = products.reduce((s, p) => s + p.quantity * p.cost_price, 0)
  const stockSaleValue = products.reduce(
    (s, p) => s + p.quantity * p.sale_price,
    0
  )
  const lowStock = products.filter(
    (p) => p.quantity <= p.min_stock
  )

  // Vendas do mês corrente (calculado no cliente a partir das 8 últimas? não —
  // buscamos as vendas do mês separadamente abaixo).

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do estoque da loja"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Produtos ativos" value={String(totalProducts)} icon="🎮" tone="brand" />
        <Kpi label="Unidades em estoque" value={String(totalUnits)} icon="📦" tone="sky" />
        <Kpi
          label="Custo do estoque"
          value={brl(stockCost)}
          icon="💰"
          hint="Quanto foi investido"
          tone="amber"
        />
        <Kpi
          label="Valor de venda"
          value={brl(stockSaleValue)}
          icon="🏷️"
          hint="Se vender tudo"
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Estoque baixo */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              ⚠️ Estoque baixo
            </h2>
            <Badge tone={lowStock.length ? 'amber' : 'green'}>
              {lowStock.length} item(ns)
            </Badge>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              Nenhum produto abaixo do mínimo. 👍
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {lowStock.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="truncate text-zinc-200">{p.name}</span>
                  <span className="ml-2 shrink-0">
                    <Badge tone={p.quantity === 0 ? 'red' : 'amber'}>
                      {p.quantity} / mín {p.min_stock}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {lowStock.length > 6 && (
            <Link
              to="/produtos"
              className="mt-3 block text-center text-xs text-brand-400 hover:text-brand-400"
            >
              Ver todos
            </Link>
          )}
        </Card>

        {/* Movimentações recentes */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              🔄 Movimentações recentes
            </h2>
            <Link
              to="/movimentacoes"
              className="text-xs text-brand-400 hover:text-brand-400"
            >
              Ver todas
            </Link>
          </div>
          {movements.length === 0 ? (
            <EmptyState title="Sem movimentações ainda" />
          ) : (
            <ul className="divide-y divide-white/5">
              {movements.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-zinc-200">
                      {m.products?.name ?? 'Produto removido'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDateTime(m.created_at)}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <Badge
                      tone={
                        m.type === 'entrada'
                          ? 'green'
                          : m.type === 'ajuste'
                            ? 'neutral'
                            : 'red'
                      }
                    >
                      {movementLabel[m.type]}
                    </Badge>
                    <p className="mt-1 text-xs font-medium text-zinc-300">
                      {m.quantity > 0 ? '+' : ''}
                      {m.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  icon,
  hint,
  tone = 'brand',
}: {
  label: string
  value: string
  icon: string
  hint?: string
  tone?: 'brand' | 'sky' | 'amber' | 'green'
}) {
  const chips = {
    brand: 'bg-brand-500/15 ring-brand-500/25',
    sky: 'bg-sky-500/15 ring-sky-500/25',
    amber: 'bg-amber-500/100/15 ring-amber-500/25',
    green: 'bg-emerald-500/15 ring-emerald-500/25',
  }
  return (
    <Card className="!p-4 transition-colors hover:border-white/[0.14]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="tabular mt-1.5 truncate text-2xl font-semibold text-zinc-100">
            {value}
          </p>
          {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ring-inset ${chips[tone]}`}
        >
          {icon}
        </span>
      </div>
    </Card>
  )
}
