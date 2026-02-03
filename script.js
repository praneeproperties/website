document.documentElement.classList.add("js");
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




  // Multi background steps (fade between 1..5)
  const bgSteps = Array.from(document.querySelectorAll("[data-bg-step]"));
  const bodyEl = document.body;

  const setBgStep = (step) => {
    if (!bodyEl) return;
    const v = String(step || 1);
    if (bodyEl.getAttribute("data-bg") !== v) bodyEl.setAttribute("data-bg", v);
  };

  if (bgSteps.length) {
    // Pick the section closest to the middle of the screen
    const pickClosest = () => {
      const mid = window.innerHeight * 0.45;
      let best = null;
      let bestDist = Infinity;

      for (const el of bgSteps) {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - mid);
        if (rect.bottom > 0 && rect.top < window.innerHeight && dist < bestDist) {
          bestDist = dist;
          best = el;
        }
      }
      if (best) setBgStep(best.getAttribute("data-bg-step"));
    };

    pickClosest();
    window.addEventListener("scroll", pickClosest, { passive: true });
    window.addEventListener("resize", pickClosest);
  }


  // Scroll reveal init
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    const show = (el) => {
      const delay = el.getAttribute("data-reveal-delay");
      if (delay) el.style.transitionDelay = `${Number(delay)}ms`;
      el.classList.add("is-visible");
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            obs.unobserve(entry.target); // reveal once
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

      revealEls.forEach((el) => io.observe(el));
    } else {
      // Fallback: reveal everything immediately
      revealEls.forEach(show);
    }
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
