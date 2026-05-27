/* FFT_SIMULASI_MOBILE_CHECKPOINT_20260527
   Mobile sticky checkpoint untuk Simulasi Pendaftaran Offline.
   Membaca data step yang sudah ada di halaman.
*/
(function () {
  "use strict";

  var storageKey = "fft:simulasi-offline:checkpoint:v1";
  var completed = new Set();
  var elements = {};
  var steps = [];

  var copy = {
    id: {
      label: "Checkpoint Simulasi",
      completeWord: "selesai",
      summary: "Ringkasan",
      next: "Lanjut",
      sheetLabel: "Ringkasan Progress",
      sheetTitle: "Checkpoint Simulasi",
      close: "Tutup",
      done: "Selesai",
      pending: "Belum",
      mark: "Tandai selesai",
      completed: "Selesai",
      allDone: "Semua selesai"
    },
    en: {
      label: "Simulation Checkpoint",
      completeWord: "complete",
      summary: "Summary",
      next: "Next",
      sheetLabel: "Progress Summary",
      sheetTitle: "Simulation Checkpoint",
      close: "Close",
      done: "Done",
      pending: "Pending",
      mark: "Mark complete",
      completed: "Completed",
      allDone: "All complete"
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

  function t(key) {
    var lang = getLang();
    return (copy[lang] && copy[lang][key]) || copy.id[key] || key;
  }


  function isMobileCheckpointViewport() {
    return window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
  }

  function isOfflinePage() {
    return Boolean(document.querySelector(".offline-simulation-page, .offline-flow, #offlineFlow"));
  }

  function loadCompleted() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      completed = new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch (error) {
      completed = new Set();
    }
  }

  function saveCompleted() {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)));
  }

  function getStepTitle(card) {
    var heading = card.querySelector("h3");
    if (!heading) return "";

    return getLang() === "en"
      ? heading.getAttribute("data-page-en") || heading.textContent.trim()
      : heading.getAttribute("data-page-id") || heading.textContent.trim();
  }

  function collectSteps() {
    steps = Array.from(document.querySelectorAll(".offline-step-card[data-checkpoint-step]")).map(function (card) {
      var id = String(card.getAttribute("data-checkpoint-step") || "").trim();

      return {
        id: id,
        card: card,
        button: document.querySelector('[data-step-complete="' + id + '"]'),
        nav: document.querySelector('[data-step-target="' + id + '"]')
      };
    }).filter(function (step) {
      return step.id;
    });
  }

  function createShell() {
    if (document.querySelector(".offline-mobile-checkpoint")) return;

    var bar = document.createElement("div");
    bar.className = "offline-mobile-checkpoint";
    bar.innerHTML = [
      '<div class="offline-mobile-checkpoint__main">',
        '<p class="offline-mobile-checkpoint__label"></p>',
        '<div class="offline-mobile-checkpoint__count">',
          '<span class="offline-mobile-checkpoint__done">0 / 0</span>',
          '<span class="offline-mobile-checkpoint__percent">0%</span>',
        '</div>',
      '</div>',
      '<div class="offline-mobile-checkpoint__actions">',
        '<button type="button" class="offline-mobile-checkpoint__summary"></button>',
        '<button type="button" class="offline-mobile-checkpoint__next"></button>',
      '</div>',
      '<div class="offline-mobile-checkpoint__bar" aria-hidden="true"><span></span></div>'
    ].join("");

    var sheet = document.createElement("div");
    sheet.className = "offline-mobile-checkpoint-sheet";
    sheet.setAttribute("aria-hidden", "true");
    sheet.innerHTML = [
      '<div class="offline-mobile-checkpoint-sheet__overlay"></div>',
      '<section class="offline-mobile-checkpoint-sheet__panel" role="dialog" aria-modal="true" aria-label="Checkpoint">',
        '<div class="offline-mobile-checkpoint-sheet__handle"></div>',
        '<div class="offline-mobile-checkpoint-sheet__head">',
          '<div>',
            '<p></p>',
            '<h3></h3>',
          '</div>',
          '<button type="button" class="offline-mobile-checkpoint-sheet__close" aria-label="Close">×</button>',
        '</div>',
        '<div class="offline-mobile-checkpoint-sheet__list"></div>',
      '</section>'
    ].join("");

    document.body.appendChild(bar);
    document.body.appendChild(sheet);

    elements.bar = bar;
    elements.sheet = sheet;
    elements.label = bar.querySelector(".offline-mobile-checkpoint__label");
    elements.done = bar.querySelector(".offline-mobile-checkpoint__done");
    elements.percent = bar.querySelector(".offline-mobile-checkpoint__percent");
    elements.progress = bar.querySelector(".offline-mobile-checkpoint__bar span");
    elements.summary = bar.querySelector(".offline-mobile-checkpoint__summary");
    elements.next = bar.querySelector(".offline-mobile-checkpoint__next");
    elements.sheetLabel = sheet.querySelector(".offline-mobile-checkpoint-sheet__head p");
    elements.sheetTitle = sheet.querySelector(".offline-mobile-checkpoint-sheet__head h3");
    elements.sheetList = sheet.querySelector(".offline-mobile-checkpoint-sheet__list");
    elements.sheetClose = sheet.querySelector(".offline-mobile-checkpoint-sheet__close");
    elements.sheetOverlay = sheet.querySelector(".offline-mobile-checkpoint-sheet__overlay");

    elements.summary.addEventListener("click", openSheet);
    elements.next.addEventListener("click", goNext);
    elements.sheetClose.addEventListener("click", closeSheet);
    elements.sheetOverlay.addEventListener("click", closeSheet);
  }

  function openSheet() {
    document.body.classList.add("fft-offline-mobile-sheet-open");
    elements.sheet.setAttribute("aria-hidden", "false");
    render();
  }

  function closeSheet() {
    document.body.classList.remove("fft-offline-mobile-sheet-open");
    elements.sheet.setAttribute("aria-hidden", "true");
  }

  function scrollToStep(id) {
    var step = steps.find(function (item) {
      return item.id === String(id);
    });

    if (!step || !step.card) return;

    closeSheet();

    var offset = 92;
    var top = step.card.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  function goNext() {
    var next = steps.find(function (step) {
      return !completed.has(step.id);
    });

    if (!next) {
      scrollToStep(steps[0] && steps[0].id);
      return;
    }

    scrollToStep(next.id);
  }

  function toggleStep(id) {
    id = String(id);

    if (completed.has(id)) {
      completed.delete(id);
    } else {
      completed.add(id);
    }

    saveCompleted();
    render();
  }

  function bindExistingButtons() {
    steps.forEach(function (step) {
      if (step.button && step.button.dataset.mobileCheckpointBound !== "1") {
        step.button.dataset.mobileCheckpointBound = "1";

        step.button.addEventListener("click", function () {
          toggleStep(step.id);
        });
      }

      if (step.nav && step.nav.dataset.mobileCheckpointBound !== "1") {
        step.nav.dataset.mobileCheckpointBound = "1";

        step.nav.addEventListener("click", function () {
          scrollToStep(step.id);
        });
      }
    });
  }

  function renderExistingPage(done, total, percent) {
    var count = document.getElementById("offlineCheckpointCount");
    var bar = document.getElementById("offlineCheckpointBar");

    if (count) count.textContent = String(done);
    if (bar) bar.style.width = percent + "%";

    steps.forEach(function (step) {
      var isDone = completed.has(step.id);

      step.card.classList.toggle("is-mobile-complete", isDone);

      if (step.nav) {
        step.nav.classList.toggle("is-complete", isDone);
      }

      if (step.button) {
        step.button.textContent = isDone ? t("completed") : t("mark");
      }
    });
  }

  function renderSheetList() {
    if (!elements.sheetList) return;

    elements.sheetList.innerHTML = "";

    steps.forEach(function (step, index) {
      var item = document.createElement("button");
      var isDone = completed.has(step.id);

      item.type = "button";
      item.className = "offline-mobile-checkpoint-sheet__item" + (isDone ? " is-complete" : "");
      item.innerHTML = [
        '<span class="offline-mobile-checkpoint-sheet__number">' + String(index + 1).padStart(2, "0") + '</span>',
        '<span class="offline-mobile-checkpoint-sheet__title"></span>',
        '<span class="offline-mobile-checkpoint-sheet__state"></span>'
      ].join("");

      item.querySelector(".offline-mobile-checkpoint-sheet__title").textContent = getStepTitle(step.card);
      item.querySelector(".offline-mobile-checkpoint-sheet__state").textContent = isDone ? t("done") : t("pending");

      item.addEventListener("click", function () {
        scrollToStep(step.id);
      });

      elements.sheetList.appendChild(item);
    });
  }

  function render() {
    if (!steps.length) return;

    var total = steps.length;
    var done = steps.filter(function (step) {
      return completed.has(step.id);
    }).length;
    var percent = total ? Math.round((done / total) * 100) : 0;

    document.body.classList.add("fft-offline-mobile-checkpoint-ready");

    elements.label.textContent = t("label");
    elements.done.textContent = done + " / " + total + " " + t("completeWord");
    elements.percent.textContent = percent + "%";
    elements.progress.style.width = percent + "%";
    elements.summary.textContent = t("summary");
    elements.next.textContent = done === total ? t("allDone") : t("next");

    elements.sheetLabel.textContent = t("sheetLabel");
    elements.sheetTitle.textContent = t("sheetTitle");

    renderExistingPage(done, total, percent);
    renderSheetList();
  }

  function boot() {
    if (!isOfflinePage()) return;
    if (!isMobileCheckpointViewport()) return;

    loadCompleted();
    collectSteps();
    createShell();
    bindExistingButtons();
    render();

    setTimeout(render, 120);
    setTimeout(render, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);

  document.addEventListener("click", function (event) {
    var langButton = event.target && event.target.closest
      ? event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn")
      : null;

    if (!langButton) return;

    setTimeout(render, 80);
    setTimeout(render, 260);
  }, true);
}());

