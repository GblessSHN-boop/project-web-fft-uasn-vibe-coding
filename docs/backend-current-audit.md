# Backend Current Audit

Generated at: 2026-05-15 12:22:49

## Ringkasan

- Total route Flask: 32
- Route admin: 24
- Route API publik: 7
- Route publik non API: 1
- Total class: 5
- Model database terdeteksi: 5
- Total function terdeteksi: 110

## Model Database Terdeteksi

- Dekan
- Dosen
- SiteSetting
- Berita
- BannerInformasi

## Route Admin

- `admin_login`: `"/admin/login", methods=["GET", "POST"]`
- `admin_warning`: `"/admin/warning"`
- `admin_choose`: `"/admin/choose"`
- `admin_berita_choose`: `"/admin/berita"`
- `admin_banner_informasi`: `"/admin/banner-informasi"`
- `admin_banner_informasi_save`: `"/admin/banner-informasi/save", methods=["POST"]`
- `admin_banner_informasi_publish`: `"/admin/banner-informasi/publish", methods=["POST"]`
- `admin_dekan`: `"/admin/dekan", methods=["GET", "POST"]`
- `admin_dekan_export`: `"/admin/dekan/export"`
- `admin_dekan_delete_photo`: `"/admin/dekan/delete-photo/<photo_kind>", methods=["POST"]`
- `admin_dekan_publish`: `"/admin/dekan/publish", methods=["POST"]`
- `admin_dosen_list`: `"/admin/dosen"`
- `admin_dosen_new`: `"/admin/dosen/new", methods=["GET", "POST"]`
- `admin_dosen_edit`: `"/admin/dosen/<int:dosen_id>/edit", methods=["GET", "POST"]`
- `admin_dosen_export_biodata`: `"/admin/dosen/<int:dosen_id>/export-biodata", methods=["POST"]`
- `admin_dosen_delete`: `"/admin/dosen/<int:dosen_id>/delete", methods=["POST"]`
- `admin_logout`: `"/admin/logout"`
- `admin_dosen_publish`: `"/admin/dosen/publish", methods=["POST"]`
- `admin_berita_list`: `"/admin/berita/list"`
- `admin_berita_add`: `"/admin/berita/add"`
- `admin_berita_edit`: `"/admin/berita/edit/<int:berita_id>"`
- `admin_berita_delete`: `"/admin/berita/delete/<int:berita_id>", methods=["POST"]`
- `admin_berita_save`: `"/admin/berita/save", methods=["GET", "POST"]`
- `admin_berita_publish`: `"/admin/berita/publish", methods=["POST"]`

## Route API Publik

- `api_banner_informasi`: `"/api/banner-informasi"`
- `api_dekan`: `"/api/dekan"`
- `api_dosen`: `"/api/dosen"`
- `api_berita`: `"/api/berita"`
- `track_click`: `"/api/track-click", methods=["POST"]`
- `get_click_analytics`: `"/api/get-click-analytics", methods=["GET"]`
- `api_papan_peringkat`: `"/api/papan-peringkat") @app.route("/api/ranking-mahasiswa"`

## Route Publik Non API

- `home`: `"/"`

## Catatan Refactor

Refactor backend harus dilakukan bertahap. File app.py masih menjadi sumber utama sistem lama. Setiap pemindahan route, model, atau service wajib diuji setelah satu modul selesai agar login admin, API publik, upload, dan halaman frontend tetap normal.