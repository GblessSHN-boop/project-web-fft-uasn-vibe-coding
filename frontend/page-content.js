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
