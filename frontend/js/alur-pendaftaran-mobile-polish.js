/* FFT_ALUR_MOBILE_POLISH_20260525
   Sinkron kecil EN ID khusus Alur Pendaftaran.
   Tidak memakai observer berat.
*/
(function () {
  "use strict";

  var exact = {
    id: {
      "Maintenance": "Dalam Pemeliharaan",
      "Under Maintenance": "Dalam Pemeliharaan",
      "Registration Status": "Status Pendaftaran",
      "Academic Year": "Tahun Akademik",
      "View Flow": "Lihat Alur",
      "View Requirements": "Lihat Persyaratan",
      "Need Help": "Butuh Bantuan",
      "Main Flow": "Alur Utama",
      "Quick Checklist": "Checklist Cepat",
      "Help": "Bantuan",
      "Registration FAQ": "FAQ Pendaftaran",
      "Initial Information": "Informasi Awal",
      "Data Entry": "Pengisian Data",
      "Verification": "Verifikasi",
      "Document Stage": "Tahap Dokumen",
      "Information Stage": "Tahap Informasi",
      "Data Stage": "Tahap Data"
    },
    en: {
      "Dalam Pemeliharaan": "Maintenance",
      "Pemeliharaan": "Maintenance",
      "Belum Aktif": "Maintenance",
      "Status Pendaftaran": "Registration Status",
      "Tahun Akademik": "Academic Year",
      "Lihat Alur": "View Flow",
      "Lihat Persyaratan": "View Requirements",
      "Butuh Bantuan": "Need Help",
      "Alur Utama": "Main Flow",
      "Checklist Cepat": "Quick Checklist",
      "Bantuan": "Help",
      "FAQ Pendaftaran": "Registration FAQ",
      "Informasi Awal": "Initial Information",
      "Pengisian Data": "Data Entry",
      "Verifikasi": "Verification",
      "Tahap Dokumen": "Document Stage",
      "Tahap Informasi": "Information Stage",
      "Tahap Data": "Data Stage"
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

  function saveLang(lang) {
    lang = lang === "en" ? "en" : "id";

    localStorage.setItem("fft-language", lang);
    localStorage.setItem("siteLanguage", lang);
    localStorage.setItem("lang", lang);

    return lang;
  }

  function applyExact(lang) {
    var dict = exact[lang] || exact.id;

    document.documentElement.lang = lang;

    document.querySelectorAll("body.alur-pendaftaran-page *").forEach(function (el) {
      if (!el || el.children.length > 0) return;

      var text = String(el.textContent || "").trim();

      if (!text) return;

      if (Object.prototype.hasOwnProperty.call(dict, text)) {
        el.textContent = dict[text];
      }
    });
  }

  function setButtonState(lang) {
    document.querySelectorAll("[data-fft-lang], [data-lang], .fft-floating-language-btn").forEach(function (button) {
      var value = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (value !== "id" && value !== "en") return;

      var active = value === lang;

      button.classList.toggle("is-active", active);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyLanguage(lang) {
    lang = saveLang(lang || getLang());

    applyExact(lang);
    setButtonState(lang);
  }

  function bindButtons() {
    if (document.documentElement.dataset.alurMobilePolishBound === "1") return;

    document.documentElement.dataset.alurMobilePolishBound = "1";

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn");

      if (!button) return;

      var lang = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (lang !== "id" && lang !== "en") return;

      setTimeout(function () {
        applyLanguage(lang);
      }, 30);

      setTimeout(function () {
        applyLanguage(lang);
      }, 180);
    }, true);
  }

  function boot() {
    if (!document.body || !document.body.classList.contains("alur-pendaftaran-page")) return;

    bindButtons();
    applyLanguage(getLang());

    setTimeout(function () { applyLanguage(getLang()); }, 120);
    setTimeout(function () { applyLanguage(getLang()); }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);
}());

/* FFT_ALUR_REQUIREMENTS_DESKTOP_LAYOUT_LOCK_20260525
   Scroll Persyaratan ke atas card checklist.
   Mobile tetap dekat seperti posisi yang sudah disukai.
   Desktop tidak lagi jatuh ke layout kolom yang rusak.
*/
(function () {
  "use strict";

  var targetId = "persyaratan-pendaftaran";

  function isAlurPage() {
    return document.body && document.body.classList.contains("alur-pendaftaran-page");
  }

  function topOffset() {
    return window.innerWidth <= 760 ? 142 : 34;
  }

  function scrollToRequirements(behavior) {
    if (!isAlurPage()) return false;

    var target = document.getElementById(targetId);

    if (!target) return false;

    var top = target.getBoundingClientRect().top + window.pageYOffset - topOffset();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: behavior || "smooth"
    });

    return true;
  }

  function isRequirementsLink(link) {
    if (!link) return false;

    var href = String(link.getAttribute("href") || "");

    return href === "#" + targetId ||
      href.indexOf("alur-pendaftaran.html#" + targetId) !== -1 ||
      href.indexOf("persyaratan-pendaftaran") !== -1;
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a") : null;

    if (!isRequirementsLink(link)) return;
    if (!isAlurPage()) return;

    event.preventDefault();
    event.stopPropagation();

    if (history.pushState) {
      history.pushState(null, "", "#" + targetId);
    } else {
      window.location.hash = targetId;
    }

    setTimeout(function () { scrollToRequirements("auto"); }, 20);
    setTimeout(function () { scrollToRequirements("smooth"); }, 160);
    setTimeout(function () { scrollToRequirements("smooth"); }, 460);
    setTimeout(function () { if (window.innerWidth <= 760) scrollToRequirements("smooth"); }, 920);
  }, true);

  function fixHashPosition() {
    if (!isAlurPage()) return;
    if (window.location.hash !== "#" + targetId) return;

    setTimeout(function () { scrollToRequirements("auto"); }, 80);
    setTimeout(function () { scrollToRequirements("smooth"); }, 260);
    setTimeout(function () { scrollToRequirements("smooth"); }, 620);
    setTimeout(function () { if (window.innerWidth <= 760) scrollToRequirements("smooth"); }, 1080);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixHashPosition);
  } else {
    fixHashPosition();
  }

  window.addEventListener("hashchange", fixHashPosition);
  window.addEventListener("load", fixHashPosition);
  window.addEventListener("pageshow", fixHashPosition);
}());

