/* FFT_DFLIP_VIEWER_TOOLBAR_HARD_RESET_20260529
   Shell viewer dan toolbar bawah model DFlip.
*/
(function () {
  "use strict";

  var fallbackTotal = 8;
  var zoom = 1;
  /* FFT_VIEWER_BACKEND_READY_THEME_DATA_20260602 */
  var fallbackDownloadPdf = "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf";

  function getActiveBrochureData() {
    var slug = new URLSearchParams(window.location.search).get("brochure") || "utama";
    var store = window.FFT_BROCHURE_DATA || window.BROCHURES || {};

    return (
      window.FFT_ACTIVE_BROCHURE ||
      store[slug] ||
      store.utama ||
      {}
    );
  }

  function getBrochureTitle() {
    var data = getActiveBrochureData();
    return data.title || "Preview Brosur Digital";
  }

  function getBrochureDescription() {
    var data = getActiveBrochureData();
    return data.description || "Baca brosur digital dalam tampilan buku interaktif.";
  }

  function getDownloadPdf() {
    var data = getActiveBrochureData();

    return (
      data.downloadUrl ||
      data.download ||
      data.pdfUrl ||
      data.pdf ||
      data.source ||
      fallbackDownloadPdf
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var downloadPdf = getDownloadPdf();
  /* /FFT_VIEWER_BACKEND_READY_THEME_DATA_20260602 */
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
        '<h1 class="fft-viewer-shellbar__title">' + escapeHtml(getBrochureTitle()) + '</h1>',
        '<p class="fft-viewer-shellbar__subtitle">' + escapeHtml(getBrochureDescription()) + '</p>',
      '</div>',
      '<nav class="fft-viewer-shellbar__actions" aria-label="Aksi preview brosur">',
        '<a class="fft-viewer-shellbar__button fft-viewer-shellbar__button--ghost" href="../e-brochure.html">Kembali</a>',
        '<a class="fft-viewer-shellbar__button" href="' + getDownloadPdf() + '" target="_blank" rel="noopener">Download PDF</a>',
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
/* FFT_VIEWER_MOBILE_SINGLE_SLIDE_TOOLBAR_LITE_20260603 */
function isMobileSingleSlideLite() {
  return !!(
    window.matchMedia &&
    window.matchMedia("(max-width: 760px)").matches
  );
}

function getSpreadStep() {
  return isMobileSingleSlideLite() ? 1 : 2;
}

function getSpreadMenuLabel(spreadStart, total) {
  var start = Math.max(1, parseInt(spreadStart, 10) || 1);
  var end = Math.min(Math.max(1, parseInt(total, 10) || start), start + 1);

  if (isMobileSingleSlideLite()) {
    return "Halaman " + start;
  }

  return start === end
    ? "Halaman " + start
    : "Halaman " + start + " sampai " + end;
}
/* /FFT_VIEWER_MOBILE_SINGLE_SLIDE_TOOLBAR_LITE_20260603 */
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
    spreadEnd: isMobileSingleSlideLite() ? start : Math.min(total, start + 1),
    isFirst: start <= 1,
    isLast: start >= normalizeSpreadStart(total, total)
  };
}

function normalizeSpreadStart(page, total) {
  var safeTotal = Math.max(1, parseInt(total, 10) || 1);
  var safePage = Math.max(1, Math.min(safeTotal, parseInt(page, 10) || 1));

  if (isMobileSingleSlideLite()) {
    return safePage;
  }

  return safePage % 2 === 0 ? Math.max(1, safePage - 1) : safePage;
}

function getSpreadLabel(start, total) {
  var safeTotal = Math.max(1, parseInt(total, 10) || 1);
  var safeStart = normalizeSpreadStart(start, safeTotal);
  var safeEnd = Math.min(safeTotal, safeStart + 1);

  if (isMobileSingleSlideLite()) {
    return "Halaman " + safeStart + " dari " + safeTotal;
  }

  return safeStart === safeEnd
    ? "Halaman " + safeStart + " dari " + safeTotal
    : "Halaman " + safeStart + " sampai " + safeEnd + " dari " + safeTotal;
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
      var spreadEnd = isMobileSingleSlideLite() ? spreadStart : Math.min(total, spreadStart + 1);

      button.type = "button";
      button.className = "fft-dflip-page-choice fft-dflip-spread-choice";
      button.textContent = getSpreadMenuLabel(spreadStart, total);
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
  /* FFT_VIEWER_CLEAN_NATIVE_MORE_MENU_20260602 */
  moreMenu.innerHTML = [
    '<button type="button" class="fft-dflip-menu-item" data-action="download">Download PDF</button>'
  ].join("");
  /* /FFT_VIEWER_CLEAN_NATIVE_MORE_MENU_20260602 */

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

/* FFT_VIEWER_PAGE_JUMPER_CLONE_PANEL_20260602 */
(function () {
  "use strict";

  var nativeClick = false;
  var panel = null;
  var lastButton = null;

  function closestElement(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }

  function getPageButton() {
    return document.querySelector(".fft-dflip-spread-btn, .fft-dflip-page-btn");
  }

  function getNativeMenu() {
    var menus = Array.prototype.slice.call(
      document.querySelectorAll(".fft-dflip-spread-menu, .fft-dflip-page-menu")
    );

    return menus.filter(function (menu) {
      return !menu.classList.contains("fft-page-jump-clone-panel");
    })[0] || null;
  }

  function getNativeChoices() {
    var menu = getNativeMenu();

    if (!menu) {
      return [];
    }

    return Array.prototype.slice.call(
      menu.querySelectorAll(".fft-dflip-spread-choice, .fft-dflip-page-choice")
    );
  }

  function ensurePanel() {
    if (panel && panel.parentElement === document.body) {
      return panel;
    }

    panel = document.createElement("div");
    panel.className = "fft-page-jump-clone-panel";
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", "Pilih halaman brosur");
    panel.style.display = "none";

    document.body.appendChild(panel);

    return panel;
  }

  function closeNativeMenu() {
    var menu = getNativeMenu();

    if (menu) {
      menu.classList.remove("is-open");
      menu.style.display = "none";
      menu.style.visibility = "hidden";
      menu.style.pointerEvents = "none";
    }
  }

  function closePanel() {
    var pageButton = getPageButton();

    if (panel) {
      panel.classList.remove("is-open");
      panel.style.display = "none";
    }

    if (pageButton) {
      pageButton.setAttribute("aria-expanded", "false");
    }

    closeNativeMenu();
  }

  function positionPanel(button) {
    if (!panel || !button) {
      return;
    }

    var rect = button.getBoundingClientRect();
    var toolbar = button.closest(".fft-dflip-toolbar");
    var toolbarRect = toolbar ? toolbar.getBoundingClientRect() : null;
    var bottom = toolbarRect
      ? Math.max(86, Math.round(window.innerHeight - toolbarRect.top + 14))
      : 110;

    panel.style.left = Math.round(rect.left + (rect.width / 2)) + "px";
    panel.style.bottom = bottom + "px";
    panel.style.transform = "translateX(-50%)";
  }

  function findNativeChoice(spreadStart, label) {
    var choices = getNativeChoices();

    for (var index = 0; index < choices.length; index += 1) {
      if (choices[index].dataset && choices[index].dataset.spreadStart === spreadStart) {
        return choices[index];
      }
    }

    for (var textIndex = 0; textIndex < choices.length; textIndex += 1) {
      if ((choices[textIndex].textContent || "").trim() === label) {
        return choices[textIndex];
      }
    }

    return null;
  }


  /* FFT_VIEWER_PAGE_JUMPER_DIRECT_CLICK_20260602 */
  function getLivePageFlip() {
    try {
      return (new Function("return typeof pageFlip !== 'undefined' ? pageFlip : null;"))();
    } catch (error) {
      return null;
    }
  }

  function jumpToSpreadDirect(spreadStart) {
    var targetPage = parseInt(spreadStart, 10);

    if (!targetPage || !isFinite(targetPage) || targetPage < 1) {
      return false;
    }

    if (typeof window.FFTBrochureViewerJumpToSpread === "function") {
      return window.FFTBrochureViewerJumpToSpread(targetPage) !== false;
    }

    if (typeof window.FFTBrochureViewerJumpToPage === "function") {
      return window.FFTBrochureViewerJumpToPage(targetPage) !== false;
    }

    var viewer = window.FFTBrochureViewer || window.fftBrochureViewer || null;

    if (viewer) {
      if (typeof viewer.jumpToSpread === "function") {
        return viewer.jumpToSpread(targetPage) !== false;
      }

      if (typeof viewer.goToPage === "function") {
        return viewer.goToPage(targetPage) !== false;
      }

      if (typeof viewer.jumpToPage === "function") {
        return viewer.jumpToPage(targetPage) !== false;
      }
    }

    var livePageFlip = getLivePageFlip();

    if (!livePageFlip) {
      return false;
    }

    var targetIndex = targetPage - 1;

    if (typeof livePageFlip.turnToPage === "function") {
      livePageFlip.turnToPage(targetIndex);
      return true;
    }

    if (typeof livePageFlip.flip === "function") {
      livePageFlip.flip(targetIndex);
      return true;
    }

    return false;
  }
  /* /FFT_VIEWER_PAGE_JUMPER_DIRECT_CLICK_20260602 */


  function buildPanelFromNativeChoices() {
    var choices = getNativeChoices();
    var currentPanel = ensurePanel();

    currentPanel.innerHTML = "";

    var title = document.createElement("div");
    title.className = "fft-page-jump-clone-title";
    title.textContent = "Lompat halaman";
currentPanel.appendChild(title);

    if (!choices.length) {
      var empty = document.createElement("div");
      empty.className = "fft-page-jump-clone-empty";
      empty.textContent = "Daftar halaman belum siap.";
      currentPanel.appendChild(empty);
      return false;
    }

    choices.forEach(function (choice) {
      var label = (choice.textContent || "").trim();
      var spreadStart = choice.dataset ? choice.dataset.spreadStart : "";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "fft-page-jump-clone-choice";
      button.textContent = label;
      button.dataset.spreadStart = spreadStart;

      if (
        choice.classList.contains("is-current") ||
        choice.classList.contains("is-active")
      ) {
        button.classList.add("is-current");
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var jumped = jumpToSpreadDirect(spreadStart);
        var nativeChoice = findNativeChoice(spreadStart, label);

        closePanel();

        if (!jumped && nativeChoice) {
          nativeChoice.click();
        }
      });

      currentPanel.appendChild(button);
    });

    return true;
  }

  function openPanel(button) {
    lastButton = button;

    nativeClick = true;
    button.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    nativeClick = false;

    window.setTimeout(function () {
      var currentPanel = ensurePanel();

      buildPanelFromNativeChoices();
      closeNativeMenu();
      positionPanel(button);

      currentPanel.style.display = "grid";
      currentPanel.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }, 0);
  }

  function togglePanel(button) {
    if (panel && panel.classList.contains("is-open")) {
      closePanel();
      return;
    }

    openPanel(button);
  }

  document.addEventListener("click", function (event) {
    if (nativeClick) {
      return;
    }

    var pageButton = closestElement(event.target, ".fft-dflip-spread-btn, .fft-dflip-page-btn");

    if (pageButton) {
      event.preventDefault();
      event.stopPropagation();

      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }

      togglePanel(pageButton);
      return;
    }

    if (
      panel &&
      panel.classList.contains("is-open") &&
      !closestElement(event.target, ".fft-page-jump-clone-panel")
    ) {
      closePanel();
    }
  }, true);

  window.addEventListener("resize", function () {
    if (panel && panel.classList.contains("is-open") && lastButton) {
      positionPanel(lastButton);
    }
  });

  window.addEventListener("scroll", function () {
    if (panel && panel.classList.contains("is-open") && lastButton) {
      positionPanel(lastButton);
    }
  }, true);
}());
/* /FFT_VIEWER_PAGE_JUMPER_CLONE_PANEL_20260602 */

/* FFT_VIEWER_ACTION_MENU_PANEL_20260602 */
(function () {
  "use strict";

  var menuPanel = null;
  var menuButton = null;
  var statusTimer = null;
  var autoReadTimer = null;
  var autoReadDirection = null;
  var autoReadDelay = 5000;
  /* FFT_VIEWER_MENU_NO_CLOSE_TIMER_MIN_1_20260602 */
  /* /FFT_VIEWER_MENU_NO_CLOSE_TIMER_MIN_1_20260602 */

  function closestElement(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isMenuButton(target) {
    var control = closestElement(target, "button, a, [role='button']");

    if (!control || !closestElement(control, ".fft-dflip-toolbar")) {
      return null;
    }

    var text = normalizeText(control.textContent);
    var label = normalizeText(control.getAttribute("aria-label"));
    var title = normalizeText(control.getAttribute("title"));
    var className = normalizeText(control.className);

    if (
      text === "menu" ||
      label === "menu" ||
      title === "menu" ||
      className.indexOf("menu") !== -1 ||
      className.indexOf("more") !== -1
    ) {
      return control;
    }

    return null;
  }

  function getStore() {
    return window.FFT_BROCHURE_DATA || window.BROCHURES || window.brochureData || {};
  }

  function getCurrentSlug() {
    return (
      window.FFT_ACTIVE_BROCHURE_SLUG ||
      new URLSearchParams(window.location.search).get("brochure") ||
      "utama"
    );
  }

  function getActiveBrochure() {
    var store = getStore();
    var slug = getCurrentSlug();

    return (
      window.FFT_ACTIVE_BROCHURE ||
      store[slug] ||
      store.utama ||
      {}
    );
  }

  function getDownloadUrl() {
    var data = getActiveBrochure();

    return (
      data.downloadUrl ||
      data.download ||
      data.pdfUrl ||
      data.pdf ||
      data.source ||
      "assets/brosur/konten-belum-tersedia-fft/konten-belum-tersedia-fft.pdf"
    );
  }

  function getPageCount() {
    var data = getActiveBrochure();

    if (typeof data.pageCount === "number" && data.pageCount > 0) {
      return data.pageCount;
    }

    if (typeof data.totalPages === "number" && data.totalPages > 0) {
      return data.totalPages;
    }

    if (Array.isArray(window.FFT_ACTIVE_BROCHURE_PAGES)) {
      return window.FFT_ACTIVE_BROCHURE_PAGES.length;
    }

    if (Array.isArray(data.pages)) {
      return data.pages.length;
    }

    return document.querySelectorAll(".page").length;
  }

  function showStatus(message) {
    var status = document.querySelector(".fft-viewer-action-menu-status");

    if (!status) {
      status = document.createElement("div");
      status.className = "fft-viewer-action-menu-status";
      document.body.appendChild(status);
    }

    status.textContent = message;
    status.classList.add("is-visible");

    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () {
      status.classList.remove("is-visible");
    }, 1600);
  }

  function closeNativeMenu() {
    Array.prototype.slice.call(document.querySelectorAll(".fft-dflip-more-menu")).forEach(function (menu) {
      menu.classList.remove("is-open");
      menu.style.display = "none";
      menu.style.visibility = "hidden";
      menu.style.pointerEvents = "none";
    });
  }

  function ensurePanel() {
    if (menuPanel && menuPanel.parentElement === document.body) {
      return menuPanel;
    }

    menuPanel = document.createElement("div");
    menuPanel.className = "fft-viewer-action-menu";
    menuPanel.setAttribute("role", "menu");
    menuPanel.setAttribute("aria-label", "Menu viewer brosur");
    menuPanel.style.display = "none";

    document.body.appendChild(menuPanel);

    return menuPanel;
  }

  function positionPanel() {
    if (!menuPanel || !menuButton) {
      return;
    }

    var rect = menuButton.getBoundingClientRect();
    var toolbar = menuButton.closest(".fft-dflip-toolbar");
    var toolbarRect = toolbar ? toolbar.getBoundingClientRect() : null;

    var bottom = toolbarRect
      ? Math.max(86, Math.round(window.innerHeight - toolbarRect.top + 12))
      : 110;

    var right = Math.max(16, Math.round(window.innerWidth - rect.right));

    menuPanel.style.right = right + "px";
    menuPanel.style.left = "auto";
    menuPanel.style.bottom = bottom + "px";
    menuPanel.style.transform = "none";
  }

  function closePanel() {
    if (menuPanel) {
      menuPanel.classList.remove("is-open");
      menuPanel.style.display = "none";
    }

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
    }

    closeNativeMenu();
  }

  function jumpToPage(pageNumber) {
    if (typeof window.FFTBrochureViewerJumpToPage === "function") {
      return window.FFTBrochureViewerJumpToPage(pageNumber) !== false;
    }

    if (typeof window.FFTBrochureViewerJumpToSpread === "function") {
      return window.FFTBrochureViewerJumpToSpread(pageNumber) !== false;
    }

    return false;
  }


  /* FFT_VIEWER_ACTION_MENU_AUTOREAD_20260602 */
  function stopAutoRead(showMessage) {
    window.clearTimeout(autoReadTimer);
    window.clearInterval(autoReadTimer);

    autoReadTimer = null;
    autoReadDirection = null;

    if (showMessage) {
      showStatus("Auto slide dihentikan");
    }
  }

  function getCurrentSpreadStart() {
    var pageButton = document.querySelector(".fft-dflip-spread-btn, .fft-dflip-page-btn");
    var label = pageButton ? pageButton.textContent : "";
    var match = label.match(/halaman\s+(\d+)/i);

    if (match) {
      return parseInt(match[1], 10) || 1;
    }

    return 1;
  }

  function getLastSpreadStart() {
    var total = getPageCount();

    if (!total || total < 1) {
      return 1;
    }

    if (total > 1 && total % 2 === 0) {
      return total - 1;
    }

    return total;
  }

  function getAutoReadTarget(direction) {
    var current = getCurrentSpreadStart();
    var lastStart = getLastSpreadStart();

    if (direction === "next") {
      if (current >= lastStart) {
        return null;
      }

      return Math.min(current + 2, lastStart);
    }

    if (current <= 1) {
      return null;
    }

    return Math.max(current - 2, 1);
  }


  /* FFT_VIEWER_AUTO_SLIDE_DELAY_SEQUENCE_FIX_20260602 */
  function scheduleAutoReadStep(direction, waitMs) {
    var delay = parseInt(waitMs, 10);

    if (!Number.isFinite(delay) || delay < 1000) {
      delay = 1000;
    }

    window.clearTimeout(autoReadTimer);
    window.clearInterval(autoReadTimer);

    autoReadTimer = window.setTimeout(function () {
      runAutoReadStep(direction);
    }, delay);
  }
  /* /FFT_VIEWER_AUTO_SLIDE_DELAY_SEQUENCE_FIX_20260602 */


  function runAutoReadStep(direction) {
    if (!autoReadDirection || autoReadDirection !== direction) {
      return;
    }

    var target = getAutoReadTarget(direction);

    if (!target) {
      stopAutoRead(false);
      showStatus(direction === "next" ? "Sudah di halaman akhir" : "Sudah di halaman awal");
      return;
    }

    if (!jumpToPage(target)) {
      scheduleAutoReadStep(direction, 900);
      return;
    }

    scheduleAutoReadStep(direction, autoReadDelay);
  }

  function startAutoRead(direction) {
    stopAutoRead(false);

    if (typeof loadAutoReadDelay === "function") {
      loadAutoReadDelay();
    }

    if (typeof updateAutoSlideTimerLabels === "function") {
      updateAutoSlideTimerLabels();
    }

    autoReadDirection = direction;

    closePanel();

    var seconds = typeof getAutoReadDelaySeconds === "function"
      ? getAutoReadDelaySeconds()
      : Math.max(1, Math.round(autoReadDelay / 1000));

    showStatus(
      direction === "next"
        ? "Auto slide berikutnya aktif. Mulai dalam " + seconds + " detik"
        : "Auto slide sebelumnya aktif. Mulai dalam " + seconds + " detik"
    );

    scheduleAutoReadStep(direction, autoReadDelay);
  }
  /* /FFT_VIEWER_ACTION_MENU_AUTOREAD_20260602 */


  function openPageChooser() {
    var pageButton = document.querySelector(".fft-dflip-spread-btn, .fft-dflip-page-btn");

    closePanel();

    if (!pageButton) {
      showStatus("Pilihan halaman belum siap");
      return;
    }

    window.setTimeout(function () {
      pageButton.click();
    }, 80);
  }

  function createItem(label, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "fft-viewer-action-menu-item";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }


  /* FFT_VIEWER_ACTION_MENU_TIMER_20260602 */
  var autoSlideTimerCloseTimer = null;
  var autoSlideTimerStorageKey = "FFT_VIEWER_AUTO_SLIDE_DELAY_SECONDS";

  function getAutoReadDelaySeconds() {
    return Math.max(1, Math.round(autoReadDelay / 1000));
  }

  function loadAutoReadDelay() {
    try {
      var saved = parseInt(window.localStorage.getItem(autoSlideTimerStorageKey), 10);

      if (Number.isFinite(saved) && saved >= 1 && saved <= 30) {
        autoReadDelay = saved * 1000;
      }
    } catch (error) {}
  }

  function updateAutoSlideTimerLabels() {
    Array.prototype.slice.call(document.querySelectorAll(".fft-viewer-auto-slide-hotspot-label")).forEach(function (label) {
      label.textContent = "Timer: " + getAutoReadDelaySeconds() + " detik";
    });

    Array.prototype.slice.call(document.querySelectorAll(".fft-viewer-auto-slide-timer input")).forEach(function (input) {
      input.value = String(getAutoReadDelaySeconds());
    });
  }

  function setAutoReadDelay(seconds) {
    var value = parseInt(seconds, 10);

    if (!Number.isFinite(value) || value < 1) {
      value = 5;
    }

    if (value > 30) {
      value = 30;
    }

    autoReadDelay = value * 1000;

    try {
      window.localStorage.setItem(autoSlideTimerStorageKey, String(value));
    } catch (error) {}

    updateAutoSlideTimerLabels();

    if (autoReadTimer && autoReadDirection) {
      scheduleAutoReadStep(autoReadDirection, autoReadDelay);
    }

    showStatus("Timer auto slide: " + value + " detik");
  }

  function openAutoSlideTimer(group) {
    if (!group) {
      return;
    }

    window.clearTimeout(autoSlideTimerCloseTimer);
    group.classList.add("is-timer-open");

    var hotspot = group.querySelector(".fft-viewer-auto-slide-hotspot");
    if (hotspot) {
      hotspot.setAttribute("aria-expanded", "true");
    }
  }

  function closeAutoSlideTimer(group) {
    if (!group) {
      return;
    }

    group.classList.remove("is-timer-open");

    var hotspot = group.querySelector(".fft-viewer-auto-slide-hotspot");
    if (hotspot) {
      hotspot.setAttribute("aria-expanded", "false");
    }
  }

  function scheduleCloseAutoSlideTimer(group) {
    window.clearTimeout(autoSlideTimerCloseTimer);

    autoSlideTimerCloseTimer = window.setTimeout(function () {
      closeAutoSlideTimer(group);
    }, 520);
  }

  function createTimerPanel(group) {
    var wrap = document.createElement("div");
    var title = document.createElement("strong");
    var help = document.createElement("p");
    var field = document.createElement("label");
    var input = document.createElement("input");
    var buttons = document.createElement("div");
    var useButton = document.createElement("button");
    var defaultButton = document.createElement("button");

    wrap.className = "fft-viewer-auto-slide-timer";
    wrap.setAttribute("aria-label", "Atur timer auto slide");

    title.textContent = "Atur timer auto slide";
    help.textContent = "Pilih durasi 1 sampai 30 detik, lalu tekan Auto Slide.";

    field.textContent = "Manual, detik";
    input.type = "number";
    input.min = "1";
    input.max = "30";
    input.step = "1";
    input.value = String(getAutoReadDelaySeconds());
    input.setAttribute("aria-label", "Timer auto slide dalam detik");

    field.appendChild(input);

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        setAutoReadDelay(input.value);
        openAutoSlideTimer(group);
      }

      if (event.key === "Escape") {
        closeAutoSlideTimer(group);
      }
    });

    buttons.className = "fft-viewer-auto-slide-timer-actions";

    useButton.type = "button";
    useButton.textContent = "Gunakan Timer";
    useButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setAutoReadDelay(input.value);
      openAutoSlideTimer(group);
    });

    defaultButton.type = "button";
    defaultButton.textContent = "Default 5 Detik";
    defaultButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      input.value = "5";
      setAutoReadDelay(5);
      openAutoSlideTimer(group);
    });

    buttons.appendChild(useButton);
    buttons.appendChild(defaultButton);

    wrap.appendChild(title);
    wrap.appendChild(help);
    wrap.appendChild(field);
    wrap.appendChild(buttons);

    wrap.addEventListener("mouseenter", function () {
      openAutoSlideTimer(group);
    });

    wrap.addEventListener("mouseleave", function () {
      scheduleCloseAutoSlideTimer(group);
    });

    wrap.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    return wrap;
  }

  /* FFT_VIEWER_AUTO_SLIDE_NEXT_FIRST_20260602 */
  function createAutoSlideGroup() {
    loadAutoReadDelay();

    var group = document.createElement("div");
    var timerHotspot = document.createElement("div");
    var timerLabel = document.createElement("span");

    group.className = "fft-viewer-auto-slide-group";

    group.appendChild(createItem("Auto Slide Berikutnya", function () {
      startAutoRead("next");
    }));

    timerHotspot.className = "fft-viewer-auto-slide-hotspot";
    timerHotspot.setAttribute("role", "button");
    timerHotspot.setAttribute("tabindex", "0");
    timerHotspot.setAttribute("aria-haspopup", "true");
    timerHotspot.setAttribute("aria-expanded", "false");

    timerLabel.className = "fft-viewer-auto-slide-hotspot-label";
    timerLabel.textContent = "Timer: " + getAutoReadDelaySeconds() + " detik";

    timerHotspot.appendChild(timerLabel);
    timerHotspot.appendChild(createTimerPanel(group));

    timerHotspot.addEventListener("mouseenter", function () {
      openAutoSlideTimer(group);
    });

    timerHotspot.addEventListener("focus", function () {
      openAutoSlideTimer(group);
    });

    timerHotspot.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (group.classList.contains("is-timer-open")) {
        closeAutoSlideTimer(group);
      } else {
        openAutoSlideTimer(group);
      }
    });

    timerHotspot.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        timerHotspot.click();
      }

      if (event.key === "Escape") {
        closeAutoSlideTimer(group);
      }
    });

    group.addEventListener("mouseenter", function () {
      openAutoSlideTimer(group);
    });

    group.addEventListener("mouseleave", function () {
      scheduleCloseAutoSlideTimer(group);
    });

    group.appendChild(timerHotspot);

    group.appendChild(createItem("Auto Slide Sebelumnya", function () {
      startAutoRead("prev");
    }));

    return group;
  }
  /* /FFT_VIEWER_AUTO_SLIDE_NEXT_FIRST_20260602 */
  /* /FFT_VIEWER_ACTION_MENU_TIMER_20260602 */


