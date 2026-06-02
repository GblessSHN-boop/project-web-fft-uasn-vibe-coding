/* FFT_DFLIP_VIEWER_TOOLBAR_HARD_RESET_20260529
   Shell viewer dan toolbar bawah model DFlip.
*/
(function () {
  "use strict";

  var fallbackTotal = 8;
  var zoom = 1;
  var downloadPdf = "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf";
  var toastTimer = null;

  function textOf(element) {
    return (element && element.textContent ? element.textContent : "").trim();
  }

  function parsePageText(text) {
    var match = String(text || "").match(/(?:halaman\s*)?(\d+)\s*(?:dari|\/)\s*(\d+)/i);

    if (!match) {
      return null;
    }

    return {
      current: Number(match[1]),
      total: Math.max(Number(match[2]), fallbackTotal)
    };
  }

  function findButtonByText(pattern) {
    return Array.from(document.querySelectorAll("button")).find(function (button) {
      return !button.closest(".fft-dflip-toolbar-wrap") && pattern.test(textOf(button));
    });
  }

  function findStatusElement() {
    var pageInfo = document.querySelector("#pageInfo");

    if (pageInfo && parsePageText(textOf(pageInfo))) {
      return pageInfo;
    }

    return Array.from(document.querySelectorAll("span, div, p, label")).find(function (element) {
      return !element.closest(".fft-dflip-toolbar-wrap") && parsePageText(textOf(element));
    });
  }

  function getPageState() {
    var status = findStatusElement();
    var parsed = status ? parsePageText(textOf(status)) : null;

    if (parsed) {
      return parsed;
    }

    return {
      current: 1,
      total: fallbackTotal
    };
  }

  function findNativeRoot(previousButton, nextButton, status) {
    var root = status ? status.parentElement : null;
    var depth = 0;

    while (root && depth < 8) {
      if (
        root.contains(previousButton) &&
        root.contains(nextButton) &&
        root.contains(status) &&
        !root.querySelector("canvas")
      ) {
        return root;
      }

      root = root.parentElement;
      depth += 1;
    }

    return null;
  }

  function clickNav(direction) {
    var button = direction === "next"
      ? findButtonByText(/^berikutnya$/i)
      : findButtonByText(/^sebelumnya$/i);

    if (button && !button.disabled) {
      button.click();
    }

    window.setTimeout(syncToolbar, 120);
  }

  function goToPage(target) {
    var safeTarget = Math.max(1, Math.min(Number(target) || 1, getPageState().total));
    var guard = 0;

    function step() {
      var state = getPageState();

      if (state.current === safeTarget || guard > 50) {
        syncToolbar();
        return;
      }

      if (state.current < safeTarget) {
        clickNav("next");
      } else {
        clickNav("previous");
      }

      guard += 1;
      window.setTimeout(step, 120);
    }

    step();
  }

  function icon(name) {
    var icons = {
      grid: '<path d="M4 4h6v6H4z"></path><path d="M14 4h6v6h-6z"></path><path d="M4 14h6v6H4z"></path><path d="M14 14h6v6h-6z"></path>',
      plus: '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>',
      minus: '<circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path>',
      fullscreen: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path><path d="M3 3l6 6"></path><path d="M21 3l-6 6"></path><path d="M21 21l-6-6"></path><path d="M3 21l6-6"></path>',
      share: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.7 10.7l6.6-4.4"></path><path d="M8.7 13.3l6.6 4.4"></path>',
      more: '<circle class="fill" cx="5" cy="12" r="2"></circle><circle class="fill" cx="12" cy="12" r="2"></circle><circle class="fill" cx="19" cy="12" r="2"></circle>',
      download: '<path d="M12 3v11"></path><path d="M8 10l4 4 4-4"></path><path d="M5 20h14"></path>',
      first: '<path d="M7 5v14"></path><path d="M19 5l-8 7 8 7z"></path>',
      last: '<path d="M17 5v14"></path><path d="M5 5l8 7-8 7z"></path>',
      sound: '<path d="M4 10v4h4l5 4V6L8 10z"></path><path d="M17 9c1 2 1 4 0 6"></path>'
    };

    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[name] || icons.more) + '</svg>';
  }

  function makeButton(className, label, iconName) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "fft-dflip-btn " + className;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = icon(iconName);
    return button;
  }

  function showToast(message) {
    var toast = document.querySelector(".fft-dflip-toast");

    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("is-open");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-open");
    }, 1600);
  }

  function closeMenus() {
    document.querySelectorAll(".fft-dflip-page-menu, .fft-dflip-more-menu").forEach(function (menu) {
      menu.classList.remove("is-open");
    });

    document.querySelectorAll(".fft-dflip-btn.is-active").forEach(function (button) {
      button.classList.remove("is-active");
    });
  }

  function toggleMenu(menu, button) {
    var open = !menu.classList.contains("is-open");
    closeMenus();

    if (open) {
      menu.classList.add("is-open");
      button.classList.add("is-active");
    }
  }

  function rebuildPageMenu(menu) {
    var state = getPageState();

    menu.innerHTML = "";

    for (var page = 1; page <= state.total; page += 1) {
      var choice = document.createElement("button");
      choice.type = "button";
      choice.className = "fft-dflip-page-choice" + (page === state.current ? " is-current" : "");
      choice.textContent = String(page);
      choice.dataset.page = String(page);

      choice.addEventListener("click", function () {
        closeMenus();
        goToPage(Number(this.dataset.page));
      });

      menu.appendChild(choice);
    }
  }

  function makeMenuItem(label, callback, iconName) {
    var item = document.createElement("button");
    item.type = "button";
    item.className = "fft-dflip-menu-item";
    item.innerHTML = icon(iconName || "more") + "<span>" + label + "</span>";

    item.addEventListener("click", function () {
      closeMenus();
      callback();
    });

    return item;
  }

  function getBookRoot() {
    var direct = document.querySelector("#book, .book, .flipbook, .book-wrapper, .pdf-book");

    if (direct) {
      return direct;
    }

    var canvas = document.querySelector("canvas");

    if (!canvas) {
      return null;
    }

    var root = canvas.parentElement;
    var depth = 0;

    while (root && depth < 6) {
      if (root.querySelectorAll("canvas").length >= 2) {
        return root;
      }

      root = root.parentElement;
      depth += 1;
    }

    return canvas.parentElement;
  }

  function applyZoom(value) {
    zoom = Math.max(0.75, Math.min(1.6, value));

    var book = getBookRoot();

    if (book) {
      book.style.transform = "scale(" + zoom.toFixed(2) + ")";
      book.style.transformOrigin = "top center";
      book.style.transition = "transform 180ms ease";
    }

    syncToolbar();
  }

  function rebuildHeader() {
    var header = document.querySelector("header");

    if (!header) {
      header = document.createElement("header");
      document.body.insertBefore(header, document.body.firstChild);
    }

    header.className = "fft-viewer-shellbar";
    header.innerHTML = [
      '<div class="fft-viewer-shellbar__text">',
        '<p class="fft-viewer-shellbar__eyebrow">E-BROCHURE</p>',
        '<h1 class="fft-viewer-shellbar__title">Preview Brosur Digital</h1>',
        '<p class="fft-viewer-shellbar__subtitle">Baca brosur Fakultas Filsafat Teologi UASN dalam tampilan buku digital.</p>',
      '</div>',
      '<nav class="fft-viewer-shellbar__actions" aria-label="Aksi preview brosur">',
        '<a class="fft-viewer-shellbar__button fft-viewer-shellbar__button--ghost" href="../e-brochure.html">Kembali</a>',
        '<a class="fft-viewer-shellbar__button" href="' + downloadPdf + '" target="_blank" rel="noopener">Download PDF</a>',
      '</nav>'
    ].join("");
  }

  function hideNativeControls() {
    var previousButton = findButtonByText(/^sebelumnya$/i);
    var nextButton = findButtonByText(/^berikutnya$/i);
    var status = findStatusElement();

    if (!previousButton || !nextButton || !status) {
      return null;
    }

    var root = findNativeRoot(previousButton, nextButton, status);

    if (root) {
      root.classList.add("fft-hidden-native-controls");
      root.setAttribute("aria-hidden", "true");
    }

    return root;
  }





  /* FFT_VIEWER_SPREAD_TOOLBAR_REBUILD_20260602 */
