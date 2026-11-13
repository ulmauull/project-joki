'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizeIndonesianPhone } from '@/lib/phone'

export type LoginState = { error?: string }
async function signInForRole(role: 'admin'|'client', formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')
  const legacy = role === 'client' && formData.get('method') === 'legacy'
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phone = normalizeIndonesianPhone(String(formData.get('phone') ?? ''))
  if (!password || ((role === 'admin' || legacy) ? !email : !phone)) return { error: role === 'admin' || legacy ? 'Email dan password wajib diisi.' : 'Nomor HP Indonesia dan kode akses wajib diisi.' }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return { error: 'Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.' }
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword(role === 'admin' || legacy ? { email, password } : { phone: phone!, password })
  if (loginError) return { error: role === 'admin' || legacy ? 'Email atau password tidak cocok.' : 'Nomor HP atau kode akses tidak cocok.' }
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) { await supabase.auth.signOut(); return { error: 'Sesi tidak tersedia. Coba lagi.' } }
  const { data: profile, error } = await supabase.from('rapi_profiles').select('id,role,status').eq('id', user.id).maybeSingle()
  if (error || !profile || profile.status !== 'active' || profile.role !== role) {
    await supabase.auth.signOut()
    return { error: 'Akun tidak aktif atau tidak memiliki akses ke halaman ini.' }
  }
  redirect(role === 'admin' ? '/dashboard' : '/portal')
}
export async function loginClient(_state: LoginState, formData: FormData): Promise<LoginState> { return signInForRole('client', formData) }
export async function loginAdmin(_state: LoginState, formData: FormData): Promise<LoginState> { return signInForRole('admin', formData) }
export async function logoutClient() { const s = await createClient(); await s.auth.signOut(); redirect('/login') }
export async function logoutAdmin() { const s = await createClient(); await s.auth.signOut(); redirect('/admin/login') }