function buildPanel() {
    var panel = ensurePanel();

    panel.innerHTML = "";

    panel.appendChild(createItem("Download PDF", function () {
      stopAutoRead(false);

      var url = getDownloadUrl();

      closePanel();

      if (url) {
        window.open(url, "_blank", "noopener");
      } else {
        showStatus("File PDF belum tersedia");
      }
    }));

    panel.appendChild(createItem("Pilih Halaman", function () {
      stopAutoRead(false);
      openPageChooser();
    }));

    panel.appendChild(createAutoSlideGroup());

    if (autoReadTimer) {
      panel.appendChild(createItem("Hentikan Auto Slide", function () {
        closePanel();
        stopAutoRead(true);
      }));
    }
}

  function openPanel(button) {
    menuButton = button;

    buildPanel();
    closeNativeMenu();
    positionPanel();

    menuPanel.style.display = "grid";
    menuPanel.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function togglePanel(button) {
    if (menuPanel && menuPanel.classList.contains("is-open")) {
      closePanel();
      return;
    }

    openPanel(button);
  }

  document.addEventListener("click", function (event) {
    var button = isMenuButton(event.target);

    if (button) {
      event.preventDefault();
      event.stopPropagation();

      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }

      togglePanel(button);
      return;
    }

    if (
      menuPanel &&
      menuPanel.classList.contains("is-open") &&
      !closestElement(event.target, ".fft-viewer-action-menu")
    ) {
      closePanel();
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePanel();
    }
  });

  window.addEventListener("resize", function () {
    if (menuPanel && menuPanel.classList.contains("is-open")) {
      positionPanel();
    }
  });

  window.addEventListener("scroll", function () {
    if (menuPanel && menuPanel.classList.contains("is-open")) {
      positionPanel();
    }
  }, true);
}());
/* /FFT_VIEWER_ACTION_MENU_PANEL_20260602 */