function getViewerApi() {
  return window.FFTBrochureViewer || null;
}

function getSpreadToolbarState() {
  var api = getViewerApi();

  if (api && typeof api.getState === "function") {
    var apiState = api.getState();

    if (apiState && Number(apiState.total) > 1) {
      return apiState;
    }
  }

  var parsed = null;

  if (typeof getPageState === "function") {
    parsed = getPageState();
  }

  var current = parsed && Number(parsed.current) ? Number(parsed.current) : 1;
  var total = parsed && Number(parsed.total) ? Number(parsed.total) : 1;
  var start = normalizeSpreadStart(current, total);

  return {
    current: current,
    total: total,
    spreadStart: start,
    spreadEnd: Math.min(total, start + 1),
    isFirst: start <= 1,
    isLast: start >= normalizeSpreadStart(total, total)
  };
}

function normalizeSpreadStart(page, total) {
  var max = Math.max(1, Number(total) || 1);
  var target = Math.max(1, Math.min(max, Number(page) || 1));

  if (target <= 1) {
    return 1;
  }

  if (target >= max) {
    return max % 2 === 0 ? max - 1 : max;
  }

  return target % 2 === 0 ? target - 1 : target;
}

function getSpreadLabel(start, total) {
  var end = Math.min(total, start + 1);

  if (start === end) {
    return "Halaman " + start + " dari " + total;
  }

  return "Halaman " + start + " sampai " + end + " dari " + total;
}

