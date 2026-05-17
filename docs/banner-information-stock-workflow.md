# Konsep Alur Banner Informasi

Dokumen ini menjadi acuan perbaikan UI/UX fitur Banner Informasi pada Admin Dashboard FFT UASN Content Center.

## Tujuan

Fitur banner harus mudah dipahami oleh admin non-teknis. Karena banner informasi hanya memiliki satu slot utama yang tampil di frontend, alur draft dan jadwal tayang tidak perlu ditampilkan sebagai istilah utama.

Istilah yang digunakan pada UI:

- Banner yang Sedang Tampil
- Edit Link Tujuan
- Sembunyikan Banner
- Stok Banner
- Tambah Stok Banner
- Preview
- Jadikan Banner Tampil

## Alur Utama

Admin tidak perlu memahami istilah teknis seperti draft, scheduled, atau publish status.

Alur yang digunakan:

1. Admin melihat banner yang sedang tampil sekarang.
2. Admin dapat mengubah link tujuan banner yang sedang tampil.
3. Admin dapat menyembunyikan banner yang sedang tampil.
4. Admin dapat menambahkan stok banner baru.
5. Admin dapat melihat daftar stok banner yang sudah disiapkan.
6. Admin dapat melakukan preview stok banner.
7. Admin dapat memilih salah satu stok banner untuk dijadikan banner yang tampil di website.

## Banner yang Sedang Tampil

Bagian ini menampilkan banner yang benar-benar sedang muncul di frontend.

Informasi yang ditampilkan:

- Preview media banner.
- Link tujuan banner.
- Status tampil di website.
- Waktu terakhir diperbarui.

Aksi yang tersedia:

- Edit Link Tujuan
- Sembunyikan Banner
- Lihat Website

Catatan:

Edit pada bagian ini hanya digunakan untuk mengganti link tujuan, bukan mengganti gambar atau video banner.

## Stok Banner

Stok Banner adalah kumpulan banner yang sudah disiapkan, tetapi belum tampil di website.

Fungsi stok banner:

- Menyimpan banner cadangan.
- Menyiapkan banner untuk event atau informasi berikutnya.
- Memudahkan admin mengganti banner aktif tanpa upload ulang.

Informasi stok banner:

- Media banner.
- Link tujuan.
- Catatan admin.
- Tanggal ditambahkan.
- Status siap digunakan.

Aksi pada stok banner:

- Preview
- Edit
- Jadikan Banner Tampil
- Hapus dari Stok

## Tambah Stok Banner

Alur tambah stok banner:

1. Admin upload gambar atau video.
2. Admin mengisi link tujuan banner.
3. Admin dapat melihat preview.
4. Admin menyimpan banner ke stok.
5. Banner belum tampil di website sampai dipilih sebagai banner aktif.

Tombol yang digunakan:

- Simpan ke Stok
- Preview
- Batal

## Ganti Banner yang Sedang Tampil

Alur mengganti banner:

1. Admin membuka daftar Stok Banner.
2. Admin memilih banner yang sudah siap.
3. Admin melihat preview.
4. Admin klik Jadikan Banner Tampil.
5. Banner lama diganti dengan banner baru.
6. Frontend menampilkan banner baru.

## Kesimpulan UI

Untuk fitur Banner Informasi, UI tidak memakai istilah:

- Draft
- Scheduled
- Publish Status
- Simpan di Admin

Istilah tersebut boleh tetap digunakan secara internal di backend, tetapi tidak ditampilkan sebagai istilah utama kepada admin.
