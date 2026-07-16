import { NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/produtos', label: 'Produtos', icon: '🎮' },
  { to: '/movimentacoes', label: 'Movimentações', icon: '🔄' },
  { to: '/fornecedores', label: 'Fornecedores', icon: '🏢' },
  { to: '/relatorios', label: 'Relatórios', icon: '📈' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-surface-1 p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2 pt-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg shadow-glow">
            🕹️
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-100">GameStock</p>
            <p className="text-xs text-zinc-500">Controle de Estoque</p>
          </div>
        </div>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Menu
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/[0.12] text-brand-100'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400 transition-all ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
          <p className="text-xs text-zinc-500">GameStock</p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Sistema de Estoque</p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-surface-1 px-4 py-3 md:hidden">
          <span className="flex items-center gap-2 font-semibold text-zinc-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm">
              🕹️
            </span>
            GameStock
          </span>
        </header>

        {/* Nav mobile */}
        <nav className="sticky top-[53px] z-20 flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-surface-1 px-2 py-2 md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-500/[0.14] text-brand-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="animate-fade mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
