'use server'
import { randomBytes } from 'node:crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getCurrentProfile } from '@/lib/supabase/current-profile'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { clientAuthEmail } from '@/lib/client-auth-email'

export type CreateAccountResult = { ok: boolean; error?: string; accessCode?: string; name?: string; phone?: string }
function newCode() { return 'TG-' + randomBytes(12).toString('hex').toUpperCase() + 'a1!' }
async function adminClient() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin' || profile.status !== 'active') throw new Error('Tidak memiliki akses admin.')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !secret) throw new Error('Kunci server belum diatur. Isi SUPABASE_SERVICE_ROLE_KEY di environment server.')
  return createSupabaseAdmin(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}
export async function createClientAccount(form: FormData): Promise<CreateAccountResult> {
  try {
    const admin = await adminClient()
    const name = String(form.get('name') ?? '').trim()
    const university = String(form.get('university') ?? '').trim()
    const phone = normalizeIndonesianPhone(String(form.get('phone') ?? ''))
    if (!name || name.length > 100 || !university || university.length > 160 || !phone) return { ok: false, error: 'Isi nama, universitas, dan nomor HP Indonesia yang valid (contoh 081234567890).' }
    const email = clientAuthEmail(phone)
    if (!email) return { ok: false, error: 'CLIENT_AUTH_GMAIL belum diatur dengan alamat Gmail admin yang valid di environment server.' }
    // Existing phone-only accounts must be migrated, not duplicated.
    const { data: existing, error: lookupError } = await admin.from('rapi_profiles').select('id').eq('phone', phone).limit(1).maybeSingle()
    if (lookupError) return { ok: false, error: 'Tidak bisa memeriksa nomor client. Periksa konfigurasi database.' }
    if (existing) return { ok: false, error: 'Nomor ini sudah ada di profil client. Gunakan Reset kode pada profil tersebut, jangan buat akun baru.' }
    const accessCode = newCode()
    // This is an internal alias at the administrator's mailbox, not a client email.
    // No email or SMS is sent; the admin verifies identity out of band.
    const { data, error: createError } = await admin.auth.admin.createUser({ email, password: accessCode, email_confirm: true, user_metadata: { name } })
    if (createError || !data.user) return { ok: false, error: 'Akun gagal dibuat. Pastikan nomor belum terdaftar, Email Auth aktif, dan konfigurasi Supabase benar.' }
    const { error: profileError } = await admin.from('rapi_profiles').insert({ id: data.user.id, name, university, phone, role: 'client', status: 'active' })
    if (profileError) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id)
      return { ok: false, error: cleanupError ? 'Profil gagal dibuat dan akun Auth mungkin masih ada. Periksa di dashboard Supabase.' : 'Profil gagal dibuat dan akun Auth baru dibatalkan. Pastikan migrasi 04 sudah dijalankan.' }
    }
    return { ok: true, accessCode, name, phone }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Koneksi ke Supabase gagal.' } }
}
export async function resetClientCode(id: string): Promise<CreateAccountResult> {
  try {
    const admin = await adminClient()
    const { data: client, error } = await admin.from('rapi_profiles').select('id,name,phone,role,status').eq('id', id).maybeSingle()
    if (error || !client || client.role !== 'client' || client.status !== 'active' || !client.phone) return { ok: false, error: 'Client aktif dengan nomor HP tidak ditemukan.' }
    const phone = normalizeIndonesianPhone(client.phone)
    const email = phone && clientAuthEmail(phone)
    if (!phone || !email) return { ok: false, error: 'Nomor client atau CLIENT_AUTH_GMAIL tidak valid.' }
    const { data: auth, error: authError } = await admin.auth.admin.getUserById(client.id)
    if (authError || !auth.user) return { ok: false, error: 'Akun Auth tidak ditemukan. Periksa akun client di Supabase.' }
    const existingEmail = (auth.user.email || '').toLowerCase()
    if (existingEmail && existingEmail !== email) return { ok: false, error: 'Akun ini memiliki email lain. Tidak ada yang diubah; hubungi admin untuk penanganan akun lama.' }
    if (!existingEmail && (!auth.user.phone || normalizeIndonesianPhone(auth.user.phone) !== phone)) return { ok: false, error: 'Nomor di profil dan Auth tidak cocok. Tidak ada yang diubah; periksa akun di Supabase.' }
    const accessCode = newCode()
    // Add an email identity only for matching phone-only users. Keep the same UUID,
    // so existing client, order and document relations remain associated.
    const { error: updateError } = await admin.auth.admin.updateUserById(client.id, { email, email_confirm: true, password: accessCode })
    if (updateError) return { ok: false, error: 'Kode gagal direset. Periksa pengaturan keamanan Supabase.' }
    return { ok: true, accessCode, name: client.name, phone: client.phone }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Koneksi ke Supabase gagal.' } }
}
