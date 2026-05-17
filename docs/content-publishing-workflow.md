# Alur Upload, Draft, Preview, Publish, dan Jadwal Tayang

Dokumen ini menjadi acuan pengembangan sistem pengelolaan berita dan banner pada Admin Dashboard FFT UASN Content Center.

## Tujuan Sistem

Sistem upload berita dan banner harus memungkinkan admin menyiapkan konten terlebih dahulu tanpa langsung menampilkannya ke frontend.

Frontend publik hanya boleh berubah setelah konten benar-benar dipublish.

## Opsi Utama Konten

### Publikasi Langsung

Publikasi langsung digunakan ketika admin ingin langsung menayangkan berita atau banner.

Alur:
- Admin isi data.
- Admin upload media.
- Admin atur media atau crop jika diperlukan.
- Admin preview tampilan frontend.
- Admin klik Publish.
- Konten tampil di website.

### Simpan sebagai Draft

Draft digunakan ketika admin ingin menyiapkan konten tanpa langsung menayangkannya.

Alur:
- Admin isi data.
- Admin upload media.
- Admin preview sementara.
- Admin klik Simpan Draft.
- Konten tersimpan di admin.
- Konten belum tampil di frontend.
- Admin bisa edit lagi kapan saja.
- Admin publish manual atau jadwalkan tayang.

## Jadwal Tayang

Draft dapat memiliki jadwal tayang atau tidak memiliki jadwal.

Jika admin menentukan tanggal dan jam tayang, status konten berubah menjadi terjadwal.

Alur:
- Admin simpan draft.
- Admin pilih tanggal dan jam tayang.
- Konten masuk status Terjadwal.
- Sistem menunggu waktu tayang.
- Saat waktu tiba, sistem publish otomatis.
- Frontend diperbarui.

## Status Konten

- draft: tersimpan di admin, belum tampil di frontend.
- scheduled: sudah dijadwalkan, belum tampil di frontend.
- published: sudah tampil di frontend.
- archived: disimpan sebagai arsip, tidak tampil di frontend.
- failed: gagal dipublish otomatis.

## Halaman Draft

Rencana halaman:
- /admin/banner/drafts
- /admin/berita/drafts

Fitur halaman draft:
- Melihat semua draft.
- Melihat draft tanpa jadwal.
- Melihat draft terjadwal.
- Preview draft.
- Edit draft.
- Publish sekarang.
- Jadwalkan tayang.
- Batalkan jadwal.
- Arsipkan konten.

## Aturan Frontend

Save Draft tidak boleh mengubah frontend.

Preview Draft tidak boleh mengubah frontend.

Schedule tidak boleh mengubah frontend sebelum waktunya.

Publish baru boleh mengubah frontend.

Untuk banner, frontend membaca snapshot published:

backend/static/published/banner_informasi.json

Untuk berita, frontend hanya membaca berita dengan status published.

## Alur Banner

- Admin buka Kelola Banner.
- Admin upload atau edit banner.
- Admin klik Simpan Draft.
- Draft tersimpan di database.
- Frontend tetap menggunakan banner published lama.
- Admin klik Preview Draft.
- Admin cek tampilan desktop dan mobile.
- Admin pilih Publish Sekarang, Jadwalkan Tayang, atau Edit Lagi.

## Alur Berita

- Admin buat berita.
- Isi judul, kategori, isi berita.
- Pilih tipe berita.
- Upload media.
- Crop media jika diperlukan.
- Preview hasil berita.
- Pilih Simpan Draft, Publish Sekarang, atau Jadwalkan Tayang.

## Implementasi Bertahap

### Tahap 1

Fondasi status publishing:
- draft
- scheduled
- published
- archived
- failed

### Tahap 2

Perbaiki alur banner:
- Simpan Draft
- Preview Draft
- Publish Sekarang
- Jadwalkan Tayang
- Halaman Draft Banner

### Tahap 3

Perbaiki alur berita:
- Simpan Draft
- Preview Draft
- Publish Sekarang
- Jadwalkan Tayang
- Halaman Draft Berita

### Tahap 4

Media dan crop:
- Simpan original media
- Crop manual
- Simpan hasil crop
- Preview sesuai frontend

### Tahap 5

Scheduler:
- Cek konten scheduled
- Publish otomatis saat waktu tiba
- Tandai failed jika gagal publish
