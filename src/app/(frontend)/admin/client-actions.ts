'use server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getCurrentProfile } from '@/lib/supabase/current-profile'

export type CreateAccountResult = { ok: boolean; error?: string }
// This action is called only from the admin form. The browser never receives the secret key.
export async function createClientAccount(form: FormData): Promise<CreateAccountResult> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin' || profile.status !== 'active') return { ok: false, error: 'Tidak memiliki akses admin.' }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !secret) return { ok: false, error: 'Kunci server belum diatur. Isi SUPABASE_SERVICE_ROLE_KEY di environment server.' }
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  if (name.length < 1 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
    return { ok: false, error: 'Isi nama, email valid, dan password sementara minimal 12 karakter.' }
  }
  const admin = createSupabaseAdmin(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  try {
    // Confirmed by trusted admin; no verification email is sent by createUser.
    const { data, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })
    if (createError || !data.user) return { ok: false, error: 'Akun gagal dibuat. Pastikan email belum dipakai dan konfigurasi Supabase benar.' }
    const { error: profileError } = await admin.from('rapi_profiles').insert({ id: data.user.id, name, role: 'client', status: 'active' })
    if (profileError) {
      // Only attempt to remove the new Auth account from this operation, never an existing account.
      const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id)
      return { ok: false, error: cleanupError ? 'Profil gagal dibuat dan akun Auth mungkin masih ada. Periksa akun tersebut di dashboard Supabase.' : 'Profil gagal dibuat. Akun Auth baru telah dibatalkan; periksa tabel dan konfigurasi.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Koneksi ke Supabase gagal. Periksa Auth dan konfigurasi server.' }
  }
}
