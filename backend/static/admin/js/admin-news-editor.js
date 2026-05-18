// Professional admin news editor
(function () {
  const form = document.querySelector("[data-news-editor-form]");

  if (!form) return;

  const fields = {
    title: form.querySelector('[data-news-input="title"]'),
    summary: form.querySelector('[data-news-input="summary"]'),
    content: form.querySelector('[data-news-input="content"]'),
    category: form.querySelector('[data-news-input="category"]'),
  };

  const counters = {
    summary: document.querySelector('[data-news-count="summary"]'),
    content: document.querySelector('[data-news-count="content"]'),
  };

  const previewTitle = document.querySelector("[data-news-preview-title]");
  const previewTitleDetail = document.querySelector("[data-news-preview-title-detail]");
  const previewSummary = document.querySelector("[data-news-preview-summary]");
  const previewContent = document.querySelector("[data-news-preview-content]");
  const previewCategory = document.querySelector("[data-news-preview-category]");

  const tabs = Array.from(document.querySelectorAll("[data-news-preview-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-news-preview-panel]"));

  let isDirty = false;

  function getValue(key) {
    return fields[key] ? String(fields[key].value || "").trim() : "";
  }

  function syncAliases() {
    Object.entries(fields).forEach(([key, input]) => {
      if (!input) return;

      const aliases = form.querySelectorAll(`[data-news-alias="${key}"]`);

      aliases.forEach((alias) => {
        alias.value = input.value;
      });
    });
  }

  function updateCounters() {
    if (counters.summary && fields.summary) {
      counters.summary.textContent = String(fields.summary.value.length);
    }

    if (counters.content && fields.content) {
      counters.content.textContent = String(fields.content.value.length);
    }
  }

  function updatePreview() {
    const title = getValue("title") || "Judul berita akan muncul di sini";
    const summary = getValue("summary") || "Ringkasan berita akan muncul di sini.";
    const content = getValue("content") || "Isi berita akan muncul di sini.";
    const category = getValue("category") || "UMUM";

    if (previewTitle) previewTitle.textContent = title;
    if (previewTitleDetail) previewTitleDetail.textContent = title;
    if (previewSummary) previewSummary.textContent = summary;
    if (previewContent) previewContent.textContent = content;
    if (previewCategory) {
      const current = previewCategory.textContent || "";
      const code = current.split("·")[0].trim() || "Kode";
      previewCategory.textContent = `${code} · ${category}`;
    }
  }

  function updateChecklist() {
    const checks = {
      title: Boolean(getValue("title")),
      summary: Boolean(getValue("summary")),
      content: Boolean(getValue("content")),
      thumbnail: Boolean(document.querySelector('[data-news-live-image="thumbnail"]:not([hidden])')),
      detail: Boolean(document.querySelector('[data-news-live-image="detail"]:not([hidden])')),
    };

    Object.entries(checks).forEach(([key, ok]) => {
      const element = document.querySelector(`[data-news-check="${key}"]`);
      if (element) element.classList.toggle("is-ok", ok);
    });
  }

  function refreshAll() {
    syncAliases();
    updateCounters();
    updatePreview();
    updateChecklist();
  }

  Object.values(fields).forEach((input) => {
    if (!input) return;

    input.addEventListener("input", function () {
      isDirty = true;
      refreshAll();
    });

    input.addEventListener("change", function () {
      isDirty = true;
      refreshAll();
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-news-preview-tab");

      tabs.forEach((button) => {
        button.classList.toggle("is-active", button === tab);
      });

      panels.forEach((panel) => {
        panel.classList.toggle(
          "is-active",
          panel.getAttribute("data-news-preview-panel") === target
        );
      });
    });
  });

  function setImagePreview(kind, file) {
    const objectUrl = URL.createObjectURL(file);

    const previewImage = document.querySelector(`[data-news-image-preview="${kind}"]`);
    const liveImage = document.querySelector(`[data-news-live-image="${kind}"]`);
    const empty = document.querySelector(`[data-news-image-empty="${kind}"]`);
    const liveEmpty = document.querySelector(`[data-news-live-empty="${kind}"]`);

    [previewImage, liveImage].forEach((image) => {
      if (!image) return;

      image.src = objectUrl;
      image.hidden = false;
    });

    if (empty) empty.hidden = true;
    if (liveEmpty) liveEmpty.hidden = true;

    updateChecklist();
  }

  document.querySelectorAll("[data-news-file]").forEach((input) => {
    input.addEventListener("change", function () {
      const file = input.files && input.files[0];

      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        alert("File yang dipilih harus berupa gambar.");
        input.value = "";
        return;
      }

      isDirty = true;
      setImagePreview(input.getAttribute("data-news-file"), file);
    });
  });

  const deleteButton = document.querySelector("[data-news-delete-submit]");

  if (deleteButton) {
    deleteButton.addEventListener("click", function (event) {
      const ok = window.confirm(
        "Hapus berita ini?\n\nTindakan ini hanya dilakukan jika berita benar-benar tidak diperlukan lagi."
      );

      if (!ok) {
        event.preventDefault();
      }
    });
  }

  const saveButton = document.querySelector("[data-news-save-submit]");

  if (saveButton) {
    saveButton.addEventListener("click", function () {
      syncAliases();
      isDirty = false;
    });
  }

  form.addEventListener("submit", function () {
    syncAliases();
    isDirty = false;
  });

  window.addEventListener("beforeunload", function (event) {
    if (!isDirty) return;

    event.preventDefault();
    event.returnValue = "";
  });

  refreshAll();
})();

