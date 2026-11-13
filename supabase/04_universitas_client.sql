-- Tambahan untuk skema 01 yang sudah terpasang. Backup dan uji dulu.
-- Tidak mengubah atau menghapus data/akun lama.
begin;
alter table public.rapi_profiles add column if not exists university text;
commit;
