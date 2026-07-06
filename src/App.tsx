import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Movimentacoes from './pages/Movimentacoes'
import Fornecedores from './pages/Fornecedores'
import Relatorios from './pages/Relatorios'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  if (!isSupabaseConfigured) return <ConfigNeeded />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="movimentacoes" element={<Movimentacoes />} />
        <Route path="fornecedores" element={<Fornecedores />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function ConfigNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-surface-2/80 p-6 text-center shadow-pop">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl">
          ⚙️
        </div>
        <h1 className="text-lg font-semibold text-zinc-100">
          Configuração necessária
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          As variáveis de ambiente do Supabase não foram encontradas. Defina-as e
          faça um novo deploy (redeploy):
        </p>
        <div className="mt-4 space-y-2 rounded-lg bg-black/30 p-3 text-left font-mono text-xs text-zinc-300">
          <p>VITE_SUPABASE_URL</p>
          <p>VITE_SUPABASE_ANON_KEY</p>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          No Vercel: <span className="text-zinc-300">Settings → Environment
          Variables</span>, depois <span className="text-zinc-300">Deployments →
          Redeploy</span>. As variáveis do Vite são lidas no momento do build.
        </p>
      </div>
    </div>
  )
}
