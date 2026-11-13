import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/current-profile'
import { Workspace } from '@/components/workspace'
export const dynamic = 'force-dynamic'
export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role !== 'admin') redirect('/portal')
  return <Workspace profile={profile} />
}
