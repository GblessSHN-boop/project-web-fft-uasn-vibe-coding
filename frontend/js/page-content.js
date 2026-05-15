document.addEventListener("DOMContentLoaded", function () {
  function getLang() {
    return localStorage.getItem("fft-language")
      || localStorage.getItem("siteLanguage")
      || localStorage.getItem("fftLang")
      || document.documentElement.lang
      || "id";
  }

  function applyPageLanguage(language) {
    const lang = language === "en" ? "en" : "id";

    document.querySelectorAll("[data-page-id][data-page-en]").forEach(function (element) {
      element.textContent = lang === "en" ? element.dataset.pageEn : element.dataset.pageId;
    });
  }

  document.querySelectorAll("[data-curriculum-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const parent = button.closest(".curriculum-semester");
      if (!parent) return;
      parent.classList.toggle("is-open");
    });
  });

  window.addEventListener("fft-language-change", function (event) {
    const language = event.detail && event.detail.language ? event.detail.language : getLang();
    applyPageLanguage(language);
  });

  applyPageLanguage(getLang());
});

// FFT CURRICULUM PAGE START
document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".curriculum-semester-toggle");

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const panel = toggle.closest(".curriculum-semester-card").querySelector(".curriculum-semester-panel");
      const expanded = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");

      if (panel) {
        if (expanded) {
          panel.removeAttribute("data-open");
        } else {
          panel.setAttribute("data-open", "true");
        }
      }

      const icon = toggle.querySelector(".curriculum-toggle-icon");
      if (icon) {
        icon.textContent = expanded ? "+" : "−";
      }
    });
  });

  document.querySelectorAll(".curriculum-semester-toggle").forEach(function (toggle) {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const icon = toggle.querySelector(".curriculum-toggle-icon");

    if (icon) {
      icon.textContent = expanded ? "−" : "+";
    }
  });
});
// FFT CURRICULUM PAGE END

// FFT PAGE CONTENT LANGUAGE FIX START
(function () {
  function getPageLang() {
    const keys = [
      "fft-language",
      "siteLanguage",
      "fftLang",
      "fft_language",
      "selectedLanguage",
      "language"
    ];

    for (const key of keys) {
      const value = (localStorage.getItem(key) || "").toLowerCase();
      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const activeButton = document.querySelector(".fft-floating-language-btn.is-active, .fft-floating-language-btn[aria-pressed='true']");
    if (activeButton) {
      const value = (
        activeButton.dataset.fftLang ||
        activeButton.dataset.lang ||
        activeButton.textContent ||
        ""
      ).trim().toLowerCase();

      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.startsWith("en")) return "en";

    return "id";
  }

  function applyPageLanguage() {
    const lang = getPageLang();

    document.querySelectorAll("[data-page-id][data-page-en]").forEach(function (el) {
      const text = lang === "en" ? el.dataset.pageEn : el.dataset.pageId;
      if (typeof text === "string") {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-placeholder-id][data-placeholder-en]").forEach(function (el) {
      const text = lang === "en" ? el.dataset.placeholderEn : el.dataset.placeholderId;
      if (typeof text === "string") {
        el.setAttribute("placeholder", text);
      }
    });

    document.querySelectorAll("[data-aria-id][data-aria-en]").forEach(function (el) {
      const text = lang === "en" ? el.dataset.ariaEn : el.dataset.ariaId;
      if (typeof text === "string") {
        el.setAttribute("aria-label", text);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyPageLanguage();

    document.querySelectorAll(".fft-floating-language-btn, [data-fft-lang], [data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        setTimeout(applyPageLanguage, 0);
        setTimeout(applyPageLanguage, 80);
        setTimeout(applyPageLanguage, 180);
      });
    });
  });

  window.addEventListener("fft-language-change", applyPageLanguage);
  window.addEventListener("storage", applyPageLanguage);
  window.applyFFTPageLanguage = applyPageLanguage;
})();
// FFT PAGE CONTENT LANGUAGE FIX END

