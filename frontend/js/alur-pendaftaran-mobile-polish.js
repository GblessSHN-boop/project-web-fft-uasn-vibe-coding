/* FFT_ALUR_MOBILE_POLISH_20260525
   Sinkron kecil EN ID khusus Alur Pendaftaran.
   Tidak memakai observer berat.
*/
(function () {
  "use strict";

  var exact = {
    id: {
      "Maintenance": "Dalam Pemeliharaan",
      "Under Maintenance": "Dalam Pemeliharaan",
      "Registration Status": "Status Pendaftaran",
      "Academic Year": "Tahun Akademik",
      "View Flow": "Lihat Alur",
      "View Requirements": "Lihat Persyaratan",
      "Need Help": "Butuh Bantuan",
      "Main Flow": "Alur Utama",
      "Quick Checklist": "Checklist Cepat",
      "Help": "Bantuan",
      "Registration FAQ": "FAQ Pendaftaran",
      "Initial Information": "Informasi Awal",
      "Data Entry": "Pengisian Data",
      "Verification": "Verifikasi",
      "Document Stage": "Tahap Dokumen",
      "Information Stage": "Tahap Informasi",
      "Data Stage": "Tahap Data"
    },
    en: {
      "Dalam Pemeliharaan": "Maintenance",
      "Pemeliharaan": "Maintenance",
      "Belum Aktif": "Maintenance",
      "Status Pendaftaran": "Registration Status",
      "Tahun Akademik": "Academic Year",
      "Lihat Alur": "View Flow",
      "Lihat Persyaratan": "View Requirements",
      "Butuh Bantuan": "Need Help",
      "Alur Utama": "Main Flow",
      "Checklist Cepat": "Quick Checklist",
      "Bantuan": "Help",
      "FAQ Pendaftaran": "Registration FAQ",
      "Informasi Awal": "Initial Information",
      "Pengisian Data": "Data Entry",
      "Verifikasi": "Verification",
      "Tahap Dokumen": "Document Stage",
      "Tahap Informasi": "Information Stage",
      "Tahap Data": "Data Stage"
    }
  };

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

  function applyExact(lang) {
    var dict = exact[lang] || exact.id;

    document.documentElement.lang = lang;

    document.querySelectorAll("body.alur-pendaftaran-page *").forEach(function (el) {
      if (!el || el.children.length > 0) return;

      var text = String(el.textContent || "").trim();

      if (!text) return;

      if (Object.prototype.hasOwnProperty.call(dict, text)) {
        el.textContent = dict[text];
      }
    });
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

  function applyLanguage(lang) {
    lang = saveLang(lang || getLang());

    applyExact(lang);
    setButtonState(lang);
  }

  function bindButtons() {
    if (document.documentElement.dataset.alurMobilePolishBound === "1") return;

    document.documentElement.dataset.alurMobilePolishBound = "1";

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn");

      if (!button) return;

      var lang = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (lang !== "id" && lang !== "en") return;

      setTimeout(function () {
        applyLanguage(lang);
      }, 30);

      setTimeout(function () {
        applyLanguage(lang);
      }, 180);
    }, true);
  }

  function boot() {
    if (!document.body || !document.body.classList.contains("alur-pendaftaran-page")) return;

    bindButtons();
    applyLanguage(getLang());

    setTimeout(function () { applyLanguage(getLang()); }, 120);
    setTimeout(function () { applyLanguage(getLang()); }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
}());
