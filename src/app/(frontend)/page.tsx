import Link from 'next/link'
import { Brand } from '@/components/brand'
import { Icon } from '@/components/icons'
import './landing.css'

const services = [
  { icon: 'file' as const, title: 'Dokumen & tugas', copy: 'Diskusikan kebutuhan, brief, dan hasil yang ingin kamu siapkan bersama tim.' },
  { icon: 'briefcase' as const, title: 'Presentasi & materi', copy: 'Rapikan materi dan susun presentasi agar lebih jelas dan mudah diikuti.' },
  { icon: 'help' as const, title: 'Review & revisi', copy: 'Pantau hasil yang siap dicek dan ajukan catatan revisi dari portal client.' },
]

const steps = [
  { number: '01', title: 'Ceritakan kebutuhan', copy: 'Siapkan brief, detail tugas, dan deadline untuk didiskusikan dengan tim.' },
  { number: '02', title: 'Pantau progres', copy: 'Setelah pesanan dibuat, lihat status dan perkembangan lewat portal client.' },
  { number: '03', title: 'Cek hasilnya', copy: 'Buka dokumen yang dibagikan dan kirim revisi bila diperlukan.' },
]

export default function HomePage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Brand />
          <nav className="landing-navlinks" aria-label="Navigasi halaman">
            <a href="#layanan">Layanan</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#portal">Portal client</a>
          </nav>
          <Link className="landing-btn landing-btn-outline landing-nav-cta" href="/login">Masuk client <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero landing-container" aria-labelledby="hero-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow"><span className="landing-dot" /> PARTNER TUGAS KAMU</p>
            <h1 id="hero-title">TMTK.<br /><span>Tugasmu,<br />Tugasku juga.</span></h1>
            <p className="landing-lead">Ada tugas atau materi yang perlu disiapkan? Tugasin bantu kamu mengatur kebutuhan, memantau progres, dan mengecek hasilnya dalam satu tempat.</p>
            <div className="landing-actions">
              <a className="landing-btn landing-btn-primary" href="#layanan">Lihat layanan <span aria-hidden="true">→</span></a>
              <Link className="landing-btn landing-btn-outline" href="/login">Masuk sebagai client</Link>
            </div>
            <p className="landing-helper">Sudah punya kode akses? Masuk untuk melihat pesananmu.</p>
          </div>

          <div className="landing-preview" aria-label="Ilustrasi portal client dengan data contoh">
            <div className="landing-preview-top"><div><span className="landing-preview-kicker">PORTAL CLIENT</span><h2>Semua progres, satu tempat.</h2></div><span className="landing-preview-label">CONTOH</span></div>
            <div className="landing-preview-body">
              <div className="landing-preview-summary"><div><span>Pesanan</span><strong>Review presentasi</strong><small>Contoh tampilan pesanan</small></div><span className="landing-badge">Review</span></div>
              <div className="landing-preview-row"><span className="landing-icon"><Icon name="file" /></span><span><strong>Dokumen</strong><small>File yang dibagikan tim</small></span><Icon name="chevron" /></div>
              <div className="landing-preview-row"><span className="landing-icon"><Icon name="help" /></span><span><strong>Revisi</strong><small>Catatan dalam satu tempat</small></span><Icon name="chevron" /></div>
              <div className="landing-preview-note"><span>●</span> Ilustrasi dashboard client</div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-container" id="layanan" aria-labelledby="services-title">
          <div className="landing-section-head"><div><p className="landing-eyebrow">YANG BISA KAMU DISKUSIKAN</p><h2 id="services-title">Biar tugas nggak terasa ribet.</h2></div><p>Dari kebutuhan awal sampai pengecekan hasil, semuanya lebih mudah dipantau.</p></div>
          <div className="landing-service-grid">{services.map(item => <article className="landing-card" key={item.title}><span className="landing-icon landing-service-icon"><Icon name={item.icon} /></span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
        </section>

        <section className="landing-section landing-process" id="cara-kerja" aria-labelledby="process-title">
          <div className="landing-container"><div className="landing-section-head"><div><p className="landing-eyebrow">CARA KERJA</p><h2 id="process-title">Tiga langkah, lebih terarah.</h2></div><p>Mulai dari brief yang jelas, lalu pantau setiap tahapnya.</p></div>
            <div className="landing-steps">{steps.map(item => <article className="landing-step" key={item.number}><span className="landing-step-number">{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
          </div>
        </section>

        <section className="landing-section landing-container" id="portal" aria-labelledby="portal-title">
          <div className="landing-cta"><div><p className="landing-eyebrow">SUDAH JADI CLIENT?</p><h2 id="portal-title">Pesanan kamu ada di sini.</h2><p>Masuk menggunakan nomor HP dan kode akses dari admin untuk mengecek progres, dokumen, dan revisi.</p></div><Link className="landing-btn landing-btn-primary" href="/login">Buka portal client <span aria-hidden="true">→</span></Link></div>
          <p className="landing-contact-note">Belum punya akses? Hubungi admin Tugasin untuk mendiskusikan kebutuhan dan mendapatkan kode akses.</p>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-container landing-footer-inner"><Brand /><p>TMTK — Tugasmu, Tugasku juga.</p><a href="#hero-title">Kembali ke atas ↑</a></div></footer>
    </div>
  )
}
