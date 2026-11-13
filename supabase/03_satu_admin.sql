-- MIGRASI TAMBAHAN. Jalankan setelah 01_schema_dan_akses.sql.
-- Backup dulu. Tidak menghapus atau mengubah data akun.
-- Jalankan SELECT berikut secara terpisah untuk meninjau admin yang sudah ada:
-- select id, name, status from public.rapi_profiles where role = 'admin';
-- Jika jumlah > 1, migrasi akan gagal. Tentukan admin yang ingin dipertahankan
-- dan atur akun lain secara sengaja SEBELUM menjalankan migrasi; jangan hapus sembarang.
-- Aturan ini membatasi MAKSIMAL satu profil admin, termasuk admin yang revoked.
-- Nol admin masih mungkin; bootstrap administrator dilakukan secara tepercaya.
-- Nama index sengaja bukan IF NOT EXISTS agar konflik tak disembunyikan.
begin;
create unique index rapi_profiles_single_admin on public.rapi_profiles ((role)) where role = 'admin';
commit;
