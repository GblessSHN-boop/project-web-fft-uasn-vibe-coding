/* FFT_STABLE_CRIMSON_PUSH_WIPE_NO_FLICKER_20260519
   Transisi stabil antar inner pages.
   Overlay tidak lagi dihapus oleh pageshow saat animasi reveal berjalan, sehingga tidak kedip.
*/
(function () {
  "use strict";

  var path = window.location.pathname || "";
  if (/indexfft\.html$/i.test(path)) return;

  document.documentElement.classList.add("fft-page-transition-enabled");

  var storageKey = "fftInnerPageTransitionPending";
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function removeLayers() {
    document.querySelectorAll(".fft-page-transition-layer").forEach(function (layer) {
      layer.remove();
    });
  }

  function createLayer() {
    removeLayers();

    var layer = document.createElement("div");
    layer.className = "fft-page-transition-layer";
    layer.setAttribute("aria-hidden", "true");

    var brand = document.createElement("div");
    brand.className = "fft-page-transition-brand";

    var img = document.createElement("img");
    img.src = "../assets/images/site/fftkb.png";
    img.alt = "";

    brand.appendChild(img);
    layer.appendChild(brand);
    document.body.appendChild(layer);

    return layer;
  }

  function revealPageIfNeeded() {
    if (reduceMotion || !document.body) return;

    var pending = sessionStorage.getItem(storageKey);

    if (pending !== "1") {
      removeLayers();
      return;
    }

    sessionStorage.removeItem(storageKey);

    var layer = createLayer();

    requestAnimationFrame(function () {
      layer.classList.add("is-revealing");
    });

    layer.addEventListener("animationend", function () {
      if (layer && layer.parentNode) layer.remove();
    }, { once: true });

    window.setTimeout(function () {
      if (layer && layer.parentNode) layer.remove();
    }, 900);
  }

  function isSafeInnerPageLink(link) {
    if (!link || !link.href) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;

    var href = link.getAttribute("href") || "";

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return false;
    }

    var url;

    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;
    if (!/\.html$/i.test(url.pathname)) return false;
    if (/indexfft\.html$/i.test(url.pathname)) return false;

    return true;
  }

  function goWithTransition(url) {
    if (reduceMotion) {
      window.location.href = url;
      return;
    }

    var layer = createLayer();

    requestAnimationFrame(function () {
      layer.classList.add("is-covering");
    });

    window.setTimeout(function () {
      sessionStorage.setItem(storageKey, "1");
      window.location.href = url;
    }, 520);
  }

  document.addEventListener("DOMContentLoaded", revealPageIfNeeded);

  window.addEventListener("pagehide", function () {
    removeLayers();
  });

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.target.closest ? event.target.closest("a") : null;
    if (!isSafeInnerPageLink(link)) return;

    event.preventDefault();
    goWithTransition(link.href);
  });
}());
