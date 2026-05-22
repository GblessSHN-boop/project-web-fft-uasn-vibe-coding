/* FFT_BERITA_DETAIL_PUBLIC_STAGE2_20260522
   Detail berita publik:
   - Render detail lebih lengkap.
   - Ambil data dari endpoint detail jika tersedia.
   - Fallback ke /api/berita jika endpoint detail belum tersedia.
   - Catat kunjungan ke backend melalui endpoint view/visit jika tersedia.
*/
(function () {
  "use strict";

  const API_BASE = (function () {
    const host = window.location.hostname || "127.0.0.1";
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const isLocal = host === "127.0.0.1" || host === "localhost";
    return isLocal ? "http://127.0.0.1:5000" : `${protocol}//${host}:5000`;
  }());

  let viewRecorded = false;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeStaticUrl(value) {
    const raw = String(value || "").trim();

    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/static/")) return `${API_BASE}${raw}`;
    if (raw.startsWith("static/")) return `${API_BASE}/${raw}`;
    if (raw.startsWith("/")) return `${API_BASE}${raw}`;

    return `${API_BASE}/static/${raw.replace(/^\/+/, "")}`;
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search);

    return {
      id: params.get("id") || params.get("berita_id") || "",
      kode: params.get("kode") || params.get("code") || params.get("kode_berita") || "",
      slug: params.get("slug") || "",
    };
  }

  function targetValues() {
    const params = getParams();

    return [params.id, params.kode, params.slug]
      .filter(Boolean)
      .map(function (item) {
        return String(item).trim().toLowerCase();
      });
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function estimateReadTime(text) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function normalizePayloadItem(payload) {
    if (!payload) return null;

    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload.berita && typeof payload.berita === "object" && !Array.isArray(payload.berita)) {
      return payload.berita;
    }

    if (payload.item && typeof payload.item === "object" && !Array.isArray(payload.item)) {
      return payload.item;
    }

    if (payload.detail && typeof payload.detail === "object" && !Array.isArray(payload.detail)) {
      return payload.detail;
    }

    if (payload.id || payload.kode || payload.title || payload.judul) {
      return payload;
    }

    return null;
  }

  function collectItems(payload) {
    const keys = ["all", "latest", "banner", "trending", "umum", "data", "items", "berita", "news"];
    const items = [];
    const seen = new Set();

    keys.forEach(function (key) {
      let bucket = payload ? payload[key] : null;

      if (!bucket) return;
      if (!Array.isArray(bucket)) bucket = [bucket];

      bucket.forEach(function (item) {
        if (!item || typeof item !== "object") return;

        const unique = String(
          item.id ||
          item.berita_id ||
          item.kode ||
          item.kode_berita ||
          item.code ||
          item.slug ||
          item.judul ||
          item.title ||
          Math.random()
        );

        if (seen.has(unique)) return;

        seen.add(unique);
        items.push(item);
      });
    });

    return items;
  }

  function matchItem(items, targets) {
    if (!targets.length) return null;

    return items.find(function (item) {
      const aliases = [
        item.id,
        item.berita_id,
        item.kode,
        item.code,
        item.kode_berita,
        item.slug,
      ]
        .filter(function (value) {
          return value !== null && value !== undefined && String(value).trim() !== "";
        })
        .map(function (value) {
          return String(value).trim().toLowerCase();
        });

      return targets.some(function (target) {
        return aliases.includes(target);
      });
    }) || null;
  }

  function findFailureElement() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (/gagal memuat detail berita/i.test(node.nodeValue || "")) {
        return node.parentElement;
      }

      node = walker.nextNode();
    }

    return null;
  }

  function findMount() {
    return document.getElementById("beritaDetailContent") ||
      document.getElementById("newsDetailContent") ||
      document.querySelector("[data-news-detail]") ||
      document.querySelector("[data-berita-detail]") ||
      document.querySelector(".berita-detail-content") ||
      document.querySelector(".news-detail-content") ||
      document.querySelector(".detail-content") ||
      (findFailureElement() ? findFailureElement().closest("article, .content-card, .detail-card, .news-detail-card, .berita-detail-card, div") : null);
  }

  function renderParagraphs(value) {
    const raw = String(value || "").trim();

    if (!raw) {
      return "<p>Konten berita belum tersedia.</p>";
    }

    return raw
      .split(/\n{2,}/)
      .map(function (block) {
        const safe = escapeHtml(block.trim()).replace(/\n/g, "<br>");
        return safe ? `<p>${safe}</p>` : "";
      })
      .join("");
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, Object.assign({ cache: "no-store" }, options || {}));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async function fetchDetailFromBackend(params) {
    const query = new URLSearchParams();

    if (params.id) query.set("id", params.id);
    if (params.kode) query.set("kode", params.kode);
    if (params.slug) query.set("slug", params.slug);

    const candidates = [];

    if (params.id) {
      candidates.push(`${API_BASE}/api/berita/${encodeURIComponent(params.id)}`);
      candidates.push(`${API_BASE}/api/berita/${encodeURIComponent(params.id)}/detail`);
    }

    candidates.push(`${API_BASE}/api/berita/detail?${query.toString()}`);
    candidates.push(`${API_BASE}/api/berita-detail?${query.toString()}`);

    for (const url of candidates) {
      try {
        const payload = await fetchJson(url);
        const item = normalizePayloadItem(payload);

        if (item) {
          item.__fromDetailEndpoint = true;
          return item;
        }
      } catch (error) {
        // Endpoint kandidat boleh tidak ada. Lanjut fallback.
      }
    }

    return null;
  }

  async function fetchDetailFromList(params) {
    const payload = await fetchJson(`${API_BASE}/api/berita?v=${Date.now()}`);
    const items = collectItems(payload);
    return matchItem(items, targetValues(params));
  }

  async function recordView(item) {
    if (viewRecorded || !item) return;

    const id = item.id || item.berita_id || "";
    const kode = item.kode || item.code || item.kode_berita || "";
    const slug = item.slug || "";

    if (!id && !kode && !slug) return;

    viewRecorded = true;

    const body = JSON.stringify({
      id: id,
      berita_id: id,
      kode: kode,
      code: kode,
      slug: slug,
      source: "public_detail",
    });

    const headers = {
      "Content-Type": "application/json",
    };

    const endpoints = [];

    if (id) {
      endpoints.push(`${API_BASE}/api/berita/${encodeURIComponent(id)}/view`);
      endpoints.push(`${API_BASE}/api/berita/${encodeURIComponent(id)}/visit`);
    }

    endpoints.push(`${API_BASE}/api/berita/view`);
    endpoints.push(`${API_BASE}/api/berita/visit`);

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: body,
          keepalive: true,
          cache: "no-store",
        });

        if (response.ok) return;
      } catch (error) {
        // Coba endpoint berikutnya.
      }
    }
  }

  function renderDetail(mount, item) {
    const title = item.judul || item.title || item.judul_id || item.title_id || "Detail Berita";
    const subtitle = item.subjudul || item.subtitle || item.description || item.deskripsi || "";
    const summary = item.ringkasan || item.summary || item.excerpt || subtitle || "";
    const content = item.isi || item.body || item.content || item.konten || item.detail || item.deskripsi || summary;
    const category = item.kategori || item.category || item.group_type || "Berita UASN";
    const code = item.kode || item.code || item.kode_berita || "";
    const date = item.published_at || item.tayang_pada || item.created_at || item.tanggal || item.date || "";
    const image = normalizeStaticUrl(
      item.detail_image_url ||
      item.gambar_detail ||
      item.detail_image ||
      item.gambar ||
      item.image_url ||
      item.thumbnail_url ||
      item.thumbnail ||
      item.image ||
      item.image_file
    );

    const readTime = estimateReadTime(content);
    const releaseText = date ? formatDateTime(date) : "";

    mount.classList.add("fft-news-detail-rendered");

    mount.innerHTML = `
      <article class="fft-news-detail-article">
        ${image ? `<figure class="fft-news-detail-figure"><img class="fft-news-detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}"></figure>` : ""}

        <div class="fft-news-detail-layout">
          <main class="fft-news-detail-main">
            <span class="fft-news-detail-kicker">${escapeHtml(category)}</span>
            <h1 class="fft-news-detail-title">${escapeHtml(title)}</h1>

            ${subtitle ? `<p class="fft-news-detail-lead">${escapeHtml(subtitle)}</p>` : ""}

            <section class="fft-news-detail-mobile-info" aria-label="Informasi artikel">
              <h2>Informasi Artikel</h2>
              ${releaseText ? `<p><span>Rilis</span><strong>${escapeHtml(releaseText)}</strong></p>` : ""}
              ${code ? `<p><span>Kode</span><strong>${escapeHtml(code)}</strong></p>` : ""}
              <p><span>Waktu baca</span><strong>${readTime} menit</strong></p>
            </section>

            ${summary ? `
              <section class="fft-news-detail-summary">
                <strong>Ringkasan</strong>
                <p>${escapeHtml(summary)}</p>
              </section>
            ` : ""}

            <section class="fft-news-detail-content">
              ${renderParagraphs(content)}
            </section>
          </main>

          <aside class="fft-news-detail-info" aria-label="Informasi artikel">
            <h2>Informasi Artikel</h2>
            ${releaseText ? `<p><span>Rilis</span><strong>${escapeHtml(releaseText)}</strong></p>` : ""}
            ${code ? `<p><span>Kode</span><strong>${escapeHtml(code)}</strong></p>` : ""}
            <p><span>Waktu baca</span><strong>${readTime} menit</strong></p>
          </aside>
        </div>
      </article>
    `;

    document.title = `${title} | FFT UASN`;
  }

  function renderEmpty(mount, message) {
    mount.classList.add("fft-news-detail-rendered");
    mount.innerHTML = `
      <div class="fft-news-detail-empty">
        ${escapeHtml(message)}
      </div>
    `;
  }

  async function loadDetail() {
    const mount = findMount();

    if (!mount) return;

    const params = getParams();

    if (!params.id && !params.kode && !params.slug) {
      renderEmpty(mount, "Parameter berita tidak ditemukan. Buka detail berita dari daftar berita.");
      return;
    }

    try {
      let item = await fetchDetailFromBackend(params);

      if (!item) {
        item = await fetchDetailFromList(params);
      }

      if (!item) {
        renderEmpty(mount, "Berita tidak ditemukan atau belum dipublikasikan.");
        return;
      }

      renderDetail(mount, item);
      recordView(item);
    } catch (error) {
      console.error("Gagal memuat detail berita:", error);
      renderEmpty(mount, "Gagal memuat detail berita dari server.");
    }
  }

  ready(function () {
    if (!/berita-detail\.html/i.test(window.location.pathname)) return;
    loadDetail();
  });
}());