function showSpreadToolbarToast(message) {
  var toast = document.querySelector(".fft-dflip-toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-open");

  window.clearTimeout(toast.dataset.timer || 0);

  toast.dataset.timer = window.setTimeout(function () {
    toast.classList.remove("is-open");
  }, 1700);
}

function closeSpreadToolbarMenus() {
  Array.prototype.slice.call(document.querySelectorAll(".fft-dflip-page-menu, .fft-dflip-more-menu")).forEach(function (menu) {
    menu.classList.remove("is-open");
  });
}

function makeSpreadButton(className, label, text) {
  var button = document.createElement("button");

  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  button.innerHTML = text;

  return button;
}

function moveSpread(targetStart) {
  var api = getViewerApi();

  if (!api || typeof api.getState !== "function") {
    showSpreadToolbarToast("Viewer belum siap");
    return;
  }

  var safety = 0;

  function step() {
    var state = api.getState();
    var currentStart = normalizeSpreadStart(state.spreadStart || state.current, state.total);

    if (currentStart === targetStart) {
      syncToolbar();
      return;
    }

    if (safety > state.total + 4) {
      syncToolbar();
      return;
    }

    safety += 1;

    if (currentStart < targetStart && typeof api.next === "function") {
      api.next();
      window.setTimeout(step, 540);
      return;
    }

    if (currentStart > targetStart && typeof api.previous === "function") {
      api.previous();
      window.setTimeout(step, 540);
      return;
    }

    syncToolbar();
  }

  step();
}

function rebuildSpreadMenu(pageMenu) {
  var state = getSpreadToolbarState();
  var total = Math.max(1, Number(state.total) || 1);
  var currentStart = normalizeSpreadStart(state.spreadStart || state.current, total);

  pageMenu.innerHTML = "";

  for (var start = 1; start <= total; start += 2) {
    (function (spreadStart) {
      var button = document.createElement("button");
      var spreadEnd = Math.min(total, spreadStart + 1);

      button.type = "button";
      button.className = "fft-dflip-page-choice fft-dflip-spread-choice";
      button.textContent = spreadStart === spreadEnd
        ? "Halaman " + spreadStart
        : "Halaman " + spreadStart + " sampai " + spreadEnd;
      button.dataset.spreadStart = String(spreadStart);

      if (spreadStart === currentStart) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeSpreadToolbarMenus();
        moveSpread(spreadStart);
      });

      pageMenu.appendChild(button);
    })(start);
  }
}

