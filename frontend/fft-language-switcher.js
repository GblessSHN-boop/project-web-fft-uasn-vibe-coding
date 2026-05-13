document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = "fft-language";
  const LEGACY_KEYS = ["siteLanguage", "fftLang", "selectedLanguage"];
  const DEFAULT_LANGUAGE = "id";
  let internalClick = false;

  const fallbackText = {
    id: {
      "staff_kicker": "PROFIL AKADEMIK",
      "staff_title": "Pimpinan dan Dosen",
      "staff_desc": "Kenali pimpinan dan dosen Fakultas Filsafat Teologi Universitas Advent Surya Nusantara.",
      "staff_side_title": "TENAGA AKADEMIK FFT",
      "staff_side_desc": "Informasi dosen ditampilkan untuk membantu mahasiswa, calon mahasiswa, dan masyarakat mengenal struktur akademik fakultas.",
      "staff_breadcrumb_current": "Pimpinan & Dosen",
      "staff_directory_kicker": "DIREKTORI FAKULTAS",
      "staff_directory_title": "Struktur Pimpinan dan Daftar Dosen",
      "staff_stat_dean": "Pimpinan Fakultas",
      "staff_stat_lecturer": "Dosen Terdata",
      "staff_stat_total": "Total Profil",
      "staff_dean_title": "Pimpinan Fakultas",
      "staff_dean_badge": "DEKAN",
      "staff_lecturer_title": "Daftar Dosen",
      "staff_search_placeholder": "Cari dosen atau bidang...",
      "why_kicker": "ALASAN MEMILIH FFT",
      "why_title": "Alasan Memilih Fakultas Filsafat Teologia",
      "why_subtitle": "UNIVERSITAS ADVENT SURYA NUSANTARA",
      "why_desc": "Konten belum tersedia.",
      "why_media_placeholder": "Konten Belum Tersedia"
    },
    en: {
      "staff_kicker": "ACADEMIC PROFILE",
      "staff_title": "Leaders and Lecturers",
      "staff_desc": "Meet the leaders and lecturers of the Faculty of Philosophy and Theology, Universitas Advent Surya Nusantara.",
      "staff_side_title": "FFT ACADEMIC STAFF",
      "staff_side_desc": "Lecturer information helps students, prospective students, and the public understand the faculty academic structure.",
      "staff_breadcrumb_current": "Leaders & Lecturers",
      "staff_directory_kicker": "FACULTY DIRECTORY",
      "staff_directory_title": "Leadership Structure and Lecturer Directory",
      "staff_stat_dean": "Faculty Leader",
      "staff_stat_lecturer": "Listed Lecturers",
      "staff_stat_total": "Total Profiles",
      "staff_dean_title": "Faculty Leadership",
      "staff_dean_badge": "DEAN",
      "staff_lecturer_title": "Lecturer Directory",
      "staff_search_placeholder": "Search lecturer or field...",
      "why_kicker": "WHY CHOOSE FFT",
      "why_title": "Why Choose the Faculty of Philosophy and Theology",
      "why_subtitle": "UNIVERSITAS ADVENT SURYA NUSANTARA",
      "why_desc": "Content not available yet.",
      "why_media_placeholder": "Content Not Available Yet"
    }
  };

  function normalizeLanguage(value) {
    return value === "en" ? "en" : "id";
  }

  function getStoredLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY)
      || localStorage.getItem("siteLanguage")
      || localStorage.getItem("fftLang")
      || localStorage.getItem("selectedLanguage");

    return normalizeLanguage(stored || DEFAULT_LANGUAGE);
  }

  function saveLanguage(language) {
    const lang = normalizeLanguage(language);
    localStorage.setItem(STORAGE_KEY, lang);
    LEGACY_KEYS.forEach(function (key) {
      localStorage.setItem(key, lang);
    });
  }

  function syncFloatingButtons(language) {
    document.querySelectorAll("[data-fft-lang]").forEach(function (button) {
      const active = button.dataset.fftLang === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function syncLegacyButtons(language) {
    document.querySelectorAll("button, a, [role='button']").forEach(function (element) {
      if (element.closest(".fft-floating-language")) return;

      const text = (element.textContent || "").trim().toLowerCase();
      const dataLang = (
        element.dataset.lang ||
        element.dataset.language ||
        element.dataset.langSwitch ||
        element.getAttribute("data-set-lang") ||
        ""
      ).toLowerCase();

      const isLanguageButton = dataLang === "id" || dataLang === "en" || text === "id" || text === "en";
      if (!isLanguageButton) return;

      const active = dataLang === language || text === language;
      element.classList.toggle("active", active);
      element.classList.toggle("is-active", active);
      element.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function clickLegacyLanguageButton(language) {
    if (internalClick) return;

    const candidates = Array.from(document.querySelectorAll("button, a, [role='button']"));

    const target = candidates.find(function (element) {
      if (element.closest(".fft-floating-language")) return false;

      const text = (element.textContent || "").trim().toLowerCase();
      const dataLang = (
        element.dataset.lang ||
        element.dataset.language ||
        element.dataset.langSwitch ||
        element.getAttribute("data-set-lang") ||
        ""
      ).toLowerCase();

      return dataLang === language || text === language;
    });

    if (!target) return;

    internalClick = true;
    target.click();
    window.setTimeout(function () {
      internalClick = false;
    }, 0);
  }

  function applyFallbackText(language) {
    const dict = fallbackText[language] || fallbackText.id;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.getAttribute("data-i18n");
      if (!key || !dict[key]) return;
      element.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      const key = element.getAttribute("data-i18n-placeholder");
      if (!key || !dict[key]) return;
      element.setAttribute("placeholder", dict[key]);
    });
  }

  function applyLanguage(language, options) {
    const lang = normalizeLanguage(language);
    const shouldPersist = !options || options.persist !== false;
    const shouldClickLegacy = !options || options.clickLegacy !== false;

    if (shouldPersist) saveLanguage(lang);

    document.documentElement.lang = lang;
    document.body.setAttribute("data-language", lang);

    syncFloatingButtons(lang);
    syncLegacyButtons(lang);
    applyFallbackText(lang);

    if (shouldClickLegacy) {
      clickLegacyLanguageButton(lang);
      window.setTimeout(function () {
        applyFallbackText(lang);
        syncLegacyButtons(lang);
      }, 40);
    }

    window.dispatchEvent(new CustomEvent("fft-language-change", {
      detail: { language: lang }
    }));
  }

  document.querySelectorAll("[data-fft-lang]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      applyLanguage(button.dataset.fftLang || DEFAULT_LANGUAGE, {
        persist: true,
        clickLegacy: true
      });
    });
  });

  const initialLanguage = getStoredLanguage();
  saveLanguage(initialLanguage);
  applyLanguage(initialLanguage, {
    persist: false,
    clickLegacy: true
  });

  window.fftSetLanguage = function (language) {
    applyLanguage(language, {
      persist: true,
      clickLegacy: true
    });
  };
});
