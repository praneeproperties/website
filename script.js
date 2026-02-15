/* Pranee Properties — tiny vanilla JS for menu + footer year + reveal + bg fade */

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


  let closeTimer = null;

  const close = () => {
    if (!lb || lb.hidden) return;
  
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
    lb.classList.add("is-closing");
  
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      lb.hidden = true;
      lb.classList.remove("is-closing");
      closeTimer = null;
    }, 220);
  };



  
  // Multi background steps (fade between 1..6)
  const bgSteps = Array.from(document.querySelectorAll("[data-bg-step]"));
  const bodyEl = document.body;

  const setBgStep = (step) => {
    if (!bodyEl) return;
    const v = String(step || 1);
    if (bodyEl.getAttribute("data-bg") !== v) bodyEl.setAttribute("data-bg", v);
  };

  if (bgSteps.length) {
    const pickClosest = () => {
      // Lock top to step 1 (prevents jumping to listing 1 on tall screens)
      if (window.scrollY <= 10) {
        setBgStep(1);
        return;
      }

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

  // Active nav on scroll (simple)
  const navLinks = Array.from(document.querySelectorAll('#site-nav a'));
  const sectionsForNav = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = () => {
    const mid = window.innerHeight * 0.35;
    let best = null;
    let bestDist = Infinity;

    for (const sec of sectionsForNav) {
      const r = sec.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
      const d = Math.abs(r.top - mid);
      if (d < bestDist) { bestDist = d; best = sec; }
    }

    if (!best) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + best.id));
  };

  setActive();
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);

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
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach(show);
    }
  }

  // Demo-only form handler
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


// ===== Lightbox Gallery (thumbnails) =====
(() => {
  const lb = document.querySelector("[data-lightbox]");
  if (!lb) return;

  const imgEl = lb.querySelector("[data-lb-img]");
  const capEl = lb.querySelector("[data-lb-caption]");
  const btnPrev = lb.querySelector("[data-lb-prev]");
  const btnNext = lb.querySelector("[data-lb-next]");

  let current = { urls: [], alts: [], index: 0 };
  let closeTimer = null;

  const open = (urls, alts, startIndex = 0) => {
    current.urls = urls;
    current.alts = alts;
    current.index = startIndex;

    // if a close is mid-animation, cancel it
    lb.classList.remove("is-closing");
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");

    render();
  };

  const close = () => {
    if (!lb || lb.hidden) return;

    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");

    // trigger closing animation
    lb.classList.add("is-closing");

    // prevent stacked timers if user clicks close repeatedly
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      lb.hidden = true;
      lb.classList.remove("is-closing");
      closeTimer = null;
    }, 220);
  };

  const render = () => {
    const url = current.urls[current.index];
    const alt = current.alts[current.index] || "Listing photo";
    imgEl.src = url;
    imgEl.alt = alt;

    const total = current.urls.length;
    capEl.textContent = total > 1 ? `${current.index + 1} / ${total}` : "";

    btnPrev.style.display = total > 1 ? "" : "none";
    btnNext.style.display = total > 1 ? "" : "none";
  };

  const prev = () => {
    if (current.urls.length < 2) return;
    current.index = (current.index - 1 + current.urls.length) % current.urls.length;
    render();
  };

  const next = () => {
    if (current.urls.length < 2) return;
    current.index = (current.index + 1) % current.urls.length;
    render();
  };

  // Open on thumb click (supports multiple galleries on page)
  document.addEventListener("click", (e) => {
    const thumb = e.target.closest(".thumb");
    if (!thumb) return;

    const gallery = thumb.closest("[data-gallery]");
    if (!gallery) return;

    const thumbs = Array.from(gallery.querySelectorAll(".thumb"));
    const urls = thumbs.map(t => t.getAttribute("data-full")).filter(Boolean);
    const alts = thumbs.map(t => t.querySelector("img")?.alt || "Listing photo");

    const startIndex = thumbs.indexOf(thumb);
    if (urls.length) open(urls, alts, Math.max(0, startIndex));
  });

  // Close handlers
  lb.addEventListener("click", (e) => {
    if (e.target.matches("[data-lb-close]")) close();
  });

  // Nav
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });
})();

