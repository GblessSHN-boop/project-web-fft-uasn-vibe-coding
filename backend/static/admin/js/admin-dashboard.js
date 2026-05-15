(function () {
  "use strict";

  const modules = [
    {
      key: "dashboard",
      code: "DB",
      title: "Dashboard Inti",
      description: "Ringkasan kondisi website, aktivitas admin, notifikasi penting, dan pencarian cepat.",
      help: [
        "Gunakan dashboard untuk melihat kondisi website secara cepat.",
        "Periksa notifikasi sebelum melakukan publish konten.",
        "Pakai pencarian jika sudah tahu fitur yang ingin dibuka."
      ],
      features: [
        ["OV", "Ringkasan Statistik", "Melihat total konten, draft, dosen, banner aktif, dan status modul.", "Siap", null],
        ["AC", "Aktivitas Terbaru", "Melihat perubahan terbaru yang dilakukan admin.", "Konsep", null],
        ["NT", "Notifikasi Sistem", "Menampilkan data yang belum lengkap atau perlu dicek.", "Konsep", null],
        ["QS", "Pencarian Cepat", "Mencari fitur admin dari satu kotak pencarian.", "Siap", null]
      ]
    },
    {
      key: "content",
      code: "KT",
      title: "Konten Website",
      description: "Mengelola berita, banner, halaman statis, kategori, tag, dan pengumuman penting.",
      help: [
        "Mulai dari Kelola Berita jika ingin menambah informasi baru.",
        "Gunakan Banner Utama hanya untuk konten yang tampil besar di halaman depan.",
        "Simpan sebagai draft jika konten belum siap dipublikasikan."
      ],
      features: [
        ["BR", "Kelola Berita", "Tambah, edit, hapus, draft, publish, thumbnail, dan tag berita.", "Ada", "/admin/berita/list"],
        ["BI", "Banner Utama", "Mengelola banner informasi utama dalam bentuk gambar atau video.", "Ada", "/admin/banner-informasi"],
        ["KB", "Kategori Berita", "Mengelompokkan berita agar arsip lebih rapi.", "Konsep", null],
        ["TG", "Tag Berita", "Mengatur label seperti New, Akademik, Pengumuman, dan Kegiatan.", "Konsep", null],
        ["HS", "Halaman Statis", "Mengelola halaman tetap seperti tentang fakultas dan visi misi.", "Konsep", null],
        ["PG", "Pengumuman Penting", "Menerbitkan pengumuman singkat yang perlu cepat tampil.", "Konsep", null]
      ]
    },
    {
      key: "academic",
      code: "AK",
      title: "Akademik dan Fakultas",
      description: "Mengelola data dekan, dosen, kurikulum, kalender akademik, dan aturan akademik.",
      help: [
        "Gunakan Data Dosen untuk memperbarui profil pengajar.",
        "Gunakan Data Dekan untuk informasi pimpinan fakultas.",
        "Kurikulum dan kalender akademik perlu dicek sebelum dipublish."
      ],
      features: [
        ["DK", "Data Dekan", "Mengelola identitas dekan, foto formal, jabatan, dan biodata.", "Ada", "/admin/dekan"],
        ["DS", "Data Dosen", "Mengelola profil dosen, foto, bidang keahlian, dan urutan tampil.", "Ada", "/admin/dosen"],
        ["KR", "Kurikulum", "Mengatur mata kuliah, semester, SKS, dan struktur kurikulum.", "Konsep", null],
        ["KA", "Kalender Akademik", "Mengelola tanggal penting, ujian, dan kegiatan akademik.", "Konsep", null],
        ["AA", "Aturan Akademik", "Mengelola pedoman akademik, tata tertib, dan dokumen aturan.", "Konsep", null]
      ]
    },
    {
      key: "admission",
      code: "PM",
      title: "Pendaftaran Mahasiswa",
      description: "Mengelola alur pendaftaran, persyaratan, simulasi, dan FAQ calon mahasiswa.",
      help: [
        "Pastikan alur pendaftaran ditulis sederhana.",
        "Gunakan FAQ untuk menjawab pertanyaan yang sering muncul.",
        "Periksa kembali nomor kontak sebelum publish."
      ],
      features: [
        ["AP", "Alur Pendaftaran", "Mengelola tahapan pendaftaran calon mahasiswa.", "Konsep", null],
        ["PR", "Persyaratan Masuk", "Mengatur syarat dokumen, biaya, dan ketentuan penerimaan.", "Konsep", null],
        ["SP", "Simulasi Pendaftaran", "Menyediakan simulasi alur pendaftaran offline.", "Konsep", null],
        ["FQ", "FAQ Pendaftaran", "Mengelola pertanyaan umum calon mahasiswa.", "Konsep", null]
      ]
    },
    {
      key: "frontend",
      code: "FE",
      title: "Tampilan Frontend",
      description: "Mengelola komponen yang tampil langsung di website publik.",
      help: [
        "Gunakan modul ini untuk mengatur data visual di halaman depan.",
        "Quick Facts dan Testimoni perlu dibuat singkat agar mudah dibaca.",
        "Kontak resmi harus selalu valid."
      ],
      features: [
        ["QF", "Quick Facts", "Mengatur statistik singkat fakultas.", "Konsep", null],
        ["RK", "Papan Peringkat", "Mengelola ranking GPA, foto mahasiswa, dan tahun akademik.", "Konsep", null],
        ["TS", "Testimoni", "Mengelola testimoni mahasiswa dan alumni.", "Konsep", null],
        ["KT", "Kontak Resmi", "Mengelola alamat, email, telepon, WhatsApp, dan maps.", "Konsep", null],
        ["NV", "Menu Navigasi", "Mengelola struktur menu frontend dan dropdown.", "Konsep", null]
      ]
    },
    {
      key: "media",
      code: "MD",
      title: "Media dan Dokumen",
      description: "Mengelola gambar, video, e-brochure, dokumen publik, dan galeri kegiatan.",
      help: [
        "Gunakan nama file yang jelas sebelum upload.",
        "Hindari file besar agar website tetap cepat.",
        "Dokumen publik perlu diberi judul dan deskripsi."
      ],
      features: [
        ["ML", "Media Library", "Pusat pengelolaan gambar, video, dokumen, dan ikon.", "Konsep", null],
        ["EB", "E-Brochure", "Mengelola brosur, cover, metadata, viewer, dan tombol download.", "Konsep", null],
        ["DP", "Dokumen Publik", "Mengelola dokumen resmi yang dapat diakses pengunjung.", "Konsep", null],
        ["GL", "Galeri Kegiatan", "Mengelola foto kegiatan, organisasi, dosen, dan mahasiswa.", "Konsep", null]
      ]
    },
    {
      key: "security",
      code: "KA",
      title: "Keamanan Admin",
      description: "Mengelola akun admin, role, permission, dan audit log aktivitas.",
      help: [
        "Akun admin hanya digunakan oleh petugas resmi.",
        "Role membantu membatasi akses sesuai tugas.",
        "Audit log dipakai untuk melacak perubahan penting."
      ],
      features: [
        ["AU", "Autentikasi Admin", "Login, logout, validasi session, dan proteksi halaman admin.", "Fondasi", "/admin/login"],
        ["RL", "Role dan Permission", "Mengatur hak akses Super Admin, Editor, Operator, dan Viewer.", "Konsep", null],
        ["AL", "Audit Log", "Mencatat login, tambah, edit, hapus, publish, dan upload.", "Konsep", null]
      ]
    },
    {
      key: "system",
      code: "ST",
      title: "Pengaturan Sistem",
      description: "Mengelola backup, restore, identitas website, mode maintenance, dan konfigurasi dasar.",
      help: [
        "Gunakan backup sebelum perubahan besar.",
        "Mode maintenance dipakai saat website sedang diperbaiki.",
        "Konfigurasi sistem sebaiknya hanya diubah oleh admin utama."
      ],
      features: [
        ["BK", "Backup dan Restore", "Menyiapkan backup database, restore data, dan arsip perubahan.", "Konsep", null],
        ["ST", "Pengaturan Website", "Mengelola identitas website, SEO dasar, dan mode maintenance.", "Konsep", null]
      ]
    }
  ];

  const quickActions = [
    ["BR", "Tambah Berita", "Buat informasi baru untuk website.", "/admin/berita/list"],
    ["BI", "Upload Banner", "Kelola banner utama halaman depan.", "/admin/banner-informasi"],
    ["DS", "Tambah Dosen", "Kelola profil dosen fakultas.", "/admin/dosen"],
    ["DK", "Data Dekan", "Perbarui data pimpinan fakultas.", "/admin/dekan"],
    ["EB", "E-Brochure", "Siapkan brosur digital.", "#"],
    ["WB", "Lihat Website", "Buka tampilan frontend.", "/frontend/pages/indexfft.html"]
  ];

  const state = {
    view: "dashboard"
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

  function setStats() {
    const features = allFeatures();
    const connected = features.filter(function (item) {
      return item.route;
    }).length;

    const stats = {
      total: features.length,
      ready: features.filter(function (item) {
        return ["Ada", "Siap", "Fondasi"].includes(item.status);
      }).length,
      concept: features.filter(function (item) {
        return item.status === "Konsep";
      }).length,
      route: connected
    };

    Object.keys(stats).forEach(function (key) {
      const target = qs("[data-stat='" + key + "']");
      if (target) target.textContent = stats[key];
    });
  }

  function renderQuickActions() {
    const target = qs("[data-quick-actions]");
    if (!target) return;

    target.innerHTML = quickActions.map(function (item) {
      return [
        '<a class="fft-quick" href="' + item[3] + '">',
        '  <span class="fft-quick__code">' + item[0] + '</span>',
        '  <h3 class="fft-quick__title">' + item[1] + '</h3>',
        '  <p class="fft-quick__text">' + item[2] + '</p>',
        '</a>'
      ].join("");
    }).join("");
  }

  function renderModuleCards() {
    const target = qs("[data-module-cards]");
    if (!target) return;

    target.innerHTML = modules.filter(function (module) {
      return module.key !== "dashboard";
    }).map(function (module) {
      return [
        '<article class="fft-module-card">',
        '  <div class="fft-module-card__top">',
        '    <span class="fft-module-card__code">' + module.code + '</span>',
        '    <span class="fft-module-card__count">' + module.features.length + ' fitur</span>',
        '  </div>',
        '  <h3 class="fft-module-card__title">' + module.title + '</h3>',
        '  <p class="fft-module-card__text">' + module.description + '</p>',
        '  <div class="fft-module-card__actions">',
        '    <button class="fft-button fft-button--maroon" type="button" data-open-view="' + module.key + '">Masuk Modul</button>',
        '    <button class="fft-button fft-button--light" type="button" data-detail-module="' + module.key + '">Panduan</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    bindOpenViewButtons();
    bindModuleDetailButtons();
  }

  function renderModuleViews() {
    const target = qs("[data-dynamic-views]");
    if (!target) return;

    target.innerHTML = modules.filter(function (module) {
      return module.key !== "dashboard";
    }).map(function (module) {
      return [
        '<section class="fft-view" data-view="' + module.key + '">',
        '  <section class="fft-hero">',
        '    <div>',
        '      <p class="fft-kicker">Modul Administrasi</p>',
        '      <h1 class="fft-title">' + module.title + '</h1>',
        '      <p class="fft-hero-text">' + module.description + '</p>',
        '    </div>',
        '    <div class="fft-hero-actions">',
        '      <button class="fft-button fft-button--light" type="button" data-open-view="dashboard">Kembali Dashboard</button>',
        '      <button class="fft-button" type="button" data-detail-module="' + module.key + '">Lihat Panduan</button>',
        '    </div>',
        '  </section>',
        '  <section class="fft-section">',
        '    <div class="fft-workspace">',
        '      <div class="fft-feature-panel">',
        '        <div class="fft-panel-head">',
        '          <h2 class="fft-panel-title">Fitur dalam Modul</h2>',
        '          <p class="fft-panel-text">Pilih fitur yang ingin dikelola. Tombol Buka tersedia jika route backend sudah ada.</p>',
        '        </div>',
        '        <div class="fft-feature-list">',
        module.features.map(function (feature) {
          const route = feature[4];
          const primary = route
            ? '<a class="fft-mini-btn" href="' + route + '">Buka</a>'
            : '<button class="fft-mini-btn" type="button" data-detail-feature="' + feature[0] + '">Konsep</button>';

          return [
            '<article class="fft-feature">',
            '  <span class="fft-feature__code">' + feature[0] + '</span>',
            '  <div>',
            '    <h3 class="fft-feature__title">' + feature[1] + '</h3>',
            '    <p class="fft-feature__desc">' + feature[2] + '</p>',
            '  </div>',
            '  <div class="fft-feature__actions">',
            '    <span class="fft-badge">' + feature[3] + '</span>',
            '    ' + primary,
            '    <button class="fft-mini-btn" type="button" data-detail-feature="' + feature[0] + '">Detail</button>',
            '  </div>',
            '</article>'
          ].join("");
        }).join(""),
        '        </div>',
        '      </div>',
        '      <aside class="fft-help-panel">',
        '        <div class="fft-panel-head">',
        '          <h2 class="fft-panel-title">Panduan Singkat</h2>',
        '          <p class="fft-panel-text">Arahan sederhana untuk admin saat memakai modul ini.</p>',
        '        </div>',
        '        <ul class="fft-help-list">',
        module.help.map(function (item) {
          return '<li>' + item + '</li>';
        }).join(""),
        '        </ul>',
        '      </aside>',
        '    </div>',
        '  </section>',
        '</section>'
      ].join("");
    }).join("");

    bindOpenViewButtons();
    bindModuleDetailButtons();
    bindFeatureDetailButtons();
  }

  function openView(viewKey) {
    state.view = viewKey;

    qsa("[data-view]").forEach(function (view) {
      view.classList.toggle("is-active", view.getAttribute("data-view") === viewKey);
    });

    qsa("[data-nav]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-nav") === viewKey);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindOpenViewButtons() {
    qsa("[data-open-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        openView(button.getAttribute("data-open-view") || "dashboard");
      });
    });

    qsa("[data-nav]").forEach(function (button) {
      button.addEventListener("click", function () {
        openView(button.getAttribute("data-nav") || "dashboard");
      });
    });
  }

  function findFeature(code) {
    return allFeatures().find(function (feature) {
      return feature.code === code;
    });
  }

  function findModule(key) {
    return modules.find(function (module) {
      return module.key === key;
    });
  }

  function openModal(title, content, route) {
    const modal = qs("[data-modal]");
    const titleEl = qs("[data-modal-title]");
    const body = qs("[data-modal-body]");
    const footer = qs("[data-modal-footer]");
    if (!modal) return;

    titleEl.textContent = title;
    body.innerHTML = content;
    footer.innerHTML = route
      ? '<a class="fft-button" href="' + route + '">Buka Route</a><button class="fft-button fft-button--light" type="button" data-close-modal>Tutup</button>'
      : '<button class="fft-button" type="button" data-close-modal>Tutup</button>';

    modal.classList.add("is-open");
    bindCloseModal();
  }

  function bindFeatureDetailButtons() {
    qsa("[data-detail-feature]").forEach(function (button) {
      button.addEventListener("click", function () {
        const feature = findFeature(button.getAttribute("data-detail-feature"));
        if (!feature) return;

        openModal(
          feature.title,
          [
            '<p>' + feature.description + '</p>',
            '<ul>',
            '<li>Modul: ' + feature.moduleTitle + '</li>',
            '<li>Status: ' + feature.status + '</li>',
            '<li>Tujuan: membantu admin mengelola website tanpa mengubah file coding manual.</li>',
            '<li>Integrasi: disambungkan bertahap ke Flask, PostgreSQL, dan dashboard final.</li>',
            '</ul>'
          ].join(""),
          feature.route
        );
      });
    });
  }

  function bindModuleDetailButtons() {
    qsa("[data-detail-module]").forEach(function (button) {
      button.addEventListener("click", function () {
        const module = findModule(button.getAttribute("data-detail-module"));
        if (!module) return;

        openModal(
          module.title,
          [
            '<p>' + module.description + '</p>',
            '<ul>',
            module.help.map(function (item) {
              return '<li>' + item + '</li>';
            }).join(""),
            '</ul>'
          ].join(""),
          null
        );
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

  function bindSearch() {
    const input = qs("[data-search]");
    const resultBox = qs("[data-search-results]");
    if (!input || !resultBox) return;

    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();

      if (!query) {
        resultBox.classList.remove("is-open");
        resultBox.innerHTML = "";
        return;
      }

      const results = allFeatures().filter(function (feature) {
        return [
          feature.code,
          feature.title,
          feature.description,
          feature.moduleTitle,
          feature.status
        ].join(" ").toLowerCase().includes(query);
      }).slice(0, 8);

      if (!results.length) {
        resultBox.innerHTML = '<div class="fft-search-item"><div></div><div><span class="fft-search-title">Tidak ada hasil</span><span class="fft-search-module">Coba kata kunci lain.</span></div></div>';
        resultBox.classList.add("is-open");
        return;
      }

      resultBox.innerHTML = results.map(function (item) {
        return [
          '<button class="fft-search-item" type="button" data-search-feature="' + item.code + '" data-search-view="' + item.moduleKey + '">',
          '  <span class="fft-search-code">' + item.code + '</span>',
          '  <span>',
          '    <span class="fft-search-title">' + item.title + '</span>',
          '    <span class="fft-search-module">' + item.moduleTitle + ' | ' + item.status + '</span>',
          '  </span>',
          '</button>'
        ].join("");
      }).join("");

      resultBox.classList.add("is-open");

      qsa("[data-search-feature]").forEach(function (button) {
        button.addEventListener("click", function () {
          const view = button.getAttribute("data-search-view");
          const code = button.getAttribute("data-search-feature");
          input.value = "";
          resultBox.classList.remove("is-open");
          openView(view);
          const feature = findFeature(code);
          if (feature) {
            window.setTimeout(function () {
              openModal(
                feature.title,
                '<p>' + feature.description + '</p><ul><li>Modul: ' + feature.moduleTitle + '</li><li>Status: ' + feature.status + '</li></ul>',
                feature.route
              );
            }, 250);
          }
        });
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".fft-search-wrap")) {
        resultBox.classList.remove("is-open");
      }
    });
  }

  function bindEscape() {
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const modal = qs("[data-modal]");
        const results = qs("[data-search-results]");
        if (modal) modal.classList.remove("is-open");
        if (results) results.classList.remove("is-open");
      }
    });
  }

  function hideLoader() {
    const loader = qs("[data-loader]");
    if (!loader) return;

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 1400);
  }

  function init() {
    setStats();
    renderQuickActions();
    renderModuleCards();
    renderModuleViews();
    bindOpenViewButtons();
    bindSearch();
    bindEscape();
    bindCloseModal();
    hideLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
