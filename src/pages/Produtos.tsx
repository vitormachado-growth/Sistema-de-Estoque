import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Condition,
  Product,
  ProductInput,
  Supplier,
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
import ProductThumb from '../components/ProductThumb'
import { brl } from '../lib/format'

const PLATFORMS = ['PS5', 'PS4', 'PS3', 'Xbox Series', 'Xbox One', 'Switch', 'PC', 'Outro']
const CATEGORIES = ['Jogo', 'Console', 'Acessório', 'Colecionável', 'Cartão/Gift', 'Outro']

const empty: ProductInput = {
  name: '',
  sku: '',
  barcode: '',
  platform: '',
  category: 'Jogo',
  condition: 'novo',
  description: '',
  image_url: '',
  cost_price: 0,
  sale_price: 0,
  min_stock: 0,
  supplier_id: null,
  active: true,
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data: prods }, { data: sups }] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('suppliers').select('*').order('name'),
    ])
    setProducts(prods ?? [])
    setSuppliers(sups ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const supplierName = (id: string | null) =>
    suppliers.find((s) => s.id === id)?.name ?? '—'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (platformFilter && p.platform !== platformFilter) return false
      if (onlyLow && p.quantity > p.min_stock) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q)
      )
    })
  }, [products, search, platformFilter, onlyLow])

  const openNew = () => {
    setEditing(null)
    setForm(empty)
    setError(null)
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      sku: p.sku ?? '',
      barcode: p.barcode ?? '',
      platform: p.platform ?? '',
      category: p.category ?? '',
      condition: p.condition,
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      cost_price: p.cost_price,
      sale_price: p.sale_price,
      min_stock: p.min_stock,
      supplier_id: p.supplier_id,
      active: p.active,
    })
    setError(null)
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload: ProductInput = {
      ...form,
      name: form.name.trim(),
      sku: form.sku?.trim() || null,
      barcode: form.barcode?.trim() || null,
      supplier_id: form.supplier_id || null,
    }
    const res = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setOpen(false)
    load()
  }

  const remove = async (p: Product) => {
    if (
      !confirm(
        `Remover "${p.name}"? Isso apaga também o histórico de movimentações do produto.`
      )
    )
      return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) alert(error.message)
    else load()
  }

  const margin = (cost: number, sale: number) =>
    sale > 0 ? ((sale - cost) / sale) * 100 : 0

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Catálogo e estoque da loja"
        actions={<Button onClick={openNew}>+ Novo produto</Button>}
      />

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Buscar por nome, SKU ou código…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="max-w-[10rem]"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="">Todas plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
            className="accent-brand-500"
          />
          Só estoque baixo
        </label>
        <span className="ml-auto text-sm text-zinc-500">
          {filtered.length} de {products.length}
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          subtitle="Ajuste os filtros ou cadastre um novo produto."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-surface-2/60 shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 text-right font-medium">Custo</th>
                <th className="px-4 py-3 text-right font-medium">Venda</th>
                <th className="px-4 py-3 text-right font-medium">Margem</th>
                <th className="px-4 py-3 text-center font-medium">Estoque</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const low = p.quantity <= p.min_stock
                return (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb product={p} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!p.active && <Badge tone="neutral">inativo</Badge>}
                            <p className="truncate font-medium text-zinc-100">
                              {p.name}
                            </p>
                          </div>
                          <p className="truncate text-xs text-zinc-500">
                            {p.sku ? `SKU ${p.sku} · ` : ''}
                            {p.category} · {p.condition} ·{' '}
                            {supplierName(p.supplier_id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {p.platform || '—'}
                    </td>
                    <td className="tabular px-4 py-3 text-right text-zinc-300">
                      {brl(p.cost_price)}
                    </td>
                    <td className="tabular px-4 py-3 text-right text-zinc-100">
                      {brl(p.sale_price)}
                    </td>
                    <td className="tabular px-4 py-3 text-right text-zinc-400">
                      {margin(p.cost_price, p.sale_price).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={p.quantity === 0 ? 'red' : low ? 'amber' : 'green'}>
                        {p.quantity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => remove(p)}
                          className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        suppliers={suppliers}
        onSubmit={save}
        saving={saving}
        error={error}
      />
    </div>
  )
}

function ProductModal({
  open,
  onClose,
  editing,
  form,
  setForm,
  suppliers,
  onSubmit,
  saving,
  error,
}: {
  open: boolean
  onClose: () => void
  editing: Product | null
  form: ProductInput
  setForm: (f: ProductInput) => void
  suppliers: Supplier[]
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
  error: string | null
}) {
  const num = (v: string) => (v === '' ? 0 : Number(v))
  const profit = form.sale_price - form.cost_price
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar produto' : 'Novo produto'}
      wide
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nome do produto *">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: EA FC 25 - PS5"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Plataforma">
            <Input
              list="platforms"
              value={form.platform ?? ''}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              placeholder="PS5"
            />
            <datalist id="platforms">
              {PLATFORMS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
          <Field label="Categoria">
            <Input
              list="categories"
              value={form.category ?? ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Jogo"
            />
            <datalist id="categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Condição">
            <Select
              value={form.condition}
              onChange={(e) =>
                setForm({ ...form, condition: e.target.value as Condition })
              }
            >
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
              <option value="usado">Usado</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU / Código interno">
            <Input
              value={form.sku ?? ''}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="PG-0001"
            />
          </Field>
          <Field label="Código de barras">
            <Input
              value={form.barcode ?? ''}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Preço de compra (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.cost_price}
              onChange={(e) =>
                setForm({ ...form, cost_price: num(e.target.value) })
              }
            />
          </Field>
          <Field label="Preço de venda (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.sale_price}
              onChange={(e) =>
                setForm({ ...form, sale_price: num(e.target.value) })
              }
            />
          </Field>
          <Field label="Estoque mínimo">
            <Input
              type="number"
              min="0"
              value={form.min_stock}
              onChange={(e) =>
                setForm({ ...form, min_stock: Math.max(0, num(e.target.value)) })
              }
            />
          </Field>
        </div>

        <p className="text-xs text-zinc-500">
          Lucro por unidade:{' '}
          <span className={profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {brl(profit)}
          </span>
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fornecedor">
            <Select
              value={form.supplier_id ?? ''}
              onChange={(e) =>
                setForm({ ...form, supplier_id: e.target.value || null })
              }
            >
              <option value="">— Nenhum —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Imagem do produto" hint="Cole a URL de uma foto; sem URL, usamos um ícone automático.">
            <div className="flex items-center gap-3">
              <ProductThumb
                product={{
                  image_url: form.image_url ?? null,
                  category: form.category ?? null,
                  platform: form.platform ?? null,
                  name: form.name,
                }}
                size="lg"
              />
              <Input
                value={form.image_url ?? ''}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </Field>
        </div>

        <Field label="Descrição">
          <Textarea
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-brand-500"
          />
          Produto ativo
        </label>

        {!editing && (
          <p className="rounded-lg bg-white/5 p-3 text-xs text-zinc-500">
            💡 O saldo inicial começa em 0. Depois de salvar, registre a entrada
            do estoque em <strong>Movimentações</strong>.
          </p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar produto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
