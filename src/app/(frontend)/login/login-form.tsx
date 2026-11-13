'use client'
import { useActionState } from 'react'
import { loginClient, loginAdmin, type LoginState } from './actions'
const initialState: LoginState = {}
export function LoginForm({ role = 'client' }: { role?: 'admin'|'client' }) {
  const [state, action, pending] = useActionState(role === 'admin' ? loginAdmin : loginClient, initialState)
  return <form action={action} className="mt-8 space-y-5">
    <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><input type="email" name="email" required autoComplete="username" placeholder="nama@email.com" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#4666ff] focus:ring-4 focus:ring-[#4666ff]/10"/></label>
    <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Password</span><input type="password" name="password" required autoComplete="current-password" placeholder="Masukkan password" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#4666ff] focus:ring-4 focus:ring-[#4666ff]/10"/></label>
    {state.error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>}
    <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#172140] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#25345f] disabled:cursor-wait disabled:opacity-70">{pending?'Memverifikasi...':role==='admin'?'Masuk sebagai admin':'Masuk sebagai client'}</button>
  </form>
}
