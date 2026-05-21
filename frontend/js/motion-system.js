/* FFT_MOTION_SYSTEM_STAGE1_SAFE_TUNING_20260521
   Motion system stage 1 safe tuning.
   Fix:
   - Selector dipersempit agar tidak mengubah bentuk layout.
   - Halaman sensitif tetap pakai scroll reveal saja.
   - Mouse interaction tidak dipasang pada container layout besar.
*/
(function () {
  "use strict";

  var path = window.location.pathname || "";

  if (/indexfft\.html$/i.test(path)) {
    return;
  }

  var sensitivePage = /simulasi-pendaftaran-offline\.html$/i.test(path) ||
    /pimpinan-dosen\.html$/i.test(path);

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var excludeClosestSelectors = [
    "header",
    "nav",
    "footer",
    ".language-switcher",
    ".fft-page-transition-layer",
    ".fft-page-transition-brand",
    ".fft-ad-slot",
    ".fft-ad-card",
    ".fft-ad-close",
    ".fft-ad-action",
    "#loading-screen",
    "#preloader"
  ];

  var revealSelectors = [
    "main h1",
    "main h2",
    "main h3",
    "main p",
    "main article",
    "main .card",
    "main [class*='card']",
    "section h1",
    "section h2",
    "section h3",
    "section p",
    "section article",
    "section .card",
    "section [class*='card']",
    "main button",
    "main a[class*='btn']",
    "main a[class*='button']",
    "section button",
    "section a[class*='btn']",
    "section a[class*='button']"
  ];

  var cardSelectors = [
    "main article.card",
    "main .card",
    "main [class$='-card']",
    "section article.card",
    "section .card",
    "section [class$='-card']",
    ".registration-card",
    ".curriculum-card",
    ".staff-card",
    ".contact-card",
    ".ranking-card",
    ".testimonial-card"
  ];

  var buttonSelectors = [
    "main button",
    "main a[class*='btn']",
    "main a[class*='button']",
    "main .button",
    "main .btn",
    "section button",
    "section a[class*='btn']",
    "section a[class*='button']",
    "section .button",
    "section .btn"
  ];

  function isExcluded(el) {
    if (!el || !el.closest) return true;

    return excludeClosestSelectors.some(function (selector) {
      return Boolean(el.closest(selector));
    });
  }

  function uniqueElements(selectors) {
    var store = [];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (store.indexOf(el) === -1) {
          store.push(el);
        }
      });
    });

    return store;
  }

  function isRenderable(el) {
    var rect = el.getBoundingClientRect();
    return rect.width > 8 && rect.height > 8;
  }

  function setupReveal() {
    var elements = uniqueElements(revealSelectors);
    var index = 0;

    elements.forEach(function (el) {
      if (isExcluded(el)) return;
      if (!isRenderable(el)) return;
      if (el.hasAttribute("data-fft-motion")) return;

      el.setAttribute("data-fft-motion", "up");
      el.style.setProperty("--fft-motion-delay", Math.min((index % 5) * 45, 225) + "ms");
      index += 1;
    });

    var revealItems = document.querySelectorAll("[data-fft-motion]");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  function setupSpotlightCards() {
    uniqueElements(cardSelectors).forEach(function (el) {
      if (isExcluded(el)) return;
      if (!isRenderable(el)) return;
      if (el.hasAttribute("data-fft-spotlight")) return;

      var className = String(el.className || "");
      if (/grid|list|row|wrapper|container|layout/i.test(className)) return;

      el.setAttribute("data-fft-spotlight", "");

      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;

        el.style.setProperty("--fft-spotlight-x", x.toFixed(2) + "%");
        el.style.setProperty("--fft-spotlight-y", y.toFixed(2) + "%");
      });
    });
  }

  function setupImageHover() {
    document.querySelectorAll("main img, section img").forEach(function (img) {
      if (isExcluded(img)) return;

      var parent = img.parentElement;
      if (!parent || parent.hasAttribute("data-fft-image-frame")) return;

      var rect = img.getBoundingClientRect();
      if (rect.width < 160 || rect.height < 110) return;

      var parentClass = String(parent.className || "");
      if (/grid|list|row|wrapper|container|layout/i.test(parentClass)) return;

      parent.setAttribute("data-fft-image-frame", "");
      img.setAttribute("data-fft-image-hover", "");
    });
  }

  function setupMagneticButtons() {
    if (reduceMotion) return;

    uniqueElements(buttonSelectors).forEach(function (el) {
      if (isExcluded(el)) return;
      if (!isRenderable(el)) return;
      if (el.hasAttribute("data-fft-magnetic")) return;

      el.setAttribute("data-fft-magnetic", "");

      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var relX = event.clientX - rect.left - rect.width / 2;
        var relY = event.clientY - rect.top - rect.height / 2;

        var moveX = Math.max(-5, Math.min(5, relX * 0.08));
        var moveY = Math.max(-4, Math.min(4, relY * 0.08));

        el.style.setProperty("--fft-magnetic-x", moveX.toFixed(2) + "px");
        el.style.setProperty("--fft-magnetic-y", moveY.toFixed(2) + "px");
      });

      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--fft-magnetic-x", "0px");
        el.style.setProperty("--fft-magnetic-y", "0px");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupReveal();

    if (sensitivePage) {
      return;
    }

    setupSpotlightCards();
    setupImageHover();
    setupMagneticButtons();
  });
}());
