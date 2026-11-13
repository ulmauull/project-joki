'use client'
import { useActionState, useState } from 'react'
import { loginClient, loginAdmin, type LoginState } from './actions'
const initialState: LoginState = {}
const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#4666ff] focus:ring-4 focus:ring-[#4666ff]/10'
export function LoginForm({ role = 'client' }: { role?: 'admin'|'client' }) {
  const [state, action, pending] = useActionState(role === 'admin' ? loginAdmin : loginClient, initialState)
  const [legacy, setLegacy] = useState(false)
  const useEmail = role === 'admin' || legacy
  return <form action={action} className="mt-8 space-y-5">
    {legacy && <input type="hidden" name="method" value="legacy"/>}
    {useEmail ? <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><input type="email" name="email" required autoComplete="username" placeholder="nama@email.com" className={inputClass}/></label> : <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</span><input type="tel" name="phone" required autoComplete="tel" placeholder="0812 3456 7890" className={inputClass}/></label>}
    <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{useEmail?'Password':'Kode akses'}</span><input type="password" name="password" required autoComplete="current-password" placeholder={useEmail?'Masukkan password':'Masukkan kode dari admin'} className={inputClass}/></label>
    {state.error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>}
    <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#172140] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#25345f] disabled:cursor-wait disabled:opacity-70">{pending?'Memverifikasi...':role==='admin'?'Masuk sebagai admin':'Masuk sebagai client'}</button>
    {role==='client'&&<button type="button" className="text-sm font-semibold text-[#4666ff]" onClick={()=>setLegacy(!legacy)}>{legacy?'Masuk pakai nomor HP':'Punya akun lama? Masuk dengan email'}</button>}
  </form>
}
