/* FFT_KURIKULUM_SEMESTER_REDESIGN_20260522
   Redesign semester khusus mobile.
   Data dummy sementara:
   SEGERA 01, Segera Hadir, 0.
*/
(function () {
  "use strict";

  const mq = window.matchMedia("(max-width: 768px)");

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

  function findOldSemesterArea() {
    const candidates = Array.from(document.querySelectorAll("section, article, div"))
      .filter(function (el) {
        if (el.id === "fftCurriculumSemesterRedesign") return false;
        if (el.closest("#fftCurriculumSemesterRedesign")) return false;

        const text = normalizeText(el.textContent);

        return text.includes("daftar semester") &&
          text.includes("semester 1") &&
          text.includes("semester 8") &&
          text.length < 6000;
      })
      .sort(function (a, b) {
        return normalizeText(a.textContent).length - normalizeText(b.textContent).length;
      });

    return candidates[0] || null;
  }

  function fallbackMount() {
    return document.querySelector("main") ||
      document.querySelector(".main-content") ||
      document.querySelector(".page-content") ||
      document.body;
  }

  function createSemesterSection() {
    const section = document.createElement("section");
    section.id = "fftCurriculumSemesterRedesign";
    section.className = "fft-curriculum-semester-redesign";
    section.setAttribute("aria-label", "Daftar semester kurikulum program studi");

    const cards = Array.from({ length: 8 }, function (_, index) {
      const number = index + 1;
      const isOpen = number === 1;

      return `
        <article class="fft-semester-card${isOpen ? " is-open" : ""}" data-fft-semester-card>
          <button class="fft-semester-trigger" type="button" aria-expanded="${isOpen ? "true" : "false"}">
            <span class="fft-semester-number">${String(number).padStart(2, "0")}</span>
            <span class="fft-semester-title-wrap">
              <span class="fft-semester-title">Semester ${number}</span>
              <span class="fft-semester-meta">1 mata kuliah sementara</span>
            </span>
            <span class="fft-semester-icon" aria-hidden="true"></span>
          </button>

          <div class="fft-semester-panel">
            <div class="fft-course-head" aria-hidden="true">
              <span>Kode</span>
              <span>Mata Kuliah</span>
              <span>SKS</span>
            </div>

            <div class="fft-course-row">
              <span class="fft-course-code">SEGERA 01</span>
              <span class="fft-course-name">Segera Hadir</span>
              <span class="fft-course-sks">0</span>
            </div>

            <div class="fft-semester-total">
              <span>Total sementara</span>
              <strong>0 SKS</strong>
            </div>
          </div>
        </article>
      `;
    }).join("");

    section.innerHTML = `
      <div class="fft-curriculum-semester-head">
        <span class="fft-curriculum-semester-kicker">Daftar Semester</span>
        <h2 class="fft-curriculum-semester-title">Kurikulum Program Studi</h2>
        <p class="fft-curriculum-semester-desc">
          Pilih semester untuk melihat daftar mata kuliah. Data ini disiapkan agar nanti mudah diisi dari admin dashboard.
        </p>
      </div>

      <div class="fft-semester-list">
        ${cards}
      </div>
    `;

    return section;
  }

  function bindAccordion(section) {
    section.querySelectorAll("[data-fft-semester-card]").forEach(function (card) {
      const trigger = card.querySelector(".fft-semester-trigger");

      if (!trigger) return;

      trigger.addEventListener("click", function () {
        const isOpen = card.classList.contains("is-open");

        section.querySelectorAll("[data-fft-semester-card]").forEach(function (item) {
          item.classList.remove("is-open");

          const itemTrigger = item.querySelector(".fft-semester-trigger");
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
    if (!/kurikulum\.html/i.test(window.location.pathname)) return;
    if (!mq.matches) return;
    if (document.getElementById("fftCurriculumSemesterRedesign")) return;

    document.body.classList.add("fft-kurikulum-page");

    const oldArea = findOldSemesterArea();
    const section = createSemesterSection();

    if (oldArea && oldArea.parentNode) {
      oldArea.parentNode.insertBefore(section, oldArea);
      oldArea.classList.add("fft-native-semester-hidden");
    } else {
      fallbackMount().appendChild(section);
    }

    bindAccordion(section);
  }

  ready(function () {
    install();
    window.setTimeout(install, 300);
    window.setTimeout(install, 900);
  });
}());
