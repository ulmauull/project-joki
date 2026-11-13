# Tugasin — aplikasi Next.js + Supabase

> Login client sekarang memakai nomor HP + kode akses tanpa SMS; server menggunakan alias Gmail admin. Ikuti `PANDUAN-LOGIN-CLIENT.md`.

Versi ini menggabungkan kode web dengan rancangan Supabase dari SQL sebelumnya. Aplikasi tidak secara otomatis mengimpor atau menghapus data Payload lama. Supabase project asli belum diuji dari lingkungan pembuatan paket ini.

## 1. Pasang aturan satu admin (SQL tambahan)

Kalau sudah mengimpor `supabase/01_schema_dan_akses.sql`, **jangan jalankan ulang file 01**. Di Supabase SQL Editor, periksa admin yang sudah ada:

```sql
select id, name, status from public.rapi_profiles where role = 'admin';
```

Jika ada lebih dari satu profil admin, tentukan terlebih dahulu akun yang akan dipertahankan dan tinjau konsekuensi sebelum mengubah akun lain. Migrasi akan gagal bila masih ada lebih dari satu. Setelah siap, jalankan **hanya** `supabase/03_satu_admin.sql` satu kali. Ini membuat unique index yang membatasi maksimal satu profil ber-role admin, termasuk admin berstatus revoked. Tidak menghapus atau mengubah akun secara otomatis. Nol admin tetap mungkin, sehingga akun pertama harus dibuat secara tepercaya. SQL belum dijalankan oleh pembuat paket ini.

Jika tidak ada admin, buat akun di Supabase Dashboard → Authentication → Users, salin UUID, lalu gunakan contoh ADMIN dalam `supabase/02_template_tambah_profil.sql` (hapus komentar `--`, ganti UUID/nama). Berikan role admin hanya kepada akun yang dipercaya. Jangan rerun file 01 atau 03 tanpa memahami keadaan database.

## 2. Konfigurasi aplikasi

1. Install Node.js 24.22.1+ dan pnpm 10. Extract proyek lalu jalankan `pnpm install --frozen-lockfile`.
2. Buat `.env.local` di komputer sendiri untuk URL project, publishable key, secret server dan Gmail admin. File environment tidak disertakan di Git.
3. Isi `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` menggunakan publishable key atau legacy anon key dari Supabase Dashboard → Project Settings → API Keys.
4. Agar admin bisa **membuat akun Auth client langsung dari aplikasi**, isi `SUPABASE_SERVICE_ROLE_KEY` dengan server secret/service_role key project di `.env.local` atau environment server hosting. Key ini hanya untuk server, sangat sensitif, dan dapat melewati RLS. Jangan kirim lewat chat, jangan commit `.env.local`, jangan tampilkan di browser, dan jangan pernah memakai prefix `NEXT_PUBLIC_` untuk secret. Tanpa secret server, pembuatan dan reset kode client melalui aplikasi tidak tersedia.
5. Jalankan `pnpm dev`. Buka `http://localhost:3000/admin/login` untuk admin dan `http://localhost:3000/login` untuk client. `/preview` adalah tampilan read-only dengan data dummy dan tidak menulis ke database.
6. Untuk hosting atur URL dan publishable key sebelum build, set secret hanya di environment server, lalu jalankan `pnpm build` dan `pnpm start`. Gunakan HTTPS. Konfigurasi URL/redirect Supabase Auth sesuai deployment.

## 3. Alur admin dan client

- Login admin dan client dipisah: `/admin/login` hanya menerima profil admin aktif dan `/login` hanya menerima profil client aktif. Route dashboard/portal juga mengecek role, sedangkan RLS tetap menjadi kontrol data.
- Admin dapat membuat order, mengedit status/deadline/harga/pembayaran, menyimpan catatan internal, upload dan membagikan dokumen, dan memproses revisi.
- Untuk client baru: login admin → Client → Tambah profil. Isi nama, universitas dan nomor HP; kode akses acak ditampilkan sekali. Lihat `PANDUAN-LOGIN-CLIENT.md`.
- Client lama yang sudah memiliki akun email tetap dapat login melalui pilihan akun lama. Akun phone-only yang cocok dapat disiapkan melalui Reset kode; lihat panduan.
- Client melihat pesanan dan dokumen miliknya, mengunduh dokumen yang telah dibagikan, mengajukan revisi saat order review/selesai, serta mengubah password. Kode client/order CL-/ORD- adalah ID, bukan kode akses rahasia untuk login.

