/* FFT_KALENDER_AKADEMIK_MOBILE_POLISH_20260522
   Redesign mobile Kalender Akademik Fakultas.
   Data sementara dibuat placeholder sampai admin dashboard mengisi data kalender.
*/
(function () {
  "use strict";

  const mq = window.matchMedia("(max-width: 768px)");

  const events = [
    {
      title: "Registrasi dan Pengisian KRS",
      date: "Tanggal akan diumumkan",
      desc: "Agenda registrasi akademik, pengisian rencana studi, dan validasi administrasi mahasiswa akan ditampilkan setelah data resmi tersedia.",
      type: "Administrasi",
      status: "Segera Hadir"
    },
    {
      title: "Awal Perkuliahan",
      date: "Tanggal akan diumumkan",
      desc: "Informasi awal perkuliahan, jadwal pertemuan, dan ketentuan akademik semester berjalan akan disesuaikan dengan kalender fakultas.",
      type: "Perkuliahan",
      status: "Segera Hadir"
    },
    {
      title: "Ujian Tengah Semester",
      date: "Tanggal akan diumumkan",
      desc: "Periode UTS akan diumumkan setelah jadwal akademik disahkan oleh fakultas dan program studi.",
      type: "Evaluasi",
      status: "Segera Hadir"
    },
    {
      title: "Ujian Akhir Semester",
      date: "Tanggal akan diumumkan",
      desc: "Periode UAS, ketentuan pelaksanaan, dan jadwal evaluasi akhir akan mengikuti pengumuman resmi fakultas.",
      type: "Evaluasi",
      status: "Segera Hadir"
    },
    {
      title: "Yudisium dan Pelaporan Nilai",
      date: "Tanggal akan diumumkan",
      desc: "Agenda pelaporan nilai, rekapitulasi akademik, dan proses yudisium akan tersedia setelah kalender akademik diperbarui.",
      type: "Akademik",
      status: "Segera Hadir"
    }
  ];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findNativeCalendarBlocks() {
    const main = document.querySelector("main") || document.querySelector(".main-content") || document.querySelector(".page-content") || document.body;

    const direct = Array.from(main.children || [])
      .filter(function (el) {
        if (el.id === "fftAcademicCalendarMobile") return false;
        if (el.closest("#fftAcademicCalendarMobile")) return false;

        const text = normalizeText(el.textContent);

        return text.includes("kalender") &&
          text.includes("akademik") &&
          text.length < 12000 &&
          !el.matches("header, footer, nav");
      });

    if (direct.length) return direct;

    const candidates = Array.from(document.querySelectorAll("section, article, div"))
      .filter(function (el) {
        if (el.id === "fftAcademicCalendarMobile") return false;
        if (el.closest("#fftAcademicCalendarMobile")) return false;
        if (el.closest("header, footer, nav")) return false;

        const text = normalizeText(el.textContent);

        return text.includes("kalender") &&
          text.includes("akademik") &&
          text.length < 9000;
      })
      .sort(function (a, b) {
        return normalizeText(a.textContent).length - normalizeText(b.textContent).length;
      });

    return candidates.slice(0, 2);
  }

  function fallbackMount() {
    return document.querySelector("main") ||
      document.querySelector(".main-content") ||
      document.querySelector(".page-content") ||
      document.body;
  }

  function createCalendarSection() {
    const section = document.createElement("section");
    section.id = "fftAcademicCalendarMobile";
    section.className = "fft-calendar-mobile";
    section.setAttribute("aria-label", "Kalender Akademik Fakultas");

    const eventCards = events.map(function (item, index) {
      const number = String(index + 1).padStart(2, "0");
      const isOpen = index === 0;

      return `
        <article class="fft-calendar-event${isOpen ? " is-open" : ""}" data-fft-calendar-event>
          <button class="fft-calendar-event-trigger" type="button" aria-expanded="${isOpen ? "true" : "false"}">
            <span class="fft-calendar-event-number">${number}</span>
            <span class="fft-calendar-event-main">
              <span class="fft-calendar-event-title">${item.title}</span>
              <span class="fft-calendar-event-date">${item.date}</span>
            </span>
            <span class="fft-calendar-event-icon" aria-hidden="true"></span>
          </button>

          <div class="fft-calendar-event-panel">
            <p>${item.desc}</p>
            <div class="fft-calendar-event-meta">
              <span class="fft-calendar-chip">${item.type}</span>
              <span class="fft-calendar-chip">${item.status}</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    section.innerHTML = `
      <div class="fft-calendar-hero">
        <span class="fft-calendar-kicker">Akademik</span>
        <h1 class="fft-calendar-title">Kalender Akademik Fakultas</h1>
        <p class="fft-calendar-desc">
          Ringkasan agenda akademik fakultas disusun agar mahasiswa dapat mengikuti jadwal penting secara jelas, ringkas, dan mudah dibaca.
        </p>

        <div class="fft-calendar-status" aria-label="Status kalender">
          <div class="fft-calendar-status-card">
            <span>Periode</span>
            <strong>Segera diperbarui</strong>
          </div>
          <div class="fft-calendar-status-card">
            <span>Status</span>
            <strong>Menunggu data resmi</strong>
          </div>
        </div>
      </div>

      <div class="fft-calendar-guide">
        <span>Informasi</span>
        <p>
          Jadwal yang tampil pada halaman ini akan mengikuti data resmi dari fakultas. Perubahan agenda akademik dapat terjadi sesuai kebijakan akademik.
        </p>
      </div>

      <div class="fft-calendar-section-head">
        <span class="fft-calendar-section-kicker">Agenda Akademik</span>
        <h2 class="fft-calendar-section-title">Jadwal Penting</h2>
      </div>

      <div class="fft-calendar-timeline">
        ${eventCards}
      </div>

      <div class="fft-calendar-note">
        Kalender akademik ini disiapkan sebagai tampilan publik. Setelah fitur admin tersedia, data agenda dapat diperbarui tanpa mengubah desain halaman.
      </div>
    `;

    return section;
  }

  function bindCalendar(section) {
    section.querySelectorAll("[data-fft-calendar-event]").forEach(function (card) {
      const trigger = card.querySelector(".fft-calendar-event-trigger");

      if (!trigger) return;

      trigger.addEventListener("click", function () {
        const isOpen = card.classList.contains("is-open");

        section.querySelectorAll("[data-fft-calendar-event]").forEach(function (item) {
          item.classList.remove("is-open");

          const itemTrigger = item.querySelector(".fft-calendar-event-trigger");
          if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          card.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function install() {
    if (!/kalender-akademik\.html/i.test(window.location.pathname)) return;
    if (!mq.matches) return;
    if (document.getElementById("fftAcademicCalendarMobile")) return;

    document.body.classList.add("fft-calendar-page");

    const nativeBlocks = findNativeCalendarBlocks();
    const section = createCalendarSection();

    if (nativeBlocks.length && nativeBlocks[0].parentNode) {
      nativeBlocks[0].parentNode.insertBefore(section, nativeBlocks[0]);

      nativeBlocks.forEach(function (block) {
        block.classList.add("fft-native-calendar-hidden");
      });
    } else {
      fallbackMount().appendChild(section);
    }

    bindCalendar(section);
  }

  ready(function () {
    install();
    window.setTimeout(install, 300);
    window.setTimeout(install, 900);
  });
}());

/* FFT_ADD_MOBILE_ACADEMIC_CALENDAR_SEARCH_20260524
   Menambahkan search khusus mobile Kalender Akademik.
   Desktop tidak disentuh.
*/
(function () {
  "use strict";

  var mq = window.matchMedia("(max-width: 768px)");

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function installMobileCalendarSearch() {
    if (!mq.matches) return false;

    var section = document.getElementById("fftAcademicCalendarMobile");
    if (!section) return false;

    if (section.querySelector("[data-fft-mobile-calendar-search]")) return true;

    var timeline = section.querySelector(".fft-calendar-timeline");
    if (!timeline) return false;

    var sectionHead = section.querySelector(".fft-calendar-section-head");

    var searchWrap = document.createElement("div");
    searchWrap.className = "fft-calendar-mobile-search";
    searchWrap.innerHTML = [
      '<label>',
      '  <span>Cari Agenda</span>',
      '  <div class="fft-calendar-mobile-search-box">',
      '    <input type="search" data-fft-mobile-calendar-search placeholder="Cari registrasi, ujian, perkuliahan..." autocomplete="off" />',
      '  </div>',
      '  <small data-fft-mobile-calendar-result></small>',
      '</label>'
    ].join("");

    if (sectionHead && sectionHead.parentNode) {
      sectionHead.insertAdjacentElement("afterend", searchWrap);
    } else {
      timeline.parentNode.insertBefore(searchWrap, timeline);
    }

    var input = searchWrap.querySelector("[data-fft-mobile-calendar-search]");
    var result = searchWrap.querySelector("[data-fft-mobile-calendar-result]");
    var empty = document.createElement("div");
    empty.className = "fft-calendar-mobile-empty";
    empty.textContent = "Tidak ada agenda yang cocok.";
    empty.hidden = true;
    timeline.insertAdjacentElement("afterend", empty);

    function getCards() {
      return Array.from(section.querySelectorAll("[data-fft-calendar-event]"));
    }

    function applyFilter() {
      var query = normalize(input.value);
      var cards = getCards();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var isMatch = !query || text.includes(query);

        card.hidden = !isMatch;
        card.classList.toggle("is-filtered-out", !isMatch);

        if (isMatch) visibleCount += 1;
      });

      empty.hidden = visibleCount !== 0;

      if (result) {
        result.textContent = query
          ? visibleCount + " agenda cocok"
          : cards.length + " agenda ditampilkan";
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();

    return true;
  }

  function boot() {
    if (installMobileCalendarSearch()) return;

    var observer = new MutationObserver(function () {
      if (installMobileCalendarSearch()) {
        observer.disconnect();
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    setTimeout(installMobileCalendarSearch, 150);
    setTimeout(installMobileCalendarSearch, 500);
    setTimeout(installMobileCalendarSearch, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("resize", installMobileCalendarSearch);
}());

/* FFT_FIX_MOBILE_ACADEMIC_CALENDAR_LANGUAGE_SWITCH_20260524
   Bridge bahasa EN | ID untuk mobile Kalender Akademik.
   Desktop tidak disentuh.
*/
(function () {
  "use strict";

  var mq = window.matchMedia("(max-width: 768px)");
  var preferredLang = null;

  var copy = {
    id: {
      kicker: "Akademik",
      title: "Kalender Akademik Fakultas",
      desc: "Ringkasan agenda akademik fakultas disusun agar mahasiswa dapat mengikuti jadwal penting secara jelas, ringkas, dan mudah dibaca.",
      period: "Periode",
      periodValue: "Segera diperbarui",
      status: "Status",
      statusValue: "Menunggu data resmi",
      info: "Informasi",
      guide: "Ketuk setiap agenda untuk melihat ringkasan kegiatan. Data resmi akan diperbarui setelah sistem kalender tersambung.",
      sectionKicker: "Agenda Akademik",
      sectionTitle: "Jadwal Penting",
      note: "Kalender akademik ini disiapkan sebagai tampilan publik. Setelah fitur admin tersedia, data agenda dapat diperbarui tanpa mengubah desain halaman.",
      searchLabel: "Cari Agenda",
      searchPlaceholder: "Cari registrasi, ujian, perkuliahan...",
      empty: "Tidak ada agenda yang cocok.",
      shown: "agenda ditampilkan",
      match: "agenda cocok"
    },
    en: {
      kicker: "Academic",
      title: "Faculty Academic Calendar",
      desc: "The faculty academic agenda is summarized so students can follow important schedules clearly, briefly, and easily.",
      period: "Period",
      periodValue: "To be updated",
      status: "Status",
      statusValue: "Awaiting official data",
      info: "Information",
      guide: "Tap each agenda to view the activity summary. Official data will be updated after the calendar system is connected.",
      sectionKicker: "Academic Agenda",
      sectionTitle: "Key Dates",
      note: "This academic calendar is prepared as a public display. Once the admin feature is available, agenda data can be updated without changing the page design.",
      searchLabel: "Search Agenda",
      searchPlaceholder: "Search registration, exams, lectures...",
      empty: "No matching agenda found.",
      shown: "agendas shown",
      match: "matching agendas"
    }
  };

  var stableDateCopy = {
    id: {
      pendingDate: "Tanggal akan diumumkan",
      waitingOfficialData: "Menunggu data resmi",
      toBeUpdated: "Segera diperbarui",
      information: "Informasi",
      academicAgenda: "Agenda Akademik",
      keyDates: "Jadwal Penting"
    },
    en: {
      pendingDate: "Date to be announced",
      waitingOfficialData: "Awaiting official data",
      toBeUpdated: "To be updated",
      information: "Information",
      academicAgenda: "Academic Agenda",
      keyDates: "Key Dates"
    }
  };

  function getLang() {
    if (preferredLang === "en" || preferredLang === "id") return preferredLang;

    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (htmlLang.indexOf("en") === 0) return "en";
    if (htmlLang.indexOf("id") === 0) return "id";

    try {
      for (var i = 0; i < localStorage.length; i += 1) {
        var key = localStorage.key(i) || "";
        var value = String(localStorage.getItem(key) || "").toLowerCase();

        if (
          /(lang|language|locale)/i.test(key) &&
          (value === "en" || value === "id")
        ) {
          return value;
        }
      }
    } catch (error) {
      /* localStorage bisa tidak tersedia pada mode tertentu */
    }

    var candidates = Array.from(document.querySelectorAll("button, a, span, strong"));
    var active = candidates.find(function (el) {
      var label = (el.textContent || "").trim().toLowerCase();
      var isLanguageLabel = label === "en" || label === "id";
      var isActive =
        el.classList.contains("active") ||
        el.classList.contains("is-active") ||
        el.getAttribute("aria-pressed") === "true" ||
        el.getAttribute("aria-current") === "true";

      return isLanguageLabel && isActive;
    });

    if (active) {
      return active.textContent.trim().toLowerCase();
    }

    return "id";
  }

  function setText(root, selector, idText, enText) {
    var el = root.querySelector(selector);
    if (!el) return;

    el.dataset.pageId = idText;
    el.dataset.pageEn = enText;
    el.textContent = getLang() === "en" ? enText : idText;
  }

  function setSearchLanguage(root) {
    var lang = getLang();
    var input = root.querySelector("[data-fft-mobile-calendar-search]");
    var label = root.querySelector(".fft-calendar-mobile-search span");
    var result = root.querySelector("[data-fft-mobile-calendar-result]");
    var empty = root.querySelector(".fft-calendar-mobile-empty");

    if (label) {
      label.dataset.pageId = copy.id.searchLabel;
      label.dataset.pageEn = copy.en.searchLabel;
      label.textContent = copy[lang].searchLabel;
    }

    if (input) {
      input.dataset.placeholderId = copy.id.searchPlaceholder;
      input.dataset.placeholderEn = copy.en.searchPlaceholder;
      input.placeholder = copy[lang].searchPlaceholder;

      if (input.dataset.fftLanguageBridge !== "1") {
        input.dataset.fftLanguageBridge = "1";
        input.addEventListener("input", function () {
          window.setTimeout(function () {
            setSearchLanguage(root);
          }, 0);
        });
      }
    }

    if (empty) {
      empty.dataset.pageId = copy.id.empty;
      empty.dataset.pageEn = copy.en.empty;
      empty.textContent = copy[lang].empty;
    }

    if (result && input) {
      var cards = Array.from(root.querySelectorAll("[data-fft-calendar-event]"));
      var visible = cards.filter(function (card) {
        return !card.hidden;
      }).length;
      var query = input.value.trim();

      result.textContent = query
        ? visible + " " + copy[lang].match
        : cards.length + " " + copy[lang].shown;
    }
  }

  function translateExactText(root) {
    var lang = getLang();
    var target = stableDateCopy[lang] || stableDateCopy.id;

    root.querySelectorAll(".fft-calendar-event-date").forEach(function (el) {
      var text = (el.textContent || "").trim();

      if (
        text === stableDateCopy.id.pendingDate ||
        text === stableDateCopy.en.pendingDate ||
        /tanggal akan diumumkan/i.test(text) ||
        /date to be announced/i.test(text)
      ) {
        el.textContent = target.pendingDate;
      }
    });

    root.querySelectorAll(".fft-calendar-chip").forEach(function (el) {
      var text = (el.textContent || "").trim();

      if (
        text === stableDateCopy.id.waitingOfficialData ||
        text === stableDateCopy.en.waitingOfficialData ||
        /menunggu data resmi/i.test(text) ||
        /awaiting official data/i.test(text)
      ) {
        el.textContent = target.waitingOfficialData;
      }

      if (
        text === stableDateCopy.id.toBeUpdated ||
        text === stableDateCopy.en.toBeUpdated ||
        /segera diperbarui/i.test(text) ||
        /to be updated/i.test(text)
      ) {
        el.textContent = target.toBeUpdated;
      }
    });
  }

  function syncMobileCalendarLanguage() {
    if (!mq.matches) return;

    var root = document.getElementById("fftAcademicCalendarMobile");
    if (!root) return;

    var lang = getLang();

    setText(root, ".fft-calendar-kicker", copy.id.kicker, copy.en.kicker);
    setText(root, ".fft-calendar-title", copy.id.title, copy.en.title);
    setText(root, ".fft-calendar-desc", copy.id.desc, copy.en.desc);

    var cards = root.querySelectorAll(".fft-calendar-status-card");

    if (cards[0]) {
      setText(cards[0], "span", copy.id.period, copy.en.period);
      setText(cards[0], "strong", copy.id.periodValue, copy.en.periodValue);
    }

    if (cards[1]) {
      setText(cards[1], "span", copy.id.status, copy.en.status);
      setText(cards[1], "strong", copy.id.statusValue, copy.en.statusValue);
    }

    var guide = root.querySelector(".fft-calendar-guide");
    if (guide) {
      setText(guide, "span", copy.id.info, copy.en.info);
      setText(guide, "p", copy.id.guide, copy.en.guide);
    }

    setText(root, ".fft-calendar-section-kicker", copy.id.sectionKicker, copy.en.sectionKicker);
    setText(root, ".fft-calendar-section-title", copy.id.sectionTitle, copy.en.sectionTitle);
    setText(root, ".fft-calendar-note", copy.id.note, copy.en.note);

    setSearchLanguage(root);
    translateExactText(root);

    root.setAttribute("lang", lang === "en" ? "en" : "id");
  }

  function boot() {
    syncMobileCalendarLanguage();

    var observer = new MutationObserver(function () {
      window.clearTimeout(window.__fftMobileCalendarLanguageTimer);
      window.__fftMobileCalendarLanguageTimer = window.setTimeout(syncMobileCalendarLanguage, 80);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    document.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("button, a, span, strong") : null;
      var label = target ? (target.textContent || "").trim().toLowerCase() : "";

      if (label === "en" || label === "id") {
        preferredLang = label;
        window.setTimeout(syncMobileCalendarLanguage, 80);
        window.setTimeout(syncMobileCalendarLanguage, 220);
      }
    }, true);

    window.addEventListener("resize", syncMobileCalendarLanguage);
    window.setTimeout(syncMobileCalendarLanguage, 250);
    window.setTimeout(syncMobileCalendarLanguage, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}());

/* FFT_FIX_MOBILE_CALENDAR_DATE_LANGUAGE_TOGGLE_20260524
   Menstabilkan teks tanggal mobile Kalender Akademik agar tidak toggle EN ID bolak balik.
*/

/* FFT_FIX_MOBILE_CALENDAR_EVENT_EN_AND_NO_FLASH_20260524
   Fix judul event mobile Kalender Akademik agar ikut EN | ID.
   Juga menandai mobile layout ready supaya tidak ada kedipan layout lama saat refresh.
*/
(function () {
  "use strict";

  var mq = window.matchMedia("(max-width: 768px)");
  var langKey = "fftMobileAcademicCalendarLang";

  var pairs = [
    ["Registrasi dan Pengisian KRS", "Registration and Course Enrollment"],
    ["Pengisian KRS", "Course Enrollment"],
    ["Registrasi Akademik", "Academic Registration"],
    ["Awal Perkuliahan", "Start of Lectures"],
    ["Masa Perkuliahan", "Lecture Period"],
    ["Perkuliahan Aktif", "Active Lectures"],
    ["Ujian Tengah Semester", "Midterm Examination"],
    ["Ujian Akhir Semester", "Final Examination"],
    ["Pengumuman Nilai", "Grade Announcement"],
    ["Libur Semester", "Semester Break"],
    ["Batas Akhir Pembayaran", "Payment Deadline"],
    ["Bimbingan Akademik", "Academic Advising"],
    ["Orientasi Mahasiswa Baru", "New Student Orientation"],
    ["Yudisium", "Graduation Eligibility Review"],
    ["Wisuda", "Commencement"],
    ["Tanggal akan diumumkan", "Date to be announced"],
    ["Menunggu data resmi", "Awaiting official data"]
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function getLang() {
    try {
      var stored = sessionStorage.getItem(langKey);
      if (stored === "en" || stored === "id") return stored;
    } catch (error) {}

    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (htmlLang.indexOf("en") === 0) return "en";
    if (htmlLang.indexOf("id") === 0) return "id";

    var active = Array.from(document.querySelectorAll("button, a, span, strong")).find(function (el) {
      var label = normalize(el.textContent);
      var isLang = label === "en" || label === "id";
      var isActive =
        el.classList.contains("active") ||
        el.classList.contains("is-active") ||
        el.getAttribute("aria-pressed") === "true" ||
        el.getAttribute("aria-current") === "true";

      return isLang && isActive;
    });

    if (active) return normalize(active.textContent);

    return "id";
  }

  function translateValue(text, lang) {
    var clean = normalize(text);

    for (var i = 0; i < pairs.length; i += 1) {
      var idText = pairs[i][0];
      var enText = pairs[i][1];

      if (clean === normalize(idText) || clean === normalize(enText)) {
        return lang === "en" ? enText : idText;
      }
    }

    return null;
  }

  function translateMobileEvents() {
    var root = document.getElementById("fftAcademicCalendarMobile");
    if (!root) return false;

    var lang = getLang();

    root.querySelectorAll("[data-fft-calendar-event] h3, [data-fft-calendar-event] strong, [data-fft-calendar-event] span, [data-fft-calendar-event] small, [data-fft-calendar-event] p, .fft-calendar-event-title, .fft-calendar-event-date, .fft-calendar-chip").forEach(function (el) {
      var current = (el.textContent || "").trim();
      var translated = translateValue(current, lang);

      if (translated) {
        el.dataset.pageId = translateValue(current, "id") || current;
        el.dataset.pageEn = translateValue(current, "en") || current;
        el.textContent = translated;
      }
    });

    if (mq.matches && document.body) {
      document.body.classList.add("fft-calendar-mobile-ready");
    }

    return true;
  }

  function bootCalendarEventLanguageFix() {
    translateMobileEvents();

    var observer = new MutationObserver(function () {
      window.clearTimeout(window.__fftMobileCalendarEventLangTimer);
      window.__fftMobileCalendarEventLangTimer = window.setTimeout(translateMobileEvents, 60);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    document.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("button, a, span, strong") : null;
      var label = target ? normalize(target.textContent) : "";

      if (label === "en" || label === "id") {
        try {
          sessionStorage.setItem(langKey, label);
        } catch (error) {}

        window.setTimeout(translateMobileEvents, 80);
        window.setTimeout(translateMobileEvents, 220);
        window.setTimeout(translateMobileEvents, 500);
      }
    }, true);

    window.setTimeout(translateMobileEvents, 120);
    window.setTimeout(translateMobileEvents, 450);
    window.setTimeout(translateMobileEvents, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCalendarEventLanguageFix);
  } else {
    bootCalendarEventLanguageFix();
  }

  window.addEventListener("resize", function () {
    if (!mq.matches && document.body) {
      document.body.classList.remove("fft-calendar-mobile-ready");
    }

    translateMobileEvents();
  });
}());

/* FFT_KALENDER_SEARCH_GARBLE_FINAL_20260601 */
(function fixCalendarSearchPlaceholder() {
  function clean() {
    var inputs = document.querySelectorAll(
      'input[type="search"], input[placeholder*="Cari"], input[placeholder*="registrasi"], input[name*="search"], input[id*="search"], input[class*="search"]'
    );

    inputs.forEach(function(input) {
      input.setAttribute("placeholder", "Cari registrasi, ujian, perkuliahan...");

      if (/â|�|⌕|🔍/i.test(input.value || "")) {
        input.value = "";
      }

      input.style.textIndent = "0";
      input.style.paddingLeft = "14px";
      input.style.backgroundImage = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clean);
  } else {
    clean();
  }

  window.addEventListener("load", clean);
})();
