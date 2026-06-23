const adminTokenInput = document.querySelector("#adminToken");
const refreshRfqs = document.querySelector("#refreshRfqs");
const rfqList = document.querySelector("#rfqList");

const localRfqKey = "metalcorex-local-rfqs";

const escapeText = (text) =>
  String(text || "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[match]);

const formatDate = (value) => {
  if (!value) {
    return "Pending";
  }

  return new Date(value).toLocaleString();
};

const renderRfqs = (items) => {
  if (!items.length) {
    rfqList.innerHTML = '<p class="form-note">No RFQ submissions yet.</p>';
    return;
  }

  rfqList.innerHTML = items.map((item) => {
    const files = item.files || [];
    const fileLinks = files.length
      ? files.map((file) => {
          if (file.url) {
            return `<button class="file-link" type="button" data-file-url="${escapeText(file.url)}" data-file-name="${escapeText(file.name)}">${escapeText(file.name)}</button>`;
          }

          return `<span>${escapeText(file.name)}</span>`;
        }).join("")
      : "<span>No drawings attached</span>";

    return `
      <article class="rfq-record">
        <div class="rfq-record-head">
          <strong>${escapeText(item.company || item.name)}</strong>
          <span>${formatDate(item.created_at)}</span>
        </div>
        <dl>
          <div><dt>Contact</dt><dd>${escapeText(item.name)} / ${escapeText(item.email)}</dd></div>
          <div><dt>Country</dt><dd>${escapeText(item.country || "-")}</dd></div>
          <div><dt>Process</dt><dd>${escapeText(item.process)}</dd></div>
          <div><dt>Material</dt><dd>${escapeText(item.material || "-")}</dd></div>
          <div><dt>Quantity</dt><dd>${escapeText(item.quantity || "-")}</dd></div>
          <div><dt>Details</dt><dd>${escapeText(item.details)}</dd></div>
        </dl>
        <div class="rfq-files">${fileLinks}</div>
      </article>
    `;
  }).join("");
};

const bindFileDownloads = () => {
  rfqList.querySelectorAll("[data-file-url]").forEach((button) => {
    button.addEventListener("click", async () => {
      const token = adminTokenInput.value.trim();

      if (!token) {
        return;
      }

      const response = await fetch(button.dataset.fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        button.textContent = "Download failed";
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = button.dataset.fileName;
      link.click();
      URL.revokeObjectURL(url);
    });
  });
};

const loadLocalRfqs = () => {
  renderRfqs(JSON.parse(localStorage.getItem(localRfqKey) || "[]").reverse());
  bindFileDownloads();
};

const loadRemoteRfqs = async () => {
  const token = adminTokenInput.value.trim();

  if (!token) {
    loadLocalRfqs();
    return;
  }

  const response = await fetch("/api/rfq", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`RFQ backend returned ${response.status}`);
  }

  const data = await response.json();
  renderRfqs(data.items || []);
  bindFileDownloads();
};

refreshRfqs.addEventListener("click", async () => {
  rfqList.innerHTML = '<p class="form-note">Loading RFQ submissions...</p>';

  try {
    await loadRemoteRfqs();
  } catch (error) {
    rfqList.innerHTML = `<p class="form-note">Could not load remote backend. Showing local preview records instead. ${escapeText(error.message)}</p>`;
    loadLocalRfqs();
  }
});

loadLocalRfqs();