/* FFT_VIEWER_RELEASE_BOOT_HIDE_OLD_THEME_20260602 */
(function () {
  var released = false;
  var startedAt = Date.now();
  var maxWait = 2600;

  function releaseViewerBootLock() {
    if (released) {
      return;
    }

    released = true;

    document.documentElement.classList.remove("fft-viewer-boot-lock");
    document.documentElement.classList.add("fft-viewer-boot-ready");
  }

  function titleStillOld() {
    var title = document.querySelector(".viewer-title h1, h1");

    if (!title) {
      return false;
    }

    return /^\s*Preview\s+E\s+Brochure\s*$/i.test(title.textContent || "");
  }

  function waitUntilThemeReady() {
    var timeout = Date.now() - startedAt > maxWait;

    if (!titleStillOld() || timeout) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(releaseViewerBootLock);
      });
      return;
    }

    window.setTimeout(waitUntilThemeReady, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitUntilThemeReady, { once: true });
  } else {
    waitUntilThemeReady();
  }

  window.addEventListener("load", function () {
    window.setTimeout(releaseViewerBootLock, 900);
  }, { once: true });

  window.setTimeout(releaseViewerBootLock, 3600);
}());
/* /FFT_VIEWER_RELEASE_BOOT_HIDE_OLD_THEME_20260602 */

