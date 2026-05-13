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
