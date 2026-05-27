/* FFT_SIMULASI_OFFLINE_REBUILD_CLEAN_20260527
   Interaksi ringan untuk page Simulasi Pendaftaran Offline.
   Tidak ada sistem approve lama.
*/

(function () {
  "use strict";

  var text = {
    id: {
      hero_kicker: "Pendaftaran",
      hero_title: "Simulasi Pendaftaran Offline",
      hero_lead: "Pahami alur kunjungan kampus sebelum datang ke Fakultas Filsafat Teologi. Halaman ini membantu calon mahasiswa menyiapkan pertanyaan, dokumen awal, dan kanal komunikasi agar proses pendaftaran lebih terarah.",
      hero_primary: "Lihat Alur Simulasi",
      hero_secondary: "Hubungi Fakultas",
      hero_panel_label: "Ringkasan",
      hero_panel_title: "Kunjungan lebih siap, komunikasi lebih jelas.",
      hero_panel_text: "Konten ini disusun sementara dan siap dikembangkan melalui backend serta admin dashboard.",

      intro_kicker: "Tujuan Halaman",
      intro_title: "Membantu calon mahasiswa mengambil langkah awal dengan percaya diri.",
      intro_text: "Simulasi ini bukan pendaftaran final. Fungsinya adalah memberi gambaran layanan offline, memperjelas dokumen yang perlu disiapkan, dan membantu calon mahasiswa memahami tahap komunikasi dengan fakultas.",

      benefit_1_title: "Persiapan lebih terarah",
      benefit_1_text: "Calon mahasiswa dapat memahami informasi penting sebelum datang ke kampus.",
      benefit_2_title: "Konsultasi lebih efektif",
      benefit_2_text: "Pertanyaan tentang program studi, dokumen, biaya, dan jadwal dapat disusun lebih rapi.",
      benefit_3_title: "Komunikasi lebih cepat",
      benefit_3_text: "Kontak aktif membantu fakultas memberi arahan lanjutan setelah konsultasi awal.",

      flow_kicker: "Alur Layanan",
      flow_title: "Tahapan simulasi pendaftaran langsung di kampus.",
      flow_text: "Alur ini dibuat sederhana agar calon mahasiswa dapat membaca urutan layanan dengan cepat di mobile maupun desktop.",

      step_1_title: "Rencana Kunjungan",
      step_1_text: "Calon mahasiswa menentukan waktu kunjungan dan menyiapkan pertanyaan utama sebelum datang ke kampus.",
      step_2_title: "Konsultasi Awal",
      step_2_text: "Petugas menjelaskan program studi, gambaran administrasi, dan informasi awal yang perlu dipahami.",
      step_3_title: "Pemeriksaan Dokumen",
      step_3_text: "Dokumen awal diperiksa agar calon mahasiswa mengetahui data yang sudah siap dan data yang perlu dilengkapi.",
      step_4_title: "Arahan Administrasi",
      step_4_text: "Calon mahasiswa mendapat gambaran tahap administrasi sebelum mengikuti proses pendaftaran resmi.",
      step_5_title: "Konfirmasi Kontak",
      step_5_text: "Nomor WhatsApp atau email aktif dicatat agar fakultas dapat menyampaikan informasi lanjutan.",

      prepare_kicker: "Persiapan",
      prepare_title: "Sebelum datang ke kampus, siapkan hal penting ini.",
      prepare_1: "Identitas diri calon mahasiswa.",
      prepare_2: "Ijazah, surat keterangan lulus, atau dokumen pendidikan sementara.",
      prepare_3: "Nomor WhatsApp aktif untuk komunikasi lanjutan.",
      prepare_4: "Pertanyaan tentang program studi, biaya, jadwal, dan proses administrasi.",

      admin_kicker: "Konten Dinamis",
      admin_title: "Siap disambungkan ke backend dan admin dashboard.",
      admin_text: "Struktur halaman ini disiapkan agar konten utama, daftar persiapan, pertanyaan umum, dan metadata SEO dapat dikelola dari dashboard admin ketika sistem backend diaktifkan.",

      faq_kicker: "Pertanyaan Umum",
      faq_title: "Informasi awal untuk calon mahasiswa.",
      faq_1_q: "Apakah simulasi ini sama dengan pendaftaran final?",
      faq_1_a: "Tidak. Simulasi ini hanya membantu calon mahasiswa memahami alur awal sebelum mengikuti pendaftaran resmi.",
      faq_2_q: "Apakah calon mahasiswa harus datang ke kampus?",
      faq_2_a: "Kunjungan kampus membantu konsultasi lebih jelas, tetapi informasi awal tetap dapat ditanyakan melalui kontak fakultas.",
      faq_3_q: "Dokumen apa yang perlu disiapkan?",
      faq_3_a: "Siapkan identitas diri, dokumen pendidikan yang tersedia, dan nomor kontak aktif untuk informasi lanjutan.",
      faq_4_q: "Apakah halaman ini akan diperbarui?",
      faq_4_a: "Ya. Konten halaman ini disiapkan agar nantinya dapat diperbarui melalui backend dan admin dashboard.",

      final_kicker: "Langkah Berikutnya",
      final_title: "Mulai dari informasi yang jelas, lanjutkan dengan komunikasi yang tepat.",
      final_text: "Calon mahasiswa dapat membaca alur pendaftaran, menyiapkan dokumen awal, lalu menghubungi fakultas untuk arahan lanjutan.",
      final_primary: "Baca Alur Pendaftaran",
      final_secondary: "Tanya Fakultas"
    },

    en: {
      hero_kicker: "Admission",
      hero_title: "Offline Admission Simulation",
      hero_lead: "Understand the campus visit flow before coming to the Faculty Of Theology. This page helps prospective students prepare questions, initial documents, and communication channels for a clearer admission journey.",
      hero_primary: "View Simulation Flow",
      hero_secondary: "Contact the Faculty",
      hero_panel_label: "Overview",
      hero_panel_title: "Arrive prepared and communicate clearly.",
      hero_panel_text: "This content is temporary and ready to be expanded through the backend and admin dashboard.",

      intro_kicker: "Page Purpose",
      intro_title: "Helping prospective students take the first step with confidence.",
      intro_text: "This simulation is not the final admission process. It gives an overview of offline service, clarifies the documents to prepare, and helps prospective students understand faculty communication stages.",

      benefit_1_title: "More focused preparation",
      benefit_1_text: "Prospective students can understand important information before visiting campus.",
      benefit_2_title: "More effective consultation",
      benefit_2_text: "Questions about study programs, documents, fees, and schedules can be prepared more clearly.",
      benefit_3_title: "Faster communication",
      benefit_3_text: "An active contact helps the faculty provide follow up guidance after the first consultation.",

      flow_kicker: "Service Flow",
      flow_title: "Offline admission simulation stages on campus.",
      flow_text: "This flow is designed to be simple so prospective students can read the service sequence quickly on mobile and desktop.",

      step_1_title: "Visit Planning",
      step_1_text: "Prospective students choose a visit time and prepare key questions before coming to campus.",
      step_2_title: "Initial Consultation",
      step_2_text: "Staff explain the study program, administrative overview, and initial information that needs to be understood.",
      step_3_title: "Document Review",
      step_3_text: "Initial documents are reviewed so prospective students can see which data is ready and which data needs completion.",
      step_4_title: "Administrative Guidance",
      step_4_text: "Prospective students receive an overview of administrative stages before joining the official admission process.",
      step_5_title: "Contact Confirmation",
      step_5_text: "An active WhatsApp number or email is recorded so the faculty can send follow up information.",

      prepare_kicker: "Preparation",
      prepare_title: "Before visiting campus, prepare these important items.",
      prepare_1: "Prospective student identity document.",
      prepare_2: "Diploma, graduation statement, or temporary education document.",
      prepare_3: "Active WhatsApp number for follow up communication.",
      prepare_4: "Questions about the study program, fees, schedule, and administration process.",

      admin_kicker: "Dynamic Content",
      admin_title: "Ready to connect with backend and admin dashboard.",
      admin_text: "This page structure is prepared so main content, preparation lists, frequently asked questions, and SEO metadata can be managed from the admin dashboard when the backend system is enabled.",

      faq_kicker: "FAQ",
      faq_title: "Initial information for prospective students.",
      faq_1_q: "Is this simulation the same as final admission?",
      faq_1_a: "No. This simulation helps prospective students understand the initial flow before following the official admission process.",
      faq_2_q: "Do prospective students have to visit campus?",
      faq_2_a: "A campus visit helps make consultation clearer, but initial information can still be asked through the faculty contact.",
      faq_3_q: "What documents should be prepared?",
      faq_3_a: "Prepare an identity document, available education documents, and an active contact number for follow up information.",
      faq_4_q: "Will this page be updated?",
      faq_4_a: "Yes. This page is prepared so it can later be updated through the backend and admin dashboard.",

      final_kicker: "Next Step",
      final_title: "Start with clear information, then continue with the right communication.",
      final_text: "Prospective students can read the admission flow, prepare initial documents, and contact the faculty for further guidance.",
      final_primary: "Read Admission Flow",
      final_secondary: "Ask the Faculty"
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

  function setTextContent(lang) {
    var table = text[lang] || text.id;

    document.querySelectorAll("[data-sim-key]").forEach(function (element) {
      var key = element.getAttribute("data-sim-key");

      if (!key || !table[key]) return;

      element.textContent = table[key];
    });
  }

  function updateSeoFromLang(lang) {
    var seo = {
      id: {
        title: "Simulasi Pendaftaran Offline FFT UASN | Faculty Of Theology",
        description: "Panduan simulasi pendaftaran offline FFT UASN untuk membantu calon mahasiswa memahami alur kunjungan kampus, konsultasi awal, persiapan dokumen, dan komunikasi lanjutan dengan Faculty Of Theology UASN."
      },
      en: {
        title: "Offline Admission Simulation FFT UASN | Faculty Of Theology",
        description: "Offline admission simulation guide for FFT UASN to help prospective students understand campus visit flow, initial consultation, document preparation, and follow up communication with the Faculty Of Theology UASN."
      }
    };

    var current = seo[lang] || seo.id;

    document.title = current.title;

    var description = document.querySelector('meta[name="description"]');
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDescription = document.querySelector('meta[property="og:description"]');
    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    var twitterDescription = document.querySelector('meta[name="twitter:description"]');

    if (description) description.setAttribute("content", current.description);
    if (ogTitle) ogTitle.setAttribute("content", current.title);
    if (ogDescription) ogDescription.setAttribute("content", current.description);
    if (twitterTitle) twitterTitle.setAttribute("content", current.title);
    if (twitterDescription) twitterDescription.setAttribute("content", current.description);
  }

  function applyLanguage() {
    var lang = getLang();

    setTextContent(lang);
    updateSeoFromLang(lang);
  }

  function revealOnScroll() {
    var items = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });

      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function smoothAnchor() {
    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest('a[href^="#"]')
        : null;

      if (!link) return;

      var target = document.querySelector(link.getAttribute("href"));

      if (!target) return;

      event.preventDefault();

      var header = document.querySelector(".site-header, header");
      var offset = header ? Math.max(84, header.getBoundingClientRect().height + 24) : 84;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, Math.round(top)),
        behavior: "smooth"
      });
    });
  }

  function fetchBackendContent() {
    var endpoint = "/api/simulasi-pendaftaran-offline";

    fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Backend content not available yet");
        return response.json();
      })
      .then(function (payload) {
        if (!payload || !payload.data) return;

        if (payload.data.i18n && typeof payload.data.i18n === "object") {
          if (payload.data.i18n.id) {
            Object.assign(text.id, payload.data.i18n.id);
          }

          if (payload.data.i18n.en) {
            Object.assign(text.en, payload.data.i18n.en);
          }

          applyLanguage();
        }
      })
      .catch(function () {});
  }

  function boot() {
    applyLanguage();
    revealOnScroll();
    smoothAnchor();
    fetchBackendContent();

    setTimeout(applyLanguage, 160);
    setTimeout(applyLanguage, 520);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("pageshow", boot);

  document.addEventListener("click", function (event) {
    var langButton = event.target && event.target.closest
      ? event.target.closest("[data-fft-lang], [data-lang], .fft-floating-language-btn")
      : null;

    if (!langButton) return;

    setTimeout(applyLanguage, 80);
    setTimeout(applyLanguage, 260);
    setTimeout(applyLanguage, 620);
  }, true);
}());
