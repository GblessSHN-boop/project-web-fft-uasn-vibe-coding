document.addEventListener("DOMContentLoaded", function () {
  const sectionIds = ["quick-facts", "prestasi", "top-leader", "lulusan"];
  const sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function getTargetSectionId() {
    const rawHash = String(window.location.hash || "").replace("#", "").trim();
    return sectionIds.includes(rawHash) ? rawHash : "quick-facts";
  }

  function setActiveSection(sectionId) {
    sections.forEach(function (section) {
      const active = section.id === sectionId;
      section.classList.toggle("qf-active-section", active);
      section.setAttribute("aria-hidden", active ? "false" : "true");
    });

    document.body.setAttribute("data-qf-active", sectionId);
  }

  function routeQuickFacts() {
    setActiveSection(getTargetSectionId());
  }

  window.addEventListener("hashchange", routeQuickFacts);
  routeQuickFacts();

  window.addEventListener("fft-language-change", function () {
    routeQuickFacts();
  });
});
