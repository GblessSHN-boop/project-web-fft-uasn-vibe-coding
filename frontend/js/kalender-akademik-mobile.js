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
