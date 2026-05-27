/* FFT_FIX_HEADER_REFRESH_FLASH_ALL_VIEWPORTS_20260524
   Tandai header siap setelah script navigasi selesai diproses.
*/
(function () {
  "use strict";

  function markHeaderReady() {
    if (!document.documentElement) return;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add("fft-header-ready");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markHeaderReady);
  } else {
    markHeaderReady();
  }

  window.addEventListener("load", markHeaderReady);
  window.addEventListener("pageshow", markHeaderReady);

  setTimeout(function () {
    document.documentElement.classList.add("fft-header-flash-fallback");
  }, 700);
}());

﻿document.addEventListener("DOMContentLoaded", function () {
  const labels = {
    nav_curriculum: { id: "Kurikulum", en: "Curriculum" },
    nav_academic_calendar: { id: "Kalender Akademik", en: "Academic Calendar" },
    nav_ranking_board: { id: "Papan Peringkat", en: "Ranking Board" },
    nav_testimonials: { id: "Testimoni", en: "Testimonials" },
    nav_academic_rules: { id: "Aturan Akademik", en: "Academic Rules" }
  };

  function getLang() {
    return localStorage.getItem("fft-language")
      || localStorage.getItem("siteLanguage")
      || localStorage.getItem("fftLang")
      || document.documentElement.lang
      || "id";
  }

  function applyLabels() {
    const lang = getLang() === "en" ? "en" : "id";

    Object.keys(labels).forEach(function (key) {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (el) {
        el.textContent = labels[key][lang];
      });
    });
  }

  applyLabels();
  window.addEventListener("fft-language-change", applyLabels);
  window.addEventListener("storage", applyLabels);
});

/* FFT_FIX_NAV_EBROCHURE_LABEL_20260521
   Fix label E-Brochure pada navbar inner pages.
   Mencegah key mentah "nav_ebrochure" tampil di dropdown Pendaftaran.
*/
(function () {
  "use strict";

  function fixEbrochureLabel() {
    var selectors = [
      '[data-i18n="nav_ebrochure"]',
      '[data-lang-key="nav_ebrochure"]',
      '[data-nav-key="nav_ebrochure"]'
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = "E-Brochure";
      });
    });

    document.querySelectorAll("a, button, span, li").forEach(function (el) {
      if ((el.textContent || "").trim() === "nav_ebrochure") {
        el.textContent = "E-Brochure";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fixEbrochureLabel();
    window.setTimeout(fixEbrochureLabel, 80);
    window.setTimeout(fixEbrochureLabel, 240);
  });

  window.addEventListener("fft-language-change", fixEbrochureLabel);
}());

