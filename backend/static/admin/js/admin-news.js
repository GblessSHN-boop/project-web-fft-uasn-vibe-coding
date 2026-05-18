// Professional News Control Page
(function () {
  const searchInput = document.querySelector("[data-news-search]");
  const resultList = document.querySelector("[data-news-result-list]");
  const emptySearch = document.querySelector("[data-news-empty-search]");
  const syncForm = document.querySelector("[data-news-sync-form]");

  const activateForms = document.querySelectorAll("[data-news-activate-form]");
  const unpublishForms = document.querySelectorAll("[data-news-unpublish-form]");
  const maintenanceForms = document.querySelectorAll("[data-news-maintenance-form]");
  const deleteForms = document.querySelectorAll("[data-news-delete-form]");

  function applySearch() {
    if (!searchInput || !resultList) return;

    const keyword = searchInput.value.trim().toLowerCase();
    const cards = Array.from(resultList.querySelectorAll("[data-news-card]"));

    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = String(card.getAttribute("data-search") || "").toLowerCase();
      const matched = !keyword || haystack.includes(keyword);

      card.classList.toggle("is-hidden", !matched);

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptySearch) {
      emptySearch.classList.toggle("is-hidden", visibleCount !== 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  activateForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Tayangkan berita ini sekarang?\n\nBerita akan tampil di website dan urutannya mengikuti jumlah kunjungan."
      );

      if (!ok) event.preventDefault();
    });
  });

  unpublishForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Simpan berita ini sebagai stok?\n\nBerita akan disembunyikan dari website, tetapi tetap tersimpan di admin."
      );

      if (!ok) event.preventDefault();
    });
  });

  maintenanceForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Nonaktifkan berita ini sementara?\n\nBerita tidak akan tampil di website dan tidak masuk daftar berita terbaru."
      );

      if (!ok) event.preventDefault();
    });
  });

  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Hapus berita ini?\n\nData berita akan dihapus dari admin."
      );

      if (!ok) event.preventDefault();
    });
  });

  if (syncForm) {
    syncForm.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Perbarui data website sekarang?\n\nWebsite akan disusun ulang berdasarkan berita yang statusnya sedang tayang."
      );

      if (!ok) event.preventDefault();
    });
  }

  applySearch();
})();

/* NEWS_LIST_NOTICE_START */
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function messageFromCode(code) {
    const messages = {
      edit_saved: {
        type: "success",
        title: "Perubahan Berhasil Disimpan",
        text: "Data berita telah diperbarui. Silakan tinjau kembali sebelum berita ditayangkan di website."
      },
      add_saved: {
        type: "success",
        title: "Berita Baru Berhasil Disimpan",
        text: "Berita baru telah tersimpan sebagai stok. Berita belum tampil di website sampai Anda menayangkannya."
      },
      save_failed: {
        type: "error",
        title: "Berita Belum Berhasil Disimpan",
        text: "Periksa kembali judul, isi berita, dan gambar yang digunakan, lalu coba simpan ulang."
      }
    };

    return messages[code] || null;
  }

  function insertNotice(notice) {
    if (!notice || document.querySelector(".news-admin-notice")) return;

    const container =
      document.querySelector("main") ||
      document.querySelector(".admin-main") ||
      document.querySelector(".content") ||
      document.body;

    const noticeElement = document.createElement("section");
    noticeElement.className = "news-admin-notice news-admin-notice--" + notice.type;
    noticeElement.setAttribute("role", notice.type === "error" ? "alert" : "status");
    noticeElement.setAttribute("aria-live", "polite");

    noticeElement.innerHTML = `
      <div class="news-admin-notice__mark">${notice.type === "error" ? "!" : "✓"}</div>
      <div class="news-admin-notice__body">
        <strong>${notice.title}</strong>
        <p>${notice.text}</p>
      </div>
      <button type="button" class="news-admin-notice__close" aria-label="Tutup notifikasi">×</button>
    `;

    const firstCard =
      container.querySelector(".admin-card, .module-card, section, article") ||
      container.firstElementChild;

    if (firstCard) {
      firstCard.insertAdjacentElement("beforebegin", noticeElement);
    } else {
      container.prepend(noticeElement);
    }

    const closeButton = noticeElement.querySelector(".news-admin-notice__close");

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        noticeElement.remove();
      });
    }

    setTimeout(function () {
      if (noticeElement && noticeElement.parentElement) {
        noticeElement.classList.add("is-soft");
      }
    }, 5000);
  }

  ready(function () {
    if (!location.pathname.includes("/admin/berita/list")) return;

    const params = new URLSearchParams(location.search);
    const noticeCode = params.get("notice");
    const notice = messageFromCode(noticeCode);

    insertNotice(notice);

    if (noticeCode) {
      params.delete("notice");

      const cleanQuery = params.toString();
      const cleanUrl = location.pathname + (cleanQuery ? "?" + cleanQuery : "") + location.hash;

      window.history.replaceState({}, document.title, cleanUrl);
    }
  });
})();
/* NEWS_LIST_NOTICE_END */