// FFT ACADEMIC CALENDAR PAGE START
(function () {
  const calendarData = [
    {
      semester: "ganjil",
      year: "2025-2026",
      monthId: "Ags",
      monthEn: "Aug",
      date: "2025",
      titleId: "Registrasi Akademik",
      titleEn: "Academic Registration",
      noteId: "Konten sedang maintenance. Data resmi registrasi akan diisi melalui backend.",
      noteEn: "Content is under maintenance. Official registration data will be added through the backend.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "ganjil",
      year: "2025-2026",
      monthId: "Sep",
      monthEn: "Sep",
      date: "2025",
      titleId: "Awal Perkuliahan",
      titleEn: "Lecture Start",
      noteId: "Jadwal awal perkuliahan akan mengikuti kalender resmi fakultas.",
      noteEn: "The lecture start schedule will follow the official faculty calendar.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "ganjil",
      year: "2025-2026",
      monthId: "Okt",
      monthEn: "Oct",
      date: "2025",
      titleId: "Ujian Tengah Semester",
      titleEn: "Midterm Examination",
      noteId: "Informasi ujian tengah semester akan ditampilkan setelah data tersedia.",
      noteEn: "Midterm examination information will be displayed once the data is available.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "ganjil",
      year: "2025-2026",
      monthId: "Des",
      monthEn: "Dec",
      date: "2025",
      titleId: "Ujian Akhir Semester",
      titleEn: "Final Examination",
      noteId: "Jadwal ujian akhir semester menunggu data akademik resmi.",
      noteEn: "The final examination schedule awaits official academic data.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "genap",
      year: "2025-2026",
      monthId: "Jan",
      monthEn: "Jan",
      date: "2026",
      titleId: "Registrasi Semester Genap",
      titleEn: "Even Semester Registration",
      noteId: "Data registrasi semester genap akan dikelola melalui backend.",
      noteEn: "Even semester registration data will be managed through the backend.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "genap",
      year: "2025-2026",
      monthId: "Feb",
      monthEn: "Feb",
      date: "2026",
      titleId: "Awal Perkuliahan Semester Genap",
      titleEn: "Even Semester Lecture Start",
      noteId: "Jadwal awal perkuliahan semester genap akan diperbarui oleh admin.",
      noteEn: "The even semester lecture start schedule will be updated by the administrator.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "genap",
      year: "2025-2026",
      monthId: "Apr",
      monthEn: "Apr",
      date: "2026",
      titleId: "Ujian Tengah Semester Genap",
      titleEn: "Even Semester Midterm Examination",
      noteId: "Informasi ujian akan ditampilkan setelah tersedia dari backend.",
      noteEn: "Examination information will be displayed once available from the backend.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    },
    {
      semester: "genap",
      year: "2025-2026",
      monthId: "Jun",
      monthEn: "Jun",
      date: "2026",
      titleId: "Ujian Akhir Semester Genap",
      titleEn: "Even Semester Final Examination",
      noteId: "Jadwal final menunggu data resmi fakultas.",
      noteEn: "The final schedule awaits official faculty data.",
      statusId: "Maintenance",
      statusEn: "Maintenance"
    }
  ];

  function getCalendarLang() {
    const keys = ["fft-language", "siteLanguage", "fftLang", "fft_language", "selectedLanguage", "language"];

    for (const key of keys) {
      const value = (localStorage.getItem(key) || "").toLowerCase();
      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const activeButton = document.querySelector(".fft-floating-language-btn.is-active, .fft-floating-language-btn[aria-pressed='true']");
    if (activeButton) {
      const value = (
        activeButton.dataset.fftLang ||
        activeButton.dataset.lang ||
        activeButton.textContent ||
        ""
      ).trim().toLowerCase();

      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    return (document.documentElement.lang || "").toLowerCase().startsWith("en") ? "en" : "id";
  }

  function text(item, key) {
    const lang = getCalendarLang();
    return lang === "en" ? item[key + "En"] : item[key + "Id"];
  }

  function activeSemester() {
    const active = document.querySelector("[data-calendar-semester].is-active");
    return active ? active.getAttribute("data-calendar-semester") : "ganjil";
  }

  function renderCalendar() {
    const root = document.querySelector("[data-calendar-root]");
    if (!root) return;

    const lang = getCalendarLang();
    const year = root.querySelector("[data-calendar-year]")?.value || "2025-2026";
    const query = (root.querySelector("[data-calendar-search]")?.value || "").trim().toLowerCase();
    const semester = activeSemester();

    let rows = calendarData.filter(function (item) {
      return item.year === year && item.semester === semester;
    });

    if (query) {
      rows = rows.filter(function (item) {
        const content = [
          item.titleId,
          item.titleEn,
          item.noteId,
          item.noteEn,
          item.monthId,
          item.monthEn,
          item.date
        ].join(" ").toLowerCase();

        return content.includes(query);
      });
    }

    const semesterLabel = lang === "en"
      ? (semester === "ganjil" ? "Odd" : "Even")
      : (semester === "ganjil" ? "Ganjil" : "Genap");

    const statusLabel = lang === "en" ? "Maintenance" : "Maintenance";

    const statYear = root.querySelector("[data-calendar-stat-year]");
    const statSemester = root.querySelector("[data-calendar-stat-semester]");
    const statCount = root.querySelector("[data-calendar-stat-count]");
    const statStatus = root.querySelector("[data-calendar-stat-status]");

    if (statYear) statYear.textContent = year;
    if (statSemester) statSemester.textContent = semesterLabel;
    if (statCount) statCount.textContent = rows.length;
    if (statStatus) statStatus.textContent = statusLabel;

    const timeline = root.querySelector("[data-calendar-timeline]");
    const table = root.querySelector("[data-calendar-table]");

    if (timeline) {
      if (!rows.length) {
        timeline.innerHTML = `<div class="calendar-empty">${lang === "en" ? "No agenda matches the current filter." : "Tidak ada agenda yang cocok dengan filter saat ini."}</div>`;
      } else {
        timeline.innerHTML = rows.map(function (item) {
          return `
            <article class="calendar-event-card">
              <div class="calendar-event-date">
                <div>
                  <strong>${item.date}</strong>
                  <span>${lang === "en" ? item.monthEn : item.monthId}</span>
                </div>
              </div>
              <div class="calendar-event-body">
                <h4>${text(item, "title")}</h4>
                <p>${text(item, "note")}</p>
                <span class="calendar-event-status">${text(item, "status")}</span>
              </div>
            </article>
          `;
        }).join("");
      }
    }

    if (table) {
      if (!rows.length) {
        table.innerHTML = `
          <tr>
            <td colspan="4">${lang === "en" ? "No agenda matches the current filter." : "Tidak ada agenda yang cocok dengan filter saat ini."}</td>
          </tr>
        `;
      } else {
        table.innerHTML = rows.map(function (item) {
          return `
            <tr>
              <td>${lang === "en" ? item.monthEn : item.monthId} ${item.date}</td>
              <td>${text(item, "title")}</td>
              <td>${text(item, "note")}</td>
              <td>${text(item, "status")}</td>
            </tr>
          `;
        }).join("");
      }
    }

    if (typeof window.applyFFTPageLanguage === "function") {
      window.applyFFTPageLanguage();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.querySelector("[data-calendar-root]");
    if (!root) return;

    root.querySelectorAll("[data-calendar-semester]").forEach(function (button) {
      button.addEventListener("click", function () {
        root.querySelectorAll("[data-calendar-semester]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        renderCalendar();
      });
    });

    root.querySelector("[data-calendar-year]")?.addEventListener("change", renderCalendar);
    root.querySelector("[data-calendar-search]")?.addEventListener("input", renderCalendar);

    document.querySelectorAll(".fft-floating-language-btn, [data-fft-lang], [data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        setTimeout(renderCalendar, 0);
        setTimeout(renderCalendar, 80);
        setTimeout(renderCalendar, 180);
      });
    });

    renderCalendar();
  });

  window.addEventListener("fft-language-change", renderCalendar);
  window.addEventListener("storage", renderCalendar);
  window.renderAcademicCalendar = renderCalendar;
})();
// FFT ACADEMIC CALENDAR PAGE END

// FFT ACADEMIC RULES PAGE START
(function () {
  const rulesData = [
    {
      category: "studi",
      titleId: "Kartu Rencana Studi",
      titleEn: "Study Plan Card",
      scopeId: "Perencanaan studi mahasiswa",
      scopeEn: "Student study planning",
      bodyId: "Konten sedang maintenance. Ketentuan pengisian KRS akan ditampilkan setelah data resmi tersedia.",
      bodyEn: "Content is under maintenance. Study plan submission rules will be displayed once official data is available."
    },
    {
      category: "studi",
      titleId: "Beban SKS dan Masa Studi",
      titleEn: "Credit Load and Study Duration",
      scopeId: "Struktur beban akademik",
      scopeEn: "Academic load structure",
      bodyId: "Konten sedang maintenance. Informasi batas SKS, masa studi, dan ketentuan pengambilan mata kuliah akan disiapkan melalui backend.",
      bodyEn: "Content is under maintenance. Information on credit limits, study duration, and course enrollment rules will be prepared through the backend."
    },
    {
      category: "evaluasi",
      titleId: "Kehadiran Perkuliahan",
      titleEn: "Lecture Attendance",
      scopeId: "Syarat partisipasi akademik",
      scopeEn: "Academic participation requirement",
      bodyId: "Konten sedang maintenance. Ketentuan kehadiran, izin, dan batas ketidakhadiran akan mengikuti keputusan akademik fakultas.",
      bodyEn: "Content is under maintenance. Attendance, permission, and absence limit rules will follow faculty academic decisions."
    },
    {
      category: "evaluasi",
      titleId: "Ujian dan Penilaian",
      titleEn: "Examinations and Assessment",
      scopeId: "Evaluasi hasil belajar",
      scopeEn: "Learning outcome evaluation",
      bodyId: "Konten sedang maintenance. Sistem ujian, komponen penilaian, dan standar evaluasi akan ditampilkan setelah data tersedia.",
      bodyEn: "Content is under maintenance. Examination systems, grading components, and evaluation standards will be displayed once data is available."
    },
    {
      category: "administrasi",
      titleId: "Cuti Akademik",
      titleEn: "Academic Leave",
      scopeId: "Administrasi status mahasiswa",
      scopeEn: "Student status administration",
      bodyId: "Konten sedang maintenance. Prosedur cuti, pengajuan, dan persetujuan akademik akan diisi oleh admin.",
      bodyEn: "Content is under maintenance. Academic leave procedures, submissions, and approvals will be added by administrators."
    },
    {
      category: "administrasi",
      titleId: "Perubahan Data Akademik",
      titleEn: "Academic Data Changes",
      scopeId: "Validasi dan pembaruan data",
      scopeEn: "Data validation and updates",
      bodyId: "Konten sedang maintenance. Informasi perubahan data akademik akan disesuaikan dengan sistem administrasi fakultas.",
      bodyEn: "Content is under maintenance. Academic data change information will be aligned with the faculty administration system."
    },
    {
      category: "etik",
      titleId: "Etika Akademik",
      titleEn: "Academic Ethics",
      scopeId: "Integritas studi dan pelayanan",
      scopeEn: "Study and service integrity",
      bodyId: "Konten sedang maintenance. Pedoman etika akademik, kejujuran, dan tanggung jawab mahasiswa akan ditampilkan di halaman ini.",
      bodyEn: "Content is under maintenance. Academic ethics, honesty, and student responsibility guidelines will be displayed on this page."
    }
  ];

  function getRulesLang() {
    const keys = ["fft-language", "siteLanguage", "fftLang", "fft_language", "selectedLanguage", "language"];

    for (const key of keys) {
      const value = (localStorage.getItem(key) || "").toLowerCase();
      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const activeButton = document.querySelector(".fft-floating-language-btn.is-active, .fft-floating-language-btn[aria-pressed='true']");
    if (activeButton) {
      const value = (
        activeButton.dataset.fftLang ||
        activeButton.dataset.lang ||
        activeButton.textContent ||
        ""
      ).trim().toLowerCase();

      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    return (document.documentElement.lang || "").toLowerCase().startsWith("en") ? "en" : "id";
  }

  function text(item, key) {
    const lang = getRulesLang();
    return lang === "en" ? item[key + "En"] : item[key + "Id"];
  }

  function activeCategory() {
    const active = document.querySelector("[data-rules-category].is-active");
    return active ? active.getAttribute("data-rules-category") : "all";
  }

  function categoryLabel(category) {
    const lang = getRulesLang();

    const map = {
      all: { id: "Semua", en: "All" },
      studi: { id: "Studi", en: "Study" },
      evaluasi: { id: "Evaluasi", en: "Evaluation" },
      administrasi: { id: "Administrasi", en: "Administration" },
      etik: { id: "Etika Akademik", en: "Academic Ethics" }
    };

    return lang === "en" ? map[category].en : map[category].id;
  }

  function renderRules() {
    const root = document.querySelector("[data-rules-root]");
    if (!root) return;

    const lang = getRulesLang();
    const category = activeCategory();
    const query = (root.querySelector("[data-rules-search]")?.value || "").trim().toLowerCase();

    let rows = rulesData.filter(function (item) {
      return category === "all" || item.category === category;
    });

    if (query) {
      rows = rows.filter(function (item) {
        return [
          item.titleId,
          item.titleEn,
          item.scopeId,
          item.scopeEn,
          item.bodyId,
          item.bodyEn
        ].join(" ").toLowerCase().includes(query);
      });
    }

    const statCategory = root.querySelector("[data-rules-stat-category]");
    const statCount = root.querySelector("[data-rules-stat-count]");
    const statStatus = root.querySelector("[data-rules-stat-status]");
    const list = root.querySelector("[data-rules-list]");

    if (statCategory) statCategory.textContent = categoryLabel(category);
    if (statCount) statCount.textContent = rows.length;
    if (statStatus) statStatus.textContent = "Maintenance";

    if (!list) return;

    if (!rows.length) {
      list.innerHTML = `<div class="academic-rules-empty">${lang === "en" ? "No rule matches the current filter." : "Tidak ada aturan yang cocok dengan filter saat ini."}</div>`;
      return;
    }

    list.innerHTML = rows.map(function (item, index) {
      const open = index === 0;

      return `
        <article class="academic-rule-card">
          <button type="button" class="academic-rule-toggle" aria-expanded="${open ? "true" : "false"}">
            <div>
              <h3>${text(item, "title")}</h3>
              <span>${text(item, "scope")}</span>
            </div>
            <div class="academic-rule-icon">${open ? "−" : "+"}</div>
          </button>

          <div class="academic-rule-panel" ${open ? 'data-open="true"' : ""}>
            <p>${text(item, "body")}</p>
            <ul>
              <li>${lang === "en" ? "Prepared for backend managed academic content." : "Disiapkan untuk konten akademik yang dikelola melalui backend."}</li>
              <li>${lang === "en" ? "Final wording will follow official faculty policy." : "Redaksi final akan mengikuti kebijakan resmi fakultas."}</li>
            </ul>
          </div>
        </article>
      `;
    }).join("");

    list.querySelectorAll(".academic-rule-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        const panel = toggle.closest(".academic-rule-card").querySelector(".academic-rule-panel");
        const icon = toggle.querySelector(".academic-rule-icon");

        toggle.setAttribute("aria-expanded", expanded ? "false" : "true");

        if (panel) {
          if (expanded) {
            panel.removeAttribute("data-open");
          } else {
            panel.setAttribute("data-open", "true");
          }
        }

        if (icon) icon.textContent = expanded ? "+" : "−";
      });
    });

    if (typeof window.applyFFTPageLanguage === "function") {
      window.applyFFTPageLanguage();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.querySelector("[data-rules-root]");
    if (!root) return;

    root.querySelectorAll("[data-rules-category]").forEach(function (button) {
      button.addEventListener("click", function () {
        root.querySelectorAll("[data-rules-category]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        renderRules();
      });
    });

    root.querySelector("[data-rules-search]")?.addEventListener("input", renderRules);

    document.querySelectorAll(".fft-floating-language-btn, [data-fft-lang], [data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        setTimeout(renderRules, 0);
        setTimeout(renderRules, 80);
        setTimeout(renderRules, 180);
      });
    });

    renderRules();
  });

  window.addEventListener("fft-language-change", renderRules);
  window.addEventListener("storage", renderRules);
  window.renderAcademicRules = renderRules;
})();
// FFT ACADEMIC RULES PAGE END