/* FFT_VIEWER_MOBILE_SHARE_SHEET_20260603 */
(function () {
  var PATCH_ID = "FFT_VIEWER_MOBILE_SHARE_SHEET_20260603";
  var shareSheet = null;
  var shareToast = null;
  var busy = false;
  var NL = String.fromCharCode(10);

  var platforms = [
    { id: "whatsapp", label: "WhatsApp", badge: "WA", mode: "url" },
    { id: "whatsappBusiness", label: "WhatsApp Business", badge: "WB", mode: "url" },
    { id: "x", label: "X", badge: "X", mode: "url" },
    { id: "linkedin", label: "LinkedIn", badge: "IN", mode: "url" },
    { id: "teams", label: "Teams", badge: "TM", mode: "url" },
    { id: "mail", label: "Mail", badge: "@", mode: "url" },
    { id: "gmail", label: "Gmail", badge: "GM", mode: "url" },
    { id: "facebook", label: "Facebook", badge: "FB", mode: "url" },
    { id: "instagram", label: "Instagram", badge: "IG", mode: "copyOpen" },
    { id: "telegram", label: "Telegram", badge: "TG", mode: "url" },
    { id: "copy", label: "Salin", badge: "CL", mode: "copy" },
  ];

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent || "");
  }

  function textOf(node) {
    return (node && (node.innerText || node.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function isInsideMobileToolbar(node) {
    return !!(
      node &&
      node.closest &&
      node.closest('.fft-dflip-toolbar-wrap[data-fft-mobile-book="true"] .fft-dflip-toolbar.fft-dflip-spread-toolbar')
    );
  }

  function getShareTitle() {
    var titleNode = document.querySelector("[data-brochure-title], .fft-viewer-shellbar__title, h1");
    return textOf(titleNode) || document.title || "E-Brochure";
  }

  function getShareText() {
    var subtitleNode = document.querySelector("[data-brochure-description], .fft-viewer-shellbar__subtitle");
    return textOf(subtitleNode) || "Lihat e-brochure ini.";
  }

  function getShareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : window.location.href;
  }

  function getShareData() {
    return {
      title: getShareTitle(),
      text: getShareText(),
      url: getShareUrl()
    };
  }

  function getMessage(data) {
    return data.title + NL + data.text + NL + data.url;
  }

  function enc(value) {
    return encodeURIComponent(value || "");
  }

  function buildShareUrl(platformId, data) {
    var message = getMessage(data);

    switch (platformId) {
      case "whatsapp":
        return "https://wa.me/?text=" + enc(message);

      case "whatsappBusiness":
        if (isAndroid()) {
          return "intent://send?text=" + enc(message) + "#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end";
        }
        return "https://wa.me/?text=" + enc(message);

      case "x":
        return "https://twitter.com/intent/tweet?text=" + enc(data.title + NL + data.text) + "&url=" + enc(data.url);

      case "linkedin":
        return "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(data.url);

      case "teams":
        return "https://teams.microsoft.com/share?href=" + enc(data.url) + "&msgText=" + enc(data.title + NL + data.text);

      case "mail":
        return "mailto:?subject=" + enc(data.title) + "&body=" + enc(message);

      case "gmail":
        return "https://mail.google.com/mail/?view=cm&su=" + enc(data.title) + "&body=" + enc(message);

      case "facebook":
        return "https://www.facebook.com/sharer/sharer.php?u=" + enc(data.url);

      case "instagram":
        return "https://www.instagram.com/direct/inbox/";

      case "telegram":
        return "https://t.me/share/url?url=" + enc(data.url) + "&text=" + enc(data.title + NL + data.text);

      default:
        return data.url;
    }
  }

  function ensureToast() {
    if (shareToast) {
      return shareToast;
    }

    shareToast = document.createElement("div");
    shareToast.className = "fft-mobile-share-toast";
    document.body.appendChild(shareToast);

    return shareToast;
  }

  function showToast(message) {
    var toast = ensureToast();

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(toast._fftTimer);
    toast._fftTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  async function copyShareLink(data, silent) {
    var value = data.url;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      var input = document.createElement("input");
      input.value = value;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    if (!silent) {
      showToast("Link berhasil disalin");
    }
  }

  function openExternal(url) {
    if (!url) {
      return;
    }

    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function closeShareSheet() {
    if (shareSheet) {
      shareSheet.classList.remove("is-open");
      shareSheet.setAttribute("aria-hidden", "true");
    }
  }

  function createShareSheet() {
    if (shareSheet) {
      return shareSheet;
    }

    shareSheet = document.createElement("div");
    shareSheet.className = "fft-mobile-share-sheet";
    shareSheet.id = "fft-mobile-share-sheet";
    shareSheet.setAttribute("aria-hidden", "true");

    var items = platforms.map(function (platform) {
      return (
        '<button type="button" class="fft-mobile-share-sheet__item" data-share-target="' + platform.id + '">' +
          '<span class="fft-mobile-share-sheet__badge">' + platform.badge + '</span>' +
          '<span>' + platform.label + '</span>' +
        '</button>'
      );
    }).join("");

    shareSheet.innerHTML =
      '<div class="fft-mobile-share-sheet__panel" role="dialog" aria-modal="true" aria-label="Bagikan brosur">' +
        '<div class="fft-mobile-share-sheet__head">' +
          '<div>' +
            '<h2 class="fft-mobile-share-sheet__title">Bagikan brosur</h2>' +
            '<p class="fft-mobile-share-sheet__desc">Pilih platform untuk membagikan link e-brochure.</p>' +
          '</div>' +
          '<button type="button" class="fft-mobile-share-sheet__close" aria-label="Tutup">x</button>' +
        '</div>' +
        '<div class="fft-mobile-share-sheet__grid">' +
          items +
        '</div>' +
      '</div>';

    document.body.appendChild(shareSheet);

    shareSheet.addEventListener("click", function (event) {
      if (event.target === shareSheet || event.target.closest(".fft-mobile-share-sheet__close")) {
        closeShareSheet();
        return;
      }

      var item = event.target.closest(".fft-mobile-share-sheet__item");
      if (!item) {
        return;
      }

      handlePlatformClick(item.getAttribute("data-share-target"));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeShareSheet();
      }
    });

    return shareSheet;
  }

  function openShareSheet() {
    var sheet = createShareSheet();

    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
  }

  async function handlePlatformClick(platformId) {
    if (busy) {
      return;
    }

    busy = true;

    var platform = platforms.find(function (item) {
      return item.id === platformId;
    });

    var data = getShareData();

    try {
      if (!platform) {
        return;
      }

      if (platform.mode === "copy") {
        await copyShareLink(data, false);
        closeShareSheet();
        return;
      }

      if (platform.mode === "native") {
        closeShareSheet();

        if (navigator.share) {
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url
          });
          return;
        }

        showToast("Menu Lainnya belum tersedia di browser ini.");
        return;
      }

      if (platform.mode === "copyOpen") {
        await copyShareLink(data, true);
        showToast("Link disalin. Tempel di " + platform.label + ".");
        closeShareSheet();

        window.setTimeout(function () {
          openExternal(buildShareUrl(platform.id, data));
        }, 120);

        return;
      }

      closeShareSheet();
      openExternal(buildShareUrl(platform.id, data));
    } catch (error) {
      console.warn(PATCH_ID, error);

      try {
        await copyShareLink(data, false);
      } catch (copyError) {
        console.warn(PATCH_ID + "_COPY_FALLBACK", copyError);
      }

      showToast("Bagikan belum tersedia. Link disalin.");
    } finally {
      window.setTimeout(function () {
        busy = false;
      }, 350);
    }
  }

  function findToolbarShareButton(target) {
    if (!target || !target.closest) {
      return null;
    }

    var direct = target.closest(
      '.fft-dflip-share, [data-fft-toolbar-share], [data-action="share"], [data-fft-action="share"]'
    );

    if (direct && !direct.closest(".fft-mobile-share-sheet")) {
      return direct;
    }

    var candidate = target.closest('button, a, [role="button"]');

    if (!candidate || candidate.closest(".fft-mobile-share-sheet")) {
      return null;
    }

    var meta = [
      candidate.innerText || candidate.textContent || "",
      candidate.getAttribute("aria-label") || "",
      candidate.getAttribute("title") || "",
      candidate.getAttribute("data-action") || "",
      candidate.getAttribute("data-fft-action") || "",
      String(candidate.className || "")
    ].join(" ").toLowerCase();

    if (
      (meta.indexOf("bagikan") >= 0 || meta.indexOf("share") >= 0) &&
      candidate.closest(".fft-dflip-toolbar, .fft-dflip-toolbar-wrap, .df-ui-wrapper, .df-ui-controls")
    ) {
      return candidate;
    }

    return null;
  }

  function handleToolbarShareClick(event) {
    var button = findToolbarShareButton(event.target);

    if (!button) {
      return;
    }

    var shouldHandle = isMobile()
      ? isInsideMobileToolbar(button)
      : !isInsideMobileToolbar(button);

    if (!shouldHandle) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }

    openShareSheet();
  }

  document.addEventListener("click", handleToolbarShareClick, true);
}());
/* /FFT_VIEWER_MOBILE_SHARE_SHEET_20260603 */

