document.addEventListener("DOMContentLoaded", function () {
  console.log("JS TERLOAD");

  /* ===================== */
  /* PRELOADER */
  /* ===================== */

  const preloader = document.querySelector(".preloader");

  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      preloader.style.transition = "opacity 0.5s ease";

      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }, 800);
  }

  /* ===================== */
  /* NAVIGATION TOGGLE */
  /* ===================== */

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".sidebar-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      nav.classList.toggle("active");
      toggle.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    function closeMenu() {
      nav.classList.remove("active");
      toggle.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  }

  /* ===================== */
  /* POPUP DAFTAR */
  /* ===================== */

  const daftarBtn = document.querySelector(".daftar-btn");
  const popup = document.getElementById("popupDaftar");
  const closePopup = document.getElementById("closePopup");

  if (daftarBtn && popup) {
    daftarBtn.addEventListener("click", function (e) {
      e.preventDefault();
      popup.classList.add("active");
    });
  }

  if (closePopup && popup) {
    closePopup.addEventListener("click", function () {
      popup.classList.remove("active");
    });
  }

/* ===================== */
/* EN: LANGUAGE SWITCHER | ID: PENGGANTI BAHASA */
/* ===================== */

const translations = {
  en: {
    top_website: "UASN Website",
    top_quick_access: "Quick Access",
    top_apply: "APPLY NOW",

    brand_faculty: "FACULTY OF PHILOSOPHY AND THEOLOGY",
    brand_university: "UNIVERSITAS ADVENT SURYA NUSANTARA",

    nav_program: "Study Program",
    nav_background: "Background",
    nav_vision: "Vision & Mission",
    nav_organization: "Organization",
    nav_leaders: "Leaders & Lecturers",
    nav_news: "News",
    nav_contact: "Contact",

    program_kicker: "Academic Program",
    program_title: "Study Program",
    program_lead:
      "The Faculty of Philosophy and Theology offers academic programs focused on developing spiritual leaders, educators, and community servants with a strong foundation in theology, philosophy, and Christian character.",

    program_1_label: "Undergraduate",
    program_1_title: "Theology Study Program",
    program_1_desc:
      "This program studies Christian theology in depth, including biblical doctrine, spiritual leadership, church ministry, and spiritual character development.",
    program_1_point_1: "Focuses on biblical understanding and church ministry.",
    program_1_point_2: "Develops spiritual leadership with integrity.",
    program_1_point_3: "Prepares graduates for ministry and education.",

    program_2_label: "Undergraduate",
    program_2_title: "Religious Philosophy Study Program",
    program_2_desc:
      "This program prepares students to become competent Christian religious educators in teaching, faith formation, ethics, and educational ministry.",
    program_2_point_1: "Focuses on philosophy, ethics, and religious education.",
    program_2_point_2: "Supports the development of critical thinking skills.",
    program_2_point_3: "Prepares graduates for schools, churches, and society.",
  },

  id: {
    top_website: "Website UASN",
    top_quick_access: "Akses Cepat",
    top_apply: "DAFTAR SEKARANG",

    brand_faculty: "FAKULTAS FILSAFAT TEOLOGI",
    brand_university: "UNIVERSITAS ADVENT SURYA NUSANTARA",

    nav_program: "Program Studi",
    nav_background: "Latar Belakang",
    nav_vision: "Visi & Misi",
    nav_organization: "Organisasi",
    nav_leaders: "Pimpinan & Dosen",
    nav_news: "Berita",
    nav_contact: "Kontak",

    program_kicker: "Program Akademik",
    program_title: "Program Studi",
    program_lead:
      "Fakultas Filsafat Teologi menyediakan program studi yang berfokus pada pembentukan pemimpin rohani, pendidik, dan pelayan masyarakat yang memiliki dasar teologi, filsafat, dan karakter Kristiani.",

    program_1_label: "Sarjana",
    program_1_title: "Program Studi Teologi",
    program_1_desc:
      "Program ini mempelajari teologi Kristen secara mendalam, meliputi doktrin Alkitab, kepemimpinan rohani, pelayanan gereja, dan pengembangan karakter spiritual.",
    program_1_point_1: "Fokus pada pemahaman Alkitab dan pelayanan gereja.",
    program_1_point_2: "Membentuk kepemimpinan rohani yang berintegritas.",
    program_1_point_3: "Mempersiapkan lulusan untuk pelayanan dan pendidikan.",

    program_2_label: "Sarjana",
    program_2_title: "Program Studi Filsafat Keagamaan",
    program_2_desc:
      "Program ini mempersiapkan mahasiswa menjadi pendidik agama Kristen yang kompeten dalam pengajaran, pembinaan iman, etika, dan pelayanan pendidikan.",
    program_2_point_1: "Fokus pada filsafat, etika, dan pendidikan agama.",
    program_2_point_2: "Mendukung pengembangan kemampuan berpikir kritis.",
    program_2_point_3: "Mempersiapkan lulusan untuk sekolah, gereja, dan masyarakat.",
  },
};

