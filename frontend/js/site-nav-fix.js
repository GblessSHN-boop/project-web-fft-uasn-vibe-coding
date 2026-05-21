document.addEventListener("DOMContentLoaded", function () {
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

