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
