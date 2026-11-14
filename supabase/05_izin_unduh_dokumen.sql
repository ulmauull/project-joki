-- Izin unduh pada antarmuka. Uji di project percobaan dan backup dulu.
-- Jalankan sekali setelah 01_schema_dan_akses.sql; jangan rerun 01 di database existing.
-- Dokumen lama maupun baru default false; tidak mengubah data atau policy Storage lainnya.
-- Ini bukan proteksi unduh di Storage: file yang dipreview dikirim ke browser.
begin;
alter table public.rapi_documents
  add column download_allowed boolean not null default false;
commit;