/* FFT_VIEWER_MOBILE_PDF_POSITION_TIGHT_20260603 */
(function () {
  var QUERY = "(max-width: 760px)";
  var attempts = 0;
  var timer = null;

  function isMobile() {
    return !!(
      window.matchMedia &&
      window.matchMedia(QUERY).matches
    );
  }

  function addClass(node, className) {
    if (!node || node === document.body || node === document.documentElement) {
      return;
    }

    node.classList.add(className);
  }

  function removeClasses() {
    document.documentElement.classList.remove("fft-mobile-pdf-position-tight");
    document.body.classList.remove("fft-mobile-pdf-position-tight");

    document.querySelectorAll(
      ".fft-mobile-pdf-tight-root, .fft-mobile-pdf-tight-outer, .fft-mobile-pdf-tight-shell, .fft-mobile-pdf-tight-book"
    ).forEach(function (node) {
      node.classList.remove(
        "fft-mobile-pdf-tight-root",
        "fft-mobile-pdf-tight-outer",
        "fft-mobile-pdf-tight-shell",
        "fft-mobile-pdf-tight-book"
      );

      if (node.style && node.style.removeProperty) {
        node.style.removeProperty("--fft-mobile-pdf-tight-lift");
      }
    });
  }

  function apply() {
    var book = document.getElementById("book");

    if (!book || !isMobile() || book.dataset.fftMobileSingleSlide !== "true") {
      return;
    }

    var shell = book.parentElement;
    var outer = shell && shell.parentElement;
    var root = outer && outer.parentElement;

    document.documentElement.classList.add("fft-mobile-pdf-position-tight");
    document.body.classList.add("fft-mobile-pdf-position-tight");

    book.classList.add("fft-mobile-pdf-tight-book");
    addClass(shell, "fft-mobile-pdf-tight-shell");
    addClass(outer, "fft-mobile-pdf-tight-outer");
    addClass(root, "fft-mobile-pdf-tight-root");

    window.requestAnimationFrame(function () {
      var bookRect = book.getBoundingClientRect();
      var shellRect = shell ? shell.getBoundingClientRect() : null;

      if (!shellRect || !bookRect.width || !bookRect.height) {
        return;
      }

      var gap = Math.round(bookRect.top - shellRect.top);
      var desiredGap = 10;
      var lift = 0;

      if (gap > 26 && gap < 260) {
        lift = Math.max(-140, -1 * (gap - desiredGap));
      }

      book.style.setProperty("--fft-mobile-pdf-tight-lift", lift + "px");
    });
  }

  function schedule() {
    if (!isMobile()) {
      removeClasses();
      return;
    }

    apply();

    window.clearInterval(timer);
    attempts = 0;

    timer = window.setInterval(function () {
      attempts += 1;
      apply();

      if (attempts >= 10) {
        window.clearInterval(timer);
      }
    }, 180);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
}());
/* /FFT_VIEWER_MOBILE_PDF_POSITION_TIGHT_20260603 */

/* FFT_VIEWER_MOBILE_ZOOM_DRAG_PAN_20260604 */
(function () {
  var QUERY = "(max-width: 760px)";
  var zoomSteps = 0;
  var panX = 0;
  var panY = 0;
  var baseX = 0;
  var baseY = 0;
  var startX = 0;
  var startY = 0;
  var pointerId = null;
  var dragging = false;
  var settleTimers = [];

  function isMobile() {
    return !!(
      window.matchMedia &&
      window.matchMedia(QUERY).matches
    );
  }

  function getBook() {
    return document.getElementById("book");
  }

  function getShell() {
    var book = getBook();

    if (!book || book.dataset.fftMobileSingleSlide !== "true") {
      return null;
    }

    return (
      book.closest(".fft-mobile-pdf-tight-shell") ||
      book.parentElement
    );
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readNativeZoom() {
    var zoom = Number(window.__fftSpreadToolbarZoom);

    if (!Number.isFinite(zoom) || zoom <= 0) {
      return null;
    }

    return zoom;
  }

  function getZoomLevel() {
    var nativeZoom = readNativeZoom();

    if (nativeZoom && nativeZoom > 1.01) {
      return nativeZoom;
    }

    if (zoomSteps > 0) {
      return 1 + (zoomSteps * 0.25);
    }

    return 1;
  }

  function isZoomActive() {
    return getZoomLevel() > 1.01;
  }

  function clearSettleTimers() {
    settleTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });

    settleTimers = [];
  }

  function schedule(callback, delay) {
    settleTimers.push(window.setTimeout(callback, delay));
  }

  function getBounds() {
    var zoom = getZoomLevel();
    var width = Math.max(320, window.innerWidth || 360);
    var height = Math.max(560, window.innerHeight || 720);
    var factor = Math.max(1, Math.round((zoom - 1) * 4));

    return {
      minX: -1 * clamp(Math.round(width * 0.78 * factor), 170, 980),
      maxX: clamp(Math.round(width * 0.78 * factor), 170, 980),
      minY: -1 * clamp(Math.round(height * 0.38 * factor), 140, 840),
      maxY: clamp(Math.round(height * 0.18 * factor), 80, 420)
    };
  }

  function applyPan(x, y) {
    var shell = getShell();

    if (!shell || !isMobile()) {
      return;
    }

    var bounds = getBounds();

    panX = clamp(Math.round(x), bounds.minX, bounds.maxX);
    panY = clamp(Math.round(y), bounds.minY, bounds.maxY);

    shell.style.setProperty("--fft-mobile-zoom-pan-x", panX + "px");
    shell.style.setProperty("--fft-mobile-zoom-pan-y", panY + "px");
  }

  function enablePan() {
    var shell = getShell();
    var book = getBook();

    if (
      !isMobile() ||
      !shell ||
      !book ||
      book.dataset.fftMobileSingleSlide !== "true" ||
      !isZoomActive()
    ) {
      return;
    }

    document.documentElement.classList.add("fft-mobile-zoom-drag-pan-active");
    document.body.classList.add("fft-mobile-zoom-drag-pan-active");

    shell.classList.add("fft-mobile-zoom-drag-pan-shell");

    applyPan(panX, panY);
  }

  function hardResetPan() {
    var shell = getShell();

    zoomSteps = 0;
    panX = 0;
    panY = 0;
    baseX = 0;
    baseY = 0;
    dragging = false;
    pointerId = null;

    clearSettleTimers();

    document.documentElement.classList.remove("fft-mobile-zoom-drag-pan-active");
    document.body.classList.remove("fft-mobile-zoom-drag-pan-active");

    if (shell) {
      shell.classList.remove("fft-mobile-zoom-drag-pan-shell", "is-dragging");
      shell.style.removeProperty("--fft-mobile-zoom-pan-x");
      shell.style.removeProperty("--fft-mobile-zoom-pan-y");
    }
  }

  function softenPanAfterZoomOut() {
    panX = Math.round(panX * 0.52);
    panY = Math.round(panY * 0.52);
    applyPan(panX, panY);
  }

  function settleAfterZoomIn() {
    clearSettleTimers();

    schedule(enablePan, 100);
    schedule(enablePan, 240);
    schedule(enablePan, 460);
  }

  function settleAfterZoomOut() {
    var softened = false;

    clearSettleTimers();

    [80, 180, 340, 620].forEach(function (delay) {
      schedule(function () {
        if (!isMobile()) {
          hardResetPan();
          return;
        }

        if (!isZoomActive() || zoomSteps <= 0) {
          hardResetPan();
          return;
        }

        enablePan();

        if (!softened) {
          softened = true;
          softenPanAfterZoomOut();
          return;
        }

        applyPan(panX, panY);
      }, delay);
    });
  }

  function readMeta(button) {
    return [
      button.innerText || button.textContent || "",
      button.getAttribute("aria-label") || "",
      button.getAttribute("title") || "",
      String(button.className || "")
    ].join(" ").toLowerCase();
  }

  function getToolbarFromTarget(target) {
    if (!target || !target.closest) {
      return null;
    }

    return target.closest('.fft-dflip-toolbar-wrap[data-fft-mobile-book="true"]');
  }

  function getButton(target) {
    if (!target || !target.closest) {
      return null;
    }

    return target.closest("button, a, [role='button'], .fft-dflip-btn");
  }

  function detectByPosition(toolbar, button) {
    var buttons = Array.prototype.slice.call(
      toolbar.querySelectorAll("button, a, [role='button'], .fft-dflip-btn")
    ).filter(function (item) {
      var rect = item.getBoundingClientRect();

      return rect.width > 20 && rect.height > 20;
    });

    if (!buttons.length) {
      return "";
    }

    var toolbarRect = toolbar.getBoundingClientRect();

    var bottomRow = buttons.filter(function (item) {
      var rect = item.getBoundingClientRect();

      return rect.top >= toolbarRect.top + (toolbarRect.height * 0.42);
    });

    if (bottomRow.length < 2) {
      bottomRow = buttons.slice(-5);
    }

    bottomRow.sort(function (a, b) {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    var first = bottomRow[0];
    var last = bottomRow[bottomRow.length - 1];

    if (button === first || first.contains(button)) {
      return "zoom-out";
    }

    if (button === last || last.contains(button)) {
      return "zoom-in";
    }

    return "";
  }

  function getAction(target) {
    if (!isMobile()) {
      return "";
    }

    var toolbar = getToolbarFromTarget(target);
    var button = getButton(target);

    if (!toolbar || !button || !toolbar.contains(button)) {
      return "";
    }

    if (
      button.closest(".fft-dflip-page-menu") ||
      button.closest(".fft-page-jump-clone-panel") ||
      button.closest(".fft-mobile-share-sheet")
    ) {
      return "";
    }

    var meta = readMeta(button);

    if (
      button.classList.contains("fft-dflip-zoomin") ||
      button.classList.contains("fft-dflip-zoom-in") ||
      meta.indexOf("zoom-in") >= 0 ||
      meta.indexOf("zoomin") >= 0 ||
      meta.indexOf("zoom in") >= 0 ||
      meta.indexOf("perbesar") >= 0
    ) {
      return "zoom-in";
    }

    if (
      button.classList.contains("fft-dflip-zoomout") ||
      button.classList.contains("fft-dflip-zoom-out") ||
      meta.indexOf("zoom-out") >= 0 ||
      meta.indexOf("zoomout") >= 0 ||
      meta.indexOf("zoom out") >= 0 ||
      meta.indexOf("perkecil") >= 0
    ) {
      return "zoom-out";
    }

    if (
      button.classList.contains("fft-dflip-prev") ||
      button.classList.contains("fft-dflip-next") ||
      meta.indexOf("sebelum") >= 0 ||
      meta.indexOf("berikut") >= 0 ||
      meta.indexOf("prev") >= 0 ||
      meta.indexOf("next") >= 0
    ) {
      return "page-change";
    }

    return detectByPosition(toolbar, button);
  }

  function handleToolbarClick(event) {
    var action = getAction(event.target);

    if (!action) {
      return;
    }

    if (action === "zoom-in") {
      zoomSteps = Math.min(8, zoomSteps + 1);
      settleAfterZoomIn();
      return;
    }

    if (action === "zoom-out") {
      zoomSteps = Math.max(0, zoomSteps - 1);
      settleAfterZoomOut();
      return;
    }

    if (action === "page-change") {
      window.setTimeout(hardResetPan, 90);
      window.setTimeout(hardResetPan, 240);
    }
  }

  function isInsideToolbar(target) {
    return !!(
      target &&
      target.closest &&
      target.closest('.fft-dflip-toolbar-wrap[data-fft-mobile-book="true"]')
    );
  }

  function handlePointerDown(event) {
    var book = getBook();
    var shell = getShell();

    if (
      !isMobile() ||
      isInsideToolbar(event.target) ||
      !book ||
      !shell ||
      book.dataset.fftMobileSingleSlide !== "true" ||
      !isZoomActive() ||
      !event.target.closest ||
      !event.target.closest("#book")
    ) {
      return;
    }

    clearSettleTimers();
    enablePan();

    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    baseX = panX;
    baseY = panY;

    shell.classList.add("is-dragging");

    try {
      shell.setPointerCapture(event.pointerId);
    } catch (error) {}

    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!dragging || pointerId !== event.pointerId) {
      return;
    }

    applyPan(
      baseX + (event.clientX - startX),
      baseY + (event.clientY - startY)
    );

    event.preventDefault();
  }

  function stopDragging(event) {
    var shell = getShell();

    if (!dragging) {
      return;
    }

    dragging = false;
    pointerId = null;

    if (shell) {
      shell.classList.remove("is-dragging");

      try {
        if (event && event.pointerId !== undefined) {
          shell.releasePointerCapture(event.pointerId);
        }
      } catch (error) {}
    }
  }

  document.addEventListener("click", handleToolbarClick, true);

  document.addEventListener("pointerdown", handlePointerDown, true);
  document.addEventListener("pointermove", handlePointerMove, { capture: true, passive: false });
  document.addEventListener("pointerup", stopDragging, true);
  document.addEventListener("pointercancel", stopDragging, true);

  window.addEventListener("resize", function () {
    if (!isMobile()) {
      hardResetPan();
      return;
    }

    if (isZoomActive()) {
      enablePan();
      applyPan(panX, panY);
    }
  }, { passive: true });

  window.addEventListener("orientationchange", function () {
    window.setTimeout(hardResetPan, 160);
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopDragging();
    }
  }, false);
}());
/* /FFT_VIEWER_MOBILE_ZOOM_DRAG_PAN_20260604 */

