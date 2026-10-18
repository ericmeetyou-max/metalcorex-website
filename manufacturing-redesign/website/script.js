let year = document.querySelector("#year");
const form = document.querySelector("#rfqForm");
const revealItems = document.querySelectorAll(".reveal");
const holoCards = document.querySelectorAll(".holo-card");
const hero = document.querySelector(".hero");
const heroPanel = document.querySelector(".hero-panel");
const heroCore = document.querySelector(".metal-core");
const resourcesNav = document.querySelector(".resources-nav");
const resourcesToggle = document.querySelector(".resources-toggle");
const resourcesMenu = document.querySelector(".resources-menu");
const siteHeader = document.querySelector(".site-header, .mc-header");
const siteFooter = document.querySelector(".site-footer");
const mainNav = document.querySelector(".site-header .nav");
const localRfqKey = "metalcorex-local-rfqs";

const applyManagedWebsiteImages = async () => {
  const managedImages = [...document.querySelectorAll("img[data-media-slot]")];
  if (!managedImages.length) return;

  try {
    const response = await fetch("/api/site-media", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const itemMap = new Map((data.items || []).map((item) => [item.key, item]));

    managedImages.forEach((image) => {
      const item = itemMap.get(image.dataset.mediaSlot);
      if (!item) return;

      if (item.alt) image.alt = item.alt;
      if (!item.isCustom) return;

      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      image.closest("picture")?.querySelectorAll("source").forEach((source) => {
        source.removeAttribute("srcset");
        source.removeAttribute("sizes");
      });
      image.src = item.url;
    });
  } catch {
    // Static image URLs remain the reliable fallback if the media API is unavailable.
  }
};

applyManagedWebsiteImages();

const prefillRfqFromUrl = () => {
  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const part = params.get("part");
  const process = params.get("process");
  const message = params.get("message");
  const material = params.get("material");
  const materialInput = form.elements.namedItem("material");
  const partInput = form.elements.namedItem("part_name");
  const processInput = form.elements.namedItem("manufacturing_process") || form.elements.namedItem("process");
  const messageInput = form.elements.namedItem("message") || form.elements.namedItem("details");

  if (material && materialInput && !materialInput.value) {
    materialInput.value = material;
  }

  if (part && partInput && !partInput.value) {
    partInput.value = part;
  }

  if (process && processInput instanceof HTMLSelectElement) {
    const option = [...processInput.options].find((item) =>
      item.value.toLowerCase() === process.toLowerCase() || item.text.toLowerCase() === process.toLowerCase()
    );

    if (option) {
      processInput.value = option.value;
    }
  }

  if (message && messageInput && !messageInput.value) {
    messageInput.value = message;
  }
};

prefillRfqFromUrl();

if (
  siteFooter &&
  !document.body.classList.contains("admin-page") &&
  !siteFooter.querySelector(".supplier-footer-main")
) {
  siteFooter.innerHTML = `
    <div class="supplier-footer-main">
      <div class="supplier-footer-company">
        <a class="supplier-footer-brand" href="/" aria-label="Metalcorex home">
          <img src="/assets/brand/metalcorex-light.svg" alt="Metalcorex" width="240" height="46">
        </a>
        <p>Drawing-based custom manufacturing for metal and plastic parts, from prototypes to production, finishing and assembly.</p>
        <address>
          <strong>Xiamen Metalcorex Precision Technology Co., Ltd</strong>
          <span>No. 402-3, 891 Haicang Blvd<br>Haicang District, Xiamen, Fujian, China</span>
          <a href="mailto:sales@metalcorex.com">sales@metalcorex.com</a>
        </address>
      </div>
      <nav class="supplier-footer-nav" aria-label="Footer navigation">
        <div>
          <strong>Capabilities</strong>
          <a href="/services#cnc-machining">CNC machining</a>
          <a href="/services#sheet-metal">Sheet metal fabrication</a>
          <a href="/services#mold-fabrication">Mold &amp; molding</a>
          <a href="/services#assembly">Assembly &amp; packaging</a>
        </div>
        <div>
          <strong>Audio Components</strong>
          <a href="/products#rigging">Rigging hardware</a>
          <a href="/products#enclosures">Speaker grilles</a>
          <a href="/products#interfaces">Amplifier panels</a>
          <a href="/products#molded">Horns &amp; molded parts</a>
        </div>
        <div>
          <strong>Company &amp; Resources</strong>
          <a href="/about#supplier-profile">Company &amp; factory profile</a>
          <a href="/stage-audio-parts">Stage audio expertise</a>
          <a href="/quality">Quality &amp; inspection</a>
          <a href="/design-engineering">Design engineering support</a>
          <a href="/capability-statement">Capability statement</a>
          <a href="/contact#rfq">Contact &amp; RFQ</a>
        </div>
      </nav>
      <div class="supplier-footer-action">
        <p class="eyebrow">Start a Project</p>
        <strong>Have a drawing, sample, or custom component project?</strong>
        <a class="button primary" href="/contact#rfq">Request Manufacturing Review</a>
      </div>
    </div>
    <div class="supplier-footer-bottom">
      <span>&copy; <span id="year"></span> Metalcorex</span>
      <span>Custom components manufactured to customer drawings.</span>
      <span class="site-footer-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span>
    </div>
  `;
  year = document.querySelector("#year");
}

if (mainNav) {
  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  mainNav.querySelectorAll("a[href]").forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "") || "/";
    const isCurrent = linkPath !== "/" && (currentPath === linkPath || currentPath.startsWith(`${linkPath}/`));
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    }
  });
}

