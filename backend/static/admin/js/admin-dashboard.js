(function () {
  "use strict";

  const features = [
    ["OV", "dashboard", "Ringkasan Dashboard", "Pusat informasi cepat untuk melihat status berita, dosen, banner, ranking, testimoni, dan konten penting.", "Siap", "/admin/choose"],
    ["QA", "dashboard", "Quick Action Center", "Akses cepat untuk tambah berita, upload banner, tambah dosen, update e-brochure, dan publish konten.", "Konsep", null],
    ["PF", "security", "Profil Admin", "Mengelola nama admin, email, foto, preferensi dashboard, dan riwayat aktivitas pribadi.", "Konsep", null],
    ["AU", "security", "Autentikasi Admin", "Login, logout, validasi session, dan proteksi halaman admin agar hanya pengguna sah yang bisa masuk.", "Fondasi", "/admin/login"],
    ["RL", "security", "Role dan Permission", "Mengatur hak akses Super Admin, Editor Berita, Operator Dosen, dan Viewer agar pengelolaan lebih aman.", "Konsep", null],
    ["DK", "content", "Data Dekan", "Mengelola profil dekan, foto formal, foto frontend, jabatan, biodata, dan status publish.", "Ada", "/admin/dekan"],
    ["DS", "content", "Data Dosen", "Mengelola profil dosen, foto, thumbnail, bidang keahlian, biodata, dan urutan tampil di frontend.", "Ada", "/admin/dosen"],
    ["BR", "content", "Kelola Berita", "CRUD berita, thumbnail, gambar detail, tag New, draft, publish, dan sinkronisasi ke frontend.", "Ada", "/admin/berita/list"],
    ["BI", "content", "Banner Informasi", "Mengelola banner informasi utama, media video atau gambar, status aktif, urutan tampil, dan jadwal publikasi.", "Ada", "/admin/banner-informasi"],
    ["EB", "content", "E-Brochure Manager", "Upload file brosur, cover, metadata, tombol download, share, dan viewer e-brochure frontend.", "Konsep", null],
    ["KR", "academic", "Kurikulum", "Mengelola struktur kurikulum, daftar mata kuliah, semester, SKS, dan catatan akademik.", "Konsep", null],
    ["KA", "academic", "Kalender Akademik", "Mengatur agenda akademik, tanggal penting, masa pendaftaran, ujian, dan kegiatan fakultas.", "Konsep", null],
    ["AA", "academic", "Aturan Akademik", "Mengelola peraturan akademik, pedoman mahasiswa, tata tertib, dan dokumen resmi.", "Konsep", null],
    ["AP", "admission", "Alur Pendaftaran", "Mengelola tahapan pendaftaran, persyaratan, jadwal, dan informasi kontak penerimaan.", "Konsep", null],
    ["PR", "admission", "Persyaratan Masuk", "Mengelola dokumen syarat masuk, biaya, berkas, dan informasi calon mahasiswa.", "Konsep", null],
    ["SP", "admission", "Simulasi Pendaftaran", "Mengatur simulasi alur pendaftaran offline, estimasi kebutuhan dokumen, dan informasi langkah calon mahasiswa.", "Konsep", null],
    ["QF", "frontend", "Quick Facts", "Mengelola angka statistik fakultas seperti jumlah mahasiswa, alumni, dosen, program, dan data penting lain.", "Konsep", null],
    ["RK", "frontend", "Papan Peringkat", "Mengelola ranking akademik semester, foto mahasiswa, GPA, tahun akademik, dan mode poster.", "Konsep", null],
    ["TS", "frontend", "Testimoni", "Mengelola testimoni mahasiswa, alumni, foto, kutipan, status tampil, dan urutan carousel.", "Konsep", null],
    ["KT", "frontend", "Kontak Fakultas", "Mengelola alamat, email, nomor telepon, WhatsApp, peta, dan jam layanan.", "Konsep", null],
    ["GL", "media", "Galeri Kegiatan", "Mengelola foto kegiatan, organisasi, dosen, mahasiswa, dan dokumentasi fakultas.", "Konsep", null],
    ["OR", "media", "Organisasi Mahasiswa", "Mengelola konten HIMA FFT, logo organisasi, deskripsi, kegiatan, dan struktur organisasi.", "Konsep", null],
    ["MM", "media", "Media Library", "Pusat file untuk gambar, video, dokumen, ikon, brosur, dan validasi ukuran file.", "Konsep", null],
    ["PV", "workflow", "Preview dan Publish", "Menyediakan alur draft, preview, validasi, publish, unpublish, dan rollback konten.", "Konsep", null],
    ["LG", "workflow", "Bahasa ID dan EN", "Mengelola konten bilingual agar semua halaman bisa tampil dalam Bahasa Indonesia dan English.", "Konsep", null],
    ["SC", "workflow", "Scroll Top dan UI Feature", "Mengontrol fitur frontend seperti scroll top, language switcher, popup, dan komponen UI lintas halaman.", "Konsep", null],
    ["AN", "analytics", "Analytics Konten", "Melihat jumlah klik, halaman populer, berita paling sering dibuka, dan performa konten.", "Fondasi", "/api/get-click-analytics"],
    ["AL", "security", "Audit Log", "Mencatat aktivitas admin seperti login, tambah, edit, hapus, publish, dan upload file.", "Konsep", null],
    ["BK", "system", "Backup dan Restore", "Membuat backup database, restore data, dan arsip konten sebelum perubahan besar.", "Konsep", null],
    ["ST", "system", "Pengaturan Website", "Mengelola identitas website, SEO dasar, mode maintenance, metadata, dan konfigurasi umum.", "Konsep", null]
  ];

  const state = {
    category: "all",
    query: ""
  };

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function hideLoader() {
    const loader = qs("[data-admin-loader]");
    if (!loader) return;

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 1700);
  }

  function setStats() {
    const total = features.length;
    const ready = features.filter(function (item) {
      return ["Ada", "Siap", "Fondasi"].includes(item[4]);
    }).length;
    const concept = features.filter(function (item) {
      return item[4] === "Konsep";
    }).length;
    const connected = features.filter(function (item) {
      return Boolean(item[5]);
    }).length;

    const map = {
      totalFeatures: total,
      readyFeatures: ready,
      conceptFeatures: concept,
      connectedFeatures: connected
    };

    Object.keys(map).forEach(function (key) {
      const target = qs("[data-stat='" + key + "']");
      if (target) target.textContent = map[key];
    });
  }

  function filteredFeatures() {
    return features.filter(function (item) {
      const categoryMatch = state.category === "all" || item[1] === state.category;
      const text = item.join(" ").toLowerCase();
      const queryMatch = !state.query || text.includes(state.query);
      return categoryMatch && queryMatch;
    });
  }

  function renderFeatures() {
    const grid = qs("[data-feature-grid]");
    const empty = qs("[data-empty-state]");
    if (!grid) return;

    const data = filteredFeatures();

    grid.innerHTML = data.map(function (item, index) {
      const route = item[5];
      const routeButton = route
        ? '<a href="' + route + '">Buka</a>'
        : '<button type="button" data-feature-detail="' + item[0] + '">Detail</button>';

      return [
        '<article class="fft-feature" data-card="' + item[0] + '" style="animation-delay:' + (index * 20) + 'ms">',
        '  <div class="fft-feature__top">',
        '    <span class="fft-feature__code">' + item[0] + '</span>',
        '    <span class="fft-feature__status">' + item[4] + '</span>',
        '  </div>',
        '  <h3>' + item[2] + '</h3>',
        '  <p>' + item[3] + '</p>',
        '  <div class="fft-feature__actions">',
        '    ' + routeButton,
        '    <button type="button" data-feature-detail="' + item[0] + '">Lihat Konsep</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    if (empty) {
      empty.hidden = data.length > 0;
    }

    bindFeatureDetailButtons();
  }

  function bindFilters() {
    qsa("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.category = button.getAttribute("data-filter") || "all";

        qsa("[data-filter]").forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");
        renderFeatures();
      });
    });
  }

  function bindSearch() {
    const search = qs("[data-feature-search]");
    if (!search) return;

    search.addEventListener("input", function () {
      state.query = search.value.trim().toLowerCase();
      renderFeatures();
    });
  }

  function openModal(code) {
    const modal = qs("[data-modal]");
    const title = qs("[data-modal-title]");
    const body = qs("[data-modal-body]");
    const footer = qs("[data-modal-footer]");
    const feature = features.find(function (item) {
      return item[0] === code;
    });

    if (!modal || !feature) return;

    title.textContent = feature[2];

    body.innerHTML = [
      '<p>' + feature[3] + '</p>',
      '<ul class="fft-modal__list">',
      '<li>Kategori: ' + feature[1] + '</li>',
      '<li>Status: ' + feature[4] + '</li>',
      '<li>Prioritas: disiapkan untuk integrasi backend bertahap.</li>',
      '<li>Tujuan: mempermudah admin mengelola konten tanpa membuka file coding manual.</li>',
      '</ul>'
    ].join("");

    footer.innerHTML = feature[5]
      ? '<a class="fft-btn" href="' + feature[5] + '">Buka Route Admin</a><button class="fft-btn" type="button" data-modal-close>Tutup</button>'
      : '<button class="fft-btn" type="button" data-modal-close>Tutup</button>';

    modal.classList.add("is-open");
    bindCloseModal();
  }

  function bindFeatureDetailButtons() {
    qsa("[data-feature-detail]").forEach(function (button) {
      button.addEventListener("click", function () {
        openModal(button.getAttribute("data-feature-detail"));
      });
    });
  }

  function bindCloseModal() {
    qsa("[data-modal-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        const modal = qs("[data-modal]");
        if (modal) modal.classList.remove("is-open");
      });
    });
  }

  function bindSidebar() {
    qsa("[data-sidebar-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        const category = button.getAttribute("data-sidebar-filter") || "all";
        const filterButton = qs("[data-filter='" + category + "']");

        qsa("[data-sidebar-filter]").forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");

        if (filterButton) {
          filterButton.click();
        } else {
          state.category = category;
          renderFeatures();
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function init() {
    setStats();
    bindFilters();
    bindSearch();
    bindSidebar();
    bindCloseModal();
    renderFeatures();
    hideLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