const langButtons = document.querySelectorAll(".lang-btn");
const translatableElements = document.querySelectorAll("[data-i18n]");
const savedLanguage = localStorage.getItem("fftLanguage") || "id";

function applyLanguage(language) {
  const selectedLanguage = translations[language] ? language : "id";

  translatableElements.forEach((element) => {
    const key = element.dataset.i18n;
    const translatedText = translations[selectedLanguage][key];

    if (translatedText) {
      element.textContent = translatedText;
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === selectedLanguage);
  });

  document.documentElement.lang = selectedLanguage;
  localStorage.setItem("fftLanguage", selectedLanguage);
}

langButtons.forEach((button) => {
  button.addEventListener("click", function () {
    applyLanguage(button.dataset.lang);
  });
});

applyLanguage(savedLanguage);

/* ===================== */
/* EN: SMART STICKY HEADER | ID: HEADER STICKY HALUS */
/* ===================== */

const siteHeader = document.getElementById("siteHeader");

function updateHeaderState() {
  if (!siteHeader) return;

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 80);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* ===================== */
  /* HERO VIEW MORE */
  /* ===================== */

  const viewMoreBtn = document.getElementById("viewMoreBtn");
  const target = document.getElementById("tentang-fft");

  if (viewMoreBtn && target) {
    viewMoreBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition +
        window.pageYOffset -
        window.innerHeight / 2 +
        target.offsetHeight / 2;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  }

/* ===================== */
/* REVEAL READY */
/* ===================== */

const isPimpinanPage = document.querySelector(".pimpinan-page");

