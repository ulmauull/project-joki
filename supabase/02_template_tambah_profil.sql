-- CONTOH MANUAL: JANGAN jalankan placeholder ini tanpa mengganti nilai.
-- 1. Buat akun melalui Supabase Dashboard > Authentication > Users (atau mekanisme aman).
-- 2. Salin User UUID dari Auth. Pilih salah satu perintah di bawah.
-- Perintah dijalankan di SQL Editor oleh operator project, BUKAN dari browser client.
-- Ganti UUID dan nama sesuai akun. Jangan masukkan password atau service key ke file ini.

-- ADMIN PERTAMA (jalankan hanya untuk akun lo sendiri yang benar):
-- insert into public.rapi_profiles (id, name, role, status)
-- values ('GANTI-DENGAN-UUID-USER'::uuid, 'Nama Admin', 'admin', 'active');

-- CLIENT (buat satu profil untuk tiap akun yang diberi akses):
-- insert into public.rapi_profiles (id, name, role, status)
-- values ('GANTI-DENGAN-UUID-USER'::uuid, 'Nama Client', 'client', 'active');

-- Lihat profil aplikasi (SQL editor adalah operator tepercaya):
-- select id, client_code, name, role, status from public.rapi_profiles order by created_at;
-- Cabut akses suatu akun (gantikan UUID, bukan client_code):
-- update public.rapi_profiles set status='revoked' where id='GANTI-DENGAN-UUID-USER'::uuid;
