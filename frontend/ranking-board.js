document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector("[data-ranking-root]");
  if (!root) return;

  const API_BASE = "http://127.0.0.1:5000";
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
    const lang = localStorage.getItem("fft-language")
      || localStorage.getItem("siteLanguage")
      || localStorage.getItem("fftLang")
      || document.documentElement.lang
      || "id";

    return lang === "en" ? "en" : "id";
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
              <img src="assets/top-leader/top-leader-title.png" alt="">
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
            <img class="ranking-corner-logo" src="uasnlogo.png" alt="UASN">

            <div class="ranking-title-center">
              <img class="ranking-title-image" src="assets/top-leader/top-leader-title.png" alt="Papan Peringkat Fakultas Filsafat Teologi" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div class="ranking-title-fallback">Papan Peringkat Fakultas Filsafat Teologi</div>
              <div class="ranking-year">${year}</div>
              <p class="ranking-subtitle">Universitas Advent Surya Nusantara</p>
            </div>

            <img class="ranking-corner-logo" src="fftkb.png" alt="FFT">
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

  loadRanking();
});
