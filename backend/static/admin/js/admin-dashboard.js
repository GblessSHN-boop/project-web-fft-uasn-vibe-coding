(function () {
  "use strict";

  const modules = [
    {
      key: "dashboard",
      title: "Dashboard",
      description: "Ringkasan sistem, aktivitas terbaru, notifikasi, dan akses cepat.",
      help: [
        "Gunakan halaman ini untuk melihat kondisi sistem secara cepat.",
        "Gunakan Aksi Cepat untuk pekerjaan yang paling sering dilakukan.",
        "Gunakan pencarian jika sudah tahu fitur yang ingin dibuka."
      ],
      features: [
        ["Ringkasan Statistik", "Melihat jumlah fitur, konten aktif, draft, dan route yang sudah terhubung.", "Siap", null],
        ["Aktivitas Terbaru", "Melihat aktivitas terakhir yang dilakukan admin.", "Konsep", null],
        ["Notifikasi Sistem", "Melihat data yang perlu dicek atau dilengkapi.", "Konsep", null],
        ["Pencarian Cepat", "Mencari fitur admin dari satu kotak pencarian.", "Siap", null]
      ]
    },
    {
      key: "content",
      title: "Konten Website",
      description: "Mengelola berita, banner utama, kategori, tag, halaman statis, dan pengumuman.",
      help: [
        "Gunakan Kelola Berita untuk menambah atau mengubah berita.",
        "Gunakan Stok Banner untuk konten yang tampil besar di halaman depan.",
        "Simpan sebagai draft jika konten belum siap dipublikasikan."
      ],
      features: [
        ["Kelola Berita", "Tambah, edit, hapus, draft, publish, thumbnail, dan tag berita.", "Ada", "/admin/berita/list"],
        ["Stok Banner", "Mengelola banner informasi utama dalam bentuk gambar atau video.", "Ada", "/admin/banner/stock"],
        ["Kategori Berita", "Mengelompokkan berita agar arsip lebih rapi.", "Konsep", null],
        ["Tag Berita", "Mengatur label seperti New, Akademik, Pengumuman, dan Kegiatan.", "Konsep", null],
        ["Halaman Statis", "Mengelola halaman tetap seperti tentang fakultas dan visi misi.", "Konsep", null],
        ["Pengumuman Penting", "Menerbitkan pengumuman singkat yang perlu cepat tampil.", "Konsep", null]
      ]
    },
    {
      key: "academic",
      title: "Akademik dan Fakultas",
      description: "Mengelola data dekan, dosen, kurikulum, kalender akademik, dan aturan akademik.",
      help: [
        "Gunakan Data Dosen untuk memperbarui profil pengajar.",
        "Gunakan Data Dekan untuk memperbarui informasi pimpinan fakultas.",
        "Data akademik sebaiknya dicek ulang sebelum dipublikasikan."
      ],
      features: [
        ["Data Dekan", "Mengelola identitas dekan, foto formal, jabatan, dan biodata.", "Ada", "/admin/dekan"],
        ["Data Dosen", "Mengelola profil dosen, foto, bidang keahlian, dan urutan tampil.", "Ada", "/admin/dosen"],
        ["Kurikulum", "Mengatur mata kuliah, semester, SKS, dan struktur kurikulum.", "Konsep", null],
        ["Kalender Akademik", "Mengelola tanggal penting, ujian, dan kegiatan akademik.", "Konsep", null],
        ["Aturan Akademik", "Mengelola pedoman akademik, tata tertib, dan dokumen aturan.", "Konsep", null]
      ]
    },
    {
      key: "admission",
      title: "Pendaftaran Mahasiswa",
      description: "Mengelola alur pendaftaran, persyaratan, simulasi, dan FAQ calon mahasiswa.",
      help: [
        "Pastikan alur pendaftaran ditulis sederhana.",
        "Gunakan FAQ untuk menjawab pertanyaan yang sering muncul.",
        "Periksa kembali kontak penerimaan sebelum publish."
      ],
      features: [
        ["Alur Pendaftaran", "Mengelola tahapan pendaftaran calon mahasiswa.", "Konsep", null],
        ["Persyaratan Masuk", "Mengatur syarat dokumen, biaya, dan ketentuan penerimaan.", "Konsep", null],
        ["Simulasi Pendaftaran", "Menyediakan simulasi alur pendaftaran offline.", "Konsep", null],
        ["FAQ Pendaftaran", "Mengelola pertanyaan umum calon mahasiswa.", "Konsep", null]
      ]
    },
    {
      key: "frontend",
      title: "Tampilan Frontend",
      description: "Mengelola komponen yang tampil langsung di website publik.",
      help: [
        "Gunakan modul ini untuk mengatur data visual di halaman depan.",
        "Quick facts dan testimoni perlu dibuat singkat agar mudah dibaca.",
        "Kontak resmi harus selalu valid."
      ],
      features: [
        ["Quick Facts", "Mengatur statistik singkat fakultas.", "Konsep", null],
        ["Papan Peringkat", "Mengelola ranking GPA, foto mahasiswa, dan tahun akademik.", "Konsep", null],
        ["Testimoni", "Mengelola testimoni mahasiswa dan alumni.", "Konsep", null],
        ["Kontak Resmi", "Mengelola alamat, email, telepon, WhatsApp, dan maps.", "Konsep", null],
        ["Menu Navigasi", "Mengelola struktur menu frontend dan dropdown.", "Konsep", null]
      ]
    },
    {
      key: "media",
      title: "Media dan Dokumen",
      description: "Mengelola gambar, video, e-brochure, dokumen publik, dan galeri kegiatan.",
      help: [
        "Gunakan nama file yang jelas sebelum upload.",
        "Hindari file terlalu besar agar website tetap cepat.",
        "Dokumen publik perlu diberi judul dan deskripsi."
      ],
      features: [
        ["Media Library", "Pusat pengelolaan gambar, video, dokumen, dan ikon.", "Konsep", null],
        ["E-Brochure", "Mengelola brosur, cover, metadata, viewer, dan tombol download.", "Konsep", null],
        ["Dokumen Publik", "Mengelola dokumen resmi yang dapat diakses pengunjung.", "Konsep", null],
        ["Galeri Kegiatan", "Mengelola foto kegiatan, organisasi, dosen, dan mahasiswa.", "Konsep", null]
      ]
    },
    {
      key: "security",
      title: "Keamanan Admin",
      description: "Mengelola akun admin, role, permission, dan audit log aktivitas.",
      help: [
        "Akun admin hanya digunakan oleh petugas resmi.",
        "Role membantu membatasi akses sesuai tugas.",
        "Audit log dipakai untuk melacak perubahan penting."
      ],
      features: [
        ["Autentikasi Admin", "Login, logout, validasi session, dan proteksi halaman admin.", "Fondasi", "/admin/login"],
        ["Role dan Permission", "Mengatur hak akses Super Admin, Editor, Operator, dan Viewer.", "Konsep", null],
        ["Audit Log", "Mencatat login, tambah, edit, hapus, publish, dan upload.", "Konsep", null]
      ]
    },
    {
      key: "system",
      title: "Pengaturan Sistem",
      description: "Mengelola backup, restore, identitas website, mode maintenance, dan konfigurasi dasar.",
      help: [
        "Gunakan backup sebelum perubahan besar.",
        "Mode maintenance dipakai saat website sedang diperbaiki.",
        "Konfigurasi sistem sebaiknya hanya diubah oleh admin utama."
      ],
      features: [
        ["Backup dan Restore", "Menyiapkan backup database, restore data, dan arsip perubahan.", "Konsep", null],
        ["Pengaturan Website", "Mengelola identitas website, SEO dasar, dan mode maintenance.", "Konsep", null]
      ]
    }
  ];

  const quickActions = [
    ["Tambah Berita", "Buat informasi baru untuk website.", "/admin/berita/list"],
    ["Stok Banner", "Kelola banner utama halaman depan.", "/admin/banner/stock"],
    ["Tambah Dosen", "Kelola profil dosen fakultas.", "/admin/dosen"],
    ["Data Dekan", "Perbarui data pimpinan fakultas.", "/admin/dekan"],
    ["E-Brochure", "Siapkan brosur digital.", "#"],
    ["Lihat Website", "Buka tampilan frontend.", "/frontend/pages/indexfft.html"]
  ];

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
          title: feature[0],
          description: feature[1],
          status: feature[2],
          route: feature[3]
        };
      });
    });
  }

  function setStats() {
    const features = allFeatures();

    const stats = {
      total: features.length,
      ready: features.filter(function (item) {
        return ["Ada", "Siap", "Fondasi"].includes(item.status);
      }).length,
      concept: features.filter(function (item) {
        return item.status === "Konsep";
      }).length,
      route: features.filter(function (item) {
        return item.route;
      }).length
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
        '<a class="fft-quick" href="' + item[2] + '">',
        '  <div class="fft-quick__body">',
        '    <h3 class="fft-quick__title">' + item[0] + '</h3>',
        '    <p class="fft-quick__text">' + item[1] + '</p>',
        '  </div>',
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
        '    <span class="fft-module-card__count">' + module.features.length + ' fitur</span>',
        '  </div>',
        '  <h3 class="fft-module-card__title">' + module.title + '</h3>',
        '  <p class="fft-module-card__text">' + module.description + '</p>',
        '  <div class="fft-module-card__actions">',
        '    <button class="fft-button fft-button--maroon" type="button" data-open-view="' + module.key + '">Masuk Modul</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    bindViewButtons();
  }

  function renderModuleViews() {
    const target = qs("[data-dynamic-views]");
    if (!target) return;

    target.innerHTML = modules.filter(function (module) {
      return module.key !== "dashboard";
    }).map(function (module) {
      const rows = module.features.map(function (feature) {
        const route = feature[3];
        const action = route
          ? '<a class="fft-mini-btn" href="' + route + '">Buka</a>'
          : '<span class="fft-state-note">Belum Aktif</span>';

        return [
          '<article class="fft-feature">',
          '  <div class="fft-feature__content">',
          '    <h3 class="fft-feature__title">' + feature[0] + '</h3>',
          '    <p class="fft-feature__desc">' + feature[1] + '</p>',
          '  </div>',
          '  <div class="fft-feature__actions">',
          '    <span class="fft-badge">' + feature[2] + '</span>',
          '    ' + action,
          '  </div>',
          '</article>'
        ].join("");
      }).join("");

      const help = module.help.map(function (item) {
        return '<li>' + item + '</li>';
      }).join("");

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
        '    </div>',
        '  </section>',
        '  <section class="fft-section">',
        '    <div class="fft-workspace">',
        '      <div class="fft-feature-panel">',
        '        <div class="fft-panel-head">',
        '          <h2 class="fft-panel-title">Fitur dalam Modul</h2>',
        '          <p class="fft-panel-text">Pilih fitur yang ingin dikelola. Tombol Buka hanya tampil jika route backend sudah tersedia.</p>',
        '        </div>',
        '        <div class="fft-feature-list">' + rows + '</div>',
        '      </div>',
        '      <aside class="fft-help-panel">',
        '        <div class="fft-panel-head">',
        '          <h2 class="fft-panel-title">Panduan Singkat</h2>',
        '          <p class="fft-panel-text">Arahan sederhana untuk admin saat memakai modul ini.</p>',
        '        </div>',
        '        <ul class="fft-help-list">' + help + '</ul>',
        '      </aside>',
        '    </div>',
        '  </section>',
        '</section>'
      ].join("");
    }).join("");

    bindViewButtons();
  }

  function openView(viewKey) {
    qsa("[data-view]").forEach(function (view) {
      view.classList.toggle("is-active", view.getAttribute("data-view") === viewKey);
    });

    qsa("[data-nav]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-nav") === viewKey);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindViewButtons() {
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

  function bindModuleCardButtons() {
    qsa("[data-detail-module]").forEach(function (button) {
      button.addEventListener("click", function () {
        const module = modules.find(function (item) {
          return item.key === button.getAttribute("data-detail-module");
        });

        if (!module) return;

        openModal(
          module.title,
          '<p>' + module.description + '</p><ul>' + module.help.map(function (item) {
            return '<li>' + item + '</li>';
          }).join("") + '</ul>',
          null
        );
      });
    });
  }

  function bindFeatureDetailButtons() {
    qsa("[data-detail-feature]").forEach(function (button) {
      button.addEventListener("click", function () {
        const title = button.getAttribute("data-detail-feature");
        const feature = allFeatures().find(function (item) {
          return item.title === title;
        });

        if (!feature) return;

        openModal(
          feature.title,
          '<p>' + feature.description + '</p><ul><li>Modul: ' + feature.moduleTitle + '</li><li>Status: ' + feature.status + '</li></ul>',
          feature.route
        );
      });
    });
  }

  function openModal(title, content, route) {
    const modal = qs("[data-modal]");
    const titleEl = qs("[data-modal-title]");
    const body = qs("[data-modal-body]");
    const footer = qs("[data-modal-footer]");

    if (!modal || !titleEl || !body || !footer) return;

    titleEl.textContent = title;
    body.innerHTML = content;
    footer.innerHTML = route
      ? '<a class="fft-button" href="' + route + '">Buka Route</a><button class="fft-button fft-button--light" type="button" data-close-modal>Tutup</button>'
      : '<button class="fft-button" type="button" data-close-modal>Tutup</button>';

    modal.classList.add("is-open");
    bindCloseModal();
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
          feature.title,
          feature.description,
          feature.moduleTitle,
          feature.status
        ].join(" ").toLowerCase().includes(query);
      }).slice(0, 8);

      if (!results.length) {
        resultBox.innerHTML = '<div class="fft-search-item fft-search-item--empty"><span><span class="fft-search-title">Tidak ada hasil</span><span class="fft-search-module">Coba kata kunci lain.</span></span></div>';
        resultBox.classList.add("is-open");
        return;
      }

      resultBox.innerHTML = results.map(function (item) {
        return [
          '<button class="fft-search-item" type="button" data-search-feature="' + item.title + '" data-search-view="' + item.moduleKey + '">',
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
          const title = button.getAttribute("data-search-feature");
          const feature = allFeatures().find(function (item) {
            return item.title === title;
          });

          input.value = "";
          resultBox.classList.remove("is-open");
          openView(view);

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
      loader.setAttribute("aria-hidden", "true");

      window.setTimeout(function () {
        loader.style.display = "none";
      }, 450);
    }, 850);
  }

  function init() {
    setStats();
    renderQuickActions();
    renderModuleCards();
    renderModuleViews();
    bindViewButtons();
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
