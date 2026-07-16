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

// fetch com timeout: se o Supabase não responder (projeto pausado/offline),
// a requisição é abortada em vez de ficar pendurada para sempre — assim as
// telas param de girar e mostram seu estado (vazio) em vez de travar.
const REQUEST_TIMEOUT_MS = 12000
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  )
}

// Usa placeholders válidos quando não configurado, para o createClient NÃO
// lançar erro no import (o que deixaria a tela em branco). A UI trata o
// estado "não configurado" mostrando uma mensagem clara.
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { fetch: fetchWithTimeout },
  }
)
