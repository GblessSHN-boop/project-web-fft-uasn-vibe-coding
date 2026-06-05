document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector("[data-ranking-root]");
  if (!root) return;

  const API_BASE = (function () {
    const host = window.location.hostname || "127.0.0.1";
    const isLocal = host === "127.0.0.1" || host === "localhost";
    return isLocal ? "http://127.0.0.1:5000" : `${window.location.protocol}//${host}:5000`;
  }());
  const board = document.getElementById("rankingBoard");
  const loading = document.getElementById("rankingLoading");
  const errorBox = document.getElementById("rankingError");
  const activeLabel = document.getElementById("rankingActiveLabel");
  const modelNote = document.getElementById("rankingModelNote");
  const yearSelect = root.querySelector("[data-ranking-year]");
  const formatSelect = root.querySelector("[data-ranking-format]");
  const downloadButton = root.querySelector("[data-ranking-download]");
  const canvasStage = document.createElement("canvas");

  let payload = { data: [], ranking_model: null };

  function getLang() {
    const keys = [
      "fft-language",
      "siteLanguage",
      "fftLang",
      "fft_language",
      "selectedLanguage",
      "language"
    ];

    for (const key of keys) {
      const value = (localStorage.getItem(key) || "").toLowerCase();
      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const activeButton = document.querySelector(".fft-floating-language-btn.is-active, .fft-floating-language-btn[aria-pressed='true']");
    if (activeButton) {
      const value = (
        activeButton.dataset.fftLang ||
        activeButton.dataset.lang ||
        activeButton.textContent ||
        ""
      ).trim().toLowerCase();

      if (value === "en" || value.startsWith("en")) return "en";
      if (value === "id" || value.startsWith("id")) return "id";
    }

    const htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.startsWith("en")) return "en";

    return "id";
  }


  function applyLabels() {
    const lang = getLang();

    root.querySelectorAll("[data-label-id][data-label-en]").forEach(function (el) {
      el.textContent = lang === "en" ? el.dataset.labelEn : el.dataset.labelId;
    });

    if (modelNote && payload.ranking_model) {
      modelNote.textContent = lang === "en"
        ? payload.ranking_model.en || payload.ranking_model.id || ""
        : payload.ranking_model.id || payload.ranking_model.en || "";
    }
  }

  function namesText(item) {
    if (Array.isArray(item.names) && item.names.length) {
      return item.names.join(" / ");
    }

    return item.name || item.name_en || "NAMA LENGKAP";
  }

  function cleanName(item, isTop) {
    const text = namesText(item).trim();

    if (!text || /kosong|not published|belum diterbitkan/i.test(text)) {
      return isTop ? "NAMA" : "NAMA LENGKAP";
    }

    return text;
  }

  function byCategory(category) {
    const year = yearSelect ? yearSelect.value : "2025-2026";
    const source = Array.isArray(payload.data) ? payload.data : [];

    return source
      .filter(function (item) {
        return item.category === category && item.academic_year === year;
      })
      .sort(function (a, b) {
        return Number(a.rank || 999) - Number(b.rank || 999);
      })
      .slice(0, 8);
  }

  function normalizeRows(items) {
    const rows = items.slice();

    while (rows.length < 8) {
      rows.push({
        rank: rows.length + 1,
        name: rows.length === 0 ? "NAMA" : "NAMA LENGKAP",
        names: [rows.length === 0 ? "NAMA" : "NAMA LENGKAP"]
      });
    }

    return rows;
  }

  function renderColumn(title, category) {
    const items = normalizeRows(byCategory(category));
    const top = items[0];

    const rows = items.slice(1).map(function (item, index) {
      const name = cleanName(item, false);
      const isTie = name.includes(" / ");

      return `
        <article class="ranking-row">
          <div class="ranking-position">${item.rank || index + 2}</div>
          <div class="ranking-name">
            <h3 class="${isTie ? "is-tie" : ""}" title="${name}">${name}</h3>
          </div>
        </article>
      `;
    }).join("");

    return `
      <section class="ranking-column">
        <div class="ranking-column-title">${title}</div>

        <div class="ranking-top-card">
          <div class="ranking-top-rank">
            <div class="ranking-top-rank-number">#1</div>
            <div class="ranking-achievement-badge">
              <img src="../assets/top-leader/top-leader-title.png" alt="">
              <span>Hall of Achievement FFT UASN</span>
            </div>
          </div>

          <div class="ranking-top-info">
            <h4>${cleanName(top, true)}</h4>
            <div class="ranking-top-line"></div>
            <div class="ranking-top-subname">NAMA LENGKAP</div>
          </div>

          <div class="ranking-photo-box">
            <div class="ranking-photo-placeholder">FOTO</div>
          </div>
        </div>

        <div class="ranking-list">${rows}</div>
      </section>
    `;
  }

  function render() {
    applyLabels();

    const lang = getLang();
    const year = yearSelect ? yearSelect.value : "2025-2026";

    if (activeLabel) {
      activeLabel.textContent = lang === "en"
        ? "Active display: GPA Semester 1 and GPA Semester 2 | Academic Year " + year
        : "Tampilan aktif: GPA Semester 1 dan GPA Semester 2 | Tahun Akademik " + year;
    }

    if (!board) return;

    board.innerHTML = `
      <div class="ranking-export-shell">
        <section class="ranking-poster" id="rankingExportPoster">
          <header class="ranking-title-header">
            <img class="ranking-corner-logo" src="../assets/images/site/uasnlogo.png" alt="UASN">

            <div class="ranking-title-center">
              <img class="ranking-title-image" src="../assets/top-leader/top-leader-title.png" alt="Papan Peringkat Fakultas Filsafat Teologi" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div class="ranking-title-fallback">Papan Peringkat Fakultas Filsafat Teologi</div>
              <div class="ranking-year">${year}</div>
              <p class="ranking-subtitle">Universitas Advent Surya Nusantara</p>
            </div>

            <img class="ranking-corner-logo" src="../assets/images/site/fftkb.png" alt="FFT">
          </header>

          <div class="ranking-dual-board">
            ${renderColumn("GPA Semester 1", "gpa-semester-1")}
            ${renderColumn("GPA Semester 2", "gpa-semester-2")}
          </div>
        </section>
      </div>
    `;
  }

  async function loadRanking() {
    if (loading) loading.hidden = false;
    if (errorBox) errorBox.hidden = true;

    try {
      const response = await fetch(API_BASE + "/api/papan-peringkat", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      payload = await response.json();
    } catch (error) {
      payload = { data: [] };

      if (errorBox) {
        errorBox.textContent = getLang() === "en"
          ? "Backend ranking data is not connected yet."
          : "Data ranking backend belum tersambung.";
        errorBox.hidden = false;
      }
    } finally {
      if (loading) loading.hidden = true;
      render();
    }
  }

  async function inlineImages(target) {
    const images = Array.from(target.querySelectorAll("img"));

    await Promise.all(images.map(async function (img) {
      const src = img.getAttribute("src");
      if (!src) return;

      try {
        const absolute = new URL(src, window.location.href).href;
        const response = await fetch(absolute, { cache: "force-cache" });
        const blob = await response.blob();

        const dataUrl = await new Promise(function (resolve) {
          const reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        });

        img.setAttribute("src", dataUrl);
      } catch (error) {
        try {
          img.setAttribute("src", new URL(src, window.location.href).href);
        } catch (innerError) {}
      }
    }));
  }

  async function posterToCanvas() {
    const target = document.getElementById("rankingExportPoster");
    if (!target) throw new Error("Poster tidak ditemukan.");

    const clone = target.cloneNode(true);
    await inlineImages(clone);

    const rect = target.getBoundingClientRect();
    const scale = 2;
    const width = Math.ceil(rect.width);
    const height = Math.ceil(target.scrollHeight);

    const styles = Array.from(document.styleSheets).map(function (sheet) {
      try {
        return Array.from(sheet.cssRules).map(function (rule) {
          return rule.cssText;
        }).join("\n");
      } catch (error) {
        return "";
      }
    }).join("\n");

    const html = `
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #ffffff; }
            ${styles}
            .ranking-poster { width: ${width}px !important; min-width: ${width}px !important; box-shadow: none !important; margin: 0 !important; }
          </style>
        </head>
        <body>${clone.outerHTML}</body>
      </html>
    `;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">
          ${html}
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();

    await new Promise(function (resolve, reject) {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    canvasStage.width = width * scale;
    canvasStage.height = height * scale;

    const ctx = canvasStage.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasStage.width, canvasStage.height);
    ctx.drawImage(img, 0, 0, canvasStage.width, canvasStage.height);

    URL.revokeObjectURL(url);

    return canvasStage;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  function buildPdfFromJpeg(jpegDataUrl, canvas, title) {
    const imgBytes = dataUrlToBytes(jpegDataUrl);
    const pageWidth = 842;
    const pageHeight = 595;
    const imgWidth = pageWidth;
    const imgHeight = Math.round((canvas.height / canvas.width) * imgWidth);
    const y = Math.max(0, pageHeight - imgHeight);
    const content = `q\n${imgWidth} 0 0 ${imgHeight} 0 ${y} cm\n/Im0 Do\nQ\n`;

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
      `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`,
      `<< /Length ${content.length} >>\nstream\n${content}endstream`
    ];

    const encoder = new TextEncoder();
    const chunks = [];
    let offset = 0;

    function pushText(text) {
      const bytes = encoder.encode(text);
      chunks.push(bytes);
      offset += bytes.length;
    }

    function pushBytes(bytes) {
      chunks.push(bytes);
      offset += bytes.length;
    }

    pushText("%PDF-1.4\n");
    const xref = [0];

    for (let i = 0; i < objects.length; i++) {
      xref.push(offset);
      pushText(`${i + 1} 0 obj\n`);

      if (i === 3) {
        pushText(objects[i]);
        pushBytes(imgBytes);
        pushText("\nendstream\nendobj\n");
      } else {
        pushText(objects[i] + "\nendobj\n");
      }
    }

    const xrefStart = offset;
    pushText(`xref\n0 ${objects.length + 1}\n`);
    pushText("0000000000 65535 f \n");

    for (let i = 1; i < xref.length; i++) {
      pushText(String(xref[i]).padStart(10, "0") + " 00000 n \n");
    }

    pushText(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Title (${title}) >>\nstartxref\n${xrefStart}\n%%EOF`);

    return new Blob(chunks, { type: "application/pdf" });
  }

  async function downloadPoster() {
    try {
      const format = formatSelect ? formatSelect.value : "png";
      const year = yearSelect ? yearSelect.value : "2025-2026";
      const filenameBase = "papan-peringkat-gpa-semester-1-2-" + year;
      const canvas = await posterToCanvas();

      if (format === "png") {
        canvas.toBlob(function (blob) {
          downloadBlob(blob, filenameBase + ".png");
        }, "image/png");
        return;
      }

      if (format === "jpg" || format === "jpeg") {
        canvas.toBlob(function (blob) {
          downloadBlob(blob, filenameBase + "." + format);
        }, "image/jpeg", 0.96);
        return;
      }

      if (format === "pdf") {
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.96);
        const pdfBlob = buildPdfFromJpeg(jpegDataUrl, canvas, filenameBase);
        downloadBlob(pdfBlob, filenameBase + ".pdf");
      }
    } catch (error) {
      alert("Download gagal. Coba refresh halaman lalu ulangi download.");
      console.error(error);
    }
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", render);
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", downloadPoster);
  }

  window.addEventListener("fft-language-change", render);
  window.addEventListener("storage", render);

  // FFT RANKING LANGUAGE CLICK FIX START
  document.querySelectorAll(".fft-floating-language-btn, [data-fft-lang], [data-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      setTimeout(render, 0);
      setTimeout(render, 80);
      setTimeout(render, 180);
    });
  });
  // FFT RANKING LANGUAGE CLICK FIX END

  loadRanking();
});

/* FFT_RANKING_BOARD_TIE_ROTATOR_20260605
   Tie ranking rotator.
   Siap backend:
   window.FFTRankingData = {
     semester1: [{ rank: 1, entries: [{ name: "Nama", gpa: "4.00", photo: "" }] }],
     semester2: [{ rank: 1, entries: [{ name: "Nama", gpa: "4.00", photo: "" }] }]
   };
   Setelah data backend masuk, panggil:
   window.FFTRankingRefresh();
*/
(function () {
  "use strict";

  var ROTATE_MS = 2800;
  var applying = false;
  var observerReady = false;
  var observerTimer = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function asText(value, fallback) {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value).trim();
  }

  function cleanGpa(value) {
    var text = asText(value, "-");
    if (text === "-") {
      return "-";
    }

    text = text.replace(",", ".");
    var number = Number(text);

    if (!Number.isNaN(number) && Number.isFinite(number)) {
      return number.toFixed(2);
    }

    return text;
  }

  function normalizeEntry(item, sharedGpa) {
    if (typeof item === "string") {
      return {
        name: item,
        gpa: cleanGpa(sharedGpa),
        photo: ""
      };
    }

    item = item || {};

    return {
      name: asText(
        item.name ||
        item.fullName ||
        item.nama ||
        item.nama_lengkap ||
        item.student_name ||
        item.mahasiswa,
        "NAMA LENGKAP"
      ),
      gpa: cleanGpa(
        item.gpa ||
        item.ipk ||
        item.score ||
        item.nilai ||
        sharedGpa
      ),
      photo: asText(
        item.photo ||
        item.photoUrl ||
        item.photo_url ||
        item.foto ||
        item.image ||
        item.imageUrl ||
        item.image_url,
        ""
      )
    };
  }

  function resolveRows(raw) {
    if (!raw) {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw;
    }

    return (
      raw.ranks ||
      raw.groups ||
      raw.rows ||
      raw.items ||
      raw.data ||
      raw.rankings ||
      []
    );
  }

  function normalizeBoard(raw) {
    var rows = resolveRows(raw);
    var byRank = {};

    rows.forEach(function (row, index) {
      row = row || {};

      var rank = parseInt(
        row.rank ||
        row.position ||
        row.no ||
        row.urutan ||
        index + 1,
        10
      );

      if (!rank || rank < 1) {
        rank = index + 1;
      }

      var sharedGpa = row.gpa || row.ipk || row.score || row.nilai || "-";
      var entries = row.entries || row.students || row.participants || row.people || row.items || row.names;

      if (!Array.isArray(entries)) {
        entries = [row];
      }

      if (!byRank[rank]) {
        byRank[rank] = {
          rank: rank,
          entries: []
        };
      }

      entries.forEach(function (entry) {
        byRank[rank].entries.push(normalizeEntry(entry, sharedGpa));
      });
    });

    return Object.keys(byRank)
      .map(function (rank) {
        return byRank[rank];
      })
      .sort(function (a, b) {
        return a.rank - b.rank;
      });
  }

  function demoBoard(label) {
    /* FFT_RANKING_BOARD_DUMMY_ALL_ANIMATE_20260605
       Data dummy sementara.
       Semua rank dibuat punya 2 slide agar animasi terlihat di semua posisi.
       Nanti bagian ini aman diganti oleh data backend admin dashboard.
    */
    var rows = [];

    for (var rank = 1; rank <= 8; rank += 1) {
      rows.push({
        rank: rank,
        entries: [
          {
            name: "NAMA LENGKAP",
            gpa: "4.00",
            photo: ""
          },
          {
            name: "KOSONG",
            gpa: "0.00",
            photo: ""
          }
        ]
      });
    }

    return rows;
  }
  function getSourceData() {
    var source =
      window.FFTRankingData ||
      window.fftRankingData ||
      window.rankingBoardData ||
      null;

    if (!source) {
      return {
        semester1: demoBoard("semester1"),
        semester2: demoBoard("semester2")
      };
    }

    var boards = source.boards || source;

    return {
      semester1: normalizeBoard(
        boards.semester1 ||
        boards.gpaSemester1 ||
        boards.gpa_semester_1 ||
        boards["GPA Semester 1"] ||
        boards[0]
      ),
      semester2: normalizeBoard(
        boards.semester2 ||
        boards.gpaSemester2 ||
        boards.gpa_semester_2 ||
        boards["GPA Semester 2"] ||
        boards[1]
      )
    };
  }

  function makePlaceholderEntry(rank) {
    return {
      rank: rank,
      entries: [
        {
          name: "NAMA LENGKAP",
          gpa: "-",
          photo: ""
        }
      ]
    };
  }

  function getGroup(groups, rank) {
    var found = groups.find(function (group) {
      return Number(group.rank) === Number(rank);
    });

    return found || makePlaceholderEntry(rank);
  }

  function getPosterRoot() {
    return document.getElementById("rankingBoard") || document.querySelector(".ranking-poster");
  }

  function getTopCard(column) {
    if (!column) {
      return null;
    }

    return (
      column.querySelector(".ranking-top-card") ||
      Array.prototype.find.call(column.children, function (child) {
        return child.querySelector && child.querySelector(".ranking-top-rank");
      }) ||
      null
    );
  }

  function clearElement(element) {
    while (element && element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function createSlide(className, active) {
    var slide = document.createElement("div");
    slide.className = className + (active ? " is-active" : "");
    return slide;
  }

  function renderTopInfo(info, group) {
    if (!info) {
      return;
    }

    clearElement(info);

    var slot = document.createElement("div");
    slot.className = "ranking-tie-slot ranking-top-tie-slot";
    slot.setAttribute("data-fft-ranking-tie-slot", "top");

    group.entries.forEach(function (entry, index) {
      var slide = createSlide("ranking-slide", index === 0);

      var name = document.createElement("h4");
      name.textContent = entry.name;

      var line = document.createElement("div");
      line.className = "ranking-top-line";

      var gpa = document.createElement("div");
      gpa.className = "ranking-top-subname";
      gpa.textContent = "IPK " + entry.gpa;

      slide.appendChild(name);
      slide.appendChild(line);
      slide.appendChild(gpa);
      slot.appendChild(slide);
    });

    info.appendChild(slot);

    if (group.entries.length > 1) {
      var count = document.createElement("div");
      count.className = "ranking-tie-count";
      count.textContent = group.entries.length + " peserta dengan IPK sama";
      info.appendChild(count);
    }
  }

  function renderTopPhoto(photoBox, entries) {
    if (!photoBox) {
      return;
    }

    clearElement(photoBox);

    var stage = document.createElement("div");
    stage.className = "ranking-photo-stage";
    stage.setAttribute("data-fft-ranking-tie-slot", "photo");

    entries.forEach(function (entry, index) {
      var slide = createSlide("ranking-photo-slide", index === 0);

      if (entry.photo) {
        var img = document.createElement("img");
        img.src = entry.photo;
        img.alt = entry.name;
        img.loading = "lazy";
        slide.appendChild(img);
      } else {
        var placeholder = document.createElement("div");
        placeholder.className = "ranking-photo-placeholder";
        placeholder.textContent = "FOTO";
        slide.appendChild(placeholder);
      }

      stage.appendChild(slide);
    });

    photoBox.appendChild(stage);
  }

  function renderTopCard(column, group) {
    var topCard = getTopCard(column);

    if (!topCard) {
      return;
    }

    topCard.classList.add("ranking-tie-enabled");

    var rankNumber = topCard.querySelector(".ranking-top-rank-number");
    if (rankNumber) {
      rankNumber.textContent = "#" + group.rank;
    }

    renderTopInfo(topCard.querySelector(".ranking-top-info"), group);
    renderTopPhoto(topCard.querySelector(".ranking-photo-box"), group.entries);
  }

  function renderRow(row, group) {
    clearElement(row);

    row.classList.add("ranking-tie-row");

    var position = document.createElement("div");
    position.className = "ranking-position";
    position.textContent = group.rank;

    var nameWrap = document.createElement("div");
    nameWrap.className = "ranking-name";

    var slot = document.createElement("div");
    slot.className = "ranking-tie-slot ranking-row-tie-slot";
    slot.setAttribute("data-fft-ranking-tie-slot", "row");

    group.entries.forEach(function (entry, index) {
      var slide = createSlide("ranking-row-slide", index === 0);

      var person = document.createElement("div");
      person.className = "ranking-row-person";

      var name = document.createElement("strong");
      name.textContent = entry.name;

      var gpa = document.createElement("small");
      gpa.textContent = "IPK " + entry.gpa;

      person.appendChild(name);
      person.appendChild(gpa);
      slide.appendChild(person);
      slot.appendChild(slide);
    });

    nameWrap.appendChild(slot);

    if (group.entries.length > 1) {
      var count = document.createElement("span");
      count.className = "ranking-row-tie-count";
      count.textContent = group.entries.length + " peserta";
      nameWrap.appendChild(count);
    }

    row.appendChild(position);
    row.appendChild(nameWrap);
  }

  function renderRows(column, groups) {
    var list = column.querySelector(".ranking-list");

    if (!list) {
      return;
    }

    for (var rank = 2; rank <= 8; rank += 1) {
      var row = list.querySelector('.ranking-row[data-fft-rank="' + rank + '"]') || list.children[rank - 2];

      if (!row) {
        row = document.createElement("div");
        row.className = "ranking-row";
        list.appendChild(row);
      }

      row.setAttribute("data-fft-rank", String(rank));
      renderRow(row, getGroup(groups, rank));
    }
  }

  function renderColumn(column, groups) {
    if (!column) {
      return;
    }

    var safeGroups = Array.isArray(groups) && groups.length ? groups : demoBoard("fallback");

    renderTopCard(column, getGroup(safeGroups, 1));
    renderRows(column, safeGroups);
  }

  function rotateSlots(root) {
    var slots = root.querySelectorAll("[data-fft-ranking-tie-slot]");

    slots.forEach(function (slot) {
      var slides = slot.querySelectorAll(".ranking-slide, .ranking-photo-slide, .ranking-row-slide");

      if (slides.length < 2) {
        return;
      }

      var activeIndex = 0;

      slides.forEach(function (slide, index) {
        if (slide.classList.contains("is-active")) {
          activeIndex = index;
        }
      });

      slides[activeIndex].classList.remove("is-active");
      slides[(activeIndex + 1) % slides.length].classList.add("is-active");
    });
  }

  function startRotator(root) {
    if (!root || root.getAttribute("data-fft-ranking-rotator-started") === "1") {
      return;
    }

    root.setAttribute("data-fft-ranking-rotator-started", "1");

    window.setInterval(function () {
      rotateSlots(root);
    }, ROTATE_MS);
  }

  function enhanceRankingBoard() {
    var root = getPosterRoot();

    if (!root || applying) {
      return;
    }

    var data = getSourceData();
    var hash = JSON.stringify(data);

    if (
      root.getAttribute("data-fft-ranking-tie-hash") === hash &&
      root.querySelector("[data-fft-ranking-tie-slot]")
    ) {
      return;
    }

    applying = true;

    try {
      root.setAttribute("data-fft-ranking-tie-hash", hash);

      var columns = root.querySelectorAll(".ranking-column");

      renderColumn(columns[0], data.semester1);
      renderColumn(columns[1], data.semester2);
      startRotator(root);
    } finally {
      applying = false;
    }
  }

  function observeRankingBoard() {
    if (observerReady) {
      return;
    }

    var target = document.querySelector(".ranking-board") || document.body;

    if (!target || !window.MutationObserver) {
      return;
    }

    observerReady = true;

    var observer = new MutationObserver(function () {
      if (applying) {
        return;
      }

      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(enhanceRankingBoard, 140);
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  window.FFTRankingRefresh = enhanceRankingBoard;

  ready(function () {
    window.setTimeout(enhanceRankingBoard, 180);
    window.setTimeout(enhanceRankingBoard, 700);
    observeRankingBoard();
  });
})();

/* FFT_RANKING_BOARD_CONCEPT_MODE_DUMMY_OVERRIDE_20260605
   Mode konsep sementara.
   Memaksa semua rank memakai 2 slide:
   - NAMA LENGKAP | IPK 4.00
   - KOSONG | IPK 0.00
   Nanti saat backend admin dashboard siap, blok ini bisa dinonaktifkan.
*/
(function () {
  "use strict";

  function makeConceptRows() {
    var rows = [];

    for (var rank = 1; rank <= 8; rank += 1) {
      rows.push({
        rank: rank,
        entries: [
          {
            name: "NAMA LENGKAP",
            gpa: "4.00",
            photo: ""
          },
          {
            name: "KOSONG",
            gpa: "0.00",
            photo: ""
          }
        ]
      });
    }

    return rows;
  }

  function applyConceptData() {
    window.FFTRankingConceptMode = true;
    window.FFTRankingData = {
      semester1: makeConceptRows(),
      semester2: makeConceptRows()
    };

    var root = document.getElementById("rankingBoard") || document.querySelector(".ranking-poster");

    if (root) {
      root.removeAttribute("data-fft-ranking-tie-hash");
      root.setAttribute("data-fft-ranking-concept-mode", "1");
    }

    if (typeof window.FFTRankingRefresh === "function") {
      window.FFTRankingRefresh();
    }
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  ready(function () {
    applyConceptData();
    window.setTimeout(applyConceptData, 250);
    window.setTimeout(applyConceptData, 750);
    window.setTimeout(applyConceptData, 1500);
  });
})();
