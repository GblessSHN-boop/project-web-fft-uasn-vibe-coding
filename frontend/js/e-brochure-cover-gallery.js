/* FFT_EBROCHURE_COVER_GALLERY_20260528
   Bahasa untuk gallery cover. Tidak ada preview.
*/

(function () {
  "use strict";

  var copy = {
    id: {
      kicker: "BROSUR UMUM",
      title: "Cover Brosur Umum"
    },
    en: {
      kicker: "GENERAL BROCHURES",
      title: "General Brochure Covers"
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

  function applyLanguage() {
    var table = copy[getLang()] || copy.id;

    document.querySelectorAll("[data-cover-gallery-key]").forEach(function (element) {
      var key = element.getAttribute("data-cover-gallery-key");

      if (table[key]) {
        element.textContent = table[key];
      }
    });
  }

  function boot() {
    applyLanguage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", boot);

  document.addEventListener("click", function (event) {
    var langButton = event.target && event.target.closest
      ? event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn")
      : null;

    if (!langButton) return;

    setTimeout(applyLanguage, 100);
    setTimeout(applyLanguage, 360);
  }, true);
}());


/* FFT_EBROCHURE_COVER_TO_DETAIL_20260528
   Klik cover membuka halaman detail brosur.
*/
(function () {
  "use strict";

  var slugs = ["utama", "dosen", "pendaftaran", "program-studi"];

  document.addEventListener("click", function (event) {
    var item = event.target && event.target.closest
      ? event.target.closest(".fft-cover-gallery__item")
      : null;

    if (!item) return;

    var items = Array.from(document.querySelectorAll(".fft-cover-gallery__item"));
    var index = Math.max(0, items.indexOf(item));
    var slug = slugs[index] || "utama";

    window.location.href = "brochure-viewer/brochure-viewer.html?brochure=" + encodeURIComponent(slug);
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".fft-cover-gallery__item").forEach(function (item) {
      item.setAttribute("role", "link");
      item.setAttribute("tabindex", "0");
      item.style.cursor = "pointer";
    });
  });
}());
