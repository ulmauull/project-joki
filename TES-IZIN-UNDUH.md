# Checklist izin unduh dokumen (project uji)

Gunakan satu admin dan dua client dummy serta file PDF dan gambar dummy. Jalankan migrasi `supabase/05_izin_unduh_dokumen.sql` sebelum tes. Jangan pakai data sensitif.

1. Unggah file baru dan bagikan ke client A. Pastikan secara default tombol Unduh client nonaktif dan preview terbuka; pastikan toolbar PDF tidak muncul di Chrome desktop. Admin tetap bisa preview dan unduh file internal maupun dibagikan.
2. Admin tekan Izinkan unduh dan konfirmasi; setelah client A refresh, tombol Unduh aktif dan file dapat diunduh. Pastikan format yang browser tidak bisa preview tetap dapat diunduh setelah diizinkan.
3. Admin cabut izin; di client yang belum refresh, klik Unduh harus gagal karena pemeriksaan ulang metadata. Setelah refresh tombol nonaktif. Sembunyikan dan bagikan ulang, izin harus tetap nonaktif sampai disetujui lagi.
4. Client B dan client revoked tidak boleh mendapatkan metadata atau file A lewat API/Storage. Client A tidak boleh memperbarui `download_allowed` secara langsung. Verifikasi RLS dan semua policy lain di project nyata.
5. PDF dengan izin nonaktif tetap terkirim ke browser untuk preview. Uji browser lain; sebagian viewer mungkin mengabaikan toolbar=0. Pengaturan ini bukan pencegahan akses Storage langsung, unduh lewat developer tools, fungsi browser atau screenshot.