/* NEWS_LIST_ACTION_GUARD_START */
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function cleanText(element) {
    return String((element && element.textContent) || "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function closestNewsCard(element) {
    if (!element) return null;

    const direct = element.closest(
      "[data-news-card], .fft-news-item, .berita-card, .news-card, .admin-news-card, article, li"
    );

    if (direct) return direct;

    let node = element.parentElement;

    for (let i = 0; i < 8 && node; i += 1) {
      const text = cleanText(node);
      const hasCode = /KODE\s+\d{5}/.test(text);
      const hasAction =
        text.includes("TAYANGKAN SEKARANG") ||
        text.includes("SIMPAN SEBAGAI STOK") ||
        text.includes("NONAKTIFKAN SEMENTARA");

      if (hasCode && hasAction) return node;

      node = node.parentElement;
    }

    return null;
  }

  function actionUrl(element) {
    if (!element) return "";

    if (element.matches("a[href]")) return element.getAttribute("href") || "";
    if (element.matches("form[action]")) return element.getAttribute("action") || "";
    if (element.matches("button[formaction]")) return element.getAttribute("formaction") || "";

    const form = element.closest("form[action]");
    if (form) return form.getAttribute("action") || "";

    const link = element.closest("a[href]");
    if (link) return link.getAttribute("href") || "";

    return "";
  }

  function extractNewsId(card) {
    if (!card) return "";

    const candidates = Array.from(
      card.querySelectorAll("a[href], form[action], button[formaction]")
    );

    for (const candidate of candidates) {
      const url = actionUrl(candidate);

      const patterns = [
        /\/admin\/berita\/edit\/(\d+)/,
        /\/admin\/berita\/delete\/(\d+)/,
        /\/admin\/berita\/(\d+)\/activate/,
        /\/admin\/berita\/(\d+)\/maintenance/,
        /\/admin\/berita\/(\d+)\/restore-stock/,
        /\/admin\/berita\/(\d+)\/unpublish/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
    }

    return "";
  }

  function findActionArea(trigger, card) {
    const form = trigger.closest("form");
    if (form && form.parentElement) return form.parentElement;

    return (
      trigger.closest(".fft-news-actions, .news-actions, .berita-actions, .card-actions") ||
      card.querySelector(".fft-news-actions, .news-actions, .berita-actions, .card-actions") ||
      trigger.parentElement ||
      card
    );
  }

  function removeLiveEditButtons() {
    const editControls = Array.from(
      document.querySelectorAll('a[href*="/admin/berita/edit/"], button, input[type="submit"]')
    ).filter((element) => cleanText(element) === "EDIT");

    editControls.forEach((editControl) => {
      const card = closestNewsCard(editControl);

      if (!card) return;

      const text = cleanText(card);

      if (!text.includes("SIMPAN SEBAGAI STOK")) return;

      const removable =
        editControl.closest("form") ||
        editControl.closest("a") ||
        editControl;

      if (removable) {
        removable.remove();
      }
    });
  }

  function addStockDeleteButtons() {
    const publishTriggers = Array.from(
      document.querySelectorAll("button, a, input[type='submit']")
    ).filter((element) => cleanText(element).includes("TAYANGKAN SEKARANG"));

    publishTriggers.forEach((trigger) => {
      const card = closestNewsCard(trigger);

      if (!card) return;
      if (card.querySelector("[data-news-stock-delete-form]")) return;

      const newsId = extractNewsId(card);
      if (!newsId) return;

      const actionArea = findActionArea(trigger, card);

      // FFT_DISABLE_DUPLICATE_NEWS_DELETE_BUTTON_20260518
      // Tombol Hapus sudah dirender dari template admin_berita_list.html.
      // Injeksi tombol Hapus dari admin-news.js dimatikan agar tidak muncul ganda.

    });
  }

  function bindDeleteConfirm() {
    document.addEventListener("submit", function (event) {
      const form = event.target;

      if (!form || !form.matches("[data-news-stock-delete-form]")) return;

      const ok = window.confirm(
        "Hapus berita ini?\n\nData berita akan dihapus dari database dan folder upload. Tindakan ini tidak dapat dibatalkan."
      );

      if (!ok) {
        event.preventDefault();
      }
    });
  }

  function run() {
    removeLiveEditButtons();
    addStockDeleteButtons();
  }

  ready(function () {
    bindDeleteConfirm();
    run();
    setTimeout(run, 300);
    setTimeout(run, 900);
  });
})();
 /* NEWS_LIST_ACTION_GUARD_END */