// FFT TESTIMONIAL PAGE START
(function () {
  const testimonialData = [
    {
      category: "mahasiswa",
      nameId: "Mahasiswa FFT",
      nameEn: "FFT Student",
      roleId: "Mahasiswa Aktif",
      roleEn: "Active Student",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Testimoni mahasiswa akan ditampilkan setelah data resmi tersedia dari backend.",
      quoteEn: "Student testimonials will be displayed once official data is available from the backend.",
      rating: 5,
      photo: ""
    },
    {
      category: "alumni",
      nameId: "Alumni FFT",
      nameEn: "FFT Alumni",
      roleId: "Alumni",
      roleEn: "Alumni",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Cerita alumni tentang studi, pelayanan, dan pengembangan karakter akan ditampilkan di bagian ini.",
      quoteEn: "Alumni stories about study, service, and character development will be displayed in this section.",
      rating: 5,
      photo: ""
    },
    {
      category: "orang-tua",
      nameId: "Orang Tua Mahasiswa",
      nameEn: "Student Parent",
      roleId: "Orang Tua",
      roleEn: "Parent",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Pandangan orang tua tentang pembinaan mahasiswa akan ditampilkan setelah data tersedia.",
      quoteEn: "Parent perspectives on student formation will be displayed once data is available.",
      rating: 5,
      photo: ""
    },
    {
      category: "mahasiswa",
      nameId: "Mahasiswa Teologi",
      nameEn: "Theology Student",
      roleId: "Mahasiswa",
      roleEn: "Student",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Data testimoni ini disiapkan sebagai placeholder sampai sistem backend mengelola konten final.",
      quoteEn: "This testimonial data is prepared as a placeholder until the backend system manages the final content.",
      rating: 5,
      photo: ""
    },
    {
      category: "alumni",
      nameId: "Lulusan FFT",
      nameEn: "FFT Graduate",
      roleId: "Lulusan",
      roleEn: "Graduate",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Testimoni lulusan akan membantu calon mahasiswa memahami dampak pendidikan dan pelayanan.",
      quoteEn: "Graduate testimonials will help prospective students understand the impact of education and service.",
      rating: 5,
      photo: ""
    },
    {
      category: "mahasiswa",
      nameId: "Mahasiswa Pelayanan",
      nameEn: "Service Student",
      roleId: "Mahasiswa",
      roleEn: "Student",
      titleId: "Konten Sedang Maintenance",
      titleEn: "Content Under Maintenance",
      quoteId: "Bagian ini akan memuat pengalaman mahasiswa dalam pelayanan kampus dan pembentukan spiritual.",
      quoteEn: "This section will contain student experiences in campus service and spiritual formation.",
      rating: 5,
      photo: ""
    }
  ];

  let testimonialObserver = null;

  function getTestimonialLang() {
    const keys = ["fft-language", "siteLanguage", "fftLang", "fft_language", "selectedLanguage", "language"];

    for (const key of keys) {
      const value = (localStorage.getItem(key) || "").toLowerCase();
      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const activeButton = document.querySelector(".fft-floating-language-btn.is-active, .fft-floating-language-btn[aria-pressed='true']");
    if (activeButton) {
      const value = (
        activeButton.dataset.fftLang ||
        activeButton.dataset.lang ||
        activeButton.textContent ||
        ""
      ).trim().toLowerCase();

      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    return (document.documentElement.lang || "").toLowerCase().startsWith("en") ? "en" : "id";
  }

  function text(item, key) {
    const lang = getTestimonialLang();
    return lang === "en" ? item[key + "En"] : item[key + "Id"];
  }

  function activeCategory() {
    const active = document.querySelector("[data-testimonial-category].is-active");
    return active ? active.getAttribute("data-testimonial-category") : "all";
  }

  function categoryLabel(category) {
    const lang = getTestimonialLang();
    const map = {
      all: { id: "Semua", en: "All" },
      mahasiswa: { id: "Mahasiswa", en: "Students" },
      alumni: { id: "Alumni", en: "Alumni" },
      "orang-tua": { id: "Orang Tua", en: "Parents" }
    };

    return lang === "en" ? map[category].en : map[category].id;
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (word) { return word[0]; })
      .join("")
      .toUpperCase();
  }

  function renderStars(value) {
    const total = Number(value) || 5;
    return "★".repeat(Math.max(1, Math.min(5, total)));
  }

  function observeCards() {
    const cards = document.querySelectorAll("[data-testimonial-card]");

    if (testimonialObserver) {
      testimonialObserver.disconnect();
    }

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.classList.add("is-visible");
      });
      return;
    }

    testimonialObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          testimonialObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    cards.forEach(function (card, index) {
      card.style.transitionDelay = Math.min(index * 70, 280) + "ms";
      testimonialObserver.observe(card);
    });
  }

  function renderTestimonials() {
    const root = document.querySelector("[data-testimonial-root]");
    if (!root) return;

    const lang = getTestimonialLang();
    const category = activeCategory();
    const query = (root.querySelector("[data-testimonial-search]")?.value || "").trim().toLowerCase();

    let rows = testimonialData.filter(function (item) {
      return category === "all" || item.category === category;
    });

    if (query) {
      rows = rows.filter(function (item) {
        return [
          item.nameId,
          item.nameEn,
          item.roleId,
          item.roleEn,
          item.titleId,
          item.titleEn,
          item.quoteId,
          item.quoteEn
        ].join(" ").toLowerCase().includes(query);
      });
    }

    const statCategory = root.querySelector("[data-testimonial-stat-category]");
    const statCount = root.querySelector("[data-testimonial-stat-count]");
    const statStatus = root.querySelector("[data-testimonial-stat-status]");

    if (statCategory) statCategory.textContent = categoryLabel(category);
    if (statCount) statCount.textContent = rows.length;
    if (statStatus) statStatus.textContent = "Maintenance";

    const featured = rows[0] || testimonialData[0];

    const featuredTitle = root.querySelector("[data-featured-title]");
    const featuredQuote = root.querySelector("[data-featured-quote]");
    const featuredName = root.querySelector("[data-featured-name]");
    const featuredRole = root.querySelector("[data-featured-role]");

    if (featuredTitle) featuredTitle.textContent = text(featured, "title");
    if (featuredQuote) featuredQuote.textContent = text(featured, "quote");
    if (featuredName) featuredName.textContent = text(featured, "name");
    if (featuredRole) featuredRole.textContent = text(featured, "role");

    const list = root.querySelector("[data-testimonial-list]");
    if (!list) return;

    if (!rows.length) {
      list.innerHTML = `<div class="testimonial-empty">${lang === "en" ? "No testimonial matches the current filter." : "Tidak ada testimoni yang cocok dengan filter saat ini."}</div>`;
      return;
    }

    list.innerHTML = rows.map(function (item) {
      const name = text(item, "name");
      const role = text(item, "role");
      const quote = text(item, "quote");
      const photo = item.photo || "";
      const alt = lang === "en" ? "Photo of " + name : "Foto " + name;

      return `
        <article class="testimonial-card" data-testimonial-card>
          <div class="testimonial-card-image">
            ${
              photo
                ? `<img src="${photo}" alt="${alt}">`
                : `<div class="testimonial-photo-placeholder">${lang === "en" ? "Photo" : "Foto"}</div>`
            }
          </div>

          <div class="testimonial-card-content">
            <div class="testimonial-rating" aria-hidden="true">${renderStars(item.rating)}</div>
            <blockquote>${quote}</blockquote>

            <div class="testimonial-card-author">
              <div class="testimonial-author-mini">${initials(name)}</div>
              <div>
                <h3>${name}</h3>
                <span>${role}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    observeCards();

    if (typeof window.applyFFTPageLanguage === "function") {
      window.applyFFTPageLanguage();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.querySelector("[data-testimonial-root]");
    if (!root) return;

    root.querySelectorAll("[data-testimonial-category]").forEach(function (button) {
      button.addEventListener("click", function () {
        root.querySelectorAll("[data-testimonial-category]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        renderTestimonials();
      });
    });

    root.querySelector("[data-testimonial-search]")?.addEventListener("input", renderTestimonials);

    document.querySelectorAll(".fft-floating-language-btn, [data-fft-lang], [data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        setTimeout(renderTestimonials, 0);
        setTimeout(renderTestimonials, 80);
        setTimeout(renderTestimonials, 180);
      });
    });

    renderTestimonials();
  });

  window.addEventListener("fft-language-change", renderTestimonials);
  window.addEventListener("storage", renderTestimonials);
  window.renderTestimonialsPage = renderTestimonials;
})();
// FFT TESTIMONIAL PAGE END
