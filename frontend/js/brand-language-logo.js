/* FFT_BRAND_LANGUAGE_LOGO_FIX_20260521 */
(function () {
  "use strict";

  if (window.__fftBrandLanguageLogoFix) return;
  window.__fftBrandLanguageLogoFix = true;

  var BRAND_ID = "../assets/images/brand/fakultasfilsafat.png";
  var BRAND_EN = "../assets/images/brand/facultyoftheology.png";
  var mq = window.matchMedia("(max-width: 768px)");

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getLanguage() {
    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();

    if (htmlLang.indexOf("en") === 0) return "en";
    if (htmlLang.indexOf("id") === 0) return "id";

    var active = document.querySelector(
      ".language-switcher .active, .fft-language-switcher .active, .lang-switcher .active, [data-lang].active, [data-language].active"
    );

    if (active) {
      var text = (active.textContent || "").trim().toLowerCase();
      var dataLang = (active.getAttribute("data-lang") || active.getAttribute("data-language") || "").toLowerCase();

      if (text === "en" || dataLang === "en") return "en";
      if (text === "id" || dataLang === "id") return "id";
    }

    try {
      var stored = (
        localStorage.getItem("fft_language") ||
        localStorage.getItem("fft-language") ||
        localStorage.getItem("fftLang") ||
        localStorage.getItem("language") ||
        localStorage.getItem("lang") ||
        ""
      ).toLowerCase();

      if (stored === "en") return "en";
      if (stored === "id") return "id";
    } catch (error) {}

    return "id";
  }

  function brandSrc() {
    return getLanguage() === "en" ? BRAND_EN : BRAND_ID;
  }

  function brandAlt() {
    return getLanguage() === "en"
      ? "Faculty of Philosophy and Theology, Universitas Advent Surya Nusantara"
      : "Fakultas Filsafat Teologi, Universitas Advent Surya Nusantara";
  }

  function isBadArea(el) {
    return Boolean(
      el.closest(".topbar, .top-bar, .site-topbar, .header-top, .quick-access-bar, .fft-brand-mobile-nav-panel")
    );
  }

  function hasNavOrMenu(el) {
    return Boolean(
      el.querySelector("nav, ul, ol, .hamburger, .menu-toggle, .nav-toggle, .mobile-menu-toggle, .fft-brand-nav-trigger")
    );
  }

  function isBrandText(text) {
    text = (text || "").toUpperCase();

    return (
      text.indexOf("FAKULTAS FILSAFAT") !== -1 ||
      text.indexOf("FACULTY OF PHILOSOPHY") !== -1 ||
      text.indexOf("FILSAFAT TEOLOGI") !== -1 ||
      text.indexOf("THEOLOGY") !== -1 ||
      text.indexOf("UNIVERSITAS ADVENT") !== -1
    );
  }

  function expandToBrandRoot(el) {
    var best = el;
    var current = el;
    var count = 0;

    while (current && current !== document.body && count < 8) {
      if (isBadArea(current)) break;

      if (current !== el && hasNavOrMenu(current)) break;

      var text = current.textContent || "";
      var imgCount = current.querySelectorAll ? current.querySelectorAll("img").length : 0;

      if (isBrandText(text) || imgCount > 0) {
        best = current;
      }

      current = current.parentElement;
      count += 1;
    }

    return best;
  }

  function findBrandTarget() {
    var existing = document.querySelector(".fft-brand-image-shell");

    if (existing) {
      return expandToBrandRoot(existing);
    }

    var selectors = [
      "header .brand",
      "header .site-brand",
      "header .header-brand",
      "header .logo-area",
      "header .brand-area",
      "header .logo",
      "header .navbar-brand",
      ".main-header .brand",
      ".main-header .site-brand",
      ".main-header .header-brand",
      ".main-header .logo-area",
      ".main-header .brand-area",
      ".main-header .logo",
      ".site-header .brand",
      ".site-header .site-brand",
      ".site-header .header-brand",
      ".site-header .logo-area",
      ".site-header .brand-area",
      ".site-header .logo"
    ];

    var candidates = Array.prototype.slice.call(document.querySelectorAll(selectors.join(",")));

    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];

      if (isBadArea(candidate)) continue;
      if (hasNavOrMenu(candidate)) continue;

      var text = candidate.textContent || "";
      var hasImg = Boolean(candidate.querySelector("img"));

      if (isBrandText(text) || hasImg) {
        return expandToBrandRoot(candidate);
      }
    }

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;

    while ((node = walker.nextNode())) {
      if (!isBrandText(node.nodeValue || "")) continue;

      var parent = node.parentElement;

      if (!parent || isBadArea(parent)) continue;

      return expandToBrandRoot(parent);
    }

    return null;
  }

  function getHomeHref() {
    var file = window.location.pathname.split("/").pop() || "indexfft.html";
    return file === "indexfft.html" ? "indexfft.html" : "indexfft.html";
  }

  function replaceBrand() {
    var target = findBrandTarget();

    if (!target) {
      console.warn("[FFT Brand] target brand tidak ditemukan.");
      return null;
    }

    target.classList.add("fft-brand-image-shell");

    if (target.tagName && target.tagName.toLowerCase() === "a") {
      target.href = getHomeHref();
      target.innerHTML = '<img class="fft-header-brand-img" src="' + brandSrc() + '" alt="' + brandAlt() + '">';
    } else {
      target.innerHTML =
        '<a class="fft-brand-link" href="' + getHomeHref() + '" aria-label="' + brandAlt() + '">' +
        '<img class="fft-header-brand-img" src="' + brandSrc() + '" alt="' + brandAlt() + '">' +
        '</a>';
    }

    updateBrand();

    return target;
  }

  function updateBrand() {
    document.querySelectorAll(".fft-header-brand-img, .fft-brand-mobile-nav-logo").forEach(function (img) {
      img.src = brandSrc();
      img.alt = brandAlt();
    });
  }

  function getHeaderRow(brandTarget) {
    var current = brandTarget ? brandTarget.parentElement : null;
    var count = 0;

    while (current && current !== document.body && count < 8) {
      if (isBadArea(current)) break;

      if (
        current.matches("header, .main-header, .site-header, .nav-wrapper, .header-wrapper, .navbar, .header-main, .container") ||
        current.querySelector("nav, .main-nav, .site-nav, .nav-menu, .hamburger, .menu-toggle, .nav-toggle, .mobile-menu-toggle")
      ) {
        return current;
      }

      current = current.parentElement;
      count += 1;
    }

    return brandTarget ? brandTarget.parentElement : document.querySelector("header");
  }

  function currentFile() {
    return window.location.pathname.split("/").pop() || "indexfft.html";
  }

  function homeHash(hash) {
    return currentFile() === "indexfft.html" ? hash : "indexfft.html" + hash;
  }

  function page(path) {
    return path;
  }

  function buildLinks() {
    return [
      {
        title: "Utama",
        items: [
          ["Beranda", page("indexfft.html")],
          ["Program Studi", homeHash("#program-studi")],
          ["Berita", homeHash("#berita")],
          ["Kontak", homeHash("#kontak")]
        ]
      },
      {
        title: "Tentang FFT",
        items: [
          ["Latar Belakang", homeHash("#latar-belakang")],
          ["Visi & Misi", homeHash("#visi-misi")],
          ["Organisasi", homeHash("#organisasi")],
          ["Why Choose FFT", homeHash("#why-choose")]
        ]
      },
      {
        title: "Akademik",
        items: [
          ["Kurikulum", page("kurikulum.html")],
          ["Kalender Akademik", page("kalender-akademik.html")],
          ["Aturan Akademik", page("aturan-akademik.html")],
          ["Pimpinan & Dosen", page("pimpinan-dosen.html")]
        ]
      },
      {
        title: "Pendaftaran",
        items: [
          ["Alur Pendaftaran", page("alur-pendaftaran.html")],
          ["Persyaratan", page("persyaratan.html")],
          ["Simulasi Offline", page("simulasi-pendaftaran-offline.html")],
          ["E-Brochure", page("e-brochure.html")]
        ]
      },
      {
        title: "Mahasiswa",
        items: [
          ["Papan Peringkat", page("papan-peringkat.html")],
          ["Testimoni", page("testimoni.html")]
        ]
      }
    ];
  }

  function ensureTrigger(row) {
    var trigger = document.querySelector(".fft-brand-nav-trigger");

    if (!trigger) {
      trigger = document.createElement("button");
      trigger.className = "fft-brand-nav-trigger";
      trigger.type = "button";
      trigger.setAttribute("aria-label", "Buka menu navigasi");
      trigger.setAttribute("aria-expanded", "false");
      trigger.innerHTML = "<span></span><span></span><span></span>";

      if (row) {
        row.classList.add("fft-brand-header-row");
        row.appendChild(trigger);
      } else {
        document.body.appendChild(trigger);
      }
    }

    trigger.type = "button";
    trigger.setAttribute("aria-label", "Buka menu navigasi");

    if (!trigger.querySelector("span")) {
      trigger.innerHTML = "<span></span><span></span><span></span>";
    }

    return trigger;
  }

  function ensureMobileNav(row) {
    if (document.querySelector(".fft-brand-mobile-nav-panel")) return;

    var trigger = ensureTrigger(row);

    var backdrop = document.createElement("div");
    backdrop.className = "fft-brand-mobile-nav-backdrop";

    var panel = document.createElement("nav");
    panel.className = "fft-brand-mobile-nav-panel";
    panel.setAttribute("aria-label", "Navigasi mobile");

    var html = "";
    html += '<div class="fft-brand-mobile-nav-head">';
    html += '<img class="fft-brand-mobile-nav-logo" src="' + brandSrc() + '" alt="' + brandAlt() + '">';
    html += '<button class="fft-brand-mobile-nav-close" type="button" aria-label="Tutup menu">×</button>';
    html += '</div>';

    buildLinks().forEach(function (group) {
      html += '<div class="fft-brand-mobile-nav-group">';
      html += '<p class="fft-brand-mobile-nav-title">' + group.title + '</p>';

      group.items.forEach(function (item) {
        html += '<a class="fft-brand-mobile-nav-link" href="' + item[1] + '">' + item[0] + '</a>';
      });

      html += '</div>';
    });

    panel.innerHTML = html;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    var closeBtn = panel.querySelector(".fft-brand-mobile-nav-close");

    function openNav() {
      if (!mq.matches) return;
      document.body.classList.add("fft-brand-nav-open");
      trigger.setAttribute("aria-expanded", "true");
      updateBrand();
    }

    function closeNav() {
      document.body.classList.remove("fft-brand-nav-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (event) {
      if (!mq.matches) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      if (document.body.classList.contains("fft-brand-nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    }, true);

    backdrop.addEventListener("click", closeNav);
    closeBtn.addEventListener("click", closeNav);

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function install() {
    var brandTarget = replaceBrand();
    var row = getHeaderRow(brandTarget);

    if (row) {
      row.classList.add("fft-brand-header-row");
    }

    ensureMobileNav(row);
    updateBrand();

    window.setTimeout(function () {
      var again = replaceBrand();
      var againRow = getHeaderRow(again);

      if (againRow) {
        againRow.classList.add("fft-brand-header-row");
      }

      ensureMobileNav(againRow);
      updateBrand();
    }, 250);
  }

  ready(function () {
    install();

    document.addEventListener("fft-language-change", function () {
      window.setTimeout(updateBrand, 30);
      window.setTimeout(updateBrand, 200);
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest(".language-switcher, .fft-language-switcher, .lang-switcher, [data-lang], [data-language]")) {
        window.setTimeout(updateBrand, 120);
        window.setTimeout(updateBrand, 350);
      }
    });
  });
}());