/* FFT_VIEWER_MOBILE_DESKTOP_RESET_BRIDGE_20260604 */
(function () {
  var QUERY = "(max-width: 760px)";
  var scanTimer = null;
  var scanCount = 0;

  function isMobile() {
    return !!(
      window.matchMedia &&
      window.matchMedia(QUERY).matches
    );
  }

  function getMeta(element) {
    return [
      element.id || "",
      element.getAttribute("class") || "",
      element.getAttribute("aria-label") || "",
      element.getAttribute("title") || "",
      element.textContent || ""
    ].join(" ").toLowerCase();
  }

  function isResetZoomButton(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    var meta = getMeta(element);

    if (meta.indexOf("share") >= 0 || meta.indexOf("menu") >= 0) {
      return false;
    }

    return (
      meta.indexOf("reset zoom") >= 0 ||
      meta.indexOf("reset-zoom") >= 0 ||
      meta.indexOf("zoom-reset") >= 0 ||
      meta.indexOf("reset zoom preview brosur") >= 0 ||
      element.classList.contains("fft-dflip-zoom-reset")
    );
  }

  function collectResetButtons() {
    var selector = [
      "button",
      "a",
      "[role='button']",
      ".fft-dflip-btn",
      ".fft-dflip-zoom-reset",
      "[class*='reset-zoom']",
      "[class*='zoom-reset']",
      "[aria-label*='Reset zoom']",
      "[aria-label*='reset zoom']",
      "[title*='Reset zoom']",
      "[title*='reset zoom']"
    ].join(",");

    return Array.prototype.slice.call(document.querySelectorAll(selector))
      .filter(isResetZoomButton);
  }

  function clearMobilePanLayer() {
    var shells = Array.prototype.slice.call(
      document.querySelectorAll(".fft-mobile-zoom-drag-pan-shell, .fft-mobile-pdf-tight-shell")
    );

    document.documentElement.classList.remove("fft-mobile-zoom-drag-pan-active");
    document.body.classList.remove("fft-mobile-zoom-drag-pan-active");

    shells.forEach(function (shell) {
      shell.classList.remove("fft-mobile-zoom-drag-pan-shell", "is-dragging");
      shell.style.removeProperty("--fft-mobile-zoom-pan-x");
      shell.style.removeProperty("--fft-mobile-zoom-pan-y");
    });
  }

  function decorateResetButton(button) {
    if (!button || button.dataset.fftMobileDesktopReset === "true") {
      return;
    }

    button.dataset.fftMobileDesktopReset = "true";
    button.classList.add("fft-mobile-desktop-reset-button");

    if (!button.textContent || !button.textContent.trim()) {
      button.textContent = "Reset Zoom";
    }

    if (!button.getAttribute("aria-label")) {
      button.setAttribute("aria-label", "Reset zoom preview brosur");
    }

    if (!button.getAttribute("title")) {
      button.setAttribute("title", "Reset Zoom");
    }

    button.addEventListener("click", function () {
      window.setTimeout(clearMobilePanLayer, 80);
      window.setTimeout(clearMobilePanLayer, 220);
      window.setTimeout(clearMobilePanLayer, 480);
    }, true);
  }

  function scanResetButtons() {
    if (!isMobile()) {
      return;
    }

    collectResetButtons().forEach(decorateResetButton);
  }

  function limitedScan() {
    scanResetButtons();

    window.clearInterval(scanTimer);
    scanCount = 0;

    scanTimer = window.setInterval(function () {
      scanCount += 1;
      scanResetButtons();

      if (scanCount >= 16) {
        window.clearInterval(scanTimer);
      }
    }, 250);
  }

  function isZoomToolbarAction(target) {
    if (!target || !target.closest) {
      return false;
    }

    var toolbar = target.closest('.fft-dflip-toolbar-wrap[data-fft-mobile-book="true"]');
    var button = target.closest("button, a, [role='button'], .fft-dflip-btn");

    if (!toolbar || !button) {
      return false;
    }

    var meta = getMeta(button);

    return (
      meta.indexOf("zoom") >= 0 ||
      button.classList.contains("fft-dflip-zoomin") ||
      button.classList.contains("fft-dflip-zoomout") ||
      button.classList.contains("fft-dflip-zoom-in") ||
      button.classList.contains("fft-dflip-zoom-out")
    );
  }

  document.addEventListener("click", function (event) {
    if (!isMobile()) {
      return;
    }

    if (isResetZoomButton(event.target.closest ? event.target.closest("button, a, [role='button'], .fft-dflip-btn") : null)) {
      window.setTimeout(clearMobilePanLayer, 80);
      window.setTimeout(clearMobilePanLayer, 220);
      window.setTimeout(clearMobilePanLayer, 480);
      return;
    }

    if (isZoomToolbarAction(event.target)) {
      window.setTimeout(limitedScan, 120);
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", limitedScan);
  } else {
    limitedScan();
  }

  window.addEventListener("resize", limitedScan, { passive: true });
  window.addEventListener("orientationchange", function () {
    window.setTimeout(limitedScan, 180);
  }, { passive: true });
}());
/* /FFT_VIEWER_MOBILE_DESKTOP_RESET_BRIDGE_20260604 */

/* FFT_VIEWER_BACKEND_LOADING_BRIDGE_20260604 */
(function () {
  var PATCH_ID = "FFT_VIEWER_BACKEND_LOADING_BRIDGE_20260604";
  var MIN_PROGRESS = 8;
  var MAX_BEFORE_READY = 94;
  var hideTimer = null;
  var fallbackTimer = null;
  var monitorTimer = null;
  var monitorCount = 0;

  var state = {
    status: "loading",
    progress: MIN_PROGRESS,
    title: "Menyiapkan brosur",
    message: "Menghubungkan data brosur dan memuat file PDF.",
    hidden: false,
    source: PATCH_ID
  };

  function clamp(value, min, max) {
    value = Number(value);

    if (!Number.isFinite(value)) {
      value = min;
    }

    return Math.max(min, Math.min(max, value));
  }

  function safeText(value, fallback) {
    if (value === undefined || value === null) {
      return fallback || "";
    }

    var text = String(value).replace(/\s+/g, " ").trim();

    return text || fallback || "";
  }

  function getCurrentBrochureTitle() {
    var brochure = window.FFT_CURRENT_BROCHURE || {};
    var title = safeText(brochure.title || brochure.seoTitle || "", "");

    if (title) {
      return title;
    }

    title = safeText(document.title, "");

    if (title) {
      return title.replace(/\s*\|\s*Fakultas Filsafat Teologi UASN\s*$/i, "");
    }

    return "Brosur Fakultas Filsafat Teologi";
  }

  function getElements() {
    var root = document.getElementById("fftBrochureLoading");

    if (!root && document.body) {
      root = document.createElement("div");
      root.id = "fftBrochureLoading";
      root.className = "fft-brochure-loading";
      root.setAttribute("role", "status");
      root.setAttribute("aria-live", "polite");
      root.setAttribute("aria-atomic", "true");
      root.setAttribute("aria-busy", "true");
      root.innerHTML = [
        '<div class="fft-brochure-loading__panel">',
        '<div class="fft-brochure-loading__topline">FFT UASN</div>',
        '<div class="fft-brochure-loading__spinner" aria-hidden="true"><span></span></div>',
        '<h2 class="fft-brochure-loading__title" data-fft-loading-title>Menyiapkan brosur</h2>',
        '<p class="fft-brochure-loading__message" data-fft-loading-message>Menghubungkan data brosur dan memuat file PDF.</p>',
        '<div class="fft-brochure-loading__bar" aria-hidden="true"><span data-fft-loading-bar></span></div>',
        '<div class="fft-brochure-loading__meta" data-fft-loading-meta>0%</div>',
        '</div>'
      ].join("");
      document.body.appendChild(root);
    }

    if (!root) {
      return null;
    }

    return {
      root: root,
      title: root.querySelector("[data-fft-loading-title]"),
      message: root.querySelector("[data-fft-loading-message]"),
      bar: root.querySelector("[data-fft-loading-bar]"),
      meta: root.querySelector("[data-fft-loading-meta]")
    };
  }

  function render() {
    var elements = getElements();

    if (!elements) {
      return;
    }

    var progress = clamp(state.progress, 0, 100);

    elements.root.classList.toggle("is-hidden", !!state.hidden);
    elements.root.setAttribute("aria-busy", state.hidden ? "false" : "true");

    if (document.body) {
      document.body.classList.toggle("fft-brochure-loading-active", !state.hidden);
    }

    if (elements.title) {
      elements.title.textContent = state.title;
    }

    if (elements.message) {
      elements.message.textContent = state.message;
    }

    if (elements.bar) {
      elements.bar.style.setProperty("--fft-brochure-loading-progress", Math.round(progress) + "%");
    }

    if (elements.meta) {
      elements.meta.textContent = Math.round(progress) + "%";
    }
  }

  function update(input) {
    input = input || {};

    if (input.status) {
      state.status = safeText(input.status, state.status);
    }

    if (input.title) {
      state.title = safeText(input.title, state.title);
    }

    if (input.message) {
      state.message = safeText(input.message, state.message);
    }

    if (input.source) {
      state.source = safeText(input.source, state.source);
    }

    if (input.progress !== undefined) {
      var max = state.status === "ready" ? 100 : MAX_BEFORE_READY;
      state.progress = clamp(input.progress, 0, max);
    }

    if (state.status === "backend") {
      state.title = safeText(input.title, "Mengambil data brosur");
      state.message = safeText(input.message, "Menghubungkan data dari admin dashboard.");
    }

    if (state.status === "pdf") {
      state.title = safeText(input.title, getCurrentBrochureTitle());
      state.message = safeText(input.message, "Memuat halaman PDF dan menyiapkan tampilan brosur.");
    }

    if (state.status === "error") {
      state.title = safeText(input.title, "Brosur belum bisa dimuat");
      state.message = safeText(input.message, "Periksa koneksi atau data brosur dari backend.");
      state.progress = clamp(input.progress === undefined ? 100 : input.progress, 0, 100);
    }

    if (state.status === "ready") {
      state.title = safeText(input.title, getCurrentBrochureTitle());
      state.message = safeText(input.message, "Brosur siap dibaca.");
      state.progress = 100;
      render();

      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, input.delay === undefined ? 260 : Number(input.delay));
      return;
    }

    state.hidden = false;
    render();
  }

  function show(input) {
    state.hidden = false;
    update(input || {
      status: "loading",
      progress: state.progress || MIN_PROGRESS
    });
  }

  function hide() {
    state.hidden = true;
    state.progress = 100;
    render();
  }

  function ready(input) {
    update(Object.assign({
      status: "ready",
      progress: 100
    }, input || {}));
  }

  function error(input) {
    update(Object.assign({
      status: "error",
      progress: 100
    }, input || {}));
  }

  function setProgress(progress, message) {
    update({
      status: state.status || "loading",
      progress: progress,
      message: message || state.message
    });
  }

  function bindPromise(promiseOrFactory, options) {
    options = options || {};

    show({
      status: options.status || "backend",
      title: options.title || "Mengambil data brosur",
      message: options.message || "Menghubungkan data dari admin dashboard.",
      progress: options.progress || 18,
      source: "backend"
    });

    var promise = typeof promiseOrFactory === "function"
      ? promiseOrFactory()
      : promiseOrFactory;

    return Promise.resolve(promise)
      .then(function (result) {
        setProgress(options.doneProgress || 48, options.doneMessage || "Data brosur diterima. Menyiapkan file PDF.");
        return result;
      })
      .catch(function (err) {
        error({
          message: options.errorMessage || "Data brosur belum berhasil dimuat dari backend.",
          source: "backend"
        });

        throw err;
      });
  }

  function hasVisiblePdfPage() {
    var book = document.getElementById("book");

    if (!book) {
      return false;
    }

    var candidates = book.querySelectorAll("canvas, img, .page, .df-page, .stf__item");

    for (var index = 0; index < candidates.length; index += 1) {
      var item = candidates[index];
      var rect = item.getBoundingClientRect();

      if (rect.width > 80 && rect.height > 120) {
        return true;
      }
    }

    return false;
  }

  function startMonitor() {
    window.clearInterval(monitorTimer);
    monitorCount = 0;

    monitorTimer = window.setInterval(function () {
      monitorCount += 1;

      if (state.hidden) {
        window.clearInterval(monitorTimer);
        return;
      }

      if (monitorCount === 2) {
        setProgress(20, "Menyiapkan data brosur.");
      }

      if (monitorCount === 5) {
        setProgress(38, "Mengambil file PDF brosur.");
      }

      if (monitorCount === 9) {
        setProgress(62, "Merender halaman brosur.");
      }

      if (monitorCount === 14) {
        setProgress(82, "Merapikan tampilan viewer.");
      }

      if (hasVisiblePdfPage()) {
        ready({
          message: "Brosur siap dibaca.",
          delay: 220
        });
        window.clearInterval(monitorTimer);
        return;
      }

      if (monitorCount >= 44) {
        ready({
          message: "Viewer siap. PDF akan terus diproses jika jaringan lambat.",
          delay: 340
        });
        window.clearInterval(monitorTimer);
      }
    }, 250);
  }

  function applyBackendInitialState() {
    var backendState = window.FFT_BROCHURE_BACKEND_LOADING || window.FFT_BROCHURE_LOADING_STATE;

    if (backendState && typeof backendState === "object") {
      update(Object.assign({
        source: "backend"
      }, backendState));
      return;
    }

    show({
      status: "backend",
      title: "Menyiapkan brosur",
      message: "Menghubungkan data brosur dan memuat file PDF.",
      progress: MIN_PROGRESS
    });
  }

  window.FFT_BROCHURE_LOADING_BRIDGE = {
    version: PATCH_ID,
    schema: {
      status: "loading | backend | pdf | ready | error",
      progress: "0 sampai 100",
      title: "Judul loading",
      message: "Pesan loading",
      source: "backend | viewer | admin"
    },
    show: show,
    hide: hide,
    ready: ready,
    error: error,
    update: update,
    setLoading: update,
    setProgress: setProgress,
    bindPromise: bindPromise,
    getState: function () {
      return Object.assign({}, state);
    }
  };

  document.addEventListener("fft:brochure-resolved", function (event) {
    var brochure = event.detail && event.detail.brochure;

    update({
      status: "pdf",
      title: brochure && brochure.title ? brochure.title : getCurrentBrochureTitle(),
      message: "Data brosur siap. Memuat halaman PDF.",
      progress: 46,
      source: "seo-bridge"
    });
  });

  document.addEventListener("fft:brochure-loading", function (event) {
    update(Object.assign({
      status: "loading",
      source: "event"
    }, event.detail || {}));
  });

  document.addEventListener("fft:brochure-progress", function (event) {
    event = event || {};
    setProgress(
      event.detail && event.detail.progress,
      event.detail && event.detail.message
    );
  });

  document.addEventListener("fft:brochure-ready", function (event) {
    ready(event.detail || {});
  });

  document.addEventListener("fft:brochure-error", function (event) {
    error(event.detail || {});
  });

  function boot() {
    applyBackendInitialState();
    render();
    startMonitor();

    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      if (!state.hidden) {
        ready({
          message: "Viewer siap. Menyelesaikan tampilan brosur.",
          delay: 360
        });
      }
    }, 14000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", function () {
    if (!state.hidden) {
      setProgress(Math.max(state.progress, 72), "Menyelesaikan tampilan brosur.");
    }

    window.setTimeout(function () {
      if (hasVisiblePdfPage()) {
        ready({
          delay: 220
        });
      }
    }, 300);
  }, { passive: true });
}());
/* /FFT_VIEWER_BACKEND_LOADING_BRIDGE_20260604 */

