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

    Array.from(root.querySelectorAll(".lecturer-card")).forEach(function (card, index) {
      card.addEventListener("click", function () {
        openModal(filtered[index]);
      });
    });

    root.dataset.finalNativeRender = "1";
    rendering = false;
  }

  function openModal(item) {
    var modal = document.getElementById("profileModal");
    if (!modal || !item) return;

    var modalImage = document.getElementById("modalImage");
    var modalLabel = document.getElementById("modalLabel");
    var modalName = document.getElementById("modalName");
    var modalRole = document.getElementById("modalRole");
    var modalStatus = document.getElementById("modalStatus");
    var modalBirthplace = document.getElementById("modalBirthplace");
    var modalBirthdate = document.getElementById("modalBirthdate");

    var name = nameOf(item);
    var role = roleOf(item, "Dosen");
    var field = fieldOf(item);
    var roleText = field ? role + " / " + field : role;

    if (modalImage) modalImage.src = imageUrl(imageRaw(item), "dosen");
    if (modalLabel) modalLabel.textContent = statusOf(item);
    if (modalName) modalName.textContent = name;
    if (modalRole) modalRole.textContent = roleText;
    if (modalStatus) modalStatus.textContent = statusOf(item);
    if (modalBirthplace) modalBirthplace.textContent = pick(item, ["tempat_lahir", "tempatLahir"]) || "-";
    if (modalBirthdate) modalBirthdate.textContent = pick(item, ["tanggal_lahir", "tanggalLahir"]) || "-";

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
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
  setTimeout(function () { fetchData(true); }, 900);
  setTimeout(function () { fetchData(true); }, 1800);

  window.addEventListener("load", boot);
  window.addEventListener("pageshow", function () {
    readCache();
    renderAll();
    fetchData(true);
  });
}());