/* NEWS_IMAGE_CROP_SCRIPT_START */
(function () {
  "use strict";

  const CROP_CONFIGS = [
    {
      key: "thumbnail",
      label: "Thumbnail Kartu",
      width: 1450,
      height: 1000,
      match(input) {
        const value = `${input.name || ""} ${input.id || ""}`.toLowerCase();
        return value.includes("thumbnail") ||
          value.includes("thumb") ||
          value.includes("gambar_thumbnail") ||
          value.includes("gambar_cover") ||
          value.includes("cover");
      }
    },
    {
      key: "detail",
      label: "Gambar Detail",
      width: 1600,
      height: 900,
      match(input) {
        const value = `${input.name || ""} ${input.id || ""}`.toLowerCase();
        return value.includes("detail") ||
          value.includes("gambar_detail") ||
          value.includes("gambar_utama") ||
          value === "gambar" ||
          value.endsWith(" gambar");
      }
    }
  ];

  const state = {
    input: null,
    file: null,
    config: null,
    objectUrl: "",
    image: null,
    modal: null,
    stage: null,
    imgEl: null,
    frame: null,
    zoom: null,
    baseScale: 1,
    scale: 1,
    zoomValue: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    internalUpdate: false
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getConfig(input) {
    return CROP_CONFIGS.find((config) => config.match(input));
  }

  function removePreviewTabs() {
    const labels = new Set(["KARTU", "DETAIL", "CEK"]);

    const buttons = Array.from(document.querySelectorAll("button, a, [role='tab']"))
      .filter((element) => labels.has((element.textContent || "").trim().toUpperCase()));

    buttons.forEach((button) => {
      let group = button.closest("[data-news-preview-tabs], [data-editor-preview-tabs], .news-editor-preview-tabs, .news-preview-tabs, .preview-tabs, [role='tablist']");

      if (!group) {
        let node = button.parentElement;

        for (let i = 0; i < 5 && node; i += 1) {
          const text = (node.textContent || "").toUpperCase();

          if (text.includes("KARTU") && text.includes("DETAIL") && text.includes("CEK")) {
            group = node;
            break;
          }

          node = node.parentElement;
        }
      }

      if (group) {
        group.remove();
      }
    });
  }

  function ensureModal() {
    state.modal = document.getElementById("newsImageCropModal");

    if (!state.modal) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="news-crop-modal" id="newsImageCropModal" hidden aria-hidden="true">
          <div class="news-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="newsCropTitle">
            <div class="news-crop-header">
              <div>
                <p class="news-crop-kicker">Crop Manual</p>
                <h2 id="newsCropTitle">Atur Potongan Gambar</h2>
                <p id="newsCropHelp">Geser gambar dan atur zoom sampai komposisi terlihat rapi.</p>
              </div>
              <button type="button" class="news-crop-close" data-news-crop-cancel aria-label="Tutup">×</button>
            </div>

            <div class="news-crop-body">
              <div class="news-crop-stage" data-news-crop-stage>
                <img alt="Gambar yang akan dipotong" data-news-crop-image>
                <div class="news-crop-frame" data-news-crop-frame>
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>

              <div class="news-crop-control">
                <label for="newsCropZoom">Zoom gambar</label>
                <input id="newsCropZoom" type="range" min="1" max="3" step="0.01" value="1" data-news-crop-zoom>
              </div>
            </div>

            <div class="news-crop-footer">
              <button type="button" class="btn btn-secondary" data-news-crop-reset>Reset</button>
              <button type="button" class="btn btn-secondary" data-news-crop-cancel>Batal</button>
              <button type="button" class="btn btn-primary" data-news-crop-apply>Gunakan Hasil Crop</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper.firstElementChild);
      state.modal = document.getElementById("newsImageCropModal");
    }

    state.stage = state.modal.querySelector("[data-news-crop-stage]");
    state.imgEl = state.modal.querySelector("[data-news-crop-image]");
    state.frame = state.modal.querySelector("[data-news-crop-frame]");
    state.zoom = state.modal.querySelector("[data-news-crop-zoom]");

    state.modal.querySelectorAll("[data-news-crop-cancel]").forEach((button) => {
      button.addEventListener("click", closeCrop);
    });

    const resetButton = state.modal.querySelector("[data-news-crop-reset]");
    if (resetButton) {
      resetButton.addEventListener("click", resetCrop);
    }

    const applyButton = state.modal.querySelector("[data-news-crop-apply]");
    if (applyButton) {
      applyButton.addEventListener("click", applyCrop);
    }

    state.zoom.addEventListener("input", () => {
      state.zoomValue = Number(state.zoom.value || 1);
      updateImagePosition(true);
    });

    state.stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    state.stage.addEventListener("wheel", (event) => {
      if (state.modal.hidden) return;

      event.preventDefault();

      const current = Number(state.zoom.value || 1);
      const next = Math.min(3, Math.max(1, current + (event.deltaY > 0 ? -0.08 : 0.08)));

      state.zoom.value = String(next);
      state.zoomValue = next;
      updateImagePosition(true);
    }, { passive: false });

    window.addEventListener("resize", () => {
      if (!state.modal.hidden) {
        resetCrop();
      }
    });
  }

  function attachInputs() {
    document.querySelectorAll("input[type='file']").forEach((input) => {
      const config = getConfig(input);

      if (!config || input.dataset.newsCropBound === "1") return;

      input.dataset.newsCropBound = "1";
      input.setAttribute("accept", "image/png,image/jpeg,image/jpg,image/webp");

      input.addEventListener("change", () => {
        if (state.internalUpdate) return;

        const file = input.files && input.files[0];

        if (!file) return;

        if (!/^image\//i.test(file.type)) {
          alert("File harus berupa gambar.");
          input.value = "";
          return;
        }

        openCrop(input, file, config);
      });
    });
  }

  function openCrop(input, file, config) {
    ensureModal();

    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
    }

    state.input = input;
    state.file = file;
    state.config = config;
    state.objectUrl = URL.createObjectURL(file);
    state.image = new Image();

    const title = state.modal.querySelector("#newsCropTitle");
    const help = state.modal.querySelector("#newsCropHelp");

    if (title) {
      title.textContent = `Atur ${config.label}`;
    }

    if (help) {
      help.textContent = `Hasil akhir akan dibuat otomatis menjadi ${config.width} × ${config.height} px. Geser gambar dan atur zoom sampai posisinya sesuai.`;
    }

    state.image.onload = () => {
      state.imgEl.src = state.objectUrl;
      state.modal.hidden = false;
      state.modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      requestAnimationFrame(resetCrop);
    };

    state.image.src = state.objectUrl;
  }

  function resetCrop() {
    if (!state.image || !state.config || !state.stage) return;

    const stageRect = state.stage.getBoundingClientRect();
    const ratio = state.config.width / state.config.height;

    let frameWidth = Math.max(260, stageRect.width - 64);
    let frameHeight = frameWidth / ratio;

    if (frameHeight > stageRect.height - 64) {
      frameHeight = Math.max(180, stageRect.height - 64);
      frameWidth = frameHeight * ratio;
    }

    state.frame.style.width = `${frameWidth}px`;
    state.frame.style.height = `${frameHeight}px`;
    state.frame.style.left = `${(stageRect.width - frameWidth) / 2}px`;
    state.frame.style.top = `${(stageRect.height - frameHeight) / 2}px`;

    state.baseScale = Math.max(
      frameWidth / state.image.naturalWidth,
      frameHeight / state.image.naturalHeight
    );

    state.zoomValue = 1;
    state.zoom.value = "1";
    state.panX = 0;
    state.panY = 0;

    updateImagePosition(true);
  }

  function clampPan() {
    const stageRect = state.stage.getBoundingClientRect();
    const frameRect = state.frame.getBoundingClientRect();

    const stageW = stageRect.width;
    const stageH = stageRect.height;
    const frameLeft = frameRect.left - stageRect.left;
    const frameTop = frameRect.top - stageRect.top;
    const frameRight = frameLeft + frameRect.width;
    const frameBottom = frameTop + frameRect.height;

    const centerX = stageW / 2;
    const centerY = stageH / 2;

    const imageW = state.image.naturalWidth * state.scale;
    const imageH = state.image.naturalHeight * state.scale;

    const minPanX = frameRight - centerX - imageW / 2;
    const maxPanX = frameLeft - centerX + imageW / 2;
    const minPanY = frameBottom - centerY - imageH / 2;
    const maxPanY = frameTop - centerY + imageH / 2;

    state.panX = Math.min(maxPanX, Math.max(minPanX, state.panX));
    state.panY = Math.min(maxPanY, Math.max(minPanY, state.panY));
  }

  function updateImagePosition(shouldClamp) {
    if (!state.image || !state.stage || !state.imgEl) return;

    state.scale = state.baseScale * state.zoomValue;

    if (shouldClamp) {
      clampPan();
    }

    const stageRect = state.stage.getBoundingClientRect();
    const imageW = state.image.naturalWidth * state.scale;
    const imageH = state.image.naturalHeight * state.scale;

    const left = stageRect.width / 2 - imageW / 2 + state.panX;
    const top = stageRect.height / 2 - imageH / 2 + state.panY;

    state.imgEl.style.width = `${imageW}px`;
    state.imgEl.style.height = `${imageH}px`;
    state.imgEl.style.left = `${left}px`;
    state.imgEl.style.top = `${top}px`;
  }

  function onPointerDown(event) {
    if (state.modal.hidden || !state.image) return;

    state.dragging = true;
    state.stage.classList.add("is-dragging");
    state.stage.setPointerCapture(event.pointerId);

    state.startX = event.clientX;
    state.startY = event.clientY;
    state.startPanX = state.panX;
    state.startPanY = state.panY;
  }

  function onPointerMove(event) {
    if (!state.dragging) return;

    state.panX = state.startPanX + event.clientX - state.startX;
    state.panY = state.startPanY + event.clientY - state.startY;

    updateImagePosition(true);
  }

  function onPointerUp() {
    state.dragging = false;

    if (state.stage) {
      state.stage.classList.remove("is-dragging");
    }
  }

  function cropCoordinates() {
    const stageRect = state.stage.getBoundingClientRect();
    const frameRect = state.frame.getBoundingClientRect();

    const imageW = state.image.naturalWidth * state.scale;
    const imageH = state.image.naturalHeight * state.scale;

    const imgLeft = stageRect.width / 2 - imageW / 2 + state.panX;
    const imgTop = stageRect.height / 2 - imageH / 2 + state.panY;

    const frameLeft = frameRect.left - stageRect.left;
    const frameTop = frameRect.top - stageRect.top;

    return {
      sx: Math.max(0, (frameLeft - imgLeft) / state.scale),
      sy: Math.max(0, (frameTop - imgTop) / state.scale),
      sw: frameRect.width / state.scale,
      sh: frameRect.height / state.scale
    };
  }

  function applyCrop() {
    if (!state.input || !state.image || !state.config) return;

    const coords = cropCoordinates();
    const canvas = document.createElement("canvas");

    canvas.width = state.config.width;
    canvas.height = state.config.height;

    const context = canvas.getContext("2d");

    context.drawImage(
      state.image,
      coords.sx,
      coords.sy,
      coords.sw,
      coords.sh,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const originalName = state.file.name || "gambar-berita.jpg";
      const cleanName = originalName.replace(/\.[^.]+$/, "");
      const finalName = `${cleanName}-crop-${state.config.width}x${state.config.height}.jpg`;
      const finalFile = new File([blob], finalName, {
        type: "image/jpeg",
        lastModified: Date.now()
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(finalFile);

      state.internalUpdate = true;
      state.input.files = dataTransfer.files;
      state.internalUpdate = false;

      updateExistingPreview(state.input, URL.createObjectURL(finalFile));
      closeCrop();
    }, "image/jpeg", 0.92);
  }

  function updateExistingPreview(input, objectUrl) {
    let box = input.parentElement;

    for (let i = 0; i < 7 && box; i += 1) {
      const fileInputCount = box.querySelectorAll("input[type='file']").length;
      const image = box.querySelector("img");

      if (image && fileInputCount <= 1) {
        image.src = objectUrl;
        return;
      }

      box = box.parentElement;
    }

    const config = getConfig(input);

    if (!config) return;

    const keyword = config.key === "thumbnail" ? "thumbnail" : "detail";

    const images = Array.from(document.querySelectorAll("img"));
    const target = images.find((image) => {
      const text = `${image.alt || ""} ${image.title || ""} ${image.dataset ? JSON.stringify(image.dataset) : ""}`.toLowerCase();
      return text.includes(keyword) || (config.key === "thumbnail" && text.includes("kartu"));
    });

    if (target) {
      target.src = objectUrl;
    }
  }

  function closeCrop() {
    if (state.modal) {
      state.modal.hidden = true;
      state.modal.setAttribute("aria-hidden", "true");
    }

    document.body.style.overflow = "";

    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
    }

    state.objectUrl = "";
    state.input = null;
    state.file = null;
    state.config = null;
    state.image = null;
    state.dragging = false;
  }

  ready(() => {
    removePreviewTabs();
    ensureModal();
    attachInputs();

    setTimeout(removePreviewTabs, 300);
    setTimeout(removePreviewTabs, 900);
  });
})();
/* NEWS_IMAGE_CROP_SCRIPT_END */

