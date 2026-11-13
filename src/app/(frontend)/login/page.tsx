import Link from 'next/link'
import { Brand } from '@/components/brand'
import { Icon } from '@/components/icons'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#172140] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-[#4666ff]/30 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-violet-500/20 blur-3xl" />
        <Brand inverse />
        <div className="relative my-auto max-w-lg">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#b8c4ff]">
            Portal client
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-[-0.05em]">
            Pantau progres tanpa harus terus bertanya.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Lihat status terbaru, deadline, dokumen hasil, revisi, dan pembayaran dari satu tempat
            yang aman.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              ['Status terkini', 'Pantau progres dan deadline'],
              ['Akses aman', 'Data hanya untuk akunmu'],
              ['Dokumen rapi', 'Unduh hasil yang dibagikan'],
              ['Revisi mudah', 'Ajukan dari order terkait'],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <div className="grid size-7 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Icon name="check" className="size-4" />
                </div>
                <p className="mt-4 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">
          Simpan kode akses dengan aman dan jangan bagikan kepada orang lain.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-12 lg:hidden">
            <Brand />
          </div>
          <p className="text-sm font-bold text-[#4666ff]">SELAMAT DATANG</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#172140]">
            Masuk sebagai client
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Gunakan nomor HP dan kode akses yang diberikan admin.
          </p>
          <LoginForm />
          <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#eef1ff] p-4 text-sm text-[#42549b]">
            <Icon name="help" className="mt-0.5 size-5 shrink-0" />
            <p className="leading-5">
              Lupa akses atau akun dicabut? Hubungi admin melalui kanal komunikasi yang biasa
              digunakan.
            </p>
          </div>
          <Link href="/admin/login" className="mt-6 inline-flex items-center text-sm font-semibold text-[#4666ff]">Masuk sebagai admin →</Link>
          <br />
          <Link
            href="/preview"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#4666ff]"
          >
            <Icon name="arrow" className="size-4 rotate-180" /> Lihat preview demo
          </Link>
        </div>
      </section>
    </main>
  )
}
