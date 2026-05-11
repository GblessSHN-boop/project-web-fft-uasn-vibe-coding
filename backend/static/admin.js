document.addEventListener("DOMContentLoaded", () => {
  setupToastFlash();
  setupDekanPreview();
  setupDosenImagePreview();
  setupDosenCropWorkflow();
});

/* =========================
   TOAST / FLASH
========================= */
function setupToastFlash() {
  const toast = document.getElementById("adminToast");
  const flashItems = document.querySelectorAll(".flash-item");

  if (!toast || !flashItems.length) return;

  const firstFlash = flashItems[0];
  const message = firstFlash.textContent.trim();

  if (!message) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================
   PREVIEW DEKAN
========================= */
function setupDekanPreview() {
  const namaInput = document.getElementById("nama");
  const statusInput = document.getElementById("status");
  const tempatInput = document.getElementById("tempat_lahir");
  const tanggalInput = document.getElementById("tanggal_lahir");

  const prevNama = document.getElementById("preview-dekan-nama");
  const prevJabatan = document.getElementById("preview-dekan-jabatan");
  const prevStatus = document.getElementById("preview-dekan-status");
  const prevTempat = document.getElementById("preview-dekan-tempat");
  const prevTanggal = document.getElementById("preview-dekan-tanggal");

  if (!prevNama || !prevJabatan || !prevStatus || !prevTempat || !prevTanggal) {
    return;
  }

  const sync = () => {
    if (namaInput) prevNama.textContent = namaInput.value.trim() || "-";
    prevJabatan.textContent = "Dekan Fakultas Filsafat Teologi";
    if (statusInput) prevStatus.textContent = statusInput.value.trim() || "-";
    if (tempatInput) prevTempat.textContent = tempatInput.value.trim() || "-";
    if (tanggalInput)
      prevTanggal.textContent = tanggalInput.value.trim() || "-";
  };

  [namaInput, statusInput, tempatInput, tanggalInput].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", sync);
    el.addEventListener("change", sync);
  });

  sync();
}

/* =========================
   PREVIEW FOTO DOSEN
========================= */
function setupDosenImagePreview() {
  const mainInput = document.getElementById("fotoInput");
  const mainPreview = document.getElementById("mainImagePreview");

  if (mainInput && mainPreview) {
    mainInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        mainPreview.src = e.target.result;
        mainPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
}

/* =========================
   CROP WORKFLOW DOSEN
========================= */
function setupDosenCropWorkflow() {
  const imageInput = document.getElementById("fotoInput");
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  const cropConfirmBtn = document.getElementById("cropConfirmBtn");
  const cropCancelBtn = document.getElementById("cropCancelBtn");

  const hiddenMainInput = document.getElementById("foto_main_cropped");
  const hiddenThumbInput = document.getElementById("foto_thumb_cropped");

  const previewMain = document.getElementById("mainImagePreview");
  const previewThumb = document.getElementById("thumbImagePreview");
  const thumbPlaceholder = document.getElementById("thumbPlaceholder");

  if (
    !imageInput ||
    !cropModal ||
    !cropImage ||
    !cropConfirmBtn ||
    !cropCancelBtn ||
    !hiddenMainInput ||
    !hiddenThumbInput
  ) {
    return;
  }

  let cropper = null;
  let originalFile = null;
  let cropStage = "main";
  let objectUrl = null;

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    originalFile = file;
    cropStage = "main";

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);

    cropImage.src = objectUrl;
    cropModal.style.display = "flex";

    cropImage.onload = () => {
      if (cropper) cropper.destroy();

      cropper = new Cropper(cropImage, {
        aspectRatio: 3 / 4,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 1,
        responsive: true,
        background: false,
      });

      updateCropTitle();
    };
  });

  cropConfirmBtn.addEventListener("click", async () => {
    if (!cropper || !originalFile) return;

    const canvas =
      cropStage === "main"
        ? cropper.getCroppedCanvas({
            width: 900,
            height: 1200,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
          })
        : cropper.getCroppedCanvas({
            width: 460,
            height: 300,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
          });

    if (!canvas) return;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;

    const fileName =
      cropStage === "main" ? "foto_main_cropped.png" : "foto_thumb_cropped.png";

    const croppedFile = new File([blob], fileName, { type: "image/png" });

    if (cropStage === "main") {
      assignFileToInput(hiddenMainInput, croppedFile);

      if (previewMain) {
        const mainUrl = URL.createObjectURL(blob);
        previewMain.src = mainUrl;
        previewMain.style.display = "block";
      }

      cropStage = "thumb";
      cropper.destroy();

      cropImage.onload = () => {
        if (cropper) cropper.destroy();

        cropper = new Cropper(cropImage, {
          aspectRatio: 460 / 300,
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 1,
          responsive: true,
          background: false,
        });

        updateCropTitle();
      };

      cropImage.src = objectUrl;
      return;
    }

    assignFileToInput(hiddenThumbInput, croppedFile);

    if (previewThumb) {
      const thumbUrl = URL.createObjectURL(blob);
      previewThumb.src = thumbUrl;
      previewThumb.style.display = "block";
    }

    if (thumbPlaceholder) {
      thumbPlaceholder.style.display = "none";
    }

    closeCropModal();
  });

  cropCancelBtn.addEventListener("click", () => {
    closeCropModal();
  });

  function closeCropModal() {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    cropModal.style.display = "none";
    cropStage = "main";

    if (imageInput) {
      imageInput.value = "";
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function updateCropTitle() {
    const title = cropModal.querySelector(".crop-title");
    const desc = cropModal.querySelector(".crop-desc");

    if (!title || !desc) return;

    if (cropStage === "main") {
      title.textContent = "CROP FOTO UTAMA";
      desc.textContent = "Sesuaikan foto utama biodata dengan rasio 3 x 4.";
    } else {
      title.textContent = "CROP THUMBNAIL FRONTEND";
      desc.textContent =
        "Sesuaikan thumbnail kartu frontend dengan rasio 460 x 300.";
    }
  }

  function assignFileToInput(input, file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }
}
