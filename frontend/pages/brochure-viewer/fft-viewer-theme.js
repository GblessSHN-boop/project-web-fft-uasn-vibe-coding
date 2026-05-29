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
/* FFT_BROCHURE_VIEWER_CLEAN_CONTROL_BAR_FINAL_20260529
   Buat control bar baru dan sembunyikan control lama.
*/
(function () {
  "use strict";

  function textOf(element) {
    return (element && element.textContent ? element.textContent : "").trim();
  }

  function findButtonByText(pattern) {
    return Array.from(document.querySelectorAll("button")).find(function (button) {
      return pattern.test(textOf(button));
    });
  }

  function findIndicator() {
    return Array.from(document.querySelectorAll("span, div, p")).find(function (element) {
      var text = textOf(element);

      return /^halaman\s+\d+\s+dari\s+\d+$/i.test(text) &&
        !element.querySelector("button");
    });
  }

  function findControlRoot(indicator, previousButton, nextButton) {
    var root = indicator ? indicator.parentElement : null;
    var depth = 0;

    while (root && depth < 8) {
      var hasPrevious = root.contains(previousButton);
      var hasNext = root.contains(nextButton);
      var hasIndicator = root.contains(indicator);
      var hasMedia = root.querySelector("img, canvas, svg");

      if (hasPrevious && hasNext && hasIndicator && !hasMedia) {
        return root;
      }

      root = root.parentElement;
      depth += 1;
    }

    return null;
  }

  function createCleanBar(previousButton, nextButton, indicator, oldRoot) {
    var existing = document.querySelector(".fft-viewer-clean-control-bar");

    if (existing) {
      return existing;
    }

    var bar = document.createElement("div");
    bar.className = "fft-viewer-clean-control-bar";
    bar.setAttribute("aria-label", "Navigasi halaman brosur");

    var previousClean = document.createElement("button");
    previousClean.type = "button";
    previousClean.className = "fft-viewer-clean-button";
    previousClean.textContent = "Sebelumnya";

    var status = document.createElement("span");
    status.className = "fft-viewer-clean-status";
    status.textContent = textOf(indicator) || "Halaman 1 dari 4";

    var nextClean = document.createElement("button");
    nextClean.type = "button";
    nextClean.className = "fft-viewer-clean-button";
    nextClean.textContent = "Berikutnya";

    previousClean.addEventListener("click", function () {
      if (previousButton && !previousButton.disabled) {
        previousButton.click();
      }
    });

    nextClean.addEventListener("click", function () {
      if (nextButton && !nextButton.disabled) {
        nextButton.click();
      }
    });

    bar.appendChild(previousClean);
    bar.appendChild(status);
    bar.appendChild(nextClean);

    oldRoot.insertAdjacentElement("afterend", bar);

    return bar;
  }

  function syncCleanBar(bar, previousButton, nextButton, indicator) {
    var previousClean = bar.querySelector(".fft-viewer-clean-button:first-child");
    var nextClean = bar.querySelector(".fft-viewer-clean-button:last-child");
    var status = bar.querySelector(".fft-viewer-clean-status");

    if (status && indicator) {
      status.textContent = textOf(indicator);
    }

    if (previousClean && previousButton) {
      previousClean.disabled = previousButton.disabled;
    }

    if (nextClean && nextButton) {
      nextClean.disabled = nextButton.disabled;
    }
  }

  function bootCleanControls() {
    var previousButton = findButtonByText(/^sebelumnya$/i);
    var nextButton = findButtonByText(/^berikutnya$/i);
    var indicator = findIndicator();

    if (!previousButton || !nextButton || !indicator) {
      return;
    }

    var oldRoot = findControlRoot(indicator, previousButton, nextButton);

    if (!oldRoot) {
      return;
    }

    var bar = createCleanBar(previousButton, nextButton, indicator, oldRoot);

    oldRoot.classList.add("fft-viewer-original-controls-hidden");
    oldRoot.setAttribute("aria-hidden", "true");

    syncCleanBar(bar, previousButton, nextButton, indicator);

    if (!bar.dataset.fftObserverReady) {
      bar.dataset.fftObserverReady = "1";

      var observer = new MutationObserver(function () {
        syncCleanBar(bar, previousButton, nextButton, indicator);
      });

      observer.observe(oldRoot, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["disabled", "class", "aria-disabled"]
      });

      window.setInterval(function () {
        syncCleanBar(bar, previousButton, nextButton, indicator);
      }, 500);
    }
  }

  function boot() {
    bootCleanControls();
    window.setTimeout(bootCleanControls, 150);
    window.setTimeout(bootCleanControls, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", boot);
}());
