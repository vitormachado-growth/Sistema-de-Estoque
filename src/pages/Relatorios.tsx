import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MovementType } from '../types/database'
import { Card, Field, Input, Spinner, EmptyState } from '../components/ui'
import PageHeader from '../components/PageHeader'
import { brl } from '../lib/format'

interface SaleRow {
  id: string
  type: MovementType
  quantity: number
  unit_price: number
  created_at: string
  product_id: string
  products: { name: string; cost_price: number } | null
}

// Primeiro e último dia do mês corrente em formato yyyy-mm-dd (local).
function monthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`
  return { from: fmt(first), to: fmt(last) }
}

export default function Relatorios() {
  const init = monthRange()
  const [from, setFrom] = useState(init.from)
  const [to, setTo] = useState(init.to)
  const [rows, setRows] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    // inclui o dia final inteiro (< dia seguinte)
    const toExclusive = new Date(to)
    toExclusive.setDate(toExclusive.getDate() + 1)
    const { data } = await supabase
      .from('stock_movements')
      .select('id, type, quantity, unit_price, created_at, product_id, products(name, cost_price)')
      .eq('type', 'venda')
      .gte('created_at', from)
      .lt('created_at', toExclusive.toISOString().slice(0, 10))
      .order('created_at', { ascending: false })
    setRows((data as unknown as SaleRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

  const stats = useMemo(() => {
    let revenue = 0
    let cost = 0
    let units = 0
    const byProduct = new Map<
      string,
      { name: string; units: number; revenue: number }
    >()

    for (const r of rows) {
      const q = Math.abs(r.quantity)
      const rev = q * r.unit_price
      const cst = q * (r.products?.cost_price ?? 0)
      revenue += rev
      cost += cst
      units += q
      const key = r.product_id
      const cur = byProduct.get(key) ?? {
        name: r.products?.name ?? '— removido —',
        units: 0,
        revenue: 0,
      }
      cur.units += q
      cur.revenue += rev
      byProduct.set(key, cur)
    }

    const profit = revenue - cost
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const top = [...byProduct.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return { revenue, cost, profit, margin, units, top, orders: rows.length }
  }, [rows])

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Vendas, faturamento e lucro por período"
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="De">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Até">
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <div className="flex gap-2 pb-0.5">
            <QuickRange
              label="Este mês"
              onClick={() => {
                const r = monthRange()
                setFrom(r.from)
                setTo(r.to)
              }}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Faturamento" value={brl(stats.revenue)} tone="brand" />
            <Stat
              label="Lucro"
              value={brl(stats.profit)}
              tone={stats.profit >= 0 ? 'green' : 'red'}
              hint={`Margem ${stats.margin.toFixed(1)}%`}
            />
            <Stat label="Unidades vendidas" value={String(stats.units)} />
            <Stat label="Nº de vendas" value={String(stats.orders)} />
          </div>

          <Card className="mt-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-200">
              🏆 Produtos mais vendidos no período
            </h2>
            {stats.top.length === 0 ? (
              <EmptyState
                title="Nenhuma venda no período"
                subtitle="Registre vendas em Movimentações para ver os relatórios."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="py-2 font-medium">#</th>
                      <th className="py-2 font-medium">Produto</th>
                      <th className="py-2 text-right font-medium">Unidades</th>
                      <th className="py-2 text-right font-medium">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.top.map((p, i) => (
                      <tr key={p.name + i}>
                        <td className="py-2.5 text-zinc-500">{i + 1}</td>
                        <td className="py-2.5 text-zinc-100">{p.name}</td>
                        <td className="py-2.5 text-right text-zinc-300">
                          {p.units}
                        </td>
                        <td className="py-2.5 text-right text-zinc-100">
                          {brl(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function QuickRange({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
    >
      {label}
    </button>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'green' | 'red' | 'brand'
}) {
  const tones = {
    neutral: 'text-zinc-100',
    green: 'text-emerald-400',
    red: 'text-red-400',
    brand: 'text-brand-400',
  }
  return (
    <Card className="!p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`tabular mt-1.5 text-2xl font-semibold ${tones[tone]}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </Card>
  )
}