if (isPimpinanPage) {
  document
    .querySelector(".pimpinan-hero-inner")
    ?.classList.add("is-visible");
  document
    .querySelector(".dekan-panel")
    ?.classList.add("is-visible");
  document
    .querySelector(".dosen-panel")
    ?.classList.add("is-visible");
} else {
  document.body.classList.add("reveal-ready");
}

  /* ===================== */
  /* BERITA FRONTEND DINAMIS */
  /* ===================== */

  const API_BASE = "http://127.0.0.1:5000";
  const STATIC_BASE = `${API_BASE}/static/`;

  loadBannerInformasi();
  loadBeritaHomepage();
  loadDekanFrontend();
  loadDosenFrontend();

  async function loadBannerInformasi() {
    const linkEl = document.getElementById("frontendBannerLink");
    const emptyEl = document.getElementById("frontendBannerEmpty");
    const imageEl = document.getElementById("frontendBannerImage");
    const videoEl = document.getElementById("frontendBannerVideo");

    if (!linkEl || !emptyEl || !imageEl || !videoEl) return;

    try {
      const response = await fetch(`${API_BASE}/api/banner-informasi`, {
        cache: "no-store",
      });
      const payload = await response.json();
      const banner = payload && payload.data ? payload.data : null;

      if (!payload || !payload.published || !banner || !banner.media_file) {
        return;
      }

      const mediaUrl = STATIC_BASE + banner.media_file;

      linkEl.href = banner.target_url || "#";
      linkEl.style.display = "block";
      emptyEl.style.display = "none";

      if ((banner.media_type || "").toLowerCase() === "image") {
        imageEl.src = mediaUrl;
        imageEl.style.display = "block";

        videoEl.pause();
        videoEl.removeAttribute("src");
        videoEl.load();
        videoEl.style.display = "none";
      } else {
        videoEl.src = mediaUrl;
        videoEl.style.display = "block";
        videoEl.load();

        imageEl.removeAttribute("src");
        imageEl.style.display = "none";
      }
    } catch (error) {
      console.error("Gagal memuat banner informasi:", error);
    }
  }

  async function loadBeritaHomepage() {
    const trendingContainer = document.getElementById(
      "beritaTrendingContainer",
    );
    const gridContainer = document.getElementById("beritaGridContainer");
    const searchInput = document.getElementById("beritaSearch");
    const emptyState = document.getElementById("beritaEmptyState");

    if (!trendingContainer || !gridContainer) return;

    try {
      const response = await fetch(`${API_BASE}/api/berita`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const trending = Array.isArray(payload.trending) ? payload.trending : [];
      const umum = Array.isArray(payload.umum) ? payload.umum : [];

      trendingContainer.innerHTML = "";
      gridContainer.innerHTML = "";

      if (trending.length === 0 && umum.length === 0) {
        trendingContainer.innerHTML = `
          <a href="#" onclick="return false;" class="berita-feature-card berita-feature-card-large berita-empty-card show">
            <div class="berita-image-wrap">
              <img src="berita/news-empty.png" alt="KONTEN BERITA BELUM TERSEDIA" />
            </div>
            <div class="berita-card-overlay">
              <p class="berita-title-text berita-title-empty">KONTEN BERITA BELUM TERSEDIA</p>
              <span class="berita-tag">TRENDING 1</span>
            </div>
          </a>

          <a href="#" onclick="return false;" class="berita-feature-card berita-feature-card-large berita-empty-card show">
            <div class="berita-image-wrap">
              <img src="berita/news-empty.png" alt="KONTEN BERITA BELUM TERSEDIA" />
            </div>
            <div class="berita-card-overlay">
              <p class="berita-title-text berita-title-empty">KONTEN BERITA BELUM TERSEDIA</p>
              <span class="berita-tag">TRENDING 2</span>
            </div>
          </a>
        `;

        if (emptyState) {
          emptyState.style.display = "none";
        }
        return;
      }

      trending.forEach((item, index) => {
        const imgSrc = item.thumbnail
          ? STATIC_BASE + item.thumbnail
          : "berita/news-empty.png";

        const card = document.createElement("a");
        card.className = "berita-feature-card berita-feature-card-large show";
        card.href = `berita-detail.html?id=${encodeURIComponent(item.id)}`;
        card.dataset.title = normalizeText(item.judul || "");

        card.innerHTML = `
          <div class="berita-image-wrap">
            <img src="${imgSrc}" alt="${escapeHtml(item.judul || "Berita")}" />
          </div>
          <div class="berita-card-overlay">
            ${item.is_new ? '<span class="berita-badge-new">NEW TITLE</span>' : ""}
            <p class="berita-title-text">${escapeHtml(item.judul || "Tanpa Judul")}</p>
            <span class="berita-date-chip">${formatTanggal(item.published_at || item.tayang_pada || item.created_at)}</span>
            <span class="berita-tag">TRENDING ${index + 1}</span>
          </div>
        `;

        trendingContainer.appendChild(card);
      });

      umum.forEach((item) => {
        const imgSrc = item.thumbnail
          ? STATIC_BASE + item.thumbnail
          : "berita/news-empty.png";

        const card = document.createElement("a");
        card.className = "berita-grid-item show";
        card.href = `berita-detail.html?id=${encodeURIComponent(item.id)}`;
        card.dataset.title = normalizeText(item.judul || "");

        card.innerHTML = `
          <div class="berita-grid-thumb">
            <img src="${imgSrc}" alt="${escapeHtml(item.judul || "Berita")}" />
          </div>
          ${item.is_new ? '<span class="berita-badge-new berita-badge-inline">NEW TITLE</span>' : ""}
          <p class="berita-grid-title">${escapeHtml(item.judul || "Tanpa Judul")}</p>
          <div class="berita-grid-meta">
            <span class="berita-grid-date">${formatTanggal(item.published_at || item.tayang_pada || item.created_at)}</span>
          </div>
        `;

        gridContainer.appendChild(card);
      });

      function filterBerita() {
        const keyword = normalizeText(searchInput ? searchInput.value : "");
        let visibleCount = 0;

        const allCards = [
          ...trendingContainer.querySelectorAll(".berita-feature-card"),
          ...gridContainer.querySelectorAll(".berita-grid-item"),
        ];

        allCards.forEach((card) => {
          const title = card.dataset.title || "";
          const isMatch = keyword === "" || title.includes(keyword);

          card.style.display = isMatch ? "" : "none";

          if (isMatch) {
            visibleCount++;
          }
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? "block" : "none";
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", filterBerita);
      }

      const animatedItems = document.querySelectorAll(
        ".berita-grid-item, .berita-feature-card",
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
            }
          });
        },
        {
          threshold: 0.2,
        },
      );

      animatedItems.forEach((item) => {
        observer.observe(item);
      });
    } catch (error) {
      console.error("Gagal memuat berita frontend:", error);
    }
  }

  /* ===================== */
  /* DEKAN & DOSEN DINAMIS */
  /* ===================== */

  function buildStaticUrl(path, type = "generic") {
    if (!path) return "fftkb.png";

    const cleanPath = String(path).replace(/^\/+/, "");

    if (/^https?:\/\//i.test(cleanPath)) {
      return cleanPath;
    }

    if (cleanPath.startsWith("uploads/")) {
      return `${API_BASE}/static/${cleanPath}`;
    }

    if (type === "dosen") {
      return `${API_BASE}/static/uploads/dosen/${cleanPath}`;
    }

    return `${API_BASE}/static/${cleanPath}`;
  }

  async function loadDekanFrontend() {
    const dekanImage = document.querySelector(".dekan-image");
    const dekanName = document.querySelector(".dekan-content h3");
    const dekanRole = document.querySelector(".dekan-role");
    const dekanBioItems = document.querySelectorAll(".dekan-bio li");

    if (!dekanImage || !dekanName || !dekanRole || dekanBioItems.length < 3) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/dekan`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result || !result.published || !result.data) {
        return;
      }

      const dekan = result.data;
      const imagePath = dekan.foto_frontend || dekan.foto_formal || "";
      const imageUrl = buildStaticUrl(imagePath, "dekan");

      dekanImage.src = imageUrl;
      dekanImage.alt = dekan.nama ? `Foto ${dekan.nama}` : "Foto Dekan";
      dekanImage.onerror = function () {
        this.onerror = null;
        this.src = "fftkb.png";
      };

      dekanName.textContent = (dekan.nama || "NAMA DEKAN").toUpperCase();
      dekanRole.textContent = (
        dekan.jabatan || "DEKAN FAKULTAS FILSAFAT TEOLOGI"
      ).toUpperCase();

      dekanBioItems[0].innerHTML = `<strong>Status Dosen:</strong> ${dekan.status || "-"}`;
      dekanBioItems[1].innerHTML = `<strong>Tempat Lahir:</strong> ${dekan.tempat_lahir || "-"}`;
      dekanBioItems[2].innerHTML = `<strong>Tanggal Lahir:</strong> ${dekan.tanggal_lahir || "-"}`;
    } catch (error) {
      console.error("Gagal memuat data dekan dari backend:", error);
    }
  }

  function formatBidang(bidang) {
    if (!bidang) return "";

    let cleaned = String(bidang)
      .replace(/\s+DAN\s+/gi, "\n")
      .replace(/,/g, "\n");

    let list = cleaned
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (list.length === 0) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return list[0] + " DAN " + list[1];

    const last = list.pop();
    return list.join(", ") + ", DAN " + last;
  }

  async function loadDosenFrontend() {
    const grid = document.getElementById("dosenGrid");
    if (!grid) return;

    try {
      const response = await fetch(`${API_BASE}/api/dosen`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const dosenList = result && Array.isArray(result.data) ? result.data : [];

      if (!result || !result.published || dosenList.length === 0) {
        grid.innerHTML = `<p style="padding:16px;">Data dosen belum tersedia.</p>`;
        return;
      }

      grid.innerHTML = "";

      dosenList.forEach((dosen) => {
        const imagePath = dosen.foto_frontend || dosen.foto_formal || "";
        const imageUrl = buildStaticUrl(imagePath, "dosen");

        const bidangFormatted = formatBidang(dosen.bidang_dosen);
        const roleText = bidangFormatted
          ? `${dosen.jabatan || "Dosen"} / ${bidangFormatted}`
          : dosen.jabatan || "Dosen";

        const card = document.createElement("article");
        card.className = "dosen-card";
        card.dataset.name = dosen.nama || "NAMA DOSEN";
        card.dataset.role = roleText;
        card.dataset.status = dosen.status || "-";
        card.dataset.birthplace = dosen.tempat_lahir || "-";
        card.dataset.birthdate = dosen.tanggal_lahir || "-";
        card.dataset.image = imageUrl;

        card.innerHTML = `
        <div class="dosen-card-image-wrap">
          <img
            src="${imageUrl}"
            alt="Foto ${dosen.nama || "Dosen"}"
            class="dosen-card-image"
            onerror="this.onerror=null;this.src='fftkb.png';" />
        </div>
        <div class="dosen-card-content">
          <h3>${(dosen.nama || "NAMA DOSEN").toUpperCase()}</h3>
          <p>${roleText.toUpperCase()}</p>
        </div>
      `;

        grid.appendChild(card);
        card.classList.add("is-visible");
      });

      initDynamicDosenPreview();
    } catch (error) {
      console.error("Gagal memuat dosen dari backend:", error);
      grid.innerHTML = `<p style="padding:16px;">Gagal memuat data dosen.</p>`;
    }
  }

  function initDynamicDosenPreview() {
    const dosenCards = document.querySelectorAll(".dosen-card");
    const previewOverlay = document.getElementById("dosenPreviewOverlay");
    const previewCard = document.getElementById("dosenPreviewCard");
    const previewClose = document.getElementById("dosenPreviewClose");

    const previewImage = document.getElementById("previewImage");
    const previewName = document.getElementById("previewName");
    const previewRole = document.getElementById("previewRole");
    const previewStatus = document.getElementById("previewStatus");
    const previewBirthplace = document.getElementById("previewBirthplace");
    const previewBirthdate = document.getElementById("previewBirthdate");

    if (
      !dosenCards.length ||
      !previewOverlay ||
      !previewCard ||
      !previewClose ||
      !previewImage ||
      !previewName ||
      !previewRole ||
      !previewStatus ||
      !previewBirthplace ||
      !previewBirthdate
    ) {
      return;
    }

    const desktopHoverMedia = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    let closeTimer = null;
    let hoverLockTimer = null;
    let hoverLocked = false;

    function fillPreview(card) {
      previewImage.src = card.dataset.image || "fftkb.png";
      previewImage.alt = card.dataset.name || "NAMA DOSEN";
      previewImage.onerror = function () {
        this.onerror = null;
        this.src = "fftkb.png";
      };

      previewName.textContent = card.dataset.name || "NAMA DOSEN";
      previewRole.textContent = card.dataset.role || "JABATAN / BIDANG DOSEN";
      previewStatus.textContent = card.dataset.status || "-";
      previewBirthplace.textContent = card.dataset.birthplace || "-";
      previewBirthdate.textContent = card.dataset.birthdate || "-";
    }

    function clearCloseTimer() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function clearHoverLockTimer() {
      if (hoverLockTimer) {
        clearTimeout(hoverLockTimer);
        hoverLockTimer = null;
      }
    }

    function setHoverLock(duration = 220) {
      hoverLocked = true;
      clearHoverLockTimer();

      hoverLockTimer = setTimeout(() => {
        hoverLocked = false;
        hoverLockTimer = null;
      }, duration);
    }

    function openPreview(card, options = {}) {
      const { force = false } = options;

      if (!force && desktopHoverMedia.matches && hoverLocked) return;

      fillPreview(card);
      clearCloseTimer();

      previewOverlay.classList.add("active");
      previewOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    function closePreview(options = {}) {
      const { useHoverLock = false } = options;

      clearCloseTimer();

      previewOverlay.classList.remove("active");
      previewOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");

      if (useHoverLock && desktopHoverMedia.matches) {
        setHoverLock(220);
      }
    }

    function delayedClose() {
      clearCloseTimer();

      closeTimer = setTimeout(() => {
        closePreview({ useHoverLock: true });
      }, 140);
    }

    dosenCards.forEach((card) => {
      card.setAttribute("tabindex", "0");

      card.addEventListener("mouseenter", () => {
        if (!desktopHoverMedia.matches) return;
        openPreview(card);
      });

      card.addEventListener("mouseleave", () => {
        if (!desktopHoverMedia.matches) return;
        delayedClose();
      });

      card.addEventListener("click", (e) => {
        if (desktopHoverMedia.matches) return;
        e.preventDefault();
        openPreview(card, { force: true });
      });

      card.addEventListener("focus", () => {
        if (!desktopHoverMedia.matches) return;
        openPreview(card, { force: true });
      });

      card.addEventListener("blur", () => {
        if (!desktopHoverMedia.matches) return;
        delayedClose();
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreview(card, { force: true });
        }
      });
    });

    previewCard.addEventListener("mouseenter", () => {
      if (!desktopHoverMedia.matches) return;
      clearCloseTimer();
    });

    previewCard.addEventListener("mouseleave", () => {
      if (!desktopHoverMedia.matches) return;
      delayedClose();
    });

    previewClose.addEventListener("click", () => {
      closePreview({ useHoverLock: true });
    });

    previewOverlay.addEventListener("click", (e) => {
      if (e.target === previewOverlay) {
        closePreview({ useHoverLock: false });
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && previewOverlay.classList.contains("active")) {
        closePreview({ useHoverLock: desktopHoverMedia.matches });
      }
    });
  }

  function formatTanggal(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});

document.addEventListener("mousemove", function (e) {
  const particle = document.createElement("div");
  particle.classList.add("particle");

  const redPalette = [
    "rgba(133, 14, 53, 0.78)",
    "rgba(95, 14, 14, 0.78)",
    "rgba(255, 42, 42, 0.55)",
    "rgba(252, 245, 238, 0.45)",
  ];

  const color = redPalette[Math.floor(Math.random() * redPalette.length)];

  particle.style.background = color;
  particle.style.left = e.clientX + "px";
  particle.style.top = e.clientY + "px";

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 800);
});

/* HERO SLIDER */

const slides = document.querySelectorAll(".slide");

if (slides.length) {
  let index = 0;

  function changeSlide() {
    slides[index].classList.remove("active");

    index++;

    if (index >= slides.length) {
      index = 0;
    }

    slides[index].classList.add("active");
  }

  setInterval(changeSlide, 4000);
}

const latarCard = document.querySelector(".latar-card");

if (latarCard) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        latarCard.classList.add("show");
      }
    });
  });

  observer.observe(latarCard);
}

const fftAboutContent = document.querySelector(".fft-about-content");

if (fftAboutContent) {
  const aboutObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.28,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  aboutObserver.observe(fftAboutContent);
}

const programCards = document.querySelectorAll(".program-card");

if (programCards.length) {
  const programCardObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  programCards.forEach((card) => {
    programCardObserver.observe(card);
  });
}

const visiCard = document.querySelector(".visi-card");

if (visiCard) {
  const visiObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  visiObserver.observe(visiCard);
}
