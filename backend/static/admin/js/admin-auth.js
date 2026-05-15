(function () {
  "use strict";

  function hideLoader() {
    var loader = document.querySelector("[data-auth-loader]");
    if (!loader) return;

    window.setTimeout(function () {
      loader.classList.add("is-hidden");

      window.setTimeout(function () {
        loader.style.display = "none";
      }, 420);
    }, 520);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideLoader);
  } else {
    hideLoader();
  }

  window.setTimeout(hideLoader, 1600);
})();