function applySpreadZoom(value) {
  var book = document.querySelector(".stf__parent") || document.querySelector("#book") || document.querySelector(".book");

  window.__fftSpreadToolbarZoom = Math.max(0.75, Math.min(1.6, Number(value) || 1));

  if (book) {
    book.style.transform = "scale(" + window.__fftSpreadToolbarZoom + ")";
    book.style.transformOrigin = "center top";
    book.style.transition = "transform 220ms ease";
  }

  syncToolbar();
}

function downloadViewerPdf() {
  var downloadLink =
    document.querySelector(".fft-viewer-shellbar__button[href]:not(.fft-viewer-shellbar__button--ghost)") ||
    document.querySelector("a[download]") ||
    document.querySelector("a[href$='.pdf']");

  if (downloadLink) {
    downloadLink.click();
    return;
  }

  showSpreadToolbarToast("File PDF belum tersedia");
}

function shareViewerPage() {
  var shareData = {
    title: document.title || "Preview Brosur Digital",
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(function () {});
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(window.location.href).then(function () {
      showSpreadToolbarToast("Link preview disalin");
    });
    return;
  }

  showSpreadToolbarToast("Salin link dari address bar");
}

function toggleViewerFullscreen() {
  var target = document.documentElement;

  if (!document.fullscreenElement && target.requestFullscreen) {
    target.requestFullscreen();
    return;
  }

  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

/* FFT_VIEWER_SPREAD_TOOLBAR_STEP_FIX_20260602 */
function clickNativeViewerStep(direction) {
  var pattern = direction === "next" ? /^berikutnya$/i : /^sebelumnya$/i;
  var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

  for (var index = 0; index < buttons.length; index += 1) {
    var button = buttons[index];
    var label = (button.textContent || "").trim();

    if (!pattern.test(label)) {
      continue;
    }

    if (button.closest(".fft-dflip-toolbar-wrap")) {
      continue;
    }

    if (button.disabled || button.getAttribute("aria-disabled") === "true") {
      continue;
    }

    button.click();
    return true;
  }

  return false;
}

function stepSpreadToolbar(direction) {
  var api = getViewerApi();
  var moved = false;

  closeSpreadToolbarMenus();

  if (api && typeof api.isReady === "function" && api.isReady()) {
    if (direction === "previous" && typeof api.previous === "function") {
      moved = api.previous();
    }

    if (direction === "next" && typeof api.next === "function") {
      moved = api.next();
    }
  }

  if (!moved) {
    moved = clickNativeViewerStep(direction === "next" ? "next" : "previous");
  }

  if (!moved) {
    showSpreadToolbarToast("Viewer belum siap");
    return;
  }

  window.setTimeout(syncToolbar, 120);
  window.setTimeout(syncToolbar, 560);
  window.setTimeout(syncToolbar, 980);
}
/* /FFT_VIEWER_SPREAD_TOOLBAR_STEP_FIX_20260602 */

function createToolbar() {
  var oldToolbar = document.querySelector(".fft-dflip-toolbar-wrap");

  if (oldToolbar) {
    oldToolbar.remove();
  }

  var wrap = document.createElement("div");
  var toolbar = document.createElement("div");
  var prevButton = makeSpreadButton("fft-dflip-btn fft-dflip-prev", "Halaman sebelumnya", "Sebelumnya");
  var pageButton = makeSpreadButton("fft-dflip-btn fft-dflip-page-btn fft-dflip-spread-btn", "Pilih halaman", "Halaman");
  var nextButton = makeSpreadButton("fft-dflip-btn fft-dflip-next", "Halaman berikutnya", "Berikutnya");
  var zoomInButton = makeSpreadButton("fft-dflip-btn fft-dflip-zoomin", "Perbesar", "Perbesar");
  var zoomOutButton = makeSpreadButton("fft-dflip-btn fft-dflip-zoomout", "Perkecil", "Perkecil");
  var fullscreenButton = makeSpreadButton("fft-dflip-btn fft-dflip-fullscreen", "Layar penuh", "Layar Penuh");
  var shareButton = makeSpreadButton("fft-dflip-btn fft-dflip-share", "Bagikan", "Bagikan");
  var moreButton = makeSpreadButton("fft-dflip-btn fft-dflip-more", "Menu lainnya", "Menu");
  var pageMenu = document.createElement("div");
  var moreMenu = document.createElement("div");
  var toast = document.createElement("div");

  /* FFT_VIEWER_SPREAD_TOOLBAR_TEXT_FIX_20260602 */
  prevButton.dataset.role = "previous";
  nextButton.dataset.role = "next";
  zoomInButton.dataset.role = "zoom-in";
  zoomOutButton.dataset.role = "zoom-out";
  fullscreenButton.dataset.role = "fullscreen";
  shareButton.dataset.role = "share";
  moreButton.dataset.role = "menu";
  /* /FFT_VIEWER_SPREAD_TOOLBAR_TEXT_FIX_20260602 */

  wrap.className = "fft-dflip-toolbar-wrap";
  toolbar.className = "fft-dflip-toolbar fft-dflip-spread-toolbar";

  pageMenu.className = "fft-dflip-page-menu fft-dflip-spread-menu";
  pageMenu.setAttribute("role", "menu");
  pageMenu.setAttribute("aria-label", "Pilih spread halaman");

  moreMenu.className = "fft-dflip-more-menu";
  moreMenu.setAttribute("role", "menu");
  moreMenu.innerHTML = [
    '<button type="button" class="fft-dflip-menu-item" data-action="download">Download PDF</button>',
    '<button type="button" class="fft-dflip-menu-item" data-action="first">Ke halaman awal</button>',
    '<button type="button" class="fft-dflip-menu-item" data-action="last">Ke halaman akhir</button>'
  ].join("");

  toast.className = "fft-dflip-toast";
  toast.textContent = "Siap";

  pageButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    rebuildSpreadMenu(pageMenu);
    moreMenu.classList.remove("is-open");
    pageMenu.classList.toggle("is-open");
  });

  moreButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    pageMenu.classList.remove("is-open");
    moreMenu.classList.toggle("is-open");
  });

  prevButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    stepSpreadToolbar("previous");
  });

  nextButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    stepSpreadToolbar("next");
  });

  zoomInButton.addEventListener("click", function () {
    applySpreadZoom((window.__fftSpreadToolbarZoom || 1) + 0.1);
  });

  zoomOutButton.addEventListener("click", function () {
    applySpreadZoom((window.__fftSpreadToolbarZoom || 1) - 0.1);
  });

  fullscreenButton.addEventListener("click", toggleViewerFullscreen);
  shareButton.addEventListener("click", shareViewerPage);

  moreMenu.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    closeSpreadToolbarMenus();

    if (button.dataset.action === "download") {
      downloadViewerPdf();
    }

    if (button.dataset.action === "first") {
      var apiFirst = getViewerApi();

      if (apiFirst && typeof apiFirst.first === "function") {
        apiFirst.first();
      }
    }

    if (button.dataset.action === "last") {
      var apiLast = getViewerApi();

      if (apiLast && typeof apiLast.last === "function") {
        apiLast.last();
      }
    }
  });

  toolbar.appendChild(prevButton);
  toolbar.appendChild(pageButton);
  toolbar.appendChild(nextButton);
  toolbar.appendChild(zoomInButton);
  toolbar.appendChild(zoomOutButton);
  toolbar.appendChild(fullscreenButton);
  toolbar.appendChild(shareButton);
  toolbar.appendChild(moreButton);
  toolbar.appendChild(pageMenu);
  toolbar.appendChild(moreMenu);

  wrap.appendChild(toolbar);
  wrap.appendChild(toast);

  document.body.appendChild(wrap);

  if (!document.documentElement.dataset.fftSpreadToolbarBound) {
    document.documentElement.dataset.fftSpreadToolbarBound = "1";

    document.addEventListener("click", closeSpreadToolbarMenus);

    document.addEventListener("keydown", function (event) {
      var api = getViewerApi();

      if (event.key === "Escape") {
        closeSpreadToolbarMenus();
      }

      if (!api) {
        return;
      }

      if (event.key === "ArrowLeft") {
        stepSpreadToolbar("previous");
      }

      if (event.key === "ArrowRight") {
        stepSpreadToolbar("next");
      }
    });

    window.addEventListener("fftViewerReady", syncToolbar);
    window.addEventListener("fftViewerChange", syncToolbar);
  }

  syncToolbar();

  return wrap;
}

