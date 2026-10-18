const refreshRfqs = document.querySelector("#refreshRfqs");
const refreshDashboard = document.querySelector("#refreshDashboard");
const rfqList = document.querySelector("#rfqList");
const trafficChart = document.querySelector("#trafficChart");
const topPages = document.querySelector("#topPages");
const countryList = document.querySelector("#countryList");
const recentRfqs = document.querySelector("#recentRfqs");
const rfqSearch = document.querySelector("#rfqSearch");
const rfqStatusFilter = document.querySelector("#rfqStatusFilter");
const zohoStatus = document.querySelector("#zohoStatus");
const zohoMetrics = document.querySelector("#zohoMetrics");
const zohoDuePos = document.querySelector("#zohoDuePos");
const zohoOpenOrders = document.querySelector("#zohoOpenOrders");
const mediaGrid = document.querySelector("#mediaGrid");
const mediaPageFilter = document.querySelector("#mediaPageFilter");
const refreshMedia = document.querySelector("#refreshMedia");
const mediaGlobalStatus = document.querySelector("#mediaGlobalStatus");

const sessionKey = "metalcorex-admin-session";
const usesCookieAuth = document.body.dataset.authMode === "cookie";
const statuses = ["New", "Quoted", "Followed Up", "Won", "Lost", "Spam"];

