// Contoh: simpan sebagai src/lib/supabase/server.ts untuk Next.js 16.
import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Konfigurasi Supabase belum tersedia')
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(items) {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
        catch { /* Server Components tak bisa set cookie; gunakan proxy refresh. */ }
      },
    },
  })
}
