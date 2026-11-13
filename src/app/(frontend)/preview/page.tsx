import { Workspace } from '@/components/workspace'
export default async function Preview({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams
  const client = role === 'client'
  return <Workspace demo profile={{ id: client ? 'client-1' : 'admin-1', name: client ? 'Nadia Putri' : 'Admin', client_code: client ? 'CL-1' : 'CL-ADMIN', role: client ? 'client' : 'admin', status: 'active' }} />
}
