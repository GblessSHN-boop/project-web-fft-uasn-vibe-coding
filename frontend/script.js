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
    nav_leaders: "Faculty",
    nav_news: "News",
    nav_contact: "Contact",
    nav_about: "About FFT",
    nav_academic: "Academic",
    nav_admission: "Admission",
    nav_students: "Students",
    nav_why_choose: "Why Choose FFT",
    nav_quick_facts: "Quick Facts",
    nav_student_achievement: "Student Achievement",
    nav_top_leader: "Student Top Leader",
    nav_top_leader_short: "Top Leader",
    nav_graduates: "FFT Graduates",
    nav_admission_flow: "Admission Flow",
    nav_offline_simulation: "Offline Simulation",
    nav_requirements: "Requirements",
    nav_brochure: "E-Brochure",
    nav_testimonials: "Testimonials",

    view_more: "VIEW MORE",

    intro_title: "FACULTY OF PHILOSOPHY AND THEOLOGY",

    about_kicker: "About FFT",
    about_title: "Faculty of Philosophy and Theology",

    about_intro:
      "The Faculty of Philosophy and Theology (FFT) focuses on the study of:",
    about_item_1: "Philosophy",
    about_item_2: "Theology",
    about_item_3: "Biblical studies and spiritual leadership",
    about_item_4: "Ethics and morality based on Christian Adventist values",
    about_closing:
      "As part of an Adventist institution, this faculty is theologically affiliated with the teachings of the Seventh-day Adventist Church.",

      about_desc_1:
  "Develops reflective, critical, and ethical thinking in understanding academic, spiritual, and social issues.",
about_desc_2:
  "Studies Christian faith foundations, biblical doctrine, and theological understanding in a focused academic environment.",
about_desc_3:
  "Builds biblical literacy, service character, and spiritual leadership for the church and wider society.",
about_desc_4:
  "Strengthens moral sensitivity, integrity, and responsibility based on Christian Adventist values.",

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

    background_title: "BACKGROUND",
    background_p1:
      "The Faculty of Philosophy and Theology (FFT) of Universitas Advent Surya Nusantara was established to prepare students to become spiritual leaders, church servants, and educators with deep theological understanding grounded in Christian faith values.",
    background_p2:
      "In facing contemporary developments, the church and society need human resources who not only understand theology but also have critical thinking skills, spiritual leadership, and strong moral integrity.",
    background_p3:
      "Therefore, FFT serves as an educational space that integrates academic study, spiritual formation, and character development to prepare graduates who are ready to serve in churches, educational institutions, and wider society.",

    vision_title: "VISION",
    vision_text:
      "To become an excellent faculty in the development of philosophy and theology based on Christian Adventist values, producing graduates with integrity, spiritual character, and readiness to serve the church and society.",

    mission_title: "MISSION",
    mission_1: "Provide education and teaching in philosophy and theology.",
    mission_2: "Develop deep biblical understanding among students.",
    mission_3: "Build spiritual leadership with integrity.",
    mission_4: "Prepare graduates to serve the church and society.",

    organization_title: "ORGANIZATION",
    organization_subtitle: "STUDENT ASSOCIATION",
    organization_label: "HIMA",
    organization_heading: "STUDENT ASSOCIATION",
    organization_small: "FACULTY OF PHILOSOPHY AND THEOLOGY",
    organization_text:
      "The Student Association of the Faculty of Philosophy and Theology (HIMA FFT) is a student organization that supports leadership development, togetherness, and student service through academic, spiritual, and social activities.",
    organization_more: "Read more...",

        organization_left_alt: "Left organization logo",
    organization_right_alt: "Right organization logo",

    news_watermark_alt: "HIMA FFT watermark",
    footer_logo_alt: "Faculty of Philosophy and Theology logo",

    footer_academic_economics: "Faculty of Economics",
    footer_academic_health: "Faculty of Health",
    footer_academic_information_system:
      "Faculty of Information Systems and Computer Science",

    footer_dev_text:
      "This website was developed by a student of the Faculty of Information Systems and Computer Science, Universitas Advent Surya Nusantara:",

    news_title: "NEWS",
    news_subtitle: "UNIVERSITAS ADVENT SURYA NUSANTARA",
    banner_empty: "INFORMATION BANNER IS NOT AVAILABLE YET",
    trending_title: "LATEST NEWS",
    news_search_placeholder: "Search news...",
    news_empty_state: "No news matches your search.",
    news_footer_note: "This news content is protected by copyright.",
    news_legal: "Terms & Report",

    footer_brand_title: "FACULTY OF PHILOSOPHY AND THEOLOGY",
    footer_brand_university: "UNIVERSITAS ADVENT SURYA NUSANTARA",
    footer_brand_desc:
      "A faculty committed to character development, service, and academic excellence based on Christian values.",
    footer_academic: "Academic",
    footer_contact_title: "Faculty Contact",
    footer_contact_faculty: "Faculty of Philosophy and Theology",
    footer_contact_university: "Universitas Advent Surya Nusantara",
    footer_address_1: "Jl. Rakutta Sembiring No. 01",
    footer_address_2: "Siantar Martoba, Pematangsiantar",
    footer_email: "Email: fft@uasn.ac.id",
    footer_wa_dean: "Dean WhatsApp",
    footer_wa_secretary: "Secretary WhatsApp",
    footer_email_button: "Faculty Email",
    footer_instagram: "Faculty Instagram",
    footer_map: "Campus Location",
    footer_copy:
      "© 2026 Faculty of Philosophy and Theology - Universitas Advent Surya Nusantara. All rights reserved.",

      popup_title: "JOIN US",
      popup_dean: "DEAN",
      popup_secretary: "SECRETARY",
      popup_close: "Close",
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
    nav_leaders: "Dosen",
    nav_news: "Berita",
    nav_contact: "Kontak",
    nav_about: "Tentang FFT",
    nav_academic: "Akademik",
    nav_admission: "Pendaftaran",
    nav_students: "Mahasiswa",
    nav_why_choose: "Why Choose FFT",
    nav_quick_facts: "Quick Facts",
    nav_student_achievement: "Prestasi Mahasiswa",
    nav_top_leader: "Top Leader Mahasiswa",
    nav_top_leader_short: "Top Leader",
    nav_graduates: "Lulusan FFT",
    nav_admission_flow: "Alur Pendaftaran",
    nav_offline_simulation: "Simulasi Offline",
    nav_requirements: "Persyaratan",
    nav_brochure: "E-Brochure",
    nav_testimonials: "Testimoni",

    view_more: "VIEW MORE",

    intro_title: "FAKULTAS FILSAFAT TEOLOGI",

    about_kicker: "Tentang FFT",
    about_title: "Fakultas Filsafat Teologi",

    about_intro:
      "Fakultas Filsafat Teologi (FFT) adalah fakultas yang berfokus pada pengkajian:",
    about_item_1: "Ilmu Filsafat",
    about_item_2: "Ilmu Teologi (Ilmu Ketuhanan)",
    about_item_3: "Studi Alkitab dan kepemimpinan rohani",
    about_item_4: "Etika dan moralitas berbasis nilai Kristen Advent",
    about_closing:
      "Karena berada di bawah institusi “Advent”, maka secara teologis fakultas ini berafiliasi dengan ajaran Gereja Masehi Advent Hari Ketujuh.",

    about_desc_1:
  "Mengembangkan kemampuan berpikir reflektif, kritis, dan etis dalam memahami persoalan akademik, spiritual, dan sosial.",
