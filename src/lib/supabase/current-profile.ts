import 'server-only'
import { createClient } from './server'

export type CurrentProfile = { id: string; name: string; client_code: string; role: 'admin' | 'client'; status: string }
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null
  const client = await createClient()
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) return null
  const { data, error } = await client.from('rapi_profiles').select('id,name,client_code,role,status').eq('id', user.id).maybeSingle()
  if (error || !data || data.status !== 'active' || !['admin','client'].includes(data.role)) return null
  return data as CurrentProfile
}