function syncToolbar() {
  var wrap = document.querySelector(".fft-dflip-toolbar-wrap");

  if (!wrap) {
    return;
  }

  var state = getSpreadToolbarState();
  var total = Math.max(1, Number(state.total) || 1);
  var spreadStart = normalizeSpreadStart(state.spreadStart || state.current, total);
  var label = wrap.querySelector(".fft-dflip-page-label");
  var pageButton = wrap.querySelector(".fft-dflip-page-btn");
  var prevButton = wrap.querySelector(".fft-dflip-prev");
  var nextButton = wrap.querySelector(".fft-dflip-next");
  var zoomIn = wrap.querySelector(".fft-dflip-zoomin");
  var zoomOut = wrap.querySelector(".fft-dflip-zoomout");
  var pageMenu = wrap.querySelector(".fft-dflip-page-menu");
  var zoomValue = window.__fftSpreadToolbarZoom || 1;

  if (label) {
    label.textContent = getSpreadLabel(spreadStart, total);
  }

  if (pageButton) {
    pageButton.textContent = getSpreadLabel(spreadStart, total);
  }

  if (prevButton) {
    prevButton.classList.toggle("is-disabled", spreadStart <= 1);
  }

  if (nextButton) {
    nextButton.classList.toggle("is-disabled", spreadStart >= normalizeSpreadStart(total, total));
  }

  if (zoomIn) {
    zoomIn.classList.toggle("is-disabled", zoomValue >= 1.59);
  }

  if (zoomOut) {
    zoomOut.classList.toggle("is-disabled", zoomValue <= 0.76);
  }

  if (pageMenu && pageMenu.classList.contains("is-open")) {
    rebuildSpreadMenu(pageMenu);
    pageMenu.classList.add("is-open");
  }
}
/* /FFT_VIEWER_SPREAD_TOOLBAR_REBUILD_20260602 */

