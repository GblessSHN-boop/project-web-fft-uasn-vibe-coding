(function () {
  "use strict";

  const ICONS = {
    share: "../assets/ebrochure-icons/icons8-share-100.png",
    like: "../assets/ebrochure-icons/icons8-like-100.png",
    download: "../assets/ebrochure-icons/icons8-under-100.png"
  };

  const likeKeyPrefix = "fft-ebrochure-liked:";
  let activeDoc = null;
  let activeSpread = 0;
  let zoom = 1;

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function slugify(value) {
    return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brosur";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getText(card, selector, fallback) {
    const el = card ? card.querySelector(selector) : null;
    return cleanText(el ? el.textContent : "") || fallback || "";
  }

  function getCardDoc(button) {
    const card = button.closest(".ebrochure-card");

    const title =
      button.getAttribute("data-brochure-title") ||
      (card ? card.getAttribute("data-brochure-title") : "") ||
      getText(card, "h3", "Brosur Fakultas Filsafat Teologi");

    const category =
      button.getAttribute("data-brochure-category") ||
      (card ? card.getAttribute("data-brochure-category") : "") ||
      getText(card, ".ebrochure-card__eyebrow, .ebrochure-card__label", "Brosur Pilihan");

    const status =
      button.getAttribute("data-brochure-status") ||
      (card ? card.getAttribute("data-brochure-status") : "") ||
      "Dalam Persiapan";

    const pdf =
      button.getAttribute("data-brochure-pdf") ||
      button.getAttribute("data-pdf") ||
      (card ? card.getAttribute("data-brochure-pdf") : "") ||
      "";

    return {
      title: cleanText(title),
      category: cleanText(category),
      status: cleanText(status),
      pdf: cleanText(pdf),
      slug: slugify(title)
    };
  }

  function getMainDoc() {
    return {
      title: "Profil Fakultas dan Informasi Pendaftaran",
      category: "Brosur Pilihan",
      status: "Dalam Persiapan",
      pdf: "",
      slug: "profil-fakultas-dan-informasi-pendaftaran"
    };
  }

  function icon(name) {
    return '<img class="fft-viewer-toolbar__icon" src="' + ICONS[name] + '" alt="">';
  }

  function ensureViewer() {
    let modal = document.getElementById("fftBrochureViewerClean");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "fftBrochureViewerClean";
    modal.className = "fft-viewer";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="fft-viewer__shade" data-viewer-close></div>
      <button class="fft-viewer__close" type="button" data-viewer-close aria-label="Tutup">×</button>
      <button class="fft-viewer__nav fft-viewer__nav--prev" type="button" data-viewer-prev aria-label="Sebelumnya">‹</button>
      <button class="fft-viewer__nav fft-viewer__nav--next" type="button" data-viewer-next aria-label="Berikutnya">›</button>

      <section class="fft-viewer__stage">
        <div class="fft-viewer__book" id="fftViewerBook">
          <article class="fft-viewer__page fft-viewer__page--left" id="fftViewerLeftPage"></article>
          <article class="fft-viewer__page fft-viewer__page--right" id="fftViewerRightPage"></article>
        </div>
      </section>

      <nav class="fft-viewer-toolbar" aria-label="Kontrol brosur">
        <span class="fft-viewer-toolbar__page" id="fftViewerPageLabel">1-2 / 6</span>
        <button type="button" class="fft-viewer-toolbar__text" data-viewer-overview>Ringkasan</button>
        <button type="button" class="fft-viewer-toolbar__square" data-viewer-zoom-out aria-label="Perkecil">−</button>
        <button type="button" class="fft-viewer-toolbar__square" data-viewer-zoom-in aria-label="Perbesar">+</button>
        <button type="button" class="fft-viewer-toolbar__text" data-viewer-focus>Fokus</button>
        <button type="button" class="fft-viewer-toolbar__square" data-viewer-share aria-label="Bagikan">${icon("share")}</button>
        <button type="button" class="fft-viewer-toolbar__square" data-viewer-like aria-label="Suka">${icon("like")}</button>
        <button type="button" class="fft-viewer-toolbar__square" data-viewer-download aria-label="Unduh">${icon("download")}</button>
      </nav>

      <div class="fft-viewer-toast" id="fftViewerToast"></div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function showToast(message) {
    const toast = document.getElementById("fftViewerToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function coverPage(doc) {
    return `
      <div class="fft-viewer-cover">
        <span></span>
        <strong>FFT</strong>
        <h2>${escapeHtml(doc.title)}</h2>
        <p>Fakultas Filsafat Teologi</p>
      </div>
    `;
  }

  function introPage(doc) {
    return `
      <div class="fft-viewer-paper">
        <span class="fft-viewer-kicker">${escapeHtml(doc.category || "Brosur Pilihan")}</span>
        <h2>${escapeHtml(doc.title)}</h2>
        <p>Preview ini membantu pengunjung memahami isi dan fungsi brosur sebelum membuka alur pendaftaran atau menghubungi fakultas.</p>
        <div class="fft-viewer-facts">
          <div><small>Format</small><b>PDF</b></div>
          <div><small>Status</small><b>${escapeHtml(doc.status || "Dalam Persiapan")}</b></div>
          <div><small>Akses</small><b>Online</b></div>
        </div>
      </div>
    `;
  }

  function statusPage(doc) {
    const hasPdf = Boolean(doc.pdf);
    return `
      <div class="fft-viewer-paper">
        <span class="fft-viewer-kicker">Preview PDF</span>
        <h2>${hasPdf ? "Dokumen tersedia" : "Preview belum tersedia"}</h2>
        <p>${hasPdf ? "File PDF sudah tersedia dan dapat dibuka melalui tombol unduh." : "Dokumen brosur sedang disiapkan. Setelah file PDF resmi dimasukkan, area viewer ini akan menampilkan dokumen secara langsung."}</p>
        <div class="fft-viewer-note">
          <b>Catatan</b>
          <span>Struktur viewer sudah siap untuk backend dan file PDF resmi.</span>
        </div>
      </div>
    `;
  }

  function benefitPage() {
    return `
      <div class="fft-viewer-paper">
        <span class="fft-viewer-kicker">Manfaat</span>
        <h2>Membantu calon mahasiswa membaca informasi lebih cepat</h2>
        <ul class="fft-viewer-list">
          <li>Memahami profil fakultas dan informasi akademik secara ringkas.</li>
          <li>Menentukan dokumen yang relevan sebelum bertanya kepada admin.</li>
          <li>Menyimpan atau membagikan brosur ketika file PDF sudah tersedia.</li>
        </ul>
      </div>
    `;
  }

  function actionPage() {
    return `
      <div class="fft-viewer-paper">
        <span class="fft-viewer-kicker">Langkah Lanjut</span>
        <h2>Lanjutkan ke alur pendaftaran</h2>
        <p>Setelah membaca brosur, pengunjung dapat melihat alur pendaftaran atau menghubungi fakultas untuk informasi lanjutan.</p>
        <div class="fft-viewer-actions">
          <a href="alur-pendaftaran.html">Alur Pendaftaran</a>
          <a href="kontak.html">Kontak Fakultas</a>
        </div>
      </div>
    `;
  }

  function backPage(doc) {
    return `
      <div class="fft-viewer-cover fft-viewer-cover--back">
        <span></span>
        <strong>FFT</strong>
        <h2>${escapeHtml(doc.category || "E-Brochure")}</h2>
        <p>Universitas Advent Surya Nusantara</p>
      </div>
    `;
  }

  function spreads(doc) {
    return [
      { left: coverPage(doc), right: introPage(doc), label: "1-2 / 6" },
      { left: statusPage(doc), right: benefitPage(), label: "3-4 / 6" },
      { left: actionPage(doc), right: backPage(doc), label: "5-6 / 6" }
    ];
  }

  function setZoom(value) {
    zoom = Math.max(0.88, Math.min(1.14, value));
    const book = document.getElementById("fftViewerBook");
    if (book) {
      book.style.setProperty("--zoom", zoom);
    }
  }

  function render(direction) {
    if (!activeDoc) return;

    const all = spreads(activeDoc);
    activeSpread = Math.max(0, Math.min(all.length - 1, activeSpread));

    const book = document.getElementById("fftViewerBook");
    const left = document.getElementById("fftViewerLeftPage");
    const right = document.getElementById("fftViewerRightPage");
    const label = document.getElementById("fftViewerPageLabel");

    if (left) left.innerHTML = all[activeSpread].left;
    if (right) right.innerHTML = all[activeSpread].right;
    if (label) label.textContent = all[activeSpread].label;

    document.querySelector("[data-viewer-prev]").disabled = activeSpread === 0;
    document.querySelector("[data-viewer-next]").disabled = activeSpread === all.length - 1;

    const likeButton = document.querySelector("[data-viewer-like]");
    const liked = localStorage.getItem(likeKeyPrefix + activeDoc.slug) === "1";
    if (likeButton) likeButton.classList.toggle("is-active", liked);

    const downloadButton = document.querySelector("[data-viewer-download]");
    if (downloadButton) downloadButton.classList.toggle("is-disabled", !activeDoc.pdf);

    if (book && direction) {
      book.classList.remove("is-turn-next", "is-turn-prev");
      void book.offsetWidth;
      book.classList.add(direction === "prev" ? "is-turn-prev" : "is-turn-next");
      setTimeout(() => book.classList.remove("is-turn-next", "is-turn-prev"), 520);
    }
  }

  function openViewer(doc) {
    activeDoc = doc;
    activeSpread = 0;
    setZoom(1);

    const modal = ensureViewer();
    render();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("fft-viewer-lock");
    document.body.classList.add("fft-viewer-lock");
  }

  function closeViewer() {
    const modal = document.getElementById("fftBrochureViewerClean");
    if (!modal) return;

    modal.classList.remove("is-open", "is-focus");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("fft-viewer-lock");
    document.body.classList.remove("fft-viewer-lock");
  }

  function isMainPreviewButton(target) {
    const trigger = target.closest("a, button");
    if (!trigger) return false;
    if (trigger.closest(".ebrochure-card")) return false;

    const text = cleanText(trigger.textContent).toLowerCase();
    return text === "lihat preview brosur" || text.includes("lihat preview brosur");
  }

  document.addEventListener("click", function (event) {
    const cardPreview = event.target.closest(".ebrochure-card-preview");
    if (cardPreview) {
      event.preventDefault();
      event.stopPropagation();
      openViewer(getCardDoc(cardPreview));
      return;
    }

    if (isMainPreviewButton(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      openViewer(getMainDoc());
      return;
    }

    if (event.target.closest("[data-viewer-close]")) {
      event.preventDefault();
      closeViewer();
      return;
    }

    if (event.target.closest("[data-viewer-prev]")) {
      event.preventDefault();
      activeSpread -= 1;
      render("prev");
      return;
    }

    if (event.target.closest("[data-viewer-next]")) {
      event.preventDefault();
      activeSpread += 1;
      render("next");
      return;
    }

    if (event.target.closest("[data-viewer-overview]")) {
      event.preventDefault();
      activeSpread = 0;
      render("prev");
      return;
    }

    if (event.target.closest("[data-viewer-zoom-out]")) {
      event.preventDefault();
      setZoom(zoom - 0.06);
      return;
    }

    if (event.target.closest("[data-viewer-zoom-in]")) {
      event.preventDefault();
      setZoom(zoom + 0.06);
      return;
    }

    if (event.target.closest("[data-viewer-focus]")) {
      event.preventDefault();
      const modal = ensureViewer();
      modal.classList.toggle("is-focus");
      event.target.closest("[data-viewer-focus]").textContent = modal.classList.contains("is-focus") ? "Keluar" : "Fokus";
      return;
    }

    if (event.target.closest("[data-viewer-share]")) {
      event.preventDefault();

      const shareText = activeDoc ? activeDoc.title + " - FFT UASN" : "E-Brochure FFT UASN";
      const shareUrl = window.location.href.split("#")[0];

      if (navigator.share) {
        navigator.share({ title: shareText, text: shareText, url: shareUrl }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText + " " + shareUrl).then(() => {
          showToast("Link brosur disalin.");
        });
      } else {
        showToast("Browser belum mendukung fitur bagikan.");
      }

      return;
    }

    if (event.target.closest("[data-viewer-like]")) {
      event.preventDefault();
      if (!activeDoc) return;

      const key = likeKeyPrefix + activeDoc.slug;
      const liked = localStorage.getItem(key) === "1";

      if (liked) {
        localStorage.removeItem(key);
        showToast("Tanda suka dihapus.");
      } else {
        localStorage.setItem(key, "1");
        showToast("Brosur ditandai suka.");
      }

      render();
      return;
    }

    if (event.target.closest("[data-viewer-download]")) {
      event.preventDefault();

      if (!activeDoc || !activeDoc.pdf) {
        showToast("PDF belum tersedia.");
        return;
      }

      const link = document.createElement("a");
      link.href = activeDoc.pdf;
      link.download = activeDoc.slug + ".pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    const modal = document.getElementById("fftBrochureViewerClean");
    if (!modal || !modal.classList.contains("is-open")) return;

    if (event.key === "Escape") closeViewer();

    if (event.key === "ArrowRight") {
      activeSpread += 1;
      render("next");
    }

    if (event.key === "ArrowLeft") {
      activeSpread -= 1;
      render("prev");
    }
  });

  ensureViewer();
})();