if (siteHeader && mainNav) {
  const navToggle = document.createElement("button");
  navToggle.className = "nav-toggle";
  navToggle.type = "button";
  navToggle.setAttribute("aria-label", "Open main navigation");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.innerHTML = "<span></span><span></span><span></span>";
  siteHeader.insertBefore(navToggle, mainNav);

  const closeNavigation = () => {
    siteHeader.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open main navigation");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close main navigation" : "Open main navigation");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });
}

const trackPageView = () => {
  if (document.visibilityState === "prerender") {
    return;
  }

  const path = window.location.pathname === "/products.html" ? "/products" : window.location.pathname;
  const payload = JSON.stringify({ path });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    return;
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
};

trackPageView();

if (year) {
  year.textContent = new Date().getFullYear();
}

if (resourcesMenu) {
  resourcesMenu.innerHTML = `
    <a class="resource-menu-link" href="/blog">Blog</a>
    <a class="resource-menu-link" href="/materials">Materials</a>
    <a class="resource-menu-link" href="/surface-treatment">Surface Treatment</a>
  `;
}

if (resourcesNav && resourcesToggle) {
  resourcesToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = resourcesNav.classList.toggle("is-open");
    resourcesToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!resourcesNav.contains(event.target)) {
      resourcesNav.classList.remove("is-open");
      resourcesToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resourcesNav.classList.remove("is-open");
      resourcesToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.04, rootMargin: "0px 0px 120px 0px" }
);

revealItems.forEach((item) => observer.observe(item));

const homeHeroVideo = document.querySelector(".home-hero-v2-media video");
if (homeHeroVideo) {
  const heroVideoSource = homeHeroVideo.querySelector("source[data-src]");
  const revealPlayingVideo = () => {
    if (homeHeroVideo.currentTime > 0.05 && homeHeroVideo.readyState >= 2) {
      homeHeroVideo.closest(".home-hero-v2-media")?.classList.add("is-video-playing");
    }
  };

  const loadHeroVideo = () => {
    if (!heroVideoSource || heroVideoSource.src) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData) return;

    heroVideoSource.src = heroVideoSource.dataset.src;
    homeHeroVideo.load();
    homeHeroVideo.play().catch(() => {});
  };

  homeHeroVideo.addEventListener("timeupdate", revealPlayingVideo, { passive: true });
  homeHeroVideo.addEventListener("playing", () => {
    window.setTimeout(revealPlayingVideo, 180);
  }, { passive: true });

  const queueHeroVideo = () => window.setTimeout(loadHeroVideo, 1200);
  if (document.readyState === "complete") {
    queueHeroVideo();
  } else {
    window.addEventListener("load", queueHeroVideo, { once: true });
  }
}

holoCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

if (hero) {
  hero.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      return;
    }

    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;

    if (heroPanel) {
      heroPanel.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    if (heroCore) {
      heroCore.style.setProperty("--core-x", `${x * -0.9}px`);
      heroCore.style.setProperty("--core-y", `${y * -0.9}px`);
    }
  });

  hero.addEventListener("pointerleave", () => {
    if (heroPanel) {
      heroPanel.style.transform = "";
    }

    if (heroCore) {
      heroCore.style.removeProperty("--core-x");
      heroCore.style.removeProperty("--core-y");
    }
  });
}

if (form) {
  const drawingsInput = form.querySelector('input[name="drawings"]');
  const fileSummary = form.querySelector("[data-rfq-file-summary]");
  const refreshRfqGuard = () => {
    const startedAt = form.querySelector('input[name="form_started_at"]');
    const nonce = form.querySelector('input[name="form_nonce"]');
    if (startedAt) startedAt.value = String(Date.now());
    if (nonce) {
      nonce.value = window.crypto?.randomUUID?.()
        || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const updateFileSummary = () => {
    if (!drawingsInput || !fileSummary) return;
    const files = Array.from(drawingsInput.files || []);
    if (!files.length) {
      fileSummary.textContent = "No files selected";
      fileSummary.classList.remove("is-warning");
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const visibleNames = files.slice(0, 3).map((file) => file.name).join(", ");
    const remaining = files.length > 3 ? ` + ${files.length - 3} more` : "";
    fileSummary.textContent = `${files.length} file${files.length === 1 ? "" : "s"} · ${formatFileSize(totalSize)} · ${visibleNames}${remaining}`;
    fileSummary.classList.toggle("is-warning", files.length > 8 || totalSize > 50 * 1024 * 1024);
  };

  drawingsInput?.addEventListener("change", updateFileSummary);
  refreshRfqGuard();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = document.querySelector("#rfqStatus");
    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60000);

    if (status) {
      status.textContent = "Submitting RFQ and drawing files...";
      status.className = "form-note is-pending";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        body: data,
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new Error(responseData.error || `Submission failed with status ${response.status}`);
      }

      form.reset();
      refreshRfqGuard();
      updateFileSummary();
      localStorage.removeItem(localRfqKey);

      if (status) {
        status.textContent = "RFQ submitted successfully. We will review your drawings and contact you soon.";
        status.className = "form-note is-success";
      }
    } catch (error) {
      const draft = {
        saved_at: new Date().toISOString(),
        name: data.get("name"),
        company: data.get("company"),
        email: data.get("email"),
        country: data.get("country"),
        part_name: data.get("part_name"),
        process: data.get("manufacturing_process") || data.get("process"),
        material: data.get("material"),
        annual_quantity: data.get("annual_quantity") || data.get("quantity"),
        project_stage: data.get("project_stage"),
        quantity: data.get("annual_quantity") || data.get("quantity"),
        details: data.get("message") || data.get("details"),
      };

      localStorage.setItem(localRfqKey, JSON.stringify(draft));

      if (status) {
        const reason = error.name === "AbortError" ? "The upload timed out." : "The server could not accept the RFQ.";
        status.innerHTML = `${reason} Your form has not been cleared, and your files were not sent. Please retry or email <a href="mailto:sales@metalcorex.com">sales@metalcorex.com</a>.`;
        status.className = "form-note is-error";
      }
    } finally {
      window.clearTimeout(timeout);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

// Re-align deep links after media, fonts, and interactive modules settle.
const alignHashTarget = () => {
  if (!window.location.hash) {
    return;
  }

  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header, .mc-header");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, top));
  root.style.scrollBehavior = previousBehavior;
};

if (window.location.hash) {
  window.requestAnimationFrame(alignHashTarget);
  window.addEventListener("load", () => {
    alignHashTarget();
    window.setTimeout(alignHashTarget, 700);
  }, { once: true });
}

window.addEventListener("hashchange", () => {
  window.requestAnimationFrame(alignHashTarget);
  window.setTimeout(alignHashTarget, 250);
});
