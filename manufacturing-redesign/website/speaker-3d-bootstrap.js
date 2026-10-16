const stage = document.querySelector("[data-speaker-3d]");

if (stage) {
  const interactiveControls = stage.querySelectorAll(
    "[data-speaker3d-toggle], [data-speaker3d-auto]"
  );
  const status = stage.querySelector(".speaker3d-status");
  let modelReady = false;
  let loadPromise;

  const loadInteractiveModel = () => {
    if (!loadPromise) {
      stage.classList.add("is-3d-loading");
      if (status) status.textContent = "Loading interactive assembly...";

      loadPromise = import("./speaker-3d-model.js?v=speaker-3d-9")
        .then(() => {
          modelReady = true;
          stage.classList.remove("is-3d-loading");
          stage.classList.add("is-3d-ready");
        })
        .catch((error) => {
          stage.classList.remove("is-3d-loading");
          if (status) status.textContent = "3D preview unavailable - product gallery remains available below";
          console.error("Unable to start the interactive speaker assembly:", error);
          throw error;
        });
    }

    return loadPromise;
  };

  interactiveControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      if (modelReady) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      control.disabled = true;
      loadInteractiveModel()
        .then(() => {
          control.disabled = false;
          control.click();
        })
        .catch(() => {
          control.disabled = false;
        });
    }, true);
  });

  stage.addEventListener("pointerenter", loadInteractiveModel, { once: true, passive: true });
  stage.addEventListener("touchstart", loadInteractiveModel, { once: true, passive: true });
}
