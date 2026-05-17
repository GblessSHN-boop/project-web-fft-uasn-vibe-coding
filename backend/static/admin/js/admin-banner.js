(function () {
  "use strict";

  const fileInput = document.querySelector("[data-banner-file]");
  const fileName = document.querySelector("[data-banner-file-name]");
  const publishForm = document.querySelector("[data-publish-form]");

  if (fileInput && fileName) {
    fileInput.addEventListener("change", function () {
      const file = fileInput.files && fileInput.files[0];
      fileName.textContent = file ? file.name : "Belum ada file dipilih";
    });
  }

  if (publishForm) {
    publishForm.addEventListener("submit", function (event) {
      const ok = window.confirm("Publish banner ini ke website frontend?");
      if (!ok) {
        event.preventDefault();
      }
    });
  }
})();

// BANNER STOCK UPLOAD UX START
(function () {
  const OUTPUT_WIDTH = 3150;
  const OUTPUT_HEIGHT = 900;

  const modal = document.querySelector("[data-banner-crop-modal]");
  const cropViewport = document.querySelector("[data-banner-crop-viewport]");
  const cropImage = document.querySelector("[data-banner-crop-image]");
  const zoomInput = document.querySelector("[data-banner-crop-zoom]");
  const resetButtons = document.querySelectorAll("[data-banner-crop-reset]");
  const cancelButtons = document.querySelectorAll("[data-banner-crop-cancel]");
  const applyButton = document.querySelector("[data-banner-crop-apply]");

  let activeForm = null;
  let activeFileInput = null;
  let activePreviewBox = null;
  let activePreviewFrame = null;
  let activePreviewNote = null;
  let activeCropOpenButton = null;

  let sourceUrl = "";
  let cropReady = false;

  const cropState = {
    naturalWidth: 0,
    naturalHeight: 0,
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

  function revokeSourceUrl() {
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
      sourceUrl = "";
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getViewportSize() {
    if (!cropViewport) return;

    const rect = cropViewport.getBoundingClientRect();
    cropState.frameWidth = Math.max(1, rect.width);
    cropState.frameHeight = Math.max(1, rect.height);
  }

  function clampOffsets(displayWidth, displayHeight) {
    const maxX = Math.max(0, (displayWidth - cropState.frameWidth) / 2);
    const maxY = Math.max(0, (displayHeight - cropState.frameHeight) / 2);

    cropState.offsetX = clamp(cropState.offsetX, -maxX, maxX);
    cropState.offsetY = clamp(cropState.offsetY, -maxY, maxY);
  }

  function renderCropImage() {
    if (!cropImage || !cropReady) return;

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

    renderCropImage();
  }

  function openCropModal(file, context) {
    if (!modal || !cropImage || !cropViewport) return;

    activeForm = context.form;
    activeFileInput = context.fileInput;
    activePreviewBox = context.previewBox;
    activePreviewFrame = context.previewFrame;
    activePreviewNote = context.previewNote;
    activeCropOpenButton = context.cropOpenButton;

    revokeSourceUrl();
    sourceUrl = URL.createObjectURL(file);

    cropReady = false;
    cropImage.src = sourceUrl;

    cropImage.onload = function () {
      cropState.naturalWidth = cropImage.naturalWidth || 1;
      cropState.naturalHeight = cropImage.naturalHeight || 1;
      cropReady = true;
      resetCrop();
    };

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    window.setTimeout(renderCropImage, 50);
  }

  function closeCropModal() {
    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function buildCroppedFile(callback) {
    if (!cropImage || !cropReady) {
      callback(null);
      return;
    }

    getViewportSize();
    renderCropImage();

    const scale = cropState.baseScale * cropState.zoom;
    const displayWidth = cropState.naturalWidth * scale;
    const displayHeight = cropState.naturalHeight * scale;

    const left = (cropState.frameWidth - displayWidth) / 2 + cropState.offsetX;
    const top = (cropState.frameHeight - displayHeight) / 2 + cropState.offsetY;

    const sourceX = Math.max(0, -left / scale);
    const sourceY = Math.max(0, -top / scale);
    const sourceWidth = cropState.frameWidth / scale;
    const sourceHeight = cropState.frameHeight / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext("2d");
    context.drawImage(
      cropImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    canvas.toBlob(
      function (blob) {
        if (!blob) {
          callback(null);
          return;
        }

        callback(new File(
          [blob],
          `banner-crop-${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}.jpg`,
          { type: "image/jpeg" }
        ));
      },
      "image/jpeg",
      0.92
    );
  }

  function showFinalImagePreview(file) {
    if (!activePreviewBox || !activePreviewFrame) return;

    const previewUrl = URL.createObjectURL(file);

    activePreviewFrame.innerHTML = "";
    activePreviewFrame.classList.remove("is-crop-mode");

    const img = document.createElement("img");
    img.src = previewUrl;
    img.alt = "Hasil crop banner";
    img.onload = function () {
      URL.revokeObjectURL(previewUrl);
    };

    activePreviewFrame.appendChild(img);
    activePreviewBox.hidden = false;

    if (activePreviewNote) {
      const fileSizeMb = file.size / 1024 / 1024;
      activePreviewNote.textContent = `${file.name} · ${fileSizeMb.toFixed(2)} MB · Hasil crop 3150 x 900 px siap disimpan ke stok.`;
    }

    if (activeCropOpenButton) {
      activeCropOpenButton.hidden = false;
    }
  }

  function applyCrop() {
    if (!activeFileInput) return;

    buildCroppedFile(function (croppedFile) {
      if (!croppedFile) {
        alert("Gagal membuat hasil crop. Coba pilih gambar ulang.");
        return;
      }

      const transfer = new DataTransfer();
      transfer.items.add(croppedFile);
      activeFileInput.files = transfer.files;

      if (activeForm) {
        activeForm.dataset.cropApplied = "1";
      }

      showFinalImagePreview(croppedFile);
      closeCropModal();
    });
  }

  if (cropViewport) {
    cropViewport.addEventListener("pointerdown", function (event) {
      if (!cropReady) return;

      cropState.dragging = true;
      cropState.startX = event.clientX;
      cropState.startY = event.clientY;
      cropState.startOffsetX = cropState.offsetX;
      cropState.startOffsetY = cropState.offsetY;

      cropViewport.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    cropViewport.addEventListener("pointermove", function (event) {
      if (!cropState.dragging || !cropReady) return;

      cropState.offsetX = cropState.startOffsetX + (event.clientX - cropState.startX);
      cropState.offsetY = cropState.startOffsetY + (event.clientY - cropState.startY);

      renderCropImage();
    });

    cropViewport.addEventListener("pointerup", function (event) {
      cropState.dragging = false;

      try {
        cropViewport.releasePointerCapture(event.pointerId);
      } catch (_error) {}
    });

    cropViewport.addEventListener("pointercancel", function () {
      cropState.dragging = false;
    });
  }

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      cropState.zoom = Number(zoomInput.value || "1");
      renderCropImage();
    });
  }

  resetButtons.forEach((button) => {
    button.addEventListener("click", resetCrop);
  });

  cancelButtons.forEach((button) => {
    button.addEventListener("click", closeCropModal);
  });

  if (applyButton) {
    applyButton.addEventListener("click", applyCrop);
  }

  window.addEventListener("resize", renderCropImage);

  const forms = document.querySelectorAll("[data-banner-stock-form]");

  forms.forEach((form) => {
    const typeSelect = form.querySelector("[data-banner-media-type]");
    const fileInput = form.querySelector("[data-banner-media-file]");
    const previewBox = form.querySelector("[data-banner-upload-preview]");
    const previewFrame = form.querySelector("[data-banner-preview-frame]");
    const previewNote = form.querySelector("[data-banner-preview-note]");
    const helpText = form.querySelector("[data-banner-file-help]");
    const cropOpenButton = form.querySelector("[data-banner-crop-open]");

    if (!typeSelect || !fileInput || !previewBox || !previewFrame) return;

    function clearPreview(message) {
      previewFrame.classList.remove("is-crop-mode");
      previewFrame.innerHTML = "";

      const empty = document.createElement("span");
      empty.textContent = message || "Belum ada media dipilih.";
      previewFrame.appendChild(empty);

      if (previewNote) previewNote.textContent = "";
      if (cropOpenButton) cropOpenButton.hidden = true;

      previewBox.hidden = true;
      form.dataset.cropApplied = "0";
    }

    function updateAcceptByType() {
      const mediaType = (typeSelect.value || "image").toLowerCase();

      if (mediaType === "video") {
        fileInput.accept = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

        if (helpText) {
          helpText.textContent = "Pilih video MP4, WEBM, atau MOV. Video tidak dicrop, hanya ditampilkan di frame banner 3150 x 900 px.";
        }
      } else {
        fileInput.accept = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

        if (helpText) {
          helpText.textContent = "Pilih gambar JPG, PNG, WEBP, atau GIF. Setelah dipilih, popup crop manual akan terbuka.";
        }
      }

      fileInput.value = "";
      clearPreview("Pilih file untuk melihat preview sementara.");
    }

    function showVideoPreview(file) {
      const objectUrl = URL.createObjectURL(file);

      previewFrame.innerHTML = "";
      previewFrame.classList.remove("is-crop-mode");

      const video = document.createElement("video");
      video.src = objectUrl;
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = function () {
        URL.revokeObjectURL(objectUrl);
      };

      previewFrame.appendChild(video);
      previewBox.hidden = false;

      if (previewNote) {
        const fileSizeMb = file.size / 1024 / 1024;
        previewNote.textContent = `${file.name} · ${fileSizeMb.toFixed(2)} MB · Video tidak dicrop.`;
      }
    }

    function handleFileChange() {
      const file = fileInput.files && fileInput.files[0];

      if (!file) {
        clearPreview("Belum ada media dipilih.");
        return;
      }

      const mediaType = (typeSelect.value || "image").toLowerCase();
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (mediaType === "image" && !isImage) {
        alert("File yang dipilih bukan gambar. Pilih JPG, PNG, WEBP, atau GIF.");
        fileInput.value = "";
        clearPreview("Pilih file gambar yang valid.");
        return;
      }

      if (mediaType === "video" && !isVideo) {
        alert("File yang dipilih bukan video. Pilih MP4, WEBM, atau MOV.");
        fileInput.value = "";
        clearPreview("Pilih file video yang valid.");
        return;
      }

      form.dataset.cropApplied = "0";

      if (mediaType === "video") {
        showVideoPreview(file);
        return;
      }

      previewBox.hidden = false;
      previewFrame.innerHTML = "<span>Atur crop gambar di popup.</span>";

      if (previewNote) {
        previewNote.textContent = `${file.name} · Popup crop sedang dibuka.`;
      }

      if (cropOpenButton) {
        cropOpenButton.hidden = false;
      }

      openCropModal(file, {
        form,
        fileInput,
        previewBox,
        previewFrame,
        previewNote,
        cropOpenButton,
      });
    }

    if (cropOpenButton) {
      cropOpenButton.addEventListener("click", function () {
        const file = fileInput.files && fileInput.files[0];

        if (!file) {
          alert("Pilih gambar terlebih dahulu.");
          return;
        }

        openCropModal(file, {
          form,
          fileInput,
          previewBox,
          previewFrame,
          previewNote,
          cropOpenButton,
        });
      });
    }

    form.addEventListener("submit", function (event) {
      const mediaType = (typeSelect.value || "image").toLowerCase();

      if (mediaType !== "image") return;
      if (form.dataset.cropApplied === "1") return;

      const file = fileInput.files && fileInput.files[0];

      if (!file) return;

      event.preventDefault();

      openCropModal(file, {
        form,
        fileInput,
        previewBox,
        previewFrame,
        previewNote,
        cropOpenButton,
      });

      alert("Terapkan crop gambar terlebih dahulu sebelum menyimpan ke stok.");
    });

    typeSelect.addEventListener("change", updateAcceptByType);
    fileInput.addEventListener("change", handleFileChange);

    updateAcceptByType();
  });
})();
// BANNER STOCK UPLOAD UX END

// BANNER STOCK ACTIVE MANAGEMENT START
(function () {
  const activateForms = document.querySelectorAll("[data-banner-activate-form]");

  activateForms.forEach((form) => {
    if (form.dataset.confirmBound === "1") {
      return;
    }

    form.dataset.confirmBound = "1";

    form.addEventListener("submit", function (event) {
      const ok = window.confirm(
        "Jadikan stok banner ini sebagai banner yang tampil di website?\n\nBanner aktif sebelumnya akan diganti."
      );

      if (!ok) {
        event.preventDefault();
      }
    });
  });
})();
// BANNER STOCK ACTIVE MANAGEMENT END

