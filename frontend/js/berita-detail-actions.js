/* FFT_BERITA_DETAIL_ACTIONS_20260522 */
(function () {
  "use strict";

  const API_BASE = (function () {
    const host = window.location.hostname || "127.0.0.1";
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const isLocal = host === "127.0.0.1" || host === "localhost";
    return isLocal ? "http://127.0.0.1:5000" : `${protocol}//${host}:5000`;
  }());

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

  function getCurrentTargets() {
    const params = new URLSearchParams(window.location.search);

    return [
      params.get("id"),
      params.get("berita_id"),
      params.get("kode"),
      params.get("code"),
      params.get("kode_berita"),
      params.get("slug"),
    ]
      .filter(Boolean)
      .map(function (value) {
        return String(value).trim().toLowerCase();
      });
  }

  function collectItems(payload) {
    const keys = ["latest", "all", "banner", "trending", "umum", "data", "items", "berita", "news"];
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
          item.code ||
          item.kode_berita ||
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

  function itemAliases(item) {
    return [
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
  }

  function isCurrentItem(item, targets) {
    const aliases = itemAliases(item);
    return targets.some(function (target) {
      return aliases.includes(target);
    });
  }

  function itemTitle(item) {
    return item.judul || item.title || item.judul_id || item.title_id || "Berita FFT UASN";
  }

  function itemCategory(item) {
    return item.kategori || item.category || item.group_type || "Berita";
  }

  function itemImage(item) {
    return normalizeStaticUrl(
      item.thumbnail_url ||
      item.thumbnail ||
      item.gambar ||
      item.image_url ||
      item.image ||
      item.image_file ||
      item.detail_image_url ||
      item.detail_image
    );
  }

  function itemUrl(item) {
    const params = new URLSearchParams();

    const id = item.id || item.berita_id || "";
    const kode = item.kode || item.code || item.kode_berita || "";
    const slug = item.slug || "";

    if (id) params.set("id", id);
    if (kode) params.set("kode", kode);
    if (slug) params.set("slug", slug);

    return `berita-detail.html?${params.toString()}`;
  }

  async function fetchRelatedNews() {
    try {
      const response = await fetch(`${API_BASE}/api/berita?v=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) return [];

      const payload = await response.json();
      const targets = getCurrentTargets();

      return collectItems(payload)
        .filter(function (item) {
          return !isCurrentItem(item, targets);
        })
        .slice(0, 3);
    } catch (error) {
      console.error("Gagal memuat berita lainnya:", error);
      return [];
    }
  }

  function shareCurrentPage(noteEl) {
    const title = document.title || "Berita FFT UASN";
    const url = window.location.href.split("#")[0];

    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
      }).catch(function () {});
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (!noteEl) return;

        noteEl.textContent = "Link berita sudah disalin.";
        noteEl.classList.add("is-visible");

        window.setTimeout(function () {
          noteEl.classList.remove("is-visible");
        }, 2400);
      });
      return;
    }

    if (noteEl) {
      noteEl.textContent = url;
      noteEl.classList.add("is-visible");
    }
  }

  function relatedMarkup(items) {
    if (!items.length) return "";

    return `
      <section class="fft-news-detail-related" aria-label="Berita lainnya">
        <div class="fft-news-detail-related-head">
          <div>
            <span class="fft-news-detail-related-kicker">Berita Lainnya</span>
            <h2 class="fft-news-detail-related-title">Baca juga</h2>
          </div>
        </div>
        <div class="fft-news-detail-related-grid">
          ${items.map(function (item) {
            const image = itemImage(item);
            const title = itemTitle(item);
            const category = itemCategory(item);

            return `
              <a class="fft-news-detail-related-card" href="${escapeHtml(itemUrl(item))}">
                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">` : `<span aria-hidden="true"></span>`}
                <div class="fft-news-detail-related-body">
                  <span class="fft-news-detail-related-meta">${escapeHtml(category)}</span>
                  <h3>${escapeHtml(title)}</h3>
                </div>
              </a>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  async function installActions() {
    if (!/berita-detail\.html/i.test(window.location.pathname)) return;
    if (document.querySelector(".fft-news-detail-actions-wrap")) return;

    const article = document.querySelector(".fft-news-detail-article");
    const mount = document.querySelector(".fft-news-detail-rendered");

    if (!article || !mount) {
      window.setTimeout(installActions, 250);
      return;
    }

    const related = await fetchRelatedNews();

    const wrap = document.createElement("section");
    wrap.className = "fft-news-detail-actions-wrap";
    wrap.innerHTML = `
      <div class="fft-news-detail-action-bar">
        <a class="fft-news-detail-action-btn is-primary" href="indexfft.html">Kembali ke Home</a>
        <button class="fft-news-detail-action-btn" type="button" data-fft-share-news>Bagikan</button>
      </div>
      <p class="fft-news-detail-share-note" aria-live="polite"></p>
      ${relatedMarkup(related)}
    `;

    article.insertAdjacentElement("afterend", wrap);

    const shareBtn = wrap.querySelector("[data-fft-share-news]");
    const noteEl = wrap.querySelector(".fft-news-detail-share-note");

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareCurrentPage(noteEl);
      });
    }
  }

  ready(function () {
    installActions();
    window.setTimeout(installActions, 700);
    window.setTimeout(installActions, 1400);
  });
}());