/* FFT_NAV_REQUIREMENTS_INLINE_TO_ADMISSION_FLOW_20260525
   Persyaratan bukan page berdiri sendiri.
   Menu desktop dan mobile diarahkan ke section Persyaratan di Alur Pendaftaran.
*/
(function () {
  "use strict";

  function currentLang() {
    var saved =
      localStorage.getItem("fft-language") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "id";

    return saved === "en" ? "en" : "id";
  }

  function isAlurPage() {
    return /alur-pendaftaran\.html/i.test(window.location.pathname || "");
  }

  function requirementsHref() {
    return isAlurPage()
      ? "#persyaratan-pendaftaran"
      : "alur-pendaftaran.html#persyaratan-pendaftaran";
  }

  function label() {
    return currentLang() === "en" ? "Requirements" : "Persyaratan";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isAdmissionMenu(menu) {
    var html = String(menu.innerHTML || "").toLowerCase();

    return html.indexOf("alur-pendaftaran.html") !== -1 &&
      (
        html.indexOf("simulasi-pendaftaran-offline.html") !== -1 ||
        html.indexOf("e-brochure.html") !== -1
      );
  }

  function rewriteExistingRequirementsLinks() {
    document.querySelectorAll('a[href*="persyaratan.html"]').forEach(function (link) {
      link.setAttribute("href", requirementsHref());

      if (!link.getAttribute("data-i18n")) {
        link.setAttribute("data-i18n", "nav_requirements");
      }

      link.textContent = label();
    });
  }

  function createRequirementsLink(reference) {
    var link = document.createElement("a");

    link.href = requirementsHref();
    link.textContent = label();
    link.setAttribute("data-i18n", "nav_requirements");

    if (reference && reference.className) {
      link.className = reference.className;
      link.classList.remove("active", "is-active", "current");
    }

    return link;
  }

  function ensureRequirementsInMenu(menu) {
    if (!menu || !isAdmissionMenu(menu)) return;

    var existing = Array.from(menu.querySelectorAll("a")).find(function (link) {
      var href = String(link.getAttribute("href") || "").toLowerCase();
      var text = normalizeText(link.textContent);

      return href.indexOf("persyaratan") !== -1 ||
        href.indexOf("persyaratan-pendaftaran") !== -1 ||
        text === "persyaratan" ||
        text === "requirements";
    });

    if (existing) {
      existing.setAttribute("href", requirementsHref());
      existing.textContent = label();

      if (!existing.getAttribute("data-i18n")) {
        existing.setAttribute("data-i18n", "nav_requirements");
      }

      return;
    }

    var alurLink = Array.from(menu.querySelectorAll("a")).find(function (link) {
      return String(link.getAttribute("href") || "").toLowerCase().indexOf("alur-pendaftaran.html") !== -1;
    });

    if (!alurLink) return;

    var newLink = createRequirementsLink(alurLink);

    alurLink.insertAdjacentElement("afterend", newLink);
  }

  function ensureAllAdmissionMenus() {
    rewriteExistingRequirementsLinks();

    document.querySelectorAll(".dropdown-menu, .dropdown-content, .submenu, .nav-dropdown, .mobile-menu, .mobile-nav, ul, nav div").forEach(function (menu) {
      ensureRequirementsInMenu(menu);
    });
  }

  function boot() {
    ensureAllAdmissionMenus();

    setTimeout(ensureAllAdmissionMenus, 120);
    setTimeout(ensureAllAdmissionMenus, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);

  document.addEventListener("click", function (event) {
    var target = event.target;

    if (!target || !target.closest) return;

    var navTrigger = target.closest("a, button");

    if (!navTrigger) return;

    var text = normalizeText(navTrigger.textContent);

    if (text === "pendaftaran" || text === "admission") {
      setTimeout(ensureAllAdmissionMenus, 40);
    }
  }, true);
}());

/* FFT_NAVIGATION_LANGUAGE_FIX_FOT_20260527
   Sinkron EN ID untuk navigasi global.
   ID tetap Fakultas Filsafat Teologi.
   EN memakai Faculty Of Theology.
*/
(function () {
  "use strict";

  var text = {
    id: {
      top_uasn: "Website UASN",
      top_home: "Halaman Utama FFT",
      top_apply: "Daftar Sekarang",

      brand_faculty: "Fakultas Filsafat Teologi",
      brand_title: "Fakultas Filsafat Teologi",
      brand_university: "Universitas Advent Surya Nusantara",

      nav_home: "Beranda",
      nav_program: "Program Studi",
      nav_background: "Latar Belakang",
      nav_vision: "Visi & Misi",
      nav_organization: "Organisasi",
      nav_staff: "Pimpinan & Dosen",
      nav_news: "Berita",
      nav_contact: "Kontak",

      nav_admission: "Pendaftaran",
      nav_flow: "Alur Pendaftaran",
      nav_requirements: "Persyaratan",
      nav_simulation: "Simulasi Offline",
      nav_ebrochure: "E Brochure",

      nav_academic: "Akademik",
      nav_rules: "Aturan Akademik",
      nav_calendar: "Kalender Akademik",
      nav_curriculum: "Kurikulum",
      nav_ranking: "Papan Peringkat",
      nav_testimony: "Testimoni",

      footer_nav: "Navigasi",
      footer_contact: "Kontak Fakultas",
      footer_title: "Fakultas Filsafat Teologi"
    },

    en: {
      top_uasn: "UASN Website",
      top_home: "FFT Main Page",
      top_apply: "Apply Now",

      brand_faculty: "Faculty Of Theology",
      brand_title: "Faculty Of Theology",
      brand_university: "Universitas Advent Surya Nusantara",

      nav_home: "Home",
      nav_program: "Study Program",
      nav_background: "Background",
      nav_vision: "Vision & Mission",
      nav_organization: "Organization",
      nav_staff: "Leaders & Lecturers",
      nav_news: "News",
      nav_contact: "Contact",

      nav_admission: "Admission",
      nav_flow: "Admission Flow",
      nav_requirements: "Requirements",
      nav_simulation: "Offline Simulation",
      nav_ebrochure: "E Brochure",

      nav_academic: "Academic",
      nav_rules: "Academic Rules",
      nav_calendar: "Academic Calendar",
      nav_curriculum: "Curriculum",
      nav_ranking: "Ranking Board",
      nav_testimony: "Testimonials",

      footer_nav: "Navigation",
      footer_contact: "Faculty Contact",
      footer_title: "Faculty Of Theology"
    }
  };

  var exactPairs = [
    ["Website UASN", "UASN Website"],
    ["Halaman Utama FFT", "FFT Main Page"],
    ["Daftar Sekarang", "Apply Now"],

    ["Fakultas Filsafat Teologi", "Faculty Of Theology"],
    ["Pendaftaran", "Admission"],
    ["Alur Pendaftaran", "Admission Flow"],
    ["Persyaratan", "Requirements"],
    ["Simulasi Offline", "Offline Simulation"],

    ["Akademik", "Academic"],
    ["Aturan Akademik", "Academic Rules"],
    ["Kalender Akademik", "Academic Calendar"],
    ["Kurikulum", "Curriculum"],
    ["Papan Peringkat", "Ranking Board"],

    ["Program Studi", "Study Program"],
    ["Latar Belakang", "Background"],
    ["Visi & Misi", "Vision & Mission"],
    ["Organisasi", "Organization"],
    ["Pimpinan & Dosen", "Leaders & Lecturers"],
    ["Berita", "News"],
    ["Kontak", "Contact"],
    ["Testimoni", "Testimonials"],

    ["Navigasi", "Navigation"],
    ["Kontak Fakultas", "Faculty Contact"]
  ];

  function getLang() {
    var saved =
      localStorage.getItem("fft-language") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "id";

    return saved === "en" ? "en" : "id";
  }

  function saveLang(lang) {
    lang = lang === "en" ? "en" : "id";

    localStorage.setItem("fft-language", lang);
    localStorage.setItem("siteLanguage", lang);
    localStorage.setItem("lang", lang);

    return lang;
  }

  function setButtonState(lang) {
    document.querySelectorAll("[data-fft-lang], [data-lang], .fft-floating-language-btn").forEach(function (button) {
      var value = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (value !== "id" && value !== "en") return;

      var active = value === lang;

      button.classList.toggle("is-active", active);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyDataI18n(lang) {
    var table = text[lang] || text.id;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");

      if (!key || !table[key]) return;

      element.textContent = table[key];
    });
  }

  function applyPageLabels(lang) {
    document.querySelectorAll("[data-page-id][data-page-en]").forEach(function (element) {
      var next = lang === "en"
        ? element.getAttribute("data-page-en")
        : element.getAttribute("data-page-id");

      if (!next) return;

      element.textContent = next;
    });
  }

  function applyExactText(lang) {
    var fromIndex = lang === "en" ? 0 : 1;
    var toIndex = lang === "en" ? 1 : 0;

    document.querySelectorAll("a, button, span, b, strong, small, p, h1, h2, h3, h4").forEach(function (element) {
      if (!element || element.children.length > 0) return;

      var current = String(element.textContent || "").replace(/\s+/g, " ").trim();

      if (!current) return;

      exactPairs.forEach(function (pair) {
        if (current === pair[fromIndex] || current === pair[toIndex]) {
          element.textContent = pair[toIndex];
        }
      });
    });
  }

  function applyNavigationLanguage(lang) {
    lang = saveLang(lang || getLang());

    document.documentElement.lang = lang;

    applyDataI18n(lang);
    applyPageLabels(lang);
    applyExactText(lang);
    setButtonState(lang);
  }

  function bindLanguageButtons() {
    if (document.documentElement.dataset.fftNavLanguageFixBound === "1") return;

    document.documentElement.dataset.fftNavLanguageFixBound = "1";

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest
        ? event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn")
        : null;

      if (!button) return;

      var lang = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (lang !== "id" && lang !== "en") return;

      setTimeout(function () { applyNavigationLanguage(lang); }, 20);
      setTimeout(function () { applyNavigationLanguage(lang); }, 160);
      setTimeout(function () { applyNavigationLanguage(lang); }, 520);
    }, true);
  }

  function boot() {
    bindLanguageButtons();

    applyNavigationLanguage(getLang());

    setTimeout(function () { applyNavigationLanguage(getLang()); }, 120);
    setTimeout(function () { applyNavigationLanguage(getLang()); }, 500);
  }

  window.fftApplyNavigationLanguage = applyNavigationLanguage;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
}());

