/* FFT_ADMISSION_AD_SLOT_MEDIA_ONLY_20260521
   Floating PMB ad slot.
   Data masih statis. Nanti disambungkan ke backend/admin dashboard.
*/
(function () {
  "use strict";

  var CAMPAIGN = {
    enabled: true,
    showScrollRatio: 0.32,
    reopenDelay: 20000,

    actionText: "Daftar Sekarang",
    actionUrl: "alur-pendaftaran.html",

    mediaType: "",
    mediaUrl: "",
    mediaAlt: "Informasi pendaftaran FFT UASN"
  };

  var slot = null;
  var hasTriggered = false;
  var reopenTimer = null;

  function escapeAttr(value) {
    return String(value || "").replace(/"/g, "&quot;");
  }

  function buildMedia() {
    if (!CAMPAIGN.mediaUrl) {
      return '<div class="fft-ad-media" aria-hidden="true"></div>';
    }

    if (CAMPAIGN.mediaType === "video") {
      return (
        '<div class="fft-ad-media">' +
          '<video src="' + escapeAttr(CAMPAIGN.mediaUrl) + '" muted playsinline autoplay loop></video>' +
        '</div>'
      );
    }

    return (
      '<div class="fft-ad-media">' +
        '<img src="' + escapeAttr(CAMPAIGN.mediaUrl) + '" alt="' + escapeAttr(CAMPAIGN.mediaAlt) + '">' +
      '</div>'
    );
  }

  function buildSlot() {
    slot = document.createElement("aside");
    slot.className = "fft-ad-slot";
    slot.setAttribute("aria-label", "Informasi pendaftaran mahasiswa baru");

    slot.innerHTML =
      '<div class="fft-ad-card">' +
        '<button class="fft-ad-close" type="button" aria-label="Tutup informasi pendaftaran">×</button>' +
        buildMedia() +
        '<a class="fft-ad-action" href="' + escapeAttr(CAMPAIGN.actionUrl) + '">' + CAMPAIGN.actionText + '</a>' +
      '</div>';

    document.body.appendChild(slot);

    slot.querySelector(".fft-ad-close").addEventListener("click", function () {
      hideSlot();
      scheduleReopen();
    });
  }

  function showSlot() {
    if (!slot || !CAMPAIGN.enabled) return;
    slot.classList.add("is-visible");
  }

  function hideSlot() {
    if (!slot) return;
    slot.classList.remove("is-visible");
  }

  function scheduleReopen() {
    if (reopenTimer) {
      clearTimeout(reopenTimer);
    }

    reopenTimer = setTimeout(function () {
      if (hasTriggered) {
        showSlot();
      }
    }, CAMPAIGN.reopenDelay);
  }

  function getScrollRatio() {
    var doc = document.documentElement;
    var maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    return window.scrollY / maxScroll;
  }

  function handleScroll() {
    if (getScrollRatio() >= CAMPAIGN.showScrollRatio) {
      hasTriggered = true;
      showSlot();
      window.removeEventListener("scroll", handleScroll);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!CAMPAIGN.enabled) return;

    buildSlot();
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  });
}());
