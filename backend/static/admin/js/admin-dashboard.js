(function () {
  "use strict";

  const modules = [
    {
      key: "dashboard",
      title: "Dashboard Inti",
      features: [
        ["OV", "Ringkasan Statistik Sistem", "Melihat total konten, status publish, modul aktif, dan kondisi sistem secara cepat.", "Siap", "/admin/choose"],
        ["AC", "Aktivitas Terbaru", "Membaca riwayat aktivitas admin, perubahan konten, dan proses publish terakhir.", "Konsep", null],
        ["NT", "Notifikasi dan Alert", "Menampilkan konten yang menunggu review, file bermasalah, dan data yang belum lengkap.", "Konsep", null],
        ["QS", "Pencarian Cepat", "Mencari fitur dashboard, data konten, dosen, berita, atau pengaturan dari satu tempat.", "Siap", null]
      ]
    },
    {
      key: "content",
      title: "Konten dan Publikasi",
      features: [
        ["BR", "Kelola Berita", "Tambah, edit, hapus, draft, publish, thumbnail, tag New, dan sinkronisasi berita ke frontend.", "Ada", "/admin/berita/list"],
        ["BI", "Kelola Banner Utama", "Mengatur banner informasi berupa gambar atau video, status aktif, urutan, dan jadwal tampil.", "Ada", "/admin/banner-informasi"],
        ["KB", "Kategori Berita", "Mengelompokkan berita berdasarkan kategori agar arsip dan pencarian lebih terstruktur.", "Konsep", null],
        ["TG", "Tag Berita", "Mengatur label berita seperti New, Akademik, Pengumuman, Kegiatan, dan Pendaftaran.", "Konsep", null],
        ["HS", "Halaman Statis", "Mengelola konten halaman tetap seperti tentang fakultas, visi misi, dan informasi umum.", "Konsep", null],
        ["PG", "Pengumuman Penting", "Menerbitkan pengumuman singkat yang perlu tampil cepat pada halaman utama.", "Konsep", null]
      ]
    },
    {
      key: "academic",
      title: "Akademik",
      features: [
        ["DK", "Data Dekan", "Mengelola identitas dekan, foto formal, foto frontend, jabatan, dan biodata.", "Ada", "/admin/dekan"],
        ["DS", "Data Dosen", "Mengelola profil dosen, foto, thumbnail, bidang keahlian, status, dan urutan tampil.", "Ada", "/admin/dosen"],
        ["KR", "Kurikulum", "Mengatur daftar mata kuliah, semester, SKS, dan struktur kurikulum program studi.", "Konsep", null],
        ["KA", "Kalender Akademik", "Mengelola tanggal penting, kegiatan akademik, ujian, dan periode administrasi.", "Konsep", null],
        ["AA", "Aturan Akademik", "Mengelola pedoman akademik, tata tertib, dan dokumen aturan fakultas.", "Konsep", null]
      ]
    },
    {
      key: "admission",
      title: "Pendaftaran",
      features: [
        ["AP", "Alur Pendaftaran", "Mengelola tahapan pendaftaran calon mahasiswa dari informasi awal sampai registrasi.", "Konsep", null],
        ["PR", "Persyaratan Masuk", "Mengatur syarat dokumen, biaya, ketentuan, dan informasi penerimaan mahasiswa baru.", "Konsep", null],
        ["SP", "Simulasi Pendaftaran", "Menyediakan simulasi alur pendaftaran offline agar calon mahasiswa memahami prosesnya.", "Konsep", null],
        ["FQ", "FAQ Pendaftaran", "Mengelola pertanyaan umum tentang biaya, dokumen, jadwal, dan kontak penerimaan.", "Konsep", null]
      ]
    },
    {
      key: "frontend",
      title: "Frontend Website",
      features: [
        ["QF", "Quick Facts", "Mengatur statistik singkat fakultas seperti dosen, mahasiswa, alumni, program, dan capaian.", "Konsep", null],
        ["RK", "Papan Peringkat", "Mengelola ranking GPA semester, foto mahasiswa, tahun akademik, dan mode poster.", "Konsep", null],
        ["TS", "Testimoni", "Mengelola testimoni mahasiswa dan alumni, foto, kutipan, status, dan urutan tampil.", "Konsep", null],
        ["KT", "Kontak Resmi", "Mengelola alamat, email, telepon, WhatsApp, maps, dan jam layanan fakultas.", "Konsep", null],
        ["NV", "Menu Navigasi", "Mengelola struktur menu frontend agar dropdown dan link halaman tetap konsisten.", "Konsep", null]
      ]
    },
    {
      key: "media",
      title: "Media dan Dokumen",
      features: [
        ["ML", "Media Library", "Pusat pengelolaan gambar, video, dokumen, ikon, dan validasi ukuran file.", "Konsep", null],
        ["EB", "E-Brochure", "Mengelola file brosur, cover, metadata, preview viewer, tombol download, dan share.", "Konsep", null],
        ["DP", "Dokumen Publik", "Mengelola dokumen resmi seperti kalender, persyaratan, aturan, dan file informasi.", "Konsep", null],
        ["GL", "Galeri Kegiatan", "Mengelola foto kegiatan, organisasi, dosen, mahasiswa, dan dokumentasi fakultas.", "Konsep", null]
      ]
    },
    {
      key: "security",
      title: "Keamanan dan Akses",
      features: [
        ["AU", "Autentikasi Admin", "Login, logout, validasi session, dan proteksi halaman admin.", "Fondasi", "/admin/login"],
        ["RL", "Role dan Permission", "Mengatur hak akses Super Admin, Editor, Operator, dan Viewer.", "Konsep", null],
        ["AL", "Audit Log", "Mencatat login, tambah, edit, hapus, publish, upload, dan perubahan penting.", "Konsep", null]
      ]
    },
    {
      key: "system",
      title: "Sistem",
      features: [
        ["BK", "Backup dan Restore", "Menyiapkan backup database, restore data, dan arsip sebelum perubahan besar.", "Konsep", null],
        ["ST", "Pengaturan Website", "Mengelola identitas website, SEO dasar, mode maintenance, dan konfigurasi umum.", "Konsep", null]
      ]
    }
  ];

  const state = {
    filter: "all",
    query: ""
  };

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function allFeatures() {
    return modules.flatMap(function (module) {
      return module.features.map(function (feature) {
        return {
          moduleKey: module.key,
          moduleTitle: module.title,
          code: feature[0],
          title: feature[1],
          description: feature[2],
          status: feature[3],
          route: feature[4]
        };
      });
    });
  }

  function getFilteredModules() {
    const query = state.query.toLowerCase();

    return modules.map(function (module) {
      const filtered = module.features.filter(function (feature) {
        const text = [
          module.title,
          feature[0],
          feature[1],
          feature[2],
          feature[3]
        ].join(" ").toLowerCase();

        const filterMatch = state.filter === "all" || module.key === state.filter;
        const queryMatch = !query || text.includes(query);

        return filterMatch && queryMatch;
      });

      return {
        key: module.key,
        title: module.title,
        features: filtered
      };
    }).filter(function (module) {
      return module.features.length > 0;
    });
  }

  function setStats() {
    const features = allFeatures();
    const ready = features.filter(function (item) {
      return ["Ada", "Siap", "Fondasi"].includes(item.status);
    }).length;
    const concept = features.filter(function (item) {
      return item.status === "Konsep";
    }).length;
    const connected = features.filter(function (item) {
      return Boolean(item.route);
    }).length;

    const data = {
      total: features.length,
      ready: ready,
      concept: concept,
      route: connected
    };

    Object.keys(data).forEach(function (key) {
      const el = qs("[data-stat='" + key + "']");
      if (el) el.textContent = data[key];
    });
  }

  function renderModules() {
    const target = qs("[data-module-grid]");
    const empty = qs("[data-empty]");
    if (!target) return;

    const filtered = getFilteredModules();

    target.innerHTML = filtered.map(function (module) {
      const rows = module.features.map(function (feature) {
        const route = feature[4];
        const primary = route
          ? '<a class="fft-link" href="' + route + '">Buka</a>'
          : '<button class="fft-detail" type="button" data-detail="' + feature[0] + '">Detail</button>';

        return [
          '<article class="fft-feature">',
          '  <div class="fft-feature__code">' + feature[0] + '</div>',
          '  <div>',
          '    <h3 class="fft-feature__title">' + feature[1] + '</h3>',
          '    <p class="fft-feature__desc">' + feature[2] + '</p>',
          '  </div>',
          '  <div class="fft-feature__meta">',
          '    <span class="fft-badge">' + feature[3] + '</span>',
          '    ' + primary,
          '    <button class="fft-detail" type="button" data-detail="' + feature[0] + '">Konsep</button>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");

      return [
        '<section class="fft-module" data-module="' + module.key + '">',
        '  <header class="fft-module__header">',
        '    <h2 class="fft-module__title">' + module.title + '</h2>',
        '    <span class="fft-module__count">' + module.features.length + ' fitur</span>',
        '  </header>',
        '  <div class="fft-feature-list">',
        rows,
        '  </div>',
        '</section>'
      ].join("");
    }).join("");

    if (empty) empty.hidden = filtered.length > 0;

    bindDetailButtons();
  }

  function setActiveFilter(value) {
    state.filter = value;

    qsa("[data-filter]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-filter") === value);
    });

    qsa("[data-sidebar-filter]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-sidebar-filter") === value);
    });

    renderModules();
  }

  function bindFilters() {
    qsa("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveFilter(button.getAttribute("data-filter") || "all");
      });
    });

    qsa("[data-sidebar-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveFilter(button.getAttribute("data-sidebar-filter") || "all");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function bindSearch() {
    const search = qs("[data-search]");
    if (!search) return;

    search.addEventListener("input", function () {
      state.query = search.value.trim();
      renderModules();
    });
  }

  function findFeature(code) {
    return allFeatures().find(function (feature) {
      return feature.code === code;
    });
  }

  function openModal(code) {
    const modal = qs("[data-modal]");
    const title = qs("[data-modal-title]");
    const body = qs("[data-modal-body]");
    const footer = qs("[data-modal-footer]");
    const feature = findFeature(code);

    if (!modal || !feature) return;

    title.textContent = feature.title;

    body.innerHTML = [
      '<p>' + feature.description + '</p>',
      '<ul>',
      '<li>Modul: ' + feature.moduleTitle + '</li>',
      '<li>Status: ' + feature.status + '</li>',
      '<li>Tujuan: mempermudah admin mengelola website tanpa mengubah file coding manual.</li>',
      '<li>Integrasi: disambungkan bertahap ke database PostgreSQL dan route Flask.</li>',
      '</ul>'
    ].join("");

    footer.innerHTML = feature.route
      ? '<a class="fft-button" href="' + feature.route + '">Buka Route</a><button class="fft-button" type="button" data-close-modal>Tutup</button>'
      : '<button class="fft-button" type="button" data-close-modal>Tutup</button>';

    modal.classList.add("is-open");
    bindCloseModal();
  }

  function bindDetailButtons() {
    qsa("[data-detail]").forEach(function (button) {
      button.addEventListener("click", function () {
        openModal(button.getAttribute("data-detail"));
      });
    });
  }

  function bindCloseModal() {
    qsa("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        const modal = qs("[data-modal]");
        if (modal) modal.classList.remove("is-open");
      });
    });
  }

  function bindEscape() {
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const modal = qs("[data-modal]");
        if (modal) modal.classList.remove("is-open");
      }
    });
  }

  function hideLoader() {
    const loader = qs("[data-loader]");
    if (!loader) return;

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 1800);
  }

  function init() {
    setStats();
    renderModules();
    bindFilters();
    bindSearch();
    bindCloseModal();
    bindEscape();
    hideLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
