import Link from 'next/link'
import { Brand } from '@/components/brand'
import { LoginForm } from '@/app/(frontend)/login/login-form'
export default function AdminLoginPage() {
  return <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden bg-[#172140] p-12 text-white lg:flex lg:flex-col">
      <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-[#4666ff]/20 blur-3xl"/><Brand inverse/>
      <div className="relative my-auto max-w-lg"><span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#b8c4ff]">Area khusus admin</span><h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-[-0.05em]">Semua order, lebih terkendali.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-300">Kelola pesanan, client, dokumen dan revisi dari satu workspace operasional.</p><p className="mt-8 text-sm text-slate-400">Akses ini hanya untuk akun admin yang terdaftar.</p></div>
    </section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-[430px]"><div className="mb-12 lg:hidden"><Brand/></div><p className="text-sm font-bold text-[#4666ff]">AREA ADMIN</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#172140]">Masuk sebagai admin</h2><p className="mt-3 text-sm leading-6 text-slate-500">Gunakan email dan password akun admin yang sudah dibuat di Supabase.</p><LoginForm role="admin"/><Link href="/login" className="mt-8 inline-flex text-sm font-semibold text-[#4666ff]">← Kembali ke login client</Link></div></section>
  </main>
}
