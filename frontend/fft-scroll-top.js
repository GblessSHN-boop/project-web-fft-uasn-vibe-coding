(function () {
  "use strict";

  const SHOW_AFTER = 220;
  let ticking = false;

  function createButton() {
    let button = document.getElementById("fftScrollTop");

    if (button) {
      return button;
    }

    button = document.createElement("button");
    button.id = "fftScrollTop";
    button.className = "fft-scroll-top";
    button.type = "button";
    button.setAttribute("aria-label", "Kembali ke atas");
    button.setAttribute("title", "Kembali ke atas");

    button.innerHTML = `
      <span class="fft-scroll-top__ring" aria-hidden="true"></span>
      <svg class="fft-scroll-top__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 14l6-6 6 6"></path>
      </svg>
    `;

    button.addEventListener("click", function () {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });

    document.body.appendChild(button);
    return button;
  }

  function getScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);

    return Math.min(100, Math.max(0, Math.round((scrollTop / max) * 100)));
  }

  function updateButton() {
    const button = createButton();
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    button.classList.toggle("is-visible", scrollTop > SHOW_AFTER);
    button.style.setProperty("--fft-scroll-progress", getScrollProgress());

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateButton);
  }

  function init() {
    createButton();
    updateButton();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
