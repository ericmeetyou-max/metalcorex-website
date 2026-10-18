import * as THREE from "./vendor/three.module.min.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const SPEAKER_MODEL_URL = "/assets/models/metalcorex-pa-speaker-exploded-v10.glb";
const CAPABILITY_MODEL_URL = "/assets/models/metalcorex-step-capability-exploded-v2.glb";

const cleanName = (name) => name.replace(/_/g, " ");

const defaultInfo = {
  title: "Stage PA speaker + Metalcorex parts",
  description: "Move over the speaker to reveal real Metalcorex manufacturing parts in an exploded capability view."
};

const capabilityDescriptions = {
  Perforated_Steel_Grille: "Laser-cut or punched sheet, formed and powder coated for durable acoustic protection.",
  Woofer_Cast_Basket: "Die-cast aluminum basket with secondary CNC machining on mounting and locating features.",
  Injection_Molded_High_Frequency_Horn: "Tooling-ready molded horn and waveguide geometry with controlled wall thickness and surface finish.",
  Sheet_Metal_Input_Plate: "Precision-cut and formed rear panel with connector openings, marking, and coating options.",
  Injection_Molded_Handle: "Production molded handle engineered for strength, repeatable fit, and clean cosmetic surfaces.",
  Top_Recessed_Handle: "Recessed carry hardware combining formed metal, molded grip parts, and assembly control.",
  Injection_Molded_Corners: "Impact-resistant molded protection parts with consistent mounting interfaces.",
  Injection_Molded_Pole_Cup: "Load-bearing molded or metal pole socket with controlled fit and mounting pattern.",
  CNC_Adapter_Ring: "CNC-machined adapter with tight concentricity, hole position, and anodized finish options.",
  Steel_Locking_Latch: "Stamped and formed steel locking hardware for repeatable field operation.",
  Speaker_Yoke_Bracket: "Laser-cut, bent, welded, and powder-coated yoke and wall-mount bracket systems.",
  Quick_Release_Pin: "Turned metal pin with cross-hole, retention feature, and corrosion-resistant finish.",
  Anti_Loss_Safety_Cable: "Finished safety tether assembly with swaged ends and traceable hardware selection."
};

const manufacturableNames = new Set([
  "Perforated_Steel_Grille",
  "Woofer_Cast_Basket",
  "Injection_Molded_High_Frequency_Horn",
  "Sheet_Metal_Input_Plate",
  "Injection_Molded_Handle",
  "Top_Recessed_Handle",
  "Injection_Molded_Corners",
  "Injection_Molded_Pole_Cup",
  "CNC_Adapter_Ring",
  "Steel_Locking_Latch",
  "Speaker_Yoke_Bracket",
  "Quick_Release_Pin",
  "Anti_Loss_Safety_Cable"
]);

const createLabel = (part) => {
  const label = document.createElement("button");
  label.className = "speaker3d-label";
  label.type = "button";
  label.textContent = cleanName(part.name);
  label.dataset.part = part.name;
  return label;
};

const setMeshPartRoot = (part, interactives) => {
  part.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.partRoot = part;
    interactives.push(child);

    if (manufacturableNames.has(part.name) || part.userData.metalcorexManufacturable) {
      const cloned = child.material.clone();
      cloned.emissive = new THREE.Color(0x00394d);
      cloned.emissiveIntensity = 0.12;
      child.material = cloned;
    }
  });
};

