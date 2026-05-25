/* FFT_PIMPINAN_DOSEN_FINAL_NATIVE_20260525 */
(function () {
  "use strict";

  var fallbackImage = "../assets/images/site/fftkb.png";
  var cacheKey = "fft:pimpinan-dosen:final-native:v3-photo-unique";
  var state = {
    dean: null,
    lecturers: [],
    query: ""
  };
  var rendering = false;
  var fetchBusy = false;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function lower(value) {
    return clean(value).toLowerCase();
  }

  function bad(value) {
    var text = lower(value);
    return !text || text === "-" || text === "null" || text === "undefined" || text === "n/a" || text === "data belum tersedia" || text === "nama dosen";
  }

  function text(value, fallback) {
    var next = clean(value);
    return bad(next) ? fallback : next;
  }

  function escapeHtml(value) {
    return text(value, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function apiBase() {
    var host = window.location.hostname || "127.0.0.1";
    var isLocal = host === "127.0.0.1" || host === "localhost";
    return isLocal ? "http://127.0.0.1:5000" : "http://" + host + ":5000";
  }

  function pick(item, names) {
    if (!item) return "";

    for (var i = 0; i < names.length; i += 1) {
      var value = item[names[i]];
      if (!bad(value)) return clean(value);
    }

    return "";
  }

  function nameOf(item) {
    return text(pick(item, ["nama", "name", "nama_lengkap", "namaLengkap", "full_name", "fullName"]), "");
  }

  function roleOf(item, fallback) {
    return text(pick(item, ["jabatan", "role", "posisi", "position", "title"]), fallback || "Dosen");
  }

  function fieldOf(item) {
    return text(pick(item, ["bidang_dosen", "bidang", "bidang_keahlian", "keahlian", "program_studi"]), "");
  }

  function statusOf(item) {
    return text(pick(item, ["status", "status_dosen", "statusDosen", "aktif"]), "Aktif");
  }

  function badMedia(value) {
    var raw = clean(value);

    if (!raw) return true;

    var text = lower(raw);
    var file = text.split(/[\/]/).pop().split("?")[0].split("#")[0];

    return bad(raw) ||
      file === "thumb.jpg" ||
      file === "thumb.jpeg" ||
      file === "thumb.png" ||
      file === "thumbnail.jpg" ||
      file === "thumbnail.jpeg" ||
      file === "thumbnail.png" ||
      file === "default.jpg" ||
      file === "default.png" ||
      file === "placeholder.jpg" ||
      file === "placeholder.png" ||
      file === "no-image.jpg" ||
      file === "no-image.png" ||
      file === "noimage.jpg" ||
      file === "noimage.png" ||
      file === "avatar.jpg" ||
      file === "avatar.png" ||
      text.indexOf("fftkb") !== -1 ||
      text.indexOf("logo") !== -1;
  }

  function imageRaw(item) {
    var names = [
      "_fft_photo_url",
      "_fft_photo_path",
      "foto_backend",
      "foto_static",
      "foto_resolved",
      "foto_api",
      "url_foto",
      "fotoUrlBackend",
      "image_static",
      "image_backend",
      "photo_static",
      "photo_backend",
      "foto_frontend",
      "fotoFrontend",
      "foto_formal",
      "fotoFormal",
      "foto_dekan",
      "fotoDekan",
      "foto_dosen",
      "fotoDosen",
      "foto",
      "foto_url",
      "fotoUrl",
      "foto_path",
      "fotoPath",
      "foto_profil",
      "fotoProfile",
      "foto_profile",
      "foto_utama",
      "gambar",
      "gambar_url",
      "gambarUrl",
      "image",
      "image_url",
      "imageUrl",
      "photo",
      "photo_url",
      "photoUrl",
      "avatar",
      "thumbnail",
      "thumbnail_url"
    ];

    for (var i = 0; i < names.length; i += 1) {
      var value = item && item[names[i]];

      if (!badMedia(value)) {
        return clean(value);
      }
    }

    return "";
  }

  function imageUrl(raw, type) {
    var value = clean(raw).replace(/\\/g, "/");
    var base = apiBase();
    var host = window.location.hostname || "";

    if (!value) return fallbackImage;

    if (/^https?:\/\//i.test(value)) {
      if (host !== "127.0.0.1" && host !== "localhost") {
        return value
          .replace(/^http:\/\/127\.0\.0\.1:5000/i, base)
          .replace(/^http:\/\/localhost:5000/i, base);
      }

      return value;
    }

    if (value.indexOf("/static/") === 0) return base + value;
    if (value.indexOf("static/") === 0) return base + "/" + value;
    if (value.indexOf("uploads/") === 0) return base + "/static/" + value;
    if (value.indexOf("/uploads/") >= 0) return base + "/static/uploads/" + value.split("/uploads/").pop();

    var file = value.split("/").filter(Boolean).pop();
    if (!file) return fallbackImage;

    return base + "/static/uploads/" + (type === "dekan" ? "dekan/" : "dosen/") + file;
  }

  function extractList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && payload.data && Array.isArray(payload.data.dosen)) return payload.data.dosen;
    if (payload && payload.data && Array.isArray(payload.data.items)) return payload.data.items;
    if (payload && Array.isArray(payload.dosen)) return payload.dosen;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  }

  function extractDean(payload) {
    if (!payload) return null;
    if (payload.data && !Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data)) return payload.data[0] || null;
    if (Array.isArray(payload)) return payload[0] || null;
    return payload;
  }

  function validLecturers(list) {
    return (list || []).filter(function (item) {
      return !bad(nameOf(item));
    });
  }

  function grid() {
    return document.getElementById("lecturerGrid") || document.getElementById("dosenGrid");
  }

  function moveSearchNearList() {
    var input = document.getElementById("staffSearch");
    var root = grid();
    var panel = document.querySelector(".lecturer-panel");

    if (!input || !root || !panel) return;

    var holder = input.closest(".staff-tools") || input.closest(".search-wrap") || input.parentElement;
    if (!holder) return;

    var dock = document.getElementById("staffSearchDock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "staffSearchDock";

      var top = panel.querySelector(".panel-top");
      if (top && top.nextSibling) {
        panel.insertBefore(dock, top.nextSibling);
      } else {
        panel.insertBefore(dock, root);
      }
    }

    if (holder.parentNode !== dock) {
      dock.appendChild(holder);
    }
  }

  function updateStats(filteredCount) {
    var statDean = document.getElementById("statDean");
    var statLecturer = document.getElementById("statLecturer");
    var statTotal = document.getElementById("statTotal");
    var resultInfo = document.getElementById("resultInfo");

    var deanCount = state.dean ? 1 : 0;
    var lecturerCount = state.lecturers.length;

    if (statDean) statDean.textContent = String(deanCount);
    if (statLecturer) statLecturer.textContent = String(lecturerCount);
    if (statTotal) statTotal.textContent = String(deanCount + lecturerCount);
    if (resultInfo) resultInfo.textContent = String(filteredCount) + " profil";
  }

  function renderDean() {
    var target = document.getElementById("deanContent");
    if (!target) return;

    var dean = state.dean;

    if (!dean || bad(nameOf(dean))) {
      target.innerHTML = '<div class="empty-state">Data pimpinan belum tersedia.</div>';
      return;
    }

    var name = nameOf(dean);
    var role = roleOf(dean, "Dekan Fakultas Filsafat Teologi");
    var status = statusOf(dean);
    var img = imageUrl(imageRaw(dean), "dekan");

    target.innerHTML = [
      '<div class="dean-photo">',
      '  <img src="' + escapeHtml(img) + '" alt="' + escapeHtml(name) + '" onerror="this.onerror=null;this.src=\'' + fallbackImage + '\';">',
      '  <span class="dean-badge">Dekan</span>',
      '</div>',
      '<h3 class="person-name">' + escapeHtml(name) + '</h3>',
      '<p class="person-role">' + escapeHtml(role) + '</p>',
      '<ul class="person-bio">',
      '  <li><strong>Status Dosen</strong><span>' + escapeHtml(status) + '</span></li>',
      '</ul>'
    ].join("");
  }

  function lecturerMatches(item, query) {
    if (!query) return true;

    var haystack = [
      nameOf(item),
      roleOf(item, "Dosen"),
      fieldOf(item),
      statusOf(item),
      pick(item, ["email"]),
      pick(item, ["tempat_lahir", "tempatLahir"])
    ].map(lower).join(" ");

    return haystack.indexOf(query) !== -1;
  }

  function renderLecturers() {
    var root = grid();
    if (!root) return;

    var input = document.getElementById("staffSearch");
    var query = lower(input ? input.value : state.query);
    state.query = query;

    var filtered = state.lecturers.filter(function (item) {
      return lecturerMatches(item, query);
    });

    updateStats(filtered.length);

    if (!state.lecturers.length) {
      root.innerHTML = '<div class="empty-state">Data dosen belum tersedia.</div>';
      return;
    }

    if (!filtered.length) {
      root.innerHTML = '<div class="empty-state">Tidak ada dosen yang cocok dengan pencarian.</div>';
      return;
    }

    rendering = true;

    root.innerHTML = filtered.map(function (item, index) {
      var name = nameOf(item);
      var role = roleOf(item, "Dosen");
      var field = fieldOf(item);
      var status = statusOf(item);
      var img = imageUrl(imageRaw(item), "dosen");
      var roleText = field ? role + " / " + field : role;

      return [
        '<article class="lecturer-card visible" data-index="' + index + '" data-name="' + escapeHtml(name) + '" data-role="' + escapeHtml(roleText) + '" data-status="' + escapeHtml(status) + '">',
        '  <div class="lecturer-photo">',
        '    <img src="' + escapeHtml(img) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + fallbackImage + '\';">',
        '  </div>',
        '  <div class="lecturer-info">',
        '    <span class="lecturer-tag">' + escapeHtml(status) + '</span>',
        '    <h4>' + escapeHtml(name) + '</h4>',
        '    <p>' + escapeHtml(roleText) + '</p>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    root.dataset.finalNativeRender = "1";
    rendering = false;
  }

  function bindSearch() {
    var input = document.getElementById("staffSearch");
    if (!input || input.dataset.finalNativeBound === "1") return;

    input.dataset.finalNativeBound = "1";

    input.addEventListener("input", function () {
      window.requestAnimationFrame(renderLecturers);
    });

    input.addEventListener("search", function () {
      window.requestAnimationFrame(renderLecturers);
    });
  }

  function saveCache() {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        dean: state.dean,
        lecturers: state.lecturers
      }));
    } catch (error) {}
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(cacheKey);
      if (!raw) return;

      var cached = JSON.parse(raw);
      if (cached && cached.dean) state.dean = cached.dean;
      if (cached && Array.isArray(cached.lecturers)) state.lecturers = validLecturers(cached.lecturers);
    } catch (error) {}
  }

  function renderAll() {
    moveSearchNearList();
    bindSearch();
    renderDean();
    renderLecturers();

    if (window.fftApplyPimpinanDosenLanguage) {
      window.fftApplyPimpinanDosenLanguage();
    }

    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("visible");
    });
  }

  function fetchData(force) {
    if (fetchBusy) return;

    fetchBusy = true;

    Promise.all([
      fetch(apiBase() + "/api/dekan?v=" + Date.now(), { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      }).catch(function () {
        return null;
      }),
      fetch(apiBase() + "/api/dosen?v=" + Date.now(), { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      }).catch(function () {
        return null;
      })
    ]).then(function (results) {
      var dean = extractDean(results[0]);
      var lecturers = validLecturers(extractList(results[1]));

      if (dean && !bad(nameOf(dean))) state.dean = dean;
      if (lecturers.length) state.lecturers = lecturers;

      saveCache();
      renderAll();
    }).finally(function () {
      fetchBusy = false;
    });
  }

  function cleanLegacyNodes() {
    [
      "fftPimpinanMobile",
      "fftPimpinanMobileDirectory",
      "fftMobileStaffSearchSlot",
      "fftPdSearchPanel",
      "fftPdSearchSuggestions",
      "fftPdNoResults",
      "pdOwnedSearchBox",
      "pdStableSearchBox"
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });

    document.querySelectorAll(".pd-owned-card, .pd-stable-card, .pd-data-card").forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function boot() {
    cleanLegacyNodes();
    readCache();
    renderAll();
    fetchData(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  var observer = new MutationObserver(function () {
    if (rendering) return;

    window.clearTimeout(window.__pdFinalNativeTimer);
    window.__pdFinalNativeTimer = window.setTimeout(function () {
      cleanLegacyNodes();
      moveSearchNearList();

      var root = grid();
      if (state.lecturers.length && root && root.dataset.finalNativeRender !== "1") {
        renderAll();
      }
    }, 120);
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setTimeout(boot, 300);
  setTimeout(function () { if (!state.lecturers.length) fetchData(false); }, 900);
  setTimeout(function () { if (!state.lecturers.length) fetchData(true); }, 1800);

  window.addEventListener("load", function () { renderAll(); });
  window.addEventListener("pageshow", function () {
    readCache();
    renderAll();
    fetchData(true);
  });
}());

/* FFT_PIMPINAN_DOSEN_SCROLL_REVEAL_ANIMATION_20260525
   Trigger animasi hanya saat elemen tersorot di layar.
*/
(function () {
  "use strict";

  var selector = ".dean-card, .lecturer-card, .stat-card, .staff-stat-card";
  var observer = null;

  function revealFallback() {
    document.querySelectorAll(selector).forEach(function (element) {
      element.classList.add("pd-in-view");
    });
  }

  function setupScrollReveal() {
    if (!document.body || !document.body.classList.contains("pimpinan-dosen-page")) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealFallback();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealFallback();
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("pd-in-view");
          observer.unobserve(entry.target);
        });
      }, {
        root: null,
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      });
    }

    document.querySelectorAll(selector).forEach(function (element) {
      if (element.dataset.pdRevealBound === "1") return;

      element.dataset.pdRevealBound = "1";
      observer.observe(element);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupScrollReveal);
  } else {
    setupScrollReveal();
  }

  var timer = null;
  var mutationObserver = new MutationObserver(function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(setupScrollReveal, 80);
  });

  if (document.body) {
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener("load", setupScrollReveal);
  window.addEventListener("pageshow", setupScrollReveal);
}());

