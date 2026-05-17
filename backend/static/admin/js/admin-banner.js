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

  const forms = document.querySelectorAll("[data-banner-stock-form]");

  forms.forEach((form) => {
    const typeSelect = form.querySelector("[data-banner-media-type]");
    const fileInput = form.querySelector("[data-banner-media-file]");
    const previewBox = form.querySelector("[data-banner-upload-preview]");
    const previewFrame = form.querySelector("[data-banner-preview-frame]");
    const previewNote = form.querySelector("[data-banner-preview-note]");
    const helpText = form.querySelector("[data-banner-file-help]");

    const cropTools = form.querySelector("[data-banner-crop-tools]");
    const cropEnabled = form.querySelector("[data-banner-crop-enabled]");
    const zoomInput = form.querySelector("[data-banner-crop-zoom]");
    const resetButton = form.querySelector("[data-banner-crop-reset]");

    if (!typeSelect || !fileInput || !previewBox || !previewFrame) {
      return;
    }

    let objectUrl = "";
    let currentImage = null;

    let cropState = {
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

    function revokeObjectUrl() {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = "";
      }
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function resetCropState() {
      cropState.zoom = 1;
      cropState.offsetX = 0;
      cropState.offsetY = 0;

      if (zoomInput) {
        zoomInput.value = "1";
      }

      renderCropImage();
    }

    function getFrameSize() {
      const rect = previewFrame.getBoundingClientRect();

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
      if (!currentImage) {
        return;
      }

      getFrameSize();

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

      currentImage.style.width = `${displayWidth}px`;
      currentImage.style.height = `${displayHeight}px`;
      currentImage.style.left = `${left}px`;
      currentImage.style.top = `${top}px`;
    }

    function clearPreview(message) {
      revokeObjectUrl();

      currentImage = null;
      previewFrame.classList.remove("is-crop-mode");
      previewFrame.innerHTML = "";

      const empty = document.createElement("span");
      empty.textContent = message || "Belum ada media dipilih.";
      previewFrame.appendChild(empty);

      if (previewNote) {
        previewNote.textContent = "";
      }

      if (cropTools) {
        cropTools.hidden = true;
      }

      previewBox.hidden = true;
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
          helpText.textContent = "Pilih gambar JPG, PNG, WEBP, atau GIF. Setelah dipilih, atur crop manual 3150 x 900 px.";
        }
      }

      fileInput.value = "";
      clearPreview("Pilih file untuk melihat preview sementara.");
    }

    function showImagePreview(file) {
      revokeObjectUrl();
      objectUrl = URL.createObjectURL(file);

      previewFrame.innerHTML = "";
      previewFrame.classList.add("is-crop-mode");

      const image = document.createElement("img");
      image.src = objectUrl;
      image.alt = "Crop stok banner";

      image.addEventListener("load", function () {
        currentImage = image;
        cropState.naturalWidth = image.naturalWidth || 1;
        cropState.naturalHeight = image.naturalHeight || 1;

        resetCropState();
      });

      previewFrame.appendChild(image);
      previewBox.hidden = false;

      if (cropTools) {
        cropTools.hidden = false;
      }

      if (previewNote) {
        const fileSizeMb = file.size / 1024 / 1024;
        previewNote.textContent = `${file.name} · ${fileSizeMb.toFixed(2)} MB · Gambar akan dicrop ke 3150 x 900 px saat disimpan.`;
      }
    }

    function showVideoPreview(file) {
      revokeObjectUrl();
      objectUrl = URL.createObjectURL(file);

      currentImage = null;
      previewFrame.classList.remove("is-crop-mode");
      previewFrame.innerHTML = "";

      const video = document.createElement("video");
      video.src = objectUrl;
      video.controls = true;
      video.muted = true;
      video.playsInline = true;

      previewFrame.appendChild(video);
      previewBox.hidden = false;

      if (cropTools) {
        cropTools.hidden = true;
      }

      if (previewNote) {
        const fileSizeMb = file.size / 1024 / 1024;
        previewNote.textContent = `${file.name} · ${fileSizeMb.toFixed(2)} MB · Video tidak dicrop.`;
      }
    }

    function showPreview() {
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

      if (mediaType === "video") {
        showVideoPreview(file);
      } else {
        showImagePreview(file);
      }
    }

    function buildCroppedImageFile(callback) {
      if (!currentImage) {
        callback(null);
        return;
      }

      getFrameSize();
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
        currentImage,
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

          const file = new File(
            [blob],
            `banner-crop-${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}.jpg`,
            { type: "image/jpeg" }
          );

          callback(file);
        },
        "image/jpeg",
        0.92
      );
    }

    typeSelect.addEventListener("change", updateAcceptByType);
    fileInput.addEventListener("change", showPreview);

    if (zoomInput) {
      zoomInput.addEventListener("input", function () {
        cropState.zoom = Number(zoomInput.value || "1");
        renderCropImage();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", resetCropState);
    }

    previewFrame.addEventListener("pointerdown", function (event) {
      if (!currentImage || !cropEnabled || !cropEnabled.checked) {
        return;
      }

      cropState.dragging = true;
      cropState.startX = event.clientX;
      cropState.startY = event.clientY;
      cropState.startOffsetX = cropState.offsetX;
      cropState.startOffsetY = cropState.offsetY;

      previewFrame.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    previewFrame.addEventListener("pointermove", function (event) {
      if (!cropState.dragging || !currentImage) {
        return;
      }

      cropState.offsetX = cropState.startOffsetX + (event.clientX - cropState.startX);
      cropState.offsetY = cropState.startOffsetY + (event.clientY - cropState.startY);

      renderCropImage();
    });

    previewFrame.addEventListener("pointerup", function (event) {
      cropState.dragging = false;

      try {
        previewFrame.releasePointerCapture(event.pointerId);
      } catch (_error) {}
    });

    previewFrame.addEventListener("pointercancel", function () {
      cropState.dragging = false;
    });

    window.addEventListener("resize", function () {
      if (currentImage) {
        renderCropImage();
      }
    });

    form.addEventListener("submit", function (event) {
      const mediaType = (typeSelect.value || "image").toLowerCase();

      if (form.dataset.cropProcessed === "1") {
        return;
      }

      if (mediaType !== "image") {
        return;
      }

      if (!cropEnabled || !cropEnabled.checked || !currentImage) {
        return;
      }

      event.preventDefault();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      buildCroppedImageFile(function (croppedFile) {
        if (!croppedFile) {
          alert("Gagal membuat hasil crop. Coba pilih gambar ulang.");
          return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(croppedFile);
        fileInput.files = transfer.files;

        form.dataset.cropProcessed = "1";
        form.submit();
      });
    });

    updateAcceptByType();
  });
})();
// BANNER STOCK UPLOAD UX END

