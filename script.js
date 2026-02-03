/* Pranee Properties — tiny vanilla JS for menu + footer year + demo form */

(function () {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const yearEl = document.querySelector("[data-year]");
  const formNote = document.querySelector("[data-form-note]");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setExpanded(expanded) {
    if (!navToggle || !header) return;
    navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    header.classList.toggle("nav-open", expanded);
  }

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      setExpanded(!expanded);
    });

    // Close on link click (mobile)
    header.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.tagName === "A" && header.classList.contains("nav-open")) {
        setExpanded(false);
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        setExpanded(false);
      }
    });
  }

  // Demo-only form handler (no backend on GitHub Pages)
  window.Pranee = {
    handleContactSubmit: function (event) {
      event.preventDefault();
      if (formNote) {
        formNote.textContent =
          "Thanks — this demo form doesn’t send yet. Hook it up to a form service when you're ready.";
      }
      return false;
    },
  };
})();
