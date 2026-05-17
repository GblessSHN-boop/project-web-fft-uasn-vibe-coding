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
