import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Ajuda a diagnosticar rapidamente configuração faltando.
  console.error(
    'Variáveis do Supabase ausentes. Defina VITE_SUPABASE_URL e ' +
      'VITE_SUPABASE_ANON_KEY (localmente no .env.local; no deploy, nas ' +
      'Environment Variables do host).'
  )
}

// Usa placeholders válidos quando não configurado, para o createClient NÃO
// lançar erro no import (o que deixaria a tela em branco). A UI trata o
// estado "não configurado" mostrando uma mensagem clara.
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } }
)
