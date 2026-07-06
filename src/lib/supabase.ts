import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Ajuda a diagnosticar rapidamente configuração faltando.
  console.error(
    'Variáveis do Supabase ausentes. Crie um arquivo .env.local com ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).'
  )
}

export const supabase = createClient<Database>(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
