import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Movimentacoes from './pages/Movimentacoes'
import Fornecedores from './pages/Fornecedores'
import Relatorios from './pages/Relatorios'

export default function App() {
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
