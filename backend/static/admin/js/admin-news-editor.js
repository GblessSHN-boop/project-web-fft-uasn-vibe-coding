// News Studio Editor
(function () {
  const form = document.querySelector("[data-news-editor-form]");
  if (!form) return;

  const titleInput = document.querySelector("[data-news-title]");
  const summaryInput = document.querySelector("[data-news-summary]");
  const contentInput = document.querySelector("[data-news-content]");
  const categoryInput = document.querySelector("[data-news-category]");

  const titleCount = document.querySelector("[data-news-title-count]");
  const summaryCount = document.querySelector("[data-news-summary-count]");
  const saveNote = document.querySelector("[data-news-save-note]");

  const previewTitle = document.querySelector("[data-news-preview-title]");
  const previewSummary = document.querySelector("[data-news-preview-summary]");
  const previewMeta = document.querySelector("[data-news-preview-meta]");
  const detailTitle = document.querySelector("[data-news-detail-title]");
  const detailContent = document.querySelector("[data-news-detail-content]");
  const cardImage = document.querySelector("[data-news-card-image]");
  const detailImage = document.querySelector("[data-news-detail-image]");

  const tabs = document.querySelectorAll("[data-news-tab]");
  const panels = document.querySelectorAll("[data-news-panel]");
  const checks = document.querySelectorAll("[data-news-check]");
  const deleteForm = document.querySelector("[data-news-editor-delete-form]");

  const modal = document.querySelector("[data-news-crop-modal]");
  const viewport = document.querySelector("[data-news-crop-viewport]");
  const cropImage = document.querySelector("[data-news-crop-image]");
  const cropTitle = document.querySelector("[data-news-crop-title]");
  const cropRule = document.querySelector("[data-news-crop-rule]");
  const cropLabel = document.querySelector("[data-news-crop-size-label]");
  const zoomInput = document.querySelector("[data-news-crop-zoom]");
  const resetButton = document.querySelector("[data-news-crop-reset]");
  const applyButton = document.querySelector("[data-news-crop-apply]");
  const cancelButtons = document.querySelectorAll("[data-news-crop-cancel]");

  let activeInput = null;
  let activeKind = "";
  let activeOutput = null;
  let objectUrl = "";

  const state = {
    ready: false,
    naturalWidth: 1,
    naturalHeight: 1,
    outputWidth: 1600,
    outputHeight: 900,
    frameWidth: 1,
    frameHeight: 1,
    baseScale: 1,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  };

  function clean(value) {
    return String(value || "").trim();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function markChanged() {
    if (saveNote) {
      saveNote.textContent = "Ada perubahan yang belum disimpan.";
    }
  }

  function updatePreview() {
    const title = clean(titleInput && titleInput.value) || "Judul berita tampil di sini";
    const summary = clean(summaryInput && summaryInput.value) || "Ringkasan berita tampil di sini.";
    const content = clean(contentInput && contentInput.value) || "Isi berita akan tampil di sini.";
    const category = (clean(categoryInput && categoryInput.value) || "umum").toUpperCase();

    if (titleCount && titleInput) titleCount.textContent = titleInput.value.length;
    if (summaryCount && summaryInput) summaryCount.textContent = summaryInput.value.length;

    if (previewTitle) previewTitle.textContent = title;
    if (detailTitle) detailTitle.textContent = title;
    if (previewSummary) previewSummary.textContent = summary;
    if (detailContent) detailContent.textContent = content;

    if (previewMeta) {
      const code = (previewMeta.textContent || "KODE BARU").split("·")[0].trim();
      previewMeta.textContent = `${code} · ${category}`;
    }

    updateChecklist();
  }

  function setCheck(name, ok, text) {
    const item = Array.from(checks).find((el) => el.getAttribute("data-news-check") === name);
    if (!item) return;

    item.textContent = `${ok ? "✓" : "!"} ${text}`;
    item.classList.toggle("is-ok", ok);
    item.classList.toggle("is-warning", !ok);
  }

  function hasImage(box) {
    return Boolean(box && box.querySelector("img"));
  }

  function updateChecklist() {
    const title = clean(titleInput && titleInput.value);
    const summary = clean(summaryInput && summaryInput.value);
    const content = clean(contentInput && contentInput.value);

    setCheck("title", title.length >= 8 && title.length <= 120, "Judul jelas dan tidak terlalu panjang.");
    setCheck("summary", summary.length >= 20 && summary.length <= 220, "Ringkasan cukup pendek untuk kartu berita.");
    setCheck("content", content.length >= 80, "Isi berita sudah cukup untuk halaman detail.");
    setCheck("thumbnail", hasImage(document.querySelector('[data-news-preview-box="thumbnail"]')), "Thumbnail tersedia.");
    setCheck("detail", hasImage(document.querySelector('[data-news-preview-box="detail"]')), "Gambar detail tersedia.");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-news-tab");

      tabs.forEach((item) => item.classList.remove("is-active"));
      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.getAttribute("data-news-panel") === target);
      });

      tab.classList.add("is-active");
    });
  });

  function releaseObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = "";
    }
  }

  function getViewport() {
    const rect = viewport.getBoundingClientRect();
    state.frameWidth = Math.max(1, rect.width);
    state.frameHeight = Math.max(1, rect.height);
  }

  function renderCrop() {
    if (!state.ready) return;

    getViewport();

    state.baseScale = Math.max(
      state.frameWidth / state.naturalWidth,
      state.frameHeight / state.naturalHeight
    );

    const scale = state.baseScale * state.zoom;
    const displayWidth = state.naturalWidth * scale;
    const displayHeight = state.naturalHeight * scale;

    const maxX = Math.max(0, (displayWidth - state.frameWidth) / 2);
    const maxY = Math.max(0, (displayHeight - state.frameHeight) / 2);

    state.offsetX = clamp(state.offsetX, -maxX, maxX);
    state.offsetY = clamp(state.offsetY, -maxY, maxY);

    cropImage.style.width = `${displayWidth}px`;
    cropImage.style.height = `${displayHeight}px`;
    cropImage.style.left = `${(state.frameWidth - displayWidth) / 2 + state.offsetX}px`;
    cropImage.style.top = `${(state.frameHeight - displayHeight) / 2 + state.offsetY}px`;
  }

  function resetCrop() {
    state.zoom = 1;
    state.offsetX = 0;
    state.offsetY = 0;

    if (zoomInput) zoomInput.value = "1";

    renderCrop();
  }

  function getCropData() {
    getViewport();

    const scale = state.baseScale * state.zoom;
    const displayWidth = state.naturalWidth * scale;
    const displayHeight = state.naturalHeight * scale;
    const left = (state.frameWidth - displayWidth) / 2 + state.offsetX;
    const top = (state.frameHeight - displayHeight) / 2 + state.offsetY;

    const x = clamp((0 - left) / scale, 0, state.naturalWidth);
    const y = clamp((0 - top) / scale, 0, state.naturalHeight);
    const width = clamp(state.frameWidth / scale, 1, state.naturalWidth - x);
    const height = clamp(state.frameHeight / scale, 1, state.naturalHeight - y);

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  function createPreview(crop) {
    const canvas = document.createElement("canvas");
    canvas.width = state.outputWidth;
    canvas.height = state.outputHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      cropImage,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/jpeg", 0.92);
  }

  function setImagePreview(kind, dataUrl) {
    const uploadBox = document.querySelector(`[data-news-preview-box="${kind}"]`);
    const liveBox = kind === "thumbnail" ? cardImage : detailImage;

    [uploadBox, liveBox].forEach((box) => {
      if (!box) return;

      box.innerHTML = "";
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = kind === "thumbnail" ? "Thumbnail berita" : "Gambar detail berita";
      box.appendChild(img);
    });

    updateChecklist();
  }

  function openCrop(input) {
    const file = input.files && input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus gambar.");
      input.value = "";
      return;
    }

    activeInput = input;
    activeKind = input.getAttribute("data-news-media-input") || "thumbnail";
    activeOutput = document.querySelector(`[data-news-crop-output="${activeKind}"]`);

    state.outputWidth = Number(input.getAttribute("data-output-width")) || 1600;
    state.outputHeight = Number(input.getAttribute("data-output-height")) || 900;
    state.ready = false;

    releaseObjectUrl();
    objectUrl = URL.createObjectURL(file);

    cropImage.src = objectUrl;

    if (viewport) viewport.style.aspectRatio = `${state.outputWidth} / ${state.outputHeight}`;
    if (cropTitle) cropTitle.textContent = activeKind === "thumbnail" ? "Crop Thumbnail" : "Crop Gambar Detail";
    if (cropRule) cropRule.textContent = `Output final ${state.outputWidth} × ${state.outputHeight} px.`;
    if (cropLabel) cropLabel.textContent = `${state.outputWidth} × ${state.outputHeight}`;

    modal.hidden = false;

    cropImage.onload = function () {
      state.naturalWidth = cropImage.naturalWidth || 1;
      state.naturalHeight = cropImage.naturalHeight || 1;
      state.ready = true;
      resetCrop();
    };
  }

  function closeCrop() {
    modal.hidden = true;
  }

  document.querySelectorAll("[data-news-media-input]").forEach((input) => {
    input.addEventListener("change", function () {
      const kind = input.getAttribute("data-news-media-input");
      const output = document.querySelector(`[data-news-crop-output="${kind}"]`);
      if (output) output.value = "";
      openCrop(input);
      markChanged();
    });
  });

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      state.zoom = Number(zoomInput.value) || 1;
      renderCrop();
    });
  }

  if (viewport) {
    viewport.addEventListener("pointerdown", function (event) {
      if (!state.ready) return;

      state.dragging = true;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.startOffsetX = state.offsetX;
      state.startOffsetY = state.offsetY;
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", function (event) {
      if (!state.dragging) return;

      state.offsetX = state.startOffsetX + event.clientX - state.startX;
      state.offsetY = state.startOffsetY + event.clientY - state.startY;
      renderCrop();
    });

    viewport.addEventListener("pointerup", function (event) {
      state.dragging = false;
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (error) {
        // ignore
      }
    });
  }

  if (resetButton) resetButton.addEventListener("click", resetCrop);

  cancelButtons.forEach((button) => {
    button.addEventListener("click", closeCrop);
  });

  if (applyButton) {
    applyButton.addEventListener("click", function () {
      if (!state.ready || !activeOutput) return;

      const crop = getCropData();
      activeOutput.value = JSON.stringify(crop);

      setImagePreview(activeKind, createPreview(crop));
      closeCrop();
      markChanged();
    });
  }

  [titleInput, summaryInput, contentInput, categoryInput].forEach((input) => {
    if (!input) return;

    input.addEventListener("input", function () {
      updatePreview();
      markChanged();
    });

    input.addEventListener("change", function () {
      updatePreview();
      markChanged();
    });
  });

  form.addEventListener("submit", function (event) {
    const thumbInput = document.querySelector('[data-news-media-input="thumbnail"]');
    const detailInput = document.querySelector('[data-news-media-input="detail"]');
    const thumbOutput = document.querySelector('[data-news-crop-output="thumbnail"]');
    const detailOutput = document.querySelector('[data-news-crop-output="detail"]');

    if (thumbInput && thumbInput.files[0] && thumbOutput && !thumbOutput.value) {
      event.preventDefault();
      alert("Thumbnail sudah dipilih, tapi belum dicrop.");
      openCrop(thumbInput);
      return;
    }

    if (detailInput && detailInput.files[0] && detailOutput && !detailOutput.value) {
      event.preventDefault();
      alert("Gambar detail sudah dipilih, tapi belum dicrop.");
      openCrop(detailInput);
    }
  });

  if (deleteForm) {
    deleteForm.addEventListener("submit", function (event) {
      const ok = window.confirm("Hapus berita ini?\n\nAksi ini akan menghapus berita dari admin.");
      if (!ok) event.preventDefault();
    });
  }

  window.addEventListener("resize", renderCrop);

  updatePreview();
})();
