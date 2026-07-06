import { useState } from 'react'
import type { Product } from '../types/database'

type ThumbProduct = Pick<Product, 'image_url' | 'category' | 'platform' | 'name'>

const categoryIcon = (category: string | null) => {
  const c = (category ?? '').toLowerCase()
  if (c.includes('console')) return '🕹️'
  if (c.includes('acess')) return '🎧'
  if (c.includes('cart') || c.includes('gift')) return '💳'
  if (c.includes('colec')) return '🏆'
  if (c.includes('jogo')) return '🎮'
  return '📦'
}

// Cor de fundo pela plataforma (identidade visual de cada console)
const platformGradient = (platform: string | null) => {
  const p = (platform ?? '').toLowerCase()
  if (p.includes('ps') || p.includes('playstation'))
    return 'from-blue-500/25 to-indigo-700/10'
  if (p.includes('switch') || p.includes('nintendo'))
    return 'from-red-500/25 to-rose-700/10'
  if (p.includes('xbox')) return 'from-emerald-500/25 to-green-700/10'
  if (p.includes('pc')) return 'from-brand-500/25 to-brand-700/10'
  return 'from-white/10 to-white/[0.03]'
}

const sizes = {
  sm: 'h-11 w-11 text-lg rounded-lg',
  lg: 'h-16 w-16 text-2xl rounded-xl',
}

export default function ProductThumb({
  product,
  size = 'sm',
}: {
  product: ThumbProduct
  size?: 'sm' | 'lg'
}) {
  const [errored, setErrored] = useState(false)
  const url = product.image_url?.trim()

  if (url && !errored) {
    return (
      <img
        src={url}
        alt={product.name}
        loading="lazy"
        onError={() => setErrored(true)}
        className={`${sizes[size]} shrink-0 border border-white/10 object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center border border-white/10 bg-gradient-to-br ${platformGradient(
        product.platform
      )}`}
      title={product.platform ?? undefined}
    >
      {categoryIcon(product.category)}
    </div>
  )
}
