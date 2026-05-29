/* FFT_BROCHURE_VIEWER_MINIMAL_TOOLBAR_20260529
   Ganti header besar menjadi toolbar kecil.
   A4 brosur tidak diubah.
*/

(function () {
  "use strict";

  function textOf(element) {
    return (element && element.textContent ? element.textContent : "").trim();
  }

  function getPdfLink() {
    var link = Array.from(document.querySelectorAll("a")).find(function (element) {
      var text = textOf(element).toLowerCase();
      var href = element.getAttribute("href") || "";

      return text.indexOf("download") !== -1 ||
        text.indexOf("unduh") !== -1 ||
        /\.pdf(?:$|\?)/i.test(href);
    });

    return link ? link.getAttribute("href") || "#" : "#";
  }

  function findHeader() {
    return document.querySelector("header, .viewer-header, .preview-header, .topbar");
  }

  function rebuildHeader() {
    var header = findHeader();

    if (!header) {
      header = document.createElement("header");
      document.body.insertBefore(header, document.body.firstChild);
    }

    if (header.dataset.fftToolbarReady === "1") return;

    var pdfHref = getPdfLink();

    header.dataset.fftToolbarReady = "1";
    header.className = "fft-viewer-shellbar";

    header.innerHTML = [
      '<div class="fft-viewer-shellbar__text">',
        '<p class="fft-viewer-shellbar__eyebrow">E-BROCHURE</p>',
        '<h1 class="fft-viewer-shellbar__title">Preview Brosur Digital</h1>',
        '<p class="fft-viewer-shellbar__subtitle">Baca brosur Fakultas Filsafat Teologi UASN dalam tampilan buku digital.</p>',
      '</div>',
      '<nav class="fft-viewer-shellbar__actions" aria-label="Aksi preview brosur">',
        '<a class="fft-viewer-shellbar__button fft-viewer-shellbar__button--ghost" href="../e-brochure.html">Kembali</a>',
        '<a class="fft-viewer-shellbar__button" href="' + pdfHref + '">Download PDF</a>',
      '</nav>'
    ].join("");
  }

  function tagIndicators() {
    Array.from(document.querySelectorAll("span, div, p")).forEach(function (element) {
      if (/halaman\s+\d+/i.test(textOf(element))) {
        element.setAttribute("data-page-indicator", "true");
      }
    });
  }

  function boot() {
    document.body.classList.add("fft-standalone-viewer");
    rebuildHeader();
    tagIndicators();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", boot);
}());
