# Backend Admin Dashboard Rebuild Plan

Dokumen ini menjadi dasar pengembangan ulang backend dan dashboard admin Website Fakultas Filsafat Teologi UASN.

## Tujuan

Backend akan dibangun ulang secara bertahap agar lebih rapi, aman, mudah dirawat, dan terhubung langsung dengan seluruh fitur frontend. Sistem lama tidak langsung dihapus, karena backend saat ini masih berfungsi untuk login admin, data dekan, data dosen, berita, banner informasi, dan API publik.

## Masalah Backend Saat Ini

Sebagian besar route, model, dan logic masih berada di satu file besar, yaitu backend/app.py. Struktur ini dapat berjalan, tetapi kurang ideal untuk pengembangan jangka panjang karena sulit diuji, sulit dipisahkan, dan rawan konflik ketika fitur baru ditambahkan.

## Modul Admin Target

Modul admin yang wajib tersedia adalah:

1. Auth Admin
2. Dashboard Utama
3. Data Dekan
4. Data Dosen
5. Data Berita
6. Banner Informasi
7. E-Brochure
8. Papan Peringkat
9. Testimoni
10. Kontak
11. Upload Manager
12. Audit Log

## Struktur Backend Target

```text
backend/
├── app.py
├── config.py
├── extensions.py
├── routes/
├── models/
├── services/
├── controllers/
├── utils/
├── templates/
└── static/