/* FFT_LIGHTWEIGHT_PIMPINAN_DOSEN_LANGUAGE_20260525
   EN ID ringan untuk Pimpinan dan Dosen.
   Tidak memakai MutationObserver besar.
*/
(function () {
  "use strict";

  var staticText = {
    id: {
      hero_kicker: "Profil Akademik",
      hero_title: "Pimpinan dan Dosen",
      hero_desc: "Kenali pimpinan dan dosen Fakultas Filsafat Teologi Universitas Advent Surya Nusantara.",
      hero_side_title: "Tenaga Akademik FFT",
      hero_side_desc: "Informasi dosen ditampilkan untuk membantu mahasiswa, calon mahasiswa, dan masyarakat mengenal struktur akademik fakultas.",
      breadcrumb_current: "Pimpinan & Dosen",
      section_kicker: "Direktori Fakultas",
      section_title: "Struktur Pimpinan dan Daftar Dosen",
      search_placeholder: "Cari dosen atau bidang...",
      stat_dean: "Pimpinan Fakultas",
      stat_lecturer: "Dosen Terdata",
      stat_total: "Total Profil",
      dean_panel_title: "Pimpinan Fakultas",
      lecturer_panel_title: "Daftar Dosen",
      result_count: "profil"
    },
    en: {
      hero_kicker: "Academic Profile",
      hero_title: "Leaders and Lecturers",
      hero_desc: "Meet the leaders and lecturers of the Faculty of Philosophy and Theology, Universitas Advent Surya Nusantara.",
      hero_side_title: "FFT Academic Staff",
      hero_side_desc: "Lecturer information helps students, prospective students, and the public understand the faculty academic structure.",
      breadcrumb_current: "Leaders & Lecturers",
      section_kicker: "Faculty Directory",
      section_title: "Leadership Structure and Lecturer Directory",
      search_placeholder: "Search lecturer or field...",
      stat_dean: "Faculty Leader",
      stat_lecturer: "Listed Lecturers",
      stat_total: "Total Profiles",
      dean_panel_title: "Faculty Leadership",
      lecturer_panel_title: "Lecturer Directory",
      result_count: "profiles"
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

  function replaceWords(value, lang) {
    var text = String(value || "");

    if (lang === "en") {
      return text
        .replace(/\bDEKAN\b/g, "DEAN")
        .replace(/\bDekan\b/g, "Dean")
        .replace(/\bDOSEN\b/g, "LECTURER")
        .replace(/\bDosen\b/g, "Lecturer")
        .replace(/\bAKTIF\b/g, "ACTIVE")
        .replace(/\bAktif\b/g, "Active");
    }

    return text
      .replace(/\bDEAN\b/g, "DEKAN")
      .replace(/\bDean\b/g, "Dekan")
      .replace(/\bLECTURER\b/g, "DOSEN")
      .replace(/\bLecturer\b/g, "Dosen")
      .replace(/\bACTIVE\b/g, "AKTIF")
      .replace(/\bActive\b/g, "Aktif");
  }

  function applyStatic(lang) {
    var table = staticText[lang] || staticText.id;

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");

      if (table[key]) {
        el.textContent = table[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");

      if (table[key]) {
        el.setAttribute("placeholder", table[key]);
      }
    });

    var search = document.getElementById("staffSearch");

    if (search) {
      search.setAttribute("placeholder", table.search_placeholder);
    }
  }

  function applyGenerated(lang) {
    var table = staticText[lang] || staticText.id;

    document.querySelectorAll([
      ".dean-badge",
      ".dean-content .dosen-status",
      ".lecturer-tag",
      ".lecturer-info p",
      ".person-role",
      ".person-bio strong",
      ".person-bio span",
      ".stat-label",
      ".panel-title",
      ".section-kicker",
      ".section-title"
    ].join(",")).forEach(function (el) {
      if (!el || el.children.length > 0) return;
      el.textContent = replaceWords(el.textContent, lang);
    });

    document.querySelectorAll(".empty-state").forEach(function (el) {
      el.textContent = replaceWords(el.textContent, lang);
    });

    var resultInfo = document.getElementById("resultInfo");

    if (resultInfo) {
      var number = String(resultInfo.textContent || "").match(/\d+/);
      if (number) {
        resultInfo.textContent = number[0] + " " + table.result_count;
      }
    }
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

    applyStatic(lang);
    applyGenerated(lang);
    setButtonState(lang);
  }

  function bindButtons() {
    if (document.documentElement.dataset.pdLanguageBound === "1") return;

    document.documentElement.dataset.pdLanguageBound = "1";

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn");

      if (!button) return;

      var lang = button.getAttribute("data-fft-lang") || button.getAttribute("data-lang");

      if (lang !== "id" && lang !== "en") return;

      event.preventDefault();
      applyLanguage(lang);
    }, true);
  }

  window.fftApplyPimpinanDosenLanguage = function () {
    applyLanguage(getLang());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindButtons();
      applyLanguage(getLang());
    });
  } else {
    bindButtons();
    applyLanguage(getLang());
  }

  window.addEventListener("load", function () {
    applyLanguage(getLang());
  });

  window.addEventListener("pageshow", function () {
    applyLanguage(getLang());
  });
}());
