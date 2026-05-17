// Admin News Editor UX
(function () {
  const form = document.querySelector("[data-news-editor-form]");
  if (!form) return;

  const titleInput = document.querySelector("[data-news-title]");
  const summaryInput = document.querySelector("[data-news-summary]");
  const contentInput = document.querySelector("[data-news-content]");
  const categoryInput = document.querySelector("[data-news-category]");

  const titleCount = document.querySelector("[data-news-title-count]");
  const summaryCount = document.querySelector("[data-news-summary-count]");

  const previewTitle = document.querySelector("[data-news-preview-title]");
  const previewSummary = document.querySelector("[data-news-preview-summary]");
  const previewMeta = document.querySelector("[data-news-preview-meta]");
  const detailTitle = document.querySelector("[data-news-detail-title]");
  const detailContent = document.querySelector("[data-news-detail-content]");
  const cardImage = document.querySelector("[data-news-card-image]");
  const detailImage = document.querySelector("[data-news-detail-image]");

  const modal = document.querySelector("[data-news-crop-modal]");
  const viewport = document.querySelector("[data-news-crop-viewport]");
  const cropImage = document.querySelector("[data-news-crop-image]");
  const cropTitle = document.querySelector("[data-news-crop-title]");
  const cropRule = document.querySelector("[data-news-crop-rule]");
  const cropSizeLabel = document.querySelector("[data-news-crop-size-label]");
  const zoomInput = document.querySelector("[data-news-crop-zoom]");
  const cancelButtons = document.querySelectorAll("[data-news-crop-cancel]");
  const resetButton = document.querySelector("[data-news-crop-reset]");
  const applyButton = document.querySelector("[data-news-crop-apply]");
  const deleteForm = document.querySelector("[data-news-editor-delete-form]");

  let activeInput = null;
  let activeKind = "";
  let activeOutput = null;
  let objectUrl = "";
  let imageReady = false;

  const cropState = {
    naturalWidth: 0,
    naturalHeight: 0,
    outputWidth: 1600,
    outputHeight: 900,
    frameWidth: 0,
    frameHeight: 0,
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

  function revokeObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = "";
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function text(value, fallback) {
    const clean = String(value || "").trim();
    return clean || fallback;
  }

  function updateTextPreview() {
    const title = text(titleInput && titleInput.value, "Judul berita akan tampil di sini");
    const summary = text(summaryInput && summaryInput.value, "Ringkasan berita akan tampil di sini.");
    const content = text(contentInput && contentInput.value, "Isi berita akan tampil di area ini.");
    const category = text(categoryInput && categoryInput.value, "umum").toUpperCase();

    if (titleCount && titleInput) {
      titleCount.textContent = `${titleInput.value.length} / 150 karakter`;
    }

    if (summaryCount && summaryInput) {
      summaryCount.textContent = `${summaryInput.value.length} / 260 karakter`;
    }

    if (previewTitle) previewTitle.textContent = title;
    if (detailTitle) detailTitle.textContent = title;
    if (previewSummary) previewSummary.textContent = summary;
    if (detailContent) detailContent.textContent = content;

    if (previewMeta) {
      const current = previewMeta.textContent || "KODE BARU";
      const code = current.split("·")[0].trim() || "KODE BARU";
      previewMeta.textContent = `${code} · ${category}`;
    }
  }

  function getViewportSize() {
    const rect = viewport.getBoundingClientRect();
    cropState.frameWidth = Math.max(1, rect.width);
    cropState.frameHeight = Math.max(1, rect.height);
  }

  function clampOffsets(displayWidth, displayHeight) {
    const maxX = Math.max(0, (displayWidth - cropState.frameWidth) / 2);
    const maxY = Math.max(0, (displayHeight - cropState.frameHeight) / 2);

    cropState.offsetX = clamp(cropState.offsetX, -maxX, maxX);
    cropState.offsetY = clamp(cropState.offsetY, -maxY, maxY);
  }

  function renderCrop() {
    if (!imageReady) return;

    getViewportSize();

    cropState.baseScale = Math.max(
      cropState.frameWidth / cropState.naturalWidth,
      cropState.frameHeight / cropState.naturalHeight
    );

    const scale = cropState.baseScale * cropState.zoom;
    const displayWidth = cropState.naturalWidth * scale;
    const displayHeight = cropState.naturalHeight * scale;

    clampOffsets(displayWidth, displayHeight);

    const left = (cropState.frameWidth - displayWidth) / 2 + cropState.offsetX;
    const top = (cropState.frameHeight - displayHeight) / 2 + cropState.offsetY;

    cropImage.style.width = `${displayWidth}px`;
    cropImage.style.height = `${displayHeight}px`;
    cropImage.style.left = `${left}px`;
    cropImage.style.top = `${top}px`;
  }

  function resetCrop() {
    cropState.zoom = 1;
    cropState.offsetX = 0;
    cropState.offsetY = 0;

    if (zoomInput) {
      zoomInput.value = "1";
    }

    renderCrop();
  }

  function getCropData() {
    getViewportSize();

    const scale = cropState.baseScale * cropState.zoom;
    const displayWidth = cropState.naturalWidth * scale;
    const displayHeight = cropState.naturalHeight * scale;
    const left = (cropState.frameWidth - displayWidth) / 2 + cropState.offsetX;
    const top = (cropState.frameHeight - displayHeight) / 2 + cropState.offsetY;

    const x = clamp((0 - left) / scale, 0, cropState.naturalWidth);
    const y = clamp((0 - top) / scale, 0, cropState.naturalHeight);
    const width = clamp(cropState.frameWidth / scale, 1, cropState.naturalWidth - x);
    const height = clamp(cropState.frameHeight / scale, 1, cropState.naturalHeight - y);

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  function createCroppedPreview(crop) {
    const canvas = document.createElement("canvas");
    canvas.width = cropState.outputWidth;
    canvas.height = cropState.outputHeight;

    const context = canvas.getContext("2d");
    context.drawImage(
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

  function setPreviewImage(kind, dataUrl) {
    const target = kind === "thumbnail" ? cardImage : detailImage;

    if (!target) return;

    target.innerHTML = "";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = kind === "thumbnail" ? "Preview thumbnail" : "Preview detail";

    target.appendChild(img);

    const mediaPreview = document.querySelector(`[data-news-preview-box="${kind}"]`);
    if (mediaPreview) {
      mediaPreview.innerHTML = "";
      const mediaImg = document.createElement("img");
      mediaImg.src = dataUrl;
      mediaImg.alt = img.alt;
      mediaPreview.appendChild(mediaImg);
    }
  }

  function openCrop(input) {
    const file = input.files && input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      input.value = "";
      return;
    }

    activeInput = input;
    activeKind = input.getAttribute("data-news-media-input") || "thumbnail";
    activeOutput = document.querySelector(`[data-news-crop-output="${activeKind}"]`);

    cropState.outputWidth = Number(input.getAttribute("data-output-width")) || 1600;
    cropState.outputHeight = Number(input.getAttribute("data-output-height")) || 900;

    revokeObjectUrl();
    objectUrl = URL.createObjectURL(file);

    imageReady = false;
    cropImage.src = objectUrl;

    if (cropTitle) {
      cropTitle.textContent = activeKind === "thumbnail" ? "Crop Thumbnail Berita" : "Crop Gambar Detail";
    }

    if (cropRule) {
      cropRule.textContent = `Output final: ${cropState.outputWidth} × ${cropState.outputHeight} px.`;
    }

    if (cropSizeLabel) {
      cropSizeLabel.textContent = `${cropState.outputWidth} × ${cropState.outputHeight}`;
    }

    if (viewport) {
      viewport.style.aspectRatio = `${cropState.outputWidth} / ${cropState.outputHeight}`;
    }

    modal.hidden = false;

    cropImage.onload = function () {
      cropState.naturalWidth = cropImage.naturalWidth || 1;
      cropState.naturalHeight = cropImage.naturalHeight || 1;
      imageReady = true;
      resetCrop();
    };
  }

  function closeCrop() {
    modal.hidden = true;
  }

  document.querySelectorAll("[data-news-media-input]").forEach((input) => {
    input.addEventListener("change", function () {
      const output = document.querySelector(`[data-news-crop-output="${input.getAttribute("data-news-media-input")}"]`);
      if (output) output.value = "";
      openCrop(input);
    });
  });

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      cropState.zoom = Number(zoomInput.value) || 1;
      renderCrop();
    });
  }

  if (viewport) {
    viewport.addEventListener("pointerdown", function (event) {
      if (!imageReady) return;

      cropState.dragging = true;
      cropState.startX = event.clientX;
      cropState.startY = event.clientY;
      cropState.startOffsetX = cropState.offsetX;
      cropState.startOffsetY = cropState.offsetY;
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", function (event) {
      if (!cropState.dragging) return;

      cropState.offsetX = cropState.startOffsetX + (event.clientX - cropState.startX);
      cropState.offsetY = cropState.startOffsetY + (event.clientY - cropState.startY);

      renderCrop();
    });

    viewport.addEventListener("pointerup", function (event) {
      cropState.dragging = false;
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (error) {
        // ignore
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetCrop);
  }

  cancelButtons.forEach((button) => {
    button.addEventListener("click", closeCrop);
  });

  if (applyButton) {
    applyButton.addEventListener("click", function () {
      if (!imageReady || !activeOutput || !activeInput) return;

      const crop = getCropData();
      activeOutput.value = JSON.stringify(crop);

      const dataUrl = createCroppedPreview(crop);
      setPreviewImage(activeKind, dataUrl);

      closeCrop();
    });
  }

  form.addEventListener("submit", function (event) {
    const thumbnailInput = document.querySelector('[data-news-media-input="thumbnail"]');
    const detailInput = document.querySelector('[data-news-media-input="detail"]');
    const thumbnailOutput = document.querySelector('[data-news-crop-output="thumbnail"]');
    const detailOutput = document.querySelector('[data-news-crop-output="detail"]');

    if (thumbnailInput && thumbnailInput.files[0] && thumbnailOutput && !thumbnailOutput.value) {
      event.preventDefault();
      alert("Thumbnail sudah dipilih, tapi belum dicrop. Terapkan crop terlebih dahulu.");
      openCrop(thumbnailInput);
      return;
    }

    if (detailInput && detailInput.files[0] && detailOutput && !detailOutput.value) {
      event.preventDefault();
      alert("Gambar detail sudah dipilih, tapi belum dicrop. Terapkan crop terlebih dahulu.");
      openCrop(detailInput);
    }
  });

  if (deleteForm) {
    deleteForm.addEventListener("submit", function (event) {
      const ok = window.confirm("Hapus berita ini?\n\nData berita akan dihapus dari admin.");
      if (!ok) event.preventDefault();
    });
  }

  [titleInput, summaryInput, contentInput, categoryInput].forEach((input) => {
    if (input) input.addEventListener("input", updateTextPreview);
    if (input) input.addEventListener("change", updateTextPreview);
  });

  window.addEventListener("resize", renderCrop);

  updateTextPreview();
})();