const fitObject = (object, targetSize = 3.02) => {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  object.position.sub(center);
  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = targetSize / Math.max(maxAxis, 1);
  object.scale.setScalar(scale);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

document.querySelectorAll("[data-speaker-3d]").forEach((stage) => {
  const isProductHero = Boolean(stage.closest(".product-3d-hero"));
  const isCompactProductHero = isProductHero && window.matchMedia("(max-width: 720px)").matches;
  const canvasHost = stage.querySelector(".speaker3d-canvas");
  const labelsHost = stage.querySelector(".speaker3d-labels");
  const titleEl = stage.querySelector("[data-speaker3d-title]");
  const descEl = stage.querySelector("[data-speaker3d-description]");
  const explodeButton = stage.querySelector("[data-speaker3d-toggle]");
  const autoButton = stage.querySelector("[data-speaker3d-auto]");
  const explodeRange = stage.querySelector("[data-speaker3d-range]");
  const statusEl = stage.querySelector(".speaker3d-status");

  if (!canvasHost || !labelsHost) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.12, isCompactProductHero ? 10.1 : isProductHero ? 8.45 : 9.75);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    stage.classList.add("speaker3d-webgl-unavailable");
    canvasHost.innerHTML = '<div class="speaker3d-fallback"><strong>3D preview unavailable</strong><span>Your browser or device has disabled WebGL. Please enable hardware acceleration to view the exploded speaker assembly.</span></div>';
    console.warn("Metalcorex speaker 3D preview could not start:", error);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasHost.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minDistance = 4.6;
  controls.maxDistance = 12;
  controls.target.set(0.18, -0.06, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.62;

  const root = new THREE.Group();
  root.position.set(isCompactProductHero ? 0.12 : isProductHero ? 0.92 : 0.74, -0.3, 0);
  root.rotation.set(-0.04, -0.16, 0);
  scene.add(root);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 5),
    new THREE.MeshStandardMaterial({ color: 0x091d20, roughness: 0.82, metalness: 0.18, transparent: true, opacity: 0.68 })
  );
  floor.position.set(0.4, -2.58, -0.25);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  scene.add(new THREE.AmbientLight(0xd3edf0, 2.35));
  const key = new THREE.DirectionalLight(0xffffff, 4.8);
  key.position.set(3.6, 5.6, 6.4);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.PointLight(0x75f4ff, 7.5, 18);
  rim.position.set(-3.4, 1.8, 4.8);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffb66c, 2.2, 12);
  warm.position.set(3.2, -1.5, 2.6);
  scene.add(warm);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(2, 2);
  const parts = [];
  const interactives = [];
  const speakerMeshes = [];
  const vector = new THREE.Vector3();
  let activePart = null;
  let explodeTarget = 0;
  let explodeProgress = 0;
  let speakerLoaded = false;
  let modelLoaded = false;
  let capabilityLoadPromise = null;
  let manualExplode = false;
  let hoverHoldUntil = 0;
  let lastStatus = "";

  const setStatus = (message) => {
    if (!statusEl || message === lastStatus) return;
    statusEl.textContent = message;
    lastStatus = message;
  };

  const setInfo = (part) => {
    const name = part?.name ? cleanName(part.name) : defaultInfo.title;
    const description = capabilityDescriptions[part?.name] || part?.userData?.description || defaultInfo.description;
    if (titleEl) titleEl.textContent = name;
    if (descEl) descEl.textContent = description;
  };

  const setActive = (part) => {
    activePart = part;
    setInfo(part);
  };

  const clearActive = () => {
    activePart = null;
    setInfo(null);
  };

  const toggleExploded = (force) => {
    const next = typeof force === "boolean" ? force : explodeTarget < 0.5;
    manualExplode = typeof force === "boolean" ? manualExplode : true;
    explodeTarget = next ? 1 : 0;
    stage.classList.toggle("is-exploded", next);
    if (explodeButton) {
      explodeButton.textContent = next ? "Assemble" : "Exploded View";
      explodeButton.setAttribute("aria-pressed", String(next));
    }
  };

  const projectLabels = () => {
    if (!modelLoaded) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const projected = parts.map((part) => {
      const label = part.userData.label;
      if (!label) return null;
      const box = new THREE.Box3().setFromObject(part);
      box.getCenter(vector);
      vector.project(camera);
      return {
        part,
        label,
        x: (vector.x * 0.5 + 0.5) * rect.width,
        y: (-vector.y * 0.5 + 0.5) * rect.height
      };
    }).filter(Boolean).sort((a, b) => a.y - b.y);

    const placed = [];
    projected.forEach((item) => {
      let adjustedY = item.y;
      placed.forEach((previous) => {
        const sameColumn = Math.abs(item.x - previous.x) < 210;
        const tooClose = adjustedY - previous.y < 34;
        if (sameColumn && tooClose) adjustedY = previous.y + 34;
      });
      adjustedY = clamp(adjustedY, 34, rect.height - 34);
      placed.push({ x: item.x, y: adjustedY });
      item.label.style.transform = `translate3d(${item.x}px, ${adjustedY}px, 0)`;
      item.label.style.zIndex = item.part === activePart ? "3" : "2";
      item.label.style.opacity = explodeProgress > 0.34 ? "1" : "0";
      item.label.classList.toggle("is-active", item.part === activePart);
      item.label.classList.toggle("is-metalcorex", !!item.part.userData.metalcorexManufacturable);
    });

  };

  const updatePointer = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    if (speakerLoaded && !modelLoaded) ensureCapabilityModel();
  };

  const resize = () => {
    const rect = canvasHost.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  };

  stage.addEventListener("pointermove", updatePointer);
  stage.addEventListener("pointerleave", () => {
    pointer.set(2, 2);
    hoverHoldUntil = performance.now() + 240;
    clearActive();
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || !speakerLoaded) return;
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.intersectObjects(speakerMeshes, false).length) return;
    manualExplode = true;
    ensureCapabilityModel().then(() => toggleExploded(explodeTarget < 0.5));
  });

  explodeButton?.addEventListener("click", async () => {
    if (!modelLoaded) {
      explodeButton.disabled = true;
      setStatus("Loading exploded component model…");
      try {
        await ensureCapabilityModel();
      } catch {
        return;
      } finally {
        explodeButton.disabled = false;
      }
    }
    if (modelLoaded) toggleExploded();
  });
  autoButton?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    autoButton.setAttribute("aria-pressed", String(controls.autoRotate));
    autoButton.textContent = controls.autoRotate ? "Auto Rotate On" : "Auto Rotate Off";
  });
  explodeRange?.addEventListener("input", async () => {
    if (!modelLoaded) {
      setStatus("Loading exploded component model…");
      try {
        await ensureCapabilityModel();
      } catch {
        return;
      }
    }
    if (!modelLoaded) return;
    manualExplode = true;
    explodeTarget = Number(explodeRange.value) / 100;
    stage.classList.toggle("is-exploded", explodeTarget > 0.01);
    if (explodeButton) {
      explodeButton.textContent = explodeTarget > 0.5 ? "Assemble" : "Exploded View";
      explodeButton.setAttribute("aria-pressed", String(explodeTarget > 0.5));
    }
  });

  const loader = new GLTFLoader();
  const loadModel = async (modelUrl) => {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(modelUrl, { cache: attempt === 1 ? "default" : "reload" });
        if (!response.ok) throw new Error(`GLB request failed with ${response.status}`);
        const buffer = await response.arrayBuffer();
        return await new Promise((resolve, reject) => {
          loader.parse(buffer, "", resolve, reject);
        });
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 650));
      }
    }
    throw lastError;
  };

  const attachCapabilityModel = (capabilityGltf) => {
    if (modelLoaded) return;
    const model = capabilityGltf.scene;
    model.name = "Metalcorex STEP capability overlay";
    fitObject(model, 2.35);
    root.add(model);

    const partGroups = [];
    model.traverse((child) => {
      if (Array.isArray(child.userData.explode)) {
        partGroups.push(child);
      }
    });

    partGroups.forEach((part) => {
      const assembled = part.position.clone();
      const assembledScale = part.scale.clone();
      const explode = part.userData.explode || [0, 0, 0];
      part.userData.assembled = assembled;
      part.userData.assembledScale = assembledScale;
      part.userData.exploded = assembled.clone().add(new THREE.Vector3(...explode).multiplyScalar(0.72));
      part.userData.hover = 0;
      part.userData.metalcorexManufacturable = !!part.userData.metalcorexManufacturable || manufacturableNames.has(part.name);
      setMeshPartRoot(part, interactives);

      part.traverse((child) => {
        if (!child.isMesh) return;
        child.material.transparent = true;
        child.material.opacity = 0;
        child.material.depthWrite = false;
      });

      const label = createLabel(part);
      labelsHost.appendChild(label);
      label.addEventListener("pointerenter", () => setActive(part));
      label.addEventListener("focus", () => setActive(part));
      label.addEventListener("click", () => setActive(part));
      part.userData.label = label;
      parts.push(part);
    });

    modelLoaded = true;
    if (explodeRange) explodeRange.disabled = false;
    setInfo(null);
    setStatus("Hover speaker to reveal parts · Drag to rotate · Scroll to zoom");
    manualExplode = false;
    toggleExploded(false);
  };

  const ensureCapabilityModel = () => {
    if (modelLoaded) return Promise.resolve();
    if (!capabilityLoadPromise) {
      capabilityLoadPromise = loadModel(CAPABILITY_MODEL_URL)
        .then(attachCapabilityModel)
        .catch((error) => {
          capabilityLoadPromise = null;
          console.error("Unable to load Metalcorex exploded component GLB:", error);
          setStatus("Exploded parts could not load · Please retry");
          throw error;
        });
    }
    return capabilityLoadPromise;
  };

  loadModel(SPEAKER_MODEL_URL)
    .then((speakerGltf) => {
      const speakerModel = speakerGltf.scene;
      speakerModel.name = "Metalcorex stage PA speaker GLB";
      fitObject(speakerModel, 3.15);
      speakerModel.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        speakerMeshes.push(child);
      });
      root.add(speakerModel);
      speakerLoaded = true;
      stage.classList.add("is-model-loaded");
      setStatus("Drag to rotate · Select Exploded View to reveal manufactured parts");
    })
    .catch((error) => {
      console.error("Unable to load Metalcorex PA speaker GLB:", error);
      canvasHost.innerHTML = '<div class="speaker3d-fallback"><strong>3D model did not load</strong><span>Please refresh the page or check the GLB asset path.</span></div>';
    });

  const animate = () => {
    explodeProgress += (explodeTarget - explodeProgress) * 0.055;
    if (explodeRange && document.activeElement !== explodeRange) {
      explodeRange.value = String(Math.round(explodeProgress * 100));
    }
    const eased = explodeProgress * explodeProgress * (3 - 2 * explodeProgress);

    if (modelLoaded) {
      raycaster.setFromCamera(pointer, camera);
      const overSpeaker = raycaster.intersectObjects(speakerMeshes, false).length > 0;
      if (overSpeaker) hoverHoldUntil = performance.now() + 520;
      const hoverExpanded = overSpeaker || performance.now() < hoverHoldUntil;
      if (!manualExplode) {
        explodeTarget = hoverExpanded ? 1 : 0;
        stage.classList.toggle("is-exploded", hoverExpanded);
      }
      const hit = raycaster.intersectObjects(interactives, false)[0];
      const hovered = hit?.object?.userData?.partRoot || null;
      if (hovered !== activePart && pointer.x < 1.5) setActive(hovered);

      parts.forEach((part) => {
        part.position.lerpVectors(part.userData.assembled, part.userData.exploded, eased);
        part.userData.hover += ((part === activePart ? 1 : 0) - part.userData.hover) * 0.12;
        const scale = 1 + part.userData.hover * 0.045;
        part.scale.copy(part.userData.assembledScale).multiplyScalar(scale);

        part.traverse((child) => {
          if (!child.isMesh || !child.material || !("emissive" in child.material)) return;
          child.material.opacity = Math.max(0, Math.min(1, eased * 1.5));
          child.material.depthWrite = eased > 0.85;
          const isMfg = part.userData.metalcorexManufacturable;
          const active = part === activePart;
          child.material.emissive.set(active ? 0x17d7e8 : isMfg ? 0x00394d : 0x000000);
          child.material.emissiveIntensity = active ? 0.42 : isMfg ? 0.12 : 0;
        });
      });
    }

    controls.autoRotateSpeed = clamp(0.55 - explodeProgress * 0.28, 0.18, 0.55);
    if (modelLoaded) {
      setStatus(
        explodeProgress > 0.55
          ? "Manufacturing parts revealed · Hover a part for process details"
          : "Hover speaker to reveal parts · Drag to rotate · Scroll to zoom"
      );
    }
    controls.update();
    renderer.render(scene, camera);
    projectLabels();
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  animate();
});