/* FFT_ALUR_MOBILE_REQUIREMENTS_SCROLL_OFFSET_20260525
   Mobile Persyaratan berhenti lebih atas dari card checklist.
   Desktop tidak diubah pada patch ini.
*/

/* FFT_ALUR_DESKTOP_REQUIREMENTS_RUNTIME_GRID_LOCK_20260525
   Desktop only.
   Membungkus checklist dan bantuan ke wrapper grid agar susunan desktop rapi.
   Mobile tidak disentuh.
*/
(function () {
  "use strict";

  var wrapperClass = "fft-alur-desktop-requirements-grid";

  function isDesktop() {
    return window.innerWidth >= 761;
  }

  function isAlurPage() {
    return document.body && document.body.classList.contains("alur-pendaftaran-page");
  }

  function firstInDocument(a, b) {
    if (!a) return b;
    if (!b) return a;

    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) ? b : a;
  }

  function ensureDesktopRequirementsGrid() {
    if (!isAlurPage()) return;
    if (!isDesktop()) return;

    var checklist = document.querySelector(".admission-flow-checklist");
    var help = document.querySelector(".admission-flow-help");
    var anchor = document.getElementById("persyaratan-pendaftaran");

    if (!checklist || !help) return;

    var wrapper = document.querySelector("." + wrapperClass);

    if (!wrapper) {
      wrapper = document.createElement("section");
      wrapper.className = wrapperClass;
      wrapper.setAttribute("aria-label", "Persyaratan dan bantuan pendaftaran");

      var first = firstInDocument(checklist, help);
      first.parentNode.insertBefore(wrapper, first);
    }

    if (anchor && anchor.parentNode !== wrapper) {
      wrapper.appendChild(anchor);
    }

    if (checklist.parentNode !== wrapper) {
      wrapper.appendChild(checklist);
    }

    if (help.parentNode !== wrapper) {
      wrapper.appendChild(help);
    }

    checklist.classList.add("fft-alur-desktop-checklist-lock");
    help.classList.add("fft-alur-desktop-help-lock");
  }

  function bootDesktopRequirementsGrid() {
    ensureDesktopRequirementsGrid();

    setTimeout(ensureDesktopRequirementsGrid, 80);
    setTimeout(ensureDesktopRequirementsGrid, 280);
    setTimeout(ensureDesktopRequirementsGrid, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootDesktopRequirementsGrid);
  } else {
    bootDesktopRequirementsGrid();
  }

  window.addEventListener("load", bootDesktopRequirementsGrid);
  window.addEventListener("pageshow", bootDesktopRequirementsGrid);
  window.addEventListener("resize", function () {
    window.clearTimeout(window.__fftAlurDesktopGridTimer);
    window.__fftAlurDesktopGridTimer = window.setTimeout(bootDesktopRequirementsGrid, 120);
  });
}());
