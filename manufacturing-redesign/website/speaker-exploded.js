(() => {
  const modules = document.querySelectorAll("[data-speaker-exploded]");

  modules.forEach((stage) => {
    const parts = Array.from(stage.querySelectorAll("[data-part]"));
    const title = stage.querySelector("[data-exploded-title]");
    const description = stage.querySelector("[data-exploded-description]");

    const setActivePart = (part) => {
      parts.forEach((item) => item.classList.toggle("is-active", item === part));

      if (title) {
        title.textContent = part.dataset.part || "Manufacturing scope";
      }

      if (description) {
        description.textContent = part.dataset.description || "";
      }
    };

    const resetActivePart = () => {
      parts.forEach((item) => item.classList.remove("is-active"));

      if (title) {
        title.textContent = "Manufacturing scope";
      }

      if (description) {
        description.textContent =
          "Scroll into view to separate the assembly, then hover or tap a part to inspect the manufacturing process.";
      }
    };

    parts.forEach((part) => {
      part.addEventListener("pointerenter", () => setActivePart(part));
      part.addEventListener("focus", () => setActivePart(part));
      part.addEventListener("click", () => setActivePart(part));
    });

    stage.addEventListener("pointerleave", resetActivePart);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stage.classList.add("is-exploded");
          } else if (entry.boundingClientRect.top > 0) {
            stage.classList.remove("is-exploded");
            resetActivePart();
          }
        });
      },
      { threshold: 0.34, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(stage);
  });
})();
