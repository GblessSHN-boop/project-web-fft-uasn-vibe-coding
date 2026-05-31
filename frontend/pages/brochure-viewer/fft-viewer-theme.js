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

  function createToolbar() {
    var existing = document.querySelector(".fft-dflip-toolbar-wrap");

    if (existing) {
      return existing;
    }

    var nativeRoot = hideNativeControls();

    var wrap = document.createElement("div");
    wrap.className = "fft-dflip-toolbar-wrap";

    var toolbar = document.createElement("div");
    toolbar.className = "fft-dflip-toolbar";
    toolbar.setAttribute("aria-label", "Toolbar preview brosur");

    var pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "fft-dflip-btn fft-dflip-page-btn";
    pageButton.title = "Pilih halaman";
    pageButton.setAttribute("aria-label", "Pilih halaman");
    pageButton.innerHTML = '<span class="fft-dflip-page-label">1 / 8</span>';

    var pageMenu = document.createElement("div");
    pageMenu.className = "fft-dflip-page-menu";

    var gridButton = makeButton("fft-dflip-grid", "Toggle Thumbnails", "grid");
    var zoomInButton = makeButton("fft-dflip-zoomin", "Zoom In", "plus");
    var zoomOutButton = makeButton("fft-dflip-zoomout", "Zoom Out", "minus");
    var fullscreenButton = makeButton("fft-dflip-fullscreen", "Toggle Fullscreen", "fullscreen");
    var shareButton = makeButton("fft-dflip-share", "Share", "share");
    var moreButton = makeButton("fft-dflip-more", "More", "more");

    var moreMenu = document.createElement("div");
    moreMenu.className = "fft-dflip-more-menu";

    var downloadLink = document.createElement("a");
    downloadLink.className = "fft-dflip-menu-item";
    downloadLink.href = downloadPdf;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener";
    downloadLink.download = "";
    downloadLink.innerHTML = icon("download") + "<span>Download PDF File</span>";

    moreMenu.appendChild(downloadLink);
    moreMenu.appendChild(makeMenuItem("Single Page Mode", function () {
      showToast("Mode satu halaman belum aktif");
    }, "grid"));
    moreMenu.appendChild(makeMenuItem("Goto First Page", function () {
      goToPage(1);
    }, "first"));
    moreMenu.appendChild(makeMenuItem("Goto Last Page", function () {
      goToPage(getPageState().total);
    }, "last"));
    moreMenu.appendChild(makeMenuItem("Turn on/off Sound", function () {
      showToast("Suara belum aktif");
    }, "sound"));

    pageButton.addEventListener("click", function (event) {
      event.stopPropagation();
      rebuildPageMenu(pageMenu);
      toggleMenu(pageMenu, pageButton);
    });

    gridButton.addEventListener("click", function (event) {
      event.stopPropagation();
      rebuildPageMenu(pageMenu);
      toggleMenu(pageMenu, gridButton);
    });

    zoomInButton.addEventListener("click", function () {
      applyZoom(zoom + 0.1);
    });

    zoomOutButton.addEventListener("click", function () {
      applyZoom(zoom - 0.1);
    });

    fullscreenButton.addEventListener("click", function () {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        return;
      }

      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });

    shareButton.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({
          title: document.title || "Preview E Brochure",
          url: window.location.href
        }).catch(function () {});
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          showToast("Link disalin");
        });
        return;
      }

      showToast("Salin link dari address bar");
    });

    moreButton.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleMenu(moreMenu, moreButton);
    });

    toolbar.appendChild(pageButton);
    toolbar.appendChild(gridButton);
    toolbar.appendChild(zoomInButton);
    toolbar.appendChild(zoomOutButton);
    toolbar.appendChild(fullscreenButton);
    toolbar.appendChild(shareButton);
    toolbar.appendChild(moreButton);
    toolbar.appendChild(pageMenu);
    toolbar.appendChild(moreMenu);

    var toast = document.createElement("div");
    toast.className = "fft-dflip-toast";
    toast.textContent = "Siap";

    wrap.appendChild(toolbar);
    wrap.appendChild(toast);

    if (nativeRoot) {
      nativeRoot.insertAdjacentElement("afterend", wrap);
    } else {
      document.body.appendChild(wrap);
    }

    document.addEventListener("click", closeMenus);

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        clickNav("previous");
      }

      if (event.key === "ArrowRight") {
        clickNav("next");
      }

      if (event.key === "Escape") {
        closeMenus();
      }
    });

    return wrap;
  }

  function syncToolbar() {
    var wrap = document.querySelector(".fft-dflip-toolbar-wrap");

    if (!wrap) {
      return;
    }

    var state = getPageState();
    var label = wrap.querySelector(".fft-dflip-page-label");
    var zoomIn = wrap.querySelector(".fft-dflip-zoomin");
    var zoomOut = wrap.querySelector(".fft-dflip-zoomout");
    var pageMenu = wrap.querySelector(".fft-dflip-page-menu");

    if (label) {
      label.textContent = state.current + " / " + state.total;
    }

    if (zoomIn) {
      zoomIn.classList.toggle("is-disabled", zoom >= 1.59);
    }

    if (zoomOut) {
      zoomOut.classList.toggle("is-disabled", zoom <= 0.76);
    }

    if (pageMenu && pageMenu.classList.contains("is-open")) {
      rebuildPageMenu(pageMenu);
      pageMenu.classList.add("is-open");
    }
  }

  function boot() {
    document.body.classList.add("fft-standalone-viewer");

    rebuildHeader();
    hideNativeControls();
    createToolbar();
    syncToolbar();

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