const escapeText = (text) =>
  String(text || "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[match]);

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Pending";
const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
const formatMoney = (value, currency = "") => {
  const amount = Number(value || 0);
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  return currency ? `${currency} ${formatted}` : formatted;
};

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const authHeaders = () => {
  const token = sessionStorage.getItem(sessionKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
};

const handleUnauthorized = () => {
  sessionStorage.removeItem(sessionKey);
  if (usesCookieAuth) window.location.href = "/admin-login";
};

const renderMetricCards = (metrics = {}) => {
  setText("#metricViewsToday", formatNumber(metrics.viewsToday));
  setText("#metricViews7", `${formatNumber(metrics.viewsLast7)} in 7 days`);
  setText("#metricVisitors30", formatNumber(metrics.uniqueLast30));
  setText("#metricViews30", `${formatNumber(metrics.viewsLast30)} page views`);
  setText("#metricRfqs", formatNumber(metrics.rfqsTotal));
  setText("#metricRfqs7", `${formatNumber(metrics.rfqsLast7)} in 7 days`);
  setText("#metricFiles", formatNumber(metrics.filesTotal));
  setText("#metricFileSize", `${formatBytes(metrics.filesSize)} stored`);
  setText("#metricSpam", formatNumber(metrics.spamTotal));
  setText("#metricSpam7", `${formatNumber(metrics.spamLast7)} in 7 days`);
};

const renderTrafficChart = (items = []) => {
  if (!trafficChart) return;
  if (!items.length) {
    trafficChart.innerHTML = '<p class="form-note">No traffic recorded yet. Visit the public site to start collecting analytics.</p>';
    return;
  }

  const maxViews = Math.max(...items.map((item) => Number(item.views || 0)), 1);
  trafficChart.innerHTML = items.map((item) => {
    const views = Number(item.views || 0);
    const visitors = Number(item.visitors || 0);
    const height = Math.max(8, Math.round((views / maxViews) * 100));
    const label = String(item.day || "").slice(5);
    return `<div class="traffic-bar" title="${escapeText(item.day)}: ${views} views / ${visitors} visitors"><span style="height:${height}%"></span><small>${escapeText(label)}</small></div>`;
  }).join("");
};

const renderRankList = (element, items, labelKey, valueKey, emptyText) => {
  if (!element) return;
  if (!items.length) {
    element.innerHTML = `<p class="form-note">${escapeText(emptyText)}</p>`;
    return;
  }

  const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);
  element.innerHTML = items.map((item) => {
    const value = Number(item[valueKey] || 0);
    const width = Math.max(4, Math.round((value / maxValue) * 100));
    return `<div class="admin-rank-item"><div><strong>${escapeText(item[labelKey] || "-")}</strong><span>${formatNumber(value)} views</span></div><em><i style="width:${width}%"></i></em></div>`;
  }).join("");
};

const renderRecentRfqs = (items = []) => {
  if (!recentRfqs) return;
  if (!items.length) {
    recentRfqs.innerHTML = '<p class="form-note">No RFQs submitted yet.</p>';
    return;
  }

  recentRfqs.innerHTML = items.map((item) => `
    <div class="admin-rfq-mini">
      <strong>${escapeText(item.company || item.name || "-")}</strong>
      <span>${escapeText(item.part_name || item.process || "-")} · ${escapeText(item.status || "New")}</span>
      <small>${formatDate(item.created_at)}</small>
    </div>
  `).join("");
};

const renderZohoRows = (element, items = [], emptyText) => {
  if (!element) return;
  if (!items.length) {
    element.innerHTML = `<p class="form-note">${escapeText(emptyText)}</p>`;
    return;
  }

  element.innerHTML = items.map((item) => `
    <div class="zoho-row">
      <div>
        <strong>${escapeText(item.number || "-")}</strong>
        <span>${escapeText(item.vendor || item.customer || "-")} · ${escapeText(item.status || "-")}</span>
      </div>
      <small>${escapeText(item.dueDate || item.date || "-")}<br>${escapeText(formatMoney(item.total, item.currency))}</small>
    </div>
  `).join("");
};

const renderZohoSummary = (data = {}) => {
  if (!zohoStatus || !zohoMetrics) return;

  if (!data.configured) {
    zohoStatus.textContent = "Setup needed";
    zohoStatus.classList.add("warning");
    zohoMetrics.innerHTML = `
      <div class="zoho-setup-note">
        <strong>Zoho is not connected yet.</strong>
        <span>Add these Cloudflare secrets: ${escapeText((data.missing || []).join(", "))}</span>
      </div>
    `;
    if (zohoDuePos) zohoDuePos.innerHTML = '<p class="form-note">Connect Zoho to show PO reminders.</p>';
    if (zohoOpenOrders) zohoOpenOrders.innerHTML = '<p class="form-note">Connect Zoho to show open orders.</p>';
    return;
  }

  if (data.error) {
    zohoStatus.textContent = "Zoho error";
    zohoStatus.classList.add("warning");
    if (zohoDuePos) zohoDuePos.innerHTML = `<p class="form-note">${escapeText(data.error)}</p>`;
    if (zohoOpenOrders) zohoOpenOrders.innerHTML = '<p class="form-note">Could not load Zoho data.</p>';
    return;
  }

  const metrics = data.metrics || {};
  zohoStatus.textContent = `Live · ${escapeText(data.range?.startDate || "")} to ${escapeText(data.range?.endDate || "")}`;
  zohoStatus.classList.remove("warning");
  zohoMetrics.innerHTML = `
    <article><span>Paid Revenue</span><strong>${escapeText(formatMoney(metrics.revenue))}</strong><small>${formatNumber(metrics.paidInvoices)} paid invoices</small></article>
    <article><span>Purchase Cost</span><strong>${escapeText(formatMoney(metrics.purchaseCost))}</strong><small>${formatNumber(metrics.issuedPurchaseOrders)} purchase orders</small></article>
    <article><span>Profit Snapshot</span><strong>${escapeText(formatMoney(metrics.profit))}</strong><small>Revenue minus PO cost</small></article>
    <article><span>Open Orders</span><strong>${formatNumber(metrics.openSalesOrders)}</strong><small>${formatNumber(metrics.duePurchaseOrders)} PO due soon</small></article>
  `;
  renderZohoRows(zohoDuePos, data.duePurchaseOrders || [], "No purchase orders due in the next few days.");
  renderZohoRows(zohoOpenOrders, data.openSalesOrders || [], "No open sales orders found in this date range.");
};

const renderRfqs = (items = []) => {
  if (!rfqList) return;
  if (!items.length) {
    rfqList.innerHTML = '<p class="form-note">No matching RFQ submissions.</p>';
    return;
  }

  rfqList.innerHTML = items.map((item) => {
    const files = item.files || [];
    const fileLinks = files.length
      ? files.map((file) => `<button class="file-link" type="button" data-file-url="${escapeText(file.url)}" data-file-name="${escapeText(file.name)}">${escapeText(file.name)} <small>${formatBytes(file.size)}</small></button>`).join("")
      : "<span>No drawings attached</span>";
    const statusOptions = statuses.map((status) => `<option ${status === (item.status || "New") ? "selected" : ""}>${status}</option>`).join("");

    return `
      <article class="rfq-record${item.status === "Spam" ? " is-spam" : ""}" data-rfq-id="${escapeText(item.id)}">
        <div class="rfq-record-head">
          <div>
            <strong>${escapeText(item.part_name || item.company || item.name)}</strong>
            <small>${escapeText(item.company || "-")} · ${escapeText(item.country || "-")}</small>
          </div>
          <span>${formatDate(item.created_at)}</span>
        </div>
        <dl>
          <div><dt>Contact</dt><dd>${escapeText(item.name)} / <a href="mailto:${escapeText(item.email)}">${escapeText(item.email)}</a></dd></div>
          <div><dt>Part Name</dt><dd>${escapeText(item.part_name || "-")}</dd></div>
          <div><dt>Process</dt><dd>${escapeText(item.process || "-")}</dd></div>
          <div><dt>Material</dt><dd>${escapeText(item.material || "-")}</dd></div>
          <div><dt>Annual Qty</dt><dd>${escapeText(item.annual_quantity || item.quantity || "-")}</dd></div>
          <div><dt>Stage</dt><dd>${escapeText(item.project_stage || "-")}</dd></div>
          <div class="wide"><dt>Message</dt><dd>${escapeText(item.details || "-")}</dd></div>
        </dl>
        <div class="rfq-files">${fileLinks}</div>
        <div class="rfq-admin-edit">
          <label>Status<select data-rfq-status>${statusOptions}</select></label>
          <label>Internal Notes<textarea data-rfq-notes rows="3" placeholder="Supplier notes, quote status, follow-up plan...">${escapeText(item.internal_notes || "")}</textarea></label>
          <button class="button primary" type="button" data-rfq-save>Save Update</button>
          <span class="form-note" data-rfq-save-status></span>
        </div>
      </article>
    `;
  }).join("");

  bindRfqActions();
};

const bindRfqActions = () => {
  rfqList.querySelectorAll("[data-file-url]").forEach((button) => {
    button.addEventListener("click", async () => {
      const response = await fetch(button.dataset.fileUrl, { headers: authHeaders() });
      if (response.status === 401) return handleUnauthorized();
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

  rfqList.querySelectorAll("[data-rfq-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const record = button.closest("[data-rfq-id]");
      const status = record.querySelector("[data-rfq-status]").value;
      const internal_notes = record.querySelector("[data-rfq-notes]").value;
      const saveStatus = record.querySelector("[data-rfq-save-status]");

      saveStatus.textContent = "Saving...";
      const response = await fetch(`/api/rfq/${encodeURIComponent(record.dataset.rfqId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status, internal_notes }),
      });

      if (response.status === 401) return handleUnauthorized();
      saveStatus.textContent = response.ok ? "Saved." : "Save failed.";
      if (response.ok) loadDashboard().catch(() => {});
    });
  });
};

const loadRemoteRfqs = async () => {
  const params = new URLSearchParams();
  if (rfqSearch?.value.trim()) params.set("search", rfqSearch.value.trim());
  if (rfqStatusFilter?.value) params.set("status", rfqStatusFilter.value);

  const response = await fetch(`/api/rfq${params.toString() ? `?${params}` : ""}`, { headers: authHeaders() });
  if (response.status === 401) return handleUnauthorized();
  if (!response.ok) throw new Error(`RFQ backend returned ${response.status}`);

  const data = await response.json();
  renderRfqs(data.items || []);
};

const loadDashboard = async () => {
  const response = await fetch("/api/dashboard", { headers: authHeaders() });
  if (response.status === 401) return handleUnauthorized();
  if (!response.ok) throw new Error(`Dashboard backend returned ${response.status}`);

  const data = await response.json();
  renderMetricCards(data.metrics || {});
  renderTrafficChart(data.dailyVisits || []);
  renderRankList(topPages, data.topPages || [], "path", "views", "No page views recorded yet.");
  renderRankList(countryList, data.countries || [], "country", "views", "No country data recorded yet.");
  renderRecentRfqs(data.recentRfqs || []);
};

const loadZohoSummary = async () => {
  if (!zohoStatus) return;

  let response;
  try {
    response = await fetch("/api/zoho/summary", { headers: authHeaders() });
  } catch {
    renderZohoSummary({
      configured: false,
      missing: ["Cloudflare Worker backend"],
      message: "Local preview is not connected to Zoho yet.",
    });
    return;
  }

  if (response.status === 401) return handleUnauthorized();
  const data = await response.json().catch(() => ({}));

  if (!response.ok && !data.error) {
    data.error = `Zoho backend returned ${response.status}`;
  }

  renderZohoSummary(data);
};

let websiteMediaItems = [];

const setMediaGlobalStatus = (message, state = "") => {
  if (!mediaGlobalStatus) return;
  mediaGlobalStatus.textContent = message;
  mediaGlobalStatus.className = `admin-media-notice${state ? ` is-${state}` : ""}`;
};

const renderWebsiteMedia = () => {
  if (!mediaGrid) return;

  const page = mediaPageFilter?.value || "";
  const items = websiteMediaItems.filter((item) => !page || item.page === page);

  if (!items.length) {
    mediaGrid.innerHTML = '<p class="form-note">No image positions match this page.</p>';
    return;
  }

  mediaGrid.innerHTML = items.map((item) => `
    <article class="admin-media-card" data-media-card="${escapeText(item.key)}">
      <div class="admin-media-preview">
        <img src="${escapeText(item.url)}" alt="${escapeText(item.alt)}" loading="lazy">
        <span class="${item.isCustom ? "is-custom" : ""}">${item.isCustom ? "Custom image" : "Default image"}</span>
      </div>
      <div class="admin-media-card-body">
        <div class="admin-media-card-heading">
          <div><small>${escapeText(item.page)} · ${escapeText(item.section)}</small><h3>${escapeText(item.label)}</h3></div>
          <em>${escapeText(item.aspect)}</em>
        </div>
        <label class="admin-media-file">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" data-media-file>
          <span>Choose replacement image</span>
        </label>
        <label class="admin-media-alt">Image description
          <input type="text" maxlength="220" value="${escapeText(item.alt)}" data-media-alt>
        </label>
        <div class="admin-media-actions">
          <button class="button primary" type="button" data-media-upload disabled>Publish Image</button>
          <button class="button ghost" type="button" data-media-reset ${item.isCustom ? "" : "disabled"}>Restore Default</button>
        </div>
        <p class="admin-media-card-status" data-media-status>${item.updatedAt ? `Updated ${escapeText(formatDate(item.updatedAt))}` : "Using the image supplied with the website."}</p>
      </div>
    </article>
  `).join("");

  bindWebsiteMediaActions();
};

const loadWebsiteMedia = async () => {
  if (!mediaGrid) return;

  const response = await fetch("/api/admin/site-media", {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) return handleUnauthorized();
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Image library returned ${response.status}`);

  websiteMediaItems = data.items || [];
  renderWebsiteMedia();
  setMediaGlobalStatus(`${websiteMediaItems.length} managed image positions are ready. Changes appear on the public site after refresh.`, "success");
};

const bindWebsiteMediaActions = () => {
  mediaGrid?.querySelectorAll("[data-media-card]").forEach((card) => {
    const slot = card.dataset.mediaCard;
    const fileInput = card.querySelector("[data-media-file]");
    const preview = card.querySelector(".admin-media-preview img");
    const uploadButton = card.querySelector("[data-media-upload]");
    const resetButton = card.querySelector("[data-media-reset]");
    const altInput = card.querySelector("[data-media-alt]");
    const status = card.querySelector("[data-media-status]");
    const initialUrl = preview.src;
    let previewObjectUrl = "";

    fileInput.addEventListener("change", () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      const file = fileInput.files?.[0];

      if (!file) {
        preview.src = initialUrl;
        uploadButton.disabled = true;
        status.textContent = "No replacement selected.";
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        fileInput.value = "";
        uploadButton.disabled = true;
        status.textContent = "Image is larger than 8 MB.";
        return;
      }

      previewObjectUrl = URL.createObjectURL(file);
      preview.src = previewObjectUrl;
      uploadButton.disabled = false;
      status.textContent = `${file.name} · ${formatBytes(file.size)} · ready to publish`;
    });

    uploadButton.addEventListener("click", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      uploadButton.disabled = true;
      resetButton.disabled = true;
      status.textContent = "Uploading and publishing...";
      const formData = new FormData();
      formData.set("slot", slot);
      formData.set("file", file);
      formData.set("alt", altInput.value.trim());

      try {
        const response = await fetch("/api/admin/site-media", {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        });
        if (response.status === 401) return handleUnauthorized();
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Image upload failed.");

        setMediaGlobalStatus("Image published successfully. The public page will use it after refresh.", "success");
        await loadWebsiteMedia();
      } catch (error) {
        uploadButton.disabled = false;
        resetButton.disabled = false;
        status.textContent = error.message || "Image upload failed.";
        setMediaGlobalStatus(status.textContent, "error");
      } finally {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      }
    });

    resetButton.addEventListener("click", async () => {
      if (!window.confirm("Restore the original website image for this position?")) return;

      uploadButton.disabled = true;
      resetButton.disabled = true;
      status.textContent = "Restoring original image...";

      try {
        const response = await fetch(`/api/admin/site-media?slot=${encodeURIComponent(slot)}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (response.status === 401) return handleUnauthorized();
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not restore the original image.");

        setMediaGlobalStatus("Original website image restored.", "success");
        await loadWebsiteMedia();
      } catch (error) {
        resetButton.disabled = false;
        status.textContent = error.message || "Could not restore the original image.";
        setMediaGlobalStatus(status.textContent, "error");
      }
    });
  });
};

const refreshAll = async () => {
  await Promise.allSettled([loadDashboard(), loadRemoteRfqs(), loadZohoSummary(), loadWebsiteMedia()]);
};

refreshRfqs?.addEventListener("click", async () => {
  rfqList.innerHTML = '<p class="form-note">Loading RFQ submissions...</p>';
  try {
    await loadRemoteRfqs();
  } catch (error) {
    rfqList.innerHTML = `<p class="form-note">Could not load RFQ records. ${escapeText(error.message)}</p>`;
  }
});

refreshDashboard?.addEventListener("click", async () => {
  refreshDashboard.textContent = "Refreshing...";
  try {
    await refreshAll();
  } finally {
    refreshDashboard.textContent = "Refresh";
  }
});

refreshMedia?.addEventListener("click", async () => {
  refreshMedia.disabled = true;
  refreshMedia.textContent = "Refreshing...";
  try {
    await loadWebsiteMedia();
  } catch (error) {
    setMediaGlobalStatus(error.message || "Could not load website images.", "error");
  } finally {
    refreshMedia.disabled = false;
    refreshMedia.textContent = "Refresh Images";
  }
});

mediaPageFilter?.addEventListener("change", renderWebsiteMedia);

rfqSearch?.addEventListener("input", () => {
  clearTimeout(rfqSearch._rfqTimer);
  rfqSearch._rfqTimer = setTimeout(() => loadRemoteRfqs().catch(() => {}), 240);
});

rfqStatusFilter?.addEventListener("change", () => {
  loadRemoteRfqs().catch(() => {});
});

refreshAll().catch((error) => {
  if (rfqList) rfqList.innerHTML = `<p class="form-note">Could not load admin data. ${escapeText(error.message)}</p>`;
});
