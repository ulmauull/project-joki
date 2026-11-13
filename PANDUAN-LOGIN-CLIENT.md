# Login client: nomor HP + kode akses tanpa SMS

## Persiapan
1. Backup project dan uji dengan data dummy. Jika belum dilakukan, jalankan `supabase/04_universitas_client.sql` di Supabase SQL Editor. Jangan jalankan ulang SQL 01. Migrasi 04 hanya menambah kolom universitas.
2. Di Supabase Authentication > Providers, pastikan Email Auth aktif (biasanya aktif secara default). Phone Auth dan provider SMS/Twilio tidak dibutuhkan. Fitur ini tidak mengirim SMS atau email kepada client dan tidak memverifikasi nomor client secara otomatis.
3. Pada `.env.local` di server, isi URL, publishable key, dan `SUPABASE_SERVICE_ROLE_KEY` (boleh `sb_secret_…`) seperti sebelumnya. Tambahkan `CLIENT_AUTH_GMAIL=alamatgmailanda@gmail.com` dengan Gmail **asli yang dimiliki dan dikuasai admin**, tanpa alias `+`, bukan milik client. Jangan kirim secret ke chat atau commit `.env.local`. Restart server setelah mengubah environment.
4. Sangat penting: jangan mengubah `CLIENT_AUTH_GMAIL` setelah client dibuat. Jika Gmail berubah, alias login client berubah dan akun tidak dapat login sampai dimigrasikan secara terencana. Simpan catatan konfigurasi ini dengan aman dan backup data.
5. Login admin di `/admin/login` pakai email + password. Di Client > Tambah profil isi nama, universitas dan nomor Indonesia. Kode akses acak ditampilkan sekali; salin dan kirim melalui kanal aman setelah memeriksa identitas client.
6. Client login di `/login` menggunakan nomor 08…, 628…, atau +628… dan kode akses. ID CL-… bukan kode akses. Jika kode hilang, admin bisa reset setelah verifikasi identitas. Kode lama tidak bisa dipakai login baru; sesi lama mungkin masih aktif. Untuk insiden, cabut akses profil dan tangani sesi di Supabase.

## Identitas internal dan akun lama
Aplikasi mengubah nomor menjadi alamat alias Gmail unik, misalnya `alamatadmin+tg628…@gmail.com`, lalu memakai email/password Supabase Auth. Alamat ini hanya identitas teknis, bukan email client. Gmail plus-alias menuju inbox admin yang sama; email keamanan/recovery bila pernah dipicu dapat sampai ke inbox itu. Lindungi Gmail admin dengan MFA, jangan klik tautan pemulihan yang tidak diminta. Tidak ada verifikasi kepemilikan nomor client.

Akun lama yang dibuat versi Phone Auth sebelumnya: bila profil memiliki nomor dan cocok dengan nomor di Auth, admin dapat pilih **Reset kode**. Aplikasi menambah identitas email internal pada Auth user yang sama dan membuat kode baru; UUID, profil, pesanan dan dokumen tidak sengaja diganti/dihapus. Kode lama tidak dipakai lagi. Coba dahulu pada akun dummy dan backup karena perubahan ini belum diuji di Supabase nyata. Jika akun lama sudah punya email lain atau nomor profil/Auth berbeda, sistem menolak dan tidak menimpa emailnya; perlu penanganan manual. Akun email lama tetap dapat menggunakan pilihan login email.

## Keamanan dan pengujian
- Kode acak 96 bit ditampilkan sekali dan digunakan sebagai password Supabase Auth; jangan taruh di profil, order, log, atau chat publik. Simpan dan kirim melalui kanal aman.
- Orang yang mendapat nomor + kode bisa masuk, karena tidak ada OTP/MFA di alur ini. Verifikasi identitas dan nomor secara manual sebelum berbagi/reset kode. Atur Auth rate limits dan pertimbangkan MFA serta proteksi percobaan login sebelum produksi.
- Agar orang luar tidak mendaftar sendiri, tinjau pengaturan public signups sesuai kebutuhan; admin provisioning tetap harus diuji setelah perubahan.
- Auth dan profil ditulis terpisah; kegagalan jaringan dapat meninggalkan akun Auth yatim. Jika error, periksa di Supabase.
- Uji dengan Supabase nyata: buat dua client dummy, login benar/salah, reset, migrasi satu akun phone-only dummy, akses dicabut, serta pastikan masing-masing hanya bisa melihat data/file yang dimiliki dan dibagikan. Lihat `TES-SEBELUM-PRODUKSI.md`. RLS dan Storage belum diaudit.
