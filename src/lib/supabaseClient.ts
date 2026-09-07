import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 1500)

  if (init?.signal) {
    if (init.signal.aborted) controller.abort()
    else init.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeoutId)
  })
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars — check .env against .env.example')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: fetchWithTimeout },
})
