(function () {
  "use strict";

  const SELECTORS = {
    loader: "[data-admin-loader]",
    loaderLogo: "[data-admin-loader-logo]",
    navLink: "[data-admin-nav-link]",
    confirmAction: "[data-admin-confirm]",
    searchInput: "[data-admin-search]",
    searchableRow: "[data-admin-search-row]"
  };

  function hideLoader() {
    const loader = document.querySelector(SELECTORS.loader);

    if (!loader) {
      return;
    }

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 650);
  }

  function animateLoaderLogo() {
    const logo = document.querySelector(SELECTORS.loaderLogo);

    if (!logo) {
      return;
    }

    logo.animate(
      [
        { transform: "scale(0.9) rotate(-6deg)", opacity: 0 },
        { transform: "scale(1.06) rotate(3deg)", opacity: 1 },
        { transform: "scale(1) rotate(0deg)", opacity: 1 }
      ],
      {
        duration: 900,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards"
      }
    );
  }

  function setActiveNavByPath() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(SELECTORS.navLink);

    links.forEach(function (link) {
      const href = link.getAttribute("href");

      if (!href) {
        return;
      }

      if (currentPath === href || currentPath.startsWith(href + "/")) {
        link.classList.add("is-active");
      }
    });
  }

  function bindConfirmActions() {
    const buttons = document.querySelectorAll(SELECTORS.confirmAction);

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        const message = button.getAttribute("data-admin-confirm") || "Lanjutkan tindakan ini?";

        if (!window.confirm(message)) {
          event.preventDefault();
        }
      });
    });
  }

  function bindTableSearch() {
    const input = document.querySelector(SELECTORS.searchInput);
    const rows = document.querySelectorAll(SELECTORS.searchableRow);

    if (!input || !rows.length) {
      return;
    }

    input.addEventListener("input", function () {
      const keyword = input.value.trim().toLowerCase();

      rows.forEach(function (row) {
        const text = row.textContent.toLowerCase();
        row.hidden = keyword.length > 0 && !text.includes(keyword);
      });
    });
  }

  function initAdminDashboard() {
    animateLoaderLogo();
    setActiveNavByPath();
    bindConfirmActions();
    bindTableSearch();
    hideLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminDashboard);
  } else {
    initAdminDashboard();
  }
})();