/* FFT_VIEWER_BACKEND_LOADING_READY_GATE_20260604 */
(function () {
  var PATCH_ID = "FFT_VIEWER_BACKEND_LOADING_READY_GATE_20260604";
  var monitorTimer = null;
  var monitorCount = 0;
  var bridgePatched = false;

  function getRoot() {
    return document.getElementById("fftBrochureLoading");
  }

  function getBook() {
    return document.getElementById("book");
  }

  function isVisibleElement(element) {
    if (!element || !element.getBoundingClientRect) {
      return false;
    }

    var rect = element.getBoundingClientRect();

    if (rect.width < 80 || rect.height < 120) {
      return false;
    }

    var style = window.getComputedStyle ? window.getComputedStyle(element) : null;

    if (style && (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0)) {
      return false;
    }

    return true;
  }

  function hasRenderedPdfContent() {
    var book = getBook();

    if (!book) {
      return false;
    }

    var canvasList = Array.prototype.slice.call(book.querySelectorAll("canvas"));

    for (var canvasIndex = 0; canvasIndex < canvasList.length; canvasIndex += 1) {
      var canvas = canvasList[canvasIndex];

      if (
        isVisibleElement(canvas) &&
        (canvas.width || 0) > 120 &&
        (canvas.height || 0) > 160
      ) {
        return true;
      }
    }

    var imageList = Array.prototype.slice.call(book.querySelectorAll("img"));

    for (var imageIndex = 0; imageIndex < imageList.length; imageIndex += 1) {
      var image = imageList[imageIndex];

      if (
        isVisibleElement(image) &&
        ((image.naturalWidth || 0) > 120 || (image.width || 0) > 120) &&
        ((image.naturalHeight || 0) > 160 || (image.height || 0) > 160)
      ) {
        return true;
      }
    }

    return false;
  }

  function setLoadingText(title, message, progress) {
    var root = getRoot();

    if (!root) {
      return;
    }

    var titleNode = root.querySelector("[data-fft-loading-title]");
    var messageNode = root.querySelector("[data-fft-loading-message]");
    var barNode = root.querySelector("[data-fft-loading-bar]");
    var metaNode = root.querySelector("[data-fft-loading-meta]");

    if (titleNode) {
      titleNode.textContent = title || "Menyiapkan halaman brosur";
    }

    if (messageNode) {
      messageNode.textContent = message || "Halaman PDF sedang dirender. Loading tetap aktif sampai brosur benar-benar siap.";
    }

    if (barNode) {
      barNode.style.setProperty("--fft-brochure-loading-progress", Math.round(progress || 94) + "%");
    }

    if (metaNode) {
      metaNode.textContent = Math.round(progress || 94) + "%";
    }
  }

  function showManagedLoading() {
    var root = getRoot();

    document.documentElement.classList.add("fft-brochure-loading-managed");

    if (document.body) {
      document.body.classList.add("fft-brochure-loading-managed");
      document.body.classList.add("fft-brochure-loading-active");
    }

    if (!root) {
      return;
    }

    root.classList.add("is-gated");
    root.classList.remove("is-hidden");
    root.setAttribute("aria-busy", "true");

    setLoadingText(
      "Menyiapkan halaman brosur",
      "Halaman PDF sedang dirender. Loading tetap aktif sampai brosur benar-benar siap.",
      94
    );
  }

  function hideManagedLoading() {
    var root = getRoot();

    if (root) {
      root.classList.remove("is-gated");
      root.classList.add("is-hidden");
      root.setAttribute("aria-busy", "false");
    }

    if (document.body) {
      document.body.classList.remove("fft-brochure-loading-active");
    }
  }

  function shouldHideNativeNode(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    var root = getRoot();
    var book = getBook();

    if (root && (element === root || root.contains(element))) {
      return false;
    }

    if (element === document.body || element === document.documentElement) {
      return false;
    }

    if (element.tagName && /^(SCRIPT|STYLE|LINK|META)$/i.test(element.tagName)) {
      return false;
    }

    if (book && element === book) {
      return false;
    }

    var text = "";

    Array.prototype.slice.call(element.childNodes || []).forEach(function (node) {
      if (node.nodeType === 3) {
        text += " " + node.nodeValue;
      }
    });

    text = text.replace(/\s+/g, " ").trim().toLowerCase();

    if (!text) {
      return false;
    }

    return (
      text.indexOf("memuat brosur") >= 0 ||
      text.indexOf("memuat brochure") >= 0 ||
      text.indexOf("loading brochure") >= 0 ||
      text.indexOf("loading brosur") >= 0
    );
  }

  function hideNativeLoadingText() {
    var selectors = [
      "#loading",
      "[data-viewer-loading]",
      ".viewer-loading",
      ".brochure-loading",
      ".dflip-loading",
      ".df-loading",
      ".loading"
    ];

    selectors.forEach(function (selector) {
      Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (node) {
        var root = getRoot();

        if (root && (node === root || root.contains(node))) {
          return;
        }

        node.setAttribute("data-fft-native-loading-hidden", "true");
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function (node) {
      if (shouldHideNativeNode(node)) {
        node.setAttribute("data-fft-native-loading-hidden", "true");
      }
    });
  }

  function gateLoading() {
    hideNativeLoadingText();

    if (hasRenderedPdfContent()) {
      hideManagedLoading();
      return true;
    }

    showManagedLoading();
    return false;
  }

  function patchBridge() {
    var bridge = window.FFT_BROCHURE_LOADING_BRIDGE;

    if (!bridge || bridgePatched || bridge.__fftReadyGatePatched === PATCH_ID) {
      return;
    }

    bridgePatched = true;
    bridge.__fftReadyGatePatched = PATCH_ID;

    var originalReady = bridge.ready;
    var originalHide = bridge.hide;

    bridge.ready = function (input) {
      input = input || {};

      if (input.force === true || hasRenderedPdfContent()) {
        return originalReady.call(bridge, input);
      }

      showManagedLoading();

      if (typeof bridge.update === "function") {
        bridge.update({
          status: "pdf",
          progress: 94,
          title: input.title || "Menyiapkan halaman brosur",
          message: input.message || "Halaman PDF sedang dirender. Loading tetap aktif sampai brosur benar-benar siap.",
          source: PATCH_ID
        });
      }

      return bridge.getState ? bridge.getState() : null;
    };

    bridge.hide = function (input) {
      input = input || {};

      if (input.force === true || hasRenderedPdfContent()) {
        return originalHide.call(bridge);
      }

      showManagedLoading();

      return bridge.getState ? bridge.getState() : null;
    };
  }

  function startMonitor() {
    window.clearInterval(monitorTimer);
    monitorCount = 0;

    monitorTimer = window.setInterval(function () {
      monitorCount += 1;

      patchBridge();

      var ready = gateLoading();

      if (ready) {
        window.clearInterval(monitorTimer);
        return;
      }

      if (monitorCount === 12) {
        setLoadingText(
          "Merender halaman brosur",
          "File PDF sudah diproses. Viewer sedang menyiapkan halaman pertama.",
          88
        );
      }

      if (monitorCount === 28) {
        setLoadingText(
          "Menyelesaikan tampilan brosur",
          "Loading tetap ditahan agar tidak kembali ke teks bawaan viewer.",
          94
        );
      }

      if (monitorCount >= 240) {
        setLoadingText(
          "Brosur masih diproses",
          "Koneksi atau file PDF lambat. Loading tetap aktif sampai halaman benar-benar tampil.",
          94
        );
      }
    }, 250);
  }

  document.addEventListener("fft:brochure-ready", function () {
    window.setTimeout(gateLoading, 40);
    window.setTimeout(gateLoading, 180);
    window.setTimeout(gateLoading, 420);
  }, true);

  document.addEventListener("fft:brochure-resolved", function () {
    window.setTimeout(gateLoading, 80);
  }, true);

  window.addEventListener("load", function () {
    window.setTimeout(gateLoading, 120);
    window.setTimeout(gateLoading, 420);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      patchBridge();
      startMonitor();
    });
  } else {
    patchBridge();
    startMonitor();
  }

  window.FFT_BROCHURE_LOADING_READY_GATE = {
    version: PATCH_ID,
    hasRenderedPdfContent: hasRenderedPdfContent,
    gate: gateLoading,
    hideNativeLoadingText: hideNativeLoadingText
  };
}());
/* /FFT_VIEWER_BACKEND_LOADING_READY_GATE_20260604 */
