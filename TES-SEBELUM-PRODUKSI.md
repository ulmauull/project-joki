# Checklist uji di project percobaan

Gunakan minimal satu admin, dua client aktif A/B, dan satu client revoked; semuanya akun dummy. Bukan sekadar memeriksa UI: panggil Supabase API langsung memakai sesi masing-masing.

1. Admin login, buat order untuk A dan B dengan deadline internal valid, masukkan pembayaran. Nilai negatif, bayar lebih besar dari harga, dan deadline internal lewat deadline client harus ditolak.
2. Uji admin membuat deadline internal lalu mengubah deadline client menjadi lebih awal: harus ditolak. Uji dua perubahan bersamaan untuk melihat perilaku locking.
3. Client A hanya membaca profil dan order A; tebak UUID/kode order B dan query langsung: tidak boleh melihatnya. Client B begitu juga sebaliknya.
4. Client tak bisa update profil/role/status, membuat/mengubah order atau membaca `rapi_order_internal`, walau memanggil REST API langsung.
5. Admin unggah dokumen private serta dokumen yang dibagikan untuk A. A hanya bisa unduh yang dibagikan; B tidak bisa mengunduh file A, termasuk jika tahu path objek. Uji metadata dan Storage API, serta cek policy lain yang mungkin terlalu luas.
6. Client revoked, termasuk sesi yang sudah terbit sebelum revoke, tidak dapat membaca order, metadata, atau mengunduh objek melalui request baru. Uji terpisah setiap signed URL yang sudah terbit dan catat masa berlakunya.
7. A bisa mengajukan revisi untuk order A berstatus review/completed, tidak bisa untuk order B atau status lain, serta tidak bisa memilih status revisi atau mengubah status setelah insert. Admin dapat memperbarui status.
8. Buat order/client paralel; kode yang dihasilkan berbeda. Cek import data lama tidak menyebabkan bentrok sequence.
9. Uji daftar dan total pada jumlah data melebihi satu halaman dan batas default API. Periksa waktu/format mata uang dan relasi.
10. Uji layout 390px dan desktop, loading/error/empty state, keyboard, serta unggah gagal dan pembersihan file yatim.

Tidak ada klaim bahwa tes ini sudah dijalankan; ini adalah daftar yang harus dijalankan sebelum menyimpan data asli.

11. Pastikan akun admin tidak bisa login pada form client dan akun client tidak bisa login pada form admin; uji akses route langsung, logout, dan perubahan password.
12. Cek role admin kedua ditolak setelah migrasi 03 (hanya di project uji). Tes pembuatan akun client memakai server secret, uji non-admin tidak dapat memanggil aksi server, dan uji pemulihan bila Auth atau profil gagal dibuat.
