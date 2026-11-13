import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/current-profile'
import { Workspace } from '@/components/workspace'
export const dynamic = 'force-dynamic'
export default async function PortalPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'client') redirect('/dashboard')
  return <Workspace profile={profile} />
}
