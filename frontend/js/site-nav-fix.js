/* FFT_FIX_HEADER_REFRESH_FLASH_ALL_VIEWPORTS_20260524
   Tandai header siap setelah script navigasi selesai diproses.
*/
(function () {
  "use strict";

  function markHeaderReady() {
    if (!document.documentElement) return;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add("fft-header-ready");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markHeaderReady);
  } else {
    markHeaderReady();
  }

  window.addEventListener("load", markHeaderReady);
  window.addEventListener("pageshow", markHeaderReady);

  setTimeout(function () {
    document.documentElement.classList.add("fft-header-flash-fallback");
  }, 700);
}());

﻿document.addEventListener("DOMContentLoaded", function () {
  const labels = {
    nav_curriculum: { id: "Kurikulum", en: "Curriculum" },
    nav_academic_calendar: { id: "Kalender Akademik", en: "Academic Calendar" },
    nav_ranking_board: { id: "Papan Peringkat", en: "Ranking Board" },
    nav_testimonials: { id: "Testimoni", en: "Testimonials" },
    nav_academic_rules: { id: "Aturan Akademik", en: "Academic Rules" }
  };

  function getLang() {
    return localStorage.getItem("fft-language")
      || localStorage.getItem("siteLanguage")
      || localStorage.getItem("fftLang")
      || document.documentElement.lang
      || "id";
  }

  function applyLabels() {
    const lang = getLang() === "en" ? "en" : "id";

    Object.keys(labels).forEach(function (key) {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (el) {
        el.textContent = labels[key][lang];
      });
    });
  }

  applyLabels();
  window.addEventListener("fft-language-change", applyLabels);
  window.addEventListener("storage", applyLabels);
});

/* FFT_FIX_NAV_EBROCHURE_LABEL_20260521
   Fix label E-Brochure pada navbar inner pages.
   Mencegah key mentah "nav_ebrochure" tampil di dropdown Pendaftaran.
*/
(function () {
  "use strict";

  function fixEbrochureLabel() {
    var selectors = [
      '[data-i18n="nav_ebrochure"]',
      '[data-lang-key="nav_ebrochure"]',
      '[data-nav-key="nav_ebrochure"]'
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = "E-Brochure";
      });
    });

    document.querySelectorAll("a, button, span, li").forEach(function (el) {
      if ((el.textContent || "").trim() === "nav_ebrochure") {
        el.textContent = "E-Brochure";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fixEbrochureLabel();
    window.setTimeout(fixEbrochureLabel, 80);
    window.setTimeout(fixEbrochureLabel, 240);
  });

  window.addEventListener("fft-language-change", fixEbrochureLabel);
}());

/* FFT_NAV_REQUIREMENTS_INLINE_TO_ADMISSION_FLOW_20260525
   Persyaratan bukan page berdiri sendiri.
   Menu desktop dan mobile diarahkan ke section Persyaratan di Alur Pendaftaran.
*/
(function () {
  "use strict";

  function currentLang() {
    var saved =
      localStorage.getItem("fft-language") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "id";

    return saved === "en" ? "en" : "id";
  }

  function isAlurPage() {
    return /alur-pendaftaran\.html/i.test(window.location.pathname || "");
  }

  function requirementsHref() {
    return isAlurPage()
      ? "#persyaratan-pendaftaran"
      : "alur-pendaftaran.html#persyaratan-pendaftaran";
  }

  function label() {
    return currentLang() === "en" ? "Requirements" : "Persyaratan";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isAdmissionMenu(menu) {
    var html = String(menu.innerHTML || "").toLowerCase();

    return html.indexOf("alur-pendaftaran.html") !== -1 &&
      (
        html.indexOf("simulasi-pendaftaran-offline.html") !== -1 ||
        html.indexOf("e-brochure.html") !== -1
      );
  }

  function rewriteExistingRequirementsLinks() {
    document.querySelectorAll('a[href*="persyaratan.html"]').forEach(function (link) {
      link.setAttribute("href", requirementsHref());

      if (!link.getAttribute("data-i18n")) {
        link.setAttribute("data-i18n", "nav_requirements");
      }

      link.textContent = label();
    });
  }

  function createRequirementsLink(reference) {
    var link = document.createElement("a");

    link.href = requirementsHref();
    link.textContent = label();
    link.setAttribute("data-i18n", "nav_requirements");

    if (reference && reference.className) {
      link.className = reference.className;
      link.classList.remove("active", "is-active", "current");
    }

    return link;
  }

  function ensureRequirementsInMenu(menu) {
    if (!menu || !isAdmissionMenu(menu)) return;

    var existing = Array.from(menu.querySelectorAll("a")).find(function (link) {
      var href = String(link.getAttribute("href") || "").toLowerCase();
      var text = normalizeText(link.textContent);

      return href.indexOf("persyaratan") !== -1 ||
        href.indexOf("persyaratan-pendaftaran") !== -1 ||
        text === "persyaratan" ||
        text === "requirements";
    });

    if (existing) {
      existing.setAttribute("href", requirementsHref());
      existing.textContent = label();

      if (!existing.getAttribute("data-i18n")) {
        existing.setAttribute("data-i18n", "nav_requirements");
      }

      return;
    }

    var alurLink = Array.from(menu.querySelectorAll("a")).find(function (link) {
      return String(link.getAttribute("href") || "").toLowerCase().indexOf("alur-pendaftaran.html") !== -1;
    });

    if (!alurLink) return;

    var newLink = createRequirementsLink(alurLink);

    alurLink.insertAdjacentElement("afterend", newLink);
  }

  function ensureAllAdmissionMenus() {
    rewriteExistingRequirementsLinks();

    document.querySelectorAll(".dropdown-menu, .dropdown-content, .submenu, .nav-dropdown, .mobile-menu, .mobile-nav, ul, nav div").forEach(function (menu) {
      ensureRequirementsInMenu(menu);
    });
  }

  function boot() {
    ensureAllAdmissionMenus();

    setTimeout(ensureAllAdmissionMenus, 120);
    setTimeout(ensureAllAdmissionMenus, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", boot);

  document.addEventListener("click", function (event) {
    var target = event.target;

    if (!target || !target.closest) return;

    var navTrigger = target.closest("a, button");

    if (!navTrigger) return;

    var text = normalizeText(navTrigger.textContent);

    if (text === "pendaftaran" || text === "admission") {
      setTimeout(ensureAllAdmissionMenus, 40);
    }
  }, true);
}());

