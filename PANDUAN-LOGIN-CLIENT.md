# Login client: nomor HP + kode akses

## Sebelum mencoba
1. Backup project dan uji dengan data dummy. Jalankan `supabase/04_universitas_client.sql` di Supabase SQL Editor. Jangan jalankan ulang SQL 01. Ini hanya menambah kolom universitas; akun dan data lama tidak dihapus.
2. Pada Supabase Authentication > Providers, aktifkan Phone Auth. Supabase dapat meminta konfigurasi provider SMS. Alur saat ini tidak mengirim SMS; admin mengonfirmasi nomor secara manual saat membuat akun. Verifikasi identitas dan nomor client di luar aplikasi sebelum memberi akses.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` pada `.env.local` di server; yang terakhir boleh `sb_secret_…`. Jangan pernah commit file ini atau kirim secret ke chat. Restart server setelah mengubah environment.
4. Login admin yang sudah ada (email + password) tetap di `/admin/login`. Di Client > Tambah profil isi nama, universitas, dan nomor Indonesia. Kode acak akan ditampilkan sekali. Kirim kode ke client melalui kanal aman. Nomor Indonesia dapat ditulis 08…, 628…, atau +628….
5. Client masuk di `/login` dengan nomor dan kode. Identitas CL-… hanyalah ID yang dapat dilihat, bukan kode akses. Kode akses adalah password yang hanya disimpan oleh Supabase Auth dalam bentuk yang dikelola Auth, bukan pada tabel profil.
6. Jika kode hilang, admin dapat reset di daftar client setelah verifikasi identitas. Kode lama tidak dapat dipakai untuk login baru; jangan anggap sesi yang masih aktif langsung tercabut. Untuk insiden, cabut akses profil dan tangani sesi di Supabase.

## Akun lama
Akun client email yang sudah ada tidak dihapus. Form client menyediakan pilihan login email untuk akun lama; mereka tidak otomatis mendapat nomor Auth atau kode baru. Migrasi akun lama perlu proses terpisah dan verifikasi identitas. Jangan buat akun baru untuk client lama tanpa rencana pengalihan order/dokumen.

## Keamanan dan pengujian
- Kode acak 96 bit ditampilkan satu kali, bukan CL-… yang mudah ditebak. Simpan/kirim seperti password; jangan tulis di order, log atau chat publik.
- Pembuatan akun ini tidak memverifikasi kepemilikan nomor atau mengirim OTP; admin bertanggung jawab memeriksa identitas. Supabase menganjurkan MFA untuk autentikasi berbasis nomor telepon; fitur MFA belum dibuat di aplikasi ini. Sesuaikan rate limit Auth, CAPTCHA/WAF bila diperlukan dan monitor penyalahgunaan sebelum produksi.
- Auth dan profil ditulis terpisah: kegagalan jaringan bisa meninggalkan akun Auth yatim; periksa jika terjadi error.
- Uji dengan Supabase nyata: buat 2 client dummy, login benar/salah, reset, akses dicabut, masing-masing hanya dapat data dan file yang dibagikan ke mereka, serta admin tetap login dengan email. Jangan gunakan dokumen sensitif sampai RLS dan Storage telah diaudit.
