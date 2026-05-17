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
  const forms = document.querySelectorAll("[data-banner-stock-form]");

  forms.forEach((form) => {
    const typeSelect = form.querySelector("[data-banner-media-type]");
    const fileInput = form.querySelector("[data-banner-media-file]");
    const previewBox = form.querySelector("[data-banner-upload-preview]");
    const previewFrame = form.querySelector("[data-banner-preview-frame]");
    const previewNote = form.querySelector("[data-banner-preview-note]");
    const helpText = form.querySelector("[data-banner-file-help]");

    if (!typeSelect || !fileInput || !previewBox || !previewFrame) {
      return;
    }

    let objectUrl = "";

    function revokeObjectUrl() {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = "";
      }
    }

    function clearPreview(message) {
      revokeObjectUrl();

      previewFrame.innerHTML = "";
      const empty = document.createElement("span");
      empty.textContent = message || "Belum ada media dipilih.";
      previewFrame.appendChild(empty);

      if (previewNote) {
        previewNote.textContent = "";
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
          helpText.textContent = "Pilih gambar JPG, PNG, WEBP, atau GIF. Preview mengikuti frame banner 3150 x 900 px. Crop gambar akan ditambahkan pada tahap berikutnya.";
        }
      }

      fileInput.value = "";
      clearPreview("Pilih file untuk melihat preview sementara.");
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

      revokeObjectUrl();
      objectUrl = URL.createObjectURL(file);

      previewFrame.innerHTML = "";

      let mediaElement;

      if (mediaType === "video") {
        mediaElement = document.createElement("video");
        mediaElement.src = objectUrl;
        mediaElement.controls = true;
        mediaElement.muted = true;
        mediaElement.playsInline = true;
      } else {
        mediaElement = document.createElement("img");
        mediaElement.src = objectUrl;
        mediaElement.alt = "Preview stok banner";
      }

      previewFrame.appendChild(mediaElement);
      previewBox.hidden = false;

      if (previewNote) {
        const fileSizeMb = file.size / 1024 / 1024;
        previewNote.textContent = `${file.name} · ${fileSizeMb.toFixed(2)} MB · Preview ini memakai rasio 3150 x 900 px dan belum tersimpan ke stok.`;
      }
    }

    typeSelect.addEventListener("change", updateAcceptByType);
    fileInput.addEventListener("change", showPreview);

    updateAcceptByType();
  });
})();
// BANNER STOCK UPLOAD UX END

