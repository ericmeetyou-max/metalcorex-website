const tabs = document.querySelectorAll(".category-tab");
const catalogGrid = document.querySelector("#catalogGrid");
const catalogTitle = document.querySelector("#catalogTitle");
const uploadForm = document.querySelector("#uploadForm");
const clearUploads = document.querySelector("#clearUploads");
const storageKey = "metalcorex-local-products";
const zohoProductGrid = document.querySelector("#zohoProductGrid");
const zohoProductSearch = document.querySelector("#zohoProductSearch");
const zohoFilterRow = document.querySelector("#zohoFilterRow");
const zohoResultCount = document.querySelector("#zohoResultCount");
const zohoLoadMore = document.querySelector("#zohoLoadMore");
const zohoTotalCount = document.querySelector("#zohoTotalCount");
const zohoImageCount = document.querySelector("#zohoImageCount");

const titles = {
  all: "Speaker hardware and accessory reference categories",
  "chassis-enclosures": "Chassis and enclosure product photos",
  "cnc-parts": "CNC precision audio hardware product photos",
  "molded-parts": "Molded plastic audio component product photos",
  "fasteners-pins": "Pins, fasteners, and locking hardware product photos",
  "accessory-kits": "Accessory kit and hardware family references",
  "rigging-hardware": "Rigging hardware references",
  clamps: "Clamp and locking hardware references",
  "mounting-brackets": "Mounting bracket references",
  "tubes-stands-casters": "Tubes, stands, caster, and pole hardware references",
  "grilles-mesh": "Speaker grille and mesh references",
  "cases-packaging": "Cases, packaging, and kitting references",
  "application-references": "Installed speaker hardware application references",
};

const labels = {
  "chassis-enclosures": "Chassis & Enclosures",
  "cnc-parts": "CNC Precision Parts",
  "molded-parts": "Molded Parts",
  "fasteners-pins": "Pins & Fasteners",
  "accessory-kits": "Accessory Kits",
  "rigging-hardware": "Rigging Hardware",
  clamps: "Clamps",
  "mounting-brackets": "Mounting Brackets",
  "tubes-stands-casters": "Tubes / Stands / Casters",
  "grilles-mesh": "Grilles & Mesh",
  "cases-packaging": "Cases & Packaging",
  "application-references": "Applications",
};

const validCategories = Object.keys(titles);
const zohoPageSize = 96;
let zohoProducts = [];
let zohoVisibleCount = zohoPageSize;
let zohoActiveCategory = "all";

const getSavedProducts = () => JSON.parse(localStorage.getItem(storageKey) || "[]");

const saveProducts = (products) => {
  localStorage.setItem(storageKey, JSON.stringify(products));
};

const createId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const escapeHTML = (text) =>
  String(text).replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[match]);

const zohoCategoryLabels = {
  grilles: "Grilles",
  brackets: "Brackets & Rigging",
  chassis: "Chassis & Plates",
  horns: "Horns & Waveguides",
  molded: "Molded Parts",
  hardware: "Fasteners & Hardware",
  other: "Custom Parts",
};

const classifyZohoProduct = (product) => {
  const text = [
    product.name,
    product.sku,
    product.part_number,
    product.group_name,
    product.description,
    product.purchase_description,
  ].join(" ").toLowerCase();

  if (/\b(grille|grill|mesh|hatch)\b/.test(text)) return "grilles";
  if (/\b(bracket|rigg|fly|yoke|clamp|cleat|mount|wall|pole|stand|hanger|hook)\b/.test(text)) return "brackets";
  if (/\b(chassis|plate|panel|cover|lid|face|shell|case|housing|heatsink|heat sink)\b/.test(text)) return "chassis";
  if (/\b(horn|waveguide|wave guide|throat|corneta)\b/.test(text)) return "horns";
  if (/\b(mold|mould|injection|plastic|silicone|rubber|abs|nylon|pom|petg|printed|3d printing)\b/.test(text)) return "molded";
  if (/\b(screw|bolt|nut|washer|pin|magnet|fastener|connector|spacer|spring)\b/.test(text)) return "hardware";
  return "other";
};

