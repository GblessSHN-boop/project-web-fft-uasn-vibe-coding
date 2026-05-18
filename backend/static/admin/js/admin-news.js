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
