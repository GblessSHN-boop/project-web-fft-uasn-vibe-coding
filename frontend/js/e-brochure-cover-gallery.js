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
/* FFT_EBROCHURE_PDF_COVER_PREVIEW_20260529
   Tampilkan cover PDF placeholder pada card cover e-brochure.
*/
(function () {
  "use strict";

  var coverPdf = "brochure-viewer/assets/brosur/konten-belum-tersedia-fft/cover.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH";

  function replaceCoverImage(image) {
    if (!image || image.dataset.fftPdfCoverReady === "1") {
      return;
    }

    var src = image.getAttribute("src") || "";

    if (!/cover-gallery-\d+\.svg/i.test(src)) {
      return;
    }

    var frame = document.createElement("iframe");
    var rect = image.getBoundingClientRect();

    frame.className = "fft-ebrochure-pdf-cover-frame";
    frame.src = coverPdf;
    frame.title = image.getAttribute("alt") || "Cover PDF brosur";
    frame.loading = "lazy";
    frame.setAttribute("aria-label", frame.title);
    frame.setAttribute("tabindex", "-1");

    frame.style.width = "100%";
    frame.style.border = "0";
    frame.style.display = "block";
    frame.style.background = "#ffffff";
    frame.style.pointerEvents = "none";

    if (rect.height > 40) {
      frame.style.height = rect.height + "px";
    } else {
      frame.style.aspectRatio = "210 / 297";
    }

    image.dataset.fftPdfCoverReady = "1";
    image.replaceWith(frame);
  }

  function bootPdfCoverPreview() {
    Array.from(document.querySelectorAll("img")).forEach(replaceCoverImage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPdfCoverPreview);
  } else {
    bootPdfCoverPreview();
  }

  window.addEventListener("pageshow", bootPdfCoverPreview);
  window.setTimeout(bootPdfCoverPreview, 300);
  window.setTimeout(bootPdfCoverPreview, 900);
}());
