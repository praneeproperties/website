/* Pranee Properties — tiny vanilla JS for menu + footer year + reveal + bg fade + lightbox */

document.documentElement.classList.add("js");


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

  // Header/logo ready (fade-in logo once the image is available)
  (() => {
    const logo = document.querySelector(".brand-wordmark");
    if (!header || !logo) return;

    const ready = () => header.classList.add("is-ready");

    if (logo.complete) ready();
    else {
      logo.addEventListener("load", ready, { once: true });
      logo.addEventListener("error", ready, { once: true }); // fail-safe
    }
  })();


  
  // Multi background steps (fade between 1..6)
  const bgSteps = Array.from(document.querySelectorAll("[data-bg-step]"));
  const bodyEl = document.body;
  
  const setBgStep = (step) => {
    const v = String(step || 1);
    if (bodyEl.getAttribute("data-bg") !== v) bodyEl.setAttribute("data-bg", v);
  };
  
  if (bgSteps.length) {
    // ↓ Smaller number = BG stays longer before switching (try 0.20 or 0.15)
    const ACTIVATE_AT = 0.22; // 22% down from top of viewport
  
    const pickBg = () => {
      if (window.scrollY <= 10) {
        setBgStep(1);
        return;
      }
    
      const line = window.innerHeight * ACTIVATE_AT;
    
      // pick the last bg-step whose top has passed the activation line
      let active = bgSteps[0];
      for (const el of bgSteps) {
        const top = el.getBoundingClientRect().top;
        if (top <= line) active = el;
        else break; // DOM order means we can stop early
      }
    
      setBgStep(active.getAttribute("data-bg-step"));
    };

  
    pickBg();
    window.addEventListener("scroll", pickBg, { passive: true });
    window.addEventListener("resize", pickBg);
  }


  // Active nav on scroll (simple)
  const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
  const sectionsForNav = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = () => {
    const mid = window.innerHeight * 0.35;
    let best = null;
    let bestDist = Infinity;

    for (const sec of sectionsForNav) {
      const r = sec.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
      const d = Math.abs(r.top - mid);
      if (d < bestDist) {
        bestDist = d;
        best = sec;
      }
    }

    if (!best) return;
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + best.id)
    );
  };

  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
  window.addEventListener("resize", setActive);

  // Scroll reveal init
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    const show = (el) => {
      const delay = el.getAttribute("data-reveal-delay");
      if (delay) el.style.transitionDelay = `${Number(delay)}ms`;
      el.classList.add("is-visible");
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach(show);
    }
  }

  window.Pranee = {
    handleContactSubmit: function (event) {
      event.preventDefault();
  
      const form = event.target;
  
      // Pull values (matches your input names)
      const name = form.elements["name"]?.value?.trim() || "";
      const phone = form.elements["phone"]?.value?.trim() || "";
      const email = form.elements["email"]?.value?.trim() || "";
      const message = form.elements["message"]?.value?.trim() || "";
  
      // Google Form endpoint (must be /formResponse)
      const FORM_ACTION =
        "https://docs.google.com/forms/d/e/1FAIpQLSdRlD6k2iVor1DDAIee_JNKrTyuj5--W1FsFlk8-QYyY-1TUg/formResponse";
  
      // Field entry IDs (from your prefill link)
      const ENTRY_NAME = "entry.422306849";
      const ENTRY_PHONE = "entry.1702742260";
      const ENTRY_EMAIL = "entry.1970676414";
      const ENTRY_MESSAGE = "entry.1825557477";
  
      const note = document.querySelector("[data-form-note]");
      const btn = form.querySelector('button[type="submit"]');
  
      if (btn) btn.disabled = true;
      if (note) note.textContent = "Sending…";
  
      const data = new FormData();
      data.append(ENTRY_NAME, name);
      data.append(ENTRY_PHONE, phone);
      data.append(ENTRY_EMAIL, email);
      data.append(ENTRY_MESSAGE, message);
  
      fetch(FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: data,
      })
        .then(() => {
          if (note) note.textContent = "Thanks — message sent.";
          form.reset();
        })
        .catch(() => {
          // no-cors usually won’t throw, but just in case
          if (note) note.textContent = "Couldn’t send. Please try again.";
        })
        .finally(() => {
          if (btn) btn.disabled = false;
        });
  
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
  const btnClose = lb.querySelector(".lightbox-close");

    // Mobile tap zones (left/right edges) — keep swipe enabled
    const dialog = lb.querySelector(".lightbox-dialog");
    let tapPrev = lb.querySelector("[data-lb-tap-prev]");
    let tapNext = lb.querySelector("[data-lb-tap-next]");
  
    if (dialog && !tapPrev && !tapNext) {
      tapPrev = document.createElement("button");
      tapPrev.type = "button";
      tapPrev.className = "lb-tap-zone prev";
      tapPrev.setAttribute("aria-label", "Previous image");
      tapPrev.setAttribute("data-lb-tap-prev", "");
  
      tapNext = document.createElement("button");
      tapNext.type = "button";
      tapNext.className = "lb-tap-zone next";
      tapNext.setAttribute("aria-label", "Next image");
      tapNext.setAttribute("data-lb-tap-next", "");
  
      // Add them inside the dialog so they don't affect backdrop-close
      dialog.appendChild(tapPrev);
      dialog.appendChild(tapNext);
    }
  
    if (tapPrev) {
      tapPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        prev();
      });
    }
  
    if (tapNext) {
      tapNext.addEventListener("click", (e) => {
        e.stopPropagation();
        next();
      });
    }


  let current = { urls: [], alts: [], index: 0 };
  let closeTimer = null;
  let lastFocus = null;

  // Swipe state
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  const SWIPE_DIST = 40; // px
  const SWIPE_OFFAXIS = 60; // px allowed vertical drift

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

  const open = (urls, alts, startIndex = 0) => {
    current.urls = urls;
    current.alts = alts;
    current.index = startIndex;

    // cancel any pending close animation
    lb.classList.remove("is-closing");
    lb.classList.remove("is-open");
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    lastFocus = document.activeElement;

    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");

    render();

    // Trigger CSS transition reliably (hidden -> visible -> is-open next frame)
    requestAnimationFrame(() => {
      lb.classList.add("is-open");
      if (btnClose) btnClose.focus();
    });
  };

  const close = () => {
    if (lb.hidden) return;

    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");

    lb.classList.remove("is-open");
    lb.classList.add("is-closing");

    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      lb.hidden = true;
      lb.classList.remove("is-closing");
      closeTimer = null;

      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      lastFocus = null;
    }, 220);
  };

  // Open on thumb click (supports multiple galleries on page)
  document.addEventListener("click", (e) => {
    const thumb = e.target.closest(".thumb");
    if (!thumb) return;

    const gallery = thumb.closest("[data-gallery]");
    if (!gallery) return;

    const thumbs = Array.from(gallery.querySelectorAll(".thumb"));
    const urls = thumbs.map((t) => t.getAttribute("data-full")).filter(Boolean);
    const alts = thumbs.map((t) => t.querySelector("img")?.alt || "Listing photo");
    const startIndex = thumbs.indexOf(thumb);

    if (urls.length) open(urls, alts, Math.max(0, startIndex));
  });

  // Close handlers (backdrop + X)
  lb.addEventListener("click", (e) => {
    if (e.target.matches("[data-lb-close]")) close();
  });

  // Nav buttons (safe)
  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prev();
    });
  }
  
  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      next();
    });
  }

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Mobile swipe (left/right)
  lb.addEventListener(
    "touchstart",
    (e) => {
      if (lb.hidden) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchActive = true;
    },
    { passive: true }
  );

  lb.addEventListener(
    "touchmove",
    (e) => {
      if (!touchActive || lb.hidden) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      // If clearly horizontal, stop scrolling
      if (Math.abs(dx) > 12 && Math.abs(dy) < 18) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  lb.addEventListener(
    "touchend",
    (e) => {
      if (!touchActive || lb.hidden) return;
      touchActive = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      if (Math.abs(dy) > SWIPE_OFFAXIS) return;

      if (dx <= -SWIPE_DIST) next();
      if (dx >= SWIPE_DIST) prev();
    },
    { passive: true }
  );
})();
