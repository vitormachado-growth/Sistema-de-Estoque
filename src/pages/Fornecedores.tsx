import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Supplier, SupplierInput } from '../types/database'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Spinner,
  Textarea,
} from '../components/ui'
import PageHeader from '../components/PageHeader'

const empty: SupplierInput = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  notes: '',
}

export default function Fornecedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState<SupplierInput>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')
    setSuppliers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm(empty)
    setError(null)
    setOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setEditing(s)
    setForm({
      name: s.name,
      contact: s.contact ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      notes: s.notes ?? '',
    })
    setError(null)
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form, name: form.name.trim() }
    const res = editing
      ? await supabase.from('suppliers').update(payload).eq('id', editing.id)
      : await supabase.from('suppliers').insert(payload)
    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setOpen(false)
    load()
  }

  const remove = async (s: Supplier) => {
    if (!confirm(`Remover o fornecedor "${s.name}"?`)) return
    const { error } = await supabase.from('suppliers').delete().eq('id', s.id)
    if (error) alert(error.message)
    else load()
  }

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle="Cadastro de quem abastece a loja"
        actions={<Button onClick={openNew}>+ Novo fornecedor</Button>}
      />

      {loading ? (
        <Spinner />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="Nenhum fornecedor cadastrado"
          subtitle="Cadastre seus fornecedores para vincular aos produtos."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id} className="!p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-zinc-100">{s.name}</h3>
              </div>
              <dl className="mt-3 space-y-1 text-sm text-zinc-400">
                {s.contact && <p>👤 {s.contact}</p>}
                {s.phone && <p>📞 {s.phone}</p>}
                {s.email && <p className="truncate">✉️ {s.email}</p>}
                {s.notes && <p className="text-zinc-500">📝 {s.notes}</p>}
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(s)}>
                  Editar
                </Button>
                <Button variant="ghost" onClick={() => remove(s)}>
                  Remover
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Nome *">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Distribuidora XYZ"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contato">
              <Input
                value={form.contact ?? ''}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Nome do vendedor"
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </Field>
          </div>
          <Field label="E-mail">
            <Input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Observações">
            <Textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