## 4. Verifikasi sebelum data asli

- Build dan TypeScript lulus. UI desktop/mobile diuji. Login admin/client, penolakan login role yang salah, pembuatan akun client, upload/bagikan dokumen dan pengajuan revisi diuji menggunakan **server tiruan lokal**, bukan Supabase nyata. SQL 03 telah dicek sintaksnya, tetapi belum dijalankan pada project nyata. Database, RLS efektif, Storage, credentials, email dan session project Anda masih wajib diuji.
- Pakai dua client dummy dan satu admin. Uji lewat API/Storage langsung bahwa A tidak dapat membaca atau mengunduh data B, bahwa revoked tidak bisa mengakses data privat, dan bahwa file internal tidak dapat dibaca client. Lihat `TES-SEBELUM-PRODUKSI.md`. Tinjau policy Storage yang sudah ada, karena policy lain yang permisif dapat membuka akses.
- Setelah SQL 03 dipasang, coba buat profil admin kedua di project uji dan pastikan database menolak; jangan melakukan tes ini di project produksi tanpa backup dan rencana rollback.
- Nomor client tidak diverifikasi otomatis; admin perlu memverifikasi identitas dan nomor secara terpisah. Aktifkan dan uji pengamanan akun yang sesuai di Supabase Auth, misalnya MFA untuk admin dan pembatasan percobaan login.
- Server secret melewati RLS. Endpoint pembuatan client memvalidasi sesi dan role admin di server sebelum menggunakan key, serta hanya membuat role client. Lindungi hosting dan environment; akses dashboard Supabase/service role tetap sangat berkuasa dan di luar pembatasan login UI.
- Upload objek Storage dan metadata adalah operasi terpisah. Kode mencoba membersihkan file jika metadata gagal, tapi admin tetap perlu memeriksa file yatim jika cleanup gagal. Pembuatan Auth dan profil juga dua operasi: saat profil gagal, sistem mencoba membatalkan akun Auth yang baru dibuat; gangguan jaringan tetap bisa meninggalkan akun yatim untuk diperiksa manual.
- Belum tersedia email undangan/verifikasi otomatis, forced password reset, password recovery, notifikasi, payment gateway, audit log, batas revisi, hapus order/file, dan migrasi Payload. File yang telah diunduh tidak dapat ditarik kembali.
- Total memuat data per 500 baris hingga 50.000 baris per jenis; skala lebih besar butuh pagination/agregasi server. Deadline form ditafsirkan WIB, harga adalah rupiah bulat.
- Ini belum diaudit untuk produksi. Jangan gunakan data sensitif sebelum konfigurasi, backup, dan tes akses selesai.

## Struktur penting

- `src/app/(frontend)/admin/login/` dan `login/` — dua halaman login.
- `src/app/(frontend)/admin/client-actions.ts` — pembuatan akun client di server setelah verifikasi admin. Jangan pindahkan ke kode browser.
- `src/app/(frontend)/dashboard/`, `portal/` — pemeriksaan role server.
- `src/components/workspace.tsx` — form/admin/client dan integrasi Supabase.
- `src/lib/supabase/`, `src/proxy.ts` — koneksi dan refresh sesi.
- `supabase/03_satu_admin.sql` — migrasi tambahan, hanya diterapkan manual.

Payload routes/collections/dependencies dihapus dari salinan aplikasi ini; ZIP Figma asli tetap terpisah. Tidak ada data Payload yang dihapus oleh pekerjaan ini.