about_desc_2:
  "Mengkaji dasar iman Kristen, doktrin Alkitabiah, dan pemahaman teologis dalam ruang akademik yang terarah.",
about_desc_3:
  "Membentuk literasi Alkitab, karakter pelayanan, dan kepemimpinan rohani untuk gereja serta masyarakat.",
about_desc_4:
  "Menanamkan kepekaan moral, integritas, dan tanggung jawab berdasarkan nilai-nilai Kristen Advent.",

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

    background_title: "LATAR BELAKANG",
    background_p1:
      "Fakultas Filsafat Teologi (FFT) Universitas Advent Surya Nusantara didirikan untuk mempersiapkan mahasiswa menjadi pemimpin rohani, pelayan gereja, serta pendidik yang memiliki pemahaman teologis yang mendalam dan berlandaskan nilai-nilai iman Kristen.",
    background_p2:
      "Dalam menghadapi perkembangan zaman, gereja dan masyarakat membutuhkan sumber daya manusia yang tidak hanya memiliki pengetahuan teologi, tetapi juga kemampuan berpikir kritis, kepemimpinan rohani, serta integritas moral yang kuat.",
    background_p3:
      "Oleh karena itu, FFT hadir sebagai wadah pendidikan yang memadukan kajian akademik, pembinaan spiritual, serta pengembangan karakter untuk mempersiapkan lulusan yang siap melayani di gereja, lembaga pendidikan, maupun masyarakat luas.",

    vision_title: "VISI",
    vision_text:
      "Menjadi fakultas yang unggul dalam pengembangan ilmu filsafat dan teologi yang berlandaskan nilai-nilai iman Kristen Advent serta menghasilkan lulusan yang berintegritas, berkarakter rohani, dan siap melayani gereja serta masyarakat.",

    mission_title: "MISI",
    mission_1: "Menyelenggarakan pendidikan dan pengajaran di bidang filsafat dan teologi.",
    mission_2: "Mengembangkan pemahaman Alkitabiah yang mendalam bagi mahasiswa.",
    mission_3: "Membentuk kepemimpinan rohani yang berintegritas.",
    mission_4: "Mempersiapkan lulusan yang siap melayani gereja dan masyarakat.",

    organization_title: "ORGANISASI",
    organization_subtitle: "HIMPUNAN MAHASISWA",
    organization_label: "HIMA",
    organization_heading: "HIMPUNAN MAHASISWA",
    organization_small: "FAKULTAS FILSAFAT TEOLOGI",
    organization_text:
      "Himpunan Mahasiswa Fakultas Filsafat Teologi (HIMA FFT) adalah organisasi kemahasiswaan yang menjadi wadah pengembangan kepemimpinan, kebersamaan, dan pelayanan mahasiswa dalam kegiatan akademik, rohani, dan sosial.",
    organization_more: "Selengkapnya...",

        organization_left_alt: "Logo Organisasi Kiri",
    organization_right_alt: "Logo Organisasi Kanan",

    news_watermark_alt: "Watermark HIMA FFT",
    footer_logo_alt: "Logo Fakultas Filsafat Teologi",

    footer_academic_economics: "Fakultas Ekonomi",
    footer_academic_health: "Fakultas Kesehatan",
    footer_academic_information_system:
      "Fakultas Sistem Informasi & Ilmu Komputer",

    footer_dev_text:
      "Website ini dikembangkan oleh mahasiswa Fakultas Sistem Informasi & Ilmu Komputer Universitas Advent Surya Nusantara:",

    news_title: "BERITA",
    news_subtitle: "UNIVERSITAS ADVENT SURYA NUSANTARA",
    banner_empty: "BANNER INFORMASI BELUM TERSEDIA",
    trending_title: "BERITA TERBARU",
    news_search_placeholder: "Cari berita...",
    news_empty_state: "Tidak ada berita yang sesuai dengan pencarian Anda.",
    news_footer_note: "Berita ini merupakan konten yang dilindungi hak cipta.",
    news_legal: "Ketentuan & Pengaduan",

    footer_brand_title: "FAKULTAS FILSAFAT TEOLOGI",
    footer_brand_university: "UNIVERSITAS ADVENT SURYA NUSANTARA",
    footer_brand_desc:
      "Fakultas yang berkomitmen pada pengembangan karakter, pelayanan, dan keunggulan akademik berdasarkan nilai-nilai Kristiani.",
    footer_academic: "Akademik",
    footer_contact_title: "Kontak Fakultas",
    footer_contact_faculty: "Fakultas Filsafat Teologi",
    footer_contact_university: "Universitas Advent Surya Nusantara",
    footer_address_1: "Jl. Rakutta Sembiring No. 01",
    footer_address_2: "Siantar Martoba, Pematangsiantar",
    footer_email: "Email: fft@uasn.ac.id",
    footer_wa_dean: "WhatsApp Dekan",
    footer_wa_secretary: "WhatsApp Sekretaris",
    footer_email_button: "Email Fakultas",
    footer_instagram: "Instagram Fakultas",
    footer_map: "Lokasi Kampus",
    footer_copy:
      "© 2026 Fakultas Filsafat Teologi - Universitas Advent Surya Nusantara. Seluruh hak cipta dilindungi.",
    
      popup_title: "AYO GABUNG BERSAMA KAMI",
      popup_dean: "DEKAN",
      popup_secretary: "SEKRETARIS",
      popup_close: "Tutup",
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

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const translatedText = translations[selectedLanguage][key];

    if (translatedText) {
      element.setAttribute("placeholder", translatedText);
    }
  });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const key = element.dataset.i18nAlt;
    const translatedText = translations[selectedLanguage][key];

    if (translatedText) {
      element.setAttribute("alt", translatedText);
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
/* EN: HEADER STAYS STABLE BY CSS | ID: HEADER DIBUAT STABIL DENGAN CSS */
/* ===================== */

const siteHeader = document.getElementById("siteHeader");

if (siteHeader) {
  siteHeader.classList.remove("is-scrolled");
}
  
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

/* EN | ID: Reading progress bar */
document.addEventListener("DOMContentLoaded", function () {
  const readingProgress = document.getElementById("readingProgress");

  if (!readingProgress) return;

  function updateReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    readingProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
});

/* =========================================================
   EN | ID: FFT NAV DROPDOWN LOGIC FINAL
   Logic dropdown desktop dan mobile untuk navbar utama
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  if (!dropdowns.length) return;

  function closeDropdowns(exceptItem) {
    dropdowns.forEach(function (item) {
      if (item === exceptItem) return;

      item.classList.remove("is-open");

      const button = item.querySelector(".nav-dropdown-toggle");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  dropdowns.forEach(function (item) {
    const button = item.querySelector(".nav-dropdown-toggle");

    if (!button) return;

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const willOpen = !item.classList.contains("is-open");

      closeDropdowns(item);

      item.classList.toggle("is-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", function () {
    closeDropdowns();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDropdowns();
    }
  });

  document.querySelectorAll(".dropdown-menu a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeDropdowns();
    });
  });
});