/* NEWS_REMOVE_EDITOR_PREVIEW_START */
(function () {
  "use strict";

  function looksLikePreviewPanel(element) {
    const text = (element.textContent || "").replace(/\s+/g, " ").trim().toUpperCase();

    if (!text) return false;

    const hasTabs =
      text.includes("KARTU") &&
      text.includes("DETAIL") &&
      text.includes("CEK");

    const hasPreviewText =
      text.includes("JUDUL BERITA AKAN MUNCUL") ||
      text.includes("RINGKASAN BERITA AKAN MUNCUL") ||
      text.includes("KODE BARU") ||
      text.includes("PREVIEW THUMBNAIL");

    return hasTabs || hasPreviewText;
  }

  function removeEditorPreviewPanel() {
    const candidates = Array.from(document.querySelectorAll(
      "aside, section, .card, .admin-card, .module-card, .news-preview, .news-editor-preview, .preview-panel, .editor-preview, .form-preview, .content-card, div"
    ));

    const matches = candidates
      .filter(looksLikePreviewPanel)
      .sort((a, b) => b.querySelectorAll("*").length - a.querySelectorAll("*").length);

    matches.forEach((element) => {
      const text = (element.textContent || "").toUpperCase();

      const containsFormFields =
        text.includes("JUDUL BERITA") &&
        text.includes("RINGKASAN") &&
        text.includes("GAMBAR KARTU DAN DETAIL") &&
        element.querySelector("form, input[type='file'], textarea");

      if (containsFormFields) {
        return;
      }

      element.remove();
    });
  }

  function run() {
    removeEditorPreviewPanel();
    setTimeout(removeEditorPreviewPanel, 250);
    setTimeout(removeEditorPreviewPanel, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
/* NEWS_REMOVE_EDITOR_PREVIEW_END */

/* NEWS_EDITOR_UX_POLISH_START */
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function isEditorPage() {
    return location.pathname.includes("/admin/berita/edit") ||
      location.pathname.includes("/admin/berita/add");
  }

  function addEditorGuide() {
    if (!isEditorPage()) return;

    document.body.classList.add("news-editor-page");

    if (document.querySelector(".news-editor-guide")) return;

    const form = document.querySelector("form");

    if (!form) return;

    const guide = document.createElement("section");
    guide.className = "news-editor-guide";
    guide.innerHTML = `
      <div class="news-editor-guide__header">
        <p>Alur Pengisian</p>
        <h2>Lengkapi berita dengan urutan yang sederhana</h2>
      </div>
      <div class="news-editor-guide__steps">
        <div>
          <strong>01</strong>
          <span>Isi judul, ringkasan, isi lengkap, dan kategori berita.</span>
        </div>
        <div>
          <strong>02</strong>
          <span>Pilih gambar, lalu gunakan crop manual agar tampilan kartu dan detail tetap rapi.</span>
        </div>
        <div>
          <strong>03</strong>
          <span>Klik Simpan. Setelah itu Anda akan kembali ke daftar berita untuk menayangkan konten.</span>
        </div>
      </div>
    `;

    const target = form.closest("section, article, .admin-card, .module-card") || form;
    target.insertAdjacentElement("beforebegin", guide);
  }

  function polishButtons() {
    if (!isEditorPage()) return;

    const isAdd = location.pathname.includes("/admin/berita/add");

    document.querySelectorAll("button, input[type='submit'], a").forEach(function (element) {
      const text = (element.textContent || element.value || "").trim().toUpperCase();

      if (text === "SIMPAN BERITA" || text === "SIMPAN PERUBAHAN") {
        if (element.tagName === "INPUT") {
          element.value = isAdd ? "Simpan Berita Baru" : "Simpan Perubahan";
        } else {
          element.textContent = isAdd ? "Simpan Berita Baru" : "Simpan Perubahan";
        }

        element.classList.add("news-editor-primary-action");
      }

      if (text === "BATAL") {
        element.classList.add("news-editor-secondary-action");
      }
    });
  }

  function improveFileInputs() {
    if (!isEditorPage()) return;

    document.querySelectorAll("input[type='file']").forEach(function (input) {
      input.classList.add("news-editor-file-input");

      const parent = input.parentElement;

      if (parent) {
        parent.classList.add("news-editor-file-box");
      }
    });
  }

  function run() {
    addEditorGuide();
    polishButtons();
    improveFileInputs();

    setTimeout(function () {
      addEditorGuide();
      polishButtons();
      improveFileInputs();
    }, 500);
  }

  ready(run);
})();
/* NEWS_EDITOR_UX_POLISH_END */

/* NEWS_EDITOR_SUBMIT_BUTTON_FIX_START */
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function isNewsEditorPage() {
    return location.pathname.includes("/admin/berita/add") ||
      location.pathname.includes("/admin/berita/edit");
  }

  function findMainNewsForm() {
    const forms = Array.from(document.querySelectorAll("form"));

    if (!forms.length) return null;

    return forms.find(function (form) {
      return form.querySelector("input[type='file']") ||
        form.querySelector("textarea") ||
        form.querySelector("input[name='judul']") ||
        form.querySelector("input[name='title']") ||
        form.querySelector("textarea[name='isi']") ||
        form.querySelector("textarea[name='content']");
    }) || forms[0];
  }

  function normalizeForm(form) {
    form.setAttribute("method", "POST");
    form.setAttribute("enctype", "multipart/form-data");
  }

  function normalizeExistingSubmit(form, isAddPage) {
    const submitButtons = Array.from(
      form.querySelectorAll("button[type='submit'], input[type='submit']")
    );

    submitButtons.forEach(function (button) {
      const text = isAddPage ? "Simpan Berita Baru" : "Simpan Perubahan";

      if (button.tagName === "INPUT") {
        button.value = text;
      } else {
        button.textContent = text;
      }

      button.classList.add("news-editor-primary-action");
    });

    return submitButtons.length > 0;
  }

  function addSubmitCard(form) {
    if (form.querySelector(".news-editor-submit-card")) return;

    const isAddPage = location.pathname.includes("/admin/berita/add");

    const card = document.createElement("section");
    card.className = "news-editor-submit-card";
    card.innerHTML = `
      <div class="news-editor-submit-card__text">
        <p>${isAddPage ? "Simpan Berita" : "Simpan Perubahan"}</p>
        <h2>${isAddPage ? "Berita siap disimpan sebagai stok" : "Simpan perubahan berita"}</h2>
        <span>
          ${isAddPage
            ? "Setelah disimpan, berita masuk ke daftar stok. Berita belum tampil di website sampai Anda menayangkannya."
            : "Setelah disimpan, Anda akan kembali ke daftar berita untuk meninjau status penayangan."}
        </span>
      </div>
      <div class="news-editor-submit-card__actions">
        <button type="submit" class="news-editor-primary-action">
          ${isAddPage ? "Simpan Berita Baru" : "Simpan Perubahan"}
        </button>
        <a href="/admin/berita/list" class="news-editor-secondary-action">
          Batal
        </a>
      </div>
    `;

    form.appendChild(card);
  }

  function run() {
    if (!isNewsEditorPage()) return;

    const form = findMainNewsForm();

    if (!form) return;

    document.body.classList.add("news-editor-page");

    normalizeForm(form);

    const hasSubmit = normalizeExistingSubmit(form, location.pathname.includes("/admin/berita/add"));

    addSubmitCard(form);

    if (!hasSubmit) {
      console.info("Tombol simpan berita ditambahkan otomatis.");
    }
  }

  ready(function () {
    run();
    setTimeout(run, 300);
    setTimeout(run, 900);
  });
})();
/* NEWS_EDITOR_SUBMIT_BUTTON_FIX_END */
