import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  MovementType,
  Product,
  StockMovement,
} from '../types/database'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Spinner,
  Textarea,
} from '../components/ui'
import PageHeader from '../components/PageHeader'
import { brl, formatDateTime, movementLabel } from '../lib/format'

interface MovementRow extends StockMovement {
  products: { name: string } | null
}

const TYPE_TONE: Record<MovementType, 'green' | 'red' | 'brand' | 'neutral'> = {
  entrada: 'green',
  saida: 'red',
  venda: 'brand',
  ajuste: 'neutral',
}

export default function Movimentacoes() {
  const [movements, setMovements] = useState<MovementRow[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'' | MovementType>('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: movs }, { data: prods }] = await Promise.all([
      supabase
        .from('stock_movements')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(300),
      supabase.from('products').select('*').eq('active', true).order('name'),
    ])
    setMovements((movs as MovementRow[]) ?? [])
    setProducts(prods ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () =>
      typeFilter
        ? movements.filter((m) => m.type === typeFilter)
        : movements,
    [movements, typeFilter]
  )

  const remove = async (m: MovementRow) => {
    if (
      !confirm(
        'Estornar esta movimentação? O saldo do produto será revertido automaticamente.'
      )
    )
      return
    const { error } = await supabase
      .from('stock_movements')
      .delete()
      .eq('id', m.id)
    if (error) alert(error.message)
    else load()
  }

  return (
    <div>
      <PageHeader
        title="Movimentações"
        subtitle="Entradas, saídas, vendas e ajustes de estoque"
        actions={
          <Button onClick={() => setOpen(true)} disabled={products.length === 0}>
            + Registrar movimentação
          </Button>
        }
      />

      {products.length === 0 && !loading && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Cadastre ao menos um produto ativo antes de registrar movimentações.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(['', 'entrada', 'saida', 'venda', 'ajuste'] as const).map((t) => (
          <button
            key={t || 'all'}
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              typeFilter === t
                ? 'bg-brand-600/20 text-brand-300'
                : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t === '' ? 'Todas' : movementLabel[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma movimentação registrada" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-surface-2/60 shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 text-right font-medium">Qtd</th>
                <th className="px-4 py-3 text-right font-medium">Valor unit.</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Obs.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                    {formatDateTime(m.created_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-100">
                    {m.products?.name ?? '— removido —'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={TYPE_TONE[m.type]}>{movementLabel[m.type]}</Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      m.quantity > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {m.quantity > 0 ? '+' : ''}
                    {m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {m.unit_price ? brl(m.unit_price) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {m.unit_price
                      ? brl(Math.abs(m.quantity) * m.unit_price)
                      : '—'}
                  </td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-zinc-500">
                    {m.note}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(m)}
                      className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Estornar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MovementModal
        open={open}
        onClose={() => setOpen(false)}
        products={products}
        onSaved={() => {
          setOpen(false)
          load()
        }}
      />
    </div>
  )
}

function MovementModal({
  open,
  onClose,
  products,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  onSaved: () => void
}) {
  const [productId, setProductId] = useState('')
  const [type, setType] = useState<MovementType>('entrada')
  const [qty, setQty] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const product = products.find((p) => p.id === productId) ?? null

  // Ao trocar produto/tipo, sugere o preço adequado.
  useEffect(() => {
    if (!product) return
    if (type === 'venda') setUnitPrice(product.sale_price)
    else if (type === 'entrada') setUnitPrice(product.cost_price)
    else setUnitPrice(0)
  }, [product, type])

  const reset = () => {
    setProductId('')
    setType('entrada')
    setQty(1)
    setUnitPrice(0)
    setNote('')
    setError(null)
  }

  const removesStock = type === 'saida' || type === 'venda'
  const isAjuste = type === 'ajuste'
  const [ajusteSentido, setAjusteSentido] = useState<'add' | 'sub'>('add')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!product) {
      setError('Selecione um produto.')
      return
    }
    const magnitude = Math.abs(qty)
    if (magnitude === 0) {
      setError('A quantidade deve ser diferente de zero.')
      return
    }

    let signed = magnitude
    if (removesStock) signed = -magnitude
    else if (isAjuste) signed = ajusteSentido === 'sub' ? -magnitude : magnitude

    if (signed < 0 && product.quantity + signed < 0) {
      setError(
        `Estoque insuficiente. Disponível: ${product.quantity}, tentando remover ${magnitude}.`
      )
      return
    }

    setSaving(true)
    const { error } = await supabase.from('stock_movements').insert({
      product_id: product.id,
      type,
      quantity: signed,
      unit_price: unitPrice || 0,
      note: note.trim() || null,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    reset()
    onSaved()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Registrar movimentação"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Produto *">
          <Select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Selecione…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (estoque: {p.quantity})
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo *">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as MovementType)}
            >
              <option value="entrada">Entrada (compra/reposição)</option>
              <option value="venda">Venda</option>
              <option value="saida">Saída (perda/devolução)</option>
              <option value="ajuste">Ajuste de inventário</option>
            </Select>
          </Field>
          <Field label="Quantidade *">
            <Input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => setQty(Math.abs(Number(e.target.value)))}
            />
          </Field>
        </div>

        {isAjuste && (
          <Field label="Sentido do ajuste">
            <Select
              value={ajusteSentido}
              onChange={(e) =>
                setAjusteSentido(e.target.value as 'add' | 'sub')
              }
            >
              <option value="add">Adicionar ao estoque (+)</option>
              <option value="sub">Remover do estoque (−)</option>
            </Select>
          </Field>
        )}

        <Field
          label={
            type === 'venda'
              ? 'Preço de venda unit. (R$)'
              : type === 'entrada'
                ? 'Custo unit. (R$)'
                : 'Valor unit. (R$)'
          }
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
          />
        </Field>

        <Field label="Observação">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: pedido #123, cliente João, nota fiscal…"
          />
        </Field>

        {product && (
          <p className="rounded-lg bg-white/5 p-3 text-xs text-zinc-400">
            Saldo atual: <strong>{product.quantity}</strong>
            {qty > 0 && (
              <>
                {' '}
                → após:{' '}
                <strong>
                  {product.quantity +
                    (removesStock
                      ? -Math.abs(qty)
                      : isAjuste && ajusteSentido === 'sub'
                        ? -Math.abs(qty)
                        : Math.abs(qty))}
                </strong>
              </>
            )}
          </p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