const normalizeZohoProduct = (product, index) => {
  const category = classifyZohoProduct(product);
  const imageDownloaded = product.image_downloaded === "yes" && product.image_path;
  const imagePath = String(product.image_path || "").replace(/^\/?website\//, "");
  return {
    ...product,
    category,
    label: zohoCategoryLabels[category] || zohoCategoryLabels.other,
    hasImage: Boolean(imageDownloaded),
    imageSrc: imageDownloaded ? `/${imagePath.replace(/^\/?/, "")}` : "",
    searchText: [
      product.name,
      product.sku,
      product.part_number,
      product.group_name,
      product.description,
      product.purchase_description,
      category,
    ].join(" ").toLowerCase(),
    sortIndex: index,
  };
};

const makeZohoCard = (product) => {
  const card = document.createElement("article");
  card.className = `zoho-product-card${product.hasImage ? " has-image" : " no-image"}`;
  const title = product.name || product.sku || product.part_number || "Custom OEM Component";
  const subtitle = product.sku || product.part_number || product.group_name || "Made to drawing";
  const detail = product.description || product.purchase_description || "Custom component reference from Metalcorex production and RFQ records.";
  const mergedCount = Number(product.merged_count || 1);
  const mergedLabel = mergedCount > 1 ? `${mergedCount} variants merged` : (product.hasImage ? "Rendered image" : "Zoho item");
  const imageMarkup = product.hasImage
    ? `<img src="${escapeHTML(product.imageSrc)}" alt="${escapeHTML(title)} rendered product reference" loading="lazy">`
    : `<div class="zoho-image-placeholder"><span>${escapeHTML(product.label)}</span></div>`;

  card.innerHTML = `
    <div class="zoho-product-media">${imageMarkup}</div>
    <div class="zoho-product-body">
      <p class="product-type">${escapeHTML(product.label)}</p>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(detail)}</p>
      <div class="spec-list">
        <span>${escapeHTML(subtitle)}</span>
        <span>${escapeHTML(mergedLabel)}</span>
      </div>
    </div>
  `;
  return card;
};

const getFilteredZohoProducts = () => {
  const query = (zohoProductSearch?.value || "").trim().toLowerCase();
  return zohoProducts.filter((product) => {
    const categoryMatch =
      zohoActiveCategory === "all" ||
      (zohoActiveCategory === "published" && product.hasImage) ||
      product.category === zohoActiveCategory;
    const queryMatch = !query || product.searchText.includes(query);
    return categoryMatch && queryMatch;
  });
};

const renderZohoProducts = () => {
  if (!zohoProductGrid || !zohoResultCount) return;

  const filtered = getFilteredZohoProducts();
  const slice = filtered.slice(0, zohoVisibleCount);
  zohoProductGrid.replaceChildren(...slice.map(makeZohoCard));

  const published = filtered.filter((product) => product.hasImage).length;
  zohoResultCount.textContent = `${filtered.length} unique product references matched, ${published} with published render images.`;

  if (zohoLoadMore) {
    zohoLoadMore.hidden = filtered.length <= slice.length;
    zohoLoadMore.textContent = `Load More (${filtered.length - slice.length})`;
  }
};

const setZohoCategory = (category) => {
  zohoActiveCategory = category || "all";
  zohoVisibleCount = zohoPageSize;
  zohoFilterRow?.querySelectorAll(".zoho-filter").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.zohoCategory === zohoActiveCategory);
  });
  renderZohoProducts();
};

const loadZohoProducts = async () => {
  if (!zohoProductGrid) return;

  try {
    const response = await fetch("/data/zoho_products_merged.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    zohoProducts = data.map(normalizeZohoProduct).sort((a, b) => {
      if (a.hasImage !== b.hasImage) return a.hasImage ? -1 : 1;
      return a.sortIndex - b.sortIndex;
    });

    if (zohoTotalCount) zohoTotalCount.textContent = String(zohoProducts.length);
    if (zohoImageCount) zohoImageCount.textContent = String(zohoProducts.filter((product) => product.hasImage).length);
    renderZohoProducts();
  } catch (error) {
    zohoResultCount.textContent = "Product references are temporarily unavailable.";
    zohoProductGrid.innerHTML = "";
  }
};

const makeUploadedCard = (product) => {
  const card = document.createElement("article");
  card.className = "catalog-card holo-card uploaded-card";
  card.dataset.category = product.category;
  card.dataset.uploaded = "true";
  card.innerHTML = `
    <img src="${product.image}" alt="${escapeHTML(product.title)}">
    <div>
      <p class="product-type">${labels[product.category]}</p>
      <h3>${escapeHTML(product.title)}</h3>
      <p>${escapeHTML(product.description || "Uploaded local product photo preview.")}</p>
      <div class="spec-list">
        <span>Local Preview</span>
        <span>Your Photo</span>
      </div>
    </div>
  `;
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
  return card;
};

const renderUploads = () => {
  if (!catalogGrid) {
    return;
  }

  catalogGrid.querySelectorAll("[data-uploaded='true']").forEach((card) => card.remove());
  getSavedProducts().forEach((product) => catalogGrid.appendChild(makeUploadedCard(product)));
};

const setCategory = (category) => {
  if (!catalogGrid || !catalogTitle) {
    return;
  }

  if (!validCategories.includes(category)) {
    category = "all";
  }

  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.category === category));
  catalogTitle.textContent = titles[category];

  catalogGrid.querySelectorAll(".catalog-card").forEach((card) => {
    const categories = String(card.dataset.category || "").split(/\s+/);
    const visible = category === "all" || categories.includes(category);
    card.hidden = !visible;
  });
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const category = tab.dataset.category;
    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    history.replaceState(null, "", url);
    setCategory(category);
  });
});

if (uploadForm) {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(uploadForm);
    const category = data.get("category");
    const title = data.get("title").trim();
    const description = data.get("description").trim();
    const files = data.getAll("photos").filter((file) => file.size > 0);
    const saved = getSavedProducts();

    for (const file of files) {
      const image = await readFile(file);
      saved.push({
        id: createId(),
        category,
        title,
        description,
        image,
      });
    }

    saveProducts(saved);
    renderUploads();
    setCategory(category);
    uploadForm.reset();
  });
}

if (clearUploads) {
  clearUploads.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderUploads();
    setCategory(new URLSearchParams(window.location.search).get("category") || "all");
  });
}

zohoFilterRow?.addEventListener("click", (event) => {
  const button = event.target.closest(".zoho-filter");
  if (!button) return;
  setZohoCategory(button.dataset.zohoCategory);
});

zohoProductSearch?.addEventListener("input", () => {
  zohoVisibleCount = zohoPageSize;
  renderZohoProducts();
});

zohoLoadMore?.addEventListener("click", () => {
  zohoVisibleCount += zohoPageSize;
  renderZohoProducts();
});

renderUploads();
setCategory(new URLSearchParams(window.location.search).get("category") || "all");
loadZohoProducts();