function boot() {
    document.body.classList.add("fft-standalone-viewer");

    rebuildHeader();
    hideNativeControls();
    createToolbar();
    syncToolbar();

    /* FFT_VIEWER_SPREAD_TOOLBAR_SAFE_FIX_20260602 */
    window.setTimeout(syncToolbar, 120);
    window.setTimeout(syncToolbar, 450);
    window.setTimeout(syncToolbar, 900);
    window.setTimeout(syncToolbar, 1500);
    /* /FFT_VIEWER_SPREAD_TOOLBAR_SAFE_FIX_20260602 */


    var status = findStatusElement();

    if (status && !status.dataset.fftDflipObserverReady) {
      status.dataset.fftDflipObserverReady = "1";

      var observer = new MutationObserver(function () {
        hideNativeControls();
        syncToolbar();
      });

      observer.observe(status, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    window.setTimeout(function () {
      hideNativeControls();
      syncToolbar();
    }, 150);

    window.setTimeout(function () {
      hideNativeControls();
      syncToolbar();
    }, 600);

    window.setTimeout(function () {
      hideNativeControls();
      syncToolbar();
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", boot);
  window.setInterval(syncToolbar, 800);
}());

/* FFT_VIEWER_ZOOM_PAN_RESET_20260602 */
(function () {
  var MIN_ZOOM = 1;
  var MAX_ZOOM = 2.6;
  var ZOOM_STEP = 0.18;

  var zoomState = {
    zoom: 1,
    x: 0,
    y: 0,
    isPanning: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    baseTransform: ""
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function getText(element) {
    return (element && element.textContent ? element.textContent : "").trim().toLowerCase();
  }

  function findToolbar() {
    return document.querySelector(".fft-dflip-toolbar");
  }

  function findToolbarWrap() {
    return document.querySelector(".fft-dflip-toolbar-wrap") || findToolbar();
  }

  function findButton(className, words) {
    var direct = document.querySelector(className);
    if (direct) {
      return direct;
    }

    var buttons = Array.prototype.slice.call(document.querySelectorAll("button, .fft-dflip-btn"));
    return buttons.find(function (button) {
      var text = getText(button);
      return words.some(function (word) {
        return text.indexOf(word) !== -1;
      });
    }) || null;
  }

  function findBookTarget() {
    return (
      document.querySelector(".stf__parent") ||
      document.querySelector(".stf__wrapper") ||
      document.querySelector(".viewer-book") ||
      document.querySelector(".brochure-viewer-book") ||
      document.querySelector(".book-container") ||
      document.querySelector("#book") ||
      document.querySelector(".book")
    );
  }

  function ensureResetButton() {
    var toolbarWrap = findToolbarWrap();

    if (!toolbarWrap) {
      return null;
    }

    var button = toolbarWrap.querySelector(".fft-dflip-zoom-reset");

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "fft-dflip-zoom-reset";
      button.textContent = "Reset Zoom";
      button.setAttribute("aria-label", "Reset zoom preview brosur");
      toolbarWrap.appendChild(button);
    }

    if (!button.dataset.fftZoomResetBound) {
      button.dataset.fftZoomResetBound = "true";
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        resetZoom();
      }, true);
    }

    return button;
  }

  function getBookTarget() {
    var target = findBookTarget();

    if (!target) {
      return null;
    }

    if (!target.dataset.fftZoomBaseTransform) {
      var computedTransform = window.getComputedStyle(target).transform;
      target.dataset.fftZoomBaseTransform = computedTransform && computedTransform !== "none" ? computedTransform : "";
    }

    zoomState.baseTransform = target.dataset.fftZoomBaseTransform || "";

    return target;
  }

  function setResetVisible(isVisible) {
    var resetButton = ensureResetButton();

    if (!resetButton) {
      return;
    }

    resetButton.classList.toggle("is-visible", isVisible);
    resetButton.setAttribute("aria-hidden", isVisible ? "false" : "true");
  }

  function applyZoom() {
    var target = getBookTarget();

    if (!target) {
      return;
    }

    var isZoomed = zoomState.zoom > 1.001;
    var transformParts = [];

    if (zoomState.baseTransform) {
      transformParts.push(zoomState.baseTransform);
    }

    if (isZoomed) {
      transformParts.push("translate3d(" + zoomState.x + "px, " + zoomState.y + "px, 0)");
      transformParts.push("scale(" + zoomState.zoom.toFixed(3) + ")");
    }

    target.style.setProperty("transform", transformParts.join(" "), "important");
    target.style.setProperty("transform-origin", "center center", "important");
    target.style.setProperty("transition", zoomState.isPanning ? "none" : "transform 180ms ease", "important");
    target.style.setProperty("cursor", isZoomed ? (zoomState.isPanning ? "grabbing" : "grab") : "", "important");
    target.style.setProperty("touch-action", isZoomed ? "none" : "", "important");

    document.body.classList.toggle("fft-viewer-zoom-active", isZoomed);
    setResetVisible(isZoomed);
  }

  function setZoom(nextZoom) {
    var oldZoom = zoomState.zoom;
    zoomState.zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    if (zoomState.zoom <= 1.001) {
      zoomState.zoom = 1;
      zoomState.x = 0;
      zoomState.y = 0;
    } else if (oldZoom <= 1.001) {
      zoomState.x = 0;
      zoomState.y = 0;
    }

    applyZoom();
  }

  function resetZoom() {
    zoomState.zoom = 1;
    zoomState.x = 0;
    zoomState.y = 0;
    zoomState.isPanning = false;
    zoomState.pointerId = null;
    applyZoom();
  }

  function bindZoomButtons() {
    var zoomInButton = findButton(".fft-dflip-zoomin", ["perbesar", "zoom in", "+"]);
    var zoomOutButton = findButton(".fft-dflip-zoomout", ["perkecil", "zoom out", "-"]);

    if (zoomInButton && !zoomInButton.dataset.fftZoomPanBound) {
      zoomInButton.dataset.fftZoomPanBound = "true";
      zoomInButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setZoom(zoomState.zoom + ZOOM_STEP);
      }, true);
    }

    if (zoomOutButton && !zoomOutButton.dataset.fftZoomPanBound) {
      zoomOutButton.dataset.fftZoomPanBound = "true";
      zoomOutButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setZoom(zoomState.zoom - ZOOM_STEP);
      }, true);
    }

    ensureResetButton();
    applyZoom();

    return Boolean(zoomInButton && zoomOutButton);
  }

  function shouldIgnorePan(event) {
    return Boolean(
      event.target.closest("button") ||
      event.target.closest("a") ||
      event.target.closest(".fft-dflip-toolbar") ||
      event.target.closest(".fft-dflip-toolbar-wrap") ||
      event.target.closest(".fft-dflip-page-menu") ||
      event.target.closest(".fft-dflip-more-menu")
    );
  }

  function bindPan() {
    var target = getBookTarget();

    if (!target || target.dataset.fftZoomPanPointerBound) {
      return Boolean(target);
    }

    target.dataset.fftZoomPanPointerBound = "true";

    target.addEventListener("pointerdown", function (event) {
      if (zoomState.zoom <= 1.001 || shouldIgnorePan(event)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      zoomState.isPanning = true;
      zoomState.pointerId = event.pointerId;
      zoomState.startX = event.clientX;
      zoomState.startY = event.clientY;
      zoomState.baseX = zoomState.x;
      zoomState.baseY = zoomState.y;

      try {
        target.setPointerCapture(event.pointerId);
      } catch (error) {}

      applyZoom();
    }, true);

    target.addEventListener("pointermove", function (event) {
      if (!zoomState.isPanning || zoomState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      zoomState.x = zoomState.baseX + event.clientX - zoomState.startX;
      zoomState.y = zoomState.baseY + event.clientY - zoomState.startY;

      applyZoom();
    }, true);

    function stopPan(event) {
      if (!zoomState.isPanning || zoomState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      zoomState.isPanning = false;
      zoomState.pointerId = null;

      try {
        target.releasePointerCapture(event.pointerId);
      } catch (error) {}

      applyZoom();
    }

    target.addEventListener("pointerup", stopPan, true);
    target.addEventListener("pointercancel", stopPan, true);
    target.addEventListener("lostpointercapture", function () {
      if (zoomState.isPanning) {
        zoomState.isPanning = false;
        zoomState.pointerId = null;
        applyZoom();
      }
    }, true);

    return true;
  }

  function boot() {
    var tries = 0;

    function attempt() {
      tries += 1;

      var buttonsReady = bindZoomButtons();
      var panReady = bindPan();

      if ((!buttonsReady || !panReady) && tries < 40) {
        window.setTimeout(attempt, 250);
      }
    }

    attempt();

    var observer = new MutationObserver(function () {
      bindZoomButtons();
      bindPan();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  ready(boot);
})();
/* /FFT_VIEWER_ZOOM_PAN_RESET_20260602 */
