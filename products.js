const tabs = document.querySelectorAll(".category-tab");
const catalogGrid = document.querySelector("#catalogGrid");
const catalogTitle = document.querySelector("#catalogTitle");
const uploadForm = document.querySelector("#uploadForm");
const clearUploads = document.querySelector("#clearUploads");
const storageKey = "metalcorex-local-products";

const titles = {
  all: "All Product Examples",
  cnc: "CNC Machining Products",
  injection: "Injection Molding Products",
  "sheet-metal": "Sheet Metal Fabrication Products",
};

const labels = {
  cnc: "CNC Machining",
  injection: "Injection Molding",
  "sheet-metal": "Sheet Metal",
};

const validCategories = Object.keys(titles);

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
    const visible = category === "all" || card.dataset.category === category;
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

renderUploads();
setCategory(new URLSearchParams(window.location.search).get("category") || "all");