/* FFT_SIMULASI_CHECKPOINT_AUTO_HIDE_BLUR_20260527
   Auto hide sticky checkpoint jika card utama Checkpoint Simulasi terlihat.
*/
(function () {
  "use strict";

  var ticking = false;
  var observerStarted = false;
  var sourceCard = null;

  function q(selector) {
    return document.querySelector(selector);
  }

  function findSourceCard() {
    if (sourceCard && document.body.contains(sourceCard)) {
      return sourceCard;
    }

    var byClass = q(".offline-checkpoint-card");
    if (byClass) {
      sourceCard = byClass;
      return sourceCard;
    }

    var count = document.getElementById("offlineCheckpointCount");
    if (count) {
      sourceCard = count.closest(".offline-checkpoint-card, section, article, div");
      if (sourceCard) return sourceCard;
    }

    var candidates = Array.prototype.slice.call(document.querySelectorAll("section, article, div"));
    sourceCard = candidates.find(function (el) {
      var text = String(el.textContent || "").replace(/\s+/g, " ").trim();

      return /CHECKPOINT SIMULASI|Simulation Checkpoint|Checkpoint Simulasi/i.test(text) &&
        /0\s*\/\s*6|1\s*\/\s*6|2\s*\/\s*6|3\s*\/\s*6|4\s*\/\s*6|5\s*\/\s*6|6\s*\/\s*6/i.test(text);
    }) || null;

    return sourceCard;
  }

  function visiblePixels(el) {
    if (!el) return 0;

    var rect = el.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    var top = Math.max(rect.top, 0);
    var bottom = Math.min(rect.bottom, viewportHeight);

    return Math.max(0, bottom - top);
  }

  function isMainCheckpointVisible() {
    var card = findSourceCard();

    if (!card) return false;

    var pixels = visiblePixels(card);
    var rect = card.getBoundingClientRect();
    var need = Math.min(130, Math.max(70, rect.height * 0.18));

    return pixels >= need;
  }

  function isStepVisible() {
    var steps = Array.prototype.slice.call(document.querySelectorAll(".offline-step-card[data-checkpoint-step]"));

    return steps.some(function (card) {
      var pixels = visiblePixels(card);

      return pixels >= 90;
    });
  }

  function updateStickyCheckpoint() {
    ticking = false;

    var sticky = q(".offline-mobile-checkpoint");
    if (!sticky) return;

    var show = !isMainCheckpointVisible() && isStepVisible();

    sticky.classList.toggle("is-visible", show);
    sticky.classList.toggle("is-hidden", !show);
    sticky.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateStickyCheckpoint);
  }

  function startObserver() {
    if (observerStarted) return;

    var card = findSourceCard();
    if (!card || !("IntersectionObserver" in window)) return;

    observerStarted = true;

    var observer = new IntersectionObserver(function () {
      requestUpdate();
    }, {
      root: null,
      threshold: [0, 0.08, 0.18, 0.28, 0.45, 0.65, 1]
    });

    observer.observe(card);

    document.querySelectorAll(".offline-step-card[data-checkpoint-step]").forEach(function (step) {
      observer.observe(step);
    });
  }

  function boot() {
    startObserver();
    requestUpdate();

    setTimeout(function () {
      startObserver();
      requestUpdate();
    }, 120);

    setTimeout(function () {
      startObserver();
      requestUpdate();
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  document.addEventListener("click", function () {
    setTimeout(requestUpdate, 40);
    setTimeout(requestUpdate, 220);
  }, true);
}());

/* FFT_SIMULASI_SUMMARY_SHEET_SCROLL_LOCK_20260527
   Pastikan panel Ringkasan Progress bisa scroll sendiri di mobile.
*/
(function () {
  "use strict";

  function bindSummarySheetScroll() {
    var panel = document.querySelector(".offline-mobile-checkpoint-sheet__panel");

    if (!panel || panel.dataset.fftSummaryScrollBound === "1") return;

    panel.dataset.fftSummaryScrollBound = "1";

    panel.addEventListener("touchmove", function (event) {
      event.stopPropagation();
    }, { passive: true });

    panel.addEventListener("wheel", function (event) {
      event.stopPropagation();
    }, { passive: true });
  }

  function refreshSheetPosition() {
    bindSummarySheetScroll();

    var panel = document.querySelector(".offline-mobile-checkpoint-sheet__panel");

    if (!panel) return;

    if (document.body.classList.contains("fft-offline-mobile-sheet-open")) {
      panel.style.bottom = "calc(76px + env(safe-area-inset-bottom, 0px))";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshSheetPosition);
  } else {
    refreshSheetPosition();
  }

  window.addEventListener("load", refreshSheetPosition);
  window.addEventListener("pageshow", refreshSheetPosition);
  window.addEventListener("resize", refreshSheetPosition);

  document.addEventListener("click", function () {
    setTimeout(refreshSheetPosition, 40);
    setTimeout(refreshSheetPosition, 180);
  }, true);
}());

/* FFT_SIMULASI_STEP_COMPLETE_TOGGLE_STATE_FIX_20260527
   Bersihkan focus mobile setelah tombol Tandai selesai diklik.
*/
(function () {
  "use strict";

  function blurStepButton(target) {
    var button = target && target.closest
      ? target.closest(".offline-step-complete")
      : null;

    if (!button) return;

    setTimeout(function () {
      if (document.activeElement === button) {
        button.blur();
      }

      button.classList.remove("is-active", "active", "is-pressed");
      button.removeAttribute("aria-pressed");
    }, 90);

    setTimeout(function () {
      if (document.activeElement === button) {
        button.blur();
      }
    }, 240);
  }

  document.addEventListener("click", function (event) {
    blurStepButton(event.target);
  }, true);

  document.addEventListener("touchend", function (event) {
    blurStepButton(event.target);
  }, true);
}());

/* FFT_SIMULASI_DESKTOP_DISABLE_MOBILE_SCROLL_20260527
   Desktop hanya handle tombol selesai.
   Tidak handle scroll checkpoint.
*/
(function () {
  "use strict";

  var storageKey = "fft:simulasi-offline:checkpoint:v1";

  function isDesktop() {
    return window.matchMedia && window.matchMedia("(min-width: 761px)").matches;
  }

  function readCompleted() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch (error) {
      return new Set();
    }
  }

  function writeCompleted(set) {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
  }

  function getLang() {
    var saved =
      localStorage.getItem("fft-language") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "id";

    return saved === "en" ? "en" : "id";
  }

  function label(done) {
    return getLang() === "en"
      ? (done ? "Completed" : "Mark complete")
      : (done ? "Selesai" : "Tandai selesai");
  }

  function syncDesktopButtons() {
    if (!isDesktop()) return;

    var completed = readCompleted();
    var cards = Array.from(document.querySelectorAll(".offline-step-card[data-checkpoint-step]"));
    var done = 0;

    cards.forEach(function (card) {
      var id = String(card.getAttribute("data-checkpoint-step") || "");
      var isDone = completed.has(id);
      var button = document.querySelector('.offline-step-complete[data-step-complete="' + id + '"]');
      var nav = document.querySelector('[data-step-target="' + id + '"]');

      if (isDone) done += 1;

      card.classList.toggle("is-mobile-complete", isDone);

      if (nav) nav.classList.toggle("is-complete", isDone);

      if (button) {
        button.textContent = label(isDone);
        button.setAttribute("aria-pressed", isDone ? "true" : "false");
        button.classList.remove("active", "is-active", "is-pressed");
      }
    });

    var count = document.getElementById("offlineCheckpointCount");
    var bar = document.getElementById("offlineCheckpointBar");

    if (count) count.textContent = String(done);

    if (bar) {
      var percent = cards.length ? Math.round((done / cards.length) * 100) : 0;
      bar.style.width = percent + "%";
    }
  }

  function toggleDesktopButton(button) {
    var id = String(button.getAttribute("data-step-complete") || "");

    if (!id) return;

    var completed = readCompleted();

    if (completed.has(id)) {
      completed.delete(id);
    } else {
      completed.add(id);
    }

    writeCompleted(completed);
    syncDesktopButtons();

    setTimeout(function () {
      button.blur();
    }, 40);
  }

  function bindDesktopButtonsOnly() {
    if (document.documentElement.dataset.fftSimulasiDesktopDisableMobileScroll === "1") return;

    document.documentElement.dataset.fftSimulasiDesktopDisableMobileScroll = "1";

    document.addEventListener("click", function (event) {
      if (!isDesktop()) return;

      var button = event.target && event.target.closest
        ? event.target.closest(".offline-step-complete[data-step-complete]")
        : null;

      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      toggleDesktopButton(button);
    }, true);
  }

  function boot() {
    bindDesktopButtonsOnly();

    if (!isDesktop()) return;

    document.body.classList.remove("fft-offline-mobile-sheet-open");
    syncDesktopButtons();

    setTimeout(syncDesktopButtons, 120);
    setTimeout(syncDesktopButtons, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
  window.addEventListener("resize", boot);
}());